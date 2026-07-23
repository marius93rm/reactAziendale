/** I test verificano cache, copie difensive, abort e fallimenti controllati. */
import { vi } from 'vitest';
import { createSimulatedOperationsApi } from './createSimulatedOperationsApi';

describe('createSimulatedOperationsApi', () => {
  it('usa la cache entro il TTL e permette un refresh forzato', async () => {
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    let now = 0;
    const api = createSimulatedOperationsApi({
      latencyMs: 0,
      cacheTtlMs: 1_000,
      now: () => now,
    });

    const first = await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
    });
    first.sites[0].name = 'Valore mutato dal consumer';
    const cached = await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
    });
    now = 1_001;
    await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
    });
    await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
      force: true,
    });
    api.invalidate('oggi');
    await api.getSnapshot('oggi', {
      signal: new AbortController().signal,
    });

    expect(cached.sites[0].name).toBe('Sede Torino');
    expect(timeoutSpy).toHaveBeenCalledTimes(4);
    timeoutSpy.mockRestore();
  });

  it('annulla una richiesta in corso', async () => {
    const api = createSimulatedOperationsApi({ latencyMs: 10_000 });
    const controller = new AbortController();
    const request = api.getSnapshot('oggi', { signal: controller.signal });

    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rende ripetibile il fallimento del primo salvataggio', async () => {
    const api = createSimulatedOperationsApi({
      latencyMs: 0,
      scenario: 'save-error-once',
    });
    const widget = {
      id: 'widget-test',
      title: 'Widget test',
      kind: 'alerts' as const,
      size: 'compact' as const,
    };

    await expect(api.saveWidget(widget)).rejects.toThrow(
      'Il backend ha rifiutato la modifica del widget.',
    );
    await expect(api.saveWidget(widget)).resolves.toEqual(widget);
  });
});
