import { google } from 'googleapis'
 
const SPREADSHEET_ID = '1AACYuxoX5vwrqiGMnYG0nqKMm5e_kXHxdgSf6eNX62o'
const SHEET_NAME = 'Feedback'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const payload = req.body || {}

    // debug: show which env var is present (no secret printing)
    console.log('ENV: GOOGLE_SERVICE_ACCOUNT_KEY present?', !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
    console.log('ENV: GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 present?', !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64)

    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
      ? Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8')
      : process.env.GOOGLE_SERVICE_ACCOUNT_KEY

    if (!raw) {
      console.error('Missing service account env')
      return res.status(500).json({ error: 'Missing GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 in env' })
    }

    let key
    try {
      key = JSON.parse(raw)
    } catch (parseErr) {
      console.error('Service account JSON parse error', parseErr.message)
      return res.status(500).json({ error: 'Invalid service account JSON', details: parseErr.message })
    }

    // debug: confirm client_email (do not log private_key)
    console.log('Service account email:', key.client_email)

    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    const client = await auth.getClient()
    const sheets = google.sheets({ version: 'v4', auth: client })

    const row = [
      new Date().toISOString(),
      payload.email || '',
      payload.feedback || '',
      payload.attempts ?? '',
      payload.correctAnswers ?? '',
      payload.accuracy ?? '',
      Array.isArray(payload.selectedCategories) ? payload.selectedCategories.join('|') : String(payload.selectedCategories || '')
    ]

    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    })

    console.log('Sheets append response status:', appendRes.status)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('feedback write error', err)
    // include message + stack for local debugging
    return res.status(500).json({ error: err.message, stack: err.stack ? String(err.stack).split('\n').slice(0,5) : undefined })
  }
}