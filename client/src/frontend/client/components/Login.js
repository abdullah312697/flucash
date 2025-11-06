import { useEffect, useState } from 'react'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {Altaxios} from '../../Altaxios';
// import { trackPageView } from '../../../js/trackEvents';
// import {handleFbclidCookie} from '../../../js/fbclidUtils';

function Login() {
    // fbc click id<>
    // const fbc = handleFbclidCookie();
    // fbc click id</>
  
  
    //facebook pixle event<>
    // useEffect(() => {
    //   const pageData = {
    //             page_title: document.title,
    //             page_path: window.location.pathname,
    //             page_url: window.location.href,
    //             fbc : fbc || null,
    //   };
    //     trackPageView(pageData);
    //   }, [fbc]);
    //facebook pixle event</>
  
    const [userdata,SetuserData] = useState({companyEmail:"",companyPassword:""});
    const [loading,setLoading] = useState(false);
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
    try{
      const verifyUser = await Altaxios.get('/users/vefiryUsersLog');
      if(verifyUser.status === 200){
        navigate("/")
      }
    }catch(error){
      if(error.response){
        console.log(error.response.data.message);
      }else{
        console.log(error);
      }
    }
  }
  verifyUser();
  },[navigate]);

    let toggleButton = true;
    if(userdata.companyEmail !== "" && userdata.companyPassword){
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
      if(name === "companyPassword"){
        const passBtnlog = document.querySelector(".passBtnlog");
        if (window.matchMedia("(max-width: 600px)").matches) {
          passBtnlog.style = `top:34px`;
        } else {
          passBtnlog.style = `top:38px`;
      }
       }
     }else{
      sibling.style.display = "none";
      if(name === "companyPassword"){
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
  inpId.type = "companyPassword";
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
  try{
     const logRes = await Altaxios.post("/users/useLogin",userdata);
      if(logRes.status === 200){
      setResMessage(logRes.data.message);
      setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
      setLoading(false);
      SetuserData({companyEmail:"",companyPassword:""});
      setTimeout(() => {
          setResMsgStyle({opacity:0,marginTop:"0px"});
          navigate('/');
      },3000);
     }
  }catch(error){
    if(error.response){
      setResMessage(error.response.data.message);
      setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
      setTimeout(() => {
        setLoading(false);
          setResMsgStyle({opacity:0,marginTop:"0px"})
      },3000);
    }else{
      setResMessage("something went wrong!");
      setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
      setTimeout(() => {
        setLoading(false);
          setResMsgStyle({opacity:0,marginTop:"0px"})
      },3000);
      console.log(error);
    }
  }
}
  return (
    <div className="contactContainerMain">
    <div className="contactinnerMain">
      <div className='regLogtopTwo'>
        <h2>Login Here</h2>
        <Link to="/register">Register</Link>
      </div>
    <div className='contactInner'>
        <label htmlFor='log_email'>
            <span className='userinfotextdemo'>Email</span>
            <input type="text" name="companyEmail" autoComplete="off" placeholder="Enter your Email.."  id="log_email" onChange={getData} className='contactinput'/>
        </label>
        <div className="passwordPr">
        <label htmlFor='passOneInLog' className="passwordContinerLabel">
            <span className='userinfotextdemo'>Password</span>
            <input type="password" name="companyPassword" autoComplete="off" id="passOneInLog" placeholder="Enter password" onChange={getData} className='contactinput LogregsiterpassInput'/>
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