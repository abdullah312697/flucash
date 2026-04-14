import { useCallback, useEffect, useRef, useState } from "react";
import "../../../style/AudioPlayer.css";
import { drawBarsForAudio } from "../../../hooks/drawbars";

let currentAudio = null;

export default function AudioPlayer({source, isMine = true, Cwidth = 150, Cheight = 30, peaks, srcIndex }) {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const peaksRef = useRef([]);
  const hasFetchedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayTime, setDisplayTime] = useState("0:00");
const wasPlayingRef = useRef(false);
const isDraggingRef = useRef(false);
const isTogglingRef = useRef(false);
const [playbackUrl, setPlaybackUrl] = useState(null);
const rafRef = useRef(null);
const [realDuration, setRealDuration] = useState(0);


  const formatTime = (time) => {
    if (!isFinite(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

useEffect(() => {
  if (!source) return;
    setPlaybackUrl(source);
    const audio = audioRef.current;
    if (audio) {
      audio.src = source;
      audio.load();
    }
}, [source]);

const drawWave = useCallback(() => {
  const canvas = canvasRef.current;
  const audio = audioRef.current;

  if (!canvas || !peaksRef.current.length) return;
    const progress =
      audio && realDuration > 0
        ? Math.min(audio.currentTime / realDuration, 1)
        : 0;

    const normalized = peaksRef.current
  drawBarsForAudio({
    canvas,
    peaks: normalized,
    progress,
    playedColor: isMine ? "#00fff2" : "#0078d4",
    unplayedColor: "#d0d0d0",
    direction:"ltr"
  });
}, [isMine, realDuration]);


useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

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



useEffect(() => {
  if (!source || hasFetchedRef.current) return;
  hasFetchedRef.current = true;

  const fetchAudio = async () => {
        let audioCtx;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error("Failed to fetch audio");
        }
        const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const audioBufferduration = audioBuffer.duration;
      const rawData = audioBuffer.getChannelData(0)
      setRealDuration(audioBufferduration);
      setDisplayTime(formatTime(audioBufferduration));

      const barsPerSecond = 30;
    const samples = Math.floor(audioBufferduration * barsPerSecond);
      const blockSize = Math.floor(rawData.length / samples);

      const generatedPeaks = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;

        let sum = 0;

        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }

        generatedPeaks.push(sum / blockSize);
      }

      peaksRef.current = generatedPeaks;
        drawWave();
    } catch (error) {
      console.error("Audio processing error:", error);
      return null;
    }finally {
      if (audioCtx) audioCtx.close();
    }
  };

  fetchAudio();
}, [source, drawWave]);


useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !playbackUrl) return;

  const handleLoadedMetadata = () => {
    setDisplayTime(formatTime(audio.duration));
  };

  const handleTimeUpdate = () => {
    setDisplayTime(formatTime(audio.currentTime));
  };

  audio.addEventListener("loadedmetadata", handleLoadedMetadata);
  audio.addEventListener("timeupdate", handleTimeUpdate);

  return () => {
    audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    audio.removeEventListener("timeupdate", handleTimeUpdate);
  };
}, [playbackUrl]);

useEffect(() => {
  const audio = audioRef.current;
  if (audio) {
    audio._setIsPlaying = setIsPlaying;
  }
}, []);

const togglePlay = async () => {
  if (isTogglingRef.current) return;
  isTogglingRef.current = true;
  const audio = audioRef.current;
  if (!audio) {
    isTogglingRef.current = false;
    return;
  }

  try {
    // if (
    //   currentAudio &&
    //   currentAudio !== audio
    // ) {
    //   currentAudio.pause();
    //   currentAudio.currentTime = 0;
    // }
if (currentAudio && currentAudio !== audio) {
  currentAudio.pause();
  currentAudio.currentTime = 0;

  // ✅ notify previous component
  if (currentAudio._setIsPlaying) {
    currentAudio._setIsPlaying(false);
  }
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
    if (err.name !== "AbortError") {
      console.error(err);
    }
  } finally {
    isTogglingRef.current = false;
  }
};
  // 🎚 Drag / Click Seek (Mouse + Touch)
const seekTo = useCallback((clientX) => {
  const audio = audioRef.current;
  if (!audio || !realDuration) return;
  const rect = canvasRef.current.getBoundingClientRect();
  let percent = (clientX - rect.left) / rect.width;

  percent = Math.max(0, Math.min(1, percent)); // clamp


  const newTime = percent * realDuration;
  audio.currentTime = newTime
  setDisplayTime(formatTime(newTime));
  drawWave();
},[drawWave, realDuration]);

const startDrag = (clientX) => {
  const audio = audioRef.current;
  if (!audio || !realDuration) return;
  isDraggingRef.current = true;
  wasPlayingRef.current = !audio.paused;

  if (wasPlayingRef.current) {
    audio.pause();
  }

  seekTo(clientX);
};

const duringDrag = useCallback((clientX) => {
  if (!isDraggingRef.current) return;
  seekTo(clientX);
},[seekTo]);

const stopDrag = async () => {
  const audio = audioRef.current;

  if (!isDraggingRef.current) return;

  isDraggingRef.current = false;

  if (wasPlayingRef.current) {
    try {
      await audio.play(); // safe resume
    } catch (err) {
      console.log("Play blocked:", err);
    }
  }
};

  useEffect(() => {
  const mouseMove = (e) => duringDrag(e.clientX);
  const mouseUp = () => stopDrag();

  const touchMove = (e) =>
    duringDrag(e.touches[0].clientX);

  const touchEnd = () => stopDrag();

  window.addEventListener("mousemove", mouseMove);
  window.addEventListener("mouseup", mouseUp);

  window.addEventListener("touchmove", touchMove);
  window.addEventListener("touchend", touchEnd);

  return () => {
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);
    window.removeEventListener("touchmove", touchMove);
    window.removeEventListener("touchend", touchEnd);
  };
}, [duringDrag]);


const onEndedFunction = () => {
  setIsPlaying(false);
  drawWave(); 
};

  return (
    <div className={`wave-audio ${isMine ? "mine" : "other"}`}>
      <button className="play-btn" style={{background:`${isMine ? '#00fff2' : '#0078d4'}`}} onClick={togglePlay}>
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
        onEnded={onEndedFunction}
      />
    </div>
  );
}