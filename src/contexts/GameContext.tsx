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
  dispatch: () => null,
}

const GameContext = createContext<GameContextType>(initialState)

const gameReducer = (
  state: GameContextType,
  action: GameAction
): GameContextType => {
  switch (action.type) {
    case 'ADD_PLAYER': {
      return {
        ...state,
        players: [...state.players, action.payload],
      }
    }

    case 'REMOVE_PLAYER': {
      return {
        ...state,
        players: state.players.filter((id) => id !== action.payload),
      }
    }

    case 'SET_CURRENT_PLAYER': {
      return {
        ...state,
        currentPlayerId: action.payload,
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
  })

  const contextValue = useMemo(() => ({ ...state, dispatch }), [state])

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}

export default GameContext
