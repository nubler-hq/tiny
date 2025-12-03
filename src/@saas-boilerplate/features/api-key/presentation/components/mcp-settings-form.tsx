'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { ArrowUpRightIcon, RefreshCwIcon, KeyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { tryCatch } from '@/@saas-boilerplate/utils/try-catch'
import { Url } from '@/@saas-boilerplate/utils/url'
import { String } from '@/@saas-boilerplate/utils/string'
import { AppConfig } from '@/config/boilerplate.config.client'
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import { api } from '@/igniter.client'
import type { ApiKey } from '../../api-key.interface'
import { ClaudeIcon } from '@/components/ui/icons/claude'
import { ChatGPTIcon } from '@/components/ui/icons/chatgpt'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface McpApiKey {
  id: string
  key: string
  description: string
  enabled: boolean
  createdAt: Date
}

interface McpSettingsFormProps {
  initialMcpKey?: McpApiKey | null
  organizationId: string
}

export function McpSettingsForm({ initialMcpKey, organizationId }: McpSettingsFormProps) {
  const { data: mcpKey, isLoading: isLoadingMcpKey, invalidate } = api.apiKey.getMcpKey.useQuery({
    initialData: initialMcpKey as ApiKey | null
  })

  const { mutate: regenerateMcpKey } = api.apiKey.regenerateMcpKey.useMutation({
    onSuccess: () => {
      toast.success('MCP key regenerated successfully!')
      invalidate()
    },
    onError: (error) => {
      const typedError = error as Error

      toast.error('Failed to regenerate MCP key', {
        description: typedError.message,
      })
    }
  })

  const mcpSseUrl = Url.get(`/mcp/${mcpKey?.key}/sse`)

  // Show only last 4 characters when masked
  const maskedKey = mcpKey ? `••••${mcpKey.key.slice(-4)}` : '••••••••••••••••••••••••••••••••'
  const maskedSseUrl = Url.get(`/mcp/${maskedKey}/sse`)

  return (
    <div className="space-y-9">
      {/* MCP URL Section */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">MCP Server URL</h3>
          <p className="text-muted-foreground">
            Use this URL to connect <strong>{String.toSlug(AppConfig.name)}</strong> to your favorite AI tools
          </p>
        </div>
        <div className="p-2 rounded-md border-2 bg-secondary">
          <div className="px-3 py-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">MCP Server endpoint for your organization</p>
            {mcpKey && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={regenerateMcpKey}
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center justify-between bg-background rounded-md border px-3 py-2">
            <Input value={maskedSseUrl} readOnly className="font-mono text-sm" />
            <CopyButton value={mcpSseUrl} aria-label="Copy MCP URL" />
          </div>
        </div>
      </section>

      {/* Setup Guides */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">Quick Setup Guides</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* ChatGPT */}
          <Card className="border-2 bg-secondary pb-0">
            <CardHeader className="p-3 flex space-y-0 flex-row items-center">
              <span className='size-8 flex items-center justify-center bg-background rounded-full border shadow-sm mr-2'>
                <ChatGPTIcon className='size-5' />
              </span>
              <CardTitle className="text-sm">ChatGPT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm p-4 m-2 mt-0 bg-background rounded-md border">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open ChatGPT settings</li>
                <li>Go to <strong>Connectors</strong></li>
                <li>Enable Dev Mode</li>
                <li>Click on <strong>Add Connector</strong></li>
                <li>Paste the URL above and save</li>
              </ol>
              <div className="pt-2">
                <Button asChild size="sm" variant="outline">
                  <a
                    href="https://help.openai.com/en/articles/11487775-connectors-in-chatgpt"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official Docs
                    <ArrowUpRightIcon className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Claude */}
          <Card className="border-2 bg-secondary">
            <CardHeader className="p-3 flex space-y-0 flex-row items-center">
              <span className='size-8 flex items-center justify-center bg-background rounded-full border shadow-sm mr-2'>
                <ClaudeIcon className='size-5' />
              </span>
              <CardTitle className="text-sm">Claude</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm p-4 m-2 mt-0 bg-background rounded-md border">
              <ol className="list-decimal pl-5 space-y-1">
                <li>Open Claude settings</li>
                <li>Go to <strong>Developer</strong></li>
                <li>Click on <strong>Edit Config</strong></li>
                <li>Just paste the JSON and save</li>
                <li>Restart Claude and start talking</li>
              </ol>
              <div className="pt-2">
                <Button asChild size="sm" variant="outline">
                  <a
                    href="https://modelcontextprotocol.io/docs/develop/connect-remote-servers"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official Docs
                    <ArrowUpRightIcon className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Code Agents Section */}
      <section className="space-y-4">
        <Accordion type="single" className='border-0 p-0' collapsible>
          <AccordionItem value="item-1" className='border-0 bg-background p-0'>
            <AccordionTrigger className="text-base font-semibold p-0 pb-4">
              For developers: Connect using JSON configuration
            </AccordionTrigger>
            <AccordionContent className='p-0 pt-4'>
              <Tabs defaultValue="cursor" className="w-full">
                <TabsList className="grid grid-cols-5 w-fit border-2">
                  <TabsTrigger className="data-[state=active]:bg-background data-[state=active]:border" value="cursor">Cursor</TabsTrigger>
                  <TabsTrigger className="data-[state=active]:bg-background data-[state=active]:border" value="cline">Cline</TabsTrigger>
                  <TabsTrigger className="data-[state=active]:bg-background data-[state=active]:border" value="windsurf">Windsurf</TabsTrigger>
                  <TabsTrigger className="data-[state=active]:bg-background data-[state=active]:border" value="roo">Roo Code</TabsTrigger>
                  <TabsTrigger className="data-[state=active]:bg-background data-[state=active]:border" value="copilot">Copilot</TabsTrigger>
                </TabsList>

                {/* Cursor */}
                <TabsContent value="cursor" className="space-y-4 mt-6 border p-4 rounded-md bg-secondary">
                  <div>
                    <h4 className="font-semibold mb-2">Cursor Setup</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create or update the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.cursor/mcp.json</code> file in your project root with the following configuration:
                    </p>
                  </div>
                  <CodeBlock>
                    <Pre className="px-4">
                      {`{
  "mcpServers": {
    "${String.toSlug(AppConfig.name)}": {
      "type": "http",
      "url": "${mcpSseUrl}"
    }
  }
}`}
                    </Pre>
                  </CodeBlock>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      After adding the configuration, enable the MCP server in Cursor Settings under <strong>MCP Servers</strong>.
                      You should see a green dot next to your server when it's connected successfully.
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href="https://docs.cursor.com/context/mcp"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Cursor MCP Documentation
                        <ArrowUpRightIcon className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </TabsContent>

                {/* Cline */}
                <TabsContent value="cline" className="space-y-4 mt-6 border p-4 rounded-md bg-secondary">
                  <div>
                    <h4 className="font-semibold mb-2">Cline Setup</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Open Cline settings in VS Code and navigate to the <strong>MCP Servers</strong> section. Add this server configuration:
                    </p>
                  </div>
                  <CodeBlock>
                    <Pre className="px-4">
                      {`{
  "mcpServers": {
    "${String.toSlug(AppConfig.name)}": {
      "type": "http",
      "url": "${mcpSseUrl}"
    }
  }
}`}
                    </Pre>
                  </CodeBlock>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Restart VS Code after configuration. Cline will automatically detect and connect to your MCP server.
                      You can verify the connection in the Cline output panel.
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href="https://github.com/cline/cline#mcp-servers"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Cline MCP Documentation
                        <ArrowUpRightIcon className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </TabsContent>

                {/* Windsurf */}
                <TabsContent value="windsurf" className="space-y-4 mt-6 border p-4 rounded-md bg-secondary">
                  <div>
                    <h4 className="font-semibold mb-2">Windsurf Setup</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.windsurf/mcp.json</code> file in your project root and add the configuration below:
                    </p>
                  </div>
                  <CodeBlock>
                    <Pre className="px-4">
                      {`{
  "mcpServers": {
    "${String.toSlug(AppConfig.name)}": {
      "type": "http",
      "url": "${mcpSseUrl}"
    }
  }
}`}
                    </Pre>
                  </CodeBlock>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Restart Windsurf to load the MCP server. The server will appear in the MCP servers list and should show as "Connected" when active.
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href="https://docs.codeium.com/windsurf/mcp"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Windsurf MCP Documentation
                        <ArrowUpRightIcon className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </TabsContent>

                {/* Roo Code */}
                <TabsContent value="roo" className="space-y-4 mt-6 border p-4 rounded-md bg-secondary">
                  <div>
                    <h4 className="font-semibold mb-2">Roo Code Setup</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Open Roo Code settings, navigate to <strong>MCP Servers</strong>, and add this server configuration:
                    </p>
                  </div>
                  <CodeBlock>
                    <Pre className="px-4">
                      {`{
  "mcpServers": {
    "${String.toSlug(AppConfig.name)}": {
      "type": "http",
      "url": "${mcpSseUrl}"
    }
  }
}`}
                    </Pre>
                  </CodeBlock>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Save the configuration and restart Roo Code. The MCP server will be available for use with AI-powered coding features.
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href="https://roocode.com/docs/mcp"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Roo Code MCP Documentation
                        <ArrowUpRightIcon className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </TabsContent>

                {/* GitHub Copilot */}
                <TabsContent value="copilot" className="space-y-4 mt-6 border p-4 rounded-md bg-secondary">
                  <div>
                    <h4 className="font-semibold mb-2">GitHub Copilot (VS Code) Setup</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.vscode/mcp.json</code> file in your project and add this configuration:
                    </p>
                  </div>
                  <CodeBlock>
                    <Pre className="px-4">
                      {`{
  "mcpServers": {
    "${String.toSlug(AppConfig.name)}": {
      "type": "http",
      "url": "${mcpSseUrl}"
    }
  }
}`}
                    </Pre>
                  </CodeBlock>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Open the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.vscode/mcp.json</code> file in VS Code and click <strong>Start</strong> next to your server.
                      The server will be available for GitHub Copilot Chat interactions.
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <a
                        href="https://code.visualstudio.com/docs/copilot/chat/mcp-servers"
                        target="_blank"
                        rel="noreferrer"
                      >
                        VS Code MCP Documentation
                        <ArrowUpRightIcon className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
