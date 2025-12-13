// src/hooks/useWebRTCv2.js
import { useCallback, useEffect, useRef, useState } from "react";
import { rtcConfig } from "../utils/rtcConfig";
import { useSocket } from "../context/SocketContext";

/*
 API expectations:
 - Backend: call:invite -> ack { ok: true, callId }
 - Backend emits call:incoming to target socket with { callId, from, fromName?, callType, participants[] }
 - Frontend uses signaling events:
   - call:offer -> { callId, from, to, sdp }
   - call:answer -> { callId, from, to, sdp }
   - call:ice -> { callId, from, to, candidate }
   - call:end -> { callId, reason }
*/

export function useWebRTCv2() {
  const { socket } = useSocket();
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map()); // remoteId -> ref
  const peerConnections = useRef(new Map()); // remoteId -> RTCPeerConnection
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // remoteId -> MediaStream
  const [incomingCall, setIncomingCall] = useState(null); // { callId, from, callType, participants }
  const [activeCall, setActiveCall] = useState(null); // { callId, callType, participants }
  const [isInCall, setIsInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  const callTimerRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0); // seconds

  // utility to increment timer
  const startTimer = () => {
    callTimerRef.current && clearInterval(callTimerRef.current);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(callTimerRef.current);
    callTimerRef.current = null;
  };

  // create peer connection for a remote user
  const createPeerFor = useCallback((remoteId, callId) => {
    if (peerConnections.current.has(remoteId)) return peerConnections.current.get(remoteId);

    const pc = new RTCPeerConnection(rtcConfig);

    // attach local tracks to pc
    if (localStream) {
      for (const t of localStream.getTracks()) {
        pc.addTrack(t, localStream);
      }
    }

    // when remote track arrives
    pc.ontrack = (ev) => {
      // set a stream for that remoteId
      const stream = ev.streams[0];
      setRemoteStreams((prev) => ({ ...prev, [remoteId]: stream }));
    };

    // ICE candidates -> send to remote
    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        socket.emit("call:ice", {
          callId,
          to: remoteId,
          candidate: ev.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        // cleanup peer
        pc.close();
        peerConnections.current.delete(remoteId);
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[remoteId];
          return copy;
        });
      }
    };

    peerConnections.current.set(remoteId, pc);
    return pc;
  },[localStream,socket]);

  // getLocalMedia
  const getLocalMedia = async (isVideo = true) => {
    const constraints = { audio: true, video: isVideo };
    const s = await navigator.mediaDevices.getUserMedia(constraints);
    if (localVideoRef.current) localVideoRef.current.srcObject = s;
    setLocalStream(s);
    return s;
  };

  // --- Start group or 1:1 call (caller)
  // participants: array of userIds to invite (excluding caller)
const startCall = async ({ participants, callType, conversationId = null }) => {
  const stream = await getLocalMedia(callType === "video");

  socket.emit("call:invite", { participants, callType, conversationId }, async (res) => {
    if (!res?.ok) return;

    setActiveCall({ callId: res.callId, callType, participants });

    for (const remoteId of participants) {
      const pc = createPeerFor(remoteId, res.callId, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call:offer", {
        callId: res.callId,
        to: remoteId,
        sdp: offer,
      });
    }
  });
};

  // --- When incoming call arrives
  useEffect(() => {
    const onIncoming = (payload) => {
      // payload: { callId, from, callType, participants, fromName(optional) }
      setIncomingCall(payload);
      console.log(payload);
      // Play ringing handled by UI
    };
    socket.on("call:incoming", onIncoming);
    return () => socket.off("call:incoming", onIncoming);
  }, [socket]);

  // --- When someone sends an offer to *me* (this handles group offers targeted to this user)
  useEffect(() => {
    const onOffer = async ({ callId, from, sdp }) => {
      // ensure we have local stream
      if (!localStream) {
        await getLocalMedia(true);
      }

      const pc = createPeerFor(from, callId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      // create answer and send back
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", { callId, to: from, sdp: answer }, (ack) => {});
      setIsInCall(true);
      startTimer();
    };

    socket.on("call:offer", onOffer);
    return () => socket.off("call:offer", onOffer);
  }, [localStream,socket,createPeerFor]);

  // --- When someone answers our offer
  useEffect(() => {
    const onAnswer = async ({ callId, from, sdp }) => {
      // find peer for "from"
      const pc = peerConnections.current.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      // connection will become established
    };

    socket.on("call:answer", onAnswer);
    return () => socket.off("call:answer", onAnswer);
  }, [socket]);

  // --- ICE candidate arriving
  useEffect(() => {
    const onIce = async ({ callId, from, candidate }) => {
      const pc = peerConnections.current.get(from);
      if (!pc) return;
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.warn("addIceCandidate failed", e);
      }
    };

    socket.on("call:ice", onIce);
    return () => socket.off("call:ice", onIce);
  }, [socket]);


    // end call local cleanup
  const endCallLocal = useCallback(() => {
    // stop timer & tracks
    stopTimer();
    setCallDuration(0);

    // close all peers
    peerConnections.current.forEach((pc) => {
      try { pc.close(); } catch (e) {}
    });
    peerConnections.current.clear();

    // stop streams
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    Object.values(remoteStreams).forEach((s) => s?.getTracks?.()?.forEach((t) => t.stop?.()));
    setRemoteStreams({});

    setIsInCall(false);
    setActiveCall(null);
    setIncomingCall(null);
  },[localStream,remoteStreams]);

  // --- call ended
  useEffect(() => {
    const onEnd = ({ callId, reason }) => {
      endCallLocal();
      // Show missed if reason is missed or rejected when we were not in call
      if (reason === "missed") {
        // UI toast - handled by caller
      }
    };

    socket.on("call:end", onEnd);
    return () => socket.off("call:end", onEnd);
  }, [socket,endCallLocal]);

  // Accept incoming call (callee)
  const acceptCall = async () => {
    if (!incomingCall) return;
    const { callId, participants, callType } = incomingCall;
    // set active call
    setActiveCall({callId, callType, participants});

    // get media
    // const s = await getLocalMedia(incomingCall.callType === "video");
        // create pc for each participant and create offers
      // const pc = createPeerFor(s, callId);
      // await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      // const answer = await pc.createAnswer();
      // await pc.setLocalDescription(answer);


    // For group: create peer for each other participant and wait offers/answers
    // But backend will send targeted offers to each participant — we handle via onOffer handler.

    // Acknowledge acceptance by joining call (there's no explicit join event in your backend; acceptance will occur when peers exchange sdp)
    setIsInCall(true);
    startTimer();

    setIncomingCall(null);
  };

  // Reject incoming call
  const rejectCall = () => {
    if (!incomingCall) return;
    socket.emit("call:end", { callId: incomingCall.callId, reason: "rejected" });
    setIncomingCall(null);
  };

  // toggle mic/cam/screen
  const toggleMic = () => {
    if (!localStream) return;
    const t = localStream.getAudioTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setMicOn(t.enabled);
  };

  const toggleCam = () => {
    if (!localStream) return;
    const t = localStream.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !t.enabled;
    setCamOn(t.enabled);
  };

  const toggleScreenShare = async () => {
    if (!peerConnections.current.size) return;
    if (!screenOn) {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = display.getVideoTracks()[0];

      // replace sender's video track for each pc
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender) sender.replaceTrack(track);
      });

      setScreenOn(true);
      track.onended = () => {
        // restore original video track
        const originalTrack = localStream.getVideoTracks()[0];
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(originalTrack);
        });
        setScreenOn(false);
      };
    }
  };


  // End call from UI (and notify server)
  const endCall = (reason = "hangup") => {
    if (activeCall?.callId) {
      socket.emit("call:end", { callId: activeCall.callId, reason }, (ack) => {});
    }
    endCallLocal();
  };

  // helpers for video refs
  const getRemoteRef = (remoteId) => {
    if (!remoteVideoRefs.current.has(remoteId)) {
      remoteVideoRefs.current.set(remoteId, { ref: (el) => { if (el) el.srcObject = remoteStreams[remoteId]; }});
    }
    return remoteVideoRefs.current.get(remoteId).ref;
  };

  // formatting timer
  const formattedTimer = () => {
    const s = callDuration;
    const hh = Math.floor(s / 3600).toString().padStart(2, "0");
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

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
