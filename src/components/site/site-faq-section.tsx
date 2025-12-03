import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SITE_FAQ_ITEMS } from '@/content/site/site-faq-items'
import { cn } from '@/utils/cn'
import { HelpCircleIcon } from 'lucide-react'

export const SiteFaqSection = ({ className }: { className?: string }) => (
  <section
    className={cn(
      'w-full space-y-8 sm:space-y-12 py-12 sm:py-16 px-4 sm:px-0',
      className,
    )}
    aria-labelledby="faq-heading"
  >
    <div className="container max-w-(--breakpoint-lg) mx-auto flex gap-4 flex-col items-start text-left">
      <HelpCircleIcon
        className="size-10 mb-4 stroke-1 text-white opacity-80"
        fill="currentColor"
        fillOpacity={0.25}
        aria-hidden="true"
      />

      <h2
        id="faq-heading"
        className="text-balance text-left text-2xl font-semibold leading-[1.2]! tracking-tight sm:text-3xl md:text-4xl"
      >
        Demo FAQ (Customize for Your SaaS Questions)
      </h2>
    </div>

    <div className="container mx-auto max-w-(--breakpoint-lg)">
      <Accordion
        type="single"
        collapsible
        className="w-full bg-card border overflow-hidden rounded-lg"
        aria-label="Frequently Asked Questions"
      >
        {SITE_FAQ_ITEMS.map((item, index) => (
          <AccordionItem
            key={index}
            value={'index-' + index}
            className="bg-transparent overflow-hidden py-2"
          >
            <AccordionTrigger className="text-left hover:no-underline py-4 text-sm sm:text-base leading-tight [&[data-state=open]>svg]:rotate-180">
              <span className="pr-4 line-clamp-1">{item.question}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-0 text-muted-foreground text-sm sm:text-base leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
)
