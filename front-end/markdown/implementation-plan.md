# Poker Training Simulator Implementation Plan

This document outlines the development roadmap for creating the Poker Training Simulator, synthesizing the goals from the "Poker Training Simulator" research and the technical requirements from the "Texas Hold’em Equity & Hand Enumeration" guide.

## Phase 1: Core Engine and Foundational Components

This phase focuses on building the backend logic that will power the simulator.

-   [ ] **Component: Equity Calculator** (`src/utils/equity-calculator.ts`)
    -   [ ] Install and configure the `phevaluator` WASM library for fast hand evaluation.
    -   [ ] Implement a Monte Carlo simulation function (`monteCarloEquity`) as detailed in the technical reference to calculate hand equity against random hands.
    -   [ ] Create a React hook (`useEquity`) to easily consume equity calculations within the UI components.

-   [ ] **Component: Opponent Modeling Engine** (`src/utils/player-profiles.ts`)
    -   [ ] Define data structures for the four primary player archetypes (TAG, LAG, TP, LP).
    -   [ ] Implement the statistical profiles for each player type, including VPIP, PFR, and aggression frequencies based on the research.
    -   [ ] Create a function that can generate a statistically likely action (e.g., fold, call, raise) for a given player profile, game state, and position.

## Phase 2: Scenario Generation and Decision Analysis

This phase focuses on using the core components to create and evaluate the training scenarios.

-   [ ] **Component: Advanced Scenario Generator** (`src/utils/advanced-scenario-generator.ts`)
    -   [ ] Develop a function to procedurally generate a poker hand, using the Opponent Modeling Engine to simulate actions for AI players.
    -   [ ] The generator should be able to pause the simulation at any point (pre-flop, flop, turn, river) to create a decision point for the user.

-   [ ] **Component: Decision Engine** (`src/utils/decision-engine.ts`)
    -   [ ] Implement logic to calculate the Expected Value (EV) of each possible action (fold, call, raise) for the user.
    -   [ ] This engine will serve as the "oracle" to determine the optimal play in any given scenario.

-   [ ] **Component: Advanced Scoring System** (`src/utils/advanced-scoring.ts`)
    -   [ ] Implement the decision quality scoring logic (+100, +50, -50, -100 points) based on the EV of the user's choice compared to the optimal choice.
    -   [ ] Create a function that packages the analysis results (EVs, optimal action, user's score) to be displayed in the feedback dialog.

## Phase 3: UI Integration and Training Modules

This phase connects the backend engine to the user interface and builds out the specific training modules.

-   [ ] **UI: Enhanced Feedback Dialog** (`src/components/poker/EnhancedFeedbackDialog.tsx`)
    -   [ ] Integrate the output from the scoring system to display a detailed breakdown of the decision.
    -   [ ] Clearly show the EV of folding, calling, and raising.
    -   [ ] Provide educational text that explains *why* the optimal decision is correct.

-   [ ] **Training Module Implementation**
    -   [ ] **Pre-flop:** Generate scenarios focused on opening ranges and 3-bet/4-bet situations.
    -   [ ] **Flop:** Generate scenarios focused on continuation betting and facing c-bets.
    -   [ ] **Turn & River:** Generate scenarios for multi-street barrel decisions, value betting, and bluffing.

-   [ ] **UI: Progress Tracking**
    -   [ ] Implement state management to track session statistics (average score, trends).
    -   [ ] Display key performance indicators to the user to highlight improvement and areas of weakness.

## Phase 4: Performance, Polish, and Refinement

-   [ ] **Performance:**
    -   [ ] Implement pre-warming for the WASM hand evaluator to ensure instant calculations.
    -   [ ] Investigate using a Web Worker for Monte Carlo simulations to prevent UI blocking during complex calculations.
-   [ ] **Difficulty Levels:**
    -   [ ] Introduce Beginner, Intermediate, and Advanced modes that control the complexity of the generated scenarios.
-   [ ] **Code Quality:**
    -   [ ] Conduct a final review of the new components, add documentation, and refactor where necessary. 