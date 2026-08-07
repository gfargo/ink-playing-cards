import { useEffect, useState } from 'react'
import { useStdout } from 'ink'
import { selectCardVariant, type CardVariant } from '../utils/responsive.js'

/**
 * Resolves a `CardVariant` from the current terminal width (`useStdout`
 * columns), re-resolving whenever the terminal emits a `resize` event.
 */
export function useResponsiveVariant(
  fallback: CardVariant = 'simple'
): CardVariant {
  const { stdout } = useStdout()
  const [columns, setColumns] = useState(stdout?.columns)

  useEffect(() => {
    if (!stdout) {
      return
    }

    const handleResize = () => {
      setColumns(stdout.columns)
    }

    stdout.on('resize', handleResize)
    handleResize()

    return () => {
      stdout.off('resize', handleResize)
    }
  }, [stdout])

  return selectCardVariant(columns, fallback)
}
