import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import Fuse from "fuse.js";
import hsData from "@/app/data/hs_codes.json"; // Or import dynamically if needed

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
	// const { query } = await req.json();

	// const gptResp = await openai.chat.completions.create({
	// 	model: "gpt-4.1-nano",
	// 	messages: [
	// 		{
	// 			role: "system",
	// 			content:
	// 				"Extract up to 15 concise, relevant keywords from vague product descriptions for matching against official tariff descriptions.",
	// 		},
	// 		{
	// 			role: "user",
	// 			content: `Extract keywords from: "${query}"`,
	// 		},
	// 	],
	// });

	// const raw = gptResp.choices[0].message.content || "";
	// const keywords = raw
	// 	.split(/[,|\n]/)
	// 	.map((k) => k.trim().toLowerCase())
	// 	.filter(Boolean);

	const keywords = [
		"automotive tool",
		"1/4 drive",
		"impact extension bar",
		"hand tool",
		"socket drive",
	];

	const fuse = new Fuse(hsData, {
		keys: ["description"],
		threshold: 0.5,
		includeScore: true,
	});

	const results = fuse.search(keywords.join(" ")).slice(0, 5);

	return NextResponse.json({
		keywords,
		matches: results.map((r) => r.item),
	});
}
