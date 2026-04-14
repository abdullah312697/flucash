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
import {socket} from '../../../socket';
import TypingIndicator from "./TypingIndicator";
import { ReactComponent as SentIcon } from "../../../vactors/eye-closed.svg";
import { ReactComponent as DeliveredIcon } from "../../../vactors/eye-half-open.svg";
import { ReactComponent as SeenIcon } from "../../../vactors/eye-open.svg";
import AudioPlayer from './AudioPlayer';
import { VoiceRecorder } from "./VoiceRecorder";
import VoicePlayer from './VoicePlayer';
import wordIcon from '../../../images/icons/office.png';
import XcellIcon from '../../../images/icons/xcell.png';
import zipIcon from '../../../images/icons/zip.png';
import pptIcon from '../../../images/icons/ppt.png';
import fileIcon from '../../../images/icons/open-folder.png';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DescriptionIcon from '@mui/icons-material/Description';

function GroupChats() {
  const [open, setOpen] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  // const [isPhone, setIsPhone] = useState(false);
  const [previewFiles,setPreviewFiles] = useState([]);
  const fileInputRef = useRef();
  const [lastMessage, setLastMessage] = useState('');
  const endRef = useRef(null);
  const nodeRef = useRef(null);
  const innerRef = useRef(null);
  const [isTypingStart,setIsTypingStart] = useState(false);
  const popupTimerRef = useRef(null);
  const typingTimeManageRef = useRef(null);
  const [convInfo,setConvInfo] = useState({type:"group", participants:[], title:"", avater:"",});
  const {user} = useAuth();
  const [senderInfo, setSenderInfo] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFilesMsg, setPreviewFilesMsg] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(null);

  useEffect(()=>{
        const getAllEmployee = async () => {
        try{
          const Emplyee = await Altaxios.get("/newemplyee/getallEmployeeforMessage/");
        if(Emplyee.status === 200){
          const EmplyeeData = Emplyee.data.data;
          setSenderInfo(EmplyeeData);
          const employeeIds = EmplyeeData.map(emp => emp._id);
            setConvInfo(prev => ({
            ...prev,
            title: user?.companyName,
            avater: user?.companyLogo,
            participants: employeeIds,
            }))
        }
      }catch(error){
        if(error.response){
          console.log(error.response.data.message);
        }else{
          console.log(error);
        }
      }
      };
      getAllEmployee();
  
    },[user?.companyName,user?.companyLogo]);

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


  useEffect(() => {
  socket.on("uploadProgress", ({ senderId: sid, phase, overallPercent, totalFiles }) => {
    // Only show progress bar to the sender
    if (String(sid) !== String(user?.employeeId)) return;

    if (phase === "done") {
      // Small delay so user sees the 100% green bar complete
      setTimeout(() => setUploadProgress(null), 1000);
      return;
    }

    setUploadProgress({ phase, overallPercent, totalFiles });
  });

  return () => socket.off("uploadProgress");
}, [user?.employeeId]);

  // ✅ Detect mobile
  // useEffect(() => {
  //   const checkDevice = () => {
  //     const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
  //     const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  //     const isMobile = /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  //     setIsPhone(isSmallScreen && isMobile);
  //   };
  //   checkDevice();
  //   window.addEventListener('resize', checkDevice);
  //   return () => window.removeEventListener('resize', checkDevice);
  // }, []);

  // ✅ Socket + Fetch conversation
useEffect(() => {
  const loadChat = async () => {
    try {
      if(convInfo?.participants?.length !== 0){
      const { data } = await Altaxios.post('/conversation/newConverSation', convInfo);
      setConversation(data?.conversation);
      console.log(data?.conversation);
      setMessages(data.messages || []);
      socket.emit("joinConversation", {
        conversationId: data?.conversation?._id
      });
    }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  loadChat();

}, [convInfo]);

useEffect(() => {
  socket.on("userTyping",({isTyping}) => {
      setIsTypingStart(isTyping);
  });
  return () => {
    socket.off("userTyping");
  };
},[]);

useEffect(() => {
if (!user?.employeeId) return;
socket.on("newMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);
    setConversation((prevData) => {
      return{
        ...prevData,
        lastMessage: msg
      }
    });

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
    socket.emit("message:seen", { messageIds: unseenMessageIds, employeeId: user?.employeeId, conversationId: conversation?._id });
  }
}
}, [messages, user?.employeeId, open, minimized, conversation?._id]);

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

const sendMessage = async (blob) => {
  if (!conversation?._id || !user?.employeeId) return;
  setInputMessage("");
  setPreviewFiles([]);

  const formData = new FormData();
  if (blob) {
    formData.append("files", blob);
  } else {
    previewFiles.forEach((item) => formData.append("files", item.file));
  }

  formData.append("conversationId", conversation?._id);
  formData.append("senderId", user?.employeeId);
  formData.append("content", inputMessage);

  try {
    const msgRes = await Altaxios.post("messages/newMessage", formData);
    console.log(msgRes);
    // Progress is handled entirely via socket events from backend
  } catch (error) {
    console.error(error);
    setUploadProgress(null); // clear on error
  }
};

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const newFiles = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));
    setPreviewFiles((prev) => [...prev, ...newFiles]);
        e.target.value = null
  };

const removeFile = (index) => {
    const updated = [...previewFiles];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setPreviewFiles(updated);
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
    setInputMessage(e.target.value);

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

  const senderMap = React.useMemo(() => {
  const map = {};
  senderInfo.forEach(user => {
    map[user._id] = user;
  });
  return map;
}, [senderInfo]);

const openPreview = (files, index) => {
  setPreviewFilesMsg(files);
  setCurrentIndex(index);
  setPreviewOpen(true);
};


const handleDownload = async (fileArg) => {
 let file = fileArg || previewFilesMsg?.[currentIndex];
 if (Array.isArray(file)) {
    file = file[0];
  }

  if (!file) {
    console.error("No file found");
    return;
  }

  const url = file?.mediaUrl;
  const type = file?.messageType;
  const fileName = file?.fullName;

  if (!url) {
    console.error("Invalid file URL", file);
    return;
  }

  try {
    const fetchTypes = ["image", "pdf", "text"];

    if (fetchTypes.includes(type)) {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }
    else {
      const link = document.createElement("a");
      let downloadUrl = url;
      downloadUrl = `${url}?fl_attachment=${encodeURIComponent(fileName)}`;
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  } catch (error) {
    console.error("Download failed:", error);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const truncateFileName = (name = "") => {
  if (!name) return "Document";
  const lastDot = name.lastIndexOf(".");
  const ext = lastDot !== -1 ? name.slice(lastDot) : "";
  const base = lastDot !== -1 ? name.slice(0, lastDot) : name;
  if (base.length <= 15) return name; // no need to truncate short names
  return `${base.slice(0, 5)}...${base.slice(-3)}${ext}`;
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
            {conversation?.avatar !== "" ? (
              <img src={conversation?.avatar} alt="avater" style={{width:'28px',height:'27px',borderRadius:'50%'}}/>
            ) : (
              <SupportAgentIcon className="liveConversationAvater" />
            )}
            <div className="liveChatHeaderLive"></div>
            <span className="supportagettext">{conversation?.avatar ?? "Company"}</span>
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
                const isMine = String(msg?.senderId) === String(user?.employeeId);
                const isLastFromSender = (!nextMessage || nextMessage.senderId !== msg.senderId);
                const showAvatar = !isMine && isLastFromSender;
                const sender = senderMap[msg.senderId];
                const showName =
                  !isMine &&
                  (!prevMessage || prevMessage.senderId !== msg.senderId);

                const totalParticipants = conversation.participants
                  .filter(p => p.employeeId !== user.employeeId)
                  .length;
                const deliveredCount = msg.deliveredTo?.length || 0;
                const seenCount = msg.seenBy?.length || 0;
                let messageStatus = "sent";
                if (deliveredCount > 0) messageStatus = "delivered";
                if (seenCount === totalParticipants) messageStatus = "seen";

                const lastMessage = String(conversation?.lastMessage?.messageId) === String(msg?._id);
                const isNotmyMsg = String(conversation?.lastMessage?.senderId) !== String(user?.employeeId);

                // ── Separate visual (image/video) from everything else ──
                const visualMedia = msg.media?.filter(
                  f => f.messageType === "image" || f.messageType === "video"
                ) || [];
                const otherMedia = msg.media?.filter(
                  f => f.messageType !== "image" && f.messageType !== "video"
                ) || [];
                const mediaLength = otherMedia.length;

                return (
                  <React.Fragment key={msg?._id}>
                    {showDate && (
                      <div className="chatDateSeparator">
                        {currentDate}
                      </div>
                    )}

                    <div
                      className={`${isMine ? 'liveCustomerMessagesCustomer' : 'liveCustomerMessagesAgent'}`}
                      style={{ marginBottom: `${lastMessage && isNotmyMsg ? "25px" : ""}` }}
                    >
                      {showName && (
                        <div className="senderName">
                          {sender?.YemplyeeName}
                        </div>
                      )}
                      {showAvatar && sender && (
                        <img
                          src={sender.EmplyeeProfile}
                          alt={sender.YemplyeeName}
                          className="chatAvatar"
                        />
                      )}

                      <div className='message_containerInner'>

                        {/* ── VISUAL MEDIA: images & videos in grid ── */}
                        {visualMedia.length > 0 && (
                          <div className={`mediaGrid mediaCount_${Math.min(visualMedia.length, 4)}`}>
                            {visualMedia.slice(0, 4).map((file, i) => {
                              const isExtra = visualMedia.length > 4 && i === 3;
                              const extraCount = visualMedia.length - 3;
                              return (
                                <div
                                  key={i}
                                  className="mediaItem"
                                  onClick={() => openPreview(visualMedia, i)}
                                >
                                  {file.messageType === "image" && (
                                    <img src={file.mediaUrl} alt="media" />
                                  )}
                                  {file.messageType === "video" && (
                                    <video src={file.mediaUrl} />
                                  )}
                                  {isExtra && (
                                    <div className="mediaOverlay">+{extraCount}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* ── OTHER MEDIA: each file shown individually ── */}
                        {otherMedia.map((file, i) => {
                          const fileType = file.messageType;
                          return (
                            <div key={i} className="mediaItem">

                              {/* PDF */}
                              {fileType === "pdf" && (
                              <div style={{ margin: mediaLength > 1 ? "10px 0px" : "0px" }}>
                                <div
                                  onClick={() => openPreview([file], 0)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div className='pdfpopUPshow'>PDF</div>
                                  <img
                                    src={file.mediaUrl.replace("/upload/", "/upload/w_215,h_140,c_fill,g_north,q_auto,f_auto/")}
                                    style={{ objectFit: 'inherit' }}
                                    alt="pdf"
                                  />
                                </div>
                                </div>
                              )}

                              {/* AUDIO */}
                              {fileType === "audio" && (
                                <div style={{ margin: mediaLength > 1 ? "10px 0px" : "0px" }}>
                                <AudioPlayer
                                  source={file.mediaUrl}
                                  isMine={isMine}
                                  isVoice={false}
                                  srcIndex={`${msg._id}-audio-${i}`}
                                />
                                </div>
                              )}

                              {/* DOCUMENTS & OTHER FILES */}
                              {(fileType === "text" ||
                                fileType === "word" ||
                                fileType === "excel" ||
                                fileType === "powerpoint" ||
                                fileType === "archive" ||
                                fileType === "file"
                              ) && (
                                <div className={mediaLength > 1 ? "fileDocsSeperator" : ""} >
                                <div className="previewDownlaodFile">
                                  <div className='iconsforFiles'>
                                    {
                                      fileType === "text" ? (<DescriptionIcon/>) :
                                    (<img
                                      src={
                                        fileType === "word" ? wordIcon :
                                        fileType === "excel" ? XcellIcon :
                                        fileType === "powerpoint" ? pptIcon :
                                        fileType === "archive" ? zipIcon :
                                        fileIcon
                                      }

                                      alt="fileIcons"
                                    />)
                                    }
                                    <span className='fileInnerText'>{truncateFileName(file.fullName)}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDownload(file)}
                                    className='filedownloadIcon'
                                  >
                                    <ArrowDownwardIcon />
                                  </button>
                                </div>
                                </div>
                              )}

                            </div>
                          );
                        })}

                        {/* TEXT MESSAGE */}
                        {msg?.messageType === "text" && (
                          <div
                            className={`liveCustomerMessagesText ${isMine ? 'liveAgentMessage' : ''}`}
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
                );
                })}


                {/* ── File Previews (before sending) ── */}
                {previewFiles.length > 0 &&
                  <div className="preview-container">
                    {previewFiles.map((item, index) => (
                      <div key={index} className="preview-item">
                        <button className="remove-btn" onClick={() => removeFile(index)}>✕</button>
                        {item.type.startsWith("image") ? (
                          <img src={item.preview} alt="" className="preview-image" />
                        ) : (
                          <div className="file-box">FILE</div>
                        )}
                      </div>
                    ))}
                    <div
                      className="add-btn"
                      onClick={() => fileInputRef.current.click()}
                      style={{ display: `${previewFiles.length > 9 ? 'none' : ''}` }}
                    >
                      {previewFiles.length} +
                    </div>
                  </div>
                }


                {/* ── Media Preview Modal ── */}
                {previewOpen && (
                  <div className="mediaModal" onClick={() => setPreviewOpen(false)}>
                    <div className="mediaModalContent" onClick={(e) => e.stopPropagation()}>

                      <div className="mediaModalTopBar">
                        {/* Prev / Next navigation */}
                        <button
                          className="downloadBtn"
                          onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}
                          disabled={currentIndex === 0}
                        >
                          ‹ Prev
                        </button>
                        <span style={{ fontSize: "12px", color: "#ccc" }}>
                          {currentIndex + 1} / {previewFilesMsg.length}
                        </span>
                        <button
                          className="downloadBtn"
                          onClick={() => setCurrentIndex(i => Math.min(i + 1, previewFilesMsg.length - 1))}
                          disabled={currentIndex === previewFilesMsg.length - 1}
                        >
                          Next ›
                        </button>
                        <button className="downloadBtn" onClick={() => handleDownload()}>
                          ⬇ Download
                        </button>
                        <button className="closeBtn" onClick={() => setPreviewOpen(false)}>✕</button>
                      </div>

                      {previewFilesMsg[currentIndex]?.messageType === "image" && (
                        <img src={previewFilesMsg[currentIndex].mediaUrl} alt="preview" />
                      )}
                      {previewFilesMsg[currentIndex]?.messageType === "video" && (
                        <video controls autoPlay src={previewFilesMsg[currentIndex].mediaUrl} />
                      )}
                      {previewFilesMsg[currentIndex]?.messageType === "audio" && (
                        <audio controls autoPlay src={previewFilesMsg[currentIndex].mediaUrl} />
                      )}
                      {previewFilesMsg[currentIndex]?.messageType === "pdf" && (
                        <iframe
                          src={previewFilesMsg[currentIndex].mediaUrl}
                          width="500px"
                          height="450px"
                          style={{ border: "none" }}
                          title="pdfviewar"
                        />
                      )}
                      {previewFilesMsg[currentIndex]?.messageType === "file" && (
                        <a href={previewFilesMsg[currentIndex].mediaUrl} target="_blank" rel="noreferrer">
                          Download File
                        </a>
                      )}

                    </div>
                  </div>
                )}


                {/* uploadProgress &&  ── Upload Progress Bar ── */}
                {uploadProgress && uploadProgress?.phase === "uploading" && (
                  <div className="uploadProgressWrapper">
                    <div className="uploadProgressTrack">
                      <div
                        className="uploadProgressFill"
                      />
                      {`⬆ Uploading ${uploadProgress.overallPercent}%`}
                      <div className='uloadPrgressFillinner'
                          style={{
                            width: `${uploadProgress.overallPercent}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {isTypingStart && <TypingIndicator />}

              <div className="liveConverstaionFooter">
                <label className="liveChatfileInput">
                  <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
                  <PermMediaOutlinedIcon className={`footerliveMedia ${previewFiles.length > 10 ? 'inActiveLiveChantsendbtn' : ''}`} />
                </label>
                <input
                  type="text"
                  className="liveConverstaionInput"
                  name="userInputText"
                  value={inputMessage}
                  placeholder="Type a message..."
                  onChange={typeingMessage}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputMessage.trim()) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                {(previewFiles.length === 0 && inputMessage === "") ? (
                  <VoiceRecorder
                    onSend={(blob) => sendMessage(blob)}
                    onCancel={() => console.log("Cancelled")}
                    audioPlayerComponent={VoicePlayer}
                  />
                ) : (
                  <SendRoundedIcon
                    className="liveChatsSendbtn"
                    onClick={() => sendMessage()}
                  />
                )}
              </div>
            </>
          )}
</div>
      )}
    </div>
  );
}

export default GroupChats;