import React, { useEffect, useState, useRef } from 'react'
import { useSession, signIn, signOut, getSession } from "next-auth/react"

const ORANGE = 'orangePrimary'

// Game states
const GAME_STATES = {
  WELCOME: 'welcome',
  HOW_TO_PLAY: 'howToPlay', 
  CATEGORY_SELECTION: 'categorySelection',
  LOADING: 'loading',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver',
  LEADERBOARD: 'leaderboard' 
}

// Available categories
const CATEGORIES = [
  { id: 'random', name: 'Random', description: 'Mix of all categories' },
  { id: 'myths', name: 'Myths', description: 'Nutrition myths and facts' },
  { id: 'indian-foods', name: 'Indian Foods', description: 'Traditional Indian nutrition' },
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
  const { data: session, status } = useSession()
  const sessionLoading = status === "loading"
  const isSignedIn = !!session?.user
  
  const [allQuestions, setAllQuestions] = useState([])
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [lives, setLives, ] = useState(5)
  const [streak, setStreak] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState([])
  const [showInfo, setShowInfo] = useState(false)
  const [gameState, setGameState] = useState(GAME_STATES.WELCOME)
  const [selectedCategories, setSelectedCategories] = useState(['random'])
  const [selectedDifficulties, setSelectedDifficulties] = useState([])
  const optionRef = useRef({})

  const toggleDifficulty = (level) => {
    setSelectedDifficulties(prev => {
      if (prev.includes(level)) return prev.filter(d => d !== level)
      return [...prev, level]
    })
  }
  
  const [email, setEmail] = useState('')
  const [userFeedback, setUserFeedback] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false) 

  const [leaderboardData, setLeaderboardData] = useState(null)
  const [isFetchingLeaderboard, setIsFetchingLeaderboard] = useState(false)

  const [highScore, setHighScore] = useState({
    score: 0,
    correctAnswers: 0,
    accuracy: 0,
    totalAttempts: 0,
    lastPlayed: null
  })
  const [showNewHighScoreAnimation, setShowNewHighScoreAnimation] = useState(false)
  const [animatingScore, setAnimatingScore] = useState(0)
  
  // STATE PERSISTENCE ON REFRESH - LOAD
  useEffect(() => {
    const savedState = localStorage.getItem('nutriplay_game_state');
    const savedCategories = localStorage.getItem('nutriplay_categories');
    const savedDifficulty = localStorage.getItem('nutriplay_difficulty');

    if (savedState && savedState !== GAME_STATES.WELCOME) {
        setGameState(savedState);
        if (savedCategories) setSelectedCategories(JSON.parse(savedCategories));
        if (savedDifficulty) setSelectedDifficulties(JSON.parse(savedDifficulty));
    }
  }, []);

  // STATE PERSISTENCE ON REFRESH - SAVE
  useEffect(() => {
      localStorage.setItem('nutriplay_game_state', gameState);

      if (session?.user?.email) {
          setEmail(session.user.email)
      } else if (gameState === GAME_STATES.WELCOME) {
          setEmail('')
      }

  }, [gameState, session])
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nutriplay_user_level_highscore')
      if (saved) {
        const parsed = JSON.parse(saved)
        setHighScore(parsed)
        setAnimatingScore(parsed.score || 0)
      }
    } catch (e) {
      console.error('Failed to load high score', e)
    }
  }, [])
  
  const uploadScore = async (scorePayload) => {
      if (!session?.user?.email) return;

      try {
          const res = await fetch('/api/score', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(scorePayload) 
          });
          if (!res.ok) throw new Error(`Failed to upload score. Status: ${res.status}`);
          console.log('Score uploaded successfully.');
      } catch (err) {
          console.error('Error uploading score:', err);
      }
  }

  const checkHighScore = (calculatedScore, correct, total, accuracy) => {
    const prev = highScore.score || 0
    const payload = {
        score: calculatedScore,
        correctAnswers: correct,
        accuracy,
        totalAttempts: total,
        lastPlayed: new Date().toISOString()
    }

    let newHighScore = false
    if (calculatedScore > prev) {
      newHighScore = true
      setHighScore(payload)
      localStorage.setItem('nutriplay_user_level_highscore', JSON.stringify(payload))
    } else {
      try {
        const updated = { ...highScore, lastPlayed: new Date().toISOString() }
        setHighScore(updated)
        localStorage.setItem('nutriplay_user_level_highscore', JSON.stringify(updated))
      } catch (e) {}
    }

    if (session?.user?.email) {
        uploadScore({
            score: calculatedScore, 
            correctAnswers: correct,
            totalAttempts: total,
            accuracy: accuracy
        });
    }

    if (newHighScore) {
      setShowNewHighScoreAnimation(true)
      setAnimatingScore(prev)
      const duration = 900
      const frameRate = 30
      const steps = Math.ceil((duration / 1000) * frameRate)
      const delta = (calculatedScore - prev) / steps
      let step = 0
      const iv = setInterval(() => {
        step++
        setAnimatingScore(old => {
          const next = Math.min(calculatedScore, Math.round(old + delta))
          return next
        })
        if (step >= steps) {
          clearInterval(iv)
          setAnimatingScore(calculatedScore)
          setTimeout(() => setShowNewHighScoreAnimation(false), 2200)
        }
      }, duration / steps)
    }
  }

  useEffect(() => {
    if (gameState === GAME_STATES.GAME_OVER) {
      const calculatedScore = correctAnswers
      const accuracy = attempts ? (correctAnswers / attempts) * 100 : 0
      checkHighScore(calculatedScore, correctAnswers, attempts, Number(accuracy.toFixed(1)))
    }
  }, [gameState]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetHighScore = () => {
    localStorage.removeItem('nutriplay_user_level_highscore')
    const empty = { score: 0, correctAnswers: 0, accuracy: 0, totalAttempts: 0, lastPlayed: null }
    setHighScore(empty)
    setAnimatingScore(0)
  }
  
  const fetchLeaderboard = async () => {
      if (isFetchingLeaderboard || !isSignedIn) return; 
      
      setIsFetchingLeaderboard(true);
      setLeaderboardData(null); 
      setGameState(GAME_STATES.LEADERBOARD); 

      try {
          const session = await getSession(); 
          if (!session) throw new Error('User not signed in for leaderboard fetch.');

          const res = await fetch(`/api/leaderboard`);
          
          if (res.status === 200) {
              const data = await res.json();
              setLeaderboardData(data); 
          } else if (res.status !== 304) {
              throw new Error(`Failed to fetch leaderboard: ${res.status} ${res.statusText}`);
          }
      } catch (error) {
          console.error("Failed to fetch leaderboard", error);
          alert("Failed to load leaderboard. Please try again.")
          setGameState(GAME_STATES.GAME_OVER); 
          setLeaderboardData(null); 
      } finally {
          setIsFetchingLeaderboard(false);
      }
  }
  
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

  const filterQuestionsByCategories = (categories, difficulties = []) => {
    let pool = allQuestions

    if (!categories.includes('random')) {
      pool = pool.filter(q => categories.includes(q.category))
    }

    if (Array.isArray(difficulties) && difficulties.length > 0) {
      pool = pool.filter(q => difficulties.includes((q.difficulty || '').toLowerCase()))
    }

    return shuffleArray(pool)
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

  const startGameWithCategories = (categories) => {
    setSelectedCategories(categories)
    const filteredQuestions = filterQuestionsByCategories(categories, selectedDifficulties)
    setQuestions(filteredQuestions)
    setIndex(0)
    
    localStorage.setItem('nutriplay_categories', JSON.stringify(categories));
    localStorage.setItem('nutriplay_difficulty', JSON.stringify(selectedDifficulties));

    setGameState(GAME_STATES.LOADING)
    setTimeout(() => setGameState(GAME_STATES.PLAYING), 2000)
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
    localStorage.removeItem('nutriplay_game_state');
    localStorage.removeItem('nutriplay_categories');
    localStorage.removeItem('nutriplay_difficulty');

    setGameState(GAME_STATES.WELCOME)
    setLives(5)
    setStreak(0)
    setAttempts(0)
    setCorrectAnswers(0)
    setUsedQuestions([])
    setIndex(0)
    setSelectedCategories(['random'])
    setUserFeedback('')
    setEmail(session?.user?.email || '')
    setFeedbackSubmitted(false)
    setLeaderboardData(null) 
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
  
  // LEADERBOARD SCREEN
  if (gameState === GAME_STATES.LEADERBOARD) {
    const { topPlayers, currentUserRank } = leaderboardData || {};

    const renderRank = (rank) => {
      if (typeof rank === 'number' && rank > 100) return '100+';
      return rank;
    }

    // Leaderboard Loading State
    if (isFetchingLeaderboard || leaderboardData === null) {
      return (
        <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-gray-900">
                    🏆 LEADERBOARD 🏆
                </h1>
                <div className="text-gray-400 my-8 flex flex-col items-center">
                    <div className="animate-spin text-4xl text-orangePrimary">🔄</div>
                    <div className='mt-3 text-lg font-semibold text-gray-700'>Fetching Leaderboard...</div>
                </div>
                <div className="flex justify-center space-x-4 mt-8">
                    <button
                        onClick={resetGame}
                        className="bg-orangePrimary text-white px-6 py-3 rounded-lg font-semibold flex-1"
                    >
                        PLAY AGAIN
                    </button>
                    <button
                        onClick={() => setGameState(GAME_STATES.GAME_OVER)}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 flex-1"
                    >
                        BACK
                    </button>
                </div>
            </div>
        </div>
      );
    }
    
    // Leaderboard Empty State
    const isDataEmpty = (topPlayers?.length === 0 && !currentUserRank);

    if (isDataEmpty) {
        return (
            <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
                    <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-gray-900">
                        🏆 LEADERBOARD 🏆
                    </h1>
                    <p className="text-gray-600 my-8 text-lg font-medium">No leaderboard data found. Play a game to submit your first score!</p>
                    <div className="flex justify-center space-x-4 mt-8">
                        <button
                            onClick={resetGame}
                            className="bg-orangePrimary text-white px-6 py-3 rounded-lg font-semibold flex-1"
                        >
                            PLAY AGAIN
                        </button>
                        <button
                            onClick={() => setGameState(GAME_STATES.GAME_OVER)}
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 flex-1"
                        >
                            BACK
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    
    // Leaderboard Content
    return (
        <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-gray-900">
                    🏆 LEADERBOARD 🏆
                </h1>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1 mb-4">
                    {topPlayers && topPlayers.slice(0, 15).map((player, index) => {
                        const isHighlighted = isSignedIn && player.email === session?.user?.email; 
                        const rank = index + 1;
                        
                        return (
                            <div
                                key={rank}
                                className={`flex justify-between items-center p-3 rounded-lg transition-all border ${
                                    isHighlighted 
                                        ? 'bg-orangePrimary text-white shadow-lg scale-[1.01] border-yellow-400' 
                                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                }`}
                            >
                                <div className="font-bold text-lg w-1/12">#{rank}</div>
                                <div className="text-left flex-1 truncate pl-3">
                                    <span className={`font-semibold ${isHighlighted ? 'text-white' : 'text-gray-800'}`}>{player.name || 'Anonymous'}</span>
                                    {isHighlighted && <span className="text-sm ml-2 text-white/90">(You)</span>}
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="font-bold text-lg">{player.score}</div>
                                    <div className={`text-xs ${isHighlighted ? 'text-white/80' : 'text-gray-500'}`}>{Number(player.accuracy || 0).toFixed(1)}% Acc</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                {currentUserRank && (
                   currentUserRank.rank > 15 || currentUserRank.rank === '100+' || !topPlayers.slice(0, 15).some(p => p.email === session?.user?.email)
                ) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm font-semibold text-gray-500 mb-2">YOUR POSITION</div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border-2 border-blue-400">
                            <div className="font-bold text-lg w-1/12 text-blue-600">#{renderRank(currentUserRank.rank)}</div>
                            <div className="text-left flex-1 truncate pl-3 font-semibold text-blue-700">You</div>
                            <div className="text-right flex flex-col items-end">
                                <div className="font-bold text-lg text-blue-600">Score: {currentUserRank.score}</div>
                                <div className="text-xs text-blue-500">{Number(currentUserRank.accuracy || 0).toFixed(1)}% Acc</div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            You ranked #{renderRank(currentUserRank.rank)} out of {currentUserRank.totalPlayers} players!
                        </p>
                    </div>
                )}


                <div className="flex justify-center space-x-4 mt-8">
                    <button
                        onClick={resetGame}
                        className="bg-orangePrimary text-white px-6 py-3 rounded-lg font-semibold flex-1"
                    >
                        PLAY AGAIN
                    </button>
                    <button
                        onClick={() => setGameState(GAME_STATES.GAME_OVER)}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 flex-1"
                    >
                        BACK
                    </button>
                </div>

            </div>
        </div>
    );
  }; // END LEADERBOARD SCREEN
  
  // Welcome Screen
  if (gameState === GAME_STATES.WELCOME) {
    return (
      <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">🐰</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NutriPlay</h1>
          <p className="text-lg text-gray-600 mb-8">Learn to Eat Smart — One Bite at a Time 🥕</p>
          
          {sessionLoading ? (
            <div className="mb-8">
              <p className="text-gray-600">🔄 Connecting to Google...</p>
            </div>
          ) : session ? (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                {session.user?.image && (
                  <img src={session.user.image} alt="" className="w-10 h-10 rounded-full" />
                )}
                <p className="text-gray-700">Welcome, {session.user?.name}!</p>
              </div>
              <button
                onClick={() => setGameState(GAME_STATES.HOW_TO_PLAY)}
                className="bg-orangePrimary text-white px-8 py-3 rounded-lg font-semibold btn-primary text-lg w-full mb-4"
              >
                ➡️ Let's Begin!
              </button>
              <button
                onClick={() => signOut()}
                className="text-gray-600 text-sm hover:underline"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              <button
                onClick={() => signIn('google')}
                className="flex items-center justify-center gap-2 w-full bg-white border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-300 transition-colors"
              >
                <span>🔐</span>
                <span>Sign in with Google</span>
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              <button
                onClick={() => setGameState(GAME_STATES.HOW_TO_PLAY)}
                className="w-full bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Play as Guest
              </button>
            </div>
          )}
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
    const selectedCategoryNames = selectedCategories.map(catId =>
      CATEGORIES.find(c => c.id === catId)?.name || 'Random'
    ).join(', ')
    const selectedDifficultyNames = selectedDifficulties.length ? selectedDifficulties.map(d => d[0].toUpperCase() + d.slice(1)).join(', ') : 'Any'
    
    return (
      <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Questions Type</h1>
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
          <div className="grid grid-cols-2 gap-3 mb-4 max-h-64 overflow-y-auto">
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

          <div className="mb-6">
            <div className="flex justify-center gap-3">
               {['easy','medium','hard'].map(level => {
                 const cap = level[0].toUpperCase() + level.slice(1)
                 const active = selectedDifficulties.includes(level)
                 return (
                   <button
                     key={level}
                     onClick={() => toggleDifficulty(level)}
                     className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                       active ? 'border-orangePrimary bg-orange-50' : 'border-gray-200 hover:border-orangePrimary'
                     }`}
                   >
                     {cap}
                   </button>
                 )
               })}
             </div>
           </div>
           
           <p className="text-sm text-orangePrimary font-medium mb-6">Current Selection: {selectedCategoryNames} • Difficulty: {selectedDifficultyNames}</p>

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
    const selectedDifficultyNames = selectedDifficulties.length ? selectedDifficulties.map(d => d[0].toUpperCase() + d.slice(1)).join(', ') : 'Any'
    return (
      <div className="min-h-screen bg-orangePrimary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-6 animate-bounce">🐼</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Your NutriPlay Challenge…</h1>
          <p className="text-gray-600 mb-2">Fetching questions for your health journey 🥦</p>
          <p className="text-sm text-orangePrimary font-medium mb-6">Categories: {selectedCategoryNames} • Difficulty: {selectedDifficultyNames}</p>
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
    const emailValue = isSignedIn ? (session.user.email || '') : email
    // REVISED: Placeholder now uses name@gmail.com if not signed in
    const placeholderEmail = isSignedIn ? (session.user.email || 'Your email will be pre-filled') : 'name@gmail.com'


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
            <div className="mt-3 text-center border-t pt-2 mt-2">
              <div className="text-lg font-bold text-orangePrimary">High Score: {highScore?.score ?? 0}</div>
            </div>
          </div>

          {/* New Button Order: Play Again, Leaderboard, then Feedback */}
          <div className="space-y-3 mb-6">
              <button
                onClick={resetGame}
                className="w-full bg-orangePrimary text-white px-6 py-3 rounded-lg font-semibold btn-primary"
              >
                Play Again
              </button>
              
              {isSignedIn ? (
                <button
                  onClick={fetchLeaderboard}
                  disabled={isFetchingLeaderboard}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  {isFetchingLeaderboard ? 'Loading Leaderboard...' : 'View LeaderBoard 🏆'}
                </button>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="w-full bg-gray-100 text-gray-500 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  title="Sign in to view the leaderboard"
                >
                  View Leaderboard 🏆 (Sign in required)
                </button>
              )}
          </div>
          {/* End New Button Order */}


          {!feedbackSubmitted ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                
                // If no feedback, prevent submission.
                if(userFeedback.length === 0) return;
                
                setSubmittingFeedback(true)
                try {
                  const res = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: emailValue || null, 
                      feedback: userFeedback || null,
                      attempts,
                      correctAnswers,
                      accuracy,
                      selectedCategories,
                      selectedDifficulties,
                      ts: new Date().toISOString()
                    })
                  })
                  if (!res.ok) throw new Error('Failed to submit feedback');
                  
                  setFeedbackSubmitted(true)
                } catch (err) {
                  console.error('Feedback submit error', err)
                  alert("Failed to submit feedback. Please try again.") 
                } finally {
                  setSubmittingFeedback(false)
                }
              }}
            >
              <div className="mb-4">
                {/* REVISED: New label text */}
                <label className="block text-sm font-bold text-gray-700 mb-2">Share Your Experience</label>
                <input
                  type="email"
                  value={emailValue}
                  readOnly={isSignedIn}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholderEmail}
                  className={`w-full border rounded px-3 py-2 text-sm ${isSignedIn ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                />
              </div>
              <div className="mb-4">
                {/* REMOVED: 'Feedback' label */}
                <textarea
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  rows={3} // OPTIMIZED: Reduced rows for better space
                  placeholder="Share your thoughts..."
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              {/* MODIFIED: Conditionally render the submit button only if feedback exists, with "Play Again" styling */}
              {userFeedback.length > 0 && (
                  <div className="flex items-center justify-center mb-4">
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className={`w-full bg-orangePrimary text-white px-6 py-3 rounded-lg font-semibold btn-primary disabled:opacity-50`}
                    >
                      {submittingFeedback ? 'Sending…' : 'Submit Feedback'}
                    </button>
                  </div>
              )}

            </form>
          ) : (
            <div className="mb-4 pt-4 border-t border-gray-200">
              <p className="text-green-600 font-semibold">Thank you for your feedback! 🥕</p>
            </div>
          )}
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

  return (
    <div className="min-h-screen bg-orangePrimary font-sans flex flex-col items-center p-4">
      <div className="w-full max-w-md mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900">NutriPlay</h1>
            <p className="text-sm text-gray-500">Learn to Eat Smart — One Bite at a Time!</p>
          </div>
          <div className="flex items-center justify-between">
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
            <div className="text-sm text-gray-500 text-right">
              <div>Your High Score: <span className="font-semibold text-orangePrimary">{highScore?.score ?? 0}</span></div>
              <div>Current Score: <span className="font-semibold text-gray-900">{correctAnswers}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showNewHighScoreAnimation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-4">
              <span className="text-orangePrimary">🎉</span>
              <span className="text-green-600">New High Score!</span>
              <span className="text-orangePrimary">🎉</span>
            </div>
            <div className="text-6xl font-bold text-gray-900 mb-4">
              {animatingScore}
            </div>
            <p className="text-gray-700 mb-4">You've set a new personal best!</p>
            <button
              onClick={() => setShowNewHighScoreAnimation(false)}
              className="bg-orangePrimary text-white px-6 py-3 rounded-lg font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-md flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            {/* MODIFIED: Consolidated the category/difficulty display and the next button into one row */}
            <div className="flex items-center justify-between mb-4">
              {/* Category and Difficulty on the left */}
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium border border-orangePrimary text-gray-600 capitalize">
                  {q.category}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium border border-orangePrimary text-gray-600 capitalize">
                  {q.difficulty}
                </span>
              </div>
              
              {/* Next Question CTA on the right */}
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
          {/* REMOVED: The previous bottom row which contained the lives count and the next question button */}
        </div>
      </main>

      <footer className="w-full max-w-md text-center text-xs text-white pb-6 mt-4">
        Made with ❤️ for smarter eating
      </footer>
      <div className="fixed bottom-4 right-4 text-4xl animate-bounce">
        🐰
      </div>
    </div>
  )
}