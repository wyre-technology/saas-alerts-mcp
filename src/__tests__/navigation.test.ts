import { describe, it, expect, vi } from 'vitest';
import { getNavigationTools, DOMAINS } from '../domains/navigation.js';

vi.mock('../utils/client.js', () => ({
  getCredentials: () => null,
  getClient: () => { throw new Error('No credentials'); },
  resetClient: () => {},
}));

describe('Navigation', () => {
  it('has all expected domains', () => {
    expect(DOMAINS).toContain('events');
    expect(DOMAINS).toContain('customers');
    expect(DOMAINS).toContain('users');
    expect(DOMAINS).toContain('devices');
    expect(DOMAINS).toContain('billing');
    expect(DOMAINS).toContain('reports');
    expect(DOMAINS).toContain('partner');
  });

  it('exposes exactly seven domains', () => {
    expect(DOMAINS).toHaveLength(7);
  });

  it('returns two navigation tools', () => {
    const tools = getNavigationTools();
    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe('saas_alerts_navigate');
    expect(tools[1].name).toBe('saas_alerts_status');
  });

  it('navigate tool description mentions all tools are callable at any time', () => {
    const tools = getNavigationTools();
    const nav = tools.find(t => t.name === 'saas_alerts_navigate');
    expect(nav?.description).toContain('All tools are callable at any time');
  });

  it('navigate enum matches the DOMAINS list', () => {
    const tools = getNavigationTools();
    const nav = tools.find(t => t.name === 'saas_alerts_navigate');
    const props = nav?.inputSchema?.properties as { domain?: { enum?: string[] } } | undefined;
    expect(props?.domain?.enum).toEqual(DOMAINS);
  });

  it('both navigation tools have readOnlyHint: true', () => {
    const tools = getNavigationTools();
    for (const t of tools) {
      expect(t.annotations?.readOnlyHint).toBe(true);
    }
  });
});
