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
  limit?: number
}

/**
 * Wrap a `DeckContextType` reducer with undo/redo history tracking.
 *
 * `UNDO`/`REDO` restore/reapply a snapshot without going through `reducer`,
 * so they never re-emit `pendingEvents` and are never themselves recorded as
 * history steps. `FLUSH_EVENTS` and no-op actions (reducer returns the same
 * state reference) are also excluded from history.
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
      limit && limit > 0 && past.length > limit ? past.slice(-limit) : past

    return {
      ...next,
      history: { past: trimmedPast, future: [] },
    }
  }
}
