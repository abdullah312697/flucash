import React, { useEffect, useRef, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import FormData from 'form-data';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

function AddSliderData() {
const [sliderTextData,setSliderTextData] = useState({
    SliderHeading : "", SliderDescription : "", sliderPreviousPrice : "",
    sliderCurrentPrice : "", productId:"",
});
const [sliderBackgroud,setSliderBackgroud] = useState(null);
const [sliderForeground,setSliderForeground] = useState(null);
const [resMessage,setResMessage] = useState("");
const [resMsgStyle,setResMsgStyle] = useState({});
const [loading,setLoading] = useState(false);
const [sliderDelId,setSliderDelId] = useState("");
const [bgPubliurl,setBgPubliurl] = useState("");
const [fgPubliurl,setFgPubliurl] = useState("");
const [allSlides,setAllSlides] = useState([]);
const [allProjects,setAllProjects] = useState([]);
const navigate = useNavigate();


useEffect(() => {
  Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
    if(res.status === 201 || res.data !== "All"){
      navigate("/newking");
    }
})
},[navigate]);

useEffect(() => {
  Altaxios.get("slider/getSliderData/").then((res) => {
    if(res.status === 200){
      setAllSlides(res.data.data ?? []);
    };
  });

  Altaxios.get("addproduct/getSomeFieldForSlidr/").then((res) => {
    if(res.status === 200){
      setAllProjects(res.data.data ?? []);
    };
  });

},[]);


let isChangeData = useRef(true);
if(
  sliderTextData.SliderHeading !== "" && 
  sliderTextData.SliderDescription !== "" && 
  sliderTextData.sliderPreviousPrice !== "" && 
  sliderTextData.sliderCurrentPrice !== "" && 
  sliderTextData.productId !== "" && 
  sliderBackgroud !== null &&
  sliderForeground !== null
){
    isChangeData.current = false
}else{
    isChangeData.current = true
}


const getSliderTextData = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setSliderTextData({
        ...sliderTextData,
        [name] : value,
    })
}
//preview photos one start
const uploadReviewPhotosOne = (e) => {
    const preview = document.getElementById("imageViewrlistOne");
    preview.innerHTML = "";
    let files = e.currentTarget.files[0];
    if(files){
    setSliderForeground(files);
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
//preview photos one  end
//preview photos two start
const uploadReviewPhotosTwo = (e) => {
    const preview = document.getElementById("imageViewrlistTwo");
    preview.innerHTML = "";
    let files = e.currentTarget.files[0];
    if(files){
        setSliderBackgroud(files);
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
//preview photos two end

//set product data end
let formdataSlider = new FormData();
formdataSlider.append("SliderBackgroud", sliderBackgroud);
formdataSlider.append("SliderForeground", sliderForeground);
formdataSlider.append("SliderHeading", sliderTextData.SliderHeading);
formdataSlider.append("SliderDescription", sliderTextData.SliderDescription);
formdataSlider.append("sliderPreviousPrice", sliderTextData.sliderPreviousPrice);
formdataSlider.append("sliderCurrentPrice", sliderTextData.sliderCurrentPrice);
formdataSlider.append("productId", sliderTextData.productId);

//upload product data
const cloudinaryFolderName = "SliderImages";
    const UplodadSliderData = async() => {
      const cngBg = document.querySelector(".dbh_currentli");
      const linkPopup = document.getElementById("popupProduct");
        setLoading(true);
        const previewOne = document.getElementById("imageViewrlistOne");
        const previewTwo = document.getElementById("imageViewrlistTwo");    
        await Altaxios.post(`slider/sliderData/${encodeURIComponent(cloudinaryFolderName)}`,formdataSlider,
        {headers: {'Content-Type': 'multipart/form-data',}}).then((res) => {
           if(res.status === 200){
            setAllSlides([...allSlides,res.data.data] ?? []);
            setResMessage(res.data.message);
            setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
            setLoading(false);
            linkPopup.style.height = '0px';
            formdataSlider = new FormData();
            if(cngBg !== undefined && cngBg !== null){
              cngBg.classList.remove("dbh_currentli");
            }          
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"});
                setSliderTextData({ SliderHeading : "", SliderDescription : "", sliderPreviousPrice : "",sliderCurrentPrice : "", productId: "",});
                setSliderBackgroud(null);
                setSliderForeground(null);
                previewOne.innerHTML = "";
                previewTwo.innerHTML = "";        
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
    const CancelPopupSeven = () => {
      const getpr = document.querySelector(".preDeletebtnContainerSeven");
      getpr.style = `display:none`;
  }

    const DeletePopup = (e) => {
      const showPopup = document.querySelector(".preDeletebtnContainerSeven");
      showPopup.style = `display:block`;
      const sliderId = e.currentTarget.getAttribute("sliderid");
      const bgPublicUrl = e.currentTarget.getAttribute("bgpublicurl");
      const fgPublicUrl = e.currentTarget.getAttribute("fgpublicurl");
          setSliderDelId(sliderId);
          setBgPubliurl(bgPublicUrl);
          setFgPubliurl(fgPublicUrl);
      };
  const DeleteSlider = async() => {
      const showPopup = document.querySelector(".preDeletebtnContainerSeven");
      await Altaxios.delete(`slider/sliderDataDelete/${encodeURIComponent(sliderDelId)}/${encodeURIComponent(bgPubliurl)}/${encodeURIComponent(fgPubliurl)}`).then((res) => {
         if(res.status === 200){
          const pdata = res.data.data;
          if(pdata){
            let resetState = allSlides.filter((doc) => (doc._id !== pdata._id))
            setAllSlides(resetState);
          }
          showPopup.style = `display:none`;
      }
      });
  }
let popuToggleProduct = false;
const PopupProducts = () => {
  const popup = document.getElementById("popupProduct");
  if(!popuToggleProduct){
    popup.style = `height:100px;border-top:1px solid #ccc3`
    popuToggleProduct = true;
  }else{
    popup.style = `height:0px;border-top:none`
    popuToggleProduct = false;
  }
}
const getProductId = (e) => {
  const cngBg = document.querySelector(".dbh_currentli");
  e.stopPropagation();
  const actionli = e.currentTarget;
  setSliderTextData(
    {
      ...sliderTextData,
      productId : actionli.id
    }
  );
  if(cngBg !== undefined && cngBg !== null){
    cngBg.classList.remove("dbh_currentli");
  }
  actionli.classList.add("dbh_currentli");
}
//upload product data
  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain">
        <h2>Upload Slider Data</h2>
    <div className='contactInner'style={{alignItems:'center'}}>
    <div className='allProductPhotos'>
            <div className='preDeletebtnContainerSeven'>
                <div className="preDeletePopup">
                    <h6>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={CancelPopupSeven}>No</button>
                        <button className='nextsupportbtn' onClick={DeleteSlider}>Yes</button>
                    </div>
                </div>
                </div>

            {
               allSlides !== undefined && allSlides.length > 0 ? allSlides.map((d) => (
                <div className='dshbord_sliderShow' key={d._id} style={{backgroundImage:`url(${d.SliderBackgroud.image})`}}>
                    <DeleteIcon onClick={DeletePopup} bgpublicurl={d.SliderBackgroud.publicId} fgpublicurl={d.SliderForeground.publicId} sliderid={d._id}/>
                    <img src={d.SliderForeground.image} alt="sliderimg" className='dbh_sliderImg'/>
                    <span className='dbh_sliderHeading'>{d.SliderHeading}</span>
                    <span className='dbh_sliderDescription'>{d.SliderDescription}</span>
                    <div className='dbh_sliderPrice'>
                      <h2><del>{d.sliderPreviousPrice}</del>{d.sliderCurrentPrice}KD</h2>
                      <button>Buy now</button>
                    </div>
                </div>
                )) : <h3 style={{color:'#ccc'}}>Slider Data Not available</h3>
            }
        </div>
        <h2 style={{marginBottom:'20px',marginLeft:'-265px',fontSize:'22px',color:'#bb8600'}}>Add New Slider</h2>

        <label htmlFor='sliderHeading'>
            <span className='userinfotextdemo'>Slider Heading</span>
            <input type="text" name="SliderHeading" placeholder="Enter Slider Heading..."  id="sliderHeading" value={sliderTextData.SliderHeading} onChange={getSliderTextData} className='contactinput'/>
        </label>
        <label htmlFor='SliderDescription'>
            <span className='userinfotextdemo'>Slider Short Description</span>
            <textarea rows={5} className='textareaStyle' name="SliderDescription" cols={50} value={sliderTextData.SliderDescription}  resizeable="true" placeholder='short description...' id="SliderDescription" onChange={getSliderTextData}></textarea>
        </label>
        <label htmlFor='sliderPreviousPrice'>
            <span className='userinfotextdemo'>Product Previous Price</span>
            <input type="number" value={sliderTextData.sliderPreviousPrice} name="sliderPreviousPrice" placeholder="Product Previous Price..."  id="sliderPreviousPrice" onChange={getSliderTextData} className='contactinput'/>
        </label>
        <label htmlFor='sliderCurrentPrice'>
            <span className='userinfotextdemo'>Product Current Price</span>
            <input type="number" value={sliderTextData.sliderCurrentPrice} name="sliderCurrentPrice" placeholder="Product Current Price..."  id="sliderCurrentPrice" onChange={getSliderTextData} className='contactinput'/>
        </label>
        <div className='addreviewsImageContainerOne'>
                <label htmlFor='SliderImageOne' className='addreviewimg addreviewimgOne'>
                  Add Slider Image
                  <input  name="SliderImageOne" type='file' id="SliderImageOne" multiple={false} onChange={uploadReviewPhotosOne}/>
                </label>
               <div id="imageViewrlistOne">
               </div>
        </div>
        <div className='addreviewsImageContainerOne'>
                <label htmlFor='SliderImageTwo' className='addreviewimg addreviewimgOne'>
                  Add Slider Background
                  <input  name="SliderImageTwo" type='file' id="SliderImageTwo" multiple={false} onChange={uploadReviewPhotosTwo}/>
                </label>
               <div id="imageViewrlistTwo">
               </div>
        </div>
        <div className='sliderProductSelection'>
          <button onClick={PopupProducts}>Which Product of Slider?</button>
          <ul id="popupProduct">
            {
              allProjects !== undefined && allProjects.length > 0 ?
                allProjects.map(d => (
                  <li key={d._id} onClick={getProductId} id={d._id} >
                        <span>{d.ProductName}</span>
                        <img src={d.ProductImg} alt="bags"/>
                  </li>
                ))
                :
                <li>
                  <h2>You don't have any Product!</h2>
                </li>
            }
          </ul>
        </div>
            <button className='contactsendbtn' onClick={UplodadSliderData} disabled={isChangeData.current}>
              {loading ? "Uploading..." : "Upload"}</button>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default AddSliderData