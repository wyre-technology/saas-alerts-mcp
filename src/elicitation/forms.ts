import type { CallToolResult, ElicitationServer } from '../utils/types.js';
import { logger } from '../utils/logger.js';

/**
 * Ask the operator to confirm a write/destructive operation.
 * Fail-open: if the client doesn't support elicitation (or any error occurs),
 * proceed with the operation.
 *
 * @returns true  → proceed, false → cancelled by operator
 */
export async function confirmWrite(
  server: ElicitationServer | undefined,
  summary: string
): Promise<boolean> {
  if (!server) return true; // no server ref — fail open

  try {
    const result = await server.elicitInput({
      message: `${summary}\n\nProceed?`,
      requestedSchema: {
        type: 'object' as const,
        properties: {
          confirm: {
            type: 'boolean' as const,
            description: 'Set true to proceed, false to cancel.',
          },
        },
        required: ['confirm'],
      },
    });

    if (result?.action === 'accept' && result.content?.confirm === true) {
      return true;
    }
    if (result?.action === 'accept' && result.content?.confirm === false) {
      return false;
    }
    // declined / cancel / any other action → fail open
    return true;
  } catch (err) {
    logger.debug('Elicitation not supported or failed, proceeding', { err: (err as Error).message });
    return true;
  }
}

/**
 * Convenience: guard a destructive action with elicitation.
 * Returns a cancelled result if the operator said no, or null to proceed.
 */
export async function guardDestructive(
  server: ElicitationServer | undefined,
  summary: string
): Promise<CallToolResult | null> {
  const proceed = await confirmWrite(server, summary);
  if (!proceed) {
    return {
      content: [{ type: 'text' as const, text: 'Operation cancelled by operator.' }],
      isError: true,
    };
  }
  return null;
}
