import React from "react";

export default function TypingIndicator() {
  return (
    <>
      <div className="typing-wrapper">
        <div className="typing-bubble">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <style>{`
        .typing-wrapper {
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            position: absolute;
            bottom: 55px;
            left: 5px;
        }

        .typing-bubble {
            display: flex;
            align-items: center;
            gap: 3px;
        }

        .typing-bubble span {
          width: 5px;
          height: 5px;
          background: #bfbfbf;
          border-radius: 50%;
          animation: wave 1.4s infinite ease-in-out;
        }

        .typing-bubble span:nth-child(1) {
          animation-delay: 0s;
        }

        .typing-bubble span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-bubble span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes wave {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
