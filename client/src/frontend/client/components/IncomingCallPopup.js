import { useEffect, useRef } from "react";
import rengtone from '../../../audio/rengtone.mp3';

export default function IncomingCallPopup({ incoming, onAccept, onReject }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!incoming) return;

    // Play ringtone
    audioRef.current = new Audio(rengtone);
    audioRef.current.loop = true;

    audioRef.current
      .play()
      .catch(() => {
        // Autoplay blocked until user interacts
      });

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [incoming]);

  if (!incoming) return null;

  const who = incoming.fromName || incoming.from || "Unknown";

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
        }

        .incoming-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .incoming-sub {
          font-size: 14px;
          color: #666;
        }

        .incoming-actions {
          margin-top: 20px;
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .incoming-btn {
          padding: 10px 20px;
          font-size: 15px;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
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

        @keyframes popupFade {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="incoming-overlay">
        <div className="incoming-box">
          <h3 className="incoming-title">
            Incoming {incoming.callType} call
          </h3>

          <p className="incoming-sub">{who} is calling</p>

          <div className="incoming-actions">
            <button
              onClick={onAccept}
              className="incoming-btn incoming-btn-accept"
            >
              Accept
            </button>

            <button
              onClick={onReject}
              className="incoming-btn incoming-btn-reject"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </>
  );
};