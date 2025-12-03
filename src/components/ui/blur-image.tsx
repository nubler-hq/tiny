'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/utils/cn'

export function BlurImage(props: ImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoading(false)
    const target = e.target as HTMLImageElement
    if (target.naturalWidth <= 16 && target.naturalHeight <= 16) {
      setError(true)
    }
  }

  if (!props.src || props.src === '') {
    return (
      <div
        className={cn(
          'w-full h-full bg-primary/5 flex items-center justify-center',
          props.className,
        )}
      ></div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'w-full h-full bg-primary/5 flex items-center justify-center',
          props.className,
        )}
      ></div>
    )
  }

  return (
    <Image
      {...props}
      alt={props.alt}
      className={cn(loading ? 'blur-[2px]' : 'blur-0', props.className)}
      onLoad={handleLoad}
      onError={() => {
        setError(true)
      }}
      unoptimized
    />
  )
}
