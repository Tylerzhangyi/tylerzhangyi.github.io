'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { subscribeMotionMode, getMotionMode } from './capabilities'
import { createCursorController } from './primitives/cursor'
import './motion.css'

const MotionModeContext = createContext('mobileLite')

export function useMotionMode() {
  return useContext(MotionModeContext)
}

export default function MotionRoot({ children }) {
  const [mode, setMode] = useState(getMotionMode)
  useEffect(() => {
    return subscribeMotionMode(setMode)
  }, [])
  useEffect(() => {
    const host = document.createElement('div')
    host.className = 'motion-cursor-host'
    document.body.appendChild(host)
    const cursor = createCursorController(host)
    const enabled = mode === 'desktopFull'
    document.documentElement.classList.toggle('motion-cursor-on', enabled)
    cursor.setEnabled(enabled)
    return () => {
      cursor.destroy()
      host.remove()
      document.documentElement.classList.remove('motion-cursor-on')
    }
  }, [mode])
  const value = useMemo(() => mode, [mode])
  return <MotionModeContext.Provider value={value}>{children}</MotionModeContext.Provider>
}
