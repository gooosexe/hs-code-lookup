"use client";

import { useState } from "react";

export default function HSMatcher() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const submit = async () => {
		setLoading(true);
		const res = await fetch("/api/match", {
			method: "POST",
			body: JSON.stringify({ query }),
			headers: { "Content-Type": "application/json" },
		});
		const data = await res.json();
		console.log(data);
		setResults(data.matches);
		setLoading(false);
	};

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<div className="flex gap-2">
				<input
					className="flex-1 border p-2 rounded"
					placeholder="Enter product description"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<button
					className="bg-blue-600 text-white px-4 py-2 rounded"
					onClick={submit}
					disabled={loading}
				>
					{loading ? "Searching…" : "Submit"}
				</button>
			</div>
			<div className="mt-6 space-y-4">
				{results.map((r, i) => (
					<div key={i} className="border p-3 rounded shadow-sm">
						<div className="font-bold text-2xl">{r.code}</div>
						<div>{r.description}</div>
					</div>
				))}
			</div>
		</div>
	);
}
