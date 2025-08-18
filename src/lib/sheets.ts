import { google } from "googleapis";

// Decode the base64 string back into JSON
const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64!, "base64").toString("utf8")
);

const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});


const sheets = google.sheets({ version: "v4", auth });

export async function appendLeadRow(values: string[]) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Leads!A:Z",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}
