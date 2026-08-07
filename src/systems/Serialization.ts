import {
  type DeckContextType,
  type GameContextType,
  type GameSnapshot,
  type TCard,
} from '../types/index.js'

/**
 * Pure helpers for turning live deck/game state into a JSON-safe snapshot
 * (and back) — see `GameSnapshot` in `types/index.ts` for the wire shape.
 */

const SNAPSHOT_VERSION = 1

type Zones = GameSnapshot['zones']

/**
 * Deep-copies a card, dropping `effects` — `CardEffect` instances hold
 * functions/class methods that cannot survive JSON round-tripping over the
 * wire. Apps that rely on effects must re-attach them (e.g. via
 * `attachEffectToCard`) after `hydrate`.
 */
export function stripCard(card: TCard): TCard {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { effects: _effects, ...rest } = card
  return structuredClone(rest) as TCard
}

function stripCards(cards: TCard[]): TCard[] {
  return cards.map((card) => stripCard(card))
}

function stripZones(zones: DeckContextType['zones']): Zones {
  return {
    deck: stripCards(zones.deck),
    hands: Object.fromEntries(
      Object.entries(zones.hands).map(([playerId, cards]) => [
        playerId,
        stripCards(cards),
      ])
    ),
    discardPile: stripCards(zones.discardPile),
    playArea: stripCards(zones.playArea),
    custom: Object.fromEntries(
      Object.entries(zones.custom).map(([name, cards]) => [
        name,
        stripCards(cards),
      ])
    ),
  }
}

/**
 * The subset of `DeckContextType` that is serializable.
 */
export type DeckStateSlice = Pick<
  DeckContextType,
  'zones' | 'players' | 'backArtwork'
>

/**
 * The subset of `GameContextType` that is serializable.
 */
export type GameStateSlice = Pick<
  GameContextType,
  'currentPlayerId' | 'players' | 'turn' | 'phase'
>

export type SerializeInput = {
  deck: DeckStateSlice
  /** Omit if the app only uses `DeckProvider` without `GameProvider`. */
  game?: GameStateSlice
  /** Seed for a seeded RNG, if the app uses one. */
  rngSeed?: number
}

/**
 * Produce a plain, `JSON.stringify`-safe snapshot of deck/game state for
 * save-resume or multiplayer (WebSocket/Supabase) sync. Runtime-only
 * fields (`eventManager`, `effectManager`, `pendingEvents`, `dispatch`,
 * per-card `effects`) are intentionally omitted — `hydrate` reinstalls
 * fresh managers around the restored data.
 *
 * `DeckContextType` and `GameContextType` each track their own `players`
 * list; the snapshot has one roster, sourced from `input.deck.players`
 * (apps that use both providers together are expected to keep the two in
 * sync, e.g. by dispatching `ADD_PLAYER`/`REMOVE_PLAYER` to both).
 */
export function serialize(input: SerializeInput): GameSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    zones: stripZones(input.deck.zones),
    players: [...input.deck.players],
    backArtwork: { ...input.deck.backArtwork },
    currentPlayerId: input.game?.currentPlayerId,
    turn: input.game?.turn,
    phase: input.game?.phase,
    rngSeed: input.rngSeed,
  }
}

/**
 * Reconstruct deck/game state slices from a `GameSnapshot`. Returns plain
 * data — the caller either dispatches a `HYDRATE` action (which keeps the
 * live `eventManager`/`effectManager` instances intact) or splices these
 * slices into a provider's initial state.
 */
export function hydrate(snapshot: GameSnapshot): {
  deck: DeckStateSlice
  game: GameStateSlice
} {
  return {
    deck: {
      zones: stripZones(snapshot.zones),
      players: [...snapshot.players],
      backArtwork: { ...snapshot.backArtwork },
    },
    game: {
      currentPlayerId: snapshot.currentPlayerId ?? snapshot.players[0] ?? '',
      players: [...snapshot.players],
      turn: snapshot.turn ?? 0,
      phase: snapshot.phase ?? 'setup',
    },
  }
}
