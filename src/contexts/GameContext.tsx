import React, {
  createContext,
  type ReactNode,
  useMemo,
  useReducer,
} from 'react'
import { type GameAction, type GameContextType } from '../types/index.js'

const initialState: GameContextType = {
  currentPlayerId: '',
  players: [],
  turn: 0,
  phase: 'setup',
  dispatch: () => null,
}

export const GameContext = createContext<GameContextType>(initialState)

const gameReducer = (
  state: GameContextType,
  action: GameAction
): GameContextType => {
  switch (action.type) {
    case 'SET_CURRENT_PLAYER': {
      return {
        ...state,
        currentPlayerId: action.payload,
      }
    }

    case 'NEXT_TURN': {
      const currentIndex = state.players.indexOf(state.currentPlayerId)
      const nextIndex = (currentIndex + 1) % state.players.length
      return {
        ...state,
        currentPlayerId: state.players[nextIndex] ?? state.currentPlayerId,
        turn: state.turn + 1,
      }
    }

    case 'SET_PHASE': {
      return {
        ...state,
        phase: action.payload,
      }
    }
  }
}

type GameProviderProperties = {
  readonly children: ReactNode
  readonly initialPlayers?: string[]
  readonly customReducer?: (
    state: GameContextType,
    action: GameAction
  ) => GameContextType
}

export function GameProvider({
  children,
  initialPlayers = [],
  customReducer,
}: GameProviderProperties) {
  const [state, dispatch] = useReducer(customReducer ?? gameReducer, {
    ...initialState,
    players: initialPlayers,
    currentPlayerId: initialPlayers[0] ?? '',
  })

  const contextValue = useMemo(() => ({ ...state, dispatch }), [state])

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}
