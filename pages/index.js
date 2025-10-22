import React, { useEffect, useState, useRef } from 'react'

const ORANGE = 'orangePrimary'

// Game states
const GAME_STATES = {
  WELCOME: 'welcome',
  HOW_TO_PLAY: 'howToPlay', 
  CATEGORY_SELECTION: 'categorySelection',
  LOADING: 'loading',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver'
}

// Available categories
const CATEGORIES = [
  { id: 'random', name: 'Random', description: 'Mix of all categories' },
  { id: 'myths', name: 'Myths', description: 'Nutrition myths and facts' },
  { id: 'vitamins', name: 'Vitamins', description: 'Vitamin knowledge' },
  { id: 'hydration', name: 'Hydration', description: 'Water and hydration' },
  { id: 'protein', name: 'Protein', description: 'Protein and muscle building' },
  { id: 'carbohydrates', name: 'Carbohydrates', description: 'Carbs and energy' },
  { id: 'cooking', name: 'Cooking', description: 'Cooking methods and nutrition' },
  { id: 'healthy-habits', name: 'Healthy Habits', description: 'Daily health practices' },
  { id: 'food-swaps', name: 'Food Swaps', description: 'Healthy food alternatives' },
  { id: 'fats', name: 'Fats', description: 'Healthy and unhealthy fats' },
  { id: 'calories', name: 'Calories', description: 'Calorie knowledge' }
]

export default function Home() {
  const [allQuestions, setAllQuestions] = useState([])
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [lives, setLives] = useState(5)
  const [streak, setStreak] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState([])
  const [showInfo, setShowInfo] = useState(false)
  const [gameState, setGameState] = useState(GAME_STATES.WELCOME)
  const [selectedCategories, setSelectedCategories] = useState(['random'])
  const optionRef = useRef({})

  // feedback (optional) for Game Over
  const [email, setEmail] = useState('')
  const [userFeedback, setUserFeedback] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  useEffect(() => {
    fetch('/api/questions')
      .then(r => r.json())
      .then(data => {
        const allQ = data.questions || []
        setAllQuestions(allQ)
        setQuestions(allQ)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const filterQuestionsByCategories = (categories) => {
    if (categories.includes('random')) {
      return shuffleArray(allQuestions)
    }
    return shuffleArray(allQuestions.filter(q => categories.includes(q.category)))
  }

  useEffect(() => {
    setSelected(null)
    setFeedback(null)
    setShowInfo(false)
  }, [index])

  useEffect(() => {
    if (lives === 0 && gameState === GAME_STATES.PLAYING) {
      setGameState(GAME_STATES.GAME_OVER)
    }
  }, [lives, gameState])

  const startGame = () => {
    setGameState(GAME_STATES.LOADING)
    setTimeout(() => {
      setGameState(GAME_STATES.PLAYING)
    }, 2000)
  }

  const startGameWithCategories = (categories) => {
    setSelectedCategories(categories)
    const filteredQuestions = filterQuestionsByCategories(categories)
    setQuestions(filteredQuestions)
    setIndex(0)
    setGameState(GAME_STATES.LOADING)
    setTimeout(() => {
      setGameState(GAME_STATES.PLAYING)
    }, 2000)
  }

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (categoryId === 'random') {
        return ['random']
      } else {
        let newSelection = prev.filter(c => c !== 'random')
        if (newSelection.includes(categoryId)) {
          newSelection = newSelection.filter(c => c !== categoryId)
        } else {
          newSelection.push(categoryId)
        }
        return newSelection.length === 0 ? ['random'] : newSelection
      }
    })
  }

  const resetGame = () => {
    setGameState(GAME_STATES.WELCOME)
    setLives(5)
    setStreak(0)
    setAttempts(0)
    setCorrectAnswers(0)
    setUsedQuestions([])
    setIndex(0)
    setSelectedCategories(['random'])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-softGray">
        <div className="text-center">
          <div className="text-4xl mb-4">🥕</div>
          <div className="text-xl font-semibold text-gray-700">Loading NutriPlay...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing your nutrition journey!</div>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-softGray">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl font-semibold text-gray-700">No questions found</div>
          <div className="text-sm text-gray-500 mt-2">Please check your data file</div>
        </div>
      </div>
    )
  }

  // Welcome Screen
  if (gameState === GAME_STATES.WELCOME) {
    return (
      <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">🐰</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NutriPlay</h1>
          <p className="text-lg text-gray-600 mb-8">Learn to Eat Smart — One Bite at a Time 🥕</p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Ready to test your nutrition knowledge and build healthy habits?
          </p>
          <button
            onClick={() => setGameState(GAME_STATES.HOW_TO_PLAY)}
            className="bg-orangePrimary text-white px-8 py-3 rounded-lg font-semibold btn-primary text-lg"
          >
            ➡️ Let's Begin!
          </button>
        </div>
      </div>
    )
  }

  // How to Play Screen
  if (gameState === GAME_STATES.HOW_TO_PLAY) {
    return (
      <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">How to Play 🎯</h1>
          <p className="text-gray-600 mb-6">Simple rules, smart rewards!</p>
          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">1️⃣</span>
              <p className="text-gray-700">You start with 5 carrots — your lives.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">2️⃣</span>
              <p className="text-gray-700">Every wrong answer costs you 1 carrot.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">3️⃣</span>
              <p className="text-gray-700">For every 5 correct answers in a row, you earn 1 new carrot!</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">4️⃣</span>
              <p className="text-gray-700">Losing all carrots means "Game Over"</p>
            </div>
          </div>
          <div className="flex justify-center space-x-2 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-2xl">🥕</span>
            ))}
          </div>
          <button
            onClick={() => setGameState(GAME_STATES.CATEGORY_SELECTION)}
            className="bg-orangePrimary text-white px-8 py-3 rounded-lg font-semibold btn-primary text-lg"
          >
            ➡️ Got It!
          </button>
        </div>
      </div>
    )
  }

  // Category Selection Screen
  if (gameState === GAME_STATES.CATEGORY_SELECTION) {
    return (
      <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Category</h1>
          <p className="text-gray-600 mb-6">Every question helps you grow healthier!</p>
          <div className="mb-6">
            <button
              onClick={() => toggleCategory('random')}
              className={`w-full p-6 rounded-lg border-2 transition-all duration-200 ${
                selectedCategories.includes('random')
                  ? 'border-orangePrimary bg-orange-50'
                  : 'border-gray-200 hover:border-orangePrimary hover:bg-orange-50'
              }`}
            >
              <div className="text-2xl mb-2">🎲</div>
              <div className="font-bold text-gray-800 text-lg mb-1">
                Random
              </div>
              <div className="text-sm text-gray-600">
                Mix of all categories
              </div>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8 max-h-64 overflow-y-auto">
            {CATEGORIES.filter(cat => cat.id !== 'random').map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedCategories.includes(category.id)
                    ? 'border-orangePrimary bg-orange-50'
                    : 'border-gray-200 hover:border-orangePrimary hover:bg-orange-50'
                }`}
              >
                <div className="font-semibold text-gray-800 text-sm mb-1">
                  {category.name}
                </div>
                <div className="text-xs text-gray-600">
                  {category.description}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => startGameWithCategories(selectedCategories)}
            className="bg-orangePrimary text-white px-8 py-4 rounded-lg font-semibold btn-primary text-lg w-full"
          >
            ➡️ Play!
          </button>
        </div>
      </div>
    )
  }

  // Loading Screen
  if (gameState === GAME_STATES.LOADING) {
    const selectedCategoryNames = selectedCategories.map(catId => 
      CATEGORIES.find(c => c.id === catId)?.name || 'Random'
    ).join(', ')
    return (
      <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-6 animate-bounce">🐼</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Your NutriPlay Challenge…</h1>
          <p className="text-gray-600 mb-2">Fetching questions for your health journey 🥦</p>
          <p className="text-sm text-orangePrimary font-medium mb-6">Categories: {selectedCategoryNames}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div className="bg-orangePrimary h-3 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-sm text-gray-500">Preparing your nutrition adventure...</p>
        </div>
      </div>
    )
  }

  // Game Over Screen
  if (gameState === GAME_STATES.GAME_OVER) {
    const accuracy = attempts > 0 ? Math.round((correctAnswers / attempts) * 100) : 0
    return (
      <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🥕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Over!</h1>
          <p className="text-gray-600 mb-6">You've used all your carrots. Don't worry, every expert was once a beginner!</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Performance</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orangePrimary">{attempts}</div>
                <div className="text-gray-600">Attempts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-gray-600">Correct</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-lg font-bold text-blue-600">{accuracy}%</div>
              <div className="text-gray-600">Accuracy</div>
            </div>
          </div>

          {!feedbackSubmitted ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (submittingFeedback) return
                setSubmittingFeedback(true)
                try {
                  await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: email || null,
                      feedback: userFeedback || null,
                      attempts,
                      correctAnswers,
                      accuracy,
                      selectedCategories,
                      ts: new Date().toISOString()
                    })
                  })
                  setFeedbackSubmitted(true)
                } catch (err) {
                  console.error(err)
                } finally {
                  setSubmittingFeedback(false)
                }
              }}
              className="mb-6 text-left space-y-3"
            >
              <label className="text-sm font-medium text-gray-700">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded px-3 py-2"
              />
              <label className="text-sm font-medium text-gray-700">Feedback (optional)</label>
              <textarea
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                rows={4}
                placeholder="Share your thoughts..."
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="bg-orangePrimary text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {submittingFeedback ? 'Sending…' : 'Submit Feedback'}
                </button>
                <button type="button" onClick={() => setFeedbackSubmitted(true)} className="text-sm text-gray-500">
                  Skip
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 text-sm text-green-600">Thanks for your feedback!</div>
          )}

          <button
            onClick={resetGame}
            className="bg-orangePrimary text-white px-6 py-3 rounded-lg font-semibold btn-primary"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  const q = questions[index]

  const onAnswer = (i) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === q.correct
    setFeedback(correct ? 'correct' : 'wrong')
    setAttempts(prev => prev + 1)
    if (correct) setCorrectAnswers(prev => prev + 1)
    setUsedQuestions(prev => [...prev, q.id])
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
    const el = optionRef.current[i]
    if (el) {
      el.classList.add('answered')
      el.classList.add(correct ? 'move-up' : 'move-down')
      setTimeout(() => {
        el.classList.remove('move-up')
        el.classList.remove('move-down')
      }, 700)
    }
    setTimeout(() => setShowInfo(true), 700)
  }

  const onNext = () => {
    setSelected(null)
    setFeedback(null)
    setShowInfo(false)
    if (index + 1 >= questions.length) {
      const availableQuestions = allQuestions.filter(q => 
        !usedQuestions.slice(-20).includes(q.id) && 
        (selectedCategories.includes('random') || selectedCategories.includes(q.category))
      )
      if (availableQuestions.length === 0) {
        setUsedQuestions([])
        const filteredQuestions = allQuestions.filter(q => 
          selectedCategories.includes('random') || selectedCategories.includes(q.category)
        )
        const shuffledQuestions = shuffleArray(filteredQuestions)
        setQuestions(shuffledQuestions)
        setIndex(0)
      } else {
        const shuffledQuestions = shuffleArray(availableQuestions)
        setQuestions(shuffledQuestions)
        setIndex(0)
      }
    } else {
      setIndex((idx) => idx + 1)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-orangePrimary font-sans flex flex-col items-center p-4">
      {/* Header, subtitle, carrots and attempts - White Box, single row */}
      <div className="w-full max-w-md mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900">NutriPlay</h1>
            <p className="text-sm text-gray-500">Learn to Eat Smart — One Bite at a Time!</p>
          </div>
          <div className="flex items-center justify-between">
            {/* Carrots on the left */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => {
                let carrotClass = 'text-2xl'
                if (i < lives) {
                  carrotClass += ' opacity-100'
                } else if (i === lives && streak > 0) {
                  if (streak >= 5) {
                    carrotClass += ' opacity-100 carrot-fill-100'
                  } else if (streak >= 4) {
                    carrotClass += ' opacity-100 carrot-fill-80'
                  } else if (streak >= 3) {
                    carrotClass += ' opacity-100 carrot-fill-60'
                  } else if (streak >= 2) {
                    carrotClass += ' opacity-100 carrot-fill-40'
                  } else if (streak >= 1) {
                    carrotClass += ' opacity-100 carrot-fill-20'
                  } else {
                    carrotClass += ' opacity-30'
                  }
                } else {
                  carrotClass += ' opacity-30'
                }
                return (
                  <span key={i} className={carrotClass}>
                    🥕
                  </span>
                )
              })}
            </div>
            {/* Attempts on the right */}
            <div className="text-sm text-gray-500">
              Attempts: {attempts}
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <main className="flex-1 w-full max-w-md flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-end mb-4">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium border border-orangePrimary text-gray-600 capitalize">
                  {q.category}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium border border-orangePrimary text-gray-600">
                  {q.difficulty}
                </span>
              </div>
            </div>
          <div className="text-lg font-semibold mb-6 text-gray-800 leading-relaxed">
            {q.question}
          </div>
          <div className="grid gap-3">
            {q.options.map((opt, i) => {
              const isSelected = selected === i
              const isCorrect = i === q.correct
              const classNames = [
                'px-4 py-3 rounded-lg border transition-all duration-200 ease-out option-btn text-left',
                'hover:border-orangePrimary hover:bg-orange-50',
                isSelected && feedback === 'correct' && 'border-green-500 bg-green-50',
                isSelected && feedback === 'wrong' && 'border-red-500 bg-red-50',
                showInfo && isCorrect && 'border-green-400 bg-green-50',
                selected !== null && 'cursor-not-allowed'
              ].filter(Boolean).join(' ')
              return (
                <button
                  key={i}
                  ref={el => optionRef.current[i] = el}
                  onClick={() => onAnswer(i)}
                  className={classNames}
                  disabled={selected !== null}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">{opt}</span>
                    {isSelected && feedback === 'correct' && (
                      <span className="text-green-600 text-lg">✓</span>
                    )}
                    {isSelected && feedback === 'wrong' && (
                      <span className="text-red-600 text-lg">✗</span>
                    )}
                    {showInfo && isCorrect && !isSelected && (
                      <span className="text-green-600 text-lg">✓</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          {showInfo && (
            <div className="mt-6 border-t pt-4 space-y-3">
              <div className="text-sm">
                <span className="font-semibold text-gray-800">Explanation:</span>
                <p className="text-gray-700 mt-1">{q.explanation}</p>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-800">Fun Fact:</span>
                <p className="text-gray-700 mt-1">{q.funFact}</p>
              </div>
              <div className="text-xs text-gray-500">
                Source: {q.source}
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {lives > 0 ? (
                <span>Lives: {lives}</span>
              ) : (
                <span className="text-red-500">No lives left!</span>
              )}
            </div>
            <div>
              <button
                onClick={onNext}
                className="bg-orangePrimary text-white px-6 py-2 rounded-lg font-semibold btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!showInfo}
              >
                Next Question
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-xs text-white pb-6 mt-4">
        Made with ❤️ for smarter eating
      </footer>
      {/* Mascot */}
      <div className="fixed bottom-4 right-4 text-4xl animate-bounce">
        🐰
      </div>
    </div>
  )
}
