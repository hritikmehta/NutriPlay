// Healthy Eating Trivia — NutriPlay (Next.js + Tailwind)  
// ---------------------------------------------------------------
// This codebase is structured for easy deployment on Vercel (recommended).
// The repository contains:
//  - package.json
//  - tailwind.config.js
//  - postcss.config.js
//  - next.config.js
//  - public/healthy_eating_trivia_extended.json  (your JSON file)
//  - pages/_app.js
//  - pages/index.js
//  - pages/api/questions.js  (serves the JSON)
//  - styles/globals.css
//  - README with deployment instructions
//
// Save these files into a Git repo and push to GitHub. Then import the repo into Vercel.

/* ==================================================
   package.json
   ================================================== */
{
  "name": "nutriplay",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "10.4.14",
    "postcss": "8.4.24",
    "tailwindcss": "3.4.7"
  }
}

/* ==================================================
   tailwind.config.js
   ================================================== */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./app/**/*.{js,jsx}", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        orangePrimary: '#FF7A00',
        softGray: '#F6F6F7'
      },
      fontFamily: {
        sans: ['Poppins', 'Nunito', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}

/* ==================================================
   postcss.config.js
   ================================================== */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}

/* ==================================================
   next.config.js
   (default — provided for clarity)
   ================================================== */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}
module.exports = nextConfig

/* ==================================================
   public/healthy_eating_trivia_extended.json
   (Place your full JSON file here; the filename must match.)
   ================================================== */
// (Place the JSON file exported earlier named exactly: healthy_eating_trivia_extended.json)

/* ==================================================
   pages/_app.js
   ================================================== */
import '../styles/globals.css'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>NutriPlay — Learn to Eat Smart</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

/* ==================================================
   pages/api/questions.js
   Serves the JSON file to the frontend at /api/questions
   ================================================== */
import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const jsonPath = path.join(process.cwd(), 'public', 'healthy_eating_trivia_extended.json')
  try {
    const file = fs.readFileSync(jsonPath, 'utf8')
    const data = JSON.parse(file)
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Could not read questions file.' })
  }
}

/* ==================================================
   pages/index.js
   The full frontend UI for NutriPlay
   ================================================== */
import React, { useEffect, useState, useRef } from 'react'

const ORANGE = 'orangePrimary'

function CarrotIcon({ filled }) {
  return (
    <div className={`w-8 h-8 flex items-center justify-center ${filled ? 'opacity-100' : 'opacity-30'}`}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M12 2c.6 0 1 .4 1 1v6h6c.6 0 1 .4 1 1s-.4 1-1 1h-6v6c0 .6-.4 1-1 1s-1-.4-1-1v-6H5c-.6 0-1-.4-1-1s.4-1 1-1h6V3c0-.6.4-1 1-1z" />
      </svg>
    </div>
  )
}

export default function Home() {
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | null
  const [lives, setLives] = useState(5)
  const [streak, setStreak] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const optionRef = useRef({})

  useEffect(() => {
    fetch('/api/questions')
      .then(r => r.json())
      .then(data => setQuestions(data.questions || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setSelected(null)
    setFeedback(null)
    setShowInfo(false)
  }, [index])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-softGray">Loading...</div>
  if (!questions.length) return <div className="min-h-screen flex items-center justify-center">No questions found.</div>

  const q = questions[index]

  const onAnswer = (i) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === q.correct
    setFeedback(correct ? 'correct' : 'wrong')

    if (correct) {
      setStreak(s => {
        const ns = s + 1
        if (ns >= 5) {
          setLives(l => Math.min(5, l + 1))
          return 0
        }
        return ns
      })
    } else {
      setStreak(0)
      setLives(l => Math.max(0, l - 1))
    }

    // animate: add classes
    const el = optionRef.current[i]
    if (el) {
      el.classList.add('answered')
      el.classList.add(correct ? 'move-up' : 'move-down')
      setTimeout(() => {
        el.classList.remove('move-up')
        el.classList.remove('move-down')
      }, 700)
    }

    // highlight correct option after short delay
    setTimeout(() => setShowInfo(true), 700)
  }

  const onNext = () =&gt; {
    setIndex((idx) => (idx + 1) % questions.length)
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center p-4">
      {/* Header / Lives */}
      <header className="w-full max-w-md mt-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NutriPlay</h1>
          <p className="text-sm text-gray-500">Learn to Eat Smart — One Bite at a Time!</p>
        </div>
        <div className="flex items-center space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-8 h-8">
              <CarrotIcon filled={i < lives} />
            </div>
          ))}
        </div>
      </header>

      {/* Question Card */}
      <main className="flex-1 w-full max-w-md flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl shadow-lg p-6">
          <div className="text-sm text-gray-600 mb-4">Category: <strong>{q.category}</strong> • Difficulty: {q.difficulty}</div>
          <div className="text-lg font-semibold mb-4">{q.question}</div>

          <div className="grid gap-3">
            {q.options.map((opt, i) => {
              const isSelected = selected === i
              const isCorrect = i === q.correct
              const classNames = [
                'px-4 py-3 rounded-lg border transition-transform duration-200 ease-out',
                isSelected && feedback === 'correct' && 'border-green-500',
                isSelected && feedback === 'wrong' && 'border-red-500',
                showInfo && isCorrect && 'bg-green-50 border-green-400'
              ].filter(Boolean).join(' ')

              return (
                <button
                  key={i}
                  ref={el =&gt; optionRef.current[i] = el}
                  onClick={() =&gt; onAnswer(i)}
                  className={classNames}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {showInfo && (
            <div className="mt-4 border-t pt-3 text-sm text-gray-700">
              <div><strong>Explanation:</strong> {q.explanation}</div>
              <div className="mt-2"><strong>Fun Fact:</strong> {q.funFact}</div>
              <div className="mt-2 text-xs text-gray-500">Source: {q.source}</div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <div className="text-sm text-gray-500">Streak: <strong>{streak}</strong></div>
            <div>
              <button
                onClick={onNext}
                className="bg-orangePrimary text-white px-4 py-2 rounded-lg shadow"
              >Next</button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-md text-center text-xs text-gray-400 pb-6">Made with ❤️ for smarter eating</footer>

      <style jsx>{`\n        .answered { animation: shake 0.45s; }\n        @keyframes shake {\n          10%, 90% { transform: translateX(-1px); }\n          20%, 80% { transform: translateX(2px); }\n          30%, 50%, 70% { transform: translateX(-4px); }\n          40%, 60% { transform: translateX(4px); }\n        }\n        .move-up { transform: translateY(-12px); transition: transform 0.5s ease-out; }\n        .move-down { transform: translateY(12px); transition: transform 0.5s ease-out; }\n      `}</style>
    </div>
  )
}

/* ==================================================
   styles/globals.css
   Basic Tailwind import + small overrides
   ================================================== */
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #__next {
  height: 100%;
}

body {
  background-color: #FFFFFF;
  font-family: 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

/* custom color mapping for tailwind (optional) */
:root {
  --orange-primary: #FF7A00;
}

/* ==================================================
   README / Deployment Instructions
   ================================================== */
/*
1) Add all files to a git repository and push to GitHub.
2) Go to https://vercel.com, sign in, and choose "New Project" > import your GitHub repo.
3) Vercel auto-detects Next.js apps. Click Deploy.
4) The API route /api/questions will serve your JSON at runtime.

Local testing:
- npm install
- npm run dev
- Open http://localhost:3000

Updating JSON later:
- Edit public/healthy_eating_trivia_extended.json in the repo, commit & push. Vercel will auto-deploy.

Notes:
- If the JSON is too large, consider moving it to a cloud store (S3 or Vercel KV) and changing the API route to fetch from there.
- You can customize colors in tailwind.config.js and styles/globals.css. The primary orange is #FF7A00.
*/
