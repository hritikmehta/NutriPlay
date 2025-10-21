# 🥕 NutriPlay - Learn to Eat Smart!

**Tagline:** "Learn to Eat Smart — One Bite at a Time!"

A fun, interactive nutrition trivia web app built with Next.js and Tailwind CSS. Test your knowledge about healthy eating while managing your carrot lives!

## ✨ Features

- **🥕 Carrot Lives System**: Start with 5 carrots, lose 1 for wrong answers, gain 1 for every 5 correct answers in a row
- **📱 Mobile-First Design**: Beautiful, responsive interface optimized for all devices
- **🎯 Interactive Questions**: Multiple choice questions with instant feedback
- **🎨 Smooth Animations**: Shake and move animations for correct/incorrect answers
- **📊 Progress Tracking**: Visual progress bar and streak counter
- **🎓 Educational Content**: Detailed explanations, fun facts, and sources for each question
- **🔄 Endless Play**: Questions cycle through all available content

## 🎮 How to Play

1. **Start with 5 carrots** 🥕🥕🥕🥕🥕
2. **Answer questions** by clicking on your choice
3. **Correct answers**: Option shakes and moves up, streak increases
4. **Wrong answers**: Option shakes and moves down, lose 1 carrot
5. **5 correct in a row**: Gain 1 carrot back (max 5)
6. **Game over**: When you run out of carrots
7. **Learn**: Read explanations and fun facts after each answer

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/nutriplay.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

3. **Automatic deployments:**
   - Every push to main branch auto-deploys
   - Preview deployments for pull requests

### Option 2: Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `out` folder (if using static export)
   - Or connect your GitHub repository

### Option 3: Other Platforms

- **Railway**: Connect GitHub repo, auto-deploys
- **Render**: Connect GitHub repo, auto-deploys  
- **Heroku**: Add buildpack for Node.js
- **AWS Amplify**: Connect GitHub repo

## 📁 Project Structure

```
NutriPlay/
├── pages/
│   ├── _app.js          # App wrapper with fonts and meta
│   ├── index.js         # Main game interface
│   └── api/
│       └── questions.js # API route serving JSON data
├── public/
│   └── healthy_eating_trivia_extended.json # Question data
├── styles/
│   └── globals.css      # Global styles and animations
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── next.config.js       # Next.js configuration
└── README.md           # This file
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  orangePrimary: '#FF7A00',  // Main orange
  softGray: '#F6F6F7'        // Background gray
}
```

### Questions
Update `public/healthy_eating_trivia_extended.json` with your own questions:
```json
{
  "id": "q001",
  "category": "vitamins",
  "difficulty": "easy",
  "question": "Your question here?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correct": 0,
  "explanation": "Why this is correct...",
  "source": "Your source",
  "funFact": "Interesting fact!"
}
```

### Animations
Modify animations in `styles/globals.css`:
- Shake animation duration
- Move up/down distances
- Transition timings

## 🔧 Technical Details

- **Framework**: Next.js 14.1.0
- **Styling**: Tailwind CSS 3.4.7
- **Fonts**: Poppins (Google Fonts)
- **Icons**: SVG icons for carrots
- **Animations**: CSS keyframes
- **Data**: JSON file served via API route

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Ensure all dependencies are installed
3. Verify the JSON file is in the correct location
4. Check that the API route is working at `/api/questions`

## 🎯 Future Enhancements

- [ ] User accounts and high scores
- [ ] Different difficulty modes
- [ ] Category-specific quizzes
- [ ] Social sharing features
- [ ] Offline mode with service workers
- [ ] Sound effects and music
- [ ] Multiplayer mode
- [ ] Daily challenges

---

**Made with ❤️ for smarter eating!**

*Happy learning and healthy eating!* 🥕✨
