import type { DomainHandler, DomainName } from '../utils/types.js';

const _registry = new Map<DomainName, DomainHandler>();

export async function getDomainHandler(domain: DomainName): Promise<DomainHandler> {
  if (_registry.has(domain)) return _registry.get(domain)!;

  let handler: DomainHandler;
  switch (domain) {
    case 'events': {
      const m = await import('./events.js');
      handler = m.eventsHandler;
      break;
    }
    case 'customers': {
      const m = await import('./customers.js');
      handler = m.customersHandler;
      break;
    }
    case 'users': {
      const m = await import('./users.js');
      handler = m.usersHandler;
      break;
    }
    case 'devices': {
      const m = await import('./devices.js');
      handler = m.devicesHandler;
      break;
    }
    case 'billing': {
      const m = await import('./billing.js');
      handler = m.billingHandler;
      break;
    }
    case 'reports': {
      const m = await import('./reports.js');
      handler = m.reportsHandler;
      break;
    }
    case 'partner': {
      const m = await import('./partner.js');
      handler = m.partnerHandler;
      break;
    }
    default:
      throw new Error(`Unknown domain: ${domain}`);
  }

  _registry.set(domain, handler);
  return handler;
}
