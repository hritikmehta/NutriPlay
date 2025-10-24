// /pages/api/score.js

import { google } from 'googleapis'; 
// ✅ CORRECT IMPORT: Get server-side session
import { getServerSession } from "next-auth"; 
// ✅ NEW IMPORT: Reference your NextAuth config
import { authOptions } from './auth/[...nextauth]'; 

const SPREADSHEET_ID = '1AACYuxoX5vwrqiGMnYG0nqKMm5e_kXHxdgSf6eNX62o'; 
const SHEET_NAME = 'Scores'; 

async function dbSaveScore(scorePayload, session) {
    let key;
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
      ? Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8')
      : process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    
    if (!rawKey) {
        console.error('Service account configuration missing.');
        throw new Error('Service account configuration missing.');
    }

    try {
        key = JSON.parse(rawKey);
    } catch (e) {
        console.error('Service account JSON parse error.', e.message);
        throw new Error('Invalid service account configuration: JSON parsing failed.');
    }

    // 2. Authorize Google Sheets API
    const auth = new google.auth.GoogleAuth({
        credentials: key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // 3. Prepare the data row
    const row = [
        new Date().toISOString(), // TS (0)
        session.user.email || '', // EMAIL (1)
        session.user.name || 'Anonymous', // NAME (2)
        scorePayload.score ?? '', // SCORE (3)
        scorePayload.correctAnswers ?? '', // CORRECT_ANSWERS (4)
        scorePayload.accuracy ?? '', // ACCURACY (5)
        scorePayload.totalAttempts ?? '' // TOTAL_ATTEMPTS (6)
    ];

    // 4. Append the row to the Google Sheet
    try {
        const appendRes = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:A`, 
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] },
        });

        return { success: true, status: appendRes.status, updatedRange: appendRes.data.updates.updatedRange };
    } catch (apiErr) {
        console.error('Google Sheets API Append Error:', apiErr.message);
        throw new Error('Failed to write score to Google Sheet. Check API key permissions and Sheet ID.');
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 🔑 FIX: Get the session on the server side using the request and authOptions
    const session = await getServerSession(req, res, authOptions);

    // Authentication check
    if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ error: 'Authentication required for score submission.' });
    }

    try {
        const payload = req.body || {};
        
        if (typeof payload.score !== 'number') {
            return res.status(400).json({ error: 'Invalid score data received.' });
        }
        
        const result = await dbSaveScore(payload, session);

        return res.status(200).json({ ok: true, result });
    } catch (err) {
        console.error('Score submission fatal error:', err.message);
        return res.status(500).json({ error: 'Failed to process score update.' });
    }
}