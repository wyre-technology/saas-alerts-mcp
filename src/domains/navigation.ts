import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { DomainName } from '../utils/types.js';

export const DOMAINS: DomainName[] = [
  'events',
  'customers',
  'users',
  'devices',
  'billing',
  'reports',
  'partner',
];

const DOMAIN_DESCRIPTIONS: Record<DomainName, string> = {
  events: 'Security event queries, counts, advanced Elasticsearch searches, scroll pagination, and recommended actions',
  customers: 'Customer CRUD, IP/country whitelist management, account-level whitelist configuration',
  users: 'MSP user profile, partner user list, users by customer',
  devices: 'Mapped/unmapped/ignored device enumeration, device organizations',
  billing: 'Billing details by date and billing date history',
  reports: 'List, get, create, and delete scheduled reports',
  partner: 'Partner profile and branding settings',
};

export function getNavigationTools(): Tool[] {
  return [
    {
      name: 'saas_alerts_navigate',
      description:
        'Browse a domain to see its available tools and descriptions. ' +
        'All tools are callable at any time — navigation is optional discovery, not a gate.',
      annotations: {
        title: 'Browse SaaS Alerts domain tools',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            enum: DOMAINS,
            description: `Domain to inspect. One of: ${DOMAINS.join(', ')}`,
          },
        },
        required: ['domain'],
      },
    },
    {
      name: 'saas_alerts_status',
      description:
        'Check connectivity to SaaS Alerts by fetching the authenticated MSP user. ' +
        'Returns the list of available domains and connection status.',
      annotations: {
        title: 'Check SaaS Alerts connectivity',
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

export { DOMAIN_DESCRIPTIONS };
