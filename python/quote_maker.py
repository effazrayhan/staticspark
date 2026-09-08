"""Quote Maker Engine.

Triggered by the dashboard's /api/ingest endpoint via a GitHub repository_dispatch
(event_type="ingest-text", client_payload={"source_path": "<path in the 'sources' bucket>"}).
Pulls the whole text from Supabase storage, extracts as many quotable lines as it can
find (chunking the text so we're not limited by one LLM call), and appends them to the
Google Sheet queue for human review.
"""
import json
import os
import sys

from groq import Groq

from lib import sheets, supa

MODEL = "llama-3.3-70b-versatile"
CHUNK_CHARS = 6000

PROMPT = """Extract every standalone, quotable, inspirational or memorable sentence from
the text below. For each, include the author if the text makes it identifiable, otherwise
use an empty string. Respond ONLY with JSON: {{"quotes": [{{"quote": "...", "author": "..."}}]}}

TEXT:
{chunk}"""


def chunks(text: str, size: int) -> list[str]:
    return [text[i : i + size] for i in range(0, len(text), size)]


def extract_quotes(client: Groq, chunk: str) -> list[dict]:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": PROMPT.format(chunk=chunk)}],
        response_format={"type": "json_object"},
    )
    data = json.loads(resp.choices[0].message.content)
    return data.get("quotes", [])


def main() -> None:
    source_path = os.environ["SOURCE_PATH"]
    text = supa.download_source_text(source_path)

    client = Groq(api_key=os.environ["GROQ_API_KEY"])
    found: list[dict] = []
    for chunk in chunks(text, CHUNK_CHARS):
        found.extend(extract_quotes(client, chunk))

    if not found:
        print("No quotes found.", file=sys.stderr)
        return

    for q in found:
        q["source"] = source_path

    sheets.append_quotes(found)
    print(f"Appended {len(found)} quotes from {source_path}.")


if __name__ == "__main__":
    main()
