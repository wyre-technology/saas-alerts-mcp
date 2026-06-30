import type { CallToolResult } from './types.js';

/**
 * Wrap any successful API response as a MCP tool result.
 */
export function ok(data: unknown): CallToolResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Guard against empty API responses that could cause the LLM to hallucinate.
 * Returns isError:true with a clear "no <label> found" message when the data
 * is empty (null, undefined, empty array, empty object). Otherwise delegates
 * to ok().
 *
 * Pattern: mcp-empty-result-hallucination
 */
export function emptyGuard(data: unknown, label: string): CallToolResult {
  if (data === null || data === undefined) {
    return {
      content: [{ type: 'text' as const, text: `No ${label} found.` }],
      isError: true,
    };
  }
  if (Array.isArray(data) && data.length === 0) {
    return {
      content: [{ type: 'text' as const, text: `No ${label} found.` }],
      isError: true,
    };
  }
  if (
    typeof data === 'object' &&
    !Array.isArray(data) &&
    Object.keys(data as object).length === 0
  ) {
    return {
      content: [{ type: 'text' as const, text: `No ${label} found.` }],
      isError: true,
    };
  }
  return ok(data);
}
