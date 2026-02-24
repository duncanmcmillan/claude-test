import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OpenAiStore } from './open-ai.store';
import { OpenAiService } from './open-ai.service';
import type { OpenAiRequestInput, OpenAiJobRef, OpenAiResult, OpenAiServiceError } from './open-ai.model';
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources';

const mockCompletion: ChatCompletion = {
  id: 'chatcmpl-123',
  object: 'chat.completion',
  created: 1700000000,
  model: 'gpt-4o',
  choices: [
    { index: 0, message: { role: 'assistant', content: 'Hello!', refusal: null }, finish_reason: 'stop', logprobs: null },
  ],
  usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
};
const jobRef: OpenAiJobRef = { jobId: 'job-xyz', completion: mockCompletion };
const jobResult: OpenAiResult = { jobId: 'job-xyz', completion: mockCompletion };
const requestInput: OpenAiRequestInput = {
  params: { model: 'gpt-4o', messages: [{ role: 'user', content: 'Hi' }] } as ChatCompletionCreateParamsNonStreaming,
};

const mockService = { request: vi.fn(), status: vi.fn(), getResult: vi.fn() };

describe('OpenAiStore', () => {
  let store: InstanceType<typeof OpenAiStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: OpenAiService, useValue: mockService }],
    });
    store = TestBed.inject(OpenAiStore);
  });

  it('initialises with correct defaults', () => {
    expect(store.loading()).toBe(false);
    expect(store.jobRef()).toBeNull();
    expect(store.result()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.completionText()).toBeNull();
    expect(store.jobId()).toBeNull();
  });

  describe('submit() — full lifecycle', () => {
    it('stores jobRef and result in a single chain', () => {
      mockService.request.mockReturnValue(of(jobRef));
      mockService.getResult.mockReturnValue(of(jobResult));

      store.submit(requestInput);

      expect(store.jobRef()).toEqual(jobRef);
      expect(store.result()).toEqual(jobResult);
      expect(store.isLoading()).toBe(false);
      expect(store.hasResult()).toBe(true);
      expect(mockService.getResult).toHaveBeenCalledWith(jobRef);
    });

    it('exposes completionText from the result', () => {
      mockService.request.mockReturnValue(of(jobRef));
      mockService.getResult.mockReturnValue(of(jobResult));

      store.submit(requestInput);

      expect(store.completionText()).toBe('Hello!');
      expect(store.jobId()).toBe('job-xyz');
    });

    it('sets loading=true while request is in-flight (observable not yet resolved)', () => {
      // Use a never-resolving observable to freeze mid-flight
      mockService.request.mockReturnValue(new Observable(() => {}));

      store.submit(requestInput);

      expect(store.isLoading()).toBe(true);
      expect(store.result()).toBeNull();
    });

    it('sets error and clears loading when request() fails', () => {
      const error: OpenAiServiceError = { message: 'Rate limit', status: 429 };
      mockService.request.mockReturnValue(throwError(() => error));

      store.submit(requestInput);

      expect(store.error()).toEqual(error);
      expect(store.isLoading()).toBe(false);
      expect(store.hasError()).toBe(true);
    });

    it('sets error and clears loading when getResult() fails', () => {
      const error: OpenAiServiceError = { message: 'No completion found for jobId: job-xyz' };
      mockService.request.mockReturnValue(of(jobRef));
      mockService.getResult.mockReturnValue(throwError(() => error));

      store.submit(requestInput);

      expect(store.error()).toEqual(error);
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('reset()', () => {
    it('clears all state', () => {
      mockService.request.mockReturnValue(of(jobRef));
      mockService.getResult.mockReturnValue(of(jobResult));

      store.submit(requestInput);
      store.reset();

      expect(store.jobRef()).toBeNull();
      expect(store.result()).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.completionText()).toBeNull();
    });
  });
});
