export function analyzeAudioFrame(analyser, state) {

  const bufferLength = analyser.fftSize;
  const data = new Uint8Array(bufferLength);

  analyser.getByteTimeDomainData(data);
  let peak = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = Math.abs((data[i] - 128) / 128);
    if (v > peak) peak = v;
  }

  if (!state.calibrated) {

    state.frames++;
    state.max = Math.max(state.max, peak);

    if (state.frames > 20) {
      state.calibrated = true;
      state.max = Math.max(state.max, 0.12);
    }
  }

  let normalized = peak / (state.max || 1);
  normalized = Math.pow(normalized, 0.8);
  
  normalized = Math.max(normalized, 0.05);
  if (normalized < 0.06) normalized = 0.06;
  return Math.min(1, normalized);
}


export function drawBarsForVoice({
  canvas,
  peaks,
  playedColor = "#4caf50",
  unplayedColor = "#d0d0d0",
  barWidth = 4,
  barGap = 2,
  progress,
  direction = "rtl",
}) {
  const ctx = canvas.getContext("2d");
  const height = canvas.height;
  const centerY = height / 2;
  const totalBars = Math.floor(canvas.width / 6);
  ctx.clearRect(0, 0, canvas.width, height);
    const chunkSize = (peaks.length / totalBars);
    if(direction === "rtl"){
    for (let i = 0; i < peaks.length; i++) {
    const value = peaks[i];
    const barHeight = Math.max(3, value * height);
    const x = Math.round(canvas.width - (i + 1) * (barWidth + barGap));
    const y = Math.round(centerY - barHeight / 2);
    const playedBars = Math.floor(progress * totalBars);
    ctx.fillStyle = i < playedBars ? unplayedColor : playedColor;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
    ctx.fill();
  }
    }else{
    for (let i = 0; i < totalBars; i++) {

    const start = Math.floor(i * chunkSize);
    const end = Math.floor((i + 1) * chunkSize);
    let max = 0;
    for (let j = start; j < end; j++) {
      max += peaks[j];
    }
    const x = Math.round(i * (barWidth + barGap));
    const barSize = max * height / 2;
    const y = Math.round(centerY - barSize / 2);
    const playedBars = Math.floor(progress * totalBars);
    ctx.fillStyle = i < playedBars ? playedColor : unplayedColor;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barSize, barWidth / 2);
    ctx.fill();
  }
    }
}


export function drawBarsForAudio({
  canvas,
  peaks,
  playedColor = "#4caf50",
  unplayedColor = "#d0d0d0",
  barWidth = 4,
  barGap = 2,
  progress,
}) {
  const ctx = canvas.getContext("2d");
  const height = canvas.height;
  const centerY = height / 2;

  const totalBars = Math.floor(canvas.width / (barWidth + barGap));

  ctx.clearRect(0, 0, canvas.width, height);
  // ✅ normalize peaks
  const maxPeak = Math.max(...peaks) || 1;

  const chunkSize = peaks.length / totalBars;
    const playedBars = Math.floor(progress * totalBars);

  for (let i = 0; i < totalBars; i++) {
    const start = Math.floor(i * chunkSize);
    const end = Math.floor((i + 1) * chunkSize);

    let sum = 0;
    let count = 0;

    for (let j = start; j < end; j++) {
      sum += Math.abs(peaks[j]);
      count++;
    }
    let value = count ? sum / count : 0;
    value = Math.sqrt(value);
    value = value / maxPeak;

    let barHeight = value * height;
    barHeight = Math.max(barHeight, barWidth);
    const x = Math.round(i * (barWidth + barGap));
    const y = Math.round(centerY - barHeight / 2);
    ctx.fillStyle = i < playedBars ? playedColor : unplayedColor;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
    ctx.fill();
  }
}
