import { McpServer } from '@/igniter.mcp'
import type { NextRequest } from 'next/server';

/**
 * Handles authentication for MCP (Model Context Protocol) requests by setting the organization ID as a Bearer token in the request headers.
 * 
 * This function extracts the `orgId` from the route parameters, modifies the incoming request to include an Authorization header,
 * and then delegates the request handling to the MCP server instance associated with the organization.
 * 
 * @param request - The incoming Next.js request object to be processed and forwarded.
 * @param params - The route context parameters containing the organization ID and transport type.
 * @returns A Promise that resolves to the response from the MCP server handler.
 * 
 * @example
 * ```typescript
 * const response = await authMcpHandler(request, { params: { orgId: '123', transport: 'http' } });
 * ```
 */
const authMcpHandler = async (request: NextRequest, { params }: RouteContext<'/mcp/[orgId]/[transport]'>) => {
    const { orgId } = await params;

    // Set the organization ID in the request headers
    request.headers.set('Authorization', `Bearer ${orgId}`);

    // Call the MCP server handler with the modified request
    return McpServer(orgId).handler(request);
}

/**
 * Export the handler for Next.js to handle both GET and POST requests,
 * which are used by different MCP transport methods (like SSE and WebSockets).
 */
export const GET = authMcpHandler
export const POST = authMcpHandler
export const DELETE = authMcpHandler
