import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FalService } from './fal.service';
import { fal } from '@fal-ai/client';
import type { InQueueQueueStatus, QueueStatus } from '@fal-ai/client';
import type { FalJobInput, FalJobResult } from './fal.model';

vi.mock('@fal-ai/client', () => ({
  fal: {
    config: vi.fn(),
    queue: {
      submit: vi.fn(),
      status: vi.fn(),
      result: vi.fn(),
    },
  },
}));

describe('FalService', () => {
  let service: FalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), FalService],
    });
    service = TestBed.inject(FalService);
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call fal.config on construction', () => {
    expect(fal.config).toHaveBeenCalled();
  });

  describe('request()', () => {
    const jobInput: FalJobInput = { model: 'fal-ai/flux', input: { prompt: 'test' } };
    const queued: InQueueQueueStatus = { request_id: 'req-123', status: 'IN_QUEUE', queue_position: 1, response_url: '', status_url: '', cancel_url: '' };

    it('emits InQueueQueueStatus on success', async () => {
      vi.mocked(fal.queue.submit).mockResolvedValue(queued);

      const result = await firstValueFrom(service.request(jobInput));

      expect(result).toEqual(queued);
      expect(fal.queue.submit).toHaveBeenCalledWith('fal-ai/flux', { input: { prompt: 'test' } });
    });

    it('emits FalServiceError with original message on Error', async () => {
      vi.mocked(fal.queue.submit).mockRejectedValue(new Error('Quota exceeded'));

      await expect(firstValueFrom(service.request(jobInput)))
        .rejects.toMatchObject({ message: 'Quota exceeded' });
    });

    it('emits default FalServiceError on non-Error rejection', async () => {
      vi.mocked(fal.queue.submit).mockRejectedValue('unexpected');

      await expect(firstValueFrom(service.request(jobInput)))
        .rejects.toMatchObject({ message: 'FAL submit failed' });
    });
  });

  describe('status()', () => {
    const queueStatus: QueueStatus = { status: 'IN_PROGRESS', request_id: 'req-123', response_url: '', status_url: '', cancel_url: '', logs: [] };

    it('emits QueueStatus on success', async () => {
      vi.mocked(fal.queue.status).mockResolvedValue(queueStatus);

      const result = await firstValueFrom(service.status('req-123', 'fal-ai/flux'));

      expect(result).toEqual(queueStatus);
      expect(fal.queue.status).toHaveBeenCalledWith('fal-ai/flux', { requestId: 'req-123', logs: true });
    });

    it('emits FalServiceError with requestId on failure', async () => {
      vi.mocked(fal.queue.status).mockRejectedValue(new Error('Not found'));

      await expect(firstValueFrom(service.status('req-123', 'fal-ai/flux')))
        .rejects.toMatchObject({ message: 'Not found', requestId: 'req-123' });
    });
  });

  describe('getResult()', () => {
    const jobResult: FalJobResult = { data: { url: 'https://example.com/img.png' }, requestId: 'req-123' };

    it('emits FalJobResult on success', async () => {
      vi.mocked(fal.queue.result).mockResolvedValue(jobResult);

      const result = await firstValueFrom(service.getResult('req-123', 'fal-ai/flux'));

      expect(result).toEqual(jobResult);
      expect(fal.queue.result).toHaveBeenCalledWith('fal-ai/flux', { requestId: 'req-123' });
    });

    it('emits FalServiceError with requestId on failure', async () => {
      vi.mocked(fal.queue.result).mockReset();
      vi.mocked(fal.queue.result).mockRejectedValue(new Error('Expired'));

      await expect(firstValueFrom(service.getResult('req-123', 'fal-ai/flux')))
        .rejects.toMatchObject({ message: 'Expired', requestId: 'req-123' });
    });
  });
});
