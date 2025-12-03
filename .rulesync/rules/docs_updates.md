---
description: "Guidelines for writing update posts in the SaaS Boilerplate"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "Guidelines for writing update posts in the SaaS Boilerplate"
---

# Updates Documentation Guidelines

This document provides guidelines for writing update posts in the SaaS Boilerplate. These posts are designed to inform end-users about new features, improvements, and changes in your SaaS application.

## Purpose

Update posts serve as a changelog for your users, highlighting new capabilities and enhancements. They should be written in English, focused on user benefits rather than technical details, and follow a consistent structure for easy reading.

## Structure

Each update post should follow this format:

```markdown
---
title: "Feature Name: Brief Description"
cover: "/images/help-center/feature-category/image.jpg"
---

We're excited to introduce [Feature Name], a powerful new feature that [brief user-focused description].

You can now [benefit statement]:

- **Key Feature 1**: Description of what it does for users.
- **Key Feature 2**: Description of what it does for users.
- **Key Feature 3**: Description of what it does for users.
- **Integration**: How it connects with other parts of the app.

[Optional: Brief explanation of how it works in practice.]

Ready to [call to action]? [Action instruction].
```

## Writing Guidelines

- **Language**: Use the preferred language from the "Target Audience & Personas" section in PROJECT_MEMORY.md
- **Audience**: Target end-users based on the personas defined in PROJECT_MEMORY.md. Focus on benefits and ease of use aligned with user expectations.
- **Tone**: Excited and positive, highlighting value propositions that resonate with identified personas
- **Length**: Keep concise - aim for 150-250 words.
- **Images**: Use relevant screenshots from `/images/help-center/`. If none exist, ask the developer if they have prepared images, or use browser tools to take screenshots directly (suggest improving editing for better visual appeal).
- **Order**: Posts appear in the order defined in `meta.json`.

## Project-Specific Considerations

When working on a customized SaaS Boilerplate project:

- **Adapt Content**: Tailor posts to your specific SaaS use case, not the generic boilerplate features.
- **New Projects**: If this is a new project (check PROJECT_MEMORY.md for start date and customizations), consider whether example posts about the base SaaS Boilerplate should be removed. Ask the developer if they want to replace generic updates with project-specific ones.
- **Naming**: Use descriptive titles that reflect your SaaS's branding and features.
- **Consistency**: Maintain the same structure across all posts for a professional appearance.

## Maintenance

- Update `meta.json` to control post order.
- Remove outdated posts as needed.
- Ensure posts align with your project's evolution as tracked in PROJECT_MEMORY.md.