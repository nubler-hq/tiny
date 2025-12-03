import { Tour } from 'onborda/dist/types'

export const WELCOME_TOUR: Tour = {
  tour: 'welcome_tour',
  steps: [
    {
      icon: <>📊</>,
      title: 'Overview',
      content: (
        <>
          This is your dashboard overview where you can monitor all your key
          metrics and activities at a glance.
        </>
      ),
      selector: '#sidebar_overview',
      side: 'right',
      showControls: true,
      pointerPadding: 10,
      pointerRadius: 10,
      // nextRoute: '/app/leads',
      // prevRoute: '/app',
    },
    {
      icon: <>👥</>,
      title: 'Leads Management',
      content: (
        <>
          Manage all your leads in one place. Track potential customers and
          their journey through your sales pipeline.
        </>
      ),
      selector: '#sidebar_leads',
      side: 'right',
      showControls: true,
      pointerPadding: 10,
      pointerRadius: 10,
      // nextRoute: '/app/submissions',
      // prevRoute: '/app',
    },
    {
      icon: <>📩</>,
      title: 'Submissions',
      content: (
        <>
          View and manage all form submissions from your customers in this
          section.
        </>
      ),
      selector: '#sidebar_submissions',
      side: 'right',
      showControls: true,
      pointerPadding: 10,
      pointerRadius: 10,
      // nextRoute: '/app/integrations',
      // prevRoute: '/app/leads',
    },
    {
      icon: <>🔌</>,
      title: 'Integrations',
      content: (
        <>
          Connect your platform with other tools and services to streamline your
          workflow and expand functionality.
        </>
      ),
      selector: '#sidebar_integrations',
      side: 'right',
      showControls: true,
      pointerPadding: 10,
      pointerRadius: 10,
      // nextRoute: '/app/settings/account/profile',
      // prevRoute: '/app/submissions',
    },
    {
      icon: <>⚙️</>,
      title: 'Settings',
      content: (
        <>Customize your experience and manage your account preferences here.</>
      ),
      selector: '#sidebar_settings',
      side: 'right',
      showControls: true,
      pointerPadding: 10,
      pointerRadius: 10,
      // prevRoute: '/app/integrations',
    },
  ],
}
