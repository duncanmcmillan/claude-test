import { signalStoreFeature, withHooks, getState, patchState, watchState } from '@ngrx/signals';

interface DevToolsConnection {
  init(state: unknown): void;
  send(action: { type: string }, state: unknown): void;
  subscribe(listener: (msg: DevToolsMessage) => void): () => void;
}

interface DevToolsMessage {
  type: string;
  payload?: { type: string };
  state?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStore = any;

export function withDevtools(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store: AnyStore) {
        const ext = (window as unknown as Record<string, unknown>)['__REDUX_DEVTOOLS_EXTENSION__'] as
          | { connect: (opts: { name: string }) => DevToolsConnection }
          | undefined;

        if (!ext) return;

        const conn = ext.connect({ name });
        conn.init(getState(store));

        // Time-travel: restore state when user jumps in DevTools
        conn.subscribe((msg) => {
          if (
            msg.type === 'DISPATCH' &&
            (msg.payload?.type === 'JUMP_TO_ACTION' || msg.payload?.type === 'JUMP_TO_STATE') &&
            msg.state
          ) {
            patchState(store, JSON.parse(msg.state) as object);
          }
        });

        // Push every state update to DevTools
        watchState(store, (state) => {
          conn.send({ type: `[${name}] update` }, state);
        });
      },
    })
  );
}
