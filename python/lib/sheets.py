"""Google Sheet as the quote queue. Columns: quote | author | status | source | created_at

status: pending (needs review) -> approved (ready to be carded) -> carded (done)
        or rejected
"""
import json
import os
from datetime import datetime, timezone

import gspread
from google.oauth2.service_account import Credentials

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
HEADER = ["quote", "author", "status", "source", "created_at"]


def _worksheet():
    creds_json = os.environ["GOOGLE_SERVICE_ACCOUNT_JSON"]
    creds = Credentials.from_service_account_info(json.loads(creds_json), scopes=SCOPES)
    sheet_id = os.environ["GOOGLE_SHEET_ID"]
    ws = gspread.authorize(creds).open_by_key(sheet_id).sheet1
    if ws.row_values(1) != HEADER:
        ws.update("A1", [HEADER])
    return ws


def append_quotes(quotes: list[dict]) -> None:
    """quotes: [{"quote": str, "author": str, "source": str}]"""
    ws = _worksheet()
    now = datetime.now(timezone.utc).isoformat()
    rows = [[q["quote"], q.get("author", ""), "pending", q.get("source", ""), now] for q in quotes]
    if rows:
        ws.append_rows(rows, value_input_option="RAW")


def list_quotes(status: str | None = None) -> list[dict]:
    ws = _worksheet()
    records = ws.get_all_records()
    out = []
    for i, r in enumerate(records, start=2):  # row 1 is header
        if status is None or r.get("status") == status:
            out.append({**r, "row": i})
    return out


def set_status(row: int, status: str) -> None:
    _worksheet().update_cell(row, HEADER.index("status") + 1, status)
