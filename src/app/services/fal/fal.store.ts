import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap, exhaustMap, timer } from 'rxjs';
import { tap, catchError, takeWhile, filter, take } from 'rxjs/operators';
import { withDevtools } from '../shared/devtools.feature';
import { FalService } from './fal.service';
import type {
  FalJobInput,
  FalJobResult,
  FalServiceError,
  QueueStatus,
  InQueueQueueStatus,
} from './fal.model';

export const FAL_POLL_INTERVAL_MS = 2000;

interface FalState {
  loading: boolean;
  requestId: string | null;
  model: string | null;
  status: QueueStatus | null;
  result: FalJobResult | null;
  error: FalServiceError | null;
}

const initialState: FalState = {
  loading: false,
  requestId: null,
  model: null,
  status: null,
  result: null,
  error: null,
};

export const FalStore = signalStore(
  { providedIn: 'root' },
  withDevtools('fal'),
  withState(initialState),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    hasError: computed(() => store.error() !== null),
    hasResult: computed(() => store.result() !== null),
    isQueued: computed(() => store.status()?.status === 'IN_QUEUE'),
    isInProgress: computed(() => store.status()?.status === 'IN_PROGRESS'),
    isCompleted: computed(() => store.status()?.status === 'COMPLETED'),
  })),
  withMethods((store) => {
    const service = inject(FalService);
    return {
      submit: rxMethod<FalJobInput>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null, status: null, result: null, requestId: null, model: null })),
          exhaustMap((jobInput) =>
            service.request(jobInput).pipe(
              tap((queued: InQueueQueueStatus) =>
                patchState(store, {
                  requestId: queued.request_id,
                  model: jobInput.model,
                  status: queued,
                })
              ),
              switchMap((queued) =>
                timer(0, FAL_POLL_INTERVAL_MS).pipe(
                  exhaustMap(() => service.status(queued.request_id, jobInput.model)),
                  tap((s) => patchState(store, { status: s })),
                  takeWhile((s) => s.status !== 'COMPLETED', true),
                  filter((s) => s.status === 'COMPLETED'),
                  take(1),
                  switchMap(() => service.getResult(queued.request_id, jobInput.model)),
                  tap((result) => patchState(store, { result, loading: false })),
                )
              ),
              catchError((err: FalServiceError) => {
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
            const requestId = store.requestId();
            const model = store.model();
            if (!requestId || !model) {
              patchState(store, { loading: false });
              return EMPTY;
            }
            return service.status(requestId, model).pipe(
              tap((status) => patchState(store, { status, loading: false })),
              catchError((err: FalServiceError) => {
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
            const requestId = store.requestId();
            const model = store.model();
            if (!requestId || !model) {
              patchState(store, { loading: false });
              return EMPTY;
            }
            return service.getResult(requestId, model).pipe(
              tap((result) => patchState(store, { result, loading: false })),
              catchError((err: FalServiceError) => {
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
