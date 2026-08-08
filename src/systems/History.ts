import {
  type DeckAction,
  type DeckContextType,
  type HistorySnapshot,
} from '../types/index.js'

/**
 * Capture the undoable portion of `DeckContextType`.
 */
export function snapshot(state: DeckContextType): HistorySnapshot {
  return {
    zones: state.zones,
    players: state.players,
    backArtwork: state.backArtwork,
  }
}

export type WithHistoryOptions = {
  /**
   * Maximum number of past snapshots to retain. `0` retains none (every
   * state-changing action is still applied, but nothing is undoable).
   * `undefined` (the default) means unlimited history.
   */
  limit?: number
}

/**
 * Wrap a `DeckContextType` reducer with undo/redo history tracking.
 *
 * `UNDO`/`REDO` restore/reapply a snapshot without going through `reducer`,
 * so they never re-emit `pendingEvents` and are never themselves recorded as
 * history steps. `FLUSH_EVENTS` and no-op actions (reducer returns the same
 * state reference) are also excluded from history.
 *
 * Restoring a snapshot also clears `pendingEvents`: any events queued by an
 * action since the last flush belong to state that UNDO/REDO is about to
 * replace, so they must not fire.
 */
export function withHistory(
  reducer: (state: DeckContextType, action: DeckAction) => DeckContextType,
  { limit }: WithHistoryOptions = {}
) {
  return (state: DeckContextType, action: DeckAction): DeckContextType => {
    const { history } = state

    if (!history) {
      return reducer(state, action)
    }

    if (action.type === 'UNDO') {
      const previous = history.past.at(-1)
      if (!previous) return state
      return {
        ...state,
        ...previous,
        pendingEvents: [],
        history: {
          past: history.past.slice(0, -1),
          future: [snapshot(state), ...history.future],
        },
      }
    }

    if (action.type === 'REDO') {
      const next = history.future[0]
      if (!next) return state
      return {
        ...state,
        ...next,
        pendingEvents: [],
        history: {
          past: [...history.past, snapshot(state)],
          future: history.future.slice(1),
        },
      }
    }

    if (action.type === 'CLEAR_HISTORY') {
      return { ...state, history: { past: [], future: [] } }
    }

    const next = reducer(state, action)
    if (action.type === 'FLUSH_EVENTS' || next === state) {
      return next
    }

    const past = [...history.past, snapshot(state)]
    const trimmedPast =
      limit !== undefined && limit >= 0 && past.length > limit
        ? past.slice(past.length - limit)
        : past

    return {
      ...next,
      history: { past: trimmedPast, future: [] },
    }
  }
}
