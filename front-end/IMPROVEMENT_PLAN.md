# Poker Trainer Improvement & Feature Development Plan

This document outlines the phased development plan to enhance the Texas Hold'em Poker Hand Trainer from a basic scenario-based quiz to a sophisticated, dynamic training tool based on professional poker theory.

---

### **Phase 1: Introduce Equity Calculation (The Foundation)**

-   **Goal:** Calculate the probability of winning (equity) for a specific player hand against a specific opponent hand through simulation.
-   **Status:** `Completed`
-   **Key Tasks:**
    -   [x] Create a new `src/utils/equity-calculator.ts` utility.
    -   [x] Implement a Monte Carlo simulation function (`calculateEquity`).
        -   This function will take the player's hole cards, the opponent's hole cards, and any community cards as input.
        -   It will simulate the dealing of the remaining unknown cards thousands of times.
        -   For each simulation, it will use the existing `evaluateHand` and `compareHands` functions to determine the winner.
    -   [x] The function will output the win, tie, and loss percentages (e.g., `{ win: 0.85, tie: 0.01, loss: 0.14 }`).
    -   [x] Integrated into `HandAnalysisPanel.tsx` for display.

---

### **Phase 2: Introduce Opponent Hand Ranges**

-   **Goal:** Model the *range* of possible hands an opponent might be holding based on their actions, position, and player type.
-   **Status:** `Completed`
-   **Key Tasks:**
    -   [x] Create a new `src/utils/hand-range.ts` utility.
    -   [x] Develop functions to define and manage hand ranges (e.g., "top 15% of hands," "any pocket pair," "suited connectors").
    -   [x] Define a set of standard pre-flop hand ranges for different player archetypes (e.g., Tight-Aggressive, Loose-Passive) and table positions (e.g., UTG, Button).

---

### **Phase 3: Combine Equity and Ranges for Decision Making**

-   **Goal:** Calculate a player's equity against an opponent's entire *hand range*, providing a more realistic assessment of the situation.
-   **Status:** `Completed`
-   **Key Tasks:**
    -   [x] Update `equity-calculator.ts` to accept a player's hand and an opponent's *hand range* as input.
    -   [x] Modify the simulation to iterate through each hand in the opponent's range, calculating the equity for each matchup.
    -   [x] The final output will be the average equity across the entire range.

---

### **Phase 4: Introduce Pot Odds and Expected Value (EV)**

-   **Goal:** Evolve the tool from an equity calculator to a decision-making engine that recommends the most *profitable* play.
-   **Status:** `Completed`
-   **Key Tasks:**
    -   [x] Integrate pot size and bet amounts into the game context.
    -   [x] Create a utility function to calculate pot odds (the ratio of the current pot size to the amount required to call).
    -   [x] Develop a `DecisionEngine` that compares hand equity against pot odds.
    -   [x] The engine will determine the Expected Value (EV) of an action (e.g., `EV(call) = (Equity * TotalPot) - CostToCall`).
    -   [x] This engine will replace the static `correctDecision` logic, providing dynamic, context-aware advice.

---
