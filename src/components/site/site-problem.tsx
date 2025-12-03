'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function SiteProblem() {
  const [allMessages, setAllMessages] = useState<
    { text: string; align: 'start' | 'end'; rotate: number }[]
  >([])
  const [isTyping, setIsTyping] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  const messages = [
    {
      text: "Okay, new SaaS idea. Let's start...",
      align: 'start',
      rotate: -0.902,
    },
    { text: 'First, user authentication. Again.', align: 'end', rotate: 1.249 },
    {
      text: 'Need to handle multi-tenancy correctly...',
      align: 'start',
      rotate: -0.902,
    },
    {
      text: 'And what about Stripe subscriptions?',
      align: 'end',
      rotate: 1.249,
    },
    {
      text: "Don't forget role-based permissions.",
      align: 'start',
      rotate: -0.902,
    },
    { text: 'This is taking forever!', align: 'end', rotate: 1.249 },
    {
      text: 'I just want to build my actual product.',
      align: 'start',
      rotate: -0.902,
    },
    {
      text: 'There must be a boilerplate for this...',
      align: 'end',
      rotate: 1.249,
    },
    {
      text: 'Imagine skipping all this setup...',
      align: 'start',
      rotate: -0.902,
    },
    { text: 'That would be a game-changer!', align: 'end', rotate: 1.249 },
    {
      text: 'A solid foundation to build upon...',
      align: 'start',
      rotate: -0.902,
    },
    {
      text: 'Meet the SaaS Boilerplate!',
      align: 'end',
      rotate: 1.249,
    },
  ]

  useEffect(() => {
    if (messageIndex < messages.length) {
      const typingDelay = 800
      const messageAppearDelay = 2000

      const showTyping = setTimeout(
        () => {
          setIsTyping(true)
        },
        messageIndex === 0 ? 1000 : messageAppearDelay - typingDelay,
      )

      const showMessage = setTimeout(
        () => {
          setIsTyping(false)
          // @ts-expect-error - This is fine for the simulation
          setAllMessages((prev) => [...prev, messages[messageIndex]])
          setMessageIndex((prev) => prev + 1)
        },
        messageIndex === 0 ? 1000 + typingDelay : messageAppearDelay,
      )

      return () => {
        clearTimeout(showTyping)
        clearTimeout(showMessage)
      }
    }
  }, [messageIndex, messages]) // Re-run effect when messageIndex changes

  const visibleMessages = allMessages.slice(Math.max(0, allMessages.length - 4))

  // TypingIndicator component
  const TypingIndicator = ({ align }: { align: 'start' | 'end' }) => (
    <motion.div
      className={`rounded-2xl ${
        align === 'start'
          ? 'rounded-bl-none bg-white/20'
          : 'rounded-br-none bg-white/20'
      } px-4 py-2 text-content-primary relative ${
        align === 'start' ? 'self-start' : 'self-end'
      } shadow-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-1">
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: 'easeInOut',
            delay: 0.4,
          }}
        >
          .
        </motion.span>
      </div>
    </motion.div>
  )

  return (
    <section className="py-16 flex flex-col items-center">
      <div className="container max-w-(--breakpoint-lg)">
        <div className="bg-primary dark:bg-transparent dark:border text-white rounded-md px-6 py-12 flex flex-col items-center relative overflow-hidden">
          <div className="w-[360px] h-[300px] mx-auto -mt-8 mb-8 relative rounded-xl overflow-hidden">
            <div
              className="absolute w-full h-full px-4 bottom-0 flex flex-col justify-end gap-5 pb-2.5 mask-[linear-gradient(to_bottom,transparent_0%,black_90%)]"
              style={{ overflowAnchor: 'none' }}
            >
              {visibleMessages.map((message, index) => (
                <motion.div
                  key={index}
                  className={`rounded-2xl px-4 py-2 text-body-sm-emphasis text-content-primary relative text-left text-pretty shadow-sm ${
                    message.align === 'start'
                      ? 'rounded-bl-none bg-white/20 self-start'
                      : 'rounded-br-none bg-white/20 self-end'
                  }`}
                  style={{
                    opacity: 1,
                    transform: `rotate(${message.rotate}deg)`,
                    transformOrigin: '50% 50% 0px',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="transition-colors ease-in-out whitespace-nowrap text-content-primary/100">
                    <div
                      style={{
                        height: 'auto',
                        width: 'fit-content',
                        transition:
                          'width 500ms ease-out, height 500ms ease-out',
                        overflow: 'hidden',
                      }}
                    >
                      <div className="w-fit">{message.text}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && messageIndex < messages.length && (
                // @ts-expect-error - Expected
                <TypingIndicator align={messages[messageIndex].align} />
              )}
            </div>
          </div>
          <div className="max-w-[588px] mx-auto text-center items-center flex flex-col gap-3">
            <h2 className="text-2xl tracking-tighter font-bold max-w-lg">
              Building a SaaS from scratch is a maze
            </h2>
            <p className="text-xl leading-relaxed text-balance">
              You're drowning in boilerplate: authentication, multi-tenancy,
              billing, and user roles. Building the core features that make your
              product unique shouldn't mean reinventing the wheel every time.
              You need more than just code—you need a launchpad.
            </p>

            <Button
              variant="default"
              className="bg-white/10 w-fit my-8"
              asChild
            >
              <Link href="/auth">Skip the setup</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
