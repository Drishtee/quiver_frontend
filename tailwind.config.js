module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Quiver brand colors — exact from official logo
        primary: '#2E3192',      // Deep navy blue from logo V shape
        secondary: '#1A1F6E',    // Darker navy
        accent: '#00A651',       // Green from logo swoosh
        'quiver-green': '#00A651', // Vivid green from logo swoosh
        'quiver-blue': '#2E3192',
        'quiver-dark': '#141660', // Deep navy for dark backgrounds
        warm: '#F59E0B',         // Amber — warm, friendly
        earth: '#D97706'         // Dark amber — earthy
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
