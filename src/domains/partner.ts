import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, DomainHandlerExtra, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { ok, emptyGuard } from '../utils/results.js';
import { guardDestructive } from '../elicitation/forms.js';

function getTools(): Tool[] {
  return [
    {
      name: 'saas_alerts_partner_get_profile',
      description: 'Get the partner profile associated with the authenticated API key.',
      annotations: {
        title: 'Get partner profile',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'saas_alerts_partner_update_branding',
      description:
        '⚠ HIGH-IMPACT. Update the partner branding settings (logo, colours, etc.). ' +
        'This overwrites existing branding. Confirm with the user before invoking.',
      annotations: {
        title: 'Update partner branding',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          body: {
            type: 'object',
            description: 'Branding payload (logoUrl, primaryColor, etc.)',
          },
        },
        required: ['body'],
      },
    },
  ];
}

async function handleCall(
  name: string,
  args: Record<string, unknown>,
  extra?: DomainHandlerExtra
): Promise<CallToolResult> {
  const client = getClient();

  switch (name) {
    case 'saas_alerts_partner_get_profile': {
      const data = await client.partner.getProfile();
      return emptyGuard(data, 'partner profile');
    }

    case 'saas_alerts_partner_update_branding': {
      const cancelled = await guardDestructive(
        extra?.server,
        'Update partner branding — this will overwrite existing branding settings.'
      );
      if (cancelled) return cancelled;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.partner.updateBranding(args.body as any);
      return ok(data);
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
}

export const partnerHandler: DomainHandler = { getTools, handleCall };
