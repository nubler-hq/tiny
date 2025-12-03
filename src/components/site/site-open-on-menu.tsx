'use client'

import Image from 'next/image'

import { useState, useEffect } from 'react'
import { Download, Copy, Github, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import { String } from '@/@saas-boilerplate/utils/string'

export function SiteOpenOnMenu() {
  const [markdown, setMarkdown] = useState('')
  const [articleTitle, setArticleTitle] = useState('content')
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  useEffect(() => {
    const contentElement = document.querySelector('.markdown-content')
    const titleElement = contentElement?.querySelector('h1')

    setMarkdown(contentElement?.textContent || '')
    if (titleElement?.textContent) {
      setArticleTitle(String.toSlug(titleElement.textContent))
    }
  }, [])

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown)
  }

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${articleTitle}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openInPlayground = (
    playground: 'github' | 'chatgpt' | 'claude' | 'grok' | 'gemini',
  ) => {
    const prompt = `Can you help me with this topic? Here is the documentation page I'm looking at: ${currentUrl}`
    const encodedPrompt = encodeURIComponent(prompt)

    const urls = {
      github: 'https://github.dev', // This requires a more specific implementation
      chatgpt: `https://chat.openai.com/?q=${encodedPrompt}`,
      claude: `https://claude.ai/?q=${encodedPrompt}`,
      grok: `https://grok.x.ai/search?q=${encodedPrompt}`, // Assuming a search endpoint, actual may vary
      gemini: `https://gemini.google.com/search?q=${encodedPrompt}`, // Assuming a search endpoint, actual may vary
    }

    window.open(urls[playground], '_blank')
  }

  const openInOptions = [
    {
      label: 'Download Markdown',
      icon: <Download className="size-3" />,
      action: downloadMarkdown,
    },
    {
      label: 'Open in GitHub',
      icon: <Github className="size-3" />,
      action: () => openInPlayground('github'),
    },
    {
      label: 'Open in ChatGPT',
      icon: (
        <Image
          src="https://svgl.app/library/openai.svg"
          alt="OpenAI Logo"
          width={16}
          height={16}
        />
      ),
      action: () => openInPlayground('chatgpt'),
    },
    {
      label: 'Open in Claude',
      icon: (
        <Image
          src="https://svgl.app/library/anthropic_black.svg"
          alt="Anthropic Logo"
          width={16}
          height={16}
          className="dark:invert"
        />
      ),
      action: () => openInPlayground('claude'),
    },
    {
      label: 'Open in Grok (X.ai)',
      icon: (
        <Image
          src="https://svgl.app/library/x.svg"
          alt="X.ai (Grok) Logo"
          width={16}
          height={16}
          className="dark:invert"
        />
      ),
      action: () => openInPlayground('grok'),
    },
    {
      label: 'Open in Gemini',
      icon: (
        <Image
          src="https://svgl.app/library/gemini.svg"
          alt="Gemini Logo"
          width={16}
          height={16}
        />
      ),
      action: () => openInPlayground('gemini'),
    },
  ]

  return (
    <motion.section
      className="flex flex-col gap-2"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-sm font-semibold mb-2">Read on</h3>
      </motion.header>
      <motion.main
        className="flex items-center space-x-2"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="show"
      >
        <Button variant="outline" onClick={copyMarkdown}>
          <Copy className="size-3 mr-2" />
          Copy Markdown
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="mx-0 px-0">
              Open
              <ChevronDown className="size-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {openInOptions.map((option, index) => (
              <DropdownMenuItem key={index} onClick={option.action}>
                {option.icon}
                <span className="ml-2">{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.main>
    </motion.section>
  )
}
