import React, { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import {Altaxios} from '../../Altaxios'
import { useNavigate } from 'react-router-dom';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

function CustomerContact() {
    const [messages,setMessages] = useState([]); 
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [deleteMessageId,setDeleteMessageId] = useState("");
    const [replayMessageId,setReplayMessageId] = useState("");
    const [sendMessage,setSendMessage] = useState("");
    const navigate = useNavigate();
    
    useEffect(() => {
        Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
        if(res.status === 201 || res.data !== "All"){
            navigate("/newking");
        }
    })
    },[navigate]);

    useEffect(() => {
        Altaxios.get('/contact/getAllmessages').then((res) => {
            if(res.status === 200){
                setMessages(res.data);
            }
        })    
    },[]);
    console.log(messages)
    let checkEmptyInput = true;
    if(sendMessage !== ""){
        checkEmptyInput = false;
    }else{
        checkEmptyInput = true;
    }
    
    const cencelPopupDescription = () => {
        const getpr = document.querySelector(".preDeletebtnContainerFive");
        getpr.style = `display:none`;
    }
    
    const CancelToggleDescription = () => {
        const checkActive = document.querySelector(".activeFutureUpdate");
        const DAcheckActive = document.querySelector(".DeActiveFutureUpdate");
        if(checkActive){
            checkActive.classList.remove("activeFutureUpdate")
        }
        if(DAcheckActive){
            DAcheckActive.classList.remove("DeActiveFutureUpdate")
        }
    };

    const toggleUpdateAndEditDescrip = (e, replyId) => {
        setReplayMessageId(replyId)
        CancelToggleDescription();
        const parents = e.currentTarget.parentElement.parentElement;
        parents.classList.add("DeActiveFutureUpdate")
        const grandParents = parents.nextElementSibling;
        grandParents.classList.add("activeFutureUpdate");
    };

    const DeletePopupDescription = (deleteId) => {
        const showPopup = document.querySelector(".preDeletebtnContainerFive");
        showPopup.style = `display:block`;
        setDeleteMessageId(deleteId ?? "");
    };
    
    const DeleteDescripTion = async() => {
        await Altaxios.delete(`contact/deleteMessage/${deleteMessageId}`).then((res) => {
            if(res.status === 200){
                setMessages((prevMessages) => prevMessages.filter((message) => message._id !== res.data.data._id));
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                cencelPopupDescription();
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"});
                },3000);
               }else{
                setResMessage(res.data);
                setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"})
                },3000)
               }
        });
    };
    const sendeReplyMessage = async() => {
        await Altaxios.put(`contact/replayMessage/${replayMessageId}`,{sendReply:sendMessage}).then((res) => {
            if(res.status === 200){
                setResMessage(res.data);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"});
                    setSendMessage("");
                },3000);
               }else{
                setResMessage(res.data);
                setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"});
                },3000)
               }
        });
    };

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
    }else{
      return format(date, 'dd-MM-yyyy, hh:mm:ss a');
    }
  };

  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain" style={{width:'1297px'}}>
        <h2>All Content message</h2>
    <div className='contactInner'>
            <div className='preDeletebtnContainerFive'>
                <div className="preDeletePopup">
                    <h6 style={{marginBottom:'15px'}}>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={cencelPopupDescription}>No</button>
                        <button className='nextsupportbtn' onClick={DeleteDescripTion}>Yes</button>
                    </div>
                </div>
                </div>

        <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading' style={{display:'block',position:'relative',padding:'20px'}}>
                    <span style={{top:'8px',left:'10px',position:'absolute'}}>Date</span>
                    <span style={{top:'8px',left:'180px',position:'absolute'}}>Name</span>
                    <span style={{top:'8px',left:'340px',position:'absolute'}}>Email</span>
                    <span style={{top:'8px',left:'540px',position:'absolute'}}>Phone</span>
                    <span style={{top:'8px',right:'451px',position:'absolute'}}>Message</span>
                    <span style={{top:'8px',right:'77px',position:'absolute'}}>Reply</span>
                    <span style={{top:'8px',right:'10px',position:'absolute'}}>Delete</span>
                </div>
                {
                 messages !== undefined && messages.length > 0  ? messages.map((d) => (
                    <div className='dbh_productFeuterValue' key={d._id} style={{padding:'10px'}}>
                        <div className='dbh_feauerview' style={{alignItems:'flex-start',position:'relative',padding:'0px'}}>
                            <span style={{width:'170px'}}>{formatTimestamp(d.createdAt)}</span>
                            <span style={{width:'160px'}}>{d.fullname}</span>
                            <span style={{width:'200px'}}>{d.email}</span>
                            <span style={{width:'160px'}}>{d.phone}</span>
                            <span className='dbh_productDesc' style={{width:'400px'}}>{d.comment}</span>
                            <span style={{width:'43px',margin:'0px 20px'}}><ReplyIcon style={{color:"#25ff00"}} onClick={(e) => {toggleUpdateAndEditDescrip(e, d._id)}}/></span>
                            <span style={{width:'40px'}}><DeleteIcon style={{color:"#d70000"}} onClick={() => {DeletePopupDescription(d._id)}}/></span>
                        </div>
                        <div className='dbh_feauterupdate' style={{position:'relative',alignItems:'center',justifyContent:'center',padding:'0px'}}>
                            <textarea rows={5} cols={10}
                            style={{width:'450px',resize:'none',marginBottom:'0px'}} type='text' name="messages" placeholder='write messages...' 
                             className='ProductSpcInnerRight' value={sendMessage} onChange={(e) => {setSendMessage(e.target.value)}}
                           ></textarea>
                            <button style={{width:'70px',background:'#339d00',marginRight:'10px'}} onClick={CancelToggleDescription}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00',marginRight:'10px'}}onClick={sendeReplyMessage} disabled={checkEmptyInput}>Send</button>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>Data no avilable...</h4>
    }           
         </div>
        </div>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}
export default CustomerContact