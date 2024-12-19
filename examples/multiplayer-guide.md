# Implementing Multiplayer Card Games with ink-playing-cards

This guide provides a comprehensive overview of how to create multiplayer card games using the `ink-playing-cards` library, `ink` for terminal-based rendering, and networking solutions for online play.

## Overview

Creating a multiplayer card game involves several key components:

1. Game Logic: The core rules and mechanics of the card game.
2. User Interface: Rendering the game state in the terminal using `ink`.
3. Networking: Synchronizing game state between players over the internet.
4. State Management: Handling game state updates and player actions.

We'll explore two main approaches for networking:

1. WebSockets
2. Supabase Realtime subscriptions

## Basic Architecture

```
[Player 1 Terminal] <-> [Game Client] <-> [Networking Layer] <-> [Game Server] <-> [Networking Layer] <-> [Game Client] <-> [Player 2 Terminal]
```

## Implementing the Game Client

### 1. Set up the basic game structure

```typescript
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'

const MultiplayerCardGame: React.FC = () => {
  const { deck, shuffle, draw } = useDeck()
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayer: 0,
    // ... other game-specific state
  })

  // ... game logic and rendering
}

const App: React.FC = () => (
  <DeckProvider>
    <MultiplayerCardGame />
  </DeckProvider>
)

export default App
```

### 2. Implement game logic

Implement your game-specific logic, such as turn handling, card playing, and scoring. Ensure all game state changes are driven by functions that can be easily triggered by both local input and network messages.

```typescript
const playCard = (playerIndex: number, cardIndex: number) => {
  // Update game state based on the played card
  // This function should be callable from both local input and network messages
}

const endTurn = () => {
  // Handle end of turn logic
  // This function should be callable from both local input and network messages
}
```

### 3. Handle user input

Use the `useInput` hook to handle local player input:

```typescript
useInput((input, key) => {
  if (gameState.currentPlayer === localPlayerIndex) {
    // Handle local player input
    // Call appropriate game logic functions
    // Send actions to the server
  }
})
```

### 4. Render the game state

Use `ink` components to render the current game state:

```typescript
return (
  <Box flexDirection="column">
    <Text>Multiplayer Card Game</Text>
    {gameState.players.map((player, index) => (
      <Box key={index}>
        <Text>Player {index + 1}</Text>
        {player.hand.map((card, cardIndex) => (
          <Card key={cardIndex} {...card} faceUp={index === localPlayerIndex} />
        ))}
      </Box>
    ))}
    {/* Render other game elements */}
  </Box>
)
```

## Networking Layer

### Option 1: WebSockets

WebSockets provide a full-duplex, real-time communication channel between the client and server.

1. Set up a WebSocket server (e.g., using `ws` in Node.js)
2. Implement connection handling on the server
3. Create a WebSocket client in your game client

```typescript
import WebSocket from 'ws'

const ws = new WebSocket('ws://your-server-url')

ws.onopen = () => {
  console.log('Connected to server')
}

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  handleServerMessage(message)
}

const sendToServer = (action: string, data: any) => {
  ws.send(JSON.stringify({ action, data }))
}

const handleServerMessage = (message: { action: string; data: any }) => {
  switch (message.action) {
    case 'updateGameState':
      setGameState(message.data)
      break
    case 'playCard':
      playCard(message.data.playerIndex, message.data.cardIndex)
      break
    // Handle other message types
  }
}
```

### Option 2: Supabase Realtime Subscriptions

Supabase provides a real-time database that can be used for multiplayer games.

1. Set up a Supabase project and create necessary tables (e.g., `games`, `players`, `actions`)
2. Use Supabase client in your game client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY')

// Subscribe to game updates
const gameSubscription = supabase
  .from(`games:id=eq.${gameId}`)
  .on('UPDATE', (payload) => {
    setGameState(payload.new)
  })
  .subscribe()

// Subscribe to player actions
const actionsSubscription = supabase
  .from(`actions:game_id=eq.${gameId}`)
  .on('INSERT', (payload) => {
    handlePlayerAction(payload.new)
  })
  .subscribe()

const sendAction = async (action: string, data: any) => {
  await supabase.from('actions').insert({ game_id: gameId, action, data })
}

const handlePlayerAction = (action: { action: string; data: any }) => {
  switch (action.action) {
    case 'playCard':
      playCard(action.data.playerIndex, action.data.cardIndex)
      break
    // Handle other action types
  }
}
```

## State Management and Synchronization

1. Define a clear game state structure
2. Implement state update functions that can be triggered by both local actions and network messages
3. Ensure all players have a consistent view of the game state

```typescript
interface GameState {
  players: Player[]
  currentPlayer: number
  deck: Card[]
  // ... other game-specific state
}

const updateGameState = (newState: Partial<GameState>) => {
  setGameState((prevState) => ({
    ...prevState,
    ...newState,
  }))

  // If using WebSockets
  sendToServer('updateGameState', newState)

  // If using Supabase
  supabase.from('games').update(newState).eq('id', gameId)
}
```

## Security Considerations

1. Implement player authentication and authorization
2. Validate all actions on the server to prevent cheating
3. Use secure WebSocket connections (wss://) or Supabase's built-in security features
4. Implement rate limiting to prevent spam or DoS attacks
5. Be cautious about revealing hidden information (e.g., other players' cards)

## Performance Optimization

1. Minimize the amount of data sent over the network
2. Use efficient data structures for game state
3. Implement client-side prediction for better responsiveness
4. Consider using binary protocols for WebSockets to reduce data size

## Error Handling and Resilience

1. Implement reconnection logic for dropped connections
2. Handle various error scenarios (e.g., invalid moves, server errors)
3. Provide feedback to users about connection status and errors

```typescript
ws.onclose = () => {
  console.log('Disconnected from server')
  // Implement reconnection logic
}

ws.onerror = (error) => {
  console.error('WebSocket error:', error)
  // Handle error and provide user feedback
}
```

## Testing Multiplayer Functionality

1. Implement automated tests for game logic
2. Use mock WebSocket servers or Supabase emulators for testing
3. Conduct thorough playtesting with multiple clients
4. Test various network conditions (e.g., high latency, packet loss)

## Additional Considerations for Terminal-Based Multiplayer Games

When implementing multiplayer functionality in a terminal environment using Ink and `ink-playing-cards`, there are several unique challenges and edge cases to consider:

### 1. Terminal Size Variations

Different players may have different terminal sizes, affecting the game's layout.

Solution:

- Implement responsive layouts that adapt to different terminal sizes.
- Use Ink's `useStdout` hook to get terminal dimensions and adjust rendering accordingly.
- Provide fallback layouts for very small terminals.

```typescript
import { useStdout } from 'ink'

const { stdout } = useStdout()
const { columns, rows } = stdout

// Adjust rendering based on columns and rows
```

### 2. Input Method Differences

Players might use different terminal emulators or SSH clients, leading to inconsistent input handling.

Solution:

- Implement multiple input methods (e.g., arrow keys, number keys, and text commands).
- Clearly communicate available input methods to players.
- Test on various terminal emulators and SSH clients.

### 3. Network Latency Visualization

In a text-based environment, it's crucial to provide visual feedback for network-related delays.

Solution:

- Implement loading indicators or spinners for network operations.
- Use Ink's `Spinner` component or create custom animations to indicate ongoing processes.

```typescript
import { Spinner } from 'ink'

{
  isLoading && <Spinner type="dots" />
}
```

### 4. Handling Disconnections

Terminal-based games may be more prone to disconnections, especially over SSH.

Solution:

- Implement robust reconnection logic.
- Store game state server-side to allow seamless rejoining.
- Provide clear feedback about connection status.

```typescript
const [connectionStatus, setConnectionStatus] = useState('connected')

// In your WebSocket or Supabase connection logic
onDisconnect(() => {
  setConnectionStatus('disconnected')
  startReconnectionAttempts()
})

// In your render function
;<Text color={connectionStatus === 'connected' ? 'green' : 'red'}>
  {connectionStatus}
</Text>
```

### 5. Cross-Platform Compatibility

Ensure the game works across different operating systems and terminal types.

Solution:

- Use cross-platform libraries for any system-level operations.
- Test on various OS and terminal combinations (Windows CMD, PowerShell, Unix-based terminals, etc.).
- Provide fallback options for platform-specific features.

### 6. Limited Screen Real Estate

Terminal-based UIs have limited space compared to graphical interfaces.

Solution:

- Implement efficient information display techniques (e.g., abbreviations, icons).
- Use collapsible sections for less critical information.
- Implement scrollable views for larger datasets.

### 7. Spectator Mode

Allow players to watch ongoing games without participating.

Solution:

- Implement a spectator role in your game state.
- Ensure spectators receive game updates but cannot perform actions.
- Provide a way for spectators to chat or interact without affecting the game.

### 8. Game State Serialization

Ensure game state can be efficiently serialized for network transmission.

Solution:

- Design a compact representation of your game state.
- Consider using binary serialization for larger game states.
- Implement incremental state updates to reduce data transfer.

### 9. Handling Terminal Resizes

Players may resize their terminals during gameplay.

Solution:

- Listen for resize events and adjust the UI accordingly.
- Rerender the game board when terminal size changes.

```typescript
import { useStdout } from 'ink'

const { stdout } = useStdout()

useEffect(() => {
  const handleResize = () => {
    // Rerender or adjust game layout
  }

  stdout.on('resize', handleResize)
  return () => {
    stdout.off('resize', handleResize)
  }
}, [])
```

### 10. Accessibility Considerations

Ensure the game is accessible to players using screen readers or other assistive technologies.

Solution:

- Provide text-based alternatives for all game information.
- Ensure the game can be fully played using keyboard inputs.
- Test with screen readers and other assistive technologies.

### 11. Internationalization

Support multiple languages for a global player base.

Solution:

- Implement a localization system compatible with terminal-based rendering.
- Ensure text-based UI elements adapt to different language lengths.
- Consider character encoding issues, especially for languages with non-ASCII characters.

### 12. Game Invitations and Lobbies

Implement a system for players to create and join game sessions.

Solution:

- Create a lobby system where players can see available games.
- Implement invite codes or links that work in a terminal environment.
- Provide commands for creating, joining, and leaving game sessions.

```typescript
const [lobbyGames, setLobbyGames] = useState([])

// Fetch and display available games
useEffect(() => {
  fetchLobbyGames().then(setLobbyGames)
}, [])

// In your render function
;<Box flexDirection="column">
  <Text>Available Games:</Text>
  {lobbyGames.map((game) => (
    <Text key={game.id}>
      {game.name} - /join {game.id}
    </Text>
  ))}
</Box>
```

## Conclusion

Creating a multiplayer card game using `ink-playing-cards` and `ink` involves careful consideration of game logic, networking, state management, and user interface design. By leveraging WebSockets or Supabase Realtime subscriptions and addressing the unique challenges of terminal-based multiplayer games, you can create engaging real-time multiplayer experiences.

Remember to prioritize security, optimize performance, handle errors gracefully, and consider the various edge cases and platform-specific issues that may arise in a terminal environment. This will ensure a smooth and enjoyable gaming experience for all players, regardless of their setup or location.

## Additional Resources

- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- Supabase Realtime: https://supabase.io/docs/guides/realtime
- Ink Documentation: https://github.com/vadimdemedes/ink
- WebSocket npm package: https://www.npmjs.com/package/ws
- Supabase JavaScript Client: https://supabase.io/docs/reference/javascript/introduction
- ANSI Escape Codes: https://en.wikipedia.org/wiki/ANSI_escape_code (useful for terminal manipulations)
- Node.js net module: https://nodejs.org/api/net.html (for lower-level networking if needed)

By following this guide and adapting it to your specific card game, you can create engaging multiplayer experiences using the `ink-playing-cards` library and terminal-based rendering with `ink`, while addressing the unique challenges and opportunities presented by the terminal environment.
