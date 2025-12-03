'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { MessageCircleHeart } from 'lucide-react'

const testimonials = [
  {
    title: 'Demo Testimonial 1 (Replace)',
    content:
      'This is a demo testimonial. Replace with a real customer story, focusing on the main challenge and the result achieved.',
    author: 'Customer Name',
    role: 'Role, Company',
    avatarSrc: 'https://randomuser.me/api/portraits/women/28.jpg',
    metrics: 'Replace with a key metric',
  },
  {
    title: 'Demo Testimonial 2 (Replace)',
    content:
      'Replace this with authentic feedback. Keep it concise and focused on the value you provide, like time saved or ROI.',
    author: 'Customer Name',
    role: 'Role, Company',
    avatarSrc: 'https://randomuser.me/api/portraits/men/45.jpg',
    metrics: 'Replace with a key metric',
  },
  {
    title: 'Demo Testimonial 3 (Replace)',
    content:
      'Replace with a genuine customer experience. Highlight your unique value proposition and the competitive advantage gained.',
    author: 'Customer Name',
    role: 'Role, Company',
    avatarSrc: 'https://randomuser.me/api/portraits/women/32.jpg',
    metrics: 'Replace with a key metric',
  },
]

export const SiteTestimonialsSection = ({
  className,
}: {
  className?: string
}) => {
  return (
    <section
      className={cn('w-full py-16 px-4 sm:px-0', className)}
      aria-labelledby="testimonials-heading"
    >
      <div className="container max-w-(--breakpoint-lg) mx-auto">
        <div className="flex flex-col">
          <MessageCircleHeart
            className="size-10 opacity-50 mb-4 stroke-1"
            fill="currentColor"
            fillOpacity={0.25}
            aria-hidden="true"
          />

          <h2
            id="testimonials-heading"
            className="w-full max-w-xl mb-8 text-balance text-2xl font-semibold leading-[1.2]! tracking-tight sm:text-3xl md:text-4xl"
          >
            Demo Testimonials (Replace with Your Customer Stories)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-card border overflow-hidden rounded-md divide-y sm:divide-y-0 sm:divide-x lg:divide-x">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="bg-transparent h-full p-6 flex justify-between flex-col min-h-[320px]"
              >
                <div className="flex flex-col">
                  <div className="mb-4">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      {item.metrics}
                    </span>
                  </div>
                  <Avatar className="size-10 rounded-md text-xs mb-4 text-primary shrink-0">
                    <AvatarImage
                      src={item.avatarSrc}
                      alt={`${item.author} avatar`}
                    />
                    <AvatarFallback>{item.author}</AvatarFallback>
                  </Avatar>
                  <h3 className="tracking-tight mb-2 text-sm sm:text-base">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {item.content}
                  </p>
                </div>
                <p className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-sm items-start sm:items-center mt-auto pt-6 border-t">
                  <span className="text-muted-foreground">By</span>
                  <span className="font-medium">{item.author}</span>
                  <span className="text-muted-foreground hidden sm:inline">
                    •
                  </span>
                  <span className="text-muted-foreground">{item.role}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
