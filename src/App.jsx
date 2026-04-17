import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import TimelineStrip from './components/TimelineStrip'
import ExportModal from './components/ExportModal'
import ProjectPreview from './components/ProjectPreview'
import CountUp from './components/CountUp'
import GitHubTicker from './components/GitHubTicker'
import ShimmerBadge from './components/ShimmerBadge'
import ParallaxDots from './components/ParallaxDots'

// Project detail data for the modal
const PROJECT_DETAILS = [
  {
    id: 'postmail',
    name: 'PostMail',
    bg: '#2D5AFF',
    accent: '#E4FC50',
    textColor: 'rgba(255,255,255,0.65)',
    accentDim: 'rgba(228,252,80,0.15)',
    liveUrl: 'https://postmail-gilt.vercel.app/',
    tech: ['Next.js', 'FastAPI', 'LangGraph', 'pgvector', 'Docker'],
    bullets: [
      'Built an end-to-end AI app (FastAPI, Next.js, PostgreSQL/pgvector) that automates research and synthesizes information into personalized digests and long-form essays using a multi-agent LLM pipeline.',
      'Designed an 8-node LangGraph multi-agent pipeline with parallel research and diversity controls, improving output quality beyond standard LLM applications.',
      'Deployed with Docker, CI/CD (GitHub Actions), and cloud hosting (Render, Vercel), with real-time streaming (SSE) and production safeguards (rate limiting, job recovery, connection pooling).',
    ],
  },
  {
    id: 'doto',
    name: 'Doto',
    bg: '#04605B',
    accent: '#3FE06A',
    textColor: 'rgba(63,224,106,0.65)',
    accentDim: 'rgba(63,224,106,0.15)',
    liveUrl: 'https://doto-gamma.vercel.app/',
    tech: ['Next.js', 'Whisper', 'Groq', 'FFmpeg', 'Supabase'],
    bullets: [
      'Built an AI SaaS for creators (Next.js, Supabase/Postgres, Groq, HuggingFace) that transcribes videos and generates content ideas grounded in user transcripts rather than generic LLM outputs.',
      'Engineered an anti-hallucination pipeline with quote-level grounding checks, overgenerate→filter→re-prompt loops, and Jaccard similarity deduplication to improve idea quality.',
      'Shipped with Vercel + Supabase, including SSE-based upload processing (FFmpeg, Whisper), rate limiting, and layered security (RLS + server-side auth validation).',
    ],
  },
  {
    id: 'brev',
    name: 'Brev',
    bg: '#600030',
    accent: '#FF5020',
    textColor: 'rgba(255,255,255,0.65)',
    accentDim: 'rgba(255,80,32,0.15)',
    tech: ['Node.js', 'MongoDB', 'React', 'Tailwind', 'spaCy'],
    bullets: [
      'Built and deployed an AI study tool that turns notes into cheat sheets, quizzes, and memory aids using an NLP pipeline (spaCy + similarity scoring) on a Node.js, MongoDB, and React/Tailwind stack.',
      'Designed modular backend APIs and data pipelines that process and score content inputs in real time.',
      'Scaled to a 2,000+ student waitlist by validating product-market fit through 100+ user interviews. Led 2-week agile sprints with a 4-person cross-functional team, shipping 20+ high-performing reels along the way.',
    ],
  },
  {
    id: 'briefly',
    name: 'Briefly',
    bg: '#111',
    accent: '#E4FC50',
    textColor: 'rgba(255,255,255,0.55)',
    accentDim: 'rgba(228,252,80,0.15)',
    liveUrl: 'https://briefly-lemon-nine.vercel.app/',
    tech: ['Next.js', 'Flask', 'Gemini', 'Recharts'],
    bullets: [
      'Built a dashboard (Next.js, TypeScript, Gemini, Yahoo Finance, Google Trends) that aggregates market data, trends, and news sentiment, generating summaries grounded in computed metrics.',
      'Improved reliability by batching API calls, caching results (TTL + eviction), and grounding LLM outputs with real statistics, reducing hallucinations and handling rate limits.',
      'Deployed as a Next.js monolith on Vercel with resilient parallel fetching, typed API contracts, and CI checks (ESLint, type-checking, production builds).',
    ],
  },
]

// Color combos: bg + text pairs
const PALETTES = [
  { bg: '#FFFFFF', text: '#111111' },  // White + Black (Intro)
  { bg: '#E4FC50', text: '#2D5AFF' },  // Yellow + Blue (About)
  { bg: '#3FE06A', text: '#04605B' },  // Green + Deep Green (Projects)
  { bg: '#C298FF', text: '#2D0054' },  // Lavender + Deep Purple (Experience) - WCAG AAA
  { bg: '#FF5020', text: '#600030' },  // Orange + Deep Purple (Contact)
  { bg: '#111111', text: '#E4FC50' },  // Black + Yellow (Craft)
]

const SECTIONS = [
  { id: 'intro', label: 'Intro', palette: 0 },
  { id: 'about', label: 'About', palette: 1 },
  { id: 'projects', label: 'Projects', palette: 2 },
  { id: 'craft', label: 'Craft', palette: 5 },
  { id: 'experience', label: 'Experience', palette: 3 },
  { id: 'contact', label: 'Export', palette: 4 },
]

const DESKTOP_SECTION_WIDTH = 1400
const SCROLL_SPEED = 1.2
const MOBILE_BREAKPOINT = 768

const INTRO_TAGS = [
  { label: 'AI Engineer', bg: '#2D5AFF', text: '#E4FC50', rotate: -4, size: 'lg' },
  { label: 'Full Stack', bg: '#FF5020', text: '#fff', rotate: 6, size: 'lg' },
  { label: 'Multi-agent pipelines', bg: '#04605B', text: '#3FE06A', rotate: -6, size: 'md' },
  { label: 'LLMs + RAG', bg: '#600030', text: '#FF5020', rotate: 5, size: 'md' },
  { label: 'LangGraph', bg: '#C298FF', text: '#2D5AFF', rotate: -3, size: 'sm' },
  { label: 'Python + TypeScript', bg: '#111', text: '#E4FC50', rotate: 4, size: 'md' },
  { label: 'React / Next.js', bg: '#3FE06A', text: '#04605B', rotate: -5, size: 'md' },
  { label: 'Ships AI agents', bg: '#C298FF', text: '#2D5AFF', rotate: -7, size: 'md' },
  { label: 'Builds from scratch', bg: '#E4FC50', text: '#111', rotate: 3, size: 'md' },
  { label: 'PostgreSQL', bg: '#FF5020', text: '#fff', rotate: -4, size: 'sm' },
  { label: 'Evals first', bg: '#2D5AFF', text: '#fff', rotate: 6, size: 'sm' },
  { label: 'SSE streaming', bg: '#04605B', text: '#3FE06A', rotate: -3, size: 'sm' },
  { label: '26k+ community', bg: '#600030', text: '#FF5020', rotate: -5, size: 'lg' },
  { label: 'Graduating May 2026', bg: '#2D5AFF', text: '#fff', rotate: 5, size: 'md' },
  { label: 'Available for hire', bg: '#E4FC50', text: '#111', rotate: 7, size: 'lg' },
]

const PILL_SIZE_CLASSES = {
  lg: 'px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 text-xs sm:text-sm md:text-base',
  md: 'px-3 py-1.5 sm:px-5 sm:py-2.5 md:px-6 md:py-3.5 text-[11px] sm:text-xs md:text-sm',
  sm: 'px-2.5 py-1.5 sm:px-4 sm:py-2.5 md:px-5 md:py-3 text-[10px] sm:text-[11px] md:text-xs',
}

const tiltAwayFrom = (rotate, amount) => `${rotate + (rotate > 0 ? -amount : amount)}deg`

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

function useViewportWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1400)
  useEffect(() => {
    const onResize = () => setW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return w
}

function lerpColor(a, b, t) {
  const parse = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
  const ca = parse(a)
  const cb = parse(b)
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t)
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t)
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t)
  return `rgb(${r},${g},${bl})`
}

function App() {
  const isMobile = useIsMobile()
  const viewportWidth = useViewportWidth()
  // Sections fit the viewport when smaller than the intended desktop canvas.
  // Mobile: viewport width. Tablet + small desktop (<1400px): viewport width
  // so content positioned with right-X / w-% stays inside the visible area.
  // Large desktop (>=1400px): the original 1400 canvas.
  const SECTION_WIDTH = isMobile
    ? Math.max(viewportWidth, 360)
    : viewportWidth < DESKTOP_SECTION_WIDTH
      ? viewportWidth
      : DESKTOP_SECTION_WIDTH
  const TOTAL_WIDTH = SECTION_WIDTH * SECTIONS.length

  const [scrollX, setScrollX] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [openProject, setOpenProject] = useState(null)
  const scrollXRef = useRef(0)
  const targetRef = useRef(0)
  const rafRef = useRef(null)
  const containerRef = useRef(null)

  const maxScroll = TOTAL_WIDTH - viewportWidth
  const progress = Math.min(Math.max(scrollX / maxScroll, 0), 1)

  // Trigger load animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const [mobileSection, setMobileSection] = useState(0)

  const { currentBg, currentText, sectionIndex } = useMemo(() => {
    if (isMobile) {
      const idx = Math.min(Math.max(mobileSection, 0), SECTIONS.length - 1)
      const p = PALETTES[SECTIONS[idx].palette]
      return { currentBg: p.bg, currentText: p.text, sectionIndex: idx }
    }
    const sectionProgress = (scrollX / SECTION_WIDTH)
    const idx = Math.min(Math.floor(sectionProgress), SECTIONS.length - 1)
    const nextIdx = Math.min(idx + 1, SECTIONS.length - 1)
    const t = sectionProgress - idx
    const from = PALETTES[SECTIONS[idx].palette]
    const to = PALETTES[SECTIONS[nextIdx].palette]
    return {
      currentBg: lerpColor(from.bg, to.bg, Math.min(t * 2, 1)),
      currentText: lerpColor(from.text, to.text, Math.min(t * 2, 1)),
      sectionIndex: idx,
    }
  }, [scrollX, isMobile, mobileSection, SECTION_WIDTH])

  const animate = useCallback(() => {
    const diff = targetRef.current - scrollXRef.current
    if (Math.abs(diff) > 0.5) {
      scrollXRef.current += diff * 0.08
      setScrollX(scrollXRef.current)
    } else {
      scrollXRef.current = targetRef.current
      setScrollX(targetRef.current)
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animate])

  // Snap-to-section scroll: accumulate wheel delta, snap when threshold crossed
  const currentSectionRef = useRef(0)
  const accumulatedDelta = useRef(0)
  const snapCooldown = useRef(false)
  const SNAP_THRESHOLD = 80 // pixels of scroll before snapping

  const [targetSection, setTargetSection] = useState(0)

  const snapToSection = useCallback((idx) => {
    const clamped = Math.min(Math.max(idx, 0), SECTIONS.length - 1)
    currentSectionRef.current = clamped
    if (isMobile) {
      const el = document.getElementById(`section-${SECTIONS[clamped].id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMobileSection(clamped)
      setTargetSection(clamped)
      return
    }
    targetRef.current = clamped * SECTION_WIDTH
    setTargetSection(clamped)
  }, [isMobile, SECTION_WIDTH])

  useEffect(() => {
    if (!isMobile) {
      targetRef.current = currentSectionRef.current * SECTION_WIDTH
    }
  }, [SECTION_WIDTH, isMobile])

  useEffect(() => {
    if (isMobile) return
    const onWheel = (e) => {
      e.preventDefault()
      if (snapCooldown.current) return

      accumulatedDelta.current += (e.deltaY || e.deltaX)

      if (Math.abs(accumulatedDelta.current) > SNAP_THRESHOLD) {
        const direction = accumulatedDelta.current > 0 ? 1 : -1
        accumulatedDelta.current = 0
        snapCooldown.current = true
        snapToSection(currentSectionRef.current + direction)

        setTimeout(() => { snapCooldown.current = false }, 600)
      }
    }
    const el = containerRef.current
    el?.addEventListener('wheel', onWheel, { passive: false })
    return () => el?.removeEventListener('wheel', onWheel)
  }, [maxScroll, snapToSection, isMobile])

  // Touch: snap on swipe end
  useEffect(() => {
    if (isMobile) return
    let startX = 0, startY = 0, totalDx = 0
    const el = containerRef.current
    const onStart = (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      totalDx = 0
    }
    const onMove = (e) => {
      e.preventDefault()
      const dx = startX - e.touches[0].clientX
      totalDx += dx
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const onEnd = () => {
      if (Math.abs(totalDx) > 50) {
        const direction = totalDx > 0 ? 1 : -1
        snapToSection(currentSectionRef.current + direction)
      }
    }
    el?.addEventListener('touchstart', onStart, { passive: true })
    el?.addEventListener('touchmove', onMove, { passive: false })
    el?.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el?.removeEventListener('touchstart', onStart)
      el?.removeEventListener('touchmove', onMove)
      el?.removeEventListener('touchend', onEnd)
    }
  }, [maxScroll, snapToSection, isMobile])

  // Keyboard: snap per arrow press
  useEffect(() => {
    if (isMobile) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') snapToSection(currentSectionRef.current + 1)
      if (e.key === 'ArrowLeft') snapToSection(currentSectionRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [snapToSection, isMobile])

  // Mobile: track current section via IntersectionObserver.
  // We use rootMargin to shrink the detection zone to the top ~40% of the
  // viewport, so whichever section's top is visible wins — this is robust
  // even for sections taller than the viewport where intersectionRatio
  // never reaches 0.5.
  useEffect(() => {
    if (!isMobile) return
    const observers = []
    SECTIONS.forEach((s, i) => {
      const el = document.getElementById(`section-${s.id}`)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              currentSectionRef.current = i
              setMobileSection(i)
              setTargetSection(i)
            }
          })
        },
        // rootMargin clips the root viewport to a 60% top band so the
        // section that occupies the top of the screen always wins
        { threshold: 0, rootMargin: '0px 0px -40% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [isMobile])

  const jumpTo = (pct) => {
    // Snap to nearest section
    const idx = Math.round(pct * (SECTIONS.length - 1))
    snapToSection(idx)
  }

  const formatTimecode = (p) => {
    const total = Math.floor(p * 86400)
    const m = String(Math.floor((total % 86400) / 1440)).padStart(2, '0')
    const s = String(Math.floor((total % 1440) / 24)).padStart(2, '0')
    const f = String(total % 24).padStart(2, '0')
    return `00:${m}:${s}:${f}`
  }

  // Timecode scramble on section change
  const [scrambling, setScrambling] = useState(false)
  const [scrambleText, setScrambleText] = useState('')
  const prevSectionRef = useRef(sectionIndex)

  useEffect(() => {
    if (sectionIndex !== prevSectionRef.current) {
      prevSectionRef.current = sectionIndex
      setScrambling(true)
      let count = 0
      const iv = setInterval(() => {
        const chars = '0123456789:'
        setScrambleText(Array.from({ length: 11 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
        count++
        if (count > 8) {
          clearInterval(iv)
          setScrambling(false)
        }
      }, 40)
      return () => clearInterval(iv)
    }
  }, [sectionIndex])

  // ---- ANIMATION SPRING CONFIG ----
  const smoothSpring = { type: 'spring', stiffness: 70, damping: 18, mass: 1 }
  const snappySpring = { type: 'spring', stiffness: 100, damping: 20, mass: 0.8 }

  const [visibleSections, setVisibleSections] = useState(new Set())

  useEffect(() => {
    if (!isMobile) return
    const observers = []
    const attach = () => {
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(`section-${s.id}`)
        if (!el) return
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleSections((prev) => {
                  const next = new Set(prev)
                  next.add(i)
                  return next
                })
              }
            })
          },
          { threshold: 0.15 }
        )
        obs.observe(el)
        observers.push(obs)
      })
    }
    const timer = requestAnimationFrame(attach)
    return () => {
      cancelAnimationFrame(timer)
      observers.forEach((o) => o.disconnect())
    }
  }, [isMobile])

  if (isMobile) {
    const navPalette = PALETTES[SECTIONS[mobileSection].palette]
    // Tab bar height in px — used to add bottom padding so content never
    // hides behind the fixed bar. Keep in sync with the bar's py value.
    const TAB_BAR_H = 64
    return (
      <div className="w-screen bg-[#F2F0EC]">
        {SECTIONS.map((s, i) => {
          const palette = PALETTES[s.palette]
          const isLast = i === SECTIONS.length - 1
          return (
            <section
              key={s.id}
              id={`section-${s.id}`}
              className="relative w-full min-h-screen"
              style={{
                background: palette.bg,
                // Last section gets extra bottom padding so the tab bar
                // doesn't overlap the Export button / credit roll.
                paddingBottom: isLast ? TAB_BAR_H + 24 : 0,
              }}
            >
              <SectionContent
                id={s.id}
                textColor={palette.text}
                onExport={() => setExportOpen(true)}
                onViewWork={() => snapToSection(SECTIONS.findIndex((x) => x.id === 'projects'))}
                isActive={visibleSections.has(i)}
                isMobile={true}
                onOpenProject={setOpenProject}
              />
            </section>
          )
        })}

        {/* ── Bottom Tab Bar ────────────────────────────────────────────────
            Fixed to the bottom of the viewport. The outer div owns the GPU
            compositing layer (translateZ + isolation) so Safari doesn't
            paint it beneath section backgrounds. The motion.div animates
            in from below on load and handles the color transition. */}
        <div
          className="fixed bottom-0 left-0 right-0 z-[100]"
          style={{
            isolation: 'isolate',
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          <motion.div
            className="flex items-stretch"
            style={{
              // ~95% opacity via F2 hex suffix; backdrop-blur is safe here
              // because the bar lives in its own compositing layer.
              background: navPalette.bg + 'F2',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              height: TAB_BAR_H,
              // Smooth color cross-fade as mobileSection changes
              transition: 'background 0.35s ease',
            }}
            initial={{ y: TAB_BAR_H, opacity: 0 }}
            animate={loaded ? { y: 0, opacity: 1 } : {}}
            transition={{ ...snappySpring, delay: 0.25 }}
          >
            {SECTIONS.map((s, i) => {
              const isActive = sectionIndex === i
              return (
                <button
                  key={s.id}
                  onClick={() => snapToSection(i)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer relative transition-opacity duration-200"
                  style={{
                    color: navPalette.text,
                    opacity: isActive ? 1 : 0.38,
                  }}
                  aria-label={`Go to ${s.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active indicator pill — sits above the label */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tab-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full"
                      style={{
                        background: navPalette.text,
                        width: '28px',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <TabIcon sectionId={s.id} color={navPalette.text} />
                  <span
                    className="font-medium leading-none"
                    style={{
                      fontSize: '9px',
                      letterSpacing: '0.04em',
                      fontFamily: 'var(--font-mono, monospace)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.label}
                  </span>
                </button>
              )
            })}
          </motion.div>

          {/* Safe-area fill so the bar extends behind the home indicator on
              iPhones with notches / dynamic islands */}
          <div
            style={{
              background: navPalette.bg + 'F2',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              height: 'env(safe-area-inset-bottom, 0px)',
              transition: 'background 0.35s ease',
            }}
          />
        </div>

        <ExportModal
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          textColor={currentText}
        />
        <ProjectDetailModal
          project={openProject ? PROJECT_DETAILS.find((p) => p.id === openProject) : null}
          onClose={() => setOpenProject(null)}
          isMobile={true}
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden bg-[#F2F0EC] flex flex-col">

      {/* ===== VIEWFINDER ===== */}
      <motion.div
        className="flex-1 relative overflow-hidden rounded-2xl mx-2 mt-2 origin-center"
        style={{ background: currentBg }}
        initial={{ scale: 0.6, opacity: 0, borderRadius: 32 }}
        animate={loaded ? { scale: 1, opacity: 1, borderRadius: 16 } : {}}
        transition={{ ...smoothSpring, delay: 0.1 }}
      >
        {/* REC indicator */}
        <motion.div
          className="absolute top-3 left-3 sm:top-4 sm:left-5 z-30 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={loaded ? { opacity: 1, x: 0 } : {}}
          transition={{ ...snappySpring, delay: 0.8 }}
        >
          <div className="w-2 h-2 rounded-full bg-red-500 rec-blink" />
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider opacity-60" style={{ color: currentText }}>
            REC
          </span>
        </motion.div>

        {/* Timecode top-right */}
        <motion.div
          className="absolute top-3 right-3 sm:top-4 sm:right-5 z-30"
          initial={{ opacity: 0, x: 20 }}
          animate={loaded ? { opacity: 1, x: 0 } : {}}
          transition={{ ...snappySpring, delay: 0.9 }}
        >
          <span className="font-mono text-[11px] sm:text-sm font-medium tabular-nums tracking-wide opacity-60" style={{ color: currentText }}>
            {scrambling ? scrambleText : formatTimecode(progress)}
          </span>
        </motion.div>

        {/* Section nav pills -swipes in from right */}
        <motion.div
          className="absolute top-12 sm:top-4 left-1/2 z-30 flex items-center gap-1 sm:gap-1.5 bg-black/10 backdrop-blur-md rounded-full px-2 sm:px-2.5 py-1 sm:py-1.5 max-w-[calc(100%-1.5rem)] overflow-x-auto"
          initial={{ x: 100, opacity: 0 }}
          animate={loaded ? { x: '-50%', opacity: 1 } : { x: 100 }}
          transition={{ ...snappySpring, delay: 0.6 }}
        >
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => jumpTo(i / (SECTIONS.length - 1))}
              className="px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{
                background: sectionIndex === i ? currentText + '25' : 'transparent',
                color: currentText,
                opacity: sectionIndex === i ? 1 : 0.5,
              }}
            >
              {s.label}
            </button>
          ))}
        </motion.div>

        {/* Horizontal sliding content */}
        <motion.div
          className="absolute inset-0 flex will-change-transform"
          style={{ width: TOTAL_WIDTH, transform: `translateX(${-scrollX}px)` }}
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {SECTIONS.map((s, i) => (
            <div key={s.id} className="shrink-0 h-full relative px-4 sm:px-8 md:px-14 py-14" style={{ width: SECTION_WIDTH }}>
              <div className="absolute inset-0">
                <SectionContent id={s.id} textColor={currentText} onExport={() => setExportOpen(true)} onViewWork={() => snapToSection(SECTIONS.findIndex((x) => x.id === 'projects'))} isActive={targetSection === i} isMobile={false} onOpenProject={setOpenProject} />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Viewfinder frame corners -fade in late */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1 }}
        >
          <Corner pos="top-3 left-3" />
          <Corner pos="top-3 right-3" rotate />
          <Corner pos="bottom-3 left-3" flipY />
          <Corner pos="bottom-3 right-3" rotate flipY />
        </motion.div>
      </motion.div>

      {/* ===== TIMELINE STRIP -spreads from left ===== */}
      <motion.div
        className="origin-left"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={loaded ? { scaleX: 1, opacity: 1 } : {}}
        transition={{ ...smoothSpring, delay: 0.35 }}
      >
        <TimelineStrip
          sections={SECTIONS}
          palettes={PALETTES}
          progress={progress}
          scrollX={scrollX}
          sectionWidth={SECTION_WIDTH}
          totalWidth={TOTAL_WIDTH}
          onJump={jumpTo}
        />
      </motion.div>

      {/* Export Modal */}
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        textColor={currentText}
      />
      <ProjectDetailModal
        project={openProject ? PROJECT_DETAILS.find((p) => p.id === openProject) : null}
        onClose={() => setOpenProject(null)}
        isMobile={false}
      />
    </div>
  )
}

// SVG tab icons — minimal, 20×20, stroke-based so they scale crisply on
// hi-DPI screens. Each path is hand-tuned for legibility at 18px render size.
function TabIcon({ sectionId, color }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  switch (sectionId) {
    case 'intro':
      // Home / play button (▶) — portfolio entrance
      return (
        <svg {...props}>
          <polygon points="4,3 17,10 4,17" strokeWidth={1.5} />
        </svg>
      )
    case 'about':
      // Person silhouette
      return (
        <svg {...props}>
          <circle cx="10" cy="6.5" r="3" />
          <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
        </svg>
      )
    case 'projects':
      // Grid of 4 squares (bento)
      return (
        <svg {...props}>
          <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" />
          <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" />
          <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" />
          <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
        </svg>
      )
    case 'craft':
      // Code brackets </>
      return (
        <svg {...props}>
          <polyline points="6,7 2,10 6,13" />
          <polyline points="14,7 18,10 14,13" />
          <line x1="11" y1="4" x2="9" y2="16" />
        </svg>
      )
    case 'experience':
      // Timeline / calendar with lines
      return (
        <svg {...props}>
          <rect x="3" y="4" width="14" height="13" rx="2" />
          <line x1="7" y1="2" x2="7" y2="6" />
          <line x1="13" y1="2" x2="13" y2="6" />
          <line x1="6" y1="10" x2="14" y2="10" />
          <line x1="6" y1="13.5" x2="11" y2="13.5" />
        </svg>
      )
    case 'contact':
      // Export arrow (box with up-arrow)
      return (
        <svg {...props}>
          <path d="M10 13V4M7 7l3-3 3 3" />
          <path d="M4 13v4h12v-4" />
        </svg>
      )
    default:
      return null
  }
}

function Corner({ pos, rotate, flipY }) {
  return (
    <div className={`absolute ${pos} w-5 h-5 opacity-30 pointer-events-none`}>
      <div
        className="w-full h-full border-white"
        style={{
          borderTopWidth: flipY ? 0 : 2,
          borderBottomWidth: flipY ? 2 : 0,
          borderLeftWidth: rotate ? 0 : 2,
          borderRightWidth: rotate ? 2 : 0,
          borderColor: 'currentColor',
        }}
      />
    </div>
  )
}


function SectionContent({ id, textColor, onExport, onViewWork, isActive, isMobile = false, onOpenProject }) {
  const tc = textColor
  const wrapperClass = isMobile
    ? 'relative w-full min-h-screen'
    : 'absolute inset-0'

  // Pill entrance animation: one-shot guard + reduced-motion support
  const pillsHasPlayed = useRef(false)
  const shouldReduceMotion = useReducedMotion()
  if (isActive && !pillsHasPlayed.current) pillsHasPlayed.current = true

  switch (id) {
    case 'intro':
      return (
        <div className={`${isMobile ? 'relative w-full min-h-screen flex flex-col justify-between' : 'absolute inset-0 flex flex-col justify-end'} px-6 sm:px-8 md:px-10 lg:px-14 py-12 pt-20 md:pt-12`}>
          <div className={`flex flex-col max-w-xl ${isMobile ? 'order-2 mt-4 mb-16' : ''}`}>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4 opacity-50" style={{ color: tc }}>
              / portfolio
            </span>
            <h1 className="font-display font-black text-[clamp(2.5rem,10vw,7.5rem)] leading-[0.85] mb-5" style={{ color: tc }}>
              Aariya
              <br />
              Gage
            </h1>
            <p className="text-sm md:text-[15px] max-w-md leading-relaxed opacity-60" style={{ color: tc }}>
              I build AI systems and full-stack apps. I understand attention, not abstractly, but because 26k people have given me theirs.
            </p>

            {/* Status line -who / what / when */}
            <p className="mt-5 font-mono text-[11px] md:text-xs tracking-wider uppercase" style={{ color: tc }}>
              Cofounder @ Brev &middot; AI + Full Stack &middot; Graduating May 2026
            </p>

            {/* Primary CTA */}
            <div className="mt-7 flex items-center gap-3">
              <motion.button
                type="button"
                onClick={onViewWork}
                className="inline-flex items-center gap-2 rounded-full border font-bold text-sm md:text-base px-5 py-2.5 md:px-6 md:py-3 leading-none transition-colors cursor-pointer bg-transparent"
                style={{ borderColor: tc, color: tc }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.4, ease: 'easeOut' }}
                whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
                whileTap={{ scale: 0.97 }}
              >
                View my work
                <span aria-hidden="true" className="text-base leading-none">→</span>
              </motion.button>
            </div>
          </div>

          {/* Horizontal scroll cue — desktop only */}
          {!isMobile && (
            <motion.div
              className="absolute bottom-8 right-10 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase select-none pointer-events-none"
              style={{ color: tc, opacity: 0.45 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 2.8, duration: 0.6 }}
            >
              <span>scroll</span>
              <motion.span
                aria-hidden="true"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut', repeatDelay: 0.3 }}
                className="text-sm leading-none"
              >
                →
              </motion.span>
            </motion.div>
          )}

          {/* Tumbled pill cluster -tight, overlapping, naturally falling */}
          <div className={`${isMobile ? 'relative order-1 w-full flex flex-wrap content-center justify-center flex-1' : 'absolute top-6 bottom-6 right-4 md:right-6 lg:right-10 w-[50%] md:w-[40%] lg:w-[44%] flex flex-wrap content-center justify-end'} gap-x-2`} style={{ gap: '6px 8px' }}>
            {INTRO_TAGS.map((r, i) => (
              <motion.span
                key={r.label}
                className={`bento-card inline-flex items-center rounded-full font-bold shadow-lg whitespace-nowrap cursor-default leading-none ${PILL_SIZE_CLASSES[r.size]}`}
                style={{
                  color: r.text,
                  background: r.bg,
                  rotate: `${r.rotate}deg`,
                }}
                initial={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : pillsHasPlayed.current && !isActive
                      ? false
                      : { opacity: 0, y: -60, scale: 0.7 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.25, ease: 'easeOut', delay: 0.05 + i * 0.02 }
                    : {
                        type: 'spring',
                        stiffness: 260,
                        damping: 20,
                        delay: 0.3 + (INTRO_TAGS.length - 1 - i) * 0.04,
                      }
                }
                whileHover={{
                  scale: 1.22,
                  rotate: tiltAwayFrom(r.rotate, 8),
                  y: -6,
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
                whileTap={{
                  scale: 1.18,
                  rotate: tiltAwayFrom(r.rotate, 6),
                  y: -4,
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
              >
                {r.label}
              </motion.span>
            ))}
          </div>
        </div>
      )

    case 'about':
      return (
        <div className={`${isMobile ? 'relative w-full min-h-screen' : 'absolute inset-0'} px-4 sm:px-6 md:px-10 py-10 pt-16 md:pt-10 flex items-center justify-center`}>
          <div className={`w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-2.5 sm:gap-3 ${isMobile ? '' : 'md:h-full md:max-h-[600px] lg:max-h-[520px]'}`}>
            {/* Photo -tall left card */}
            <motion.div
              className="col-span-2 md:col-span-1 md:row-span-2 rounded-2xl bento-card overflow-hidden relative aspect-[4/5] md:aspect-auto"
              style={{ background: '#FF5020' }}
              {...(isMobile ? { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <img
                src="/aariya.webp"
                alt="Aariya Gage"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </motion.div>

            {/* Name + role */}
            <motion.div
              className="col-span-2 md:col-span-2 md:row-span-1 rounded-2xl bento-card p-4 sm:p-5 flex flex-col justify-center"
              style={{ background: '#111111' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.5, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl leading-[0.9] mb-1 text-white">Aariya Gage</h2>
              <p className="text-xs md:text-sm text-white/60">CS + Business @ ASU · AI Engineer · Content Creator</p>
            </motion.div>

            {/* Bio card */}
            <motion.div
              className="col-span-2 md:col-span-1 md:row-span-2 rounded-2xl bento-card p-4 sm:p-5 flex flex-col justify-center"
              style={{ background: '#3FE06A' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.5, delay: 0.16, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <p className="text-xs leading-relaxed text-[#04605B]">
                Senior at Arizona State University studying CS with a business minor. I build AI-powered tools and tell stories that connect, bridging engineering, content, and community.
              </p>
            </motion.div>

            {/* Instagram stat -count up + hover secondary stat */}
            <motion.div
              className="group col-span-1 md:row-span-1 rounded-2xl bento-card p-4 flex flex-col justify-center items-center min-h-[96px]"
              style={{ background: '#C298FF' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.5, delay: 0.24, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <CountUp end={26} suffix="k+" className="font-display font-black text-3xl text-[#2D5AFF]" active={isActive} />
              <span className="text-[10px] font-medium text-[#2D5AFF]/70 mt-1">Instagram</span>
              <span className="text-[8px] font-mono font-medium text-[#2D5AFF]/0 group-hover:text-[#2D5AFF]/50 group-active:text-[#2D5AFF]/50 mt-0.5 transition-all duration-200 translate-y-2 group-hover:translate-y-0 group-active:translate-y-0">
                2M+ impressions
              </span>
            </motion.div>

            {/* Instagram profile card */}
            <ProjectPreview
              href="https://www.instagram.com/yourstrulyaariya"
              previewImage="/instagram-preview.webp"
              className="col-span-1 md:row-span-1 rounded-2xl bento-card p-4 flex flex-col justify-center cursor-pointer hover:scale-[1.02] active:scale-[1.02] transition-transform min-h-[96px]"
              style={{ background: '#111' }}
            >
              <p className="font-display font-bold text-sm text-white mb-0.5">@yourstrulyaariya</p>
              <p className="text-[10px] text-white/40 mb-2">Content Creator · Video Editor</p>
              <span className="text-[10px] font-semibold text-[#E4FC50]">
                View Profile &rarr;
              </span>
            </ProjectPreview>

            {/* Skills card -wide bottom */}
            <motion.div
              className="col-span-2 md:col-span-2 md:row-span-1 rounded-2xl bento-card p-4 flex flex-col justify-center"
              style={{ background: '#04605B' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.5, delay: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <div className="flex flex-wrap gap-1.5">
                {['Python', 'TypeScript', 'React', 'Next.js', 'LangChain', 'FastAPI', 'Supabase', 'pgvector', 'Docker', 'Premiere Pro'].map((s) => (
                  <span key={s} className="skill-pill px-3 py-1 rounded-full text-[10px] font-medium bg-[#3FE06A]/25 text-[#3FE06A] cursor-default">{s}</span>
                ))}
              </div>
            </motion.div>

            {/* Location card */}
            <motion.div
              className="col-span-1 md:row-span-1 rounded-2xl bento-card p-4 flex flex-col justify-center items-center min-h-[80px]"
              style={{ background: '#FF5020' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.5, delay: 0.36, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <span className="text-lg mb-1">📍</span>
              <span className="text-[11px] font-semibold text-[#600030] text-center">Arizona · Open to relocate</span>
            </motion.div>

            {/* Available card */}
            <motion.div
              className="col-span-1 md:row-span-1 rounded-2xl bento-card p-4 flex items-center justify-center gap-2 min-h-[80px]"
              style={{ background: '#2D5AFF' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <div className="w-2 h-2 rounded-full bg-[#E4FC50] animate-pulse shrink-0" />
              <span className="text-[11px] font-semibold text-[#E4FC50]">Available for hire</span>
            </motion.div>
          </div>
        </div>
      )

    case 'projects':
      return (
        <div className={`${isMobile ? 'relative w-full min-h-screen' : 'absolute inset-0'} px-4 sm:px-6 md:px-10 py-10 pt-16 md:pt-10 flex items-center justify-center`}>
          <div className={`w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-2.5 sm:gap-3 ${isMobile ? '' : 'md:h-full md:max-h-[600px] lg:max-h-[520px]'}`}>
            {/* Section title card */}
            <motion.div
              className="col-span-2 md:col-span-1 md:row-span-1 rounded-2xl bento-card p-4 sm:p-5 flex flex-col justify-end min-h-[80px]"
              style={{ background: '#E4FC50' }}
              {...(isMobile ? { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <span className="font-display font-black text-2xl leading-[0.9] text-[#2D5AFF]">Selected Work.</span>
            </motion.div>

            {/* PostMail -large card */}
            <ProjectPreview
              href="https://postmail-gilt.vercel.app/"
              onClick={() => onOpenProject('postmail')}
              className="col-span-2 md:col-span-2 md:row-span-2 rounded-2xl bento-card p-4 sm:p-5 flex flex-col justify-between overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[1.02] transition-transform min-h-[320px]"
              style={{ background: '#2D5AFF' }}
            >
              <div className="flex-1 rounded-xl overflow-hidden mb-3">
                <img
                  src="/postmail-preview.webp"
                  alt="PostMail screenshot"
                  className="w-full h-full object-cover object-top scale-110 origin-top"
                />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-[#E4FC50] mb-1">PostMail</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-2">AI content digest that scrapes 500+ sources, generates vector embeddings, and delivers personalized daily digests via a 3-agent LangGraph pipeline. Real-time updates over SSE.</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Next.js', 'FastAPI', 'LangGraph', 'pgvector', 'Docker'].map((t) => (
                    <span key={t} className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#E4FC50]/15 text-[#E4FC50]">{t}</span>
                  ))}
                </div>
              </div>
            </ProjectPreview>

            {/* Brev -tall right card (Cofounder) */}
            <motion.div
              onClick={() => onOpenProject('brev')}
              className="col-span-2 md:col-span-1 md:row-span-2 rounded-2xl bento-card p-4 flex flex-col overflow-hidden min-h-[320px] cursor-pointer hover:scale-[1.02] active:scale-[1.02] transition-transform"
              style={{ background: '#600030' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.5, delay: 0.16, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <div className="mb-2">
                <ShimmerBadge active={isActive} className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FF5020]/20 text-[#FF5020]">COFOUNDER</ShimmerBadge>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden mb-3 bg-white">
                <img
                  src="/brev-preview.webp"
                  alt="Brev landing"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#FF5020] mb-1">Brev</h3>
                <p className="text-[10px] text-white/50 leading-relaxed mb-2">EdTech AI that turns any study material into cheatsheets, mnemonics, study plans, and flashcards in seconds. Streamlining exam prep for students.</p>
                <div className="flex flex-wrap gap-1">
                  {['AI/LLM', 'EdTech', 'Node.js', 'MongoDB'].map((t) => (
                    <span key={t} className="text-[8px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#FF5020]/15 text-[#FF5020]">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Briefly -brand intelligence */}
            <ProjectPreview
              href="https://briefly-lemon-nine.vercel.app/"
              onClick={() => onOpenProject('briefly')}
              className="col-span-1 md:row-span-1 rounded-2xl bento-card p-4 flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[1.02] transition-transform min-h-[120px]"
              style={{ background: '#111' }}
            >
              <div>
                <h3 className="font-display font-bold text-sm text-[#E4FC50] mb-0.5">Briefly</h3>
                <p className="text-[9px] text-white/50 leading-relaxed mb-1.5">Brand intelligence dashboard that aggregates trends, stock data, and news sentiment into AI-powered executive briefings.</p>
                <div className="flex flex-wrap gap-1">
                  {['Next.js', 'Flask', 'Gemini', 'Recharts'].map((t) => (
                    <span key={t} className="text-[8px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#E4FC50]/15 text-[#E4FC50]">{t}</span>
                  ))}
                </div>
              </div>
            </ProjectPreview>

            {/* Doto -wide card with parallax dots */}
            <DotoCard onOpenProject={onOpenProject} />

            {/* Stats card -count up */}
            <motion.div
              className="col-span-1 md:row-span-1 rounded-2xl bento-card p-4 flex flex-col justify-center items-center min-h-[96px]"
              style={{ background: '#C298FF' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.5, delay: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <span className="font-display font-black text-2xl text-[#2D5AFF]">
                <CountUp end={4} duration={600} active={isActive} /> AI
              </span>
              <span className="text-[10px] font-medium text-[#2D5AFF]/70 mt-1">Products Shipped</span>
            </motion.div>

            {/* GitHub CTA -live commit ticker */}
            <motion.a
              href="https://github.com/aariyagage"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 md:col-span-1 md:row-span-1 rounded-2xl bento-card p-4 cursor-pointer hover:opacity-90 active:opacity-90 transition-opacity min-h-[96px] no-underline block"
              style={{ background: '#FF5020' }}
              {...(isMobile ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.5, delay: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } } : {})}
            >
              <GitHubTicker username="aariyagage" accentColor="#600030" />
            </motion.a>
          </div>
        </div>
      )

    case 'craft':
      return (
        <div className={`${isMobile ? 'relative w-full min-h-screen' : 'absolute inset-0'} px-6 sm:px-8 md:px-10 lg:px-14 py-12 pt-16 md:pt-12 flex flex-col md:flex-row gap-8 md:gap-8 lg:gap-14`}>
          {/* Left -editorial headline */}
          <div className="flex-1 flex flex-col justify-end max-w-xl">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4 opacity-50" style={{ color: tc }}>
              / my process
            </span>
            <h2 className="font-display font-black text-[clamp(2.25rem,9vw,6.5rem)] leading-[0.85] mb-5" style={{ color: tc }}>
              How I build
              <br />
              AI features.
            </h2>
            <p className="text-sm md:text-[15px] leading-relaxed opacity-60 max-w-md mb-4" style={{ color: tc }}>
              When I start on an AI project, these are the five things I work through, and why each one matters.
            </p>
          </div>

          {/* Right -principle stack */}
          <div className="flex-1 flex flex-col justify-center gap-1 md:gap-1 lg:gap-1.5 max-w-xl pt-10 md:pt-12">
            {[
              {
                num: '01',
                name: 'Structure',
                tagline: 'How I break the problem down.',
                detail: 'Figure out if one model can do it, or if I need a few agents handling different parts. Plan how they pass work.',
                accent: '#3FE06A',
              },
              {
                num: '02',
                name: 'Grounding',
                tagline: 'Keeping the output trustworthy.',
                detail: 'LLMs will make things up. I use schemas and source citations so bad outputs never reach the user.',
                accent: '#FF5020',
              },
              {
                num: '03',
                name: 'Failure handling',
                tagline: 'Planning for when things go wrong.',
                detail: 'APIs go down, rate limits hit, outputs come back wrong. I add retries, a fallback model, and jobs that recover after a crash.',
                accent: '#C298FF',
              },
              {
                num: '04',
                name: 'Tradeoffs',
                tagline: 'Balancing cost, speed, and quality.',
                detail: 'Bigger models aren\u2019t always better. I pick the smallest one that does the job, batch calls, and cache anything that repeats.',
                accent: '#2D5AFF',
              },
              {
                num: '05',
                name: 'Evals',
                tagline: 'Catching regressions before I ship.',
                detail: 'I keep a set of test inputs with known-good outputs. Run them after every change to make sure I didn\u2019t break anything.',
                accent: '#E4FC50',
              },
            ].map((p, i) => (
              <motion.div
                key={p.num}
                className="group relative rounded-xl px-3.5 py-3 md:px-4 md:py-3.5 flex items-start gap-3.5 overflow-hidden cursor-default"
                style={{
                  background: 'rgba(228, 252, 80, 0.04)',
                  border: '1px solid rgba(228, 252, 80, 0.1)',
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ x: -4, transition: { duration: 0.2 } }}
                whileTap={{ x: -4, scale: 0.98, transition: { duration: 0.15 } }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 group-hover:w-[6px]"
                  style={{ background: p.accent }}
                />
                <span className="font-mono text-[11px] font-semibold tracking-wider shrink-0 mt-0.5" style={{ color: p.accent }}>
                  {p.num}
                </span>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-base md:text-lg leading-tight" style={{ color: tc }}>
                    {p.name}
                  </h3>
                  <p className="text-[11px] md:text-xs mt-1 opacity-70" style={{ color: tc }}>
                    {p.tagline}
                  </p>
                  <p className="text-[11px] md:text-xs mt-1.5 opacity-40 font-mono leading-relaxed" style={{ color: tc }}>
                    {p.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )

    case 'experience':
      return (
        <div className={`${isMobile ? 'relative w-full min-h-screen flex flex-col' : 'absolute inset-0 flex flex-col justify-end'} px-6 sm:px-8 md:px-10 lg:px-14 py-12 pt-16 md:pt-12`}>
          <div className={`flex flex-col max-w-xl ${isMobile ? 'mb-8' : ''}`}>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4 opacity-50" style={{ color: tc }}>
              / timeline
            </span>
            <h2 className="font-display font-black text-[clamp(2.25rem,9vw,6.5rem)] leading-[0.85] mb-5" style={{ color: tc }}>
              Experience.
            </h2>
            <p className="text-sm md:text-[15px] max-w-md leading-relaxed opacity-60" style={{ color: tc }}>
              4 years of building, creating, and growing, from first line of code to shipping AI systems.
            </p>
          </div>

          {/* Experience cards -right side with timeline connector */}
          <div className={`${isMobile ? 'relative flex max-w-full w-full' : 'absolute inset-y-0 right-6 md:right-10 lg:right-20 flex items-center pt-10 md:pt-12'}`}>
            <div className={isMobile ? 'flex max-w-full w-full' : 'flex max-w-[320px] lg:max-w-sm'}>
            {/* Timeline spine */}
            <div className="relative mr-4 flex flex-col items-center" style={{ paddingTop: 18, paddingBottom: 18 }}>
              {/* Animated vertical line */}
              {isActive && (
                <motion.div
                  className="absolute w-[2px] left-1/2 -translate-x-1/2"
                  style={{ top: 18, bottom: 18, background: tc, opacity: 0.2, transformOrigin: 'top' }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                />
              )}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border-2 relative z-10 shrink-0"
                  style={{
                    borderColor: tc,
                    background: i === 0 ? tc : 'transparent',
                    marginTop: i === 0 ? 0 : 'auto',
                  }}
                  initial={{ scale: 0 }}
                  animate={isActive ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.15 }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {[
                { period: 'Jun 2025 · Now', role: 'Content Creator', company: 'Instagram · @yourstrulyaariya', desc: 'Grew to 26,000+ followers in under a year. 500+ videos edited. Built engagement strategy driving 2M+ impressions.', rotate: '-1.5deg' },
                { period: 'Dec 2025 · Feb 2026', role: 'Full Stack Engineer Intern', company: 'Autonorm AI · India', desc: 'Short full-stack internship at an India-based AI startup building business-automation tools.', rotate: '0.5deg' },
                { period: 'Sep 2024 · May 2025', role: 'Cofounder & AI Engineer', company: 'Brev', desc: 'Built an AI study tool that turns notes into cheat sheets, quizzes, and memory aids. Scaled to a 2,000+ student waitlist.', rotate: '1deg' },
              ].map((e) => (
                <div
                  key={e.role}
                  className="p-5 rounded-2xl backdrop-blur-sm"
                  style={{
                    background: tc + '0A',
                    border: `1px solid ${tc}20`,
                    transform: `rotate(${e.rotate})`,
                  }}
                >
                  <span className="font-mono text-[11px] opacity-40" style={{ color: tc }}>{e.period}</span>
                  <h3 className="font-display font-bold text-lg mt-1" style={{ color: tc }}>{e.role}</h3>
                  <p className="text-xs opacity-40 mb-1.5" style={{ color: tc }}>{e.company}</p>
                  <p className="text-sm leading-relaxed opacity-60" style={{ color: tc }}>{e.desc}</p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      )

    case 'contact':
      return (
        <div className={`${isMobile ? 'relative w-full min-h-screen' : 'absolute inset-0'} flex flex-col justify-center items-center text-center px-6 sm:px-8 md:px-14 py-16 md:py-0`}>
          {/* Export-ready headline */}
          <h2 className="font-display font-black text-[clamp(2.5rem,10vw,8rem)] leading-[0.85] mb-3" style={{ color: tc }}>
            Ready to
            <br />
            Export.
          </h2>
          <p className="text-sm md:text-base max-w-md leading-relaxed opacity-60 mb-8" style={{ color: tc }}>
            AI Engineer building intelligent systems with LLMs, multi-agent pipelines, and semantic search. Graduating ASU May 2026. Also open to Full Stack and Frontend roles.
          </p>

          {/* Export CTA button */}
          <button
            onClick={onExport}
            className="group relative px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-display font-bold text-sm sm:text-base cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              background: tc,
              color: PALETTES[4].bg,
            }}
          >
            <span className="flex items-center gap-2 sm:gap-3">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PALETTES[4].bg }} />
              Export Aariya Gage.mp4
              <span className="font-mono text-xs opacity-50">&#9654;</span>
            </span>
          </button>

          {/* Render specs preview */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-4 opacity-30">
            {['AI Engineer', 'ASU 2026', '26K Community', 'Multi-Agent'].map((s) => (
              <span key={s} className="font-mono text-[9px] tracking-wider" style={{ color: tc }}>{s}</span>
            ))}
          </div>

          {/* Credit Roll */}
          <CreditRoll textColor={tc} />
        </div>
      )

    default:
      return null
  }
}

function CreditRoll({ textColor }) {
  const credits = [
    ['Written & Directed by', 'Aariya Gage'],
    ['Developed in', 'React 18 + Vite'],
    ['Styled with', 'Tailwind CSS'],
    ['Motion by', 'Framer Motion'],
    ['Typography', 'Onest · Inter · JetBrains Mono'],
    ['Color Grading', 'Yellow × Green × Purple × Orange'],
    ['Runtime', '4 years of building + creating'],
    ['Special Thanks', 'Every recruiter who scrolled this far'],
    ['', ''],
    ['No templates were harmed', 'in the making of this portfolio.'],
  ]

  return (
    <div className="absolute bottom-4 left-0 right-0 overflow-hidden h-16 pointer-events-none">
      <motion.div
        className="flex flex-col items-center gap-1.5"
        initial={{ y: 80 }}
        animate={{ y: -credits.length * 22 }}
        transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatDelay: 3 }}
      >
        {credits.map(([role, name], i) => (
          <div key={i} className="text-center">
            {role && (
              <span className="font-mono text-[8px] uppercase tracking-[0.2em] opacity-25 block" style={{ color: textColor }}>
                {role}
              </span>
            )}
            <span className="font-display text-[11px] font-medium opacity-40" style={{ color: textColor }}>
              {name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function DotoCard({ onOpenProject }) {
  const [dotOffset, setDotOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width - 0.5
    const cy = (e.clientY - rect.top) / rect.height - 0.5
    setDotOffset({ x: cx * 20, y: cy * 20 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setDotOffset({ x: 0, y: 0 })
  }, [])

  // Touch: move dots toward the touch point while finger is down
  const handleTouchMove = useCallback((e) => {
    if (!e.touches[0]) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.touches[0].clientX - rect.left) / rect.width - 0.5
    const cy = (e.touches[0].clientY - rect.top) / rect.height - 0.5
    setDotOffset({ x: cx * 20, y: cy * 20 })
  }, [])

  const handleTouchEnd = useCallback(() => {
    setDotOffset({ x: 0, y: 0 })
  }, [])

  return (
    <ProjectPreview
      href="https://doto-gamma.vercel.app/"
      onClick={() => onOpenProject('doto')}
      className="col-span-2 md:col-span-2 md:row-span-1 rounded-2xl bento-card p-4 flex items-center gap-4 relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[1.02] transition-transform min-h-[120px]"
      style={{ background: '#04605B' }}
    >
      <div
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <ParallaxDots dotColor="rgba(63, 224, 106, 0.35)" dotCount={40} offsetX={dotOffset.x} offsetY={dotOffset.y} />
      </div>
      <div className="flex-1 relative z-10 pointer-events-none">
        <h3 className="font-display font-bold text-sm text-[#3FE06A] mb-0.5">Doto</h3>
        <p className="text-[10px] text-[#3FE06A]/60 leading-relaxed mb-1.5">Creator intelligence that transcribes video with Whisper, extracts your voice DNA, and generates 10x more content ideas tailored to your style.</p>
        <div className="flex gap-1">
          {['Next.js', 'Whisper', 'Groq', 'FFmpeg', 'Supabase'].map((t) => (
            <span key={t} className="text-[8px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#3FE06A]/15 text-[#3FE06A]">{t}</span>
          ))}
        </div>
      </div>
    </ProjectPreview>
  )
}

function ProjectDetailModal({ project, onClose, isMobile }) {
  // Close on Escape key
  useEffect(() => {
    if (!project) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [project, onClose])

  // Mobile: slides up from bottom as a sheet
  // Desktop: fades and scales in from center
  const mobileCard = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { type: 'spring', stiffness: 340, damping: 34, mass: 0.9 },
  }
  const desktopCard = {
    initial: { opacity: 0, scale: 0.95, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 12 },
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
  }
  const cardAnim = isMobile ? mobileCard : desktopCard

  const mobileStyle = {
    position: 'fixed',
    bottom: 0,
    left: 12,
    right: 12,
    borderRadius: '16px 16px 0 0',
    maxHeight: '90dvh',
  }
  const desktopStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    width: '100%',
    maxWidth: 480,
    height: 'fit-content',
    borderRadius: 20,
    maxHeight: '80vh',
  }

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal card */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} project details`}
            className="fixed z-[201] flex flex-col overflow-hidden"
            style={{ background: project.bg, ...(isMobile ? mobileStyle : desktopStyle) }}
            {...cardAnim}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
              <h2
                className="font-display font-black text-2xl leading-none"
                style={{ color: project.accent }}
              >
                {project.name}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: project.accentDim, color: project.accent + '80' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = project.accentDim }}
                onMouseLeave={(e) => { e.currentTarget.style.background = project.accentDim }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px mx-5 shrink-0" style={{ background: project.accent + '15' }} />

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {project.bullets.map((bullet, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: project.accent }}
                    aria-hidden="true"
                  />
                  <p className="text-[13px] leading-relaxed" style={{ color: project.textColor }}>{bullet}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 pt-3 pb-5 shrink-0">
              {/* Divider */}
              <div className="h-px mb-4" style={{ background: project.accent + '15' }} />

              {/* Tech tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full"
                    style={{ background: project.accentDim, color: project.accent }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* View Live button -only if the project has a public URL */}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-display font-bold text-sm transition-opacity hover:opacity-85 active:opacity-75"
                  style={{ background: project.accent, color: project.bg }}
                >
                  View Live
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M2 11L11 2M11 2H5M11 2v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default App
