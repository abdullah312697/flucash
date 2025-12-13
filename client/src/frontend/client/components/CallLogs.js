import { useEffect, useState } from "react";
import axios from "../Altaxios";

export default function CallLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/calls");
        setLogs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch call logs", err);
      }
    })();
  }, []);

  return (
    <>
      <style>{`
        .calllogs-container {
          margin-top: 16px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0px 2px 6px rgba(0,0,0,0.1);
        }

        .calllogs-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .calllogs-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .calllogs-item {
          padding: 12px 0;
          border-bottom: 1px solid #e5e5e5;
        }

        .calllogs-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .calllogs-left .type-status {
          font-weight: 500;
          font-size: 15px;
        }

        .calllogs-left .date {
          font-size: 13px;
          color: #666;
          margin-top: 3px;
        }

        .calllogs-duration {
          font-size: 14px;
          color: #444;
        }
      `}</style>

      <div className="calllogs-container">
        <h3 className="calllogs-title">Call History</h3>

        <ul className="calllogs-list">
          {logs.map((c) => (
            <li key={c._id} className="calllogs-item">
              <div className="calllogs-row">

                <div className="calllogs-left">
                  <div className="type-status">
                    {c.callType} — {c.callStatus}
                  </div>
                  <div className="date">
                    {new Date(c.startedAt).toLocaleString()}
                  </div>
                </div>

                <div className="calllogs-duration">
                  {Math.floor((c.duration || 0) / 60)}m {(c.duration || 0) % 60}s
                </div>

              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};