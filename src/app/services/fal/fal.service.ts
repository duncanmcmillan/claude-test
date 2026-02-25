import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { fal } from '@fal-ai/client';
import type { QueueStatus, InQueueQueueStatus } from '@fal-ai/client';
import type { FalJobInput, FalJobResult, FalServiceError } from './fal.model';

@Injectable({ providedIn: 'root' })
export class FalService {
  private readonly http = inject(HttpClient);

  constructor() {
    fal.config({
      credentials: (globalThis as Record<string, unknown>)['FAL_KEY'] as string ?? '',
      suppressLocalCredentialsWarning: true,
    });
  }

  request(jobInput: FalJobInput): Observable<InQueueQueueStatus> {
    return from(
      fal.queue.submit(jobInput.model, { input: jobInput.input })
    ).pipe(
      catchError((err: unknown) => {
        const error: FalServiceError = {
          message: err instanceof Error ? err.message : 'FAL submit failed',
        };
        return throwError(() => error);
      })
    );
  }

  status(requestId: string, model: string): Observable<QueueStatus> {
    return from(
      fal.queue.status(model, { requestId, logs: true })
    ).pipe(
      catchError((err: unknown) => {
        const error: FalServiceError = {
          message: err instanceof Error ? err.message : 'FAL status check failed',
          requestId,
        };
        return throwError(() => error);
      })
    );
  }

  getResult<T = Record<string, unknown>>(requestId: string, model: string): Observable<FalJobResult<T>> {
    return from(
      fal.queue.result<string>(model, { requestId }) as Promise<FalJobResult<T>>
    ).pipe(
      catchError((err: unknown) => {
        const error: FalServiceError = {
          message: err instanceof Error ? err.message : 'FAL result retrieval failed',
          requestId,
        };
        return throwError(() => error);
      })
    );
  }
}
