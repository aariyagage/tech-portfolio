import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CACHE_KEY = 'gh-ticker-v1'
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 min: respects GH's 60 req/hr/IP rate limit

const fetchJson = async (url) => {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const data = await r.json()
  if (!Array.isArray(data)) throw new Error('unexpected response shape')
  return data
}

export default function GitHubTicker({ username = 'aariyagage', accentColor = '#600030' }) {
  const [items, setItems] = useState([])
  const [visibleIdx, setVisibleIdx] = useState(0)

  useEffect(() => {
    let cancelled = false

    // Try sessionStorage cache first (avoids hammering the 60/hr anon limit)
    try {
      const raw = sessionStorage.getItem(`${CACHE_KEY}:${username}`)
      if (raw) {
        const { ts, items: cached } = JSON.parse(raw)
        if (Date.now() - ts < CACHE_TTL_MS && Array.isArray(cached) && cached.length) {
          setItems(cached.map((c) => ({ ...c, time: new Date(c.time) })))
          return
        }
      }
    } catch {
      // storage unavailable (private mode, disabled) - fall through to network
    }

    const loadCommits = async () => {
      try {
        const events = await fetchJson(
          `https://api.github.com/users/${username}/events/public?per_page=30`
        )
        return events
          .filter((e) => e && e.type === 'PushEvent' && e.payload && Array.isArray(e.payload.commits))
          .flatMap((e) =>
            e.payload.commits.map((c) => ({
              repo: (e.repo && e.repo.name ? e.repo.name.split('/')[1] : 'repo'),
              message: String(c.message || '').split('\n')[0].slice(0, 48),
              time: new Date(e.created_at),
            }))
          )
          .slice(0, 8)
      } catch {
        return []
      }
    }

    const loadRepos = async () => {
      try {
        const repos = await fetchJson(
          `https://api.github.com/users/${username}/repos?sort=pushed&per_page=5`
        )
        return repos
          .filter((r) => r && !r.fork)
          .map((r) => ({
            repo: r.name,
            message: r.description || r.language || 'Repository',
            time: new Date(r.pushed_at),
          }))
      } catch {
        return []
      }
    }

    ;(async () => {
      let next = await loadCommits()
      if (!next.length) next = await loadRepos()
      if (cancelled || !next.length) return
      setItems(next)
      try {
        sessionStorage.setItem(
          `${CACHE_KEY}:${username}`,
          JSON.stringify({ ts: Date.now(), items: next })
        )
      } catch {
        // ignore storage errors
      }
    })()

    return () => { cancelled = true }
  }, [username])

  // Rotate through items
  useEffect(() => {
    if (items.length <= 1) return
    const iv = setInterval(() => {
      setVisibleIdx((i) => (i + 1) % items.length)
    }, 3000)
    return () => clearInterval(iv)
  }, [items.length])

  const timeAgo = (date) => {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  if (!items.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="font-display font-bold text-sm" style={{ color: accentColor }}>
          GitHub &rarr;
        </span>
      </div>
    )
  }

  const c = items[visibleIdx]

  return (
    <a
      href={`https://github.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full h-full no-underline"
      style={{ color: accentColor }}
    >
      <div className="flex flex-col items-center justify-center h-full gap-1.5 overflow-hidden">
        <span className="font-display font-bold text-xs" style={{ color: accentColor }}>
          GitHub &rarr;
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={visibleIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="text-center px-2"
          >
            <p className="font-mono text-[8px] opacity-50 truncate" style={{ color: accentColor }}>
              {c.repo} · {timeAgo(c.time)}
            </p>
            <p className="font-mono text-[9px] opacity-70 truncate leading-tight mt-0.5" style={{ color: accentColor }}>
              {c.message}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </a>
  )
}
