import React, { useEffect, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import FormData from 'form-data';
import { useNavigate } from 'react-router-dom';

function LogoandName() {
const [brandName,setBrandName] = useState("");
const [productImg,setProductImg] = useState(null);
const [resMessage,setResMessage] = useState("");
const [resMsgStyle,setResMsgStyle] = useState({});
const [loading,setLoading] = useState(false);
const [branding,setBranding] = useState([]);

const navigate = useNavigate();

useEffect(() => {
    Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
      if(res.status === 201 || res.data !== "All"){
        navigate("/newking");
      }
  })
  },[navigate]);

let isChangeData = true;
if(brandName !== "" || productImg !== null){
    isChangeData = false
}else{
    isChangeData = true
}

useEffect(() => {
  Altaxios.get("addproduct/getLogoandName").then((res) => {
    if(res.status === 200){
      setBranding(res.data.data);
    }
  });
},[]);
//preview photos  start
const uploadReviewPhotos = (e) => {
    const preview = document.getElementById("imageViewrlist");
    preview.innerHTML = "";
    let files = e.currentTarget.files[0];
    if(files){
    setProductImg(files);
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
            preview.appendChild(image);
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

//set product data start
//set product data end
let formdataLogoAndName = new FormData();
formdataLogoAndName.append("file", productImg);
formdataLogoAndName.append("brandName", brandName);

//upload product data
const cloudinaryFolderName = "brandLogo";
    const LogoandNamesFile = async() => {
      setLoading(true);
      const preview = document.getElementById("imageViewrlist");  
        await Altaxios.put(`addproduct/logoandName/${encodeURIComponent(cloudinaryFolderName)}/${encodeURIComponent(branding[0]._id)}/${encodeURIComponent(branding[0].CloudinaryPublicId)}`,formdataLogoAndName,
        {headers: {'Content-Type': 'multipart/form-data',}}).then((res) => {
           if(res.status === 200){
            setBranding([res.data.data]);
            setResMessage(res.data.message);
            setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
            setLoading(false); 
            formdataLogoAndName = new FormData();

            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"});
                setBrandName("");
                preview.innerHTML = "";
                setLoading(false); 
            },3000);
           }else{
            setResMessage(res.data.message);
            setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"})
            },3000)
           }
        });
    };

//upload product data
  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain">
      <h2 style={{color:'#ccc',fontSize:'22px',marginBottom:'10px'}}>Current Logo And Name</h2>
      {branding !== undefined && branding.length > 0 ? 
      branding.map((d) => (
        <div className='brandNameandlogoInner' key={d._id}>
          <h1>{ d.brandName }</h1>
          <img src={ d.barndLogo } alt="logo" />
        </div>
      ))
      :
      <h2 style={{color:'#ccc',fontSize:'22px',marginBottom:'10px'}}>Logo and name not found</h2>
    }
        <h2 style={{color:'#ccc',fontSize:'22px',marginBottom:'10px'}}>Change Logo and Name</h2>
    <div className='contactInner'>

        <label htmlFor='logoName'>
            <span className='userinfotextdemo'>Logo name</span>
            <input type="text" name="logoName" value={brandName} placeholder="Type your brand name..."  id="logoName" onChange={(e) => (setBrandName(e.target.value))} className='contactinput'/>
        </label>

        <div className='addreviewsImageContainerOne'>
                <label htmlFor='ProductImg' className='addreviewimg addreviewimgOne'>
                  Add Product logo
                  <input  name="ProductImg" type='file' id="ProductImg" multiple={false} onChange={uploadReviewPhotos}/>
                </label>
               <div id="imageViewrlist">

               </div>
        </div>
            <button className='contactsendbtn'  onClick={LogoandNamesFile} disabled={isChangeData}>{loading === true ? "Uploading..." : "Upload"}</button>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default LogoandName