"""Card Maker Engine.

Runs on a schedule (~3/hr). Pulls the next batch of approved quotes from the
Google Sheet queue, renders each into card.html via a headless browser screenshot,
uploads the PNG to Supabase storage, and inserts a row in the 'cards' table for the
dashboard's card gallery / post engine to pick up.
"""
import time
from datetime import date
from pathlib import Path

from playwright.sync_api import sync_playwright

from lib import sheets, supa

BATCH_SIZE = 3
TEMPLATE = Path(__file__).parent.parent / "card.html"


def render_card(page, quote: str, author: str) -> bytes:
    page.goto(TEMPLATE.as_uri())
    page.eval_on_selector("#quote-text", "(el, q) => el.textContent = q", f"“{quote}”")
    if author:
        page.eval_on_selector("#quote-author", "(el, a) => el.textContent = a", author)
    else:
        page.eval_on_selector("#quote-author", "el => el.style.display = 'none'")
    page.eval_on_selector(
        "#quote-date", "(el, d) => el.textContent = d", date.today().strftime("%B %d, %Y")
    )
    return page.locator(".instagram-card").screenshot()


def main() -> None:
    pending = sheets.list_quotes(status="approved")[:BATCH_SIZE]
    if not pending:
        print("No approved quotes to card.")
        return

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 540, "height": 540})

        for q in pending:
            png = render_card(page, q["quote"], q.get("author", ""))
            filename = f"card-{q['row']}-{int(time.time())}.png"
            public_url = supa.upload_card_image(filename, png)
            supa.insert_card(q["quote"], q.get("author", ""), public_url)
            sheets.set_status(q["row"], "carded")
            print(f"Carded row {q['row']} -> {filename}")

        browser.close()


if __name__ == "__main__":
    main()
