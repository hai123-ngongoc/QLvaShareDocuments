import { useEffect, useMemo, useState } from 'react'
import useRevealOnce from '../../hooks/useRevealOnce'

const iconThemes = {
  '📄': 'blue',
  '📚': 'green',
  '👥': 'purple',
}

function StatCard({ icon, value, label }) {
  const [cardRef, isVisible] = useRevealOnce({ threshold: 0.45 })
  const [displayValue, setDisplayValue] = useState(0)

  const { targetValue, suffix } = useMemo(() => {
    return {
      targetValue: Number(value.replace(/[^\d]/g, '')),
      suffix: value.replace(/[\d,\s]/g, ''),
    }
  }, [value])

  useEffect(() => {
    if (!isVisible) return undefined

    let animationFrameId
    const duration = 900
    const startTime = performance.now()

    const animateCount = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3

      setDisplayValue(Math.round(targetValue * easedProgress))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCount)
      }
    }

    animationFrameId = requestAnimationFrame(animateCount)

    return () => cancelAnimationFrame(animationFrameId)
  }, [isVisible, targetValue])

  const formattedValue = `${displayValue.toLocaleString()}${suffix}`

  return (
    <article className="stat-card px-6 items-center flex" ref={cardRef}>
      <span className={`stat-card__icon stat-card__icon--${iconThemes[icon] ?? 'blue'}`}>
        {icon}
      </span>
      <div>
        <strong className="stat-value text-slate-900 dark:text-white">
          {formattedValue}
        </strong>
        <span className="stat-label text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
    </article>
  )
}

export default StatCard
