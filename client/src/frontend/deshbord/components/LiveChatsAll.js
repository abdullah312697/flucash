import { useCallback, useEffect, useRef, useState } from 'react'
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {Altaxios} from '../../Altaxios';
import { format, differenceInMinutes, differenceInHours, differenceInDays} from 'date-fns';
import PersonIcon from '@mui/icons-material/Person';
import { io } from "socket.io-client";

function LiveChatsAll() {
    const [open, setOpen] = useState(false);
    const [messages,setMessages] = useState("");
    const [allConversation,setAllConversation] = useState([]);
    const endRef = useRef(null);
    const [isImageLoaded,setIsImageLoaded] = useState(true);
    const [singleMessage,setSingleMessage] = useState({
      _id: null,
    conversation: []
    });
    const [currentIndex,setCurrentIndex] = useState('');
    const socketRef = useRef();

    useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL, {
      withCredentials: true
    });
Altaxios.get("/liveChats/ChatDataAll")
      .then(res => {
        setAllConversation(res.data);
        res.data.forEach(c => socketRef.current.emit("joinRoom", c._id));
      });

    // 2) brand-new chat arrives
    socketRef.current.on("newChat", summary => {
      setAllConversation(prev => [summary, ...prev]);
      socketRef.current.emit("joinRoom", summary._id);
    });

    // 3) new message in an existing chat
    socketRef.current.on("newMessage", ({ conversationId, entry }) => {
      setAllConversation(prev =>
        prev.map(c =>
          c._id === conversationId
            ? { ...c, unreadCount: c.unreadCount + 1 }
            : c
        )
      );
      if (singleMessage?._id === conversationId) {
        // append to open chat…
        setSingleMessage(a => ({
          ...a,
          conversation: [...a.conversation, entry]
        }));
      }
    });

    return () => socketRef.current.disconnect();
    }, [singleMessage?._id]);

      //formate date<>
      const formatTimestamp = (timestamp) => {
          const now = new Date();
          const date = new Date(timestamp);
      
          const minutesDiff = differenceInMinutes(now, date);
          const hoursDiff = differenceInHours(now, date);
          const daysDiff = differenceInDays(now, date);
      
          if (minutesDiff < 1) {
            return 'less than a minute ago';
          } else if (minutesDiff < 60) {
            return `${minutesDiff} minutes ago`;
          } else if (hoursDiff < 24) {
            return `${hoursDiff} hours ago`;
          } else if (daysDiff < 7) {
            return `${daysDiff} days ago`;
          }else if(daysDiff < 29){
              return `${daysDiff} days ago`;
          }else{
            return format(date, 'dd-MM-yyyy, hh:mm:ss a');
          }
        };
      
        // const formatDate = (date) => {
        //   return format(new Date(date), "dd-MM-yyyy 'at' h:mm:ss a");
        // };
      //formate date</>
      


const sendMessage = async(id, files) => {
  if (!messages.trim() && !files) return;
  const form = new FormData();
  if (files) form.append("file", files);
  else form.append("message", messages);
  form.append("sender", "agent");
  await Altaxios.post(
    `/liveChats/ReplyLiveConversation/${id}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  setMessages("");
};
      

      const scrollToBottom = useCallback(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, []);
    
      useEffect(() => {
        scrollToBottom();
      }, [singleMessage?.conversation,scrollToBottom]);

      const OpenLiveChatTerm = async(id, index) => {
        try{
            setCurrentIndex(index);
            const singleMessage = await Altaxios.get(`/liveChats/ChatDataAll/${id}`);
            if(singleMessage.status === 200){
              setSingleMessage(singleMessage.data);
              setOpen(true);
              await Altaxios.put(`/liveChats/ChatDataAll/${id}/read`);
                  setAllConversation(prev =>
                    prev.map(c =>
                      c._id === id ? { ...c, unreadCount: 0 } : c
                    )
                  );
            }
        }catch(err){
            console.log(err)
        }
      };
      
  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setIsImageLoaded(false);
    sendMessage(singleMessage?._id,file);
  };

  return (
    <div className='liveChatsMain_dbh'>
        <div className='liveChat_dbhGroupMain'>
            <div className='customer_dbhContainerLive'>
              {allConversation.length > 0 && allConversation.map((d, index) => (
                <div className={(index % 2) === 0 ? 'customer_dbh_liveInner_In' : 'customer_dbh_liveInner_Odd'} key={d._id} onClick={() => {OpenLiveChatTerm(d._id, index)}}>
                    <PersonIcon/>
                    <span>Customer - {index}</span>
                    <span className='liveChatdbh_due'>{d.unreadCount !== 0 ? d.unreadCount : ''}</span>
                </div>
                ))}
            </div>
        </div>
        {open && (
        <div className='liveChats_dbhInner'>
            <div className='liveConverstaionHeder'>
                    <SupportAgentIcon className='liveConversationAvater'/>
                    <div className='liveChatHeaderLive'></div>
                    <span className='supportagettext'>Customer - {currentIndex}</span> 
                    <CloseOutlinedIcon onClick={() => setOpen(false)} className='liveChatclosebtn'/>
            </div>
            <div className='liveCustomerMessages'>
                    {Object.keys(singleMessage).length > 0 &&
                        singleMessage?.conversation.map((message) => (
                            <div key={message._id} className={`${message.sender === 'agent' ? 'liveCustomerMessagesCustomer' : 'liveCustomerMessagesAgent'}`}>
                                {message.image && <img src={message.image.url} alt='customer' className='liveCustomerMessagesImage' onLoad={() => {scrollToBottom();setIsImageLoaded(true)}}/>}
                                {message.message && <div className={`liveCustomerMessagesText ${message.sender === 'agent' ? 'liveAgentMessage' : ''}`}>{message.message}</div>}
                                <div className='liveCustomerMessagesTime'>{formatTimestamp(message.createdAt)}</div>
                            </div>
                        ))
                    }
                    <div ref={endRef}/>
            </div>
            <div className='liveConverstaionFooter'>
                <label className='liveChatfileInput'>
                    <input type='file' multiple={false} onChange={handleFileChange}/>
                    <PermMediaOutlinedIcon className={`footerliveMedia ${!isImageLoaded ? 'inActiveLiveChantsendbtn' : ''}`}/>
                </label>
                    <input type='text' className='liveConverstaionInput' value={messages} placeholder='Type a message...' onChange={(e) => {setMessages(e.target.value)}} 
                    onKeyDown={e => {
                      if (e.key === "Enter" && messages.trim()) {
                        e.preventDefault();
                        sendMessage(singleMessage?._id);
                      }
                    }} 
                />
                <SendRoundedIcon className={`liveChatsSendbtn ${messages === "" ? 'inActiveLiveChantsendbtn' : ''}`}  onClick={() => {sendMessage(singleMessage?._id)}}/>
            </div>
        </div>
        )}
    </div>
  )}

export default LiveChatsAll