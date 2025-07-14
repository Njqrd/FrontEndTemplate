# Texas Hold'em Poker Trainer - Technical Documentation

## 1. Project Overview

This document outlines the technical architecture and implementation details of the React-based Texas Hold'em Poker Trainer application. The primary goal of the app is to help players improve their poker skills by presenting them with dynamic, randomly generated poker scenarios and providing instant feedback on their decisions.

The core of the application is a dynamic training mode where users are dropped into a random hand on the flop, turn, or river and must choose to fold, call, or raise based on the strength of their hand.

## 2. Core Technologies

-   **Framework**: React 18+ with Hooks
-   **Build Tool**: Vite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS with `shadcn/ui` for pre-built components.
-   **State Management**: React Context API with the `useReducer` hook.
-   **Routing**: `react-router-dom`

## 3. Project Structure

The project follows a standard feature-oriented structure within the `src` directory:

-   `components/`: Contains all React components.
    -   `layout/`: Components that define the application's structure (e.g., `Header`, `RootLayout`).
    -   `poker/`: Components specific to the poker game itself (e.g., `Card`, `PokerTable`, `DecisionPanel`).
    -   `ui/`: Pre-styled, reusable UI components from `shadcn/ui`.
-   `contexts/`: Houses the global state management logic (`GameContext.tsx`).
-   `data/`: Contains static data, such as the initial list of scenarios.
-   `hooks/`: For custom React hooks (currently unused, but reserved).
-   `pages/`: Top-level components that correspond to application routes (e.g., `HomePage`, `TrainingPage`).
-   `types/`: Holds all TypeScript type and interface definitions.
-   `utils/`: Contains core application logic and utility functions that are not React components (e.g., `hand-evaluator`, `deck`).

## 4. Component Breakdown

### Core UI Components

-   **`Card.tsx`**: Renders a single, detailed playing card. It accepts `suit`, `rank`, and `faceUp` props to dynamically display any card from a standard 52-card deck with appropriate colors and symbols.

-   **`PokerTable.tsx`**: The main game board. It consumes the global `GameContext` to display the current scenario's `holeCards`, `communityCards`, and `potSize`. It also uses the `hand-evaluator` utility to calculate and display the name of the player's best hand in real-time.

-   **`DecisionPanel.tsx`**: The primary user interaction component. It displays the current scenario's title and action prompt, along with "Fold," "Call," and "Raise" buttons. When a user makes a decision, it dispatches actions to the `GameContext` and triggers the `FeedbackDialog`.

-   **`FeedbackDialog.tsx`**: A modal component that appears after a decision is made. It shows whether the choice was correct or incorrect, provides a detailed explanation from the scenario, and has a "Next Hand" button that triggers the loading of a new dynamic scenario.

### Layout & Pages

-   **`App.tsx`**: The root component of the application. It sets up the `GameProvider` to make global state available and defines all the application routes using `react-router-dom`.
-   **`RootLayout.tsx`**: A wrapper component that includes the persistent `Header` and renders the content for the current route.
-   **`Header.tsx`**: The main navigation bar. It displays links to all pages and consumes the `GameContext` to show the player's live `chips` and `streak` count.
-   **`TrainingPage.tsx`**: The main page for the dynamic training mode. It simply assembles the `PokerTable` and `DecisionPanel` components to create the core gameplay interface.
-   **`PracticePage.tsx`**: A secondary mode for continuous, street-by-street play. It manages its own local state to allow users to deal random hands and see the flop, turn, and river unfold at their own pace.

## 5. State Management (`GameContext.tsx`)

Global state is managed via React's Context API to avoid prop drilling.

-   **`GameState`**: The context holds the `currentScenario` object and the `playerStats` (chips, streak, etc.).
-   **`gameReducer`**: A reducer function manages all state transitions. The primary actions are:
    -   `LOAD_DYNAMIC_SCENARIO`: Calls the `scenario-generator` utility to create a new, random scenario and updates the state.
    -   `SUBMIT_DECISION`: Updates the player's stats (chips and streak) based on whether their decision was correct.
-   **`useGame()`**: A custom hook that provides easy, one-line access to the game state and the `dispatch` function from any component.

## 6. Core Logic Utilities (`src/utils`)

-   **`deck.ts`**: Contains all logic related to a deck of cards. It exports functions to `createDeck()`, `shuffleDeck()`, and `dealCards()`.
-   **`hand-evaluator.ts`**: The poker engine. Its main export, `evaluateHand()`, takes an array of 7 cards and returns an `EvaluatedHand` object, which contains the hand's rank (e.g., `HandRank.FULL_HOUSE`), its name ("Full House"), and the 5 cards that make up the hand. It correctly identifies all hand types from Royal Flush to High Card.
-   **`scenario-generator.ts`**: The engine for the dynamic training mode. Its `generateScenario()` function performs the following steps:
    1.  Creates and shuffles a new deck.
    2.  Randomly determines a street (Flop, Turn, or River).
    3.  Deals the appropriate number of cards for the player and the community.
    4.  Evaluates the player's hand using the `hand-evaluator`.
    5.  Uses a simplified logic (e.g., "raise with two pair or better") to determine a "correct" action and generate an explanation.
    6.  Returns a complete `Scenario` object.

## 7. The Dynamic Gameplay Loop

The primary user experience on the **Training Page** flows as follows:

1.  The `GameContext` initializes and immediately calls `generateScenario()` to create the first random hand.
2.  The `PokerTable` and `DecisionPanel` render, displaying the generated cards and the decision prompt. The `PokerTable` also calls `evaluateHand()` to show the player what their current best hand is.
3.  The user clicks "Fold," "Call," or "Raise" in the `DecisionPanel`.
4.  The `handleDecision` function in the `DecisionPanel` compares the user's choice to the `correctDecision` from the scenario.
5.  It dispatches a `SUBMIT_DECISION` action, and the `gameReducer` updates the `playerStats`. The `Header` immediately reflects the new chip and streak counts.
6.  The `FeedbackDialog` opens, showing the user if they were correct and why.
7.  The user clicks "Next Hand" in the dialog.
8.  The `handleContinue` function in the `DecisionPanel` dispatches a `LOAD_DYNAMIC_SCENARIO` action.
9.  The `gameReducer` calls `generateScenario()` again, creating a completely new, random hand, and the loop begins again. 