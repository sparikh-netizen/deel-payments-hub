const NAV = [
  { icon: '⊞', label: 'Overview' },
  { icon: '↑↓', label: 'Payments', active: true },
  { icon: '👥', label: 'People' },
  { icon: '📄', label: 'Contracts' },
  { icon: '📊', label: 'Reports' },
  { icon: '⚙', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-[#1A1F36] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-deel-purple flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="text-white font-semibold text-[15px]">Deel</span>
        </div>
      </div>

      {/* Company switcher */}
      <div className="px-3 py-3 border-b border-white/10">
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/10 transition-colors">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-400 to-deel-purple flex items-center justify-center text-white text-xs font-bold shrink-0">SV</div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">Spice Village GmbH</p>
            <p className="text-white/50 text-[10px]">Admin</p>
          </div>
          <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
              ${item.active
                ? 'bg-white/15 text-white font-medium'
                : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
          >
            <span className="text-base w-4 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">SP</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Shivam Parikh</p>
            <p className="text-white/40 text-[10px]">shivam@spicevillage.eu</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
