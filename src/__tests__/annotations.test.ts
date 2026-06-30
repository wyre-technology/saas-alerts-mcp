import { describe, it, expect } from 'vitest';
import { DOMAINS, getNavigationTools } from '../domains/navigation.js';
import { getDomainHandler } from '../domains/index.js';

describe('tool annotations', () => {
  it('every tool has annotations; destructive tools are marked', async () => {
    const tools = [...getNavigationTools()];
    for (const d of DOMAINS) {
      tools.push(...(await getDomainHandler(d)).getTools());
    }

    for (const t of tools) {
      expect(t.annotations, `${t.name} missing annotations`).toBeDefined();
      if (/delete|remove|disable|revoke|reset|offboard|archive/.test(t.name)) {
        expect(t.annotations?.destructiveHint, `${t.name} must be destructiveHint`).toBe(true);
        expect(
          (t.description ?? '').startsWith('⚠'),
          `${t.name} description must start with ⚠`
        ).toBe(true);
      }
    }
  });

  it('read-only tools do not carry ⚠ prefix', async () => {
    const tools = [...getNavigationTools()];
    for (const d of DOMAINS) {
      tools.push(...(await getDomainHandler(d)).getTools());
    }
    for (const t of tools) {
      if (t.annotations?.readOnlyHint === true) {
        expect(t.description ?? '').not.toContain('⚠');
      }
    }
  });

  it('saas_alerts_customers_delete and saas_alerts_reports_delete_scheduled are irreversible', async () => {
    const tools = [...getNavigationTools()];
    for (const d of DOMAINS) {
      tools.push(...(await getDomainHandler(d)).getTools());
    }
    const deleteTools = tools.filter(t => t.name.endsWith('_delete') || t.name.includes('_delete_'));
    expect(deleteTools.length).toBeGreaterThanOrEqual(2);
    for (const t of deleteTools) {
      expect(t.annotations?.destructiveHint).toBe(true);
      expect(t.description).toContain('⚠ DESTRUCTIVE');
    }
  });
});
