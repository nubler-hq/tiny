---
description: "Guidelines for writing technical documentation articles in the SaaS Boilerplate"
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "Guidelines for writing technical documentation articles in the SaaS Boilerplate"
---

# Docs Articles Guidelines

This document provides comprehensive guidelines for writing technical documentation articles in the SaaS Boilerplate. These articles are designed to help developers and users understand, implement, and troubleshoot features in a clear, structured way.

## Purpose

Docs articles serve as the primary technical reference for the SaaS Boilerplate ecosystem. They should:
- Provide step-by-step guidance for implementation
- Explain concepts with practical examples
- Include troubleshooting and best practices
- Maintain consistency across the documentation
- Adapt to different audience technical levels

## Audience Mapping Process

**CRITICAL**: Before writing any docs article, you MUST consult the "Target Audience & Personas" section in PROJECT_MEMORY.md. This centralized section contains the definitive understanding of user personas, technical levels, and content preferences.

### Step 1: Review Centralized Personas
Check PROJECT_MEMORY.md for the complete personas mapping, including:
- Primary user personas and their technical proficiency
- Content consumption preferences
- Communication styles and language preferences
- Business context and success metrics

### Step 2: Determine Article Audience
Based on the centralized personas, determine if the article is for:
- **Developer Audience**: Full technical depth, code examples, API details
- **Business User**: Simplified explanations, focus on benefits, minimal technical jargon
- **Mixed Audience**: Layered content with expandable technical sections

### Step 3: Adapt Content Accordingly
- **For Developers**: Include code snippets, API references, configuration details
- **For Business Users**: Focus on workflows, benefits, visual guidance
- **For Mixed**: Use accordions/tabs to hide/show technical details based on persona preferences

### Step 4: Validate Against Personas
Ensure the article aligns with:
- Technical level expectations from personas
- Preferred language and communication style
- Content format preferences (video/text/docs)
- Business context and use cases

## Article Structure

All docs articles should follow this consistent structure:

```markdown
---
title: "Clear, Descriptive Title"
description: "Brief description (155 chars max) for SEO and previews"
---

[Introduction paragraph explaining what the article covers and why it's important]

## Before You Begin

[Prerequisites, requirements, or assumptions]

## [Main Section 1]

[Content with steps, examples, explanations]

## [Main Section 2]

[Continue with logical flow]

## Implementation Details

[Detailed technical implementation]

## Configuration

[Setup and configuration steps]

## Troubleshooting

[Common issues and solutions]

## Best Practices

[Recommendations and tips]

## See Also

- [Related articles with brief descriptions]
```

## Writing Guidelines

### Language and Tone
- **Technical but Accessible**: Use precise terminology but explain complex concepts
- **Active Voice**: "Configure the database" instead of "The database should be configured"
- **Action-Oriented**: Focus on what users will accomplish
- **Inclusive**: Avoid gender-specific language, use "you" to address the reader

### Content Organization
- **Progressive Disclosure**: Start simple, go deep
- **Logical Flow**: Follow the user's journey from concept to implementation
- **Modular Sections**: Each section should stand alone but connect to others
- **Cross-References**: Link to related concepts without overwhelming

### Code Examples
- **Production-Ready**: All code should work in real environments
- **Commented**: Explain complex logic inline
- **Multiple Languages**: Show examples in TypeScript, JavaScript, bash as appropriate
- **Error Handling**: Include proper error handling in examples

## Component Usage Guidelines

### Steps Component
Use for sequential processes:
```markdown
<Steps>
<Step>
[Step content]
</Step>
</Steps>
```

### Accordions
Use for optional/advanced content:
```markdown
<Accordions type="multiple">
<Accordion title="Advanced Configuration">
[Content]
</Accordion>
</Accordions>
```

### Tabs
Use for alternative approaches:
```markdown
<Tabs items={["Method A", "Method B"]}>
<Tab>
[Content A]
</Tab>
</Tabs>
```

### TypeTable
Use for configuration options or API parameters:
```markdown
<TypeTable
  type={{
    "OPTION_NAME": {
      description: "What it does",
      type: "string|boolean|number"
    }
  }}
/>
```

## Article Types and Templates

### Getting Started Articles
- Focus on setup and first use
- Include prerequisites prominently
- End with verification steps

### Feature Guides
- Explain what the feature does and why to use it
- Provide implementation steps
- Include configuration options

### API Documentation
- Clear parameter descriptions
- Request/response examples
- Error handling

### Troubleshooting Articles
- Common issues first
- Step-by-step solutions
- Prevention tips

## Quality Checklist

Before publishing, ensure:
- [ ] Frontmatter is complete and accurate
- [ ] Introduction clearly states the article's purpose
- [ ] Prerequisites are clearly listed
- [ ] Code examples are tested and working
- [ ] Links are valid and descriptive
- [ ] Content is free of typos and grammatical errors
- [ ] Article flows logically from basic to advanced
- [ ] Cross-references are appropriate and helpful
- [ ] Content matches the identified audience level

## Maintenance

- Update articles when features change
- Add new articles for new features
- Review and update cross-references regularly
- Monitor user feedback for improvement opportunities

## Project-Specific Considerations

When working on a customized SaaS Boilerplate project:

- **Adapt Language**: Use the project's preferred language from PROJECT_MEMORY.md
- **Match Branding**: Incorporate project-specific terminology and examples
- **Focus on Use Case**: Tailor examples to the project's specific SaaS domain
- **Update References**: Ensure all links and cross-references work in the custom project

## Examples

### Developer-Focused Article Structure
```
---
title: "Implementing Custom MCP Tools"
description: "Learn how to extend your SaaS with custom Model Context Protocol tools"
---

Custom MCP tools allow you to expose business logic beyond standard API endpoints...

## Before You Begin
- Familiarity with TypeScript and Igniter.js
- Running SaaS Boilerplate instance
- Redis configured

## Tool Architecture
[Technical explanation]

## Implementation
<Steps>
<Step>
[Code example]
</Step>
</Steps>

## Advanced Patterns
<Accordions>
<Accordion title="Error Handling">
[Technical details]
</Accordion>
</Accordions>
```

### Business User-Focused Article Structure
```
---
title: "Setting Up Team Notifications"
description: "Configure automated notifications for your team's activities"
---

Keep your team informed with real-time notifications about important events...

## Before You Begin
- Admin access to your account
- Team members added

## Basic Setup
[Simple steps with screenshots]

## Advanced Options
[Optional configurations in accordions]
```

This ensures content is accessible while maintaining technical accuracy.