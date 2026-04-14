import { useCallback, useEffect, useRef, useState } from "react";
import "../../../style/AudioPlayer.css";
import { drawBarsForVoice } from "../../../hooks/drawbars";

let currentAudio = null;

export default function VoicePlayer({
  source,
  isMine = true,
  Cwidth = 150,
  Cheight = 30,
  peaks,
}) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const peaksRef = useRef([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [displayTime, setDisplayTime] = useState("0:00");
  const [playbackUrl, setPlaybackUrl] = useState(null);

  const [duration, setDuration] = useState(0); // ✅ REAL duration (number)
  const [isReady, setIsReady] = useState(false);

  const wasPlayingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isTogglingRef = useRef(false);
  const rafRef = useRef(null);

  // ------------------ FORMAT TIME ------------------
  const formatTime = (time) => {
    if (!isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  // ------------------ LOAD AUDIO ------------------
  useEffect(() => {
    if (!source) return;

    const url = URL.createObjectURL(source);
    setPlaybackUrl(url);

    const audio = audioRef.current;
    if (audio) {
      audio.src = url;
      audio.load();
    }

    // 🔥 AudioContext for instant duration
    const getDuration = async () => {
      let ctx;
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = await source.arrayBuffer();
        const decoded = await ctx.decodeAudioData(buffer);

        const d = decoded.duration;

        setDuration(d);
        setDisplayTime(formatTime(d));
        setIsReady(true); // ✅ allow seek instantly
      } catch (err) {
        console.error("Duration error:", err);
      } finally {
        if (ctx) ctx.close();
      }
    };

    getDuration();

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [source]);

  // ------------------ WAVE DRAW ------------------
  const drawWave = useCallback(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;

    if (!canvas || !peaksRef.current.length) return;

    const progress =
      audio && duration > 0
        ? Math.min(audio.currentTime / duration, 1)
        : 0;

    drawBarsForVoice({
      canvas,
      peaks: peaksRef.current,
      progress,
      playedColor: isMine ? "#00fff2" : "#0078d4",
      unplayedColor: "#d0d0d0",
      direction: "ltr",
    });
  }, [duration, isMine]);

  // ------------------ RAF LOOP ------------------
  useEffect(() => {
    const update = () => {
      drawWave();
      rafRef.current = requestAnimationFrame(update);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(rafRef.current);
      drawWave();
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, drawWave]);

  // ------------------ PEAKS ------------------
  useEffect(() => {
    if (peaks?.length) {
      peaksRef.current = peaks;
      requestAnimationFrame(drawWave);
    }
  }, [peaks, drawWave]);

  // ------------------ PLAY / PAUSE ------------------
  const togglePlay = async () => {
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;

    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      if (audio.paused) {
        currentAudio = audio;
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isTogglingRef.current = false;
    }
  };

  // ------------------ SEEK ------------------
  const seekTo = useCallback(
    (clientX) => {
      const audio = audioRef.current;
      if (!audio || !isReady || duration <= 0) return;

      const rect = canvasRef.current.getBoundingClientRect();
      let percent = (clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));

      const newTime = percent * duration;

      audio.currentTime = newTime;
      setDisplayTime(formatTime(newTime));

      drawWave();
    },
    [duration, isReady, drawWave]
  );

  // ------------------ DRAG ------------------
  const startDrag = (clientX) => {
    if (!isReady) return;

    const audio = audioRef.current;

    isDraggingRef.current = true;
    wasPlayingRef.current = !audio.paused;

    if (wasPlayingRef.current) {
      audio.pause();
    }

    seekTo(clientX);
  };

  const duringDrag = useCallback(
    (clientX) => {
      if (!isDraggingRef.current) return;
      seekTo(clientX);
    },
    [seekTo]
  );

  const stopDrag = async () => {
    const audio = audioRef.current;

    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    if (wasPlayingRef.current) {
      try {
        await audio.play();
      } catch (err) {}
    }
  };

  useEffect(() => {
    const move = (e) => duringDrag(e.clientX);
    const up = () => stopDrag();

    const touchMove = (e) => duringDrag(e.touches[0].clientX);
    const touchEnd = () => stopDrag();

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", touchMove);
    window.addEventListener("touchend", touchEnd);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("touchend", touchEnd);
    };
  }, [duringDrag]);

  // ------------------ AUDIO EVENTS ------------------
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || isDraggingRef.current) return;

    setDisplayTime(formatTime(audio.currentTime));
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setDisplayTime(formatTime(duration));
  };

  // ------------------ UI ------------------
  return (
    <div className={`wave-audio ${isMine ? "mine" : "other"}`}>
      <button
        className="play-btn"
        style={{ background: isMine ? "#00fff2" : "#0078d4" }}
        onClick={togglePlay}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      <div className="autioPlayerCanvasContainer">
        <canvas
          ref={canvasRef}
          width={Cwidth}
          height={Cheight}
          className="wave-canvas"
          onMouseDown={(e) => startDrag(e.clientX)}
          onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        />

        <span className="duration">{displayTime}</span>
      </div>

      <audio
        ref={audioRef}
        src={playbackUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
}