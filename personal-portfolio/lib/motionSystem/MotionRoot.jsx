'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { subscribeMotionMode, getMotionMode } from './capabilities'
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
  // Custom cursor intentionally disabled — keep native system cursor.
  useEffect(() => {
    document.documentElement.classList.remove('motion-cursor-on')
  }, [])
  const value = useMemo(() => mode, [mode])
  return <MotionModeContext.Provider value={value}>{children}</MotionModeContext.Provider>
}
