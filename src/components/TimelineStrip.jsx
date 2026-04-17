export default function TimelineStrip({ sections, palettes, progress, sectionWidth, totalWidth, onJump }) {
  const clips = sections.map((s, i) => ({
    ...s,
    color: palettes[s.palette].bg,
    textColor: palettes[s.palette].text,
    startPct: (i * sectionWidth) / totalWidth,
    widthPct: sectionWidth / totalWidth,
  }))

  return (
    <div className="hidden md:flex h-20 md:h-28 shrink-0 bg-[#F2F0EC] px-2 pb-2 pt-1 flex-col">
      {/* Ruler with timecodes */}
      <div className="relative h-4 flex items-end mx-1">
        {Array.from({ length: 50 }).map((_, i) => {
          const major = i % 10 === 0
          return (
            <div key={i} className="flex-1 flex justify-start">
              <div className={`w-px ${major ? 'h-3 bg-neutral-400' : 'h-1.5 bg-neutral-300'}`} />
            </div>
          )
        })}
        {[0, 10, 20, 30, 40].map((t) => (
          <span
            key={t}
            className="absolute text-[8px] font-mono text-neutral-400 -top-0.5"
            style={{ left: `${(t / 50) * 100}%` }}
          >
            {`0${Math.floor(t / 10)}`.slice(-2)}:{`0${(t % 10) * 6}`.slice(-2)}
          </span>
        ))}
      </div>

      {/* Clips minimap */}
      <div
        className="flex-1 relative rounded-lg overflow-hidden cursor-pointer mx-1 mt-2"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          onJump((e.clientX - rect.left) / rect.width)
        }}
      >
        {/* Track bg */}
        <div className="absolute inset-0 bg-neutral-200/60 rounded-lg" />

        {/* V1 track (top half) */}
        <div className="absolute top-0 left-0 right-0 h-1/2 flex">
          {clips.map((c) => (
            <div
              key={c.id}
              className="h-full relative overflow-hidden"
              style={{
                width: `${c.widthPct * 100}%`,
                marginLeft: 0,
              }}
            >
              <div
                className="absolute inset-[1px] rounded-[4px] flex items-center px-2"
                style={{ background: c.color }}
              >
                <span className="text-[8px] font-mono font-semibold tracking-wider truncate" style={{ color: c.textColor }}>
                  {c.label.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* A1 track (bottom half) - waveform */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-center px-1 gap-[1px]">
          {Array.from({ length: 120 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.2) * 30 + Math.sin(i * 0.07) * 20
            return (
              <div
                key={i}
                className="flex-1 rounded-full bg-emerald-400/40"
                style={{ height: `${h}%` }}
              />
            )
          })}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 z-10"
          style={{ left: `${progress * 100}%` }}
        >
          <div className="w-3 h-2.5 bg-red-500 rounded-sm -ml-1.5 playhead-glow" />
          <div className="w-[2px] h-full bg-red-500 mx-auto" />
        </div>

        {/* Viewport window */}
        <div
          className="absolute top-0 bottom-0 border-x-2 border-red-500/30 bg-red-500/5 pointer-events-none rounded-sm"
          style={{
            left: `${Math.max(progress * 100 - 5, 0)}%`,
            width: '10%',
          }}
        />
      </div>
    </div>
  )
}
