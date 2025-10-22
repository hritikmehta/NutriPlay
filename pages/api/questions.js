import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const jsonPath = path.join(process.cwd(), 'public', 'healthy_eating_trivia_extended.json')
  try {
    const file = fs.readFileSync(jsonPath, 'utf8')
    const data = JSON.parse(file)
    // res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
    res.status(200).json(data)
  } catch (err) {
    console.error('Error reading questions file:', err)
    res.status(500).json({ error: 'Could not read questions file.' })
  }
}
