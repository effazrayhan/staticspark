import { google } from "googleapis";

export type QuoteRow = {
  row: number;
  quote: string;
  author: string;
  status: string;
  source: string;
  created_at: string;
};

async function sheetsClient() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

const RANGE = "Sheet1!A2:E";

export async function listQuotes(status?: string): Promise<QuoteRow[]> {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: RANGE,
  });
  const rows = res.data.values ?? [];
  return rows
    .map((r, i) => ({
      row: i + 2,
      quote: r[0] ?? "",
      author: r[1] ?? "",
      status: r[2] ?? "",
      source: r[3] ?? "",
      created_at: r[4] ?? "",
    }))
    .filter((r) => r.quote && (!status || r.status === status));
}

export async function setQuoteStatus(row: number, status: string): Promise<void> {
  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `Sheet1!C${row}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}
