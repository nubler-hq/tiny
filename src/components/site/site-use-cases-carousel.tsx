'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Rocket,
  Code,
  Users,
  Building,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const useCases = [
  {
    id: 'startups',
    icon: Rocket,
    title: 'Demo Audience 1 (Replace with Your Target)',
    description:
      'This is a demo audience example. Replace with your actual target customer - describe their pain points, goals, and how your SaaS solves their problems.',
    action: 'Customize This CTA',
  },
  {
    id: 'solo-developers',
    icon: Code,
    title: 'Demo Audience 2 (Replace with Your Target)',
    description:
      'Another demo audience example. Replace with a different customer segment - explain their specific challenges and your unique value proposition for them.',
    action: 'Customize This CTA',
  },
  {
    id: 'agencies',
    icon: Users,
    title: 'Demo Audience 3 (Replace with Your Target)',
    description:
      'Third demo audience example. Replace with another customer segment - focus on their unique needs and how your SaaS delivers exceptional value.',
    action: 'Customize This CTA',
  },
  {
    id: 'enterprises',
    icon: Building,
    title: 'Demo Audience 4 (Replace with Your Target)',
    description:
      'Fourth demo audience example. Replace with your final target segment - highlight enterprise requirements, compliance needs, and scalability concerns.',
    action: 'Customize This CTA',
  },
]

export const SiteUseCasesCarousel = ({ className }: { className?: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % useCases.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + useCases.length) % useCases.length)
  }

  const getVisibleCards = () => {
    const visible: typeof useCases = []
    for (let i = 0; i < 4; i++) {
      const index = (currentIndex + i) % useCases.length
      visible.push(useCases[index])
    }
    return visible
  }

  return (
    <section
      className={cn('w-full py-16 px-4 sm:px-0', className)}
      aria-labelledby="usecases-heading"
    >
      <div className="container max-w-(--breakpoint-lg) mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2
            id="usecases-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-balance max-w-2xl"
          >
            Target Audience Examples (Customize for Your Market)
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-2">
            <AnimatePresence mode="wait">
              {getVisibleCards().map((useCase, index) => {
                const IconComponent = useCase.icon
                return (
                  <motion.div
                    key={`${useCase.id}-${currentIndex}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="group"
                    aria-roledescription="slide"
                    aria-label={`${useCase.title} use case`}
                  >
                    <div className="flex flex-col bg-card border rounded-md p-6 sm:p-8 h-full transition-all duration-300 min-h-[280px]">
                      {/* Icon */}
                      <div className="mb-8 sm:mb-16" aria-hidden="true">
                        <IconComponent className="size-6" />
                      </div>

                      {/* Content */}
                      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 grow">
                        <h3 className="text-sm sm:text-base font-semibold leading-tight">
                          {useCase.title}
                        </h3>
                        <p className="text-sm leading-relaxed opacity-70 line-clamp-3 sm:line-clamp-4">
                          {useCase.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm font-medium">
                          {useCase.action}
                        </span>
                        <button
                          className="flex items-center justify-center size-8 bg-white/20 rounded-full text-white hover:bg-gray-700 transition-colors group-hover:scale-110 transition-transform"
                          aria-label={`Learn more about ${useCase.title}`}
                        >
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-end gap-2 mt-8">
            <button
              onClick={goToPrev}
              className="flex items-center justify-center size-10 bg-white/15 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={goToNext}
              className="flex items-center justify-center size-10 bg-white/15 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
