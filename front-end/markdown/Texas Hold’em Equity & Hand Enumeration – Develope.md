<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Texas Hold’em Equity \& Hand Enumeration – Developer’s Reference

**TL;DR** – Equity is the share of the pot a hand should win on average.

- Exact equity = (W + ½ · C) ⁄ T where *W* = winning run-outs, *C* = chop run-outs, *T* = total run-outs[^1].
- Pre-flop there are 1 326 distinct two-card starting combos (6 pocket-pair, 4 suited, 12 offsuit per grid cell)[^2][^3].
- Fast evaluation in production relies on bit-encoded cards and perfect-hash lookup tables (≤ 200 kB) that rank 5- to 7-card hands in O(1) time[^4][^5][^6].
The sections below give the math, algorithms, JavaScript/React code, and a ready-to-copy Cursor prompt.


## 1.  Equity Mathematics

| Scenario | Formula | Comment |
| :-- | :-- | :-- |
| Generic seven-card run-out | \$ Equity= \dfrac{W+\frac{C}{2}}{T} \$ | Works when you know villain’s exact cards[^1]. |
| All-in on flop (two cards to come) | Equity ≈ outs × 4% | “Rule-of-4” shortcut[^7][^8]. |
| All-in on turn (one card to come) | Equity ≈ outs × 2% | “Rule-of-2” shortcut[^7][^8]. |

Pot-odds comparison: call is profitable when
\$ Equity \ge \dfrac{Call}{Pot+Call} \$[^9].

## 2.  Counting Available Hands

### 2.1 Pre-flop combinations

| Hand class | Combos per rank | Cells in 13 × 13 grid | Total combos |
| :-- | :-- | :-- | :-- |
| Pocket pair | 6 | 13 | **78** |
| Suited non-pair | 4 | 78 | **312** |
| Off-suit non-pair | 12 | 78 | **936** |
| **Grand total** |  |  | **1 326** |

These counts drop once “dead” cards (board or exposed cards) are removed; multiply the remaining unseen cards to recalc combos[^2].

### 2.2 Post-flop boards

There are

- 19 600 possible flops,
- 1 081 possible turns per flop,
- 46 rivers per turn,
so 19 600 × 1 081 × 46 ≈ 977 *mil* board run-outs. Exhaustive enumeration is feasible only with lookup tables.


## 3.  Evaluating Hand Strength Fast

1. **Bitmask encoding** – 52 bits (one per card).
2. **Prime product trick** – multiply primes representing ranks to make rank collisions impossible in 5-card evaluation (Cactus Kev)[^5].
3. **Perfect-hash tables** – map every unique 5-card product (or suit-reduced key) to a rank 0-7461 with no collisions; extension to 7 cards via two-stage hashing needs ~100–200 kB and <10 CPU ops[^4][^6].
4. **Public libraries**
    - `phevaluator` (C++/Python/WASM)[^10]
    - `holdem-hand-evaluator` (Rust → WASM)[^11]
    - `hand-evaluator` / `poker-evaluator` (Node)[^12].

These return an integer **rank**; lower ranks are stronger. Equality ties the pot automatically.

## 4.  Equity Algorithms

### 4.1 Deterministic (exact)

```pseudo
for each opponentHand in combos(opponentRange, deadCards):
  for each boardRunout in combos(remainingDeck, 5 - board.length):
      myRank  = eval(myCards + boardRunout)
      oppRank = eval(opponentHand + boardRunout)
      W/C/L counters++
equity = (W + 0.5·C) / (W+C+L)
```

Works for ≤2 opponents or tight ranges when paired with a perfect-hash evaluator.

### 4.2 Monte Carlo (approximate)

Sample *N* random opponent hands + boards; increment win/chop counters.
Standard error ≈ √[p(1-p)/N]; 100 000 sims ⇒ ±0.3 pp.

## 5.  JavaScript Implementation (Node + React)

### 5.1 Install evaluator

```bash
npm i phevaluator      # tiny WASM build, ~120 kB
```


### 5.2 Core utility (equity.ts)

```ts
import { evaluateCards } from 'phevaluator/evaluator';

const deck = [...'23456789TJQKA'].flatMap(r =>
  ['c','d','h','s'].map(s => r+s)
);

function remove<T>(arr:T[], removeSet:Set<T>){return arr.filter(x=>!removeSet.has(x));}

export async function monteCarloEquity(
  hero:string[], board:string[], villains:number, sims=100000
){
  let wins=0, chops=0;
  const dead = new Set([...hero, ...board]);

  for(let i=0;i<sims;i++){
    const live   = remove(deck, dead).sort(()=>0.5-Math.random());
    const villainHands = Array.from({length:villains},
                        (_,k)=>live.slice(2*k,2*k+2));
    const restDeck = live.slice(2*villains);
    const need = 5-board.length;
    const runout = restDeck.slice(0, need);

    const heroRank = evaluateCards(...hero, ...board, ...runout);
    const villainRanks = villainHands
            .map(h=>evaluateCards(...h, ...board, ...runout));
    const best = Math.min(heroRank, ...villainRanks);
    const tied = villainRanks.filter(r=>r===best).length;

    if(heroRank===best){
      if(tied) chops++; else wins++;
    }
  }
  const equity = (wins + chops/2) / sims;
  return { equity, wins, chops };
}
```


### 5.3 React hook (useEquity.tsx)

```tsx
import { useState, useEffect } from 'react';
import { monteCarloEquity } from '@/lib/equity';

export function useEquity(hero:string[], board:string[], villains=1){
  const [eq,setEq]=useState<number|null>(null);

  useEffect(()=>{
    let cancelled=false;
    monteCarloEquity(hero, board, villains, 50000)
       .then(({equity})=>!cancelled&&setEq(equity));
    return ()=>{cancelled=true};
  },[hero.toString(), board.toString(), villains]);

  return eq;             // fraction 0-1
}
```



## 6.  Performance Tips

1. Pre-warm the WASM evaluator once on app load.
2. Use **SharedArrayBuffer** or a web worker for large simulation counts to keep UI fluid.
3. For exhaustive equity (solver, trainer), move logic to Node or Rust micro-service; 1 G eval/s is achievable on modern CPUs[^11].

## 7.  Key Sources

Bit masks \& perfect hash[^4][^5][^6] -  Library docs[^11][^10][^12]
Equity formulas \& Rule-of-2/4[^7][^13][^8] -  Hand combinatorics[^2][^3][^14] -  Exact equation (W + ½ C)/T[^1]

Use these references in README or tech-spec to justify the maths and the chosen engine.

<div style="text-align: center">⁂</div>

[^1]: https://poker.stackexchange.com/questions/6541/how-to-mathematically-calculate-equity

[^2]: https://blog.gtowizard.com/a-beginners-guide-to-poker-combinatorics/

[^3]: https://www.888poker.com/magazine/strategy/poker-combinatorics-guide

[^4]: https://github.com/HenryRLee/PokerHandEvaluator

[^5]: http://suffe.cool/poker/evaluator.html

[^6]: https://github.com/HenryRLee/PokerHandEvaluator/

[^7]: https://www.pokerlistings.com/poker-strategies/texas-holdem/how-to-calculate-pot-odds-and-equity-equity

[^8]: https://www.youtube.com/watch?v=8LQDmNePXbE

[^9]: https://www.youtube.com/watch?v=YiU2eBekvVk

[^10]: https://pypi.org/project/phevaluator/

[^11]: https://github.com/b-inary/holdem-hand-evaluator

[^12]: https://github.com/conormkelly/hand-evaluator

[^13]: https://www.reddit.com/r/Poker_Theory/comments/sx4znx/how_can_i_start_understanding_things_like_equity/

[^14]: http://www.stat.ucla.edu/~nchristo/statistics100A/stat100a_poker.pdf

[^15]: https://www.cs.columbia.edu/~sedwards/classes/2023/4995-fall/proposals/PokerEquity.pdf

[^16]: https://www.omnicalculator.com/other/poker-odds

[^17]: https://stackoverflow.com/questions/13923962/enumerating-over-all-poker-head-to-head-hands

[^18]: https://www.pokerbankrollapp.com/Understanding-Poker-Equity-A-Simple-Guide-to-Calculating-Your-Winning-Chances/

[^19]: https://stackoverflow.com/questions/39838817/calculating-poker-preflop-equity-efficient

[^20]: https://rosettacode.org/wiki/Poker_hand_analyser

[^21]: https://www.poker.org/poker-strategy/understanding-poker-equity-aRdc83E3e13E/

[^22]: https://users.dimi.uniud.it/~giuseppe.lancia/psdir/confermaordinario/conference/SOR13.pdf

[^23]: https://stackoverflow.com/questions/193916/how-do-i-programmatically-calculate-poker-odds

[^24]: http://people.math.sfu.ca/~alspach/comp42.pdf

[^25]: https://www.youtube.com/watch?v=QmKRaKcAsKc

[^26]: https://www.pokernews.com/poker-tools/poker-odds-calculator.htm

[^27]: https://www.mrkwatkins.co.uk/evaluating-poker-hands/

[^28]: https://stackoverflow.com/questions/10363927/the-simplest-algorithm-for-poker-hand-evaluation

[^29]: https://lib.rs/crates/poker_eval

[^30]: https://markgritter.livejournal.com/502782.html

[^31]: https://gamedev.stackexchange.com/questions/49302/determining-poker-hands

[^32]: https://docs.rs/poker_eval/latest/poker_eval/

[^33]: https://libraries.io/pypi/phevaluator

[^34]: https://jonathanhsiao.com/blog/evaluating-poker-hands-with-bit-math

[^35]: https://www.youtube.com/watch?v=_4T6RBa7P0o

[^36]: https://github.com/platatat/SnapCall

[^37]: https://www.youtube.com/watch?v=mENr3b4IlqQ

[^38]: https://forumserver.twoplustwo.com/48/computer-technical-help/introducing-my-hand-evaluator-amp-equity-calculator-1621460/

[^39]: https://www.reddit.com/r/algorithms/comments/wuqrjx/algorithm_to_compare_7card_poker_hands/

[^40]: https://www.codeproject.com/Articles/12279/Fast-Texas-Holdem-Hand-Evaluation-and-Analysis

