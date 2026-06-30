import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, DomainHandlerExtra, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { ok, emptyGuard } from '../utils/results.js';

function getTools(): Tool[] {
  return [
    {
      name: 'saas_alerts_users_get_msp',
      description:
        'Get the MSP user profile associated with the authenticated API key. ' +
        'Also used as a connectivity / credential check.',
      annotations: {
        title: 'Get MSP user',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'saas_alerts_users_list_partner',
      description: 'List all users associated with the authenticated partner account.',
      annotations: {
        title: 'List partner users',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'saas_alerts_users_list_by_customer',
      description: 'List all users belonging to a specific SaaS Alerts customer.',
      annotations: {
        title: 'List users by customer',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          customer_id: { type: 'string', description: 'Customer ID to list users for' },
        },
        required: ['customer_id'],
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
    case 'saas_alerts_users_get_msp': {
      const data = await client.users.getMspUser();
      return emptyGuard(data, 'MSP user');
    }

    case 'saas_alerts_users_list_partner': {
      const data = await client.users.listPartnerUsers();
      return emptyGuard(data, 'partner users');
    }

    case 'saas_alerts_users_list_by_customer': {
      const data = await client.users.listByCustomer(args.customer_id as string);
      return emptyGuard(data, 'users');
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
}

export const usersHandler: DomainHandler = { getTools, handleCall };
