import { useCallback, useEffect, useRef, useState } from 'react';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Draggable from 'react-draggable';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Altaxios } from '../../Altaxios';
import { differenceInMinutes, differenceInHours, differenceInDays, differenceInYears, differenceInMonths } from 'date-fns';
import { useAuth } from "../../../context/AuthContext";
import { useParams } from 'react-router-dom';
import {socket} from '../../../socket';
import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';

//call section imports<>
import { useWebRTCv2 } from "../../../hooks/useWebRTCv2";
import IncomingCallPopup from "./IncomingCallPopup";
import CallFloatingView from "./CallFloatingView";
//call section imports</>

function LiveChats() {
  const [open, setOpen] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isPhone, setIsPhone] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(true);
  const [lastMessage, setLastMessage] = useState('');
  const endRef = useRef(null);
  const nodeRef = useRef(null);
  const innerRef = useRef(null);
  const popupTimerRef = useRef(null);
  const [convInfo,setConvInfo] = useState({type:"private", participants:[], title:"", avater:"",});
  const {user} = useAuth();
  const {employeeId} = useParams();
    const webrtc = useWebRTCv2();

  const startCall = (callType) => {
  if (!convInfo.participants.length) return alert("Add at least one participant to call");

  const calleeParticipants = convInfo.participants.filter(id => id !== user.employeeId);

  if (!calleeParticipants.length) return alert("No valid participant to call");

  webrtc.startCall({
    participants: calleeParticipants,
    callType,
    conversationId: conversation._id
  });
};

  useEffect(() => {
  if (!user?.employeeId || !employeeId) return;

  setConvInfo(prev => ({
    ...prev,
    participants: [user.employeeId, employeeId]
  }));
}, [user?.employeeId, employeeId]);

  // ✅ Adjust input area for mobile keyboard
  useEffect(() => {
    const initialVH = window.innerHeight;
    function adjust() {
      const vv = window.visualViewport;
      const vh = vv ? vv.height : window.innerHeight;
      const off = vv ? vv.offsetTop : 0;
      const keyboardHeight = Math.max(0, initialVH - vh - off);
      if (innerRef.current) innerRef.current.style.bottom = keyboardHeight + 'px';
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', adjust);
      window.visualViewport.addEventListener('scroll', adjust);
    }
    window.addEventListener('resize', adjust);
    adjust();
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', adjust);
        window.visualViewport.removeEventListener('scroll', adjust);
      }
      window.removeEventListener('resize', adjust);
    };
  }, []);

  // ✅ Detect mobile
  useEffect(() => {
    const checkDevice = () => {
      const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsPhone(isSmallScreen && isMobile);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ✅ Socket + Fetch conversation
useEffect(() => {
  if (!convInfo.participants || convInfo.participants.length !== 2) return;
  if (!user?.employeeId) return;

  const loadChat = async () => {
    try {
      const { data } = await Altaxios.post('/conversation/newConverSation', convInfo);

      setConversation(data.conversation);
      setMessages(data.messages || []);

      // join the conversation room
      socket.emit("joinConversation", {
        conversationId: data.conversation._id
      });
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  loadChat();

  // listen for incoming messages
  socket.on("newMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);

    if (msg.senderId !== user.employeeId) {
      setLastMessage(msg.content || "New message");
      setIsPopup(true);
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = setTimeout(() => setIsPopup(false), 5000);
    }
  });

  return () => {
    socket.off("newMessage");
  };
}, [convInfo, user.employeeId]);

  // ✅ Scroll to bottom on new message
  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, minimized, scrollToBottom]);

  // ✅ Send message
const sendMessage = async () => {
  if (!message.trim()) return;
  socket.emit("sendMessage", {
    conversationId: conversation._id,
    senderId: user?.employeeId,
    messageType: "text",
    content: message
  });
  setMessage("");
};

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImageLoaded(false);
    sendMessage(file);
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const minutesDiff = differenceInMinutes(now, date);
    const hoursDiff = differenceInHours(now, date);
    const daysDiff = differenceInDays(now, date);
    const monthsDiff = differenceInMonths(now, date);
    const yearsDiff = differenceInYears(now, date);
    if (minutesDiff < 1) return 'just now';
    if (minutesDiff < 60) return `${minutesDiff} min ago`;
    if (hoursDiff < 24) return `${hoursDiff} hr ago`;
    if (daysDiff < 30) return `${daysDiff} days ago`;
    if (monthsDiff < 12) return `${monthsDiff} months ago`;
    return `${yearsDiff} yrs ago`;
  };

  const toggleChat = () => {
    setOpen((o) => !o);
    setMinimized(false);
    setIsPopup(false);
  };

  return (
    <div className="liveChatsMain">
      {!open && (
        <Draggable bounds="parent" nodeRef={nodeRef} enableUserSelectHack={false}>
          <div className="liveChatsLogo" ref={nodeRef} onClick={toggleChat}>
            <SmsOutlinedIcon className="liveChatsLogoIcon" />
            <div className="liveChatAciveSigne"></div>
            <div className={`liveChatFirstPopup ${isPopup ? 'visible' : ''}`}>
              {isPopup && <span>{lastMessage}</span>}
            </div>
          </div>
        </Draggable>
      )}

      {open && (
        <div className={`liveChatsInnerPart ${minimized ? 'minimized' : ''}`} ref={innerRef}>
          <div className="liveConverstaionHeder">
            {user.employeeProfile ? (
              <img src={user.employeeProfile} alt="employee" style={{width:'28px',height:'27px',borderRadius:'50%'}}/>
            ) : (
              <SupportAgentIcon className="liveConversationAvater" />
            )}
            <div className="liveChatHeaderLive"></div>
            <span className="supportagettext">{user.employeeName ?? "Employee"}</span>
            <CallIcon className='liveSectionAudioCallIcon' onClick={() => {startCall("audio")}}/>
            <VideoCallIcon className='liveSectionVidioCallIcon' onClick={() => {startCall("video")}}/>
            {minimized ? (
              <KeyboardArrowUpOutlinedIcon onClick={() => setMinimized((m) => !m)} className="toggleMinimizebtn" />
            ) : (
              <KeyboardArrowDownOutlinedIcon onClick={() => setMinimized((m) => !m)} className="toggleMinimizebtn" />
            )}
            <CloseOutlinedIcon onClick={() => setOpen(false)} className="liveChatclosebtn" />
          </div>

          {!minimized && (
            <>
              <div className="liveCustomerMessages">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`${
                      msg.senderId === user.employeeId ? 'liveCustomerMessagesCustomer' : 'liveCustomerMessagesAgent'
                    }`}
                  >
                    {msg.messageType === "image" && (
                      <img
                        src={msg.mediaUrl}
                        alt="msg"
                        className="liveCustomerMessagesImage"
                        onLoad={() => setIsImageLoaded(true)}
                      />
                    )}
                    {msg.messageType === "text" && (
                      <div
                        className={`liveCustomerMessagesText ${
                          msg.senderId === user.employeeId ? 'liveAgentMessage' : ''
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
                    <div className="liveCustomerMessagesTime">{formatTimestamp(msg.createdAt)}</div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="liveConverstaionFooter">
                <label className="liveChatfileInput">
                  <input type="file" onChange={handleFileChange} />
                  <PermMediaOutlinedIcon className={`footerliveMedia ${!isImageLoaded ? 'inActiveLiveChantsendbtn' : ''}`} />
                </label>
                <input
                  type="text"
                  className="liveConverstaionInput"
                  value={message}
                  placeholder="Type a message..."
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && message.trim()) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <SendRoundedIcon
                  className={`liveChatsSendbtn ${message === '' ? 'inActiveLiveChantsendbtn' : ''}`}
                  onClick={() => sendMessage()}
                />
              </div>
            </>
          )}
                {/* Incoming Call Prompt */}
                <IncomingCallPopup
                  incoming={webrtc.incomingCall}
                  onAccept={webrtc.acceptCall}
                  onReject={webrtc.rejectCall}
                />
          
                {/* In-Call Floating View */}
                {webrtc.isInCall && webrtc.localStream && (
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
        </div>
        
      )}
    </div>
  );
}

export default LiveChats;
