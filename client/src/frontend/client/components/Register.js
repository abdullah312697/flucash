import { useRef,useState } from 'react'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// import { trackPageView, trackRegistration } from '../../../js/trackEvents';
// import {handleFbclidCookie} from '../../../js/fbclidUtils';

function Register() {        
    const [userdata,SetuserData] = useState({companyName:"",industry:"",numberofEmployees:"",companyEmail:"",companyPassword:"",rePassword:"",verifyCode:null});
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [loading,setLoading] = useState(false);
    const navigate = useNavigate();
    const isCodeGenerated = useRef(false);
    const [inVisible,setIsVisible] = useState(false)
    const passwordOne = useRef(null);
    const passwordTwo = useRef(null);
      const inputFile = useRef(null);
      const preview = useRef(null);
      const [emplyeeProfile,setEmplyeeProfile] = useState(null);
      const { register } = useAuth();

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


    let toggleButton = useRef(true);
    if(userdata.companyName !== "" &&
       userdata.industry !== "" &&
       userdata.numberofEmployees !== "" &&
       userdata.companyEmail !== "" &&
       userdata.companyPassword &&
      userdata.rePassword !== ""){
      toggleButton.current = false;
    }else{
      toggleButton.current = true;
    }

    const getData = (e) => {
      let sibling = e.currentTarget.previousElementSibling;
      let value = e.currentTarget.value;
      let name = e.currentTarget.name;
     if(value !== ""){
      if(sibling){
        sibling.style.display = "block";
      }
      if(name === "companyPassword"){
        const passBtnreg = document.querySelector(".passBtnreg");
        if (window.matchMedia("(max-width: 600px)").matches) {
          passBtnreg.style = `top:34px`;
        } else {
          passBtnreg.style = `top:38px`;
      }
       }

      }else{
      if(sibling){
        sibling.style.display = "none";
      }
      if(name === "companyPassword"){
        const passBtnreg = document.querySelector(".passBtnreg");
        passBtnreg.style = `top:23px`;
       }
     }
     SetuserData({...userdata,[name] : value});
  
     if(!isCodeGenerated.current){
      const minm = 100000;
      const maxm = 999999;
      const result = Math.floor(Math.random() * (maxm - minm + 1)) + minm;
      SetuserData(prevUserData => (
        {
          ...prevUserData,
          verifyCode: result
        }
      ));      
      isCodeGenerated.current = true;
     }
  };
//registation <>
// Registration Function (Corrected)
const submitRegistation = async () => {
  setLoading(true);
  setResMessage("");

  try {
    const CompanyData = new FormData();
    CompanyData.append("file", emplyeeProfile);
    CompanyData.append("companyName", userdata.companyName);
    CompanyData.append("industry", userdata.industry);
    CompanyData.append("numberofEmployees", userdata.numberofEmployees);
    CompanyData.append("companyEmail", userdata.companyEmail);
    CompanyData.append("companyPassword", userdata.companyPassword);
    CompanyData.append("rePassword", userdata.rePassword);
    CompanyData.append("verifyCode", userdata.verifyCode);

    // ⬅⬅ FIXED — MUST USE AWAIT
    const res = await register(CompanyData);

    // Success message
    setResMessage(res.data.message);
    setResMsgStyle({ color: "green", opacity: 1, marginTop: "15px" });

    // Save Access Data
    localStorage.setItem("AccessData", JSON.stringify(res.data.AccessData));

    // Reset form
    SetuserData({
      companyName: "",
      industry: "",
      numberofEmployees: "",
      companyEmail: "",
      companyPassword: "",
      rePassword: "",
      verifyCode: null
    });

    setTimeout(() => {
      setResMsgStyle({ opacity: 0 });
      navigate("/verifyemail");
    }, 2500);

  } catch (error) {
    console.log(error);

    if (error.response) {
      setResMessage(error.response.data.message || "Something went wrong");
    } else {
      setResMessage("Network error or server issue. Please try again later.");
    }

    setResMsgStyle({ color: "red", opacity: 1, marginTop: "15px" });

    setTimeout(() => {
      setResMsgStyle({ opacity: 0 });
    }, 3000);

  } finally {
    setLoading(false);
  }
};
//registation </>
// toggle password <>
const TogglePass = () => {
if(inVisible){
  passwordOne.current.type = "password";
  passwordTwo.current.type = "password";
  setIsVisible(false)
}else{
  passwordOne.current.type = "text";
  passwordTwo.current.type = "text";
  setIsVisible(true)
}
};
// toggle password </> //

//preview photos  start
const uploadReviewPhotos = (e) => {
  preview.current.innerHTML = "";
  let files = e.currentTarget.files[0];
  if(files){
    setEmplyeeProfile(files);
  function readAndPreview(file) {
    if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          const image = new Image();
          image.className = "productPreviwstyle";
          image.title = file.name;
          image.src = reader.result;
          preview.current.appendChild(image);
        },
        false,
      );
      reader.readAsDataURL(file);
  
    }
  }
  readAndPreview(files);
  }
}
//preview photos  end

  return (
    <div className="contactContainerMain">
    <div className="contactinnerMain">
      <div className='regLogTopNav'>
        <h2>Register your Company</h2>
          <Link to="/login">Login</Link>
      </div>
    <div className='contactInner'>
      <label htmlFor='companyName'>
            <span className='userinfotextdemo'>Company Name</span>
            <input type="text" autoComplete="off" name="companyName" value={userdata.companyName} id="companyName" placeholder="Company Name" onChange={getData} className='contactinput'/>
        </label>
    <label htmlFor='industry'>
    <select name="industry" id="industry"  onChange={getData}  className='contactinput selectContactInput'>
            <option value="">--Industry/Category--</option>
            <option value="Technology and IT">Technology and IT</option>
            <option value="Healthcare and Pharmaceuticals">Healthcare and Pharmaceuticals</option>
            <option value="Finance and Banking">Finance and Banking</option>
            <option value="Energy">Energy</option>
            <option value="Retail and E-commerce">Retail and E-commerce</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Food and Beverage">Food and Beverage</option>
            <option value="Media and Entertainment">Media and Entertainment</option>
            <option value="Transportation and Logistics">Transportation and Logistics</option>
            <option value="Real Estate and Construction">Real Estate and Construction</option>
            <option value="Tourism and Hospitality">Tourism and Hospitality</option>
            <option value="Telecommunications">Telecommunications</option>
            <option value="Education and Training">Education and Training</option>
            <option value="Environmental and Sustainability Services">Environmental and Sustainability Services</option>
            <option value="Aerospace and Defense">Aerospace and Defense</option>
            <option value="Agriculture and Agribusiness">Agriculture and Agribusiness</option>
            <option value="Fashion and Apparel"> Fashion and Apparel</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Personal Care and Wellness"> Personal Care and Wellness</option>
            <option value="Automotive and Mobility"> Automotive and Mobility</option>
            <option value="Mining and Natural Resources"> Mining and Natural Resources</option>
            <option value="Insurance">Insurance</option>
            <option value="Supply Chain and Procurement"> Supply Chain and Procurement</option>
            <option value="Public Sector and Government Services"> Public Sector and Government Services</option>
            <option value="Nonprofits and Social Enterprises">Nonprofits and Social Enterprises</option>
            <option value="Sports and Recreation">Sports and Recreation</option>
            <option value="Luxury and High-End Markets">Luxury and High-End Markets</option>
            <option value="Cybersecurity and Data Protection">Cybersecurity and Data Protection</option>
          </select>          
    </label>
    
        <label htmlFor='numberofEmployees'>
            <span className='userinfotextdemo'>Number of Employees</span>
            <input type="number" autoComplete="off" name="numberofEmployees" value={userdata.numberofEmployees} id="numberofEmployees" placeholder="Number of Employees.." onChange={getData} className='contactinput'/>
        </label>
        <label htmlFor='companyEmail'>
            <span className='userinfotextdemo'>Email</span>
            <input type="email" autoComplete="off" name="companyEmail" value={userdata.companyEmail} id="companyEmail" placeholder="Enter your Email.." onChange={getData} className='contactinput'/>
        </label>
        <div className="passwordPr">
        <label htmlFor='passOneIn' className="passwordContinerLabel">
            <span className='userinfotextdemo'>password</span>
            <input type="password" autoComplete="off" name="companyPassword" value={userdata.companyPassword} id="passOneIn" ref={passwordOne} placeholder="Enter password" onChange={getData} className='contactinput LogregsiterpassInput'/>
        </label>
        <div className="passBtnreg">
            <VisibilityOutlinedIcon className="allPassBtn" style={{display:`${!inVisible ? 'block' : 'none'}`}} onClick={TogglePass}/>
            <VisibilityOffOutlinedIcon  className="allPassBtn" style={{display:`${inVisible ? 'block' : 'none'}`}} onClick={TogglePass}/>
        </div>
        </div>
        <label htmlFor='passTwoIn'>
            <span className='userinfotextdemo'>re-password</span>
            <input type="password" autoComplete="off" name="rePassword" ref={passwordTwo} value={userdata.rePassword} placeholder="Retype password" id="passTwoIn" onChange={getData} className='contactinput'/>
        </label>
        <div className='inputDataForYemployee' style={{marginBottom:'7px'}}>
          <label htmlFor='yemplyee__Profile' style={{color:'#ccccccad',margin:'0px',fontSize:'11px'}}>Companies Profile / Logo</label>
          <input type='file' id="yemplyee__Profile" name="EmplyeeProfile" multiple={false} onChange={uploadReviewPhotos} ref={inputFile} style={{width:'418px',height:'46px',lineHeight:'36px',borderRadius:'5px'}}/>
        </div>
        <div id="imageViewrlist" style={{width:'150px',margin:'10px auto'}} ref={preview}></div>
      <button className='contactsendbtn' onClick={submitRegistation} disabled={toggleButton.current}>{loading ? "Trying..." : "Register"}</button>
        <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default Register