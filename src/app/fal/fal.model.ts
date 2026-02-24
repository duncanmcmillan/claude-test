export type { QueueStatus, InQueueQueueStatus, InProgressQueueStatus, CompletedQueueStatus, Result } from '@fal-ai/client';

export interface FalJobInput {
  model: string;
  input: Record<string, unknown>;
}

export interface FalJobResult<T = Record<string, unknown>> {
  data: T;
  requestId: string;
}

export interface FalServiceError {
  message: string;
  requestId?: string;
  status?: number;
}
