import React, { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Altaxios} from '../../Altaxios'
import { useParams } from 'react-router-dom';
import FormData from 'form-data';
import { useNavigate } from 'react-router-dom';

function ProductDescription({data}) {
    const [productDescription,setProductDescription] = useState([]);    
    const [DescHeading,setDescHeading] = useState("");
    const [DescValue,setDescValue] = useState("");
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [Descloading,setDescloading] = useState(false);
    const [descripId,setDescripId] = useState("");
    const [cloudinayPid,setCloudinayPid] = useState("");
    const [deleteDescId,setDeleteDescId] = useState("");
    const { productId } = useParams();
    const [productImg,setProductImg] = useState(null);
    const [DescripHeadingUpdate,setDescripHeadingUpdate] = useState("notChange");
    const [DescripValueUpdate,setDescripValueUpdate] = useState("notChange");
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
            setProductDescription(data ?? []);
        }
    }, [data]);
    let checkEmptyInput = true;
    if(DescripHeadingUpdate === "notChange" && DescripValueUpdate === "notChange"){
        checkEmptyInput = true;
    }else if((DescripHeadingUpdate !== "notChange" || DescripValueUpdate !== "notChange") && (DescripHeadingUpdate === "" || DescripValueUpdate === "")){
        checkEmptyInput = true;
    }else{
        checkEmptyInput = false;
    }

    let isChangeData = true;
    if(productImg !== null && DescHeading !== "" && DescValue !== ""){
        isChangeData = false
    }else{
        isChangeData = true
    }


        //preview photos  start
        const productDescImgPreview = (e) => {
            const previewImg = document.getElementById("imageViewrDescription");
            previewImg.innerHTML = "";
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
                    previewImg.appendChild(image);
                  },
                  false,
                );
                reader.readAsDataURL(file);
              }
            }
            readAndPreview(files);
            }
        };
        //preview photos  end
    
    const cencelPopupDescription = () => {
        const getpr = document.querySelector(".preDeletebtnContainerFive");
        getpr.style = `display:none`;
    }

    const getDescripVal = async() => {
        const previewImg = document.getElementById("imageViewrDescription");
            const cloudinaryFolderName = "DescriptionImages";
            const formdataDescription = new FormData();
            formdataDescription.append("file",productImg);
            formdataDescription.append("ProductDescHeadig",DescHeading);
            formdataDescription.append("ProductDescVal",DescValue);
            setDescloading(true); 
            await Altaxios.put(`addproduct/updateDescription/${cloudinaryFolderName}/${productId}`,formdataDescription,{headers: {'Content-Type': 'multipart/form-data',}}).then((res) => {
                setDescHeading("");
                setDescValue("");
                setProductImg(null);
                previewImg.innerHTML = "";
               if(res.status === 200){
                setProductDescription(res.data.data.ProductDescription ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                setDescloading(false);
                cencelPopupDescription();
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"});
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
    
    const CancelToggleDescription = () => {
        const checkActive = document.querySelector(".activeFutureUpdate");
        const DAcheckActive = document.querySelector(".DeActiveFutureUpdate");
        if(checkActive){
            checkActive.classList.remove("activeFutureUpdate")
        }
        if(DAcheckActive){
            DAcheckActive.classList.remove("DeActiveFutureUpdate")
        }
        setDescripHeadingUpdate("notChange");
        setDescripValueUpdate("notChange");
    };

    const toggleUpdateAndEditDescrip = (e) => {
        CancelToggleDescription();
        const parents = e.currentTarget.parentElement.parentElement;
        parents.classList.add("DeActiveFutureUpdate")
        const grandParents = parents.nextElementSibling;
        grandParents.classList.add("activeFutureUpdate");
    };

    let formDescriptionData = {};
    if(DescripHeadingUpdate !== "" && DescripHeadingUpdate !== "notChange"){
        formDescriptionData.key = DescripHeadingUpdate;
    }
    if(DescripValueUpdate !== "" && DescripValueUpdate !== "notChange"){
        formDescriptionData.value = DescripValueUpdate;
    }
    const UpdateDescripTion = async() => {
        await Altaxios.put(`addproduct/updateDescriptionKeyValue/${productId}/${deleteDescId}`,formDescriptionData).then((res) => {
            if(res.status === 200){
             setProductDescription(res.data.data.ProductDescription ?? []);
             setResMessage(res.data.message);
             setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
             CancelToggleDescription();
             setTimeout(() => {
                 setResMsgStyle({opacity:0,marginTop:"0px"});
             },3000);
            }else{
             setResMessage(res.data.message);
             setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
             setTimeout(() => {
                 setResMsgStyle({opacity:0,marginTop:"0px"})
             },3000)
            }
         });

    }

    const DeletePopupDescription = (e) => {
        const showPopup = document.querySelector(".preDeletebtnContainerFive");
        showPopup.style = `display:block`;
        const newUrl = e.currentTarget.getAttribute("dataurl");
        const newPhotoUrl = e.currentTarget.getAttribute("photoid");
        setDescripId(newUrl ?? "");
        setCloudinayPid(newPhotoUrl ?? "");
    }
    const DeleteDescripTion = async() => {
        await Altaxios.delete(`addproduct/deleteDescription/${encodeURIComponent(productId)}/${encodeURIComponent(descripId)}/${encodeURIComponent(cloudinayPid)}`).then((res) => {
            if(res.status === 200){
                setProductDescription(res.data.data.ProductDescription ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                cencelPopupDescription();
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"});
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
    
  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain">
        <h2>Product Description</h2>
    <div className='contactInner'>
            <div className='preDeletebtnContainerFive'>
                <div className="preDeletePopup">
                    <h6>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={cencelPopupDescription}>No</button>
                        <button className='nextsupportbtn' onClick={DeleteDescripTion}>Yes</button>
                    </div>
                </div>
                </div>

        <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading'>
                    <span style={{width:'200px'}}>Heading</span>
                    <span style={{width:'250px'}}>Description</span>
                    <span style={{width:'40px'}}>Edit</span>
                    <span style={{width:'60px'}}>Delete</span>
                </div>
                {
                 productDescription !== undefined && productDescription.length > 0  ? productDescription.map((d) => (
                    <div className='dbh_productFeuterValue' key={d._id} style={{padding:'10px'}}>
                        <div className='dbh_feauerview' style={{alignItems:'flex-start',position:'relative',padding:'0px'}}>
                            <span style={{width:'200px'}}>{d.heading}</span>
                            <span className='dbh_productDesc'>{d.descripTion}</span>
                            <img src={d.photoUrl} alt="productImg" style={{width:'120px',margin:'0px 10px', borderRadius:'5px'}}/>
                            <span style={{width:'40px'}}><EditIcon style={{color:"#25ff00"}} onClick={toggleUpdateAndEditDescrip}/></span>
                            <span style={{width:'60px'}}><DeleteIcon style={{color:"#d70000"}} onClick={DeletePopupDescription} dataurl={d._id} photoid={d.CloudinaryPublicId}/></span>
                        </div>
                        <div className='dbh_feauterupdate' style={{position:'relative',alignItems:'flex-start',justifyContent:'space-between',padding:'0px'}}>
                            <input style={{width:'250px',marginRight:'10px'}} type='text' name="productHeading" defaultValue={d.heading} placeholder='product Heading...' futurid={d._id} onChange={(e) => {    
                                setDeleteDescId(e.currentTarget.getAttribute("futurid"));
                                setDescripHeadingUpdate(e.target.value);
                            }}/>
                            <textarea rows={5} cols={10}
                            style={{width:'380px',resize:'none',marginBottom:'0px'}} type='text' name="productDescription" defaultValue={d.descripTion} placeholder='Product Description...' 
                            futurid={d._id} className='ProductSpcInnerRight' onChange={(e) => {
                                setDeleteDescId(e.currentTarget.getAttribute("futurid"));
                                setDescripValueUpdate(e.target.value);
                            }}
                           ></textarea>
                            <button style={{width:'70px',background:'#339d00',marginRight:'10px'}} onClick={CancelToggleDescription}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00',marginRight:'10px'}}onClick={UpdateDescripTion} disabled={checkEmptyInput}>Update</button>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>Data no avilable...</h4>
    }           
         </div>
        </div>
        <h2 style={{margin:'0px auto 15px',fontSize:'20px',color:'#bb8600',width:'230px'}}>Add Product Description</h2>

                <div className='ProductSpcInner' style={{alignItems:'center',flexDirection:'column',width:'100%'}}>
                <div>
                    <label htmlFor='DscHeading'>
                        <span className='userinfotextdemo'>Add Product Heading</span>
                        <input type="text" name="DscHeading" placeholder="Product Heading..." className='ProductSpcInnerLeft' id="DscHeading" value={DescHeading} onChange={(e) => (setDescHeading(e.target.value))} style={{width:'380px'}} />
                    </label>
                    <label htmlFor='DecValue'>
                        <span className='userinfotextdemo'>Product Description</span>
                        <textarea rows={5} cols={10} style={{width:'380px'}} name="DecValue" placeholder="Product Description..." className='ProductSpcInnerRight' id="DecValue" value={DescValue} onChange={(e) => (setDescValue(e.target.value))}></textarea>
                    </label>
                </div>
                <div className='addreviewsImageContainerOne' style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                    <label htmlFor='DescriptionPhotos' className='addreviewimg addreviewimgOne' style={{width:'383px',marginLeft:'-7px'}}>
                      Add Product Photos
                      <input  name="DescriptionPhotos" type='file' id="DescriptionPhotos" multiple={false} onChange={productDescImgPreview}/>
                    </label>
                    <div id="imageViewrDescription"></div>
                </div>
                    <button onClick={getDescripVal} disabled={isChangeData}style={{width:'383px',marginLeft:'-7px'}}>{Descloading === true ? "Adding..." : "Add"}</button>
                </div>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}
export default ProductDescription