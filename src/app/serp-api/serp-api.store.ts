import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { EMPTY, pipe, switchMap, exhaustMap } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SerpApiService } from './serp-api.service';
import type {
  SerpApiRequestParams,
  SerpApiSearchRef,
  SerpApiStatusResponse,
  SerpApiSearchResponse,
  SerpApiOrganicResult,
  SerpApiServiceError,
} from './serp-api.model';

interface SerpApiState {
  loading: boolean;
  searchRef: SerpApiSearchRef | null;
  status: SerpApiStatusResponse | null;
  result: SerpApiSearchResponse | null;
  error: SerpApiServiceError | null;
}

const initialState: SerpApiState = {
  loading: false,
  searchRef: null,
  status: null,
  result: null,
  error: null,
};

export const SerpApiStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    hasError: computed(() => store.error() !== null),
    hasResult: computed(() => store.result() !== null),
    organicResults: computed(
      (): SerpApiOrganicResult[] => store.result()?.organic_results ?? []
    ),
    searchId: computed(() => store.searchRef()?.searchId ?? null),
    resultCount: computed(() => store.result()?.organic_results?.length ?? 0),
    statusValue: computed(() => store.status()?.status ?? null),
  })),
  withMethods((store) => {
    const service = inject(SerpApiService);
    return {
      submit: rxMethod<SerpApiRequestParams>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null, status: null, result: null, searchRef: null })),
          exhaustMap((params) =>
            service.request(params).pipe(
              tap((searchRef: SerpApiSearchRef) => patchState(store, { searchRef, loading: false })),
              catchError((err: SerpApiServiceError) => {
                patchState(store, { error: err, loading: false });
                return EMPTY;
              })
            )
          )
        )
      ),

      checkStatus: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const searchRef = store.searchRef();
            if (!searchRef) {
              patchState(store, { loading: false });
              return EMPTY;
            }
            return service.status(searchRef).pipe(
              tap((status) => patchState(store, { status, loading: false })),
              catchError((err: SerpApiServiceError) => {
                patchState(store, { error: err, loading: false });
                return EMPTY;
              })
            );
          })
        )
      ),

      fetchResult: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const searchRef = store.searchRef();
            if (!searchRef) {
              patchState(store, { loading: false });
              return EMPTY;
            }
            return service.getResult(searchRef).pipe(
              tap((result) => patchState(store, { result, loading: false })),
              catchError((err: SerpApiServiceError) => {
                patchState(store, { error: err, loading: false });
                return EMPTY;
              })
            );
          })
        )
      ),

      reset(): void {
        patchState(store, initialState);
      },
    };
  })
);
