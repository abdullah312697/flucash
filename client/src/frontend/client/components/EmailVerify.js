import {useEffect, useState} from 'react';
import {Altaxios} from '../../Altaxios';
import { useNavigate } from 'react-router-dom';

const EmailVerify = () => {
const [msgStyle,setMsgStyle] = useState({});
const [errMsg,SeterrMsg] = useState("");
const navigate = useNavigate();
const [isCheckEmpty, setIsCheckEmpty] = useState(true);
const [isResend, setIsResend] = useState(false);
const [countdown, setCountdown] = useState(0);

useEffect(() => {
  const veriryUser = async() => {
  try{
    await Altaxios.get('/users/vefiryUsers');
  }catch(error){
    if(error.response){
      navigate("/register");
    }else{
      console.log(error);
    }
  }
  }
  veriryUser();
},[navigate]);

const updateCheckEmptyState = (inputs) => {
  const isEmpty = Array.from(inputs).some(input => input.value === "");
  setIsCheckEmpty(isEmpty);
};
//change previous focus in input<>
  const backRet = (e) => {
    const allCode = document.querySelectorAll(".vfInput");
    if(e.target.value === ""){
      if(e.target.previousElementSibling !== null){
        if(e.keyCode === 8){
         e.target.previousElementSibling.focus();
        }
      }  
    }
    updateCheckEmptyState(allCode);
  };
//change previous focus in input</>
//set a number in input only one carrecter <>
  const getVFCode = (e) => {
    const allCode = document.querySelectorAll(".vfInput");
    e.target.value = e.target.value.replace(/\D/g, '').substr(0, 1);
    if(e.target.value !== ""){
      if(e.target.nextElementSibling !== null){
        e.target.nextElementSibling.focus();
      }
    }
    updateCheckEmptyState(allCode);
  };
//set a number in input only one carrecter </>
// start countdown<>
const startCountdown = () => {
  const duration = 60; 
  setCountdown(duration);
  const timer = setInterval(() => {
    setCountdown(prev => {
      if (prev === 1) {
        clearInterval(timer); 
        setIsResend(false); 
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};
// start countdown</>
//resend verification code<>
const reSendCode = async() => {
    try{
      setIsResend(true);
      startCountdown();
      const detInput = document.querySelectorAll(".vfInput");
      detInput.forEach(e => e.value="");  
      //random number generator
      const minm = 100000;
      const maxm = 999999;
      const result = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
      //random number generator
      await Altaxios.put('/users/updateVfCode',{verifyCode:result}).then((res) => {
        if(res.status === 200){
          SeterrMsg(res.data.message);
          setMsgStyle({opacity:1 ,color:"green"});
          setTimeout(()=>{
            setMsgStyle({opacity:0});
          },3000);
        }
      });
    }catch(err){
      console.log(err);
    }
  };
  //resend verification code</>
  //verify Email address<>
const getAllWithCode = async() => {
    setIsCheckEmpty(true);
    var vfCode = {verifyCode: ""};
    const allCode = document.querySelectorAll(".vfInput");
    allCode.forEach(d => {
      vfCode.verifyCode += d.value;
    });
  try{
    await Altaxios.post("/users/verifyCode", vfCode).then((res) => {
      if(res.status !== 200){
        SeterrMsg(res.data.message);
        setMsgStyle({opacity:1,color:"red"});
        setTimeout(()=>{
          setMsgStyle({opacity:0});
        },3000);
    }
    if(res.status === 200){
      SeterrMsg(res.data.message);
      setMsgStyle({opacity:1,color:"green"});
      setTimeout(()=>{
        navigate('/');
        setMsgStyle({opacity:0});
      },3000);
    }
    });
  }catch(err){
    console.log(err);
  }
  };
  //verify Email address</>
  
  return (
    <div className="contactContainerMain">
    <div className='contactinnerMain'>
    <h2 className='emailVerifyheadding'>Verify Your Email Address</h2>
    <div className="verifyEmail">
      <input type="number" placeholder="X"  name="vfCodeOne" onKeyDown={backRet} onChange={getVFCode} className="vfInput"/>
      <input type="number" placeholder="X"  name="vfCodeOne" onKeyDown={backRet} onChange={getVFCode} className="vfInput"/>
      <input type="number" placeholder="X"  name="vfCodeOne" onKeyDown={backRet} onChange={getVFCode} className="vfInput"/>
      <input type="number" placeholder="X"  name="vfCodeOne" onKeyDown={backRet} onChange={getVFCode} className="vfInput"/>
      <input type="number" placeholder="X"  name="vfCodeOne" onKeyDown={backRet} onChange={getVFCode} className="vfInput"/>
      <input type="number" placeholder="X"  name="vfCodeOne" onKeyDown={backRet} onChange={getVFCode} className="vfInput"/>
    </div>
    <div className="resendVfcode">
      <input type="button" className='verifyEmailRsbtn' value="Resend" onClick={reSendCode} disabled={isResend}/>
      <span className='isResendCountDown'>{isResend ? `${countdown}s` : ""}</span>
      <div className="showMsg" style={msgStyle}>{errMsg}</div>
      <input type="button" className='verifyEmailVfbtn' value="Verify" disabled={isCheckEmpty} onClick={getAllWithCode}/>
    </div>
    </div>
  </div>
)
}

export default EmailVerify