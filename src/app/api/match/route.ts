import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import Fuse from "fuse.js";
import hsData from "@/app/data/hs_codes.json"; // Static import, OK for server-side
import { z } from "zod";
import path from "path";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const cachePath = path.resolve(process.cwd(), "src/app/data/cache.json");

function loadCache(): Record<string, any> {
	try {
		return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
	} catch {
		return {};
	}
}

function saveCache(cache: Record<string, any>) {
	fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

function normalize(s: string) {
	return s
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

// Define expected data shape to avoid TS issues
type HSCodeEntry = {
	code: string;
	description: string;
	score: number; // added field for scoring
};

export async function POST(req: NextRequest) {
	const body = await req.json();
	const query = z.string().min(1).parse(body.query);
	const key = normalize(query);
	const cache = loadCache();

	if (cache[key]) {
		console.log("Exists in cache, retrieving");
		return NextResponse.json({ fromCache: true, ...cache[key] });
	}

	const gptResp = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{
				role: "system",
				content:
					"From the product description, extract the key functionalities and uses of the product. For example, if the product is a tool holder, describe what tools it holds and where it would be used. Get up to 3 relevant phrases for matching against official tariff descriptions. Only provide the words, do not have numbering before the words. Try not to use single words. Keep it less than 4 words.",
			},
			{
				role: "user",
				content: `Extract keywords from: "${query}"`,
			},
		],
	});

	const raw = gptResp.choices[0].message.content || "";
	const keywords = raw
		.split(/[,|\n]/)
		.map((k) => k.trim().toLowerCase())
		.filter(Boolean);

	// Keyword scoring
	console.log("Direct search");
	const scored: HSCodeEntry[] = hsData.map((entry) => {
		const haystack = normalize(entry.description);
		let score = 0;
		for (const kw of keywords) {
			const needle = normalize(kw);
			if (haystack.includes(needle)) {
				score += 1.0;
			} else if (haystack.split(" ").some((word) => word.includes(needle))) {
				score += 0.5;
			}
		}
		return { ...entry, score };
	});

	let matches = scored
		.filter((e) => e.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 5);

	// Fuzzy fallback
	console.log("No results, falling back to fuzzy search");
	if (matches.length === 0) {
		const fuse = new Fuse(hsData, {
			keys: ["description"],
			threshold: 0.4,
			includeScore: true,
		});

		const fuseResults = fuse.search(keywords.join(" ")).slice(0, 5);
		matches = fuseResults.map((r) => ({
			...r.item,
			score: 0.5 * (1 - (r.score ?? 1)), // Flip score so higher = better
		}));
	}

	// Final LLM fallback
	console.log("No results, falling back to LLM");
	if (matches.length === 0) {
		const fallbackResp = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content:
						"You are an expert in Canadian trade classifications. Given the following keywords, infer the top 3 most appropriate HS codes. Respond with only the HS code chapter, heading, and subheading in the form XX.XX.XX. Do not make up codes.",
				},
				{
					role: "user",
					content: `Product description: "${keywords.join(", ")}"`,
				},
			],
		});

		const hsCodeLine = fallbackResp.choices[0].message.content?.trim() ?? "";

		// Regex match all patterns like 85.36.90
		const extractedCodes = Array.from(
			hsCodeLine.matchAll(/\d{2}\.\d{2}\.\d{2}/g),
		).map((m) => m[0]);

		if (extractedCodes.length > 0) {
			const fallbackMatches = hsData
				.filter((entry) =>
					extractedCodes.some((code) => entry.code.includes(code)),
				)
				.map((entry) => ({ ...entry, score: 0.9 }));

			if (fallbackMatches.length > 0) matches = fallbackMatches;
		}
	}

	const result = { keywords, matches };
	cache[key] = result;
	saveCache(cache);

	return NextResponse.json(result);
}
