import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WavespeedStore, WAVESPEED_POLL_INTERVAL_MS } from './wavespeed.store';
import { WavespeedService } from './wavespeed.service';
import type {
  WavespeedRequestInput,
  WavespeedStatusResponse,
  WavespeedResult,
  WavespeedServiceError,
} from './wavespeed.model';

const predRef = { predictionId: 'pred-abc' };
const createdStatus: WavespeedStatusResponse = { id: 'pred-abc', status: 'created' };
const processingStatus: WavespeedStatusResponse = { id: 'pred-abc', status: 'processing' };
const completedStatus: WavespeedStatusResponse = {
  id: 'pred-abc',
  status: 'completed',
  outputs: ['https://cdn.wavespeed.ai/out.mp4'],
};
const failedStatus: WavespeedStatusResponse = { id: 'pred-abc', status: 'failed' };
const predResult: WavespeedResult = { predictionId: 'pred-abc', outputs: ['https://cdn.wavespeed.ai/out.mp4'] };
const jobInput: WavespeedRequestInput = { model: 'wavespeed-ai/flux-dev', input: { prompt: 'a cat' } };

const mockService = { request: vi.fn(), status: vi.fn(), getResult: vi.fn() };

describe('WavespeedStore', () => {
  let store: InstanceType<typeof WavespeedStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: WavespeedService, useValue: mockService }],
    });
    store = TestBed.inject(WavespeedStore);
  });

  it('initialises with correct defaults', () => {
    expect(store.loading()).toBe(false);
    expect(store.predictionId()).toBeNull();
    expect(store.result()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.isFailed()).toBe(false);
  });

  describe('submit() — full lifecycle', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('stores predictionId and starts loading after request returns', async () => {
      mockService.request.mockReturnValue(of(predRef));
      mockService.status.mockReturnValue(of(completedStatus));
      mockService.getResult.mockReturnValue(of(predResult));

      store.submit(jobInput);

      expect(store.isLoading()).toBe(true);
      expect(store.predictionId()).toBe('pred-abc');
    });

    it('polls through created/processing to completed then fetches result', async () => {
      mockService.request.mockReturnValue(of(predRef));
      mockService.status
        .mockReturnValueOnce(of(createdStatus))
        .mockReturnValueOnce(of(processingStatus))
        .mockReturnValueOnce(of(completedStatus));
      mockService.getResult.mockReturnValue(of(predResult));

      store.submit(jobInput);

      await vi.advanceTimersByTimeAsync(1); // → created
      expect(store.isProcessing()).toBe(true);

      await vi.advanceTimersByTimeAsync(WAVESPEED_POLL_INTERVAL_MS); // → processing
      await vi.advanceTimersByTimeAsync(WAVESPEED_POLL_INTERVAL_MS); // → completed

      expect(store.result()).toEqual(predResult);
      expect(store.isLoading()).toBe(false);
      expect(store.isCompleted()).toBe(true);
      expect(store.outputUrls()).toEqual(['https://cdn.wavespeed.ai/out.mp4']);
      expect(mockService.getResult).toHaveBeenCalledOnce();
    });

    it('sets error and stops when prediction fails', async () => {
      mockService.request.mockReturnValue(of(predRef));
      mockService.status.mockReturnValue(of(failedStatus));

      store.submit(jobInput);
      await vi.advanceTimersByTimeAsync(1);

      expect(store.isFailed()).toBe(true);
      expect(store.error()).toMatchObject({ message: expect.stringContaining('pred-abc') });
      expect(store.isLoading()).toBe(false);
      expect(mockService.getResult).not.toHaveBeenCalled();
    });

    it('sets error and stops when request() fails', async () => {
      const error: WavespeedServiceError = { message: 'Bad request' };
      mockService.request.mockReturnValue(throwError(() => error));

      store.submit(jobInput);

      expect(store.error()).toEqual(error);
      expect(store.isLoading()).toBe(false);
    });

    it('sets error when a status poll fails', async () => {
      const error: WavespeedServiceError = { message: 'Timeout', predictionId: 'pred-abc' };
      mockService.request.mockReturnValue(of(predRef));
      mockService.status.mockReturnValue(throwError(() => error));

      store.submit(jobInput);
      await vi.advanceTimersByTimeAsync(1);

      expect(store.error()).toEqual(error);
      expect(store.isLoading()).toBe(false);
    });

    it('sets error when getResult() fails after completion', async () => {
      const error: WavespeedServiceError = { message: 'Download failed', predictionId: 'pred-abc' };
      mockService.request.mockReturnValue(of(predRef));
      mockService.status.mockReturnValue(of(completedStatus));
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

    it('clears all state', async () => {
      mockService.request.mockReturnValue(of(predRef));
      mockService.status.mockReturnValue(of(completedStatus));
      mockService.getResult.mockReturnValue(of(predResult));

      store.submit(jobInput);
      await vi.advanceTimersByTimeAsync(1);
      store.reset();

      expect(store.predictionId()).toBeNull();
      expect(store.result()).toBeNull();
      expect(store.error()).toBeNull();
      expect(store.loading()).toBe(false);
    });
  });
});
