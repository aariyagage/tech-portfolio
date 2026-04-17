import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const LIFE_MARKERS = [
  { pct: 0.03, color: '#E4FC50', label: 'First line of code', year: '2018' },
  { pct: 0.12, color: '#C298FF', label: 'Made first video', year: '2019' },
  { pct: 0.25, color: '#2D5AFF', label: 'Started CS at ASU', year: '2022' },
  { pct: 0.38, color: '#3FE06A', label: 'Started creating content', year: '2023' },
  { pct: 0.50, color: '#FF5020', label: 'Hit 10K followers', year: '2024' },
  { pct: 0.65, color: '#C298FF', label: 'Built PostMail & Doto', year: '2025' },
  { pct: 0.80, color: '#E4FC50', label: '26K on Instagram', year: '2025' },
  { pct: 0.95, color: '#FFFFFF', label: "You're here.", year: 'Now' },
]

export default function TimelineStrip({ sections, palettes, progress, scrollX, sectionWidth, totalWidth, onJump }) {
  const [hoveredMarker, setHoveredMarker] = useState(null)

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

      {/* Marker rail */}
      <div className="relative h-4 mx-1 flex items-center">
        {LIFE_MARKERS.map((m, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex items-center z-20"
            style={{ left: `${m.pct * 100}%` }}
            onMouseEnter={() => setHoveredMarker(i)}
            onMouseLeave={() => setHoveredMarker(null)}
          >
            {/* Diamond marker */}
            <div
              className="w-2.5 h-2.5 -ml-[5px] rotate-45 cursor-pointer transition-transform hover:scale-150"
              style={{ background: m.color, boxShadow: `0 0 6px ${m.color}60` }}
            />

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredMarker === i && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                >
                  <div
                    className="px-3 py-2 rounded-lg text-center"
                    style={{ background: '#1A1A1A', border: `1px solid ${m.color}40` }}
                  >
                    <p className="text-[10px] font-mono font-medium" style={{ color: m.color }}>{m.year}</p>
                    <p className="text-[11px] text-white/80 mt-0.5">{m.label}</p>
                  </div>
                  {/* Arrow */}
                  <div className="w-2 h-2 bg-[#1A1A1A] rotate-45 mx-auto -mt-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Thin connecting line behind markers */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-neutral-300/50 -translate-y-1/2" />
      </div>

      {/* Clips minimap */}
      <div
        className="flex-1 relative rounded-lg overflow-hidden cursor-pointer mx-1"
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
