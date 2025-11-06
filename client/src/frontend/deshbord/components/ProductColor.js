import React, { useEffect, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import FormData from 'form-data';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import ToggleOffRoundedIcon from '@mui/icons-material/ToggleOffRounded';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import { useNavigate } from 'react-router-dom';

function ProductColor({data,isPublic}) {
const [productColor,setProductColor] = useState([]);
const [isPublicProduct,setIsPublicProduct] = useState(null);
const [productColorImg,setProductColorImg] = useState(null);
const [colorName,setColorName] = useState("");
const [resMessage,setResMessage] = useState("");
const [resMsgStyle,setResMsgStyle] = useState({});
const [colorImg,setColorImg] = useState(null);
const [loading,setLoading] = useState(false);
const [currentlink,setCurrentLink] = useState("");
const [publicId,setPublicId] = useState("");
const { productId } = useParams();
const navigate = useNavigate();

useEffect(() => {
    Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
      if(res.status === 201 || res.data !== "All"){
        navigate("/newking");
      }
  })
  },[navigate]);

useEffect(() => {
    if (data) {
        setProductColor(data ?? []);
    }
    if(isPublic !== undefined){
        setIsPublicProduct(isPublic)
    }
}, [data,isPublic]);

let isChangeColor = true;

if(colorName !== "" && productColorImg !== null){
    isChangeColor = false;
}else{
    isChangeColor = true; 
}

//preview photos  start
const uploadReviewColorPhotos = (e) => {
    let files = e.currentTarget.files[0];
    if(files){
    setProductColorImg(files);
    function readAndPreview(file) {
      if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            setColorImg(reader.result)
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




let formColorData = new FormData();

if(productColorImg !== null){
    formColorData.append("file", productColorImg);
}
if(colorName !== ""){
    formColorData.append("colorName", colorName);
}
//upload product data
const cloudinaryFolderName = "productColorImg";
    const AddProductColor = async() => {
        setLoading(true);
        await Altaxios.put(`addproduct/productColorUpload/${cloudinaryFolderName}/${productId}`,formColorData,
        {
            headers: {"Content-Type": "multipart/form-data"}
        }).then((res) => {
           if(res.status === 200){
            setProductColor(res.data.data.ProductColors ?? []);
            setResMessage(res.data.message);
            setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
            setLoading(false);
            formColorData = new FormData();
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"});
                setProductColorImg(null);
                setColorImg(null);
                setColorName("");
            },3000)
           }else{
            setResMessage(res.data.message);
            setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"})
            },3000)
           }
        });
    };
    const cencelPopupSix = () => {
        const getpr = document.querySelector(".preDeletebtnContainerSix");
        getpr.style = `display:none`;
    }

    const DeletePopupSix = (e) => {
        const showPopup = document.querySelector(".preDeletebtnContainerSix");
        showPopup.style = `display:block`;
        const newUrl = e.currentTarget.getAttribute("dataurl");
        const publiId = e.currentTarget.getAttribute("pblicid");
        setCurrentLink(publiId ?? "");
        setPublicId(newUrl ?? "")
    }
    const DeleteColorPhotos = async() => {
        const showPopup = document.querySelector(".preDeletebtnContainerSix");
        await Altaxios.delete(`addproduct/deleteProductColor/${encodeURIComponent(productId)}/${encodeURIComponent(currentlink)}/${encodeURIComponent(publicId)}`).then((res) => {
           if(res.status === 200){
            const pdata = res.data.data;
            showPopup.style = `display:none`;
                setProductColor(pdata.ProductColors ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"});
                },3000)
               }else{
                setResMessage(res.data.message);
                setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"})
                },3000)
               }
        });
    }
//upload product data
const inPublicToggle = (condition) => {
    Altaxios.put(`addproduct/toggeInPublic/${productId}`,{toggleName:condition}).then((res) => {
        if(res.status === 200){
            setIsPublicProduct(res.data.data.IsPublic ?? null)
        }
    });
};

  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain">
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <h2 style={{color:'#bb8600'}}>Add Product Color</h2>
        <div style={{width:'100px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <b style={{color:'#ffb100',marginTop:'-5px'}}>{!isPublicProduct || isPublicProduct !== true ? "Private:" : "Public:" }</b>
        <div className='Dsh__toggleContianer'>
                {
                    !isPublicProduct || isPublicProduct !== true ?
                    <ToggleOffRoundedIcon className='Dsh_tooggleOffbtn' onClick={() => {inPublicToggle(true)}}/>
                    :
                    <ToggleOnRoundedIcon className='Dsh_tooggleOnbtn' onClick={() => {inPublicToggle(false)}}/>
                }
        </div>
        </div>
</div>
    <div className='contactInner' style={{alignItems:'center'}}>
    <div className='preDeletebtnContainerSix'>
        <div className="preDeletePopup">
            <h6>Are you sure to Delete!?</h6>
            <div className='deleteornotbutton'>
            <button className='nextnotsupportbtn' onClick={cencelPopupSix}>No</button>
            <button className='nextsupportbtn' onClick={DeleteColorPhotos}>Yes</button>
            </div>
         </div>
    </div>
    <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading'>
                    <span style={{width:'200px'}}>Color Name</span>
                    <span style={{width:'250px'}}>Color Image</span>
                    <span style={{width:'60px'}}>Delete</span>
                </div>
                {
                 productColor !== undefined && productColor.length > 0  ? productColor.map((d) => (
                    <div className='dbh_productFeuterValue' key={d._id}>
                        <div className='dbh_feauerview'>
                            <span style={{width:'200px'}}>{d.colorName}</span>
                            <span style={{width:'250px'}}><img src={d.colorImage} alt="colorImage" style={{width:'40px'}}/></span>
                            <span style={{width:'60px'}}><DeleteIcon style={{color:"#d70000"}} onClick={DeletePopupSix} dataurl={d._id} pblicid={d.CloudinaryPublicId}/></span>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>Data no avilable...</h4>
                    }         
         </div>
        </div>
        <h2 style={{margin:'0px auto 15px',fontSize:'20px',color:'#bb8600',width:'200px'}}>Add Product Color</h2>

        <label htmlFor='productColorName'>
            <span className='userinfotextdemo' style={{display:"block"}}>Color Name</span>
            <input type="text" name="productColorName" placeholder="Type Color Name"  id="productColorName" value={colorName} onChange={(e) => {setColorName(e.target.value)}} className='contactinput'/>
        </label>

        <div className='addreviewsImageContainerOne' style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                <label htmlFor='ProductColorImgs' className='addreviewimg addreviewimgOne'>
                  Add Color Image
                  <input  name="ProductColorImgs" type='file' id="ProductColorImgs" multiple={false} onChange={uploadReviewColorPhotos}/>
                </label>
               <div id="imageViewrlist">
                 {colorImg &&  <img src={colorImg} alt="imagePreview" className='productPreviwstyle'/> }
               </div>
        </div>
            <button className='contactsendbtn updateButtonToggle' onClick={AddProductColor} disabled={isChangeColor}>{loading ? "Uploading..." : "Upload"}</button>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default ProductColor