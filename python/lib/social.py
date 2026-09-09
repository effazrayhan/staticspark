"""Posts a card image (by public URL) + caption to Facebook, Instagram and Threads
via the Meta Graph API / Threads API. All three are "create then publish" flows.
"""
import os

import requests

GRAPH = "https://graph.facebook.com/v21.0"
THREADS = "https://graph.threads.net/v1.0"


def _raise_for_status(r: requests.Response) -> None:
    try:
        r.raise_for_status()
    except requests.HTTPError as e:
        raise requests.HTTPError(f"{e} — {r.text}", response=r) from None


def post_facebook(image_url: str, caption: str) -> None:
    page_id = os.environ["FB_PAGE_ID"]
    token = os.environ["FB_PAGE_ACCESS_TOKEN"]
    r = requests.post(
        f"{GRAPH}/{page_id}/photos",
        data={"url": image_url, "caption": caption, "access_token": token},
        timeout=30,
    )
    _raise_for_status(r)


def post_instagram(image_url: str, caption: str) -> None:
    user_id = os.environ["IG_USER_ID"]
    token = os.environ["IG_ACCESS_TOKEN"]
    created = requests.post(
        f"{GRAPH}/{user_id}/media",
        data={"image_url": image_url, "caption": caption, "access_token": token},
        timeout=30,
    )
    _raise_for_status(created)
    creation_id = created.json()["id"]
    published = requests.post(
        f"{GRAPH}/{user_id}/media_publish",
        data={"creation_id": creation_id, "access_token": token},
        timeout=30,
    )
    _raise_for_status(published)


def post_threads(image_url: str, caption: str) -> None:
    user_id = os.environ["THREADS_USER_ID"]
    token = os.environ["THREADS_ACCESS_TOKEN"]
    created = requests.post(
        f"{THREADS}/{user_id}/threads",
        data={
            "media_type": "IMAGE",
            "image_url": image_url,
            "text": caption,
            "access_token": token,
        },
        timeout=30,
    )
    _raise_for_status(created)
    creation_id = created.json()["id"]
    published = requests.post(
        f"{THREADS}/{user_id}/threads_publish",
        data={"creation_id": creation_id, "access_token": token},
        timeout=30,
    )
    _raise_for_status(published)


POSTERS = {"facebook": post_facebook, "instagram": post_instagram, "threads": post_threads}
