import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import { fetchQuotes, fetchReciteQuotes, likeQuote, type Quote } from './api'
import QuoteCard from './components/QuoteCard'
import { TokensIcon} from "@radix-ui/react-icons"


function App() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [index, setIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [useReciteAPI, setUseReciteAPI] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, width: 0 })
  const timerRef = useRef<number | null>(null)
  const tooltipTimerRef = useRef<number | null>(null)
  const controlRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const loadQuotes = async (useAPI: boolean) => {
    setLoading(true)
    try {
      const quotesData = useAPI ? await fetchReciteQuotes() : await fetchQuotes(1, 50)
      setQuotes(quotesData)
      setIndex(0) // Reset to first quote when switching sources
    } catch (error) {
      console.error('Failed to load quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuotes(useReciteAPI)
  }, [useReciteAPI])

  useEffect(() => {
    if (!autoplay || quotes.length === 0) return
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % quotes.length)
    }, 3500)
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [index, autoplay, quotes])

  // Cleanup tooltip timer on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current)
      }
    }
  }, [])

  const activeId = useMemo(() => quotes[index]?.id, [quotes, index])

  // Tooltip labels
  const tooltipLabels = [
    !useReciteAPI ? 'Recite API' : 'Local Quotes',
  ]

  // Enhanced tooltip positioning effect
  useEffect(() => {
    if (activeTooltip !== null && controlRef.current && tooltipRef.current) {
      const controlButtons = controlRef.current.children[activeTooltip] as HTMLElement
      const controlRect = controlRef.current.getBoundingClientRect()
      const buttonRect = controlButtons.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
    
      const left = buttonRect.left - controlRect.left + (buttonRect.width - tooltipRect.width) / 2
    
      setTooltipPosition({
        left: Math.max(0, Math.min(left, controlRect.width - tooltipRect.width)),
        width: tooltipRect.width
      })
    }
  }, [activeTooltip])

  // Tooltip hover handlers with small delay
  const handleTooltipEnter = (index: number) => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current)
    }
    tooltipTimerRef.current = window.setTimeout(() => {
      setActiveTooltip(index)
    }, 150)
  }

  const handleTooltipLeave = () => {
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current)
    }
    setActiveTooltip(null)
  }

  const handleLike = async (id: number) => {
    try {
      const newLikes = await likeQuote(id)
      setQuotes((qs) => qs.map(q => q.id === id ? { ...q, likes: newLikes } : q))
    } catch (e) {
      console.error('Failed to like quote:', e)
      // Show a simple alert for external API quotes
      if (e instanceof Error && e.message.includes('Cannot like quotes from external API')) {
        alert('Likes are not available for quotes from the external API')
      }
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden">
      <header className="topbar">
        <h1>Book Quote Shorts {!useReciteAPI ? '' : 'from Recite API'}</h1>
      </header>
      <main className="viewer" onClick={() => setIndex((index + 1) % Math.max(quotes.length, 1))}>
        {loading ? (
          <div className="empty">Loading quotes…</div>
        ) : quotes.length === 0 ? (
          <div className="empty">No quotes available</div>
        ) : (
          <QuoteCard 
            key={activeId} 
            quote={quotes[index]} 
            onLike={handleLike} 
            isActive={true}
            isExternalAPI={useReciteAPI}
          />
        )}
      </main>
      <div className="bottom-controls">
        {/* Enhanced Animated Tooltip */}
        <div className="relative">
          <AnimatePresence>
            {activeTooltip !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute left-0 right-0"
                style={{ 
                  top: '-31px',
                  pointerEvents: 'none',
                  zIndex: 50
                }}
              >
                <motion.div
                  ref={tooltipRef}
                  className="h-7 px-3 bg-[#131316] rounded-lg shadow-[0px_32px_64px_-16px_rgba(0,0,0,0.20)] shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.20)] shadow-[0px_8px_16px_-4px_rgba(0,0,0,0.24)] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.24)] shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.24)] shadow-[0px_0px_0px_1px_rgba(0,0,0,1.00)] shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.05)] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.12)] justify-center items-center inline-flex overflow-hidden"
                  initial={{ x: tooltipPosition.left }}
                  animate={{ x: tooltipPosition.left }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ width: 'auto' }}
                >
                  <p className="text-white/80 text-[13px] font-medium font-['Geist'] leading-tight whitespace-nowrap">
                    {tooltipLabels[activeTooltip]}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="control-buttons" ref={controlRef}>
          {/* This button now toggles between Local Quotes and Recite API */}
          <button 
            className={`control-btn ${!useReciteAPI ? 'active' : ''}`} 
            onClick={() => setUseReciteAPI(prev => !prev)}
            onMouseEnter={() => handleTooltipEnter(0)}
            onMouseLeave={handleTooltipLeave}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {!useReciteAPI ? (
                <>
                  <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor"><path d="M13.974,9.731c-.474,3.691-3.724,4.113-6.974,3.519"></path><path d="M3.75,16.25S5.062,4.729,16.25,3.75c-.56,.976-.573,2.605-.946,4.239-.524,2.011-2.335,2.261-4.554,2.261"></path><line x1="4.25" y1="1.75" x2="4.25" y2="6.75"></line><line x1="6.75" y1="4.25" x2="1.75" y2="4.25"></line></g>
                </>
              ) : (
                <TokensIcon />
              )}
            </svg>
            <span className="sr-only">{!useReciteAPI ? 'Local Quotes' : 'Recite API'}</span>
          </button>
          
          <button 
            className={`control-btn ${!autoplay ? 'active' : ''}`}
            onClick={() => setAutoplay(a => !a)}
            onMouseEnter={() => handleTooltipEnter(1)}
            onMouseLeave={handleTooltipLeave}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {autoplay ? (
                <path d="M6 4v10M12 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M4 3l10 6-10 6V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
            <span className="sr-only">{autoplay ? 'Pause' : 'Play'}</span>
          </button>
          
          <button 
            className="control-btn"
            onClick={() => setIndex((index - 1 + quotes.length) % Math.max(quotes.length, 1))}
            onMouseEnter={() => handleTooltipEnter(2)}
            onMouseLeave={handleTooltipLeave}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11.25 3.75L6 9l5.25 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="sr-only">Previous</span>
          </button>
          
          <button 
            className="control-btn"
            onClick={() => setIndex((index + 1) % Math.max(quotes.length, 1))}
            onMouseEnter={() => handleTooltipEnter(3)}
            onMouseLeave={handleTooltipLeave}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M6.75 3.75L12 9l-5.25 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="sr-only">Next</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App