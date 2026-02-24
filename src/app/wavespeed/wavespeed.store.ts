import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap, exhaustMap, timer } from 'rxjs';
import { tap, catchError, takeWhile, filter, take } from 'rxjs/operators';
import { WavespeedService } from './wavespeed.service';
import type {
  WavespeedRequestInput,
  WavespeedStatusResponse,
  WavespeedResult,
  WavespeedServiceError,
} from './wavespeed.model';

export const WAVESPEED_POLL_INTERVAL_MS = 2000;

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
          tap(() => patchState(store, { loading: true, error: null, status: null, result: null, predictionId: null })),
          exhaustMap((jobInput) =>
            service.request(jobInput).pipe(
              tap((ref) => patchState(store, { predictionId: ref.predictionId })),
              switchMap((ref) =>
                timer(0, WAVESPEED_POLL_INTERVAL_MS).pipe(
                  exhaustMap(() => service.status(ref.predictionId)),
                  tap((s) => patchState(store, { status: s })),
                  takeWhile((s) => s.status !== 'completed' && s.status !== 'failed', true),
                  filter((s) => s.status === 'completed' || s.status === 'failed'),
                  take(1),
                  switchMap((s) => {
                    if (s.status === 'failed') {
                      patchState(store, {
                        error: { message: `Prediction ${ref.predictionId} failed`, predictionId: ref.predictionId },
                        loading: false,
                      });
                      return EMPTY;
                    }
                    return service.getResult(ref.predictionId).pipe(
                      tap((result) => patchState(store, { result, loading: false })),
                    );
                  }),
                )
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
