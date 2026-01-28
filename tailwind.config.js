module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D6A4F',
        secondary: '#40916C',
        accent: '#52B788',
        warm: '#F4A261',
        earth: '#E76F51'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif']
      },
      // Mobile-first spacing utilities
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      // Touch target sizes
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px',
      },
      minWidth: {
        'touch': '48px',
        'touch-lg': '56px',
      },
      // Mobile-first screen sizes
      screens: {
        'xs': '375px',
        // Default Tailwind breakpoints remain: sm (640), md (768), lg (1024), xl (1280), 2xl (1536)
      },
      // Safe area insets
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
        'safe-r': 'env(safe-area-inset-right)',
      },
      // Animation for mobile interactions
      transitionDuration: {
        '250': '250ms',
      },
      // Touch-friendly border radius
      borderRadius: {
        'touch': '0.75rem',
      },
      // Z-index for mobile navigation layers
      zIndex: {
        'bottom-nav': '50',
        'modal': '100',
        'toast': '150',
      },
    }
  },
  plugins: [],
}
