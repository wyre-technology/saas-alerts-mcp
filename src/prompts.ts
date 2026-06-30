import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

export function registerPromptHandlers(server: Server): void {
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: 'alert-triage',
        description: 'Triage SaaS Alerts security events — query critical events, rank by impact, cross-ref recommended actions',
        arguments: [],
      },
      {
        name: 'customer-alert-summary',
        description: 'Summarise security alerts for a specific customer over a time window',
        arguments: [
          {
            name: 'customer_id',
            description: 'SaaS Alerts customer ID',
            required: true,
          },
        ],
      },
      {
        name: 'cross-tenant-anomaly',
        description: 'Use advanced Elasticsearch queries to find an event pattern across all customers',
        arguments: [
          {
            name: 'event_type',
            description: 'Event type to investigate across customers',
            required: false,
          },
        ],
      },
    ],
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'alert-triage':
        return {
          description: 'Triage SaaS Alerts security events across all customers',
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: [
                  'Triage SaaS Alerts security events across all managed customers.',
                  '',
                  'Use the available SaaS Alerts tools to:',
                  '1. Query critical events: saas_alerts_events_query with alert_status=critical',
                  '2. Also query medium-severity events: saas_alerts_events_query with alert_status=medium',
                  '3. Rank customers by alert volume and severity (most at-risk first)',
                  '4. Separate likely true positives from noise based on event type patterns',
                  '5. Fetch recommended actions: saas_alerts_recommended_actions',
                  '6. Map each top alert to the relevant recommended action',
                  '',
                  'Present a shift-ready triage summary:',
                  '- Top customers by alert severity/volume (table: customer, critical count, medium count)',
                  '- Top 5 alert types and their recommended remediation',
                  '- Any events that warrant immediate escalation',
                  '',
                  'NOTE: This is a read-only operation. Do not take remediation actions without operator confirmation.',
                ].join('\n'),
              },
            },
          ],
        };

      case 'customer-alert-summary':
        return {
          description: `Security alert summary for customer ${args?.customer_id ?? '<customer_id>'}`,
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: [
                  `Summarise security alerts for SaaS Alerts customer '${args?.customer_id ?? '<customer_id>'}'.`,
                  '',
                  'Use the available SaaS Alerts tools to:',
                  `1. Query all events for this customer: saas_alerts_events_query with customer_id=${args?.customer_id ?? '<customer_id>'}`,
                  '2. Break down by severity (critical / medium / low counts)',
                  '3. Identify the top event types',
                  '4. Check recommended actions: saas_alerts_recommended_actions',
                  '5. Note any trends (e.g. spikes, new event types)',
                  '',
                  'Present: customer overview, severity breakdown table, top event types,',
                  'recommended actions, and any notable anomalies.',
                  '',
                  'NOTE: Read-only. Do not remediate without operator approval.',
                ].join('\n'),
              },
            },
          ],
        };

      case 'cross-tenant-anomaly':
        return {
          description: `Cross-customer anomaly investigation${args?.event_type ? ` for event type: ${args.event_type}` : ''}`,
          messages: [
            {
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: [
                  `Investigate a cross-customer anomaly pattern in SaaS Alerts${args?.event_type ? ` for event type: '${args.event_type}'` : ''}.`,
                  '',
                  'Use the available SaaS Alerts tools to:',
                  '1. Use saas_alerts_events_query_advanced with an Elasticsearch query to find the pattern across customers',
                  `   Example query structure: { "query": { "term": { "eventType": "${args?.event_type ?? '<event_type>'}" } } }`,
                  '2. Group results by customer to identify which customers are affected',
                  '3. Compare timing — is this a simultaneous burst (coordinated attack) or gradual spread?',
                  '4. Check saas_alerts_recommended_actions for relevant mitigations',
                  '5. List affected customers and event counts',
                  '',
                  'Present: affected customer list, timeline analysis, pattern description,',
                  'and recommended response steps.',
                  '',
                  'NOTE: Read-only investigation. Escalate to operators for remediation.',
                ].join('\n'),
              },
            },
          ],
        };

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });
}
