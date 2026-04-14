import { useRef, useState, useCallback, useEffect } from "react";

export const useAccurateTimer = () => {
  const [time, setTime] = useState(0);

  const startTimeRef = useRef(null);
  const pauseOffsetRef = useRef(0);
  const frameRef = useRef(null);
  const runningRef = useRef(false);

  const update = useCallback(() => {
    if (!runningRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;

    setTime(Math.floor(elapsed / 1000));

    frameRef.current = requestAnimationFrame(update);
  }, []);

  const start = useCallback(() => {
    pauseOffsetRef.current = 0;
    startTimeRef.current = Date.now();
    runningRef.current = true;

    frameRef.current = requestAnimationFrame(update);
  }, [update]);

  const pause = useCallback(() => {
    if (!runningRef.current) return;

    runningRef.current = false;
    cancelAnimationFrame(frameRef.current);

    pauseOffsetRef.current = Date.now() - startTimeRef.current;
  }, []);

  const resume = useCallback(() => {
    if (runningRef.current) return;

    startTimeRef.current = Date.now() - pauseOffsetRef.current;
    runningRef.current = true;

    frameRef.current = requestAnimationFrame(update);
  }, [update]);

  const stop = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(frameRef.current);

    startTimeRef.current = null;
    pauseOffsetRef.current = 0;

    setTime(0);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return {
    time,
    start,
    pause,
    resume,
    stop,
  };
};