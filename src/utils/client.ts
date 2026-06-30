import { SaasAlertsClient } from '@wyre-technology/node-saas-alerts';
import { logger } from './logger.js';

let _client: SaasAlertsClient | null = null;
let _credKey: string | null = null;

export interface Credentials {
  apiKey: string;
}

export function getCredentials(): Credentials | null {
  const apiKey = process.env.SAAS_ALERTS_API_KEY;
  if (!apiKey) return null;
  return { apiKey };
}

export function getClient(): SaasAlertsClient {
  const creds = getCredentials();
  if (!creds) {
    throw new Error(
      'No SaaS Alerts credentials configured. Set SAAS_ALERTS_API_KEY.'
    );
  }

  const credKey = creds.apiKey;

  // Invalidate cache if credentials changed (gateway injects per-request)
  if (_client && _credKey === credKey) {
    return _client;
  }

  logger.debug('Initialising SaasAlertsClient');
  _client = new SaasAlertsClient({ apiKey: creds.apiKey });
  _credKey = credKey;
  return _client;
}

export function resetClient(): void {
  _client = null;
  _credKey = null;
}
