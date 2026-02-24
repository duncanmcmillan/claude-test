import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FalStore, FAL_POLL_INTERVAL_MS } from './fal.store';
import { FalService } from './fal.service';

// Prevent the real @fal-ai/client SDK from initialising when FalService is imported
vi.mock('@fal-ai/client', () => ({
  fal: { config: vi.fn(), queue: { submit: vi.fn(), status: vi.fn(), result: vi.fn() } },
}));
import type { FalJobInput, FalJobResult, FalServiceError } from './fal.model';
import type { InQueueQueueStatus, InProgressQueueStatus, CompletedQueueStatus } from '@fal-ai/client';

const BASE = { request_id: 'req-123', response_url: '', status_url: '', cancel_url: '' };
const inQueue: InQueueQueueStatus = { ...BASE, status: 'IN_QUEUE', queue_position: 1 };
const inProgress: InProgressQueueStatus = { ...BASE, status: 'IN_PROGRESS', logs: [] };
const completed: CompletedQueueStatus = { ...BASE, status: 'COMPLETED', logs: [] };
const jobResult: FalJobResult = { data: { url: 'https://cdn.fal.ai/img.png' }, requestId: 'req-123' };
const jobInput: FalJobInput = { model: 'fal-ai/flux', input: { prompt: 'a cat' } };

const mockService = { request: vi.fn(), status: vi.fn(), getResult: vi.fn() };

describe('FalStore', () => {
  let store: InstanceType<typeof FalStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: FalService, useValue: mockService }],
    });
    store = TestBed.inject(FalStore);
  });

  it('initialises with correct defaults', () => {
    expect(store.loading()).toBe(false);
    expect(store.requestId()).toBeNull();
    expect(store.result()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.hasResult()).toBe(false);
    expect(store.hasError()).toBe(false);
  });

  describe('submit() — full lifecycle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('sets loading=true and stores requestId/model immediately after request returns', async () => {
      mockService.request.mockReturnValue(of(inQueue));
      mockService.status.mockReturnValue(of(completed));
      mockService.getResult.mockReturnValue(of(jobResult));

      store.submit(jobInput);

      expect(store.isLoading()).toBe(true);
      expect(store.requestId()).toBe('req-123');
      expect(store.model()).toBe('fal-ai/flux');
      expect(store.isQueued()).toBe(true);
    });

    it('polls status until COMPLETED then fetches result', async () => {
      mockService.request.mockReturnValue(of(inQueue));
      mockService.status
        .mockReturnValueOnce(of(inProgress))
        .mockReturnValueOnce(of(completed));
      mockService.getResult.mockReturnValue(of(jobResult));

      store.submit(jobInput);

      await vi.advanceTimersByTimeAsync(1); // first poll → IN_PROGRESS
      expect(store.isInProgress()).toBe(true);
      expect(mockService.getResult).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(FAL_POLL_INTERVAL_MS); // second poll → COMPLETED
      expect(store.result()).toEqual(jobResult);
      expect(store.isLoading()).toBe(false);
      expect(store.hasResult()).toBe(true);
      expect(mockService.status).toHaveBeenCalledTimes(2);
      expect(mockService.getResult).toHaveBeenCalledOnce();
    });

    it('fetches result immediately when first status poll returns COMPLETED', async () => {
      mockService.request.mockReturnValue(of(inQueue));
      mockService.status.mockReturnValue(of(completed));
      mockService.getResult.mockReturnValue(of(jobResult));

      store.submit(jobInput);
      await vi.advanceTimersByTimeAsync(1);

      expect(mockService.status).toHaveBeenCalledTimes(1);
      expect(store.result()).toEqual(jobResult);
      expect(store.isLoading()).toBe(false);
    });

    it('sets error and stops when request() fails', async () => {
      const error: FalServiceError = { message: 'Auth failed' };
      mockService.request.mockReturnValue(throwError(() => error));

      store.submit(jobInput);

      expect(store.error()).toEqual(error);
      expect(store.isLoading()).toBe(false);
      expect(mockService.status).not.toHaveBeenCalled();
    });

    it('sets error and stops when a status poll fails', async () => {
      const error: FalServiceError = { message: 'Network error', requestId: 'req-123' };
      mockService.request.mockReturnValue(of(inQueue));
      mockService.status.mockReturnValue(throwError(() => error));

      store.submit(jobInput);
      await vi.advanceTimersByTimeAsync(1);

      expect(store.error()).toEqual(error);
      expect(store.isLoading()).toBe(false);
    });

    it('sets error and stops when getResult() fails', async () => {
      const error: FalServiceError = { message: 'Result expired', requestId: 'req-123' };
      mockService.request.mockReturnValue(of(inQueue));
      mockService.status.mockReturnValue(of(completed));
      mockService.getResult.mockReturnValue(throwError(() => error));

      store.submit(jobInput);
      await vi.advanceTimersByTimeAsync(1);

      expect(store.error()).toEqual(error);
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('reset()', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('clears all state back to initial values', async () => {
      mockService.request.mockReturnValue(of(inQueue));
      mockService.status.mockReturnValue(of(completed));
      mockService.getResult.mockReturnValue(of(jobResult));

      store.submit(jobInput);
      await vi.advanceTimersByTimeAsync(1);
      store.reset();

      expect(store.loading()).toBe(false);
      expect(store.requestId()).toBeNull();
      expect(store.result()).toBeNull();
      expect(store.error()).toBeNull();
    });
  });
});
