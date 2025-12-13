// src/hooks/useWebRTCv2.js
import { useCallback, useEffect, useRef, useState } from "react";
import { rtcConfig } from "../utils/rtcConfig";
import { useSocket } from "../context/SocketContext";

export function useWebRTCv2() {
  const { socket } = useSocket();

  // ---------------- REFS ----------------
  const localVideoRef = useRef(null);
  // const remoteVideoRefs = useRef(new Map());
  const peerConnections = useRef(new Map()); // remoteId -> RTCPeerConnection
  const pendingIce = useRef(new Map()); // remoteId -> ICE candidates
  const callTimerRef = useRef(null);

  // ---------------- STATE ----------------
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const remoteRefs = useRef({});
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  const [callDuration, setCallDuration] = useState(0);

  // ---------------- TIMER ----------------
  const startTimer = () => {
    if (callTimerRef.current) return;
    callTimerRef.current = setInterval(
      () => setCallDuration((s) => s + 1),
      1000
    );
  };

  const stopTimer = () => {
    clearInterval(callTimerRef.current);
    callTimerRef.current = null;
    setCallDuration(0);
  };

  // ---------------- MEDIA ----------------
  const getLocalMedia = useCallback(async (video = true) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video,
    });

    setLocalStream(stream);
    setMicOn(true);
    setCamOn(video);
    setScreenOn(false);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  }, []);

  // ---------------- PEER ----------------
  const createPeerFor = useCallback(
    (remoteId, callId) => {
      if (peerConnections.current.has(remoteId)) {
        return peerConnections.current.get(remoteId);
      }

      const pc = new RTCPeerConnection(rtcConfig);

      if (localStream) {
        localStream.getTracks().forEach((t) =>
          pc.addTrack(t, localStream)
        );
      }

      pc.ontrack = (e) => {
        const stream = e.streams[0];
        setRemoteStreams((p) => ({ ...p, [remoteId]: stream }));
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

        if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
          pc.close();
          peerConnections.current.delete(remoteId);
          setRemoteStreams((p) => {
            const c = { ...p };
            delete c[remoteId];
            return c;
          });
        }
      };

      peerConnections.current.set(remoteId, pc);
      return pc;
    },
    [localStream, socket]
  );

  // ---------------- CALLER ----------------
  const startCall = async ({ participants, callType, conversationId = null }) => {
    await getLocalMedia(callType === "video");
    console.log(callType);
    setIsInCall(true);
    socket.emit(
      "call:invite",
      { participants, callType, conversationId },
      async (res) => {
        if (!res?.ok) return;

        setActiveCall({
          callId: res.callId,
          callType,
          participants,
        });

        for (const remoteId of participants) {
          const pc = createPeerFor(remoteId, res.callId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("call:offer", {
            callId: res.callId,
            to: remoteId,
            sdp: offer,
          });
        }
      }
    );
  };

  // ---------------- INCOMING ----------------
useEffect(() => {
  const onIncoming = (payload) => {
    if (payload.from === socket.id) return; // <-- ignore own call
    setIncomingCall(payload);
  };

  socket.on("call:incoming", onIncoming);
  return () => socket.off("call:incoming", onIncoming);
}, [socket]);

  // ---------------- OFFER ----------------
  useEffect(() => {
    const onOffer = async ({ callId, from, sdp }) => {
      await getLocalMedia(true);

      const pc = createPeerFor(from, callId);
      await pc.setRemoteDescription(sdp);

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


  // ---------------- ANSWER ----------------

  useEffect(() => {
const onAnswer = async ({ from, sdp }) => {
  const pc = peerConnections.current.get(from);
  if (!pc) return;

  if (pc.signalingState !== "have-local-offer") {
    console.warn("PC not ready for answer, current state:", pc.signalingState);
    return;
  }

  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
};
  socket.on("call:answer", onAnswer);
  return () => socket.off("call:answer", onAnswer);
}, [socket]);

  // ---------------- ICE ----------------
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

  // ---------------- ACCEPT / REJECT ----------------
  const acceptCall = async () => {
    if (!incomingCall) return;
    setActiveCall(incomingCall);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    socket.emit("call:end", { callId: incomingCall.callId, reason: "rejected" });
    setIncomingCall(null);
  };

  // ---------------- TOGGLES ----------------
  const toggleMic = () => {
    const t = localStream?.getAudioTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setMicOn(t.enabled);
  };

  const toggleCam = () => {
    const t = localStream?.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setCamOn(t.enabled);
  };

  const toggleScreenShare = async () => {
    if (!localStream || peerConnections.current.size === 0) return;

    if (!screenOn) {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const track = display.getVideoTracks()[0];

      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find(
          (s) => s.track?.kind === "video"
        );
        sender?.replaceTrack(track);
      });

      setScreenOn(true);

      track.onended = () => {
        const cam = localStream.getVideoTracks()[0];
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find(
            (s) => s.track?.kind === "video"
          );
          sender?.replaceTrack(cam);
        });
        setScreenOn(false);
      };
    }
  };

  // ---------------- END CALL ----------------

  const endCall = (reason = "hangup") => {
  socket.emit("call:end", { callId: activeCall?.callId, reason });

  // stop timer
  stopTimer();

  // close all peer connections
  peerConnections.current.forEach(pc => pc.close());
  peerConnections.current.clear();

  // stop local tracks
  localStream?.getTracks().forEach(t => t.stop());
  setLocalStream(null);

  // clear remote streams
  setRemoteStreams({});

  // finally update state
  setIsInCall(false);
  setIncomingCall(null);
  setActiveCall(null);
  setMicOn(true);
  setCamOn(true);
  setScreenOn(false);
};

  // ---------------- HELPERS ----------------
const getRemoteRef = (remoteId) => {
  if (!remoteRefs.current[remoteId]) {
    remoteRefs.current[remoteId] = (el) => {
      if (el) {
        el.srcObject = remoteStreams[remoteId] || null;
      }
    };
  }
  return remoteRefs.current[remoteId];
};


  const formattedTimer = () => {
    const s = callDuration;
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  // ---------------- EXPORT ----------------
  return {
    localVideoRef,
    getRemoteRef,
    localStream,
    remoteStreams,
    incomingCall,
    isInCall,
    activeCall,
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
