import { renderCardArt } from '../../utils/cardArtRenderer.js'
import { ROBOT_THEME, ROBOT_FEATURES } from '../../constants/robotTheme.js'

// Test rendering of a robot Jack of Clubs
const jackOfClubs = ROBOT_THEME.J!
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