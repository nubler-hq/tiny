import { ReactNode } from 'react'

export default function FormsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-background/80">
      {children}
    </div>
  )
}
