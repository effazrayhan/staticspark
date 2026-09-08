import os

from supabase import Client, create_client

_client: Client | None = None


def client() -> Client:
    global _client
    if _client is None:
        _client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    return _client


def download_source_text(path: str) -> str:
    """Fetches whole-text input previously uploaded by the dashboard's /api/ingest to
    the 'sources' storage bucket (avoids the ~64KB GitHub repository_dispatch payload limit).
    """
    return client().storage.from_("sources").download(path).decode("utf-8")


def upload_card_image(filename: str, png_bytes: bytes) -> str:
    """Uploads to the 'cards' storage bucket, returns the storage path (not a URL --
    the dashboard/post engine build the public URL from this so we can also use it
    to delete the object later)."""
    client().storage.from_("cards").upload(
        filename, png_bytes, {"content-type": "image/png", "upsert": "true"}
    )
    return filename


def public_card_url(path: str) -> str:
    return client().storage.from_("cards").get_public_url(path)


def insert_card(quote: str, author: str, image_path: str) -> dict:
    c = client()
    existing = c.table("cards").select("position").order("position", desc=True).limit(1).execute()
    next_position = (existing.data[0]["position"] + 1) if existing.data else 0
    res = (
        c.table("cards")
        .insert({"quote": quote, "author": author, "image_path": image_path, "position": next_position})
        .execute()
    )
    return res.data[0]


def next_ready_cards(limit: int) -> list[dict]:
    c = client()
    res = (
        c.table("cards")
        .select("*")
        .eq("status", "ready")
        .order("position")
        .limit(limit)
        .execute()
    )
    return res.data


def mark_posted(card_id: int, platforms: list[str]) -> None:
    from datetime import datetime, timezone

    client().table("cards").update(
        {"status": "posted", "posted_platforms": platforms, "posted_at": datetime.now(timezone.utc).isoformat()}
    ).eq("id", card_id).execute()
