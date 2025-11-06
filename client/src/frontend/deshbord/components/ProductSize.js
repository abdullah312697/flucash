import React, { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Altaxios} from '../../Altaxios'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ProductSize({data}) {
    const [sizeTextData,setSizeTextData] = useState([]);
    const [productSize,setProductSize] = useState("");
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [loading,setLoading] = useState(false);
    const [oldSize,setOldSize] = useState("");
    const { productId } = useParams();
    const [porductSizeUpdate,setPorductSizeUpdate] = useState("notChange");
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
            setSizeTextData(data ?? []);
        }
    }, [data]);
    let checkEmptyInput = true;
    if(porductSizeUpdate === "notChange"){
        checkEmptyInput = true;
    }else if((porductSizeUpdate !== "notChange") && (porductSizeUpdate === "")){
        checkEmptyInput = true;
    }else{
        checkEmptyInput = false;
    }
    let isChangeData = true;
    if(productSize !== ""){
        isChangeData = false
    }else{
        isChangeData = true
    }
    const cencelPopupThreeINSize = () => {
        const getpr = document.querySelector(".preDeletebtnContainerINSize");
        getpr.style = `display:none`;
    }
    
    const getSizeVal = async() => {
        if(productSize !== ""){
            setProductSize("");
            setLoading(true); 
            const formdatafuture = {ProductSize : productSize}
            await Altaxios.put(`addproduct/addProductSize/${productId}`,formdatafuture).then((res) => {
               if(res.status === 200){
                setSizeTextData(res.data.data.ProductSize ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                setLoading(false);
                cencelPopupThreeINSize();
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
    };
    
    function submitSize(e){
        if (e.key === 'Enter') {
            getSizeVal();
        }
    };
    
    const CancelSizeToggle = () => {
        const checkActive = document.querySelector(".activeFutureUpdate");
        const DAcheckActive = document.querySelector(".DeActiveFutureUpdate");
        if(checkActive){
            checkActive.classList.remove("activeFutureUpdate")
        }
        if(DAcheckActive){
            DAcheckActive.classList.remove("DeActiveFutureUpdate")
        }
        setPorductSizeUpdate("notChange");
    };
    
    const toggleSizeUpdateAndEdit = (e) => {
        CancelSizeToggle();
        const parents = e.currentTarget.parentElement.parentElement;
        parents.classList.add("DeActiveFutureUpdate")
        const grandParents = parents.nextElementSibling;
        grandParents.classList.add("activeFutureUpdate");
    };
    let productSizeData = {};
    if(porductSizeUpdate !== "" && porductSizeUpdate !== "notChange"){
        productSizeData.ProductSize = porductSizeUpdate;
        productSizeData.ProductOldSize = oldSize;
    }
    const UpdateSizeFeauter = async() => {
        await Altaxios.put(`addproduct/updateProductSize/${productId}`,productSizeData).then((res) => {
            if(res.status === 200){
             setSizeTextData(res.data.data.ProductSize ?? []);
             setResMessage(res.data.message);
             setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
             CancelSizeToggle();
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
    
    const DeletePopupOnSize = (oldSize) => {
        const showPopup = document.querySelector(".preDeletebtnContainerINSize");
        showPopup.style = `display:block`;
        setOldSize(oldSize);
    }
    const DeleteSizeFutures = async() => {
        await Altaxios.delete(`addproduct/deleteProductSize/${encodeURIComponent(productId)}/${encodeURIComponent(oldSize)}`).then((res) => {
            if(res.status === 200){
                setSizeTextData(res.data.data.ProductSize ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                cencelPopupThreeINSize();
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
    const setProductNewAndOldSize = (e, oldSize) => {
        setPorductSizeUpdate(e.target.value);
        setOldSize(oldSize);
    }

  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain">
        <h2>Product Sizes</h2>
    <div className='contactInner'>
            <div className='preDeletebtnContainerINSize'>
                <div className="preDeletePopup">
                    <h6>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={cencelPopupThreeINSize}>No</button>
                        <button className='nextsupportbtn' onClick={DeleteSizeFutures}>Yes</button>
                    </div>
                </div>
            </div>
        <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading'>
                    <span style={{width:'200px'}}>Product Size</span>
                    <span style={{width:'40px'}}>Edit</span>
                    <span style={{width:'60px'}}>Delete</span>
                </div>
                {
                 sizeTextData !== undefined && sizeTextData.length > 0 ? sizeTextData.map((d) => (
                    <div className='dbh_productFeuterValue' key={d}>
                        <div className='dbh_feauerview'>
                            <span style={{width:'200px'}}>{d}</span>
                            <span style={{width:'40px'}}><EditIcon style={{color:"#25ff00"}} onClick={toggleSizeUpdateAndEdit}/></span>
                            <span style={{width:'60px'}}><DeleteIcon style={{color:"#d70000"}} onClick={() => {DeletePopupOnSize(d)}}/></span>
                        </div>
                        <div className='dbh_feauterupdate'>
                            <input style={{width:'200px'}} type='text' name="FeaturesKey" defaultValue={d} placeholder='Product Size...' onChange={(e) => {    
                                setProductNewAndOldSize(e, d);
                            }}/>
                            <button style={{width:'70px',background:'#339d00'}} onClick={CancelSizeToggle}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00'}}onClick={UpdateSizeFeauter} disabled={checkEmptyInput}>Update</button>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>Data no avilable...</h4>
    }           
         </div>
        </div>
        <h2 style={{margin:'0px auto 15px',fontSize:'20px',color:'#bb8600',width:'200px'}}>Add Product Sizes</h2>

                <div className='ProductSpcInner'>
                    <label htmlFor='porductSize'>
                        <span className='userinfotextdemo'>Product Size</span>
                        <input type="text" name="porductSize" placeholder="Product Size..." className='ProductSpcInnerRight' id="porductSize" value={productSize} onChange={(e) => (setProductSize(e.target.value))} onKeyDown={(e) => {submitSize(e)}}/>
                    </label>
                    <button onClick={getSizeVal} disabled={isChangeData}>{loading === true ? "Adding..." : "Add"}</button>
                </div>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default ProductSize