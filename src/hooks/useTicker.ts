import { useEffect, useState } from 'react';

export const useTicker = (intervalMs: number = 1000): number => {
  const [t, setT] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
};
