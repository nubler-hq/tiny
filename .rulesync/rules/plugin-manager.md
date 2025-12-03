---
description: "How to use Plugin Manager on SaaS Boilerplate."
targets: ["*"]
cursor: # cursor specific rules
  alwaysApply: false
  description: "How to use Plugin Manager on SaaS Boilerplate."
---
# Guide: Creating a Plugin

This guide provides a complete workflow for creating, registering, and implementing a new plugin using the Plugin Manager.

## 1. Objective

To create a type-safe, reusable plugin that integrates an external service (e.g., Slack, Discord, Mailchimp) into the SaaS Boilerplate, exposing its functionality through a standardized set of actions.

## 2. Core Concepts for Code Agents

-   **Plugin (`PluginManager.plugin`):** A self-contained module that defines its configuration schema (Zod), metadata (name, description, logo), and a set of `actions`.
-   **Action:** A function a plugin can perform (e.g., `send`, `subscribe`). Each action has its own input schema (Zod) and a `handler` that contains the implementation logic.
-   **PluginManager (`PluginManager.initialize`):** The central registry where all plugins are imported and made available to the application.
-   **Schema (`zod`):** The single source of truth for a plugin's configuration and its actions' inputs. The schema is used to auto-generate forms and provide end-to-end type safety.

## 3. Step-by-Step Workflow

### Step 1: Create the Plugin File
1.  Create a new file in `src/plugins/`.
2.  Name it descriptively, e.g., `my-service.plugin.ts`.

### Step 2: Define the Plugin Structure
Use the following template as the foundation for your plugin. This structure is optimized for clarity and type safety.

```typescript
// src/plugins/my-service.plugin.ts
import { PluginManager } from '@/@saas-boilerplate/providers/plugin-manager';
import { z } from 'zod';

// 1. Define the configuration schema for the plugin
const MyServiceConfigSchema = z.object({
  apiKey: z.string().describe('API Key for My Service'),
  apiSecret: z.string().describe('API Secret for My Service'),
});

// 2. Define the plugin using PluginManager.plugin
export const myService = PluginManager.plugin({
  // --- Core Properties ---
  slug: 'my-service',
  name: 'My Service',
  schema: MyServiceConfigSchema,

  // --- Metadata for UI ---
  metadata: {
    verified: false,
    published: true,
    description: 'This plugin integrates with My Service to do amazing things.',
    category: 'automation', // e.g., 'notifications', 'marketing', 'analytics'
    developer: 'SaaS Boilerplate',
    website: 'https://myservice.com',
    logo: 'https://myservice.com/logo.png',
    screenshots: [],
    links: {
      install: 'https://myservice.com/app/install',
      guide: 'https://docs.myservice.com',
    },
  },

  // --- Actions ---
  actions: {
    // Action 1: Do Something
    doSomething: {
      name: 'Do Something',
      // Input schema for this specific action
      schema: z.object({
        targetId: z.string(),
        message: z.string(),
      }),
      // The handler contains the core logic
      handler: async ({ config, input }) => {
        // Type-safe access to config and input
        const { apiKey, apiSecret } = config;
        const { targetId, message } = input;

        // TODO: Implement the API call to My Service
        // const client = new MyServiceClient({ apiKey, apiSecret });
        // const result = await client.performAction(targetId, message);

        // Always return a consistent response
        try {
          // ... API call logic
          return { success: true, data: { messageId: '123' } };
        } catch (error) {
          console.error(`[MyService Plugin] Error in doSomething:`, error);
          return { success: false, error: 'Failed to perform action.' };
        }
      },
    },
    // Add more actions here...
  },
});
```

### Step 3: Register the Plugin
1.  Open `src/providers/plugin-manager.ts`.
2.  Import your newly created plugin.
3.  Add it to the `plugins` object in the `PluginManager.initialize` call.

```typescript
// src/providers/plugin-manager.ts
import { PluginManager } from '@/@saas-boilerplate/providers/plugin-manager';
import { slack } from '@/plugins/slack.plugin';
import { myService } from '@/plugins/my-service.plugin'; // 1. Import

export const PluginProvider = PluginManager.initialize({
  plugins: {
    slack,
    myService, // 2. Register
    // ... other plugins
  },
});
```

### Step 4: Implement Usage in the Application
To use the plugin's actions, you will typically fetch an organization's saved configuration from the database and then execute the action.

```typescript
// Example usage in a server-side component or API route
import { PluginProvider } from '@/providers/plugin-manager';
import { db } from '@/providers/prisma';

async function triggerMyServiceAction(organizationId: string) {
  // 1. Fetch the saved integration configuration for the organization
  const integration = await db.integration.findFirst({
    where: { organizationId, slug: 'my-service' },
  });

  if (!integration || !integration.enabled) {
    throw new Error('My Service integration is not enabled for this organization.');
  }

  // 2. The config is stored as a JSON string, so parse it
  const config = JSON.parse(integration.config);

  // 3. Get the plugin definition
  const myServicePlugin = PluginProvider.get('my-service');
  if (!myServicePlugin) throw new Error('Plugin not found');

  // 4. Initialize the plugin actions with the organization's config
  const actions = myServicePlugin.initialize(config);

  // 5. Execute the action with type-safe input
  const result = await actions.doSomething({
    targetId: 'user-123',
    message: 'Hello from SaaS Boilerplate!',
  });

  if (!result.success) {
    console.error('Action failed:', result.error);
  }

  return result;
}
```

## 4. Quality Checklist for Code Agents

Before finalizing a plugin, ensure it meets these criteria:

-   [ ] **File Naming:** The file is in `src/plugins/` and named `[slug].plugin.ts`.
-   [ ] **Type Safety:** All schemas (`config` and `action inputs`) are defined with Zod.
-   [ ] **Error Handling:** The `handler` for each action is wrapped in a `try/catch` block and returns a `{ success: boolean, ... }` object.
-   [ ] **Security:** No sensitive keys or secrets are hardcoded. The handler relies exclusively on the `config` object.
-   [ ] **Registration:** The plugin has been correctly imported and added to `PluginManager.initialize`.
-   [ ] **Metadata:** All metadata fields are filled out to ensure it displays correctly in the UI.
