/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        deel: {
          purple:          '#6C5CE7',
          'purple-light':  '#8B7CF6',
          'purple-dim':    '#F0EEFF',
          navy:            '#0F1629',
          'nav-bg':        '#1A1F36',
          'nav-hover':     '#252B45',
          bg:              '#F4F5F7',
          border:          '#E5E7EB',
          text:            '#111827',
          muted:           '#6B7280',
          red:             '#EF4444',
          'red-bg':        '#FEF2F2',
          'red-border':    '#FECACA',
          yellow:          '#F59E0B',
          'yellow-bg':     '#FFFBEB',
          'yellow-border': '#FDE68A',
          blue:            '#3B82F6',
          'blue-bg':       '#EFF6FF',
          'blue-border':   '#BFDBFE',
          green:           '#10B981',
          'green-bg':      '#ECFDF5',
          'green-border':  '#A7F3D0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
