import React, { useState } from 'react'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useNavigate } from 'react-router-dom';
import {Altaxios} from '../../Altaxios'

function Login() {  
    const [userdata,SetuserData] = useState({email:"",password:""});
    const [loading,setLoading] = useState(false);
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const navigate = useNavigate();

  //   useEffect(() => {
  //     Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
  //       if(res.status === 200){
  //         navigate("/newking/")
  //       }
  //   })
  // },[navigate]);

    let toggleButton = true;
    if(userdata.email !== "" && userdata.password){
      toggleButton = false;
    }else{
      toggleButton = true;
    }

    const getData = (e) => {
      let sibling = e.currentTarget.previousElementSibling;
      let value = e.currentTarget.value;
      let name = e.currentTarget.name;
     if(value !== ""){
      sibling.style.display = "block";
      if(name === "password"){
        const passBtnlog = document.querySelector(".passBtnlog");
        if (window.matchMedia("(max-width: 600px)").matches) {
          passBtnlog.style = `top:34px`;
        } else {
          passBtnlog.style = `top:38px`;
      }
       }
     }else{
      sibling.style.display = "none";
      if(name === "password"){
        const passBtnlog = document.querySelector(".passBtnlog");
        passBtnlog.style = `top:21px`;
       }
     }
    SetuserData({...userdata,[e.target.name] : value});
  };
  
// toggle password <>
let inVisible = false;

const TogglePass = () => {
  const inpId = document.getElementById("passOneInLog");
  const showeone = document.getElementById("showPasslog");
  const hideone = document.getElementById("hidePasslog");
if(inVisible){
  inpId.type = "password";
  showeone.style = "display:block";
  hideone.style = "display:none !important";
  inVisible = false;
}else{
  inpId.type = "text";
  hideone.style = "display:block";
  showeone.style = "display:none !important";
  inVisible = true;
}
};
// toggle password </> //

const SignIn = async() => {
  setLoading(true);
  await Altaxios.post("/users/king_userLogin",userdata).then((res) => {
    if(res.status === 200){
      const newData = res.data.kingUser;
      setResMessage(res.data.message);
      setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
      setLoading(false);
      SetuserData({email:"",password:""});
      setTimeout(() => {
          setResMsgStyle({opacity:0,marginTop:"0px"});
          if(newData.accessRule === "All"){
            navigate('/newking/orderstatus');
          }else if(newData.accessRule === "Delivery"){
            navigate('/newking/confirmorder');
          }
      },3000);
     }else{
      setResMessage(res.data);
      setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
      setTimeout(() => {
        setLoading(false);
          setResMsgStyle({opacity:0,marginTop:"0px"})
      },3000);
     }
  });
}
 
const handleKeyUp = (event) => {
  if (event.key === 'Enter') {
    SignIn();
  }
};

return (
    <div className="contactContainerMain">
    <div className="contactinnerMain">
      <div className='regLogtopTwo'>
        <h2>Log in to access the dashboard.</h2>
      </div>
    <div className='contactInner'>
        <label htmlFor='log_email'>
            <span className='userinfotextdemo'>Email</span>
            <input type="text" name="email" autoComplete="off" placeholder="Enter your Email.."  id="log_email" onChange={getData} className='contactinput'/>
        </label>
        <div className="passwordPr">
        <label htmlFor='passOneInLog' className="passwordContinerLabel">
            <span className='userinfotextdemo'>Password</span>
            <input type="password" name="password" autoComplete="off" id="passOneInLog" placeholder="Enter password" onChange={getData} onKeyUp={handleKeyUp} className='contactinput LogregsiterpassInput'/>
        </label>
        <div className="passBtnlog">
            <VisibilityOutlinedIcon id="showPasslog" className="allPassBtn" onClick={TogglePass}/>
            <VisibilityOffOutlinedIcon id="hidePasslog" className="allPassBtn" onClick={TogglePass}/>
        </div>
        </div>
        <button className='contactsendbtn' disabled={toggleButton} onClick={SignIn}>{loading ? "Trying..." : "Login"}</button>
        <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default Login