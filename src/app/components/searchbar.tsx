import { useState } from "react";

export default function SearchBar() {
	const [query, setQuery] = useState("");
	const [response, setResponse] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		setLoading(true);
		setResponse("");
		const res = await fetch("/api/ask", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query }),
		});
		const data = await res.json();
		setResponse(data.answer);
		setLoading(false);
	};

	return (
		<div className="p-4 max-w-xl mx-auto space-y-4">
			<div className="flex gap-2">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="border p-2 flex-1 rounded"
					placeholder="Ask something..."
				/>
				<button
					onClick={handleSubmit}
					className="bg-blue-600 text-white px-4 py-2 rounded"
					disabled={loading}
				>
					{loading ? "Loading..." : "Submit"}
				</button>
			</div>
			{response && (
				<div className="border p-4 rounded bg-gray-100 whitespace-pre-wrap">
					{response}
				</div>
			)}
		</div>
	);
}
