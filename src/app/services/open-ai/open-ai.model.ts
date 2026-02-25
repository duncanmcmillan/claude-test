import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources';

export type { ChatCompletion };

export interface OpenAiRequestInput {
  params: ChatCompletionCreateParamsNonStreaming;
}

export interface OpenAiJobRef {
  jobId: string;
  completion?: ChatCompletion;
}

export type OpenAiJobStatus = 'completed' | 'pending' | 'failed';

export interface OpenAiStatusResponse {
  jobId: string;
  status: OpenAiJobStatus;
}

export interface OpenAiResult {
  jobId: string;
  completion: ChatCompletion;
}

export interface OpenAiServiceError {
  message: string;
  code?: string | null;
  status?: number;
}
