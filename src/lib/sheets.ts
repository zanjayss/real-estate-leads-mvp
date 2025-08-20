import { google } from "googleapis";

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function appendLeadRow(row: any[]) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID environment variable");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Leads!A1:J1", // make sure your sheet tab is named "Leads"
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });
}

// NEW: Fetch all leads as objects with column headers
export async function getLeads(): Promise<Array<Record<string, string>>> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;

  const get = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Leads!A1:J10000", // adjust if you expect >10k rows
  });

  const rows = get.data.values || [];
  if (rows.length === 0) return [];

  const [header, ...data] = rows;

  return data.map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h: string, i: number) => {
      obj[h] = r[i] ?? "";
    });
    return obj;
  });
}
