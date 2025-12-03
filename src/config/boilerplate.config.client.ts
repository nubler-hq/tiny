export const AppConfig = {
  name: process.env.NEXT_PUBLIC_IGNITER_APP_NAME || 'SaaS Boilerplate',
  description:
    process.env.NEXT_PUBLIC_IGNITER_APP_DESCRIPTION ||
    'The fastest way to build your SaaS.A Next.js boilerplate for building great products.',
  basePath: process.env.NEXT_PUBLIC_IGNITER_APP_BASE_PATH || '/api/v1',
  url: process.env.NEXT_PUBLIC_IGNITER_APP_URL || 'http://localhost:3000',
  theme: process.env.NEXT_PUBLIC_IGNITER_APP_THEME || 'light',
  keywords: ['SaaS Boilerplate'],
  brand: {
    logo: {
      light: '/logo-light.svg',
      dark: '/logo-dark.svg',
    },
    icon: {
      light: '/icon-light.svg',
      dark: '/icon-dark.svg',
    },
    og: {
      image: 'https://demo.saas-boilerplate.vibedev.com.br/og-image',
      title: 'SaaS Boilerplate',
    },
  },
  creator: {
    name: 'Felipe Barcelos',
    email: 'felipe@igniterjs.com',
    url: 'https://igniterjs.com',
    role: 'Founder & CEO',
    image: '/creator-image.png',
    links: {
      github: 'https://github.com/felipebarcelospro',
      twitter: 'https://twitter.com/feldbarcelospro',
    },
  },
  links: {
    mail: 'team@igniterjs.com',
    site: process.env.NEXT_PUBLIC_IGNITER_APP_URL || 'http://localhost:3000',
    rss: '/rss',
    support: '/support',
    changelog: '/changelog',
    blog: '/blog',
    terms: '/terms',
    privacy: '/privacy',
    linkedin: 'https://www.linkedin.com/company/igniterjs',
    twitter: 'https://x.com/igniterjs',
    facebook: 'https://www.facebook.com/igniterjs',
    instagram: 'https://www.instagram.com/igniterjs',
    tiktok: 'https://www.tiktok.com/@igniterjs',
    threads: 'https://www.threads.net/@igniterjs',
  },
}
