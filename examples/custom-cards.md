# Custom Cards

The `CustomCard` component supports building cards for any non-standard card game: Uno, Magic: The Gathering, custom party games, or anything else you can imagine.

## Two Modes

### Structured Layout

Provide named regions and the component lays them out automatically:

```
+------------------+
| Title       Cost |  <- header
|   [ascii art]    |  <- art region
| Type Line        |  <- typeLine
| Description text |  <- body (auto-wraps)
| that wraps...    |
| L/stat    R/stat |  <- footer
+------------------+
```

### Freeform Mode

Pass `content` as a ReactNode for complete control over what renders inside the card border.

## Size Presets

| Size   | Width | Height | Use Case                    |
|--------|-------|--------|-----------------------------|
| micro  | 5     | 3      | Tokens, counters            |
| mini   | 8     | 5      | Compact hand display        |
| small  | 12    | 7      | Uno-style, simple cards     |
| medium | 18    | 11     | Default, general purpose    |
| large  | 24    | 15     | MTG-style, detailed cards   |

Override with explicit `width` and `height` props.

## Examples

### MTG-Style Card

```tsx
<CustomCard
  id="lightning-bolt"
  size="large"
  title="Lightning Bolt"
  cost="{R}"
  typeLine="Instant"
  description="Deal 3 damage to any target."
  footerRight="C"
  borderColor="red"
  textColor="white"
  back={{ art: '~ ~ ~ ~\n ~ ~ ~\n~ ~ ~ ~', color: 'magenta' }}
/>
```

### Uno-Style Card

```tsx
<CustomCard
  id="uno-red-7"
  size="small"
  title="7"
  description="RED"
  borderColor="red"
  textColor="red"
  back={{ label: 'UNO', color: 'red' }}
/>
```

### Card with ASCII Art and Stats

```tsx
<CustomCard
  id="dragon"
  size="large"
  title="Shivan Dragon"
  cost="{4}{R}{R}"
  asciiArt={`    /\\_/\\
   ( o.o )
    > ^ <`}
  typeLine="Creature — Dragon"
  description="Flying. {R}: +1/+0 until end of turn."
  footerLeft="5/5"
  footerRight="R"
  borderColor="red"
/>
```

### Corner Symbols

```tsx
<CustomCard
  id="skip-card"
  size="small"
  title="Skip"
  symbols={[
    { char: '⊘', position: 'top-right', color: 'green' },
    { char: '⊘', position: 'bottom-left', color: 'green' },
  ]}
  borderColor="green"
  textColor="green"
/>
```

### Custom Card Back

```tsx
<CustomCard
  id="my-card"
  size="small"
  faceUp={false}
  back={{
    art: '╔═══╗\n║ ♠ ║\n╚═══╝',
    color: 'cyan',
  }}
/>
```

You can also use `symbol` for a single character or `label` for a text label on the back.

### Freeform Content

```tsx
<CustomCard
  id="freeform"
  size="medium"
  borderColor="cyan"
  content={
    <Box flexDirection="column" alignItems="center" justifyContent="center">
      <Text color="cyan" bold>★ CUSTOM ★</Text>
      <Text color="yellow">Any ReactNode</Text>
      <Text color="green">goes here</Text>
    </Box>
  }
/>
```

## Props Reference

| Prop          | Type                | Default    | Description                              |
|---------------|---------------------|------------|------------------------------------------|
| id            | string              | (required) | Unique card identifier                   |
| size          | CustomCardSize      | 'medium'   | Size preset                              |
| width         | number              | —          | Override width                           |
| height        | number              | —          | Override height                          |
| title         | string              | —          | Header left text                         |
| cost          | string              | —          | Header right text (mana cost, etc.)      |
| asciiArt      | string              | —          | Multi-line art string                    |
| typeLine      | string              | —          | Type line between art and body           |
| description   | string              | —          | Body text (auto-wraps)                   |
| footerLeft    | string              | —          | Footer left (power/toughness, etc.)      |
| footerRight   | string              | —          | Footer right (rarity, set, etc.)         |
| symbols       | CustomCardSymbol[]  | []         | Corner symbols                           |
| content       | ReactNode           | —          | Freeform mode (overrides all regions)    |
| back          | CustomCardBack      | —          | Custom back design                       |
| faceUp        | boolean             | true       | Show front or back                       |
| selected      | boolean             | false      | Selected highlight (double border)       |
| rounded       | boolean             | true       | Rounded vs single border                 |
| borderColor   | string              | 'white'    | Border color                             |
| textColor     | string              | 'white'    | Default text color                       |
| artColor      | string              | textColor  | Art region color                         |
| value         | string              | —          | Game logic value (not rendered)          |
| type          | string              | —          | Game logic type (not rendered)           |
