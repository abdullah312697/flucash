import { Link, useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import profie from '../../../images/profile/male.png';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CallIcon from '@mui/icons-material/Call';
import { useEffect, useRef } from 'react';
import {Altaxios} from '../../Altaxios';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import LiveChats from './LiveChats';
import { useAuth } from '../../../context/AuthContext';

function Employee() {
    const { employeeId } = useParams();
    const [employeeData,setEmployeeData] = useState({});
    const [isEditon, setIsEditon] = useState(false);
    const [isFullData,setIsFullData] = useState(true);
    const [emplyeeProfile,setEmplyeeProfile] = useState(null);
    const [previewNewImage,setPreviewNewImage] = useState("");
    const [porfileBtnEnable,setProfileBtnEnable] = useState(true);
    const [isPorfielEnable,setIsProfileEnable] = useState(false);
    const [isOpend,setIsOpend] = useState(false);
    const [isUserScroll,setIsUserScroll] = useState(true);
    const {updateEmployee, updateProfile} = useAuth();
      const [emplyeeAddDataNew,setEmployeeDataNew] = useState({
        YemplyeeName:"",
        YemplyeePhone:"",
        YemplyeeEmail:"",
        YemplyeeLeaving:"",
        EmplyeeSellary:"",
        EmplyeeJoinDate:"",
        EmplyeeRoal:"",
        employeePosition:"",
        FirstSelarry:"",
        lsatPaid:"",
        TotalSeavings:"",
        employeeAccessPassword:"",
        EmployeeProfileStatus: ""
  });
  const [resMessage,setResMessage] = useState("");
  const [resMsgStyle,setResMsgStyle] = useState({});
    const [resMessageinDelete,setResMessageinDelete] = useState("");
  const [resMsgStyleinDelete,setResMsgStyleinDelete] = useState({});
    const [resMessageinPass,setResMessageinPass] = useState("");
  const [resMsgStyleinPass,setResMsgStyleinPass] = useState({});
  const [isOpenPassword,setIsOpenPassword] = useState(false);
    const isPopUpPassword = useRef(null);
    const goback = useNavigate();
  const mainStaus = (status) => {    
    if(status === "Suspended"){
      return 0
    }else if(status === "Warned"){
      return 1
    }else if(status === "Blocked"){
      return 2
    }else if(status === "Cancel"){
      return 3
    }
  };
  const EmployeeStatus = ["Active", "Suspended", "Warned", "Blocked", "Cancel"];
  const ActiveStauts = EmployeeStatus[0];
  const activeIndex = useRef(0);
  useEffect(() => {
const indexVal = mainStaus(employeeData?.EmployeeProfileStatus ?? ActiveStauts);
    activeIndex.current = indexVal ?? 0;
    const totalHeight = Mainheight * activeIndex.current;
    listRef.current.scrollTop = totalHeight;
},[employeeData, EmployeeStatus.length,ActiveStauts]);

  const [selectedStatus, setSelectedStatus] = useState(EmployeeStatus[activeIndex.current]);
  const listRef = useRef(null);
  const Mainheight = 30;
  const repeatCount = 5;
  const loopedStatuses = Array(repeatCount).fill(EmployeeStatus).flat();
  
  useEffect(() => {
  if (!employeeId) return;
  const ac = new AbortController();
  (async () => {
    try {
      const res = await Altaxios.get(
        `/newemplyee/getSingleEmployee/${encodeURIComponent(employeeId)}`,
        { signal: ac.signal, timeout: 15000 }
      );
      const EmplyeeData = res.data?.employee;
      setEmployeeData(EmplyeeData);
      setEmployeeDataNew({
        YemplyeeName: EmplyeeData.YemplyeeName,
        YemplyeePhone: EmplyeeData.YemplyeePhone,
        YemplyeeEmail: EmplyeeData.YemplyeeEmail,
        YemplyeeLeaving: EmplyeeData.YemplyeeLeaving,
        EmplyeeSellary: EmplyeeData.EmplyeeSellary,
        EmplyeeJoinDate: EmplyeeData.EmplyeeJoinDate,
        EmplyeeRoal: EmplyeeData.EmplyeeRoal,
        employeePosition: EmplyeeData.employeePosition,
        FirstSelarry: EmplyeeData.FirstSelarry,
        lsatPaid: EmplyeeData.lsatPaid,
        TotalSeavings: EmplyeeData.TotalSeavings,
        employeeAccessPassword: EmplyeeData.employeeAccessPassword,
        EmployeeProfileStatus: EmplyeeData.EmployeeProfileStatus
      })

    } catch (err) {
      // Ignore abort/cancel errors
      if (ac.signal.aborted) return;
      if (Altaxios.isAxiosError?.(err)) {
        const msg =
          err.response?.data?.message ||
          err.response?.statusText ||
          err.message ||
          "Request failed";
        console.error(msg);
      } else {
        console.error("Something went wrong!", err);
      }
    }
  })();

  return () => ac.abort();
}, [employeeId]);

  useEffect(() => {
    const isCheckPopup = (event) => {
      if(isPopUpPassword.current && !isPopUpPassword.current.contains(event.target)){
        setIsOpenPassword(false);
      }
    };
    if(isOpenPassword){
      document.addEventListener("mousedown", isCheckPopup);
    }
    return () => {
      document.removeEventListener("mousedown", isCheckPopup);
    };
  },[isOpenPassword]);

  useEffect(() => {
  const EmptyResult = Object.values(emplyeeAddDataNew).some(v => v == null || (typeof v === "string" && v.trim() === ""));
  setIsFullData(EmptyResult);
}, [emplyeeAddDataNew]);

    const handleScroll = () => {
      const indexVal = mainStaus(employeeData?.EmployeeProfileStatus ?? ActiveStauts);
      const scrollHeight = listRef.current.scrollTop;
      const index = Math.round(scrollHeight / Mainheight) % EmployeeStatus.length;
    const totalHeight = Mainheight * EmployeeStatus.length;
        activeIndex.current = index;
        setSelectedStatus(EmployeeStatus[index]);  
    if(indexVal !== activeIndex.current){
      setIsUserScroll(false)
    }else{
      setIsUserScroll(true)
    }

if (scrollHeight < totalHeight) {
      listRef.current.scrollTop = scrollHeight + totalHeight * 2;
    } else if (scrollHeight > totalHeight * 3) {
      listRef.current.scrollTop = scrollHeight - totalHeight * 2;
    }
  };

    //preview photos  start
const uploadReviewPhotos = (e) => {
  let files = e.currentTarget.files[0];
  if(files){
    setEmplyeeProfile(files);
  function readAndPreview(file) {
    if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
            setPreviewNewImage(reader.result);
            setProfileBtnEnable(false);
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

    const setEmplyeeData = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setEmployeeDataNew({
      ...emplyeeAddDataNew,
      [name] : value
    });
  };



  const AddnewEmplyee = async() => {
    try{
    setIsFullData(true);
    const adEmplyees = await updateEmployee(employeeId, emplyeeAddDataNew);

      if(adEmplyees.status === 200){
        setResMessageinDelete(adEmplyees.data.message);
        const newEmployee = adEmplyees.data.data;
        setResMsgStyleinDelete({color:"green",opacity:1,marginTop:"15px"});
        setEmployeeDataNew({
            YemplyeeName: newEmployee.YemplyeeName,
            YemplyeePhone: newEmployee.YemplyeePhone,
            YemplyeeEmail: newEmployee.YemplyeeEmail,
            YemplyeeLeaving: newEmployee.YemplyeeLeaving,
            EmplyeeSellary: newEmployee.EmplyeeSellary,
            EmplyeeJoinDate: newEmployee.EmplyeeJoinDate,
            EmplyeeRoal: newEmployee.EmplyeeRoal,
            employeePosition: newEmployee.employeePosition,
            FirstSelarry: newEmployee.FirstSelarry,
            lsatPaid: newEmployee.lsatPaid,
            TotalSeavings: newEmployee.TotalSeavings,
            employeeAccessPassword: newEmployee.employeeAccessPassword,
            EmployeeProfileStatus: newEmployee.EmployeeProfileStatus
        });
      setTimeout(() => {
          setResMsgStyleinDelete({opacity:0,marginTop:"0px"});
      },3000);
     }
    }catch(error){
      if(error.response){
      setResMessageinDelete(error.response.data.message);
      setResMsgStyleinDelete({color:"red",opacity:1,marginTop:"15px",})
      setTimeout(() => {
          setResMsgStyleinDelete({opacity:0,marginTop:"0px"})
      },3000);
      setIsFullData(false);
      }else{
        setResMessageinDelete("Something went wrong!");
        console.log(error);
      setTimeout(() => {
          setResMsgStyleinDelete({opacity:0,marginTop:"0px"})
      },3000);
      setIsFullData(false);
      }
    }
  };

  const ChangeProfilePic = async() => {
    setProfileBtnEnable(true);
    try{
    const EmploeeData = new FormData();
    EmploeeData.append("file",emplyeeProfile);
    EmploeeData.append("CloudeId",employeeData?.CloudinaryPublicId);
    const ChangeProfile = await updateProfile(employeeId, EmploeeData);
      if(ChangeProfile.status === 200){
        setResMessage(ChangeProfile.data.message);
        const newEmployee = ChangeProfile.data.data;
        setEmployeeDataNew({
          ...emplyeeAddDataNew,
          EmplyeeProfile: newEmployee.EmplyeeProfile,
          CloudinaryPublicId: newEmployee.CloudinaryPublicId,
        });
        setEmployeeData({
          ...employeeData,
          EmplyeeProfile: newEmployee.EmplyeeProfile,
          CloudinaryPublicId: newEmployee.CloudinaryPublicId,
        });
        setEmplyeeProfile(null);
        setPreviewNewImage("");
     }
    }catch(error){
      console.log(error);
    }
  };
  
  const updateEmployeePassword = async() => {
    try{
      const updatPass = await Altaxios.put(`/newemplyee/updateEmployeePassword/${encodeURIComponent(employeeId)}`,{employeeAccessPassword:emplyeeAddDataNew?.employeeAccessPassword});
      if(updatPass.status === 200){
        setEmployeeDataNew({...emplyeeAddDataNew,employeeAccessPassword:updatPass.data.data});
          setResMessageinPass(updatPass.data.message);
          setResMsgStyleinPass({color:"green",opacity:1,fontSize:'10px',marginBottom:'5px'})
          setTimeout(() => {
            setResMsgStyleinPass({opacity:0})
          },3000);
      }
    }catch(error){
      if(error.response){
      setResMessageinPass(error.response.data.message);
      setResMsgStyleinPass({color:"red",opacity:1,marginBottom:"5px",fontSize:'10px'})
      setTimeout(() => {
          setResMsgStyleinPass({opacity:0})
      },3000);
      }else{
        setResMessageinPass("Something went wrong!");
        setResMsgStyleinPass({color:"red",opacity:1,marginBottom:"5px",fontSize:'10px'})
        console.log(error);
      setTimeout(() => {
          setResMsgStyleinPass({opacity:0,marginTop:"0px"})
      },3000);
      }
      
    }
  };

  const DeleteEmployyProfile = async() => {
    try{
      const updatPass = await Altaxios.delete(`/newemplyee/deleteEmployee/${encodeURIComponent(employeeId)}`,{
        withCredentials: true,
      });
      if(updatPass.status === 200){
            if(updatPass.status === 200){
            goback("/");
            setIsOpend(false);
          }
      }
    }catch(error){
      console.log(error);
    }
  };
    const PredeltePopup = () => {
      setIsOpend(true)
    };

    const cencelPopup = () => {
        setIsOpend(false)
    }


  const updateEmployeeStatus = async() => {
    try{
      const updatPass = await Altaxios.put(`/newemplyee/updateEmployeeStatus/${encodeURIComponent(employeeId)}`,{EmployeeProfileStatus:selectedStatus});
      if(updatPass.status === 200){
        setEmployeeDataNew({...emplyeeAddDataNew,EmployeeProfileStatus:updatPass.data.data});
          setResMessage(updatPass.data.message);
          setResMsgStyle({color:"#00fff2",opacity:1,maringTop:'5px',textAlign:'left'})
          setTimeout(() => {
            setResMsgStyle({opacity:0,textAlign:'left'})
          },3000);
      }
    }catch(error){
      if(error.response){
      setResMessage(error.response.data.message);
      setResMsgStyle({color:"red",opacity:1,marginTop:'5px',textAlign:'left'})
      setTimeout(() => {
          setResMsgStyle({opacity:0,textAlign:'left'})
      },3000);
      }else{
        setResMessage("Something went wrong!");
        setResMsgStyle({color:"red",opacity:1,marginTop:'5px',textAlign:'left'})
        console.log(error);
      setTimeout(() => {
          setResMsgStyle({opacity:0,textAlign:'left'})
      },3000);
      }
      
    }
  };
let cName = localStorage.getItem("CompanyName");
  return (
    <div className='ProductPageMain'>
        <Link to={`/company/${cName}`} className='arrowback_a'><ArrowBackIcon className='arrowbackIcon'/></Link>
    {/* delete pre popup <>*/}
      <div className='preDeletebtnContainer' style={{display:`${!isOpend ? 'none' : 'block'}`,left:'455px'}}>
    <div className="preDeletePopup">
        <h6>Are you sure to Delete!?</h6>
        <div className='deleteornotbutton'>
            <button className='nextnotsupportbtn' onClick={cencelPopup}>No</button>
            <button className='nextsupportbtn' onClick={DeleteEmployyProfile}>Yes</button>
        </div>
    </div>
    </div>
  {/* delete pre popup </>*/}

        <div className='EmployeeMainPage'>
            <div className='EmployeeMainInner'>
            <div className='EmployeeProfielSection'>
                <div className='EmployeeProfieName'>
                  <div className='EmployeeImageContianer'>
                    <AddAPhotoIcon onClick={() => setIsProfileEnable(!isPorfielEnable)}/>
                    <img src={employeeData?.EmplyeeProfile ?? profie} alt="employee profiel"/>
                    <h2>{employeeData?.YemplyeeName ?? "Employee name"}</h2>
                  </div>
                    <div className='EmployeeProfileChange' style={{display:`${!isPorfielEnable ? 'none' : 'block' }`}}>
                      <CloseIcon onClick={() => {setIsProfileEnable(!isPorfielEnable); setPreviewNewImage(""); setProfileBtnEnable(true);}}/>
                      <div className='ImageChangeContainer'>
                        <div className='EmployeePorfileChaneCard'>
                          <img src={employeeData?.EmplyeeProfile} alt="user profile"/>
                        </div>
                        <div className='EmployeePorfileChaneCard' style={{display:`${previewNewImage !== "" ? 'block' : 'none'}`}}>
                          <img src={previewNewImage} alt="review profile"/>
                        </div>
                        <div className='EmployeePorfileChaneCard'>
                          <label className='inputbuttonforEmployee'>
                            <input type='file' onChange={uploadReviewPhotos}/>
                            <AddPhotoAlternateIcon/>
                          </label>
                        </div>
                      </div>
                      <div className='ImageChangeAction'>
                        <button onClick={ChangeProfilePic} disabled={porfileBtnEnable}>Change photo</button>
                      </div>
                    </div>
                </div>
                <div className='ConnectonType'>
                    <div className='connectionButton'><EmailOutlinedIcon style={{color:'#ffb100'}}/></div>
                    <div className='connectionButton'><LiveChats/></div>
                    {/* <ChatIcon style={{color:'#00fff2de'}}/> */}
                    <div className='connectionButton'><CallIcon style={{color:'#48ff00'}}/></div>
                </div>
            </div>
            <div className='EmployeeInformation'>
                <div className='EmployeePorfileEdit' onClick={() => !isEditon ? (setIsEditon(true), setIsFullData(true)) : setIsEditon(false)}>Edit profie <EditIcon style={{fontSize:'17px'}}/></div>
                <div className='EmployeeInformationInner'>
                    <div className='EmployeeData'>
                        <span><b>Name: </b></span><span>{employeeData?.YemplyeeName ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>Email: </b></span><span>{employeeData?.YemplyeeEmail ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>Phone: </b></span><span>{employeeData?.YemplyeePhone ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>Position: </b></span><span>{employeeData?.employeePosition ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>Address: </b></span><span>{employeeData?.YemplyeeLeaving ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>Join date: </b></span><span>{employeeData?.EmplyeeJoinDate ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>Employee Roal: </b></span><span>{employeeData?.EmplyeeRoal ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>First Sellary: </b></span><span>{employeeData?.FirstSelarry ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>Current Sellary: </b></span><span>{employeeData?.EmplyeeSellary ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>Last Sellary Paid: </b></span><span>{employeeData?.lsatPaid ?? ""}</span>
                    </div>
                    <div className='EmployeeData'>
                        <span><b>savings: </b></span><span>{employeeData?.TotalSeavings ?? ""}</span>
                    </div>
                </div>
                <div className='EmployeeInformatinConainer' style={{display:`${!isEditon ? "none" : "block"} `}}>
                <div className='EmployeeInfomationEdit'>
                    <div className='EmployeeDataEdit'>
                        <span><b>Name: </b></span><input type="text" name="YemplyeeName" value={emplyeeAddDataNew?.YemplyeeName ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>Email: </b></span><input type="text" name="YemplyeeEmail" value={emplyeeAddDataNew?.YemplyeeEmail ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>Phone: </b></span><input type="text" name="YemplyeePhone" value={emplyeeAddDataNew?.YemplyeePhone ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>Position: </b></span><input type="text" name="employeePosition" value={emplyeeAddDataNew?.employeePosition ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>Address: </b></span><input type="text" name="YemplyeeLeaving" value={emplyeeAddDataNew?.YemplyeeLeaving ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>Join date: </b></span><input type="date" name="EmplyeeJoinDate" value={emplyeeAddDataNew?.EmplyeeJoinDate ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>Employee Roal: </b></span><input type="text" name="EmplyeeRoal" value={emplyeeAddDataNew?.EmplyeeRoal ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>First Sellary: </b></span><input type="text" name="FirstSelarry" value={emplyeeAddDataNew?.FirstSelarry ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>Current Sellary: </b></span><input type="text" name="EmplyeeSellary" value={emplyeeAddDataNew?.EmplyeeSellary ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>Last Sellary Paid: </b></span><input type="text" name="lsatPaid" value={emplyeeAddDataNew?.lsatPaid ?? ""} onChange={setEmplyeeData}/>
                    </div>
                    <div className='EmployeeDataEdit'>
                        <span><b>savings: </b></span><input type="text" name="TotalSeavings" value={emplyeeAddDataNew?.TotalSeavings ?? ""} onChange={setEmplyeeData}/>
                    </div>
                </div>
                    <div className='showErrorOrSuccess' style={resMsgStyleinDelete}>{resMessageinDelete}</div>
                    <div className='EmployeeDataUpdateButton'>
                        <button style={{color:'#bb8600'}} disabled={isFullData} onClick={AddnewEmplyee}>Update</button>
                        <button style={{color:'rgb(0 255 245)'}} onClick={() => {setIsEditon(false)}}>Cancel</button>
                    </div>
            </div>
            </div>
            <div className='EmployeeActions'>
                <h2>Take Action</h2>
                <div className='setPasswordContainer' style={{display:`${!isOpenPassword ? 'none' : 'block'}`}} ref={isPopUpPassword}>
                  <h2>Set/update password</h2>
                  <div className='setpasswordInner'>
                    <label htmlFor='employeeAccessPassword'>set/update password</label>
                    <input type="text" value={emplyeeAddDataNew?.employeeAccessPassword ?? ""} onChange={(e) => {setEmployeeDataNew({...emplyeeAddDataNew,[e.target.name]:e.target.value})}} placeholder='password...' name="employeeAccessPassword" id="employeeAccessPassword"/>
                    <div className='showErrorOrSuccess' style={resMsgStyleinPass}>{resMessageinPass}</div>

                    <button onClick={updateEmployeePassword}>Submit</button>
                  </div>
                </div>
                <div className='ActionButtonMain'>
                    <button style={{color:"#00ff66",borderColor:"#00ff66"}} onClick={() => setIsOpenPassword((prev) => !prev)}>Set Password</button>
                    <div className='userStatusScrollingMain'>
                      <div className='previewStatusContainer'>
                        <div className='previewStatusInner'>
                            <div className='satausMainContainer'  ref={listRef} onScroll={handleScroll}>
                              {loopedStatuses.map((status,index) => (
                                <div className={`StausInnerText ${
              (index % EmployeeStatus.length) === activeIndex.current ? "activeStatus" : ""
            }`} key={index} data-value={status}>{status}</div>
                              ))}
                            </div>
                            <div className='StatusCenterLabel'></div>
                        </div>
                        <button onClick={updateEmployeeStatus} disabled={isUserScroll}>Update</button>
                      </div>
                        <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
                      </div>
                    <button style={{color:"#ff0000",borderColor:"#ff0000"}} onClick={PredeltePopup}>Delete Profiel</button>
                </div>
            </div>
        </div>
        </div>
    </div>
  )
}

export default Employee