import React, { useEffect, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import FormData from 'form-data';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ProductPhotos({data}) {
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [loading,setLoading] = useState(false);
    const [currentlink,setCurrentLink] = useState("");
    const [publicId,setPublicId] = useState("");
    const [productAllPhotos,setProductAllPhotos] = useState([]);
    const [productImg,setProductImg] = useState(null);
    const { productId } = useParams();
    const [backgroundType,setBackgroundType] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
        if(res.status === 201 || res.data !== "All"){
            navigate("/newking");
        }
    })
    },[navigate]);

    let isChangeData = true;
    if(productImg !== null && backgroundType !== ""){
        isChangeData = false
    }else{
        isChangeData = true
    }

    const cencelPopupTwo = () => {
        const getpr = document.querySelector(".preDeletebtnContainerTwo");
        getpr.style = `display:none`;
    }


    useEffect(() => {
        if (data) {
            setProductAllPhotos(data ?? []);
        }
    }, [data]);
    


    //preview photos  start
const productshowImg = (e) => {
    const preview = document.getElementById("imageViewrlistThree");
    preview.innerHTML = "";
    let files = e.target.files[0];
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

        let formdataPhotos = new FormData();
        formdataPhotos.append("file",productImg);
        formdataPhotos.append("backgroundType",backgroundType);

    //upload product data
    const cloudinaryFolderName = "productPhotos";
        const UplodadPhotos = async() => {
            const getpr = document.querySelector(".preDeletebtnContainerTwo");
            const preview = document.getElementById("imageViewrlistThree");
            setLoading(true);
            await Altaxios.put(`addproduct/uploadPhotos/${encodeURIComponent(cloudinaryFolderName)}/${productId}`,formdataPhotos,
            {headers: {'Content-Type': 'multipart/form-data',}}).then((res) => {
               if(res.status === 200){
                setProductAllPhotos(res.data.data.ProductPhotos ?? []);
                preview.innerHTML = "";
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                setLoading(false);
                formdataPhotos = new FormData();
                setBackgroundType("");
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"});
                    setProductImg(null);
                    getpr.style = `display:none`;
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

        const DeletePopup = (e) => {
            const showPopup = document.querySelector(".preDeletebtnContainerTwo");
            showPopup.style = `display:block`;
            const newUrl = e.currentTarget.getAttribute("dataurl");
            const publiId = e.currentTarget.getAttribute("upblicid");
            setCurrentLink(publiId ?? "");
            setPublicId(newUrl ?? "")
        }
        const DeletePhotos = async() => {
            const showPopup = document.querySelector(".preDeletebtnContainerTwo");
            await Altaxios.delete(`addproduct/deletePhotos/${encodeURIComponent(productId)}/${encodeURIComponent(currentlink)}/${encodeURIComponent(publicId)}`).then((res) => {
               if(res.status === 200){
                const pdata = res.data.data;
                if(pdata){
                    setProductAllPhotos(pdata.ProductPhotos ?? []);
                }
                showPopup.style = `display:none`;
            }
            });
        }
        const getBackgroundType = (e) => {
            setBackgroundType(e.currentTarget.value)
        };
    //upload product data
      return (
        <div className="contactContainerMain_DBH">
        <div className="contactinnerMain">
            <h2>Product Photos</h2>
        <div className='allProductPhotos'>
            <div className='preDeletebtnContainerTwo'>
                <div className="preDeletePopup">
                    <h6>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={cencelPopupTwo}>No</button>
                        <button className='nextsupportbtn' onClick={DeletePhotos}>Yes</button>
                    </div>
                </div>
                </div>

            {
               productAllPhotos !== undefined && productAllPhotos.length > 0 ? productAllPhotos.map((d) => (
                    <div id="PhotoViewrlistAll" key={d._id}>
                        <DeleteIcon onClick={DeletePopup} dataurl={d.CloudinaryPublicId} upblicid={d._id}/>
                        <img src={d.photoUrl} alt="product photos"/>
                    </div>
                )) : <h3 style={{color:'#ccc'}}>Videos Not available</h3>
            }
        </div>
        <div className='contactInner' style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div className='addreviewsImageContainerOne' style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                    <label htmlFor='productPhotos' className='addreviewimg addreviewimgOne'>
                      Add Product Photos
                      <input  name="productPhotos" type='file' id="productPhotos" multiple={false} onChange={productshowImg}/>
                    </label>
                        <div id="imageViewrlistThree"></div>
            </div>
            <div className="regsitrRadioContainer" style={{justifyContent:'center',color:'#ffb100'}}>
          <h2 style={{color:'#bb8600',marginLeft:'-54px'}}>Select Background Type</h2>
          <div className='regsiterRadioInputInner' style={{marginLeft:'74px'}}>
          <div className='radioInputContainer' style={{width:'60px'}}>
            <input type="radio" checked={backgroundType === "fill"}  className='genderRadioLabelInput' name="backgroundType" value="fill" id="bgTypefill" onChange={getBackgroundType}/>
            <label htmlFor='bgTypefill' className='genderRadioLabel' ></label>
            <span>Fill</span>
          </div>
          <div className='radioInputContainer' style={{width:'60px'}}>
            <input type="radio" checked={backgroundType === "empty"}  className='genderRadioLabelInput' name="backgroundType"  value="empty" id="bgTypeEmpty" onChange={getBackgroundType}/>
            <label htmlFor='bgTypeEmpty' className='genderRadioLabel' ></label>
            <span>Transparent</span>
          </div>
        </div>
        </div>
                <button className='contactsendbtn' onClick={UplodadPhotos} disabled={isChangeData}>{loading ? "Uploading..." : "Upload"}</button>
                <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
            </div>
      </div>
      </div>
      )
    }

export default ProductPhotos