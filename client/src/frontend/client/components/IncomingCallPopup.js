import { useEffect, useRef } from "react";
import incommingRingTune from '../../../audio/incomming.mp3';
import CallEndIcon from '@mui/icons-material/CallEnd';
import CallIcon from '@mui/icons-material/Call';
export default function IncomingCallPopup({ incoming, localVideoinRemote, onAccept, onReject }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // Play ringtone
    audioRef.current = new Audio(incommingRingTune);
    audioRef.current.loop = true;

    audioRef.current
      .play()
      .catch(() => {
      });

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [incoming]);

  const who = incoming.incomingCaller.fromName;
  const photo = incoming.incomingCaller.calleeImg || null; // optional caller photo
  return (
    <>
      <style>{`
        .incoming-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          flex-direction: column;
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

        .incoming-btn-accept {
          background: #10b45c;
        }

        .incoming-btn-reject {
          background: #d32727;
        }

        .incoming-btn:hover {
          opacity: 0.9;
        }

        .local-preview-video {
          width: 160px;
          height: 120px;
          border-radius: 8px;
          object-fit: cover;
          margin-top: 8px;
        }

        @keyframes popupFade {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="incoming-overlay">
        <div className="incoming-box">
          {photo ? (
            <img src={photo} alt={who} className="caller-photo" />
          ) : (
            <div className="caller-photo" style={{background:'#ccc', display:'flex', alignItems:'center', justifyContent:'center'}}>{who}</div>
          )}

          <h3 className="incoming-title">
            Incoming {incoming?.incomingCaller?.callType} call
          </h3>

          <p className="incoming-sub">{who} is calling</p>

          {/* Local preview video */}
          {(localVideoinRemote && incoming.incomingCaller.callType === "video") && (
            <video
              ref={localVideoinRemote}
              autoPlay
              muted
              playsInline
              className="local-preview-video"
            />
          )}

          <div className="incoming-actions">
            <button
              onClick={onAccept}
              className="incoming-btn incoming-btn-accept"
            >
              <CallIcon/>
            </button>

            <button
              onClick={() => {onReject("rejected")}}
              className="incoming-btn incoming-btn-reject"
            >
              <CallEndIcon/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
