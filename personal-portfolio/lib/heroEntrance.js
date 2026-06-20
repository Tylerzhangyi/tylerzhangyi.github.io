import { playGrowFromGround, playRiseFade } from './growFromGround'

/**
 * Hero 双标题：Blog 同款从地面长出（scale + damp 惯性）
 */
export function playHeroEntrance({ leftEl, rightEl, descEl, onComplete }) {
  const cleanups = []

  cleanups.push(
    playGrowFromGround(
      [
        { el: leftEl, origin: 'left bottom', scaleFrom: 0.6, yFromRatio: 0.32 },
        { el: rightEl, origin: 'right bottom', scaleFrom: 0.6, yFromRatio: 0.32 }
      ],
      {
        durationMs: 2600,
        smooth: 0.095,
        onComplete: descEl ? undefined : onComplete
      }
    )
  )

  if (descEl) {
    cleanups.push(
      playRiseFade(descEl, {
        delayMs: 520,
        durationMs: 2200,
        smooth: 0.1,
        yFromRatio: 0.4,
        onComplete
      })
    )
  }

  return () => cleanups.forEach((fn) => fn?.())
}
