import { useState, useEffect } from 'react';
import { monteCarloEquity } from '@/utils/equity-calculator';

export interface EquityData {
  equity: number;
  wins: number;
  chops: number;
  sims: number;
}

export function useEquity(hero:string[], board:string[], villains=1, sims=10000): EquityData | null {
  const [data,setData]=useState<EquityData|null>(null);

  useEffect(()=>{
    if (!hero || hero.length < 2 || !board || board.length < 3) {
      setData(null);
      return;
    }
    
    let cancelled=false;
    monteCarloEquity(hero, board, villains, sims)
       .then((result)=>!cancelled&&setData(result));
    return ()=>{cancelled=true};
  },[hero.toString(), board.toString(), villains, sims]);

  return data;
} 