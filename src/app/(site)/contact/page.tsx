import { Metadata } from 'next'
import { ContactSection } from '@/components/site/site-contact-section'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with us for any inquiries or support.',
}

export default function Page() {
  return <ContactSection />
}
