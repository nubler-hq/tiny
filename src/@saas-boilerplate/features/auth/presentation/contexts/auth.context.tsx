'use client'

import { createContext, useContext } from 'react'
import { type Session } from '../../auth.interface'

type SessionContextType = {
  session: Session
}

const SessionContext = createContext({} as SessionContextType)

type SessionContextProps = {
  initialSession: Session
  children: React.ReactNode
}

export function SessionProvider({
  children,
  initialSession,
}: SessionContextProps) {
  return (
    <SessionContext.Provider value={{ session: initialSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useAuth must be used within a SessionProvider')
  }

  return context
}
