---
description: "How to Create and Register Email Templates in SaaS Boilerplate"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "How to Create and Register Email Templates in SaaS Boilerplate"
---
# How to Create and Register Email Templates in SaaS Boilerplate

**Purpose:**  
This guide ensures every developer can efficiently create, test, maintain, and register new transactional e-mail templates, delivering a consistently professional experience for end users and rapid onboarding for your team. Follow every step to guarantee technical, visual, and UX quality across all SaaS Boilerplate e-mails.

---

## 1. Directory & File Structure

- Templates live at: `src/content/mails/`
- One `.tsx` file per template (ex: `welcome.email.tsx`, `invite-user.tsx`)
- Shared UI: Use/create modular components in `src/content/mails/components/`
- Name files and exported identifiers clearly by use-case.

---

## 2. Template Pattern & Prompt Engineering Checklist

Every template **must**:

- **Schema**: Define a strict Zod schema for all required/optional template data.
- **MailProvider.template**:  
  Wrap the template in `MailProvider.template({ subject, schema, render })`
- **Default Props**: Specify safe fallback values in the render function for good previews/tests.
- **Visual/UX:**
  - One clear `<ReactEmail.Heading>` aligned with purpose (and subject)
  - A short, unique `<ReactEmail.Preview>` (the email snippet for inboxes)
  - Use prebuilt components (`Button`, `Footer`, `Logo`)
  - Prefer Tailwind classes for styling
  - Use the black button for all CTAs (via the shared component)
- **Export Only the Render Function** as default!

**EXAMPLE STRUCTURE:**

```tsx
import * as ReactEmail from "@react-email/components";
import { z } from "zod";
import { Button } from "./components/button";
import { Footer } from "./components/footer";
import { AppConfig } from "@/config/boilerplate.config.client";
import { MailProvider } from "@/@saas-boilerplate/providers/mail";
import { Logo } from "@/components/ui/logo";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  // ...other fields
});

export const myEmailTemplate = MailProvider.template({
  subject: `Welcome to ${AppConfig.name}!`,
  schema,
  render: ({
    email = "user@email.com",
    name = "User",
    // ...other defaults
  }) => (
    <ReactEmail.Html>
      <ReactEmail.Head />
      <ReactEmail.Preview>
        Your account at {AppConfig.name} is ready!
      </ReactEmail.Preview>
      <ReactEmail.Tailwind>
        <ReactEmail.Body>
          <ReactEmail.Container>
            <Logo />
            <ReactEmail.Heading>Welcome to {AppConfig.name}</ReactEmail.Heading>
            <ReactEmail.Text>
              Hi{name ? `, ${name}` : ""}! Let’s get started...
            </ReactEmail.Text>
            <Button href="https://app.example.com/dashboard">
              Go to Dashboard
            </Button>
            <Footer email={email} />
          </ReactEmail.Container>
        </ReactEmail.Body>
      </ReactEmail.Tailwind>
    </ReactEmail.Html>
  ),
});

// Only export the render function for integration!
export default myEmailTemplate.render;
```

---

## 3. Registering Your Template with the MailProvider

- Import and add your template to the main MailProvider using a unique, descriptive key:

```ts
import { myEmailTemplate } from 'src/content/mails/my-email-template'
const mailProvider = MailProvider.initialize({
  ...,
  templates: {
    myTemplate: myEmailTemplate,
    // ...other templates
  }
})
```

---

## 4. Sending & Scheduling E-mails

**To send:**

```ts
await mailProvider.send({
  to: 'recipient@email.com',
  template: 'myTemplate',
  data: { email, name, ... }
})
```

_You may override the default subject by passing `subject: 'Custom Subject'` in send params._

**To schedule:**

```ts
await mailProvider.schedule(
  {
    to: '...',
    template: 'myTemplate',
    data: { ... },
  },
  new Date(Date.now() + 3600 * 1000) // 1 hour in the future
)
```

---

## 5. Best Practices & Common Pitfalls

- Make subjects/headings actionable and relevant (not generic, not salesy).
- Schema and render props must match 1:1 (define all used fields).
- CTA: Always use the shared Button component (black/white default); text clear (“Get Started”, “View Plans”, “Accept Invitation”)
- Preview must be unique, actionable, and concise—never generic.
- All templates must work with default/fallback props for dev experience.
- Logo & Footer: maintain brand consistency.
- Componentize anything reused (put in `/components/`), never copy-paste UI.
- Accessibility: add alt texts, check color contrast, use semantic blocks.
- Remove ALL business logic from templates—only present UI and data.

---

## 6. MailProvider API & Advanced Patterns

- **MailProvider.template**: Accepts `{subject, schema, render}`. Returns template object.
- **MailProvider.initialize**: Instantiates the registry of templates and the adapter.
- **MailProvider.send**: Sends transactional emails programmatically by template + data.
- **MailProvider.schedule**: For drips, reminders, etc. (send later).

Refer to `src/@saas-boilerplate/providers/mail/` for interfaces, contracts, and advance integration.  
All templates are type-checked and rendered by ReactEmail, so **schema errors or import mistakes break the build**. Keep props, schema, and implementations always synchronized!

---

## 7. Troubleshooting

- Type errors: Check schema field names/optionality vs render.
- Button/Link issues: Use only string for href and check import.
- Broken style: Wrap sections/components, avoid inline <div> in templates—prefer Container/Section/Text from ReactEmail and Tailwind classes.
- If email isn’t sent: Confirm template is registered and all fields are provided in data.

---

## 8. Prompt Engineering for Template Copy

- Each subject, preview, heading, and CTA must be:  
  **Clear, specific, and aligned with the next best user action.**
- Use brand language, keep it concise, and avoid ambiguity in instructions or CTAs.
- When in doubt, **show, don’t tell**: Use explicit label (“Accept Invitation”, “Upgrade Plan”) not generic (“Click Here”).

---

## 9. References

- [src/@saas-boilerplate/providers/mail/mail.provider.tsx](mdc:../../src/@saas-boilerplate/providers/mail/mail.provider.tsx)
- [react.email docs](mdc:https:/react.email/docs)
- [zod.dev (schemas)](mdc:https:/zod.dev)
