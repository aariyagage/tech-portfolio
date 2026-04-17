import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EXPORT_SPECS = [
  { key: 'Format', value: 'AI_Engineer.mp4' },
  { key: 'Resolution', value: '4K · AI / Full Stack / Frontend' },
  { key: 'Codec', value: 'Python / LangChain / Next.js / FastAPI' },
  { key: 'Audience', value: '26,000+ community' },
  { key: 'Education', value: 'ASU · CS + Business · May 2026' },
  { key: 'File Size', value: '4 years of building + creating' },
]

const PHASES = ['Analyzing timeline...', 'Rendering sequences...', 'Encoding assets...', 'Packaging deliverable...', 'Finalizing export...']

export default function ExportModal({ open, onClose, textColor }) {
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setPhase(0)
      setProgress(0)
      setComplete(false)
      return
    }

    // Animate progress from 0 to 100 over ~5 seconds
    let start = null
    const duration = 5000
    const tick = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      const pct = Math.min((elapsed / duration) * 100, 100)
      setProgress(pct)

      // Update phase based on progress
      const phaseIdx = Math.min(Math.floor(pct / 20), PHASES.length - 1)
      setPhase(phaseIdx)

      if (pct < 100) {
        intervalRef.current = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setComplete(true), 400)
      }
    }
    intervalRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(intervalRef.current)
  }, [open])

  // Close on Escape (only after export completes, matching existing UX where
  // the CLOSE button appears only when complete)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape' && complete) onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, complete, onClose])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={complete ? onClose : undefined} />

        {/* Modal */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Export Aariya Gage - contact info"
          className="relative w-full max-w-lg mx-2 sm:mx-4 rounded-2xl overflow-hidden"
          style={{ background: '#111113', border: '1px solid #333' }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${complete ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'}`} />
              <span className="font-mono text-xs text-white/60">
                {complete ? 'EXPORT COMPLETE' : 'EXPORTING...'}
              </span>
            </div>
            {complete && (
              <button
                onClick={onClose}
                aria-label="Close export modal"
                className="text-white/40 hover:text-white text-xs font-mono cursor-pointer"
              >
                CLOSE
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!complete ? (
              <motion.div
                key="exporting"
                className="p-6"
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Filename */}
                <h3 className="font-display font-black text-xl text-white mb-1">
                  AARIYA_GAGE.MP4
                </h3>
                <p className="font-mono text-[10px] text-white/30 mb-5">
                  Packaging deliverable for review...
                </p>

                {/* Progress bar */}
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #E4FC50, #3FE06A, #2D5AFF, #C298FF, #FF5020)',
                    }}
                  />
                </div>

                {/* Progress info */}
                <div className="flex justify-between items-center mb-6">
                  <span className="font-mono text-[11px] text-white/50">
                    {PHASES[phase]}
                  </span>
                  <span className="font-mono text-sm text-white font-medium tabular-nums">
                    {Math.floor(progress)}%
                  </span>
                </div>

                {/* Specs readout */}
                <div className="space-y-2">
                  {EXPORT_SPECS.map((spec, i) => (
                    <motion.div
                      key={spec.key}
                      className="flex justify-between items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: progress > i * 15 ? 1 : 0.2, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">{spec.key}</span>
                      <span className="font-mono text-[11px] text-white/70">{spec.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="complete"
                className="p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {/* Render complete */}
                <div className="text-center mb-6">
                  <motion.div
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ background: '#3FE06A' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                  >
                    <span className="text-[#04605B] text-lg font-bold">✓</span>
                  </motion.div>
                  <h3 className="font-display font-black text-2xl text-white mb-1">Ready to Ship.</h3>
                  <p className="font-mono text-[10px] text-white/30">Export completed successfully</p>
                </div>

                {/* Contact links - the actual payload */}
                <div className="space-y-2.5">
                  {[
                    { label: 'RESUME', value: 'Aariya Gage Resume.pdf', href: '/aariya-gage-resume.pdf' },
                    { label: 'EMAIL', value: 'aariyagage@gmail.com', href: 'mailto:aariyagage@gmail.com' },
                    { label: 'GITHUB', value: 'github.com/aariyagage', href: 'https://github.com/aariyagage' },
                    { label: 'LINKEDIN', value: 'linkedin.com/in/aariya-gage', href: 'https://www.linkedin.com/in/aariya-gage-88468924a' },
                    { label: 'INSTAGRAM', value: '@yourstrulyaariya · 26k+', href: 'https://instagram.com/yourstrulyaariya' },
                  ].map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl no-underline group"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      whileHover={{ background: 'rgba(255,255,255,0.10)' }}
                    >
                      <span className="font-mono text-[10px] text-white/40 tracking-wider">{link.label}</span>
                      <span className="font-mono text-xs text-white/70 group-hover:text-white transition-colors">{link.value}</span>
                    </motion.a>
                  ))}
                </div>

                {/* Resume download */}
                <motion.a
                  href="/Aariya_Gage_Resume.pdf"
                  download
                  className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl no-underline"
                  style={{ background: '#E4FC50', color: '#111' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <span className="font-mono text-xs font-bold">Download Resume (PDF)</span>
                </motion.a>

                {/* Footer */}
                <p className="text-center font-mono text-[9px] text-white/20 mt-4">
                  AARIYA_GAGE.MP4 · Encoded with passion
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
