import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, DomainHandlerExtra, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { ok, emptyGuard } from '../utils/results.js';

function getTools(): Tool[] {
  return [
    {
      name: 'saas_alerts_devices_list_mapped',
      description:
        'List devices that have been mapped (unified) to SaaS Alerts customer organizations.',
      annotations: {
        title: 'List mapped devices',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          organization_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Organization IDs to filter by',
          },
        },
        required: ['organization_ids'],
      },
    },
    {
      name: 'saas_alerts_devices_list_unmapped',
      description:
        'List devices that have NOT yet been mapped to a SaaS Alerts organization. ' +
        'Optionally filter by confidence score or whether mapping suggestions are available.',
      annotations: {
        title: 'List unmapped devices',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          organization_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Organization IDs to include in the search',
          },
          confidence: {
            type: 'number',
            description: 'Minimum confidence threshold (0–1) for mapping suggestions',
          },
          only_with_suggestions: {
            type: 'boolean',
            description: 'If true, return only devices that have at least one mapping suggestion',
          },
        },
        required: ['organization_ids'],
      },
    },
    {
      name: 'saas_alerts_devices_list_ignored',
      description: 'List devices that have been explicitly marked as ignored.',
      annotations: {
        title: 'List ignored devices',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          organization_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Organization IDs to filter by',
          },
        },
        required: ['organization_ids'],
      },
    },
    {
      name: 'saas_alerts_devices_list_orgs',
      description: 'List all device organizations visible to the authenticated partner.',
      annotations: {
        title: 'List device organizations',
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
    case 'saas_alerts_devices_list_mapped': {
      const data = await client.devices.listMapped(args.organization_ids as string[]);
      return emptyGuard(data, 'mapped devices');
    }

    case 'saas_alerts_devices_list_unmapped': {
      const opts: Record<string, unknown> = {
        organizationIds: args.organization_ids,
      };
      if (args.confidence !== undefined) opts.confidence = args.confidence;
      if (args.only_with_suggestions !== undefined) opts.onlyWithSuggestions = args.only_with_suggestions;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.devices.listUnmapped(opts as any);
      return emptyGuard(data, 'unmapped devices');
    }

    case 'saas_alerts_devices_list_ignored': {
      const data = await client.devices.listIgnored(args.organization_ids as string[]);
      return emptyGuard(data, 'ignored devices');
    }

    case 'saas_alerts_devices_list_orgs': {
      const data = await client.devices.listOrganizations();
      return emptyGuard(data, 'device organizations');
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
}

export const devicesHandler: DomainHandler = { getTools, handleCall };
