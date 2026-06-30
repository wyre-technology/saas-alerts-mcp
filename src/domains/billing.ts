import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, DomainHandlerExtra, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { ok, emptyGuard } from '../utils/results.js';

function getTools(): Tool[] {
  return [
    {
      name: 'saas_alerts_billing_get_details',
      description:
        'Retrieve billing details for a specific billing date. ' +
        'Use saas_alerts_billing_list_dates first to discover available dates.',
      annotations: {
        title: 'Get billing details',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          billing_date: {
            type: 'string',
            description: 'Billing date in YYYY-MM-DD format',
          },
        },
        required: ['billing_date'],
      },
    },
    {
      name: 'saas_alerts_billing_list_dates',
      description:
        'List all available billing dates for the authenticated partner. ' +
        'Use the returned dates as input to saas_alerts_billing_get_details.',
      annotations: {
        title: 'List billing dates',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

async function handleCall(
  name: string,
  args: Record<string, unknown>,
  _extra?: DomainHandlerExtra
): Promise<CallToolResult> {
  const client = getClient();

  switch (name) {
    case 'saas_alerts_billing_get_details': {
      const data = await client.billing.getDetails(args.billing_date as string);
      return emptyGuard(data, 'billing details');
    }

    case 'saas_alerts_billing_list_dates': {
      const data = await client.billing.listDates();
      return emptyGuard(data, 'billing dates');
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
}

export const billingHandler: DomainHandler = { getTools, handleCall };
