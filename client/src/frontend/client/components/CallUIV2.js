import { useState } from "react";
import { useWebRTCv2 } from "../hooks/useWebRTCv2";
import IncomingCallPopup from "./IncomingCallPopup";
import CallFloatingView from "./CallFloatingView";
// import CallLogs from "./CallLogs";

export default function CallUIV2({ myId, myName }) {
  const webrtc = useWebRTCv2(myId, myName);
  const [inviteList, setInviteList] = useState([]);
  const [callType, setCallType] = useState("video");
  // const [showLogs, setShowLogs] = useState(false);

  const start = () => {
    if (!inviteList.length) return alert("Add at least one participant to call");
    webrtc.startCall({ participants: inviteList, callType, conversationId: null });
  };

  return (
    <>
      <style>{`
        .callui-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 10px;
        }

        .callui-input {
          border: 1px solid #ccc;
          padding: 8px;
          border-radius: 6px;
          font-size: 14px;
          width: 260px;
        }

        .callui-select {
          border: 1px solid #ccc;
          padding: 8px;
          border-radius: 6px;
          background: white;
          font-size: 14px;
        }

        .callui-btn {
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .callui-btn-start {
          background: #1e67d6;
          color: white;
        }

        .callui-btn-logs {
          background: #e5e5e5;
          color: #333;
        }

        .callui-btn:hover {
          opacity: 0.9;
        }

      `}</style>

      <div className="callui-row">
        <input
          type="text"
          placeholder="Invite user ids comma separated"
          value={inviteList.join(",")}
          onChange={(e) =>
            setInviteList(
              e.target.value.split(",").map(s => s.trim()).filter(Boolean)
            )
          }
          className="callui-input"
        />

        <select
          value={callType}
          onChange={(e) => setCallType(e.target.value)}
          className="callui-select"
        >
          <option value="video">Video</option>
          <option value="audio">Audio</option>
        </select>

        <button onClick={start} className="callui-btn callui-btn-start">
          Start Call
        </button>

        {/* <button
          onClick={() => setShowLogs((s) => !s)}
          className="callui-btn callui-btn-logs"
        >
          Call Logs
        </button> */}
      </div>

      {/* Incoming Call Prompt */}
      <IncomingCallPopup
        incoming={webrtc.incomingCall}
        onAccept={webrtc.acceptCall}
        onReject={webrtc.rejectCall}
      />

      {/* In-Call Floating View */}
      {webrtc.isInCall && (
        <CallFloatingView
          localRef={webrtc.localVideoRef}
          getRemoteRef={webrtc.getRemoteRef}
          remoteStreams={webrtc.remoteStreams}
          onEnd={webrtc.endCall}
          onMic={webrtc.toggleMic}
          onCam={webrtc.toggleCam}
          onScreen={webrtc.toggleScreenShare}
          micOn={webrtc.micOn}
          camOn={webrtc.camOn}
          screenOn={webrtc.screenOn}
          formattedTimer={webrtc.formattedTimer}
        />
      )}

      {/* Call History */}
      {/* {showLogs && <CallLogs />} */}
    </>
  );
};