import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import OpenAI from 'openai';
import type {
  OpenAiRequestInput,
  OpenAiJobRef,
  OpenAiStatusResponse,
  OpenAiResult,
  OpenAiServiceError,
} from './open-ai.model';

@Injectable({ providedIn: 'root' })
export class OpenAiService {
  private readonly http = inject(HttpClient);

  private readonly client = new OpenAI({
    apiKey: (globalThis as Record<string, unknown>)['OPENAI_API_KEY'] as string ?? '',
    dangerouslyAllowBrowser: true,
  });

  request(jobInput: OpenAiRequestInput): Observable<OpenAiJobRef> {
    const jobId = crypto.randomUUID();

    return from(
      this.client.chat.completions.create(jobInput.params).then((completion) => ({
        jobId,
        completion,
      }))
    ).pipe(
      catchError((err: unknown) => {
        const error: OpenAiServiceError = {
          message: err instanceof Error ? err.message : 'OpenAI request failed',
          status: err instanceof OpenAI.APIError ? err.status : undefined,
          code: err instanceof OpenAI.APIError ? err.code : undefined,
        };
        return throwError(() => error);
      })
    );
  }

  status(jobId: string): Observable<OpenAiStatusResponse> {
    return of({ jobId, status: 'completed' as const });
  }

  getResult(jobRef: OpenAiJobRef): Observable<OpenAiResult> {
    if (!jobRef.completion) {
      const error: OpenAiServiceError = {
        message: `No completion found for jobId: ${jobRef.jobId}`,
      };
      return throwError(() => error);
    }

    return of({ jobId: jobRef.jobId, completion: jobRef.completion }).pipe(
      catchError((err: unknown) => {
        const error: OpenAiServiceError = {
          message: err instanceof Error ? err.message : 'OpenAI result retrieval failed',
        };
        return throwError(() => error);
      })
    );
  }
}
