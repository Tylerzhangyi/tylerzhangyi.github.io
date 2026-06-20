'use client'

import { resolveAssetUrl } from '@/lib/assets'

const PACMAN_SHEET = resolveAssetUrl('photos/boot/pacman-sheet.png')

export default function PixelPacman({ className = '' }) {
  return (
    <div
      className={`pixel-pacman-sprite ${className}`.trim()}
      style={{ backgroundImage: `url("${PACMAN_SHEET}")` }}
      aria-hidden="true"
    />
  )
}
