import { describe, it, expect, afterEach } from 'vitest';
import { getCredentials, runWithCredentials } from '../utils/client.js';

describe('request-scoped credentials', () => {
  afterEach(() => { delete process.env.SAAS_ALERTS_API_KEY; });

  it('prefers ALS-scoped creds over process.env', () => {
    process.env.SAAS_ALERTS_API_KEY = 'env-key';
    expect(getCredentials()).toEqual({ apiKey: 'env-key' });
    runWithCredentials({ apiKey: 'scoped-key' }, () => {
      expect(getCredentials()).toEqual({ apiKey: 'scoped-key' });
    });
    expect(getCredentials()).toEqual({ apiKey: 'env-key' }); // scope did not leak out
  });

  it('returns null when neither scope nor env set', () => {
    expect(getCredentials()).toBeNull();
  });
});
