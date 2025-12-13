// src/utils/rtcConfig.js
export const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // Add TURN servers in production:
    // { urls: 'turn:your.turn.server:3478', username: 'user', credential: 'pass' }
  ],
};
