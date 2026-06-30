import { AsyncLocalStorage } from 'node:async_hooks';
import { SaasAlertsClient } from '@wyre-technology/node-saas-alerts';

export interface Credentials { apiKey: string; }

// Request-scoped credential store. In gateway mode the HTTP layer runs each
// request inside runWithCredentials({apiKey}); getCredentials() reads it.
// Falls back to process.env for stdio/single-tenant mode.
const credStore = new AsyncLocalStorage<Credentials>();

export function runWithCredentials<T>(creds: Credentials, fn: () => T): T {
  return credStore.run(creds, fn);
}

export function getCredentials(): Credentials | null {
  const scoped = credStore.getStore();
  if (scoped?.apiKey) return scoped;
  const apiKey = process.env.SAAS_ALERTS_API_KEY;
  if (!apiKey) return null;
  return { apiKey };
}

// Constructs a client from the request-scoped (or env) credentials. The client
// is cheap and holds no shared mutable state, so we build one per call — never
// a process-global singleton.
export function getClient(): SaasAlertsClient {
  const creds = getCredentials();
  if (!creds) {
    throw new Error('No SaaS Alerts credentials configured. Set SAAS_ALERTS_API_KEY.');
  }
  return new SaasAlertsClient({ apiKey: creds.apiKey });
}
