import { playGrowFromGround } from './growFromGround'

/** My / Project 分屏标题：与 Blog 同款从地面长出 */
export function playSplitTitleEntrance({ leftEl, rightEl }) {
  return playGrowFromGround(
    [
      { el: leftEl, origin: 'left bottom', scaleFrom: 0.6, yFromRatio: 0.32 },
      { el: rightEl, origin: 'right bottom', scaleFrom: 0.6, yFromRatio: 0.32 }
    ],
    {
      durationMs: 2600,
      smooth: 0.095
    }
  )
}
