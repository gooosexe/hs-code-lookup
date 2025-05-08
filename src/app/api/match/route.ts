import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import Fuse from "fuse.js";
import hsData from "@/app/data/hs_codes.json"; // Or import dynamically if needed

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

function normalize(s: string) {
	return s
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export async function POST(req: NextRequest) {
	const { query } = await req.json();

	const gptResp = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{
				role: "system",
				content:
					"From the product description, extract the key functionalities and uses of the product. For example, if the product is a tool holder, describe what tools it holds and where it would be used. Get 3 to 5 relevant phrases for matching against official tariff descriptions. Only provide the words, do not have numbering before the words. Try not to use single words. Keep it less than 4 words.",
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

	// const keywords = [
	// 	"magnetic tool holder",
	// 	"organizer for tools",
	// 	"metal object mounting",
	// 	"wall-mounted storage rail",
	// 	"tool storage solution",
	// 	"magnetic surface for fastening",
	// 	"hanging bar for tools",
	// 	"magnetic rack for garage",
	// 	"tool organizer for workspace",
	// 	"storage for metal items",
	// ];

	// Simple keyword scoring
	console.log("Scoring keywords");
	const scored = hsData.map((entry) => {
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

	// Fallback with Fuse.js
	console.log("falling back to fuzzy search");
	if (matches.length === 0) {
		const fuse = new Fuse(hsData, {
			keys: ["description"],
			threshold: 0.4,
			includeScore: true,
		});

		const fuseResults = fuse.search(keywords.join(" ")).slice(0, 5);
		matches = fuseResults.map((r) => ({
			...r.item,
			score: r.score ?? 0, // Ensure the score is included even when using Fuse.js
		}));
	}

	console.log("falling back onto gpt");
	const finalquery = keywords.join(", ");
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
					content: `Product description: "${finalquery}"`,
				},
			],
		});

		console.log(fallbackResp);
		console.log(finalquery);

		const hsCode = fallbackResp.choices[0].message.content?.trim();
		console.log(hsCode);

		if (hsCode) {
			const filtered = hsData.filter((entry) => entry.code.includes(hsCode));
			if (filtered.length > 0) {
				matches = filtered.map((entry) => ({ ...entry, score: 1.0 }));
			}
		}
	}

	return NextResponse.json({
		keywords,
		matches,
	});
}
