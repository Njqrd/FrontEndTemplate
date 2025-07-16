### Plan for "What Beats Me?" Hint Feature

This document outlines the plan to implement a feature that shows the user what hands would beat their current hand in a given scenario.

**1. Feature Goal:**
To provide players with a quick reference ("cheatsheet") of hand rankings stronger than their current hand, helping them better assess their hand's strength and vulnerability.

**2. Component & Data Structure:**

*   **`src/data/hand-rankings.ts` (New File):**
    *   A new data file will export a canonical, ordered array of all possible hand ranks.
    *   Each item in the array will be an object containing `{ rankName: string, rankValue: number, description: string }`.
    *   This centralizes our hand ranking data, making it reusable and easy to manage.

*   **`src/components/poker/HandRankingsGuide.tsx` (New File):**
    *   A new UI component that displays the hand ranking information in a clear, tabular format.
    *   It will accept the player's current hand rank (`playerHandRank`) as a prop.
    *   It will map over the data from `hand-rankings.ts` and visually distinguish between hands that are weaker than, equal to, or stronger than the player's current hand (e.g., using color-coding or icons).

*   **`src/components/poker/DecisionPanel.tsx` (Modification):**
    *   We will add a new UI element, such as a "Hand Strengths" button.
    *   This button will trigger a `Dialog` (modal) component from `shadcn/ui`.
    *   The `Dialog` will render the `HandRankingsGuide` component, passing the required `playerHandRank` prop to it.

**3. Logic Flow:**

1.  The `DecisionPanel` component will access the `currentScenario` (containing `holeCards` and `communityCards`) from the `useGame` context.
2.  It will use the existing `evaluateHand` utility to determine the player's current hand strength (`playerHandRank`).
3.  When the user clicks the "Hand Strengths" button, the `Dialog` will open, and the calculated `playerHandRank` will be passed to the `HandRankingsGuide` component.
4.  The `HandRankingsGuide` will then render the complete list of hands, highlighting those with a `rankValue` greater than the player's.

**4. Implementation Steps:**

1.  **Create `src/data/hand-rankings.ts`**: Define and export the array of hand ranking data.
2.  **Create `src/components/poker/HandRankingsGuide.tsx`**: Build the component to display the hand rankings based on the player's current hand.
3.  **Modify `src/components/poker/DecisionPanel.tsx`**: Add the trigger button and the `Dialog` to display the guide.

**5. Future Improvement (Optional Refactor):**

*   To avoid re-calculating the hand strength in multiple places (`PokerTable`, `DecisionPanel`), we can evaluate the hand within the `GameContext` and add the result (`playerHand`) to the global state. This would make the hand evaluation logic more efficient and maintain a single source of truth. 