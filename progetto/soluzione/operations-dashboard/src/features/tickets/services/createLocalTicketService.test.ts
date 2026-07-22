/** I test coprono errore singolo, retry e annullamento del servizio locale. */
import { describe, expect, it } from 'vitest';
import { createLocalTicketService } from './createLocalTicketService';

const emptyFilters = { query: '', status: 'tutti' } as const;

describe('createLocalTicketService', () => {
  it('fallisce una volta e completa la richiesta successiva', async () => {
    const service = createLocalTicketService({
      delay: 0,
      failFirstRequest: true,
    });

    await expect(
      service.list(emptyFilters, new AbortController().signal),
    ).rejects.toThrow('Il servizio ticket non è disponibile.');

    await expect(
      service.list(emptyFilters, new AbortController().signal),
    ).resolves.toHaveLength(12);
  });

  it('annulla una richiesta ancora in attesa', async () => {
    const service = createLocalTicketService({ delay: 1_000 });
    const controller = new AbortController();
    const request = service.list(emptyFilters, controller.signal);

    controller.abort();

    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
  });
});
