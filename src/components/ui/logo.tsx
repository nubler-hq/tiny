// import { AppConfig } from '@/config/boilerplate.config.client'
import { AppConfig } from '@/config/boilerplate.config.client'
import { cn } from '@/utils/cn'
import { AudioWaveformIcon } from 'lucide-react'
// import { useTheme } from 'next-themes'

export function Logo(props: { size?: 'icon' | 'full', className?: string }) {
  // Tips: You can uncomment the following code to use an image logo.
  // const { resolvedTheme } = useTheme()

  // const modes = AppConfig.brand.logos
  // const currentMode = (resolvedTheme || AppConfig.theme) as 'dark' | 'light'
  // const logo = modes[size][currentMode]

  // return <img alt="Logo" className={cn('size-8', className)} src={logo} />

  return (
    <div className={cn('inline-flex items-center space-x-2', props.className)}>
      <AudioWaveformIcon className="size-4" />
      <span className="text-nowrap font-medium text-xs">{AppConfig.name}</span>
    </div>
  )
}
