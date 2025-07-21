import { SeatPosition } from '@/types/player';

/**
 * Calculate seat positions around a poker table for different player counts
 * Uses elliptical coordinates to position players in a realistic poker table layout
 */
export function calculateSeatPositions(playerCount: number): SeatPosition[] {
  if (playerCount < 2 || playerCount > 10) {
    throw new Error('Player count must be between 2 and 10');
  }

  const positions: SeatPosition[] = [];
  
  // Base ellipse dimensions matching the table (2.2 width / 1.6 height ratio)
  const radiusX = 300; // Horizontal radius - Increased for more horizontal spacing
  const radiusY = 200; // Vertical radius - Increased for more vertical spacing
  
  // For 2 players, position them opposite each other
  if (playerCount === 2) {
    return [
      {
        angle: 270, // Bottom (Hero position)
        radius: radiusY,
        x: 0,
        y: radiusY + 20
      },
      {
        angle: 90, // Top
        radius: radiusY,
        x: 0,
        y: -(radiusY + 20)
      }
    ];
  }

  // For 3+ players, distribute around the ellipse
  // Start from bottom and go clockwise
  const startAngle = 270; // Start at bottom (6 o'clock position)
  
  for (let i = 0; i < playerCount; i++) {
    let angle: number;
    
    if (playerCount === 3) {
      // 3 players: bottom, top-left, top-right
      const angles = [270, 150, 30];
      angle = angles[i];
    } else if (playerCount === 4) {
      // 4 players: bottom, left, top, right
      const angles = [270, 180, 90, 0];
      angle = angles[i];
    } else if (playerCount === 5) {
      // 5 players: distribute more evenly
      const angles = [270, 216, 144, 72, 0];
      angle = angles[i];
    } else if (playerCount === 6) {
      // 6 players: classic 6-max positioning
      const angles = [270, 210, 150, 90, 30, 330];
      angle = angles[i];
    } else if (playerCount === 7) {
      // 7 players
      const angles = [270, 225, 180, 135, 90, 45, 0];
      angle = angles[i];
    } else if (playerCount === 8) {
      // 8 players
      const angles = [270, 225, 180, 135, 90, 45, 0, 315];
      angle = angles[i];
    } else if (playerCount === 9) {
      // 9 players
      const angles = [270, 240, 210, 150, 120, 90, 60, 30, 0];
      angle = angles[i];
    } else { // 10 players
      const angles = [270, 234, 198, 162, 126, 90, 54, 18, 342, 306];
      angle = angles[i];
    }
    
    const radians = (angle * Math.PI) / 180;
    
    // Calculate elliptical coordinates
    const x = radiusX * Math.cos(radians);
    const y = radiusY * Math.sin(radians);
    
    positions.push({
      angle,
      radius: Math.sqrt(x * x + y * y),
      x,
      y
    });
  }

  return positions;
}

/**
 * Get the optimal seat position for a new player
 * Tries to maintain good spacing around the table
 */
export function getOptimalSeatPosition(
  occupiedPositions: number[],
  maxPlayers: number = 10
): number {
  // Find the first available position
  for (let i = 0; i < maxPlayers; i++) {
    if (!occupiedPositions.includes(i)) {
      return i;
    }
  }
  throw new Error('Table is full');
}

/**
 * Calculate dealer button position relative to player count
 * Button rotates clockwise after each hand
 */
export function getNextButtonPosition(
  currentButton: number,
  playerCount: number
): number {
  return (currentButton + 1) % playerCount;
}

/**
 * Calculate blind positions based on button position
 */
export function getBlindPositions(
  buttonPosition: number,
  playerCount: number
): { smallBlind: number; bigBlind: number } {
  if (playerCount === 2) {
    // Heads-up: button is small blind
    return {
      smallBlind: buttonPosition,
      bigBlind: (buttonPosition + 1) % playerCount
    };
  } else {
    // Multi-way: small blind is left of button, big blind is left of small blind
    return {
      smallBlind: (buttonPosition + 1) % playerCount,
      bigBlind: (buttonPosition + 2) % playerCount
    };
  }
}

/**
 * Get responsive sizing based on screen size
 */
export function getResponsiveTableSize(screenWidth: number): {
  tableRadius: number;
  cardScale: number;
  fontSize: number;
} {
  if (screenWidth < 768) {
    // Mobile
    return {
      tableRadius: 120,
      cardScale: 0.6,
      fontSize: 12
    };
  } else if (screenWidth < 1024) {
    // Tablet
    return {
      tableRadius: 160,
      cardScale: 0.8,
      fontSize: 14
    };
  } else {
    // Desktop
    return {
      tableRadius: 200,
      cardScale: 1,
      fontSize: 16
    };
  }
}

/**
 * Generate default player names
 */
export function generatePlayerName(index: number): string {
  const names = [
    'Hero', 'Villain', 'Player 3', 'Player 4', 'Player 5',
    'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'
  ];
  return names[index] || `Player ${index + 1}`;
}

/**
 * Generate avatar colors for visual identification
 */
export function generateAvatarColor(index: number): string {
  const colors = [
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#84CC16', // Lime
    '#F43F5E'  // Rose
  ];
  return colors[index % colors.length];
} 