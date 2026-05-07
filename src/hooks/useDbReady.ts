import { useEffect, useState } from 'react';
import { initDatabase } from '@/database/db';

export const useDbReady = (): boolean => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void initDatabase().then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
};
