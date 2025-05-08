# HS Code Matcher

This is a web application for identifying appropriate Harmonized System (HS) tariff codes based on natural language product descriptions. It leverages keyword extraction, fuzzy search, and fallback AI inference to suggest the most relevant matches from a provided HS code dataset.

## Features

- Extracts functional keywords from vague or informal product descriptions using GPT-4o
- Scores and ranks HS codes based on keyword overlap
- Falls back to fuzzy search with Fuse.js when scoring fails
- Uses GPT-4o to infer codes directly if no matches are found
- Caches previous results for faster repeated lookups
- Simple UI with live input and search feedback

## Tech Stack

- **Frontend:** React (Next.js), Tailwind CSS
- **Backend:** Next.js API routes
- **AI Services:** OpenAI GPT-4o
- **Search:** Fuse.js
- **Caching:** In-memory Map (per process)

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/hs-code-matcher.git
   cd hs-code-matcher

	2.	Install dependencies:

npm install


	3.	Add your OpenAI API key:
Create a .env.local file with:

OPENAI_API_KEY=your_api_key_here


	4.	Run the app:

npm run dev

Open http://localhost:3000 in your browser.

Data

The HS codes are loaded from a static JSON file located at app/data/hs_codes.json. This file should contain entries with at least:

[
  {
    "code": "84.71.10",
    "description": "Automatic data processing machines and units thereof..."
  }
]

License

MIT. See LICENSE.

Let me know if you want a version with images, deployment instructions (e.g. for Vercel), or badges.
