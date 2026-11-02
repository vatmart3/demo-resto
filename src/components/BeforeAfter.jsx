import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

/** Comparateur avant/après : glisser au doigt, à la souris ou au clavier. */
export default function BeforeAfter({ avant, apres, labels, eager = false }) {
  const box = useRef(null)
  const [pos, setPos] = useState(50)
  const dragging = useRef(false)
  const touched = useRef(false)
  const inView = useInView(box, { once: true, margin: '-25%' })
  const reduced = useReducedMotion()

  // Indice visuel : le curseur balaie une fois à l'arrivée à l'écran
  useEffect(() => {
    if (!inView || reduced || touched.current) return
    const ctrl = animate(50, [50, 22, 78, 50], {
      duration: 2.2,
      ease: 'easeInOut',
      onUpdate: (v) => !touched.current && setPos(v),
    })
    return () => ctrl.stop()
  }, [inView, reduced])

  const fromEvent = (clientX) => {
    const r = box.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  const onDown = (ev) => {
    touched.current = true
    dragging.current = true
    box.current.setPointerCapture?.(ev.pointerId)
    fromEvent(ev.clientX)
  }
  const onMove = (ev) => dragging.current && fromEvent(ev.clientX)
  const onUp = () => (dragging.current = false)

  const onKey = (ev) => {
    const step = ev.shiftKey ? 10 : 4
    if (ev.key === 'ArrowLeft') setPos((p) => Math.max(0, p - step))
    else if (ev.key === 'ArrowRight') setPos((p) => Math.min(100, p + step))
    else if (ev.key === 'Home') setPos(0)
    else if (ev.key === 'End') setPos(100)
    else return
    touched.current = true
    ev.preventDefault()
  }

  const loading = eager ? 'eager' : 'lazy'

  return (
    <div
      ref={box}
      className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden bg-ink-2 [touch-action:pan-y]"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <img src={apres.src} alt={apres.alt} loading={loading} decoding="async" width="1200" height="900" draggable="false" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={avant.src} alt={avant.alt} loading={loading} decoding="async" width="1200" height="900" draggable="false" className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <span className="mono-label absolute left-2 top-2 bg-ink/85 px-1.5 py-0.5 text-[10px] text-paper">{labels.avant}</span>
      <span className="mono-label absolute right-2 top-2 bg-accent px-1.5 py-0.5 text-[10px] text-on-accent">{labels.apres}</span>

      {/* Poignée */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-accent" />
        <div
          role="slider"
          tabIndex={0}
          aria-label={labels.glisser}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          onKeyDown={onKey}
          className="pointer-events-auto absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center border-2 border-ink bg-accent text-on-accent"
        >
          <span aria-hidden="true" className="font-mono text-[13px] font-medium">◂▸</span>
        </div>
        <span className="mono-label absolute bottom-2 -translate-x-1/2 whitespace-nowrap bg-ink px-1.5 text-[9.5px] tabular text-accent">
          {Math.round(pos)}%
        </span>
      </div>
    </div>
  )
}
