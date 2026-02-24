import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { getJson, config as serpApiConfig } from 'serpapi';
import type {
  SerpApiRequestParams,
  SerpApiSearchRef,
  SerpApiStatusResponse,
  SerpApiSearchResponse,
  SerpApiServiceError,
} from './serp-api.model';

@Injectable({ providedIn: 'root' })
export class SerpApiService {
  private readonly http = inject(HttpClient);

  constructor() {
    serpApiConfig.api_key =
      (globalThis as Record<string, unknown>)['SERPAPI_API_KEY'] as string ?? '';
    serpApiConfig.timeout = 30_000;
  }

  request(params: SerpApiRequestParams): Observable<SerpApiSearchRef> {
    const searchParams = { engine: 'google', ...params };

    return from(
      getJson(searchParams) as Promise<SerpApiSearchResponse>
    ).pipe(
      map((response) => ({
        searchId: response['search_metadata']['id'] as string,
        results: response,
      })),
      catchError((err: unknown) => {
        const error: SerpApiServiceError = {
          message: err instanceof Error ? err.message : 'SerpAPI request failed',
        };
        return throwError(() => error);
      })
    );
  }

  status(searchRef: SerpApiSearchRef): Observable<SerpApiStatusResponse> {
    const status = searchRef.results?.['search_metadata']['status'] as SerpApiStatusResponse['status'] ?? 'Processing';
    return of({ searchId: searchRef.searchId, status });
  }

  getResult(searchRef: SerpApiSearchRef): Observable<SerpApiSearchResponse> {
    if (!searchRef.results) {
      const error: SerpApiServiceError = {
        message: `No results found for searchId: ${searchRef.searchId}`,
        searchId: searchRef.searchId,
      };
      return throwError(() => error);
    }

    return of(searchRef.results).pipe(
      catchError((err: unknown) => {
        const error: SerpApiServiceError = {
          message: err instanceof Error ? err.message : 'SerpAPI result retrieval failed',
          searchId: searchRef.searchId,
        };
        return throwError(() => error);
      })
    );
  }
}
