import { useCallback, useRef, useState } from 'react';
import { streamVoltagent, VoltagentEndpoint } from '@/lib/voltagentClient';

interface UseVoltagentArgs<I> {
  endpoint: VoltagentEndpoint;
  userId: string;
  buildInput: () => I;
}

export function useVoltagentStream<I = unknown, T = unknown>({ endpoint, userId, buildInput }: UseVoltagentArgs<I>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chunks, setChunks] = useState<T[]>([]);
  const doneRef = useRef(false);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    setChunks([]);
    doneRef.current = false;

    const input = buildInput();

    await streamVoltagent<I, T>({ endpoint, userId, input }, {
      onProgress: () => {},
      onChunk: (data) => setChunks((prev) => [...prev, data]),
      onError: (msg) => setError(msg),
      onDone: () => { setLoading(false); doneRef.current = true; },
    });
  }, [endpoint, userId, buildInput]);

  return { start, loading, error, chunks, done: doneRef.current };
}
