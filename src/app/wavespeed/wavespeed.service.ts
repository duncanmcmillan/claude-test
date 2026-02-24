import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type {
  WavespeedRequestInput,
  WavespeedPredictionRef,
  WavespeedStatusResponse,
  WavespeedResult,
  WavespeedApiResponse,
  WavespeedServiceError,
} from './wavespeed.model';

@Injectable({ providedIn: 'root' })
export class WavespeedService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'https://api.wavespeed.ai/api/v3';

  private get headers(): HttpHeaders {
    const apiKey = (globalThis as Record<string, unknown>)['WAVESPEED_API_KEY'] as string ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${apiKey}` });
  }

  request(jobInput: WavespeedRequestInput): Observable<WavespeedPredictionRef> {
    return this.http
      .post<WavespeedApiResponse>(
        `${this.baseUrl}/${jobInput.model}`,
        jobInput.input,
        { headers: this.headers }
      )
      .pipe(
        map((response) => ({ predictionId: response.data.id })),
        catchError((err: unknown) => {
          const error: WavespeedServiceError = {
            message: err instanceof Error ? err.message : 'WaveSpeed request failed',
          };
          return throwError(() => error);
        })
      );
  }

  status(predictionId: string): Observable<WavespeedStatusResponse> {
    return this.http
      .get<WavespeedApiResponse>(
        `${this.baseUrl}/predictions/${predictionId}/result`,
        { headers: this.headers }
      )
      .pipe(
        map((response) => ({
          id: response.data.id,
          status: response.data.status,
          outputs: response.data.outputs,
        })),
        catchError((err: unknown) => {
          const error: WavespeedServiceError = {
            message: err instanceof Error ? err.message : 'WaveSpeed status check failed',
            predictionId,
          };
          return throwError(() => error);
        })
      );
  }

  getResult(predictionId: string): Observable<WavespeedResult> {
    return this.http
      .get<WavespeedApiResponse>(
        `${this.baseUrl}/predictions/${predictionId}/result`,
        { headers: this.headers }
      )
      .pipe(
        map((response) => {
          if (response.data.status !== 'completed') {
            throw new Error(
              `Prediction ${predictionId} is not yet completed: ${response.data.status}`
            );
          }
          return {
            predictionId: response.data.id,
            outputs: response.data.outputs ?? [],
          };
        }),
        catchError((err: unknown) => {
          const error: WavespeedServiceError = {
            message: err instanceof Error ? err.message : 'WaveSpeed result retrieval failed',
            predictionId,
          };
          return throwError(() => error);
        })
      );
  }
}
