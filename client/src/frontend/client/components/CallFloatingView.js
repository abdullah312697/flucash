import CallEndIcon from '@mui/icons-material/CallEnd';
import OutgoingRengtone from '../../../audio/outgoing.mp3';
import { useEffect } from 'react';
import { useRef } from 'react';

export default function CallFloatingView({
  callingState,
  localVideoRef,
  localVideoinCalling,
  remoteVideoEls,
  remoteStreams,
  endCall,
  toggleMic,
  toggleCam,
  toggleScreenShare,
  micOn,
  camOn,
  screenOn,
  formattedTimer,
  onReject,
  callerData
}) {
  const remoteIds = Object.keys(remoteStreams || {});

    const audioRef = useRef(null);
    useEffect(() => {
      // Play ringtone
      audioRef.current = new Audio(OutgoingRengtone);
      audioRef.current.loop = true;
  
      if(callingState === "CALLING"){
      audioRef.current
        .play()
        .catch(() => {
        });
      }else{
        audioRef.current
        .pause()
      }
      return () => {
        audioRef.current?.pause();
        audioRef.current = null;
      };
    }, [callingState]);
    
  return (
    <>
      <style>{`
        /* Container */

        .call-container {
          position: fixed;
          inset: 0;
          background: black;
          display: flex;
          flex-direction: column;
          opacity:0;
          z-index: -1;
        }

        /* Remote video grid */
        .remote-grid {
          flex: 1;
          padding: 8px;
        }

        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }

        /* Local video */
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

        /* Controls */
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

        .local-preview-video {
          width: 200px;
          height: 150px;
          border-radius: 10px;
          border: 2px solid white;
          object-fit: cover;
          margin-bottom: 16px;
        }

        .outgoing-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          flex-direction: column;
          opacity:0;
          z-index:-1000;
        }

        .incoming-box {
          background: white;
          padding: 24px;
          width: 380px;
          max-width: 90%;
          text-align: center;
          border-radius: 10px;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.25);
          animation: popupFade 0.25s ease-out;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          min-height:280px;
        }

        .caller-photo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #10b45c;
        }

        .incoming-title {
          font-size: 20px;
          font-weight: 600;
          color: #10b45c;
        }

        .incoming-sub {
          font-size: 14px;
          color: #666;
        }

        .incoming-actions {
          margin-top: 12px;
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .incoming-btn {
            width: 50px;
            height: 50px;
            font-size: 15px;
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            }

          .incoming-btn>svg{
              font-size: 30px;
              margin-top: 2px;
          }


        .incoming-btn-reject {
          background: #d32727;
        }

        .incoming-btn:hover {
          opacity: 0.9;
        }

        .local-preview-videoIncomming {
          width: 160px;
          height: 120px;
          border-radius: 8px;
          object-fit: cover;
          margin-top: 8px;
        }
        .whilecalling{
          opacity:1;
          z-index:1000;
        }

        @keyframes popupFade {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

`}</style>

              <div className={`outgoing-overlay ${(callingState === "CALLING") ? " whilecalling" : ""}`}>
                <div className="incoming-box">
                  {callerData ? (
                    <img src={callerData?.callerImg} alt={"callerImage"} className="caller-photo" />
                  ) : (
                    <div className="caller-photo" style={{background:'#ccc', display:'flex', alignItems:'center', justifyContent:'center'}}>{callerData?.callerName}</div>
                  )}
        
                  <h3 className="incoming-title">
                    Outgoing {callerData?.callType} call
                  </h3>
        
                  <p className="incoming-sub">You are calling to {callerData?.callerName}</p>
        
                  {/* Local preview video */}
                  {(localVideoinCalling && callerData?.callType === "video") && (
                    <video
                      ref={localVideoinCalling}
                      autoPlay
                      muted
                      playsInline
                      className="local-preview-videoIncomming"
                    />
                  )}
        
                  <div className="incoming-actions">        
                    <button
                      onClick={() => {onReject("rejected")}}
                      className="incoming-btn incoming-btn-reject"
                    >
                      <CallEndIcon/>
                    </button>
                  </div>
                </div>
              </div>

      {/* ===== Active Call ===== */}
        <div className={`call-container ${callingState === "IN_CALL" ? " whilecalling" : ""}`}>
          {/* Remote Video Grid */}
          <div className="remote-grid">
            {remoteIds.map((id) => (
              <video
                key={id}
                ref={(el) => {
                  if (el) remoteVideoEls.current[id] = el;
                }}
                autoPlay
                playsInline
                className="remote-video"
              />
            ))}
          </div>

          {/* Local Video */}
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />

          {/* Controls */}
          <div className="controls">
            <div className="timer-text">{formattedTimer()}</div>
            <button onClick={toggleMic} className="control-btn">
              {micOn ? "🎤" : "🔇"}
            </button>
            <button onClick={toggleCam} className="control-btn">
              {camOn ? "📷" : "🚫"}
            </button>
            <button onClick={toggleScreenShare} className="control-btn">
              {screenOn ? "🖥️" : "📺"}
            </button>
            <button onClick={() => {endCall("hangup")}} className="control-btn control-btn-end">
              End
            </button>
          </div>
        </div>
    </>
  );
}
