### Hand Strength Analysis Feature Plan

This document outlines the plan to implement a comprehensive hand strength analysis that shows what hands are possible based on the current board state.

## Feature Overview

The goal is to create a detailed analysis that shows:
1. **Player's Possible Hands**: What hands the player can make with their hole cards + community cards
2. **Opponent's Possible Hands**: What hands opponents could potentially make with any two hole cards + community cards
3. **Required Cards**: Specific cards needed to complete each possible hand
4. **Probability Analysis**: How likely each hand is to occur

## Implementation Strategy

### Phase 1: Core Hand Analysis Engine
**File**: `src/utils/hand-analyzer.ts`

**Key Functions**:
- `analyzePlayerHands(holeCards, communityCards)`: Returns all possible hands the player can make
- `analyzeOpponentHands(communityCards)`: Returns all possible hands opponents could make
- `getRequiredCards(targetHand, availableCards)`: Returns specific cards needed for a hand
- `calculateHandProbability(targetHand, remainingCards)`: Calculates probability of completing a hand

**Data Structure**:
```typescript
interface HandAnalysis {
  handType: string;           // "Flush", "Straight", etc.
  currentStrength: number;    // 0-9 ranking
  requiredCards: Card[];      // Specific cards needed
  probability: number;        // 0-1 probability
  isPlayerPossible: boolean;  // Can player make this?
  isOpponentPossible: boolean; // Can opponents make this?
}
```

### Phase 2: UI Components
**File**: `src/components/poker/HandAnalysisDisplay.tsx`

**Features**:
- Tabbed interface: "Your Possibilities" vs "Opponent Threats"
- Color-coded strength indicators
- Card visualization for required cards
- Probability percentages
- Clear distinction between made hands vs draws

### Phase 3: Integration
- Add new tab to existing hint dialog
- Connect to current game state
- Real-time updates as community cards change

## Detailed Implementation Steps

### Step 1: Hand Analysis Utility
Create the core logic to:
1. **Identify Made Hands**: What hands are already complete
2. **Identify Draws**: What hands are one/two cards away
3. **Calculate Outs**: How many cards complete each draw
4. **Rank Threats**: Which opponent hands beat the player

### Step 2: Required Cards Logic
For each possible hand:
1. **Flush**: Show remaining cards of the suit
2. **Straight**: Show cards that complete the sequence
3. **Full House**: Show cards that pair/trip existing ranks
4. **Two Pair/Trips**: Show cards that improve current pair

### Step 3: Opponent Analysis
Since we don't know opponent hole cards:
1. **Assume All Possibilities**: Consider every possible 2-card combination
2. **Filter by Board**: Only show hands possible with current community cards
3. **Rank by Threat Level**: Prioritize hands that beat the player

### Step 4: UI Design
- **Player Section**: Green theme, focus on opportunities
- **Opponent Section**: Red theme, focus on threats
- **Card Indicators**: Show exact cards needed with suit symbols
- **Probability Bars**: Visual representation of likelihood

## Example Output

```
YOUR POSSIBILITIES:
✅ One Pair (Jacks) - MADE
🎯 Two Pair - Need: any A, K, Q, 9, 8, 7, 6, 5, 4, 3, 2
🎯 Flush - Need: ♥7, ♥6, ♥5, ♥4, ♥3, ♥2 (6 cards, ~12%)
🎯 Straight - Need: any 9, any 8 (8 cards, ~16%)

OPPONENT THREATS:
⚠️ Flush - Possible if opponent has 2 hearts
⚠️ Straight - Possible if opponent has 9-8, 10-9, etc.
⚠️ Two Pair - Likely if opponent has any pair
```

## Future Enhancements
- **Range Analysis**: Show percentage of opponent hands that beat you
- **Equity Calculator**: Calculate win percentage vs opponent ranges
- **Board Texture Analysis**: Identify "wet" vs "dry" boards
- **Position-Based Recommendations**: Adjust analysis based on position

This feature will significantly enhance the educational value of the poker trainer by giving players deep insight into hand strength and board texture. 