import React, { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Altaxios} from '../../Altaxios'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ProductFeauter({data}) {
    const [feauterTextData,setFeauterTextData] = useState([]);    
    const [FeauterKey,setFeauterKey] = useState("");
    const [FeauterVal,setFeauterVal] = useState("");
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [loading,setLoading] = useState(false);
    const [futurId,setFuturId] = useState("");
    const [deleteFutureId,setDeleteFutureId] = useState("");
    const { productId } = useParams();
    const [FeautrKeyUpdate,setFeautrKeyUpdate] = useState("notChange");
    const [FeaturesValueUpdate,setFeaturesValueUpdate] = useState("notChange");
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
            setFeauterTextData(data ?? []);
        }
    }, [data]);
    let checkEmptyInput = true;
    if(FeautrKeyUpdate === "notChange" && FeaturesValueUpdate === "notChange"){
        checkEmptyInput = true;
    }else if((FeautrKeyUpdate !== "notChange" || FeaturesValueUpdate !== "notChange") && (FeautrKeyUpdate === "" || FeaturesValueUpdate === "")){
        checkEmptyInput = true;
    }else{
        checkEmptyInput = false;
    }
    let isChangeData = true;
    if(FeauterKey !== "" && FeauterVal !== ""){
        isChangeData = false
    }else{
        isChangeData = true
    }
    const cencelPopupThree = () => {
        const getpr = document.querySelector(".preDeletebtnContainerThree");
        getpr.style = `display:none`;
    }

    const getFeuterVal = async() => {
        if(FeauterKey !== "" && FeauterVal !== ""){
            setFeauterKey("");
            setFeauterVal("");
            setLoading(true); 
            const formdatafuture = {ProductFeauterKey : FeauterKey, ProductFeauterVal : FeauterVal}
            await Altaxios.put(`addproduct/updateFeauter/${productId}`,formdatafuture).then((res) => {
               if(res.status === 200){
                setFeauterTextData(res.data.data.ProductFutures ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                setLoading(false);
                cencelPopupThree();
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
    
    function submitTodo(e){
        if (e.key === 'Enter') {
            getFeuterVal();
        }
    };
    const CancelToggle = () => {
        const checkActive = document.querySelector(".activeFutureUpdate");
        const DAcheckActive = document.querySelector(".DeActiveFutureUpdate");
        if(checkActive){
            checkActive.classList.remove("activeFutureUpdate")
        }
        if(DAcheckActive){
            DAcheckActive.classList.remove("DeActiveFutureUpdate")
        }
        setFeautrKeyUpdate("notChange");
        setFeaturesValueUpdate("notChange");
    };

    const toggleUpdateAndEdit = (e) => {
        CancelToggle();
        const parents = e.currentTarget.parentElement.parentElement;
        parents.classList.add("DeActiveFutureUpdate")
        const grandParents = parents.nextElementSibling;
        grandParents.classList.add("activeFutureUpdate");
    };

    let formFutureData = {};
    if(FeautrKeyUpdate !== "" && FeautrKeyUpdate !== "notChange"){
        formFutureData.key = FeautrKeyUpdate;
    }
    if(FeaturesValueUpdate !== "" && FeaturesValueUpdate !== "notChange"){
        formFutureData.value = FeaturesValueUpdate;
    }
    const UpdateFeauter = async() => {
        await Altaxios.put(`addproduct/updateFeautureKeyValue/${productId}/${deleteFutureId}`,formFutureData).then((res) => {
            if(res.status === 200){
             setFeauterTextData(res.data.data.ProductFutures ?? []);
             setResMessage(res.data.message);
             setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
             CancelToggle();
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

    const DeletePopupOn = (e) => {
        const showPopup = document.querySelector(".preDeletebtnContainerThree");
        showPopup.style = `display:block`;
        const newUrl = e.currentTarget.getAttribute("dataurl");
        setFuturId(newUrl ?? "");
    }
    const DeleteFutures = async() => {
        await Altaxios.delete(`addproduct/deleteFutures/${encodeURIComponent(productId)}/${encodeURIComponent(futurId)}`).then((res) => {
            if(res.status === 200){
                setFeauterTextData(res.data.data.ProductFutures ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                cencelPopupThree();
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

  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain">
        <h2>Product Features</h2>
    <div className='contactInner'>

            <div className='preDeletebtnContainerThree'>
                <div className="preDeletePopup">
                    <h6>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={cencelPopupThree}>No</button>
                        <button className='nextsupportbtn' onClick={DeleteFutures}>Yes</button>
                    </div>
                </div>
                </div>

        <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading'>
                    <span style={{width:'200px'}}>Product Key</span>
                    <span style={{width:'250px'}}>key value</span>
                    <span style={{width:'40px'}}>Edit</span>
                    <span style={{width:'60px'}}>Delete</span>
                </div>
                {
                 feauterTextData !== undefined && feauterTextData.length > 0  ? feauterTextData.map((d) => (
                    <div className='dbh_productFeuterValue' key={d._id}>
                        <div className='dbh_feauerview'>
                            <span style={{width:'200px'}}>{d.key}</span>
                            <span style={{width:'250px'}}>{d.value}</span>
                            <span style={{width:'40px'}}><EditIcon style={{color:"#25ff00"}} onClick={toggleUpdateAndEdit}/></span>
                            <span style={{width:'60px'}}><DeleteIcon style={{color:"#d70000"}} onClick={DeletePopupOn} dataurl={d._id}/></span>
                        </div>
                        <div className='dbh_feauterupdate'>
                            <input style={{width:'200px'}} type='text' name="FeaturesKey" defaultValue={d.key} placeholder='Features Key...' futurid={d._id} onChange={(e) => {    
                                setDeleteFutureId(e.currentTarget.getAttribute("futurid"));
                                setFeautrKeyUpdate(e.target.value);
                            }}/>
                            <input style={{width:'250px'}} type='text' name="FeaturesValue" defaultValue={d.value} placeholder='Features Value...' 
                            futurid={d._id} onChange={(e) => {
                                setDeleteFutureId(e.currentTarget.getAttribute("futurid"));
                                setFeaturesValueUpdate(e.target.value);
                            }}/>
                            <button style={{width:'70px',background:'#339d00'}} onClick={CancelToggle}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00'}}onClick={UpdateFeauter} disabled={checkEmptyInput}>Update</button>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>Data no avilable...</h4>
    }           
         </div>
        </div>
        <h2 style={{margin:'0px auto 15px',fontSize:'20px',color:'#bb8600',width:'200px'}}>Add Product Features</h2>

                <div className='ProductSpcInner'>
                    <label htmlFor='futurseKey'>
                        <span className='userinfotextdemo'>Add Key Features</span>
                        <input type="text" name="futurseKey" placeholder="Features Key..." className='ProductSpcInnerLeft' id="futurseKey" value={FeauterKey} onChange={(e) => (setFeauterKey(e.target.value))} />
                    </label>
                    <label htmlFor='futurseValue'>
                        <span className='userinfotextdemo'>Features value</span>
                        <input type="text" name="futurseValue" placeholder="Features Value..." className='ProductSpcInnerRight' id="futurseValue" value={FeauterVal} onChange={(e) => (setFeauterVal(e.target.value))} onKeyDown={(e) => {submitTodo(e)}}/>
                    </label>
                    <button onClick={getFeuterVal} disabled={isChangeData}>{loading === true ? "Adding..." : "Add"}</button>
                </div>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default ProductFeauter