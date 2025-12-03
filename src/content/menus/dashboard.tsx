import {
  SettingsIcon,
  PuzzleIcon,
  SendIcon,
  HelpCircleIcon,
  Users2Icon,
  Layers2Icon,
} from "lucide-react";

export const dashboardSidebarMenu = {
  groups: [
    {
      id: "main-menu",
      name: "",
      menu: [
        {
          id: "sidebar_overview",
          title: "Overview",
          url: "/app",
          icon: Layers2Icon,
        },
        {
          id: "sidebar_leads",
          title: "Leads",
          url: "/app/leads",
          icon: Users2Icon,
        },
        {
          id: "sidebar_submissions",
          title: "Submissions",
          url: "/app/submissions",
          icon: SendIcon,
        },
        {
          id: "sidebar_integrations",
          title: "Apps",
          url: "/app/integrations",
          icon: PuzzleIcon,
        },
        {
          id: "sidebar_settings",
          title: "Settings",
          url: "/app/settings/account/profile",
          icon: SettingsIcon,
        },
      ],
    },
    {
      id: "support-menu",
      name: "Support",
      menu: [
        {
          id: "help-center",
          title: "Help Center",
          url: "/help",
          icon: HelpCircleIcon,
        },
        {
          id: "send-feedback",
          title: "Send Feedback",
          url: "/contact",
          icon: SendIcon,
        },
      ],
    },
  ],
};
