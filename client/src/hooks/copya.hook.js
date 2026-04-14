import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { rtcConfig } from "../utils/rtcConfig";
import { useSocket } from "../context/SocketContext";
import {
  CallState,
  CallAction,
  callReducer,
  initialCallState
} from "../state/callReducer";

export function useWebRTCv2() {
  const { socket, isConnected } = useSocket();
  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map());
  const pendingIce = useRef(new Map());
  const callTimerRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const remoteVideoEls = useRef({});
  const [callingState, setCallingState] = useState("IDLE");
const [call, dispatch] = useReducer(callReducer, initialCallState);

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

const getLocalMedia = useCallback(
  async (withVideo = true) => {
    if (localStream) return localStream;

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: withVideo,
      });
    } catch (err) {
      console.error("❌ getUserMedia failed:", err);
      throw err;
    }

    setLocalStream(stream);
    setMicOn(true);
    setCamOn(withVideo);
    setScreenOn(false);
    return stream;
  },
  [localStream]
);

useEffect(() => {
  if (localVideoRef.current && localStream) {
    localVideoRef.current.srcObject = localStream;
    localVideoRef.current.muted = true; // IMPORTANT for autoplay
    localVideoRef.current.play().catch(() => {});
    console.log("✅ local video playing");
  }
}, [localStream]);

  // =========================
  // PEER CONNECTION
  // =========================
  // const createPeerFor = useCallback(
  //   (remoteId, callId) => {
  //     if (peerConnections.current.has(remoteId)) {
  //       return peerConnections.current.get(remoteId);
  //     }

  //     const pc = new RTCPeerConnection(rtcConfig);

  //     if (localStream) {
  //       localStream.getTracks().forEach((track) =>
  //         pc.addTrack(track, localStream)
  //       );
  //     }

  //     pc.ontrack = (e) => {
  //       const stream = e.streams[0];
  //       setRemoteStreams((prev) => ({
  //         ...prev,
  //         [remoteId]: stream,
  //       }));
  //     };

  //     pc.onicecandidate = (e) => {
  //       if (e.candidate) {
  //         socket.emit("call:ice", {
  //           callId,
  //           to: remoteId,
  //           candidate: e.candidate,
  //         });
  //       }
  //     };

  //     pc.onconnectionstatechange = () => {
  //       if (pc.connectionState === "connected") {
  //         setIsInCall(true);
  //         startTimer();
  //       }

  //       if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
  //         pc.close();
  //         peerConnections.current.delete(remoteId);

  //         setRemoteStreams((prev) => {
  //           const copy = { ...prev };
  //           delete copy[remoteId];
  //           return copy;
  //         });
  //       }
  //     };

  //     peerConnections.current.set(remoteId, pc);
  //     return pc;
  //   },
  //   [localStream, socket]
  // );
const createPeerFor = useCallback((remoteId, callId) => {
  let pc = peerConnections.current.get(remoteId);

  if (!pc) {
    pc = new RTCPeerConnection(rtcConfig);
    peerConnections.current.set(remoteId, pc);

    pc.ontrack = (e) => {
      const stream = e.streams[0];
      setRemoteStreams(prev => ({
        ...prev,
        [remoteId]: stream,
      }));
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("call:ice", {
          callId,
          to: remoteId,
          candidate: e.candidate,
        });
      }
    };
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setIsInCall(true);
            startTimer();
          }
        }

  }

  // 🔥 CRITICAL: ensure tracks are added exactly once
  if (localStream) {
    const senders = pc.getSenders();
    localStream.getTracks().forEach(track => {
      if (!senders.find(s => s.track === track)) {
        pc.addTrack(track, localStream);
      }
    });
  }

  return pc;
}, [localStream, socket]);

  // =========================
  // CALLER
  // =========================
  const startCall = async ({ participants, callType, conversationId = null }) => {

  if (!isConnected || !socket?.id) {
    console.log("❌ socket not ready");
    return;
  }

  await getLocalMedia(callType === "video");

  if (!socket.connected) {
    console.log("❌ socket lost after media");
    return;
  }

  const safeParticipants = participants
    .filter(Boolean)
    .map(id => String(id));

  const safeConversationId = conversationId
    ? String(conversationId)
    : null;
    
  socket.emit(
    "call:invite",
    {
      participants: safeParticipants,
      callType,
      conversationId: safeConversationId,
    },
    async (res) => {
      console.log("📨 invite ACK:", res);

      if (!res?.ok) return;

      const { callId } = res;

      setActiveCall({ callId, callType, participants: safeParticipants });
      setIsInCall(true);

      for (const remoteId of safeParticipants) {
        const pc = createPeerFor(remoteId, callId);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call:offer", {
          callId,
          to: remoteId,
          sdp: offer,
        });
      }
    }
  );
};


  // =========================
  // SOCKET EVENTS
  // =========================
  useEffect(() => {
    const onIncoming = (payload) => {
      console.log(payload);
      console.log(socket.employeeId);
      if (payload.from === socket.employeeId) return;
      setIncomingCall(payload);
    };
    setCallingState("RINGING");  
    socket.on("call:incoming", onIncoming);
    return () => socket.off("call:incoming", onIncoming);
  }, [socket]);

  useEffect(() => {
    const onOffer = async ({ callId, from, sdp }) => {
      await getLocalMedia(true);

      const pc = createPeerFor(from, callId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", { callId, to: from, sdp: answer });

      const buffered = pendingIce.current.get(from) || [];
      buffered.forEach((c) => pc.addIceCandidate(c));
      pendingIce.current.delete(from);
    };

    socket.on("call:offer", onOffer);
    return () => socket.off("call:offer", onOffer);
  }, [socket, createPeerFor, getLocalMedia]);

  useEffect(() => {
    const onAnswer = async ({ from, sdp }) => {
      const pc = peerConnections.current.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    socket.on("call:answer", onAnswer);
    return () => socket.off("call:answer", onAnswer);
  }, [socket]);

  useEffect(() => {
    const onIce = async ({ from, candidate }) => {
      const pc = peerConnections.current.get(from);
      if (!pc || !pc.remoteDescription) {
        pendingIce.current.set(from, [
          ...(pendingIce.current.get(from) || []),
          candidate,
        ]);
        return;
      }
      await pc.addIceCandidate(candidate);
    };

    socket.on("call:ice", onIce);
    return () => socket.off("call:ice", onIce);
  }, [socket]);

  // =========================
  // ACCEPT / REJECT
  // =========================

  const acceptCall = async () => {
    if (!incomingCall) return;
    setCallingState("ACCEPTING");  
    await getLocalMedia(incomingCall.callType === "video");
    setActiveCall(incomingCall);
    setIncomingCall(null);
    setIsInCall(true);
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    setCallingState("REJECTED");  
    socket.emit("call:end", {
      callId: incomingCall.callId,
      reason: "rejected",
    });
    setIncomingCall(null);

  };

  // =========================
  // TOGGLES
  // =========================
  const toggleMic = () => {
    const track = localStream?.getAudioTracks()?.[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };
//==toggleCam==//
  const toggleCam = () => {
    const track = localStream?.getVideoTracks()?.[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  };
//==toggleScreenShare==//
  const toggleScreenShare = async () => {
    if (!localStream || peerConnections.current.size === 0) return;

    const display = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

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

  // =========================
  // END CALL
  // =========================
  const endCall = (reason = "hangup") => {
    setCallingState("ENDED");  
    socket.emit("call:end", { callId: activeCall?.callId, reason });

    stopTimer();

    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }

    setLocalStream(null);
    setRemoteStreams({});
    setIncomingCall(null);
    setActiveCall(null);
    setIsInCall(false);
    setMicOn(true);
    setCamOn(true);
    setScreenOn(false);
  };

  // =========================
  // HELPERS
  // =========================
useEffect(() => {
  Object.entries(remoteStreams).forEach(([id, stream]) => {
    const el = remoteVideoEls.current[id];
    if (el && stream && el.srcObject !== stream) {
      el.srcObject = stream;
      console.log("🎥 binding remote stream to video:", id);
      el.play?.().catch(() => {});
    }
  });
}, [remoteStreams]);

  const formattedTimer = () => {
    const s = callDuration;
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  // =========================
  // EXPORT
  // =========================
  return {
    callingState,
    localVideoRef,
    remoteVideoEls,
    localStream,
    remoteStreams,
    incomingCall,
    activeCall,
    isInCall,

    startCall,
    acceptCall,
    rejectCall,
    endCall,

    toggleMic,
    toggleCam,
    toggleScreenShare,

    micOn,
    camOn,
    screenOn,

    callDuration,
    formattedTimer,
  };
}
