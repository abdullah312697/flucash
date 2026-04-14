import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { rtcConfig } from "../utils/rtcConfig";
import { useSocket } from "../context/SocketContext";
import {
  CallState,
  CallAction,
  callReducer,
  initialCallState,
} from "../state/callReducer";

export function useWebRTCv2() {
  const { socket, isConnected } = useSocket();

  // -------------------------
  // REFS
  // -------------------------
  const localVideoRef = useRef(null);
  const localVideoinRemote = useRef(null);
  const localVideoinCalling = useRef(null);
  const remoteVideoEls = useRef({});
  const peerConnections = useRef(new Map());
  const pendingIce = useRef(new Map());
  const callTimerRef = useRef(null);
  const activeCallIdRef = useRef(null);
  const localStreamRef = useRef(null);
  const incomingOfferRef = useRef(null);
  // -------------------------
  // STATE
  // -------------------------
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [callDuration, setCallDuration] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [callerData,setCallerData] = useState({
                                              callType : "",
                                              callerName : "",
                                              callerImg : "",
                                              });
  const [call, dispatch] = useReducer(callReducer, initialCallState);
  

  // -------------------------
  // TIMER
  // -------------------------
  const startTimer = () => {
    if (callTimerRef.current) return;
    callTimerRef.current = setInterval(() => {
      setCallDuration((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  };



  // -------------------------
  // LOCAL MEDIA
  // -------------------------
  const getLocalMedia = useCallback(
    async (withVideo) => {
    if (localStreamRef.current) return localStreamRef.current;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: withVideo,
        });

        localStreamRef.current = stream; 
        setLocalStream(stream);

        setMicOn(true);
        setCamOn(withVideo);
        setScreenOn(false);

        return stream;
      } catch (err) {
        console.error("❌ getUserMedia failed:", err);
        throw err;
      }
    },
    []
  );

const cleanupCall = useCallback(() => {
  if (!activeCallIdRef.current) return;
  activeCallIdRef.current = null;
  // stop all peer connections
  localStreamRef.current = null;
  peerConnections.current.forEach(pc => {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    pc.close();
  });
  peerConnections.current.clear();

  // stop local media
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  // stop remote streams
  Object.values(remoteStreams).forEach(stream => {
    stream.getTracks().forEach(track => track.stop());
  });

  setLocalStream(null);
  setRemoteStreams({});
  stopTimer();

  // reset UI toggles
  setMicOn(false);
  setCamOn(false);
  setScreenOn(false);
},[localStream, remoteStreams]);

  useEffect(() => {
  if (!localStream) return;
  if (localVideoinCalling.current) {
    localVideoinCalling.current.srcObject = localStream;
    localVideoinCalling.current.muted = true; // IMPORTANT
    localVideoinCalling.current.play().catch(() => {});
  }
  if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true; // IMPORTANT
      localVideoRef.current.play().catch(() => {});
  }
  if (localVideoinRemote.current) {
      localVideoinRemote.current.srcObject = localStream;
      localVideoinRemote.current.muted = true; // IMPORTANT
      localVideoinRemote.current.play().catch(() => {});
  }
}, [localStream]);

  // -------------------------
  // PEER CONNECTION
  // -------------------------

  const safeClosePeer = useCallback((remoteId) => {
    console.log(`safe close fire by: ${remoteId}`);
  const pc = peerConnections.current.get(remoteId);
  if (!pc) return;

  pc.ontrack = null;
  pc.onicecandidate = null;
  pc.onconnectionstatechange = null;
  pc.oniceconnectionstatechange = null;

  pc.close();
  peerConnections.current.delete(remoteId);

  setRemoteStreams((prev) => {
    const copy = { ...prev };
    delete copy[remoteId];
    return copy;
  });

  if (peerConnections.current.size === 0) {
    cleanupCall();
    dispatch({ type: CallAction.END_CALL });
  }
},[cleanupCall]);

  const createPeerFor = useCallback(
    (remoteId, callId) => {
      let pc = peerConnections.current.get(remoteId);
      const stream = localStreamRef.current;
      if (!pc) {
        pc = new RTCPeerConnection(rtcConfig);
        peerConnections.current.set(remoteId, pc);
        pc.ontrack = (e) => {
          const stream = e.streams[0];
          setRemoteStreams((prev) => ({
            ...prev,
            [remoteId]: stream,
          }));
        };

        pc.onicecandidate = (e) => {
          if (!e.candidate) return;
          socket.emit("call:ice", {
              callId,
              remoteId,
              candidate: e.candidate,
            });
        };

    pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "connected") {
          dispatch({ type: CallAction.CONNECTED });
          startTimer();
        }

        if (["failed", "closed"].includes(pc.iceConnectionState)) {
          safeClosePeer(remoteId);
        }
      };

      // 🔹 CONNECTION STATE (SECONDARY)
      pc.onconnectionstatechange = () => {
        console.log("PC:", pc.connectionState);
        if (["failed", "closed"].includes(pc.connectionState)) {
          safeClosePeer(remoteId);
        }
      };
      }

      if (stream) {
        const senders = pc.getSenders();
        stream.getTracks().forEach((track) => {
          if (!senders.find((s) => s.track === track)) {
            pc.addTrack(track, stream);
          }
        });
      }
      return pc;
    },
    [socket, dispatch, safeClosePeer]
  );
  // -------------------------
  // START CALL (CALLER)
  // -------------------------
  const startCall = async ({ participants, callType, conversationId = null, calleeName, calleeImg, callerName, callerImg }) => {
      setMicOn(true);
      setCamOn(true);
      setCallerData({
        ...callerData,
        callType : callType,
        callerName : callerName,
        callerImg : callerImg
      });

    if (!isConnected || !socket?.id) return;

    if(callType === "video"){
      await getLocalMedia(true);
    }else{
      await getLocalMedia(false);
    }

    const safeParticipants = participants.filter(Boolean).map(String);

    socket.emit(
      "call:invite",
      {
        participants: safeParticipants,
        callType,
        conversationId: conversationId ? String(conversationId) : null,
        calleeName,
        calleeImg,
      },
      async (res) => {
        if (!res?.ok) return;
        const { callId } = res;

        activeCallIdRef.current = callId;
        dispatch({ type: CallAction.START_CALL, payload: { callId } });

        await Promise.all(safeParticipants.map(async (remoteId) => {
        const pc = createPeerFor(remoteId, callId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:offer", { callId, remoteId, offer });
}));
      }
    );
  };

  // -------------------------
  // SOCKET EVENTS
  // -------------------------
  useEffect(() => {
    const onIncoming = (payload) => {
      activeCallIdRef.current = payload.callId;
      if (payload.from === socket.employeeId) return;
            setMicOn(true);
           setCamOn(true);
      dispatch({ type: CallAction.INCOMING_CALL, payload });
    };

    const onOffer = async ({callId, remoteId, offer}) => {
      if(call?.incomingCaller?.callType === "video"){
          await getLocalMedia(true);
      }else{
          await getLocalMedia(false);
      }

        incomingOfferRef.current = { callId, remoteId, offer };
    };

const onAnswer = async ({ callId, remoteId, answer }) => {
  const pc = peerConnections.current.get(remoteId);
  if (!pc) {
    console.warn("No RTCPeerConnection for", remoteId);
    return;
  }
  if (pc.__answerApplied) {
    console.warn("Duplicate answer ignored", remoteId);
    return;
  }
  try {
    await pc.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
    const key = `${callId}:${remoteId}`;
    const buffered = pendingIce.current.get(key);

if (buffered?.length) {
  for (const c of buffered) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(c));
    } catch (e) {
      console.warn("Buffered ICE failed:", e);
    }
  }
  pendingIce.current.delete(key);
}

    pc.__answerApplied = true; // ✅ mark AFTER success
  } catch (err) {
    console.error("setRemoteDescription(answer) failed", err);
  }
};

const onIce = async ({ callId, remoteId, candidate }) => {
  const key = `${callId}:${remoteId}`;

  const pc = peerConnections.current.get(remoteId);

  if (!pc || !pc.remoteDescription) {
    pendingIce.current.set(key, [
      ...(pendingIce.current.get(key) || []),
      candidate,
    ]);
    return;
  }

  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.warn("ICE add failed:", err);
  }
};

    socket.on("call:incoming", onIncoming);
    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice", onIce);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice", onIce);
    };
  }, [socket,getLocalMedia,call?.incomingCaller?.callType]);
  // -------------------------
const acceptCall = async () => {
 const { callId, remoteId, offer } = incomingOfferRef.current;

      if(call?.incomingCaller?.callType === "video"){
          await getLocalMedia(true);
      }else{
          await getLocalMedia(false);
      }

      const pc = createPeerFor(remoteId, callId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const key = `${callId}:${remoteId}`;
      const buffered = pendingIce.current.get(key);

if (buffered?.length) {
  for (const c of buffered) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(c));
    } catch (e) {
      console.warn("Buffered ICE failed:", e);
    }
  }
  pendingIce.current.delete(key);
}

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("call:answer", { callId, remoteId, answer });

  dispatch({ type: CallAction.ACCEPT_CALL });
};

const rejectCall = (reason = "rejected") => {
  if (!activeCallIdRef.current) return;
  try {
    socket.emit("call:end", {
      callId: activeCallIdRef.current,
      reason: reason,
    });
    cleanupCall();
    dispatch({ type: CallAction.REJECT_CALL });
  } catch (err) {
    console.error("rejectCall failed:", err);
  }
};

  // -------------------------
  // TOGGLES
  // -------------------------
  const toggleMic = () => {
    const track = localStream?.getAudioTracks()?.[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  const toggleCam = () => {
    const track = localStream?.getVideoTracks()?.[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  };

  const toggleScreenShare = async () => {
    if (!localStream || peerConnections.current.size === 0) return;

    const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const screenTrack = display.getVideoTracks()[0];

    peerConnections.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      sender?.replaceTrack(screenTrack);
    });

    setScreenOn(true);

    screenTrack.onended = () => {
      const camTrack = localStream.getVideoTracks()[0];
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(camTrack);
      });
      setScreenOn(false);
    };
  };

const endCall = (reason = "hangup") => {
const callId = activeCallIdRef.current;
if (!callId) {
    console.warn("endCall: missing callId");
    cleanupCall();
    dispatch({ type: CallAction.END_CALL });
    return;
  }

  socket.emit("call:end", {
    callId,
    reason,
  });

  cleanupCall();
  dispatch({ type: CallAction.END_CALL });
};

useEffect(() => {
  const onRemoteEnd = ({ callId, reason }) => {
    if (activeCallIdRef.current !== callId) return;
    cleanupCall();
    dispatch({ type: CallAction.END_CALL });
  };
  socket.on("call:end", onRemoteEnd);
  return () => {
    socket.off("call:end", onRemoteEnd);
  };
}, [socket, cleanupCall]);

  // -------------------------
  // BIND REMOTE STREAMS
  // -------------------------
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([id, stream]) => {
      const el = remoteVideoEls.current[id];
      if (el && stream && el.srcObject !== stream) {
        el.srcObject = stream;
        el.play?.().catch(() => {});
      }
    });
  }, [remoteStreams]); 

  // -------------------------
  // FORMATTED TIMER
  // -------------------------
  const formattedTimer = () => {
    const s = callDuration;
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  // -------------------------
  // RETURN HOOK API
  // -------------------------
  return {
    call,
    localVideoRef,
    localVideoinCalling,
    localVideoinRemote,
    remoteVideoEls,
    localStream,
    remoteStreams,
    isInCall: call.state === CallState.IN_CALL || call.state === CallState.ACCEPTING,
    callDuration,
    formattedTimer,
    micOn,
    camOn,
    screenOn,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    callerData
  };
}
