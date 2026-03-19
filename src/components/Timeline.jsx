export default function Timeline({ steps }) {
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            {/* Step dot + connector */}
            <div className="flex items-center w-full">
              {/* Left line */}
              <div className={`flex-1 h-0.5 ${i === 0 ? 'invisible' : step.done ? 'bg-deel-purple' : 'bg-deel-border'}`} />
              {/* Dot */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all z-10 shrink-0
                ${step.done && !step.active ? 'bg-deel-purple border-deel-purple' : ''}
                ${step.active ? 'bg-white border-deel-purple ring-4 ring-deel-purple-dim' : ''}
                ${!step.done && !step.active ? 'bg-white border-deel-border' : ''}
              `}>
                {step.done && !step.active && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {step.active && <div className="w-2.5 h-2.5 rounded-full bg-deel-purple animate-pulse-dot" />}
              </div>
              {/* Right line */}
              <div className={`flex-1 h-0.5 ${isLast ? 'invisible' : step.done && !step.active ? 'bg-deel-purple' : 'bg-deel-border'}`} />
            </div>
            {/* Label */}
            <p className={`text-xs mt-2 text-center font-medium
              ${step.active ? 'text-deel-purple' : step.done ? 'text-deel-text' : 'text-deel-muted'}
            `}>{step.label}</p>
          </div>
        )
      })}
    </div>
  )
}
