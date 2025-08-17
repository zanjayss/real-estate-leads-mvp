import { google } from 'googleapis';

export async function appendLeadRow(row: any[]) {
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.SHEET_ID;
  const range = 'Leads!A:J';

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}
