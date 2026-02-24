import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { EMPTY, pipe, switchMap, exhaustMap } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { WavespeedService } from './wavespeed.service';
import type {
  WavespeedRequestInput,
  WavespeedStatusResponse,
  WavespeedResult,
  WavespeedServiceError,
} from './wavespeed.model';

interface WavespeedState {
  loading: boolean;
  predictionId: string | null;
  status: WavespeedStatusResponse | null;
  result: WavespeedResult | null;
  error: WavespeedServiceError | null;
}

const initialState: WavespeedState = {
  loading: false,
  predictionId: null,
  status: null,
  result: null,
  error: null,
};

export const WavespeedStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    hasError: computed(() => store.error() !== null),
    hasResult: computed(() => store.result() !== null),
    predictionStatus: computed(() => store.status()?.status ?? null),
    isProcessing: computed(() => {
      const s = store.status()?.status;
      return s === 'created' || s === 'processing';
    }),
    isCompleted: computed(() => store.status()?.status === 'completed'),
    isFailed: computed(() => store.status()?.status === 'failed'),
    outputUrls: computed(() => store.result()?.outputs ?? []),
  })),
  withMethods((store) => {
    const service = inject(WavespeedService);
    return {
      submit: rxMethod<WavespeedRequestInput>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null, status: null, result: null })),
          exhaustMap((jobInput) =>
            service.request(jobInput).pipe(
              tap((ref) =>
                patchState(store, { predictionId: ref.predictionId, loading: false })
              ),
              catchError((err: WavespeedServiceError) => {
                patchState(store, { error: err, loading: false });
                return EMPTY;
              })
            )
          )
        )
      ),

      pollStatus: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const predictionId = store.predictionId();
            if (!predictionId) {
              patchState(store, { loading: false });
              return EMPTY;
            }
            return service.status(predictionId).pipe(
              tap((status) => patchState(store, { status, loading: false })),
              catchError((err: WavespeedServiceError) => {
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
            const predictionId = store.predictionId();
            if (!predictionId) {
              patchState(store, { loading: false });
              return EMPTY;
            }
            return service.getResult(predictionId).pipe(
              tap((result) => patchState(store, { result, loading: false })),
              catchError((err: WavespeedServiceError) => {
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
