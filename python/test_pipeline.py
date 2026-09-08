"""Minimal self-check for the pure helper logic (no network/credentials needed)."""
from post_engine import caption_for
from quote_maker import chunks


def test_chunks():
    assert chunks("abcdef", 2) == ["ab", "cd", "ef"]
    assert chunks("abc", 10) == ["abc"]
    assert chunks("", 10) == []


def test_caption_with_author():
    cap = caption_for({"quote": "Be bold.", "author": "Anon"})
    assert cap.startswith("Be bold. — Anon")
    assert "#staticspark" in cap


def test_caption_without_author():
    cap = caption_for({"quote": "Be bold.", "author": ""})
    assert cap.startswith("Be bold.\n")


if __name__ == "__main__":
    test_chunks()
    test_caption_with_author()
    test_caption_without_author()
    print("ok")
