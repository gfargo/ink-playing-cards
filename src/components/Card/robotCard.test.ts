import { ROBOT_FEATURES, ROBOT_THEME } from '../../constants/robotTheme.js'
import { renderCardArt } from '../../utils/cardArtRenderer.js'

// Test rendering of a robot Jack of Clubs
const jackOfClubs = ROBOT_THEME['J']!
const features = ROBOT_FEATURES.clubs

const art = renderCardArt(
  jackOfClubs,
  15, // card width
  {
    ...features,
    suit: '♣'
  }
)

console.log(art.join('\n'))