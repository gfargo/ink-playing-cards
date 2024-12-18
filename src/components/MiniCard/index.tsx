import { Box, Text } from 'ink';
import React from 'react';
import { CardProps, } from '../../types/index.js';

interface MiniCardProps extends CardProps {
   selected?: boolean;
}

export const MiniCard: React.FC<MiniCardProps> = ({
  suit,
  value,
  faceUp = true,
  selected = false,
}) => {
  const suitSymbol = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }[suit];

  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'white';

  return (
    <Box
      flexDirection="column"
      width={3}
      height={2}
      borderStyle={selected ? 'double' : 'single'}
      borderColor={selected ? 'yellow' : 'white'}
    >
      {faceUp ? (
        <>
          <Text color={color}>{value}</Text>
          <Text color={color}>{suitSymbol}</Text>
        </>
      ) : (
        <Text>🂠</Text>
      )}
    </Box>
  );
};