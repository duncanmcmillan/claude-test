import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach, type MockInstance } from 'vitest';
import { OpenAiService } from './open-ai.service';
import type { OpenAiRequestInput, OpenAiJobRef } from './open-ai.model';
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources';

const mockCompletion: ChatCompletion = {
  id: 'chatcmpl-123',
  object: 'chat.completion',
  created: 1700000000,
  model: 'gpt-4o',
  choices: [
    {
      index: 0,
      message: { role: 'assistant', content: 'Hello world', refusal: null },
      finish_reason: 'stop',
      logprobs: null,
    },
  ],
  usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
};

const requestInput: OpenAiRequestInput = {
  params: {
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }],
  } as ChatCompletionCreateParamsNonStreaming,
};

describe('OpenAiService', () => {
  let service: OpenAiService;
  let createSpy: MockInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), OpenAiService],
    });
    service = TestBed.inject(OpenAiService);
    // Spy on the real client instance's create method to avoid live HTTP calls
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createSpy = vi.spyOn((service as any).client.chat.completions, 'create');
  });

  afterEach(() => vi.restoreAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('request()', () => {
    it('emits OpenAiJobRef with a jobId and the completion on success', async () => {
      createSpy.mockResolvedValue(mockCompletion);

      const result = await firstValueFrom(service.request(requestInput));

      expect(result.jobId).toMatch(/^[0-9a-f-]{36}$/); // UUID
      expect(result.completion).toEqual(mockCompletion);
      expect(createSpy).toHaveBeenCalledWith(requestInput.params);
    });

    it('emits OpenAiServiceError with message on generic Error', async () => {
      createSpy.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(firstValueFrom(service.request(requestInput)))
        .rejects.toMatchObject({ message: 'Rate limit exceeded' });
    });

    it('emits default message on non-Error rejection', async () => {
      createSpy.mockRejectedValue('unknown');

      await expect(firstValueFrom(service.request(requestInput)))
        .rejects.toMatchObject({ message: 'OpenAI request failed' });
    });
  });

  describe('status()', () => {
    it('returns completed status for any jobId', async () => {
      const result = await firstValueFrom(service.status('job-xyz'));

      expect(result).toEqual({ jobId: 'job-xyz', status: 'completed' });
    });
  });

  describe('getResult()', () => {
    it('emits OpenAiResult when jobRef has a completion', async () => {
      const jobRef: OpenAiJobRef = { jobId: 'job-xyz', completion: mockCompletion };

      const result = await firstValueFrom(service.getResult(jobRef));

      expect(result).toEqual({ jobId: 'job-xyz', completion: mockCompletion });
    });

    it('emits OpenAiServiceError when jobRef has no completion', async () => {
      const jobRef: OpenAiJobRef = { jobId: 'job-xyz' };

      await expect(firstValueFrom(service.getResult(jobRef)))
        .rejects.toMatchObject({ message: expect.stringContaining('job-xyz') });
    });
  });
});
