import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, DomainHandlerExtra, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { ok, emptyGuard } from '../utils/results.js';
import { guardDestructive } from '../elicitation/forms.js';

function getTools(): Tool[] {
  return [
    {
      name: 'saas_alerts_customers_list',
      description: 'List all SaaS Alerts customers for the authenticated partner.',
      annotations: {
        title: 'List customers',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'saas_alerts_customers_get',
      description: 'Get a single SaaS Alerts customer by ID.',
      annotations: {
        title: 'Get customer',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          customer_id: { type: 'string', description: 'Customer ID' },
        },
        required: ['customer_id'],
      },
    },
    {
      name: 'saas_alerts_customers_create',
      description: 'Create a new SaaS Alerts customer for the authenticated partner.',
      annotations: {
        title: 'Create customer',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          body: { type: 'object', description: 'Customer creation payload (see SaaS Alerts API docs)' },
        },
        required: ['body'],
      },
    },
    {
      name: 'saas_alerts_customers_update',
      description: 'Update an existing SaaS Alerts customer by ID.',
      annotations: {
        title: 'Update customer',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          customer_id: { type: 'string', description: 'Customer ID to update' },
          body: { type: 'object', description: 'Fields to update' },
        },
        required: ['customer_id', 'body'],
      },
    },
    {
      name: 'saas_alerts_customers_delete',
      description:
        '⚠ DESTRUCTIVE — IRREVERSIBLE. Permanently deletes a SaaS Alerts customer and all associated data. ' +
        'This action cannot be undone. Confirm with the user before invoking.',
      annotations: {
        title: 'Delete customer (irreversible)',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          customer_id: { type: 'string', description: 'Customer ID to delete' },
        },
        required: ['customer_id'],
      },
    },
    {
      name: 'saas_alerts_customers_set_whitelists',
      description:
        '⚠ HIGH-IMPACT. Replace the IP/country whitelist for a customer. ' +
        'This overwrites the existing whitelist. Confirm with the user before invoking.',
      annotations: {
        title: 'Set customer whitelist',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          customer_id: { type: 'string', description: 'Customer ID' },
          body: { type: 'object', description: 'Whitelist payload (IPs and/or country codes)' },
        },
        required: ['customer_id', 'body'],
      },
    },
    {
      name: 'saas_alerts_customers_set_account_whitelists',
      description:
        '⚠ HIGH-IMPACT. Replace the account-level whitelist for a customer. ' +
        'This overwrites the existing account whitelist. Confirm with the user before invoking.',
      annotations: {
        title: 'Set customer account whitelist',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          customer_id: { type: 'string', description: 'Customer ID' },
          body: { type: 'object', description: 'Account whitelist payload' },
        },
        required: ['customer_id', 'body'],
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
    case 'saas_alerts_customers_list': {
      const data = await client.customers.list();
      return emptyGuard(data, 'customers');
    }

    case 'saas_alerts_customers_get': {
      const data = await client.customers.get(args.customer_id as string);
      return emptyGuard(data, 'customer');
    }

    case 'saas_alerts_customers_create': {
      const cancelled = await guardDestructive(
        extra?.server,
        `Create a new customer with the provided body. Confirm to proceed.`
      );
      if (cancelled) return cancelled;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.customers.create(args.body as any);
      return ok(data);
    }

    case 'saas_alerts_customers_update': {
      const cancelled = await guardDestructive(
        extra?.server,
        `Update customer ${args.customer_id} with the provided fields. Confirm to proceed.`
      );
      if (cancelled) return cancelled;
      const data = await client.customers.update(
        args.customer_id as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args.body as any
      );
      return ok(data);
    }

    case 'saas_alerts_customers_delete': {
      const cancelled = await guardDestructive(
        extra?.server,
        `Delete customer ${args.customer_id} — this is IRREVERSIBLE and removes all associated data.`
      );
      if (cancelled) return cancelled;
      const data = await client.customers.delete(args.customer_id as string);
      return ok(data);
    }

    case 'saas_alerts_customers_set_whitelists': {
      const cancelled = await guardDestructive(
        extra?.server,
        `Replace IP/country whitelist for customer ${args.customer_id}. This overwrites the current whitelist.`
      );
      if (cancelled) return cancelled;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.customers.setWhitelists(args.customer_id as string, args.body as any);
      return ok(data);
    }

    case 'saas_alerts_customers_set_account_whitelists': {
      const cancelled = await guardDestructive(
        extra?.server,
        `Replace account whitelist for customer ${args.customer_id}. This overwrites the current account whitelist.`
      );
      if (cancelled) return cancelled;
      const data = await client.customers.setAccountWhitelists(
        args.customer_id as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args.body as any
      );
      return ok(data);
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
}

export const customersHandler: DomainHandler = { getTools, handleCall };
