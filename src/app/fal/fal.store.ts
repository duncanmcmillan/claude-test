import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { EMPTY, pipe, switchMap, exhaustMap } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FalService } from './fal.service';
import type {
  FalJobInput,
  FalJobResult,
  FalServiceError,
  QueueStatus,
  InQueueQueueStatus,
} from './fal.model';

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
          tap(() => patchState(store, { loading: true, error: null, status: null, result: null })),
          exhaustMap((jobInput) =>
            service.request(jobInput).pipe(
              tap((queued: InQueueQueueStatus) =>
                patchState(store, {
                  requestId: queued.request_id,
                  model: jobInput.model,
                  status: queued,
                  loading: false,
                })
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
