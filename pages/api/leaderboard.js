// /pages/api/leaderboard.js

import { google } from 'googleapis'; 
// ✅ CORRECT IMPORT: Get server-side session
import { getServerSession } from "next-auth"; 
// ✅ NEW IMPORT: Reference your NextAuth config
import { authOptions } from './auth/[...nextauth]'; 

const SPREADSHEET_ID = '1AACYuxoX5vwrqiGMnYG0nqKMm5e_kXHxdgSf6eNX62o';
const SHEET_NAME = 'Scores'; 

const COLUMN_MAPPINGS = {
    TS: 0, EMAIL: 1, NAME: 2, SCORE: 3, CORRECT_ANSWERS: 4, ACCURACY: 5, TOTAL_ATTEMPTS: 6,
};

async function dbFetchLeaderboard(userId) {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
      ? Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8')
      : process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    
    let key;
    try {
        key = JSON.parse(raw);
    } catch (e) {
        console.error('Service account JSON parse error', e.message);
        throw new Error('Invalid service account configuration.');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // 1. Fetch ALL score data
    const range = `${SHEET_NAME}!A2:G`; 
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
    });

    const rows = response.data.values || [];
    const userHighScores = new Map();

    // 2. Process and Filter for High Scores
    for (const row of rows) {
        const email = row[COLUMN_MAPPINGS.EMAIL];
        const score = parseInt(row[COLUMN_MAPPINGS.SCORE], 10) || 0;
        const accuracy = parseFloat(row[COLUMN_MAPPINGS.ACCURACY]) || 0;
        const name = row[COLUMN_MAPPINGS.NAME] || 'Anonymous';
        
        if (!email) continue; 
        
        const currentHighScore = userHighScores.get(email);

        // Keep the score only if it's the highest score for that user (score > existing, or score is equal and accuracy is higher)
        if (!currentHighScore || score > currentHighScore.score || (score === currentHighScore.score && accuracy > currentHighScore.accuracy)) {
            userHighScores.set(email, { 
                email, 
                name, 
                score, 
                accuracy, 
                totalAttempts: parseInt(row[COLUMN_MAPPINGS.TOTAL_ATTEMPTS], 10) || 0 
            });
        }
    }

    // 3. Convert Map to Array and Sort
    const rankedPlayers = Array.from(userHighScores.values())
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.accuracy - a.accuracy;
        })
        .map((player, index) => ({
            ...player,
            rank: index + 1
        }));

    // 4. Find current user's rank
    let currentUserRank = null;
    const totalPlayers = rankedPlayers.length;

    if (userId) {
        const userEntry = rankedPlayers.find(p => p.email === userId);
        
        if (userEntry) {
            currentUserRank = { ...userEntry, name: userEntry.name || 'You', totalPlayers };
            if (currentUserRank.rank > 100) {
                 currentUserRank.rank = '100+';
            }
        }
    }
    
    const topPlayers = rankedPlayers.slice(0, 15);

    return { topPlayers, currentUserRank, totalPlayers };
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 🔑 FIX: Get the session on the server side using the request and authOptions
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.email;

    try {
        const data = await dbFetchLeaderboard(userId);
        
        res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate'); 

        return res.status(200).json(data);
    } catch (err) {
        console.error('Leaderboard fetch error', err);
        return res.status(500).json({ error: 'Failed to fetch leaderboard data.' });
    }
}