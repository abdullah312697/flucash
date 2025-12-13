
export default function CallFloatingView({
  localVideoRef,
  getRemoteRef,
  remoteStreams,
  endCall,
  micOn,
  camOn,
  screenOn,
  formattedTimer,
}) {
  const remoteIds = Object.keys(remoteStreams || {});
  return (
    <>
      <style>{`
        .call-container {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: black;
          display: flex;
          flex-direction: column;
        }

        .remote-grid {
          flex: 1;
          display: grid;
          gap: 8px;
          padding: 8px;
          grid-template-columns: repeat(1, 1fr);
        }

        @media (min-width: 768px) {
          .remote-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .remote-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }

        .local-video {
          position: absolute;
          bottom: 24px;
          right: 24px;
          width: 160px;
          height: 110px;
          border-radius: 6px;
          border: 2px solid white;
          object-fit: cover;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.5);
        }

        .controls {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(0,0,0,0.5);
          padding: 12px 16px;
          border-radius: 10px;
        }

        .control-btn {
          padding: 12px;
          background: #333;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          font-size: 18px;
        }

        .control-btn-end {
          background: #d11a2a;
        }

        .timer-text {
          color: white;
          margin-right: 20px;
          font-family: monospace;
          font-size: 16px;
        }
      `}</style>

      <div className="call-container">
        <div className="remote-grid">
          {remoteIds.map((id) => (
            <video
              key={id}
              ref={getRemoteRef(id)}
              autoPlay
              playsInline
              className="remote-video"
            />
          ))}
        </div>

        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="local-video"
        />

        <div className="controls">
          <div className="timer-text">{formattedTimer()}</div>
          <button onClick={micOn} className="control-btn">
            {micOn ? "🎤" : "🔇"}
          </button>

          <button onClick={camOn} className="control-btn">
            {camOn ? "📷" : "🚫"}
          </button>

          <button onClick={screenOn} className="control-btn">
            {screenOn ? "🖥️" : "📺"}
          </button>

          <button onClick={endCall} className="control-btn control-btn-end">
            End
          </button>
        </div>
      </div>
    </>
  );
};