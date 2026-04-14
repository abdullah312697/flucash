import React, { useCallback, useEffect, useRef, useState } from 'react';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Draggable from 'react-draggable';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Altaxios } from '../../Altaxios';
import { useAuth } from "../../../context/AuthContext";
import { useParams } from 'react-router-dom';
import {socket} from '../../../socket';
import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import TypingIndicator from "./TypingIndicator";
//call section imports<>
import { useWebRTCv2 } from "../../../hooks/useWebRTCv2";
import IncomingCallPopup from "./IncomingCallPopup";
import CallFloatingView from "./CallFloatingView";
//call section imports</>
import { ReactComponent as SentIcon } from "../../../vactors/eye-closed.svg";
import { ReactComponent as DeliveredIcon } from "../../../vactors/eye-half-open.svg";
import { ReactComponent as SeenIcon } from "../../../vactors/eye-open.svg";

function LiveChats({employeeData}) {
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
  const [isTypingStart,setIsTypingStart] = useState(false);
  const popupTimerRef = useRef(null);
  const typingTimeManageRef = useRef(null);
  const [convInfo,setConvInfo] = useState({type:"private", participants:[], title:"", avater:"",});
  const {user} = useAuth();
  const {employeeId} = useParams();
  const webrtc = useWebRTCv2();
  const [isStartCall,setIsStartCall] = useState(false);
  
  const startCall = (callType, calleeName, calleeImg, callerName, callerImg ) => {
    setIsStartCall(true);
  if (!convInfo.participants.length) return alert("Add at least one participant to call");

  const calleeParticipants = convInfo.participants.filter(id => id !== user?.employeeId);
  if (!calleeParticipants.length) return alert("No valid participant to call");
  webrtc.startCall({
    participants: calleeParticipants,
    callType,
    conversationId: conversation?._id,
    calleeName, 
    calleeImg,
    callerName,
    callerImg
  });
};

  useEffect(() => {
  if (!employeeId || !user?.employeeId) return;

  setConvInfo(prev => ({
    ...prev,
    participants: [user?.employeeId, employeeId]
  }));
}, [employeeId, user]);

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

  const loadChat = async () => {
    try {
      const { data } = await Altaxios.post('/conversation/newConverSation', convInfo);

      setConversation(data?.conversation);
      setMessages(data.messages || []);

      socket.emit("joinConversation", {
        conversationId: data?.conversation?._id
      });
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  loadChat();

}, [convInfo, user?.employeeId]);


useEffect(() => {
if (!user?.employeeId) return;
  socket.on("newMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);

    if (msg?.senderId !== user?.employeeId) {
      setLastMessage(msg?.content || "New message");
      setIsPopup(true);
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = setTimeout(() => setIsPopup(false), 5000);
    }

  if (msg?.senderId !== user?.employeeId) {
    socket.emit("message:delivered", {
      messageIds: [msg._id],
      employeeId: user?.employeeId,
      conversationId: conversation?._id
    });
  }
  });
  return () => {
    socket.off("newMessage");
  };
},[user?.employeeId, conversation?._id]);

useEffect(() => {
  if(open && !minimized){
  const unseenMessageIds = messages
    .filter(m => !m.seenBy?.includes(user?.employeeId) && m.senderId !== user?.employeeId)
    .map(m => m._id);
  if (unseenMessageIds.length) {
    socket.emit("message:seen", { messageIds: unseenMessageIds, employeeId: user?.employeeId, conversationId: conversation?._id, });
  }
}
}, [messages, user?.employeeId, open, minimized, conversation?._id]);

useEffect(() => {
  socket.on("userTyping",({isTyping}) => {
      setIsTypingStart(isTyping);
  });
  return () => {
    socket.off("userTyping");
  };
},[]);
  // ✅ Scroll to bottom on new message
  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, minimized, scrollToBottom]);

  useEffect(() => {
socket.on("messageDelivered", ({ messageIds, employeeId }) => {
  setMessages(prev =>
    prev.map(msg =>
      messageIds.includes(msg._id)
        ? { 
            ...msg, 
            deliveredTo: [...new Set([...(msg.deliveredTo || []), employeeId])]
          }
        : msg
    )
  );
});

socket.on("messageSeen", ({ messageIds, employeeId }) => {
  setMessages(prev =>
    prev.map(msg =>
      messageIds.includes(msg._id)
        ? { 
            ...msg, 
            seenBy: [...new Set([...(msg.seenBy || []), employeeId])]
          }
        : msg
    )
  );
});
  return () => {
    socket.off("messageDelivered");
    socket.off("messageSeen");
  };
}, []);

  // ✅ Send message
const sendMessage = async () => {
  if (!message.trim()) return;
  socket.emit("sendMessage", {
    conversationId: conversation?._id,
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

  const formatMessageDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMessageTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

  const toggleChat = () => {
    setOpen((o) => !o);
    setMinimized(false);
    setIsPopup(false);
  };

  const typeingMessage = (e) => {
    setMessage(e.target.value);
    socket.emit("typing",{
    conversationId: conversation?._id,
    employeeId: user?.employeeId, 
    isTyping:true
    });

    if(typingTimeManageRef.current){
      clearTimeout(typingTimeManageRef.current);
    }

    typingTimeManageRef.current = setTimeout(() => {
      socket.emit("typing",{
      conversationId: conversation?._id,
      employeeId: user?.employeeId, 
      isTyping:null
      });
    },1500);
  };
  
  console.log(conversation);
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
            {employeeData?.EmplyeeProfile ? (
              <img src={employeeData?.EmplyeeProfile} alt="employee" style={{width:'28px',height:'27px',borderRadius:'50%'}}/>
            ) : (
              <SupportAgentIcon className="liveConversationAvater" />
            )}
            <div className="liveChatHeaderLive"></div>
            <span className="supportagettext">{employeeData?.YemplyeeName ?? "Employee"}</span>
            <CallIcon className='liveSectionAudioCallIcon' onClick={() => {startCall("audio", user?.employeeName, user?.employeeProfile, employeeData?.YemplyeeName, employeeData?.EmplyeeProfile)}}/>
            <VideoCallIcon className='liveSectionVidioCallIcon' onClick={() => {startCall("video", user?.employeeName, user?.employeeProfile, employeeData?.YemplyeeName, employeeData?.EmplyeeProfile)}}/>
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
                {messages.map((msg, index) => {
                  const currentDate = formatMessageDate(msg.createdAt);
                  const prevMessage = messages[index - 1];
                  const nextMessage = messages[index + 1];
                  const prevDate = prevMessage
                    ? formatMessageDate(prevMessage.createdAt)
                    : null;
                  const showDate = currentDate !== prevDate;
                  const isMine = msg?.senderId === user?.employeeId;
              const isLastFromSender = (!nextMessage || nextMessage.senderId !== msg.senderId);
                const showAvatar = !isMine && isLastFromSender;
                const isLast = index === messages.length - 1;

                  const totalParticipants = conversation.participants
                  .filter(p => p.employeeId !== user.employeeId)
                  .length;
                            console.log(totalParticipants);
                  const deliveredCount = msg.deliveredTo?.length || 0;
                  const seenCount = msg.seenBy?.length || 0;
                  let messageStatus = "sent";
                  if (deliveredCount > 0) {
                    messageStatus = "delivered";
                  }
                  if (seenCount === totalParticipants) {
                    messageStatus = "seen";
                  }

                  return(
                    <React.Fragment key={msg?._id}>
                  {showDate && (
                    <div className="chatDateSeparator">
                      {currentDate}
                    </div>
                  )}

                  <div
                    className={`${
                      isMine ? 'liveCustomerMessagesCustomer' : 'liveCustomerMessagesAgent'
                    }`}
                          style={{
                          marginBottom: !isMine && isLast && isTypingStart ? "25px" : "4px",
                        }}

                  >
                    {showAvatar && employeeData && (
                      <img
                        src={employeeData?.EmplyeeProfile}
                        alt={employeeData?.YemplyeeName}
                        className="chatAvatar"
                      />
                    )}
                    <div className='message_containerInner'>
                    {msg?.messageType === "image" && (
                      <img
                        src={msg?.mediaUrl}
                        alt="msg"
                        className="liveCustomerMessagesImage"
                        onLoad={() => setIsImageLoaded(true)}
                      />
                    )}
                    {msg?.messageType === "text" && (
                      <div
                        className={`liveCustomerMessagesText ${
                          isMine ? 'liveAgentMessage' : ''
                        }`}
                      >
                        {msg?.content}
                      </div>
                    )}
                    <div className='messageInnerTimeAndStatus'>
                      <div className="liveCustomerMessagesTime">
                        {formatMessageTime(msg?.createdAt)}
                      </div>
                      {isMine && (
                      <div className="liveCustomerMessagesStatus">
                        {messageStatus === "sent" && <SentIcon />}
                        {messageStatus === "delivered" && <DeliveredIcon />}
                        {messageStatus === "seen" && <SeenIcon />}
                      </div>
                    )}
                    </div>
                  </div>
                  </div>
                  </React.Fragment>
                )})}
                <div ref={endRef} />
              </div>
                {isTypingStart && <TypingIndicator />}
              <div className="liveConverstaionFooter">
                <label className="liveChatfileInput">
                  <input type="file" onChange={handleFileChange} />
                  <PermMediaOutlinedIcon className={`footerliveMedia ${!isImageLoaded ? 'inActiveLiveChantsendbtn' : ''}`} />
                </label>
                <input
                  type="text"
                  className="liveConverstaionInput"
                  name="userInputText"
                  value={message}
                  placeholder="Type a message..."
                  onChange={typeingMessage}
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


{webrtc.call.state === "RINGING" && (
  <IncomingCallPopup
    incoming={webrtc.call}
    localVideoinRemote={webrtc.localVideoinRemote} // show callee preview
    onAccept={webrtc.acceptCall}
    onReject={webrtc.rejectCall}
  />
)}

  <CallFloatingView
   callingState={webrtc.call.state}
    localVideoRef={webrtc.localVideoRef}
    localVideoinCalling={webrtc.localVideoinCalling}
    remoteVideoEls={webrtc.remoteVideoEls}
    remoteStreams={webrtc.remoteStreams}
    endCall={webrtc.endCall}
    toggleMic={webrtc.toggleMic}
    toggleCam={webrtc.toggleCam}
    toggleScreenShare={webrtc.toggleScreenShare}
    micOn={webrtc.micOn}
    camOn={webrtc.camOn}
    screenOn={webrtc.screenOn}
    formattedTimer={webrtc.formattedTimer}
    onReject={webrtc.rejectCall}
    callerData={webrtc.callerData}
  />
</div>
        
      )}
    </div>
  );
}

export default LiveChats;
