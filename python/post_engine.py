"""Post Engine.

Runs on a schedule (~3/hr). Pulls the next batch of ready cards (in dashboard
drag-drop order) from Supabase and posts each to Facebook, Instagram and Threads.
"""
from lib import social, supa

BATCH_SIZE = 3


CAPTION = """A quiet spark to light your day. ⚡️

Save this post to revisit when you need a reminder, and share it with someone who might need to hear it today.

—
💡 Follow @static_spark_ for daily reflections, quiet wisdom, and mindful inspiration.

#staticspark #staticsparkdaily #staticsparkquotes #mindfulness #dailyinspiration #wordsofwisdom"""


def caption_for(card: dict) -> str:
    quote = card["quote"]
    author = card.get("author") or ""
    base = f"{quote}" + (f" — {author}" if author else "")
    return f"{base}\n\n{CAPTION}"


def main() -> None:
    cards = supa.next_ready_cards(BATCH_SIZE)
    if not cards:
        print("No ready cards to post.")
        return

    for card in cards:
        caption = caption_for(card)
        image_url = supa.public_card_url(card["image_path"])
        posted = []
        for platform, poster in social.POSTERS.items():
            try:
                poster(image_url, caption)
                posted.append(platform)
            except Exception as e:
                print(f"Failed to post card {card['id']} to {platform}: {e}")
        if posted:
            supa.mark_posted(card["id"], posted)
        print(f"Card {card['id']} posted to: {posted}")


if __name__ == "__main__":
    main()
