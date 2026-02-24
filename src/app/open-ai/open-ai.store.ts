import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap, exhaustMap } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { OpenAiService } from './open-ai.service';
import type {
  OpenAiRequestInput,
  OpenAiJobRef,
  OpenAiStatusResponse,
  OpenAiResult,
  OpenAiServiceError,
} from './open-ai.model';

interface OpenAiState {
  loading: boolean;
  jobRef: OpenAiJobRef | null;
  status: OpenAiStatusResponse | null;
  result: OpenAiResult | null;
  error: OpenAiServiceError | null;
}

const initialState: OpenAiState = {
  loading: false,
  jobRef: null,
  status: null,
  result: null,
  error: null,
};

export const OpenAiStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    hasError: computed(() => store.error() !== null),
    hasResult: computed(() => store.result() !== null),
    completionText: computed(
      () => store.result()?.completion?.choices?.[0]?.message?.content ?? null
    ),
    jobId: computed(() => store.jobRef()?.jobId ?? null),
    statusValue: computed(() => store.status()?.status ?? null),
  })),
  withMethods((store) => {
    const service = inject(OpenAiService);
    return {
      submit: rxMethod<OpenAiRequestInput>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null, status: null, result: null, jobRef: null })),
          exhaustMap((jobInput) =>
            service.request(jobInput).pipe(
              tap((jobRef: OpenAiJobRef) => patchState(store, { jobRef })),
              switchMap((jobRef) =>
                service.getResult(jobRef).pipe(
                  tap((result) => patchState(store, { result, loading: false })),
                )
              ),
              catchError((err: OpenAiServiceError) => {
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
            const jobRef = store.jobRef();
            if (!jobRef) {
              patchState(store, { loading: false });
              return EMPTY;
            }
            return service.status(jobRef.jobId).pipe(
              tap((status) => patchState(store, { status, loading: false })),
              catchError((err: OpenAiServiceError) => {
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
            const jobRef = store.jobRef();
            if (!jobRef) {
              patchState(store, { loading: false });
              return EMPTY;
            }
            return service.getResult(jobRef).pipe(
              tap((result) => patchState(store, { result, loading: false })),
              catchError((err: OpenAiServiceError) => {
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
