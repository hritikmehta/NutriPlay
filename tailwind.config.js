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
