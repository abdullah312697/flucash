import React, { useState } from 'react'
import {Altaxios} from '../../Altaxios';

function Contact() {
  const [contuctInfo,setContuctInfo] = useState({fullname:"",email:"",phone:"",comment:""});
  const [resMessage,setResMessage] = useState("");
  const [resMsgStyle,setResMsgStyle] = useState({});
  const [loading,setLoading] = useState(false);

  let CheckEmpty = true;
  if(contuctInfo.fullname !== "" && contuctInfo.email !== "" && contuctInfo.phone !== "" && contuctInfo.comment !== ""){
    CheckEmpty = false;
  }else{
    CheckEmpty = true;
  }
  const userDatacollect = (e) => {
    let sibling = e.currentTarget.previousElementSibling;
    let value = e.currentTarget.value;
    let name = e.currentTarget.name;
    setContuctInfo({...contuctInfo,[name]:value});
   if(value !== ""){
    sibling.style.display = "block";
   }else{
    sibling.style.display = "none";
   }

};
//send contatactInfo<>
const submitMessage = async() => {
  setLoading(true);
  await Altaxios.post("/contact/addNewContact",contuctInfo).then((res) => {
    if(res.status === 200){
      setResMessage(res.data);
      setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
      setLoading(false);
      setContuctInfo({fullname:"",email:"",phone:"",comment:""});
      setTimeout(() => {
          setResMsgStyle({opacity:0,marginTop:"0px"});
      },3000);
     }else{
      setResMessage(res.data);
      setLoading(false);
      setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
      setTimeout(() => {
          setResMsgStyle({opacity:0,marginTop:"0px"})
      },3000);
     }

  });    

}
//send contact info </>

  return (
    <div className='contactContainerMain'>
      <div className='contactinnerMain'>
        <h2 style={{color:'#bb8600',marginBottom:'10px'}}>Contact us</h2>
        <div className='contactInner'>
        <label htmlFor='con_fullname'>
            <span className='userinfotextdemo'>fullname</span>
            <input className="contactinput" autoComplete="off" onChange={userDatacollect} type='text' id="con_fullname" value={contuctInfo.fullname} name='fullname'  placeholder='Enter your full name...'/>
        </label>
        <label htmlFor='con_email'>
            <span className='userinfotextdemo'>Email</span>
            <input className="contactinput" autoComplete="off" onChange={userDatacollect} type='text' id="con_email" value={contuctInfo.email} name='email'  placeholder='Enter your email...'/>
        </label>
        <label htmlFor='con_phone'>
            <span className='userinfotextdemo'>phone number</span>
            <input className="contactinput" autoComplete="off" onChange={userDatacollect} type='text' id="con_phone" value={contuctInfo.phone} name='phone'  placeholder='Enter your phone number...'/>
        </label>
        <label htmlFor='con_texteria'>
            <span className='userinfotextdemo'>your comment</span>
            <textarea rows={5} cols={50} autoComplete="off" value={contuctInfo.comment}  name='comment'  resizeable="false" onChange={userDatacollect} id="con_texteria" className='contacttextarea' placeholder='write here...'></textarea>
        </label>
          <button className='contactsendbtn' disabled={CheckEmpty} onClick={submitMessage}>{!loading ? "Send" : "Sending..."}</button>
          <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
      </div>
    </div>
  )
}

export default Contact