import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export type DomainName =
  | 'events'
  | 'customers'
  | 'users'
  | 'devices'
  | 'billing'
  | 'reports'
  | 'partner';

export type CallToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

/**
 * Minimal structural shape of an elicitation-capable MCP server. Kept loose so
 * both the real SDK `Server` and lightweight test mocks satisfy it without the
 * SDK's full (and frequently-changing) `Server` surface area.
 */
export interface ElicitationServer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elicitInput(...args: any[]): Promise<{ action: string; content?: Record<string, unknown> }>;
}

export interface DomainHandlerExtra {
  server?: ElicitationServer;
  [key: string]: unknown;
}

export interface DomainHandler {
  getTools(): Tool[];
  handleCall(
    name: string,
    args: Record<string, unknown>,
    extra?: DomainHandlerExtra
  ): Promise<CallToolResult>;
}
