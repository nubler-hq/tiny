import { IgniterMCPServer } from "@igniter-js/adapter-mcp-server"
import { igniter } from "./igniter"
import { LeadController } from "./features/lead/controllers/lead.controller"
import { SubmissionController } from "./features/submission/controllers/submission.controller"
import { AppConfig } from "./config/boilerplate.config.client"


/**
 * Create the MCP handler with the new API.
 * Context is automatically inferred from the router.
 */
export const McpServer = (organizationId: string) => {
  return IgniterMCPServer.create()
    .withServerInfo({ 
      name: AppConfig.name, 
      version: '1.0.0' 
    })
    .router(
      igniter.router({
        controllers: {
          lead: LeadController,
          submission: SubmissionController
        }
      })
    )
    .withAdapter({
      redisUrl: process.env.REDIS_URL!,
      basePath: `/mcp/${organizationId}`
    })
    .build()
}