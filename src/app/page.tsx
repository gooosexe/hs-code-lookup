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
			<h1 className="text-2xl font-bold my-2">Canadian HS Code Lookup</h1>
			<div className="flex gap-2">
				<input
					className="flex-1 border-2 p-2 rounded"
					placeholder="Enter product description"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<button
					className="bg-white text-black px-4 py-2 rounded disabled:opacity-50 active:translate-y-1"
					onClick={submit}
					disabled={loading || !query.trim()}
				>
					{loading ? "Searching…" : "Submit"}
				</button>
			</div>

			<div className="mt-6 space-y-4">
				{results.length > 0
					? results.map((r, i) => (
							<div key={i} className="p-3 rounded shadow-sm">
								<div className="font-bold text-2xl">{r.code}</div>
								<div>{r.description}</div>
							</div>
						))
					: !loading && (
							<div className="text-gray-600 italic">No results found.</div>
						)}
			</div>
		</div>
	);
}
