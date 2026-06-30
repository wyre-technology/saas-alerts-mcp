import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainHandler, DomainHandlerExtra, CallToolResult } from '../utils/types.js';
import { getClient } from '../utils/client.js';
import { ok, emptyGuard } from '../utils/results.js';
import { guardDestructive } from '../elicitation/forms.js';

function getTools(): Tool[] {
  return [
    {
      name: 'saas_alerts_reports_list_scheduled',
      description: 'List all scheduled reports configured for the authenticated partner.',
      annotations: {
        title: 'List scheduled reports',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'saas_alerts_reports_get_scheduled',
      description: 'Get a specific scheduled report by its ID.',
      annotations: {
        title: 'Get scheduled report',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          report_id: { type: 'string', description: 'Scheduled report ID' },
        },
        required: ['report_id'],
      },
    },
    {
      name: 'saas_alerts_reports_create_scheduled',
      description: 'Create a new scheduled report.',
      annotations: {
        title: 'Create scheduled report',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          body: {
            type: 'object',
            description: 'Scheduled report configuration payload (see SaaS Alerts API docs)',
          },
        },
        required: ['body'],
      },
    },
    {
      name: 'saas_alerts_reports_delete_scheduled',
      description:
        '⚠ DESTRUCTIVE — IRREVERSIBLE. Permanently delete a scheduled report. ' +
        'This action cannot be undone. Confirm with the user before invoking.',
      annotations: {
        title: 'Delete scheduled report (irreversible)',
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          report_id: { type: 'string', description: 'Scheduled report ID to delete' },
        },
        required: ['report_id'],
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
    case 'saas_alerts_reports_list_scheduled': {
      const data = await client.reports.listScheduled();
      return emptyGuard(data, 'scheduled reports');
    }

    case 'saas_alerts_reports_get_scheduled': {
      const data = await client.reports.getScheduled(args.report_id as string);
      return emptyGuard(data, 'scheduled report');
    }

    case 'saas_alerts_reports_create_scheduled': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await client.reports.createScheduled(args.body as any);
      return ok(data);
    }

    case 'saas_alerts_reports_delete_scheduled': {
      const cancelled = await guardDestructive(
        extra?.server,
        `Delete scheduled report ${args.report_id} — this is IRREVERSIBLE.`
      );
      if (cancelled) return cancelled;
      const data = await client.reports.deleteScheduled(args.report_id as string);
      return ok(data);
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
}

export const reportsHandler: DomainHandler = { getTools, handleCall };
