import React, { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Altaxios} from '../../Altaxios'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ProductSpecification({data}) {
    const [SpcTextData,setSpcTextData] = useState([]);    
    const [SpcKey,setSpcKey] = useState("");
    const [SpcVal,setSpcVal] = useState("");
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [loadingSpc,setLoadingSpc] = useState(false);
    const [SpcId,setSpcId] = useState("");
    const [deleteSpcId,setDeleteSpcId] = useState("");
    const { productId } = useParams();
    const [SpcKeyUpdate,setSpcKeyUpdate] = useState("notChange");
    const [SpcValueUpdate,setSpcValueUpdate] = useState("notChange");
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
            setSpcTextData(data ?? []);
        }
    }, [data]);
    let checSpckEmptyInput = true;
    if(SpcKeyUpdate === "notChange" && SpcValueUpdate === "notChange"){
        checSpckEmptyInput = true;
    }else if((SpcKeyUpdate !== "notChange" || SpcValueUpdate !== "notChange") && (SpcKeyUpdate === "" || SpcValueUpdate === "")){
        checSpckEmptyInput = true;
    }else{
        checSpckEmptyInput = false;
    }
    let isChangeData = true;
    if(SpcKey !== "" && SpcVal !== ""){
        isChangeData = false
    }else{
        isChangeData = true
    }
    const cencelPopupFour = () => {
        const getpr = document.querySelector(".preDeletebtnContainerFour");
        getpr.style = `display:none`;
    }

    const getSpcVal = async() => {
        if(SpcKey !== "" && SpcVal !== ""){
            setSpcKey("");
            setSpcVal("");
            setLoadingSpc(true); 
            const formdataSpc = {ProductSpcKey : SpcKey, ProductSpcVal : SpcVal}
            await Altaxios.put(`addproduct/updateSpecification/${productId}`,formdataSpc).then((res) => {
               if(res.status === 200){
                setSpcTextData(res.data.data.ProductSpecification ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                setLoadingSpc(false);
                cencelPopupFour();
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
    
    function submitToSpc(e){
        if (e.key === 'Enter') {
            getSpcVal();
        }
    };
    const CancelSpcToggle = () => {
        const checkActive = document.querySelector(".activeFutureUpdate");
        const DAcheckActive = document.querySelector(".DeActiveFutureUpdate");
        if(checkActive){
            checkActive.classList.remove("activeFutureUpdate")
        }
        if(DAcheckActive){
            DAcheckActive.classList.remove("DeActiveFutureUpdate")
        }
        setSpcKeyUpdate("notChange");
        setSpcValueUpdate("notChange");
    };

    const toggleSpcAndEdit = (e) => {
        CancelSpcToggle();
        const parents = e.currentTarget.parentElement.parentElement;
        parents.classList.add("DeActiveFutureUpdate")
        const grandParents = parents.nextElementSibling;
        grandParents.classList.add("activeFutureUpdate");
    };

    let formSpcficationData = {};
    if(SpcKeyUpdate !== "" && SpcKeyUpdate !== "notChange"){
        formSpcficationData.key = SpcKeyUpdate;
    }
    if(SpcValueUpdate !== "" && SpcValueUpdate !== "notChange"){
        formSpcficationData.value = SpcValueUpdate;
    }
    const UpdateSpcFeauter = async() => {
        await Altaxios.put(`addproduct/updateSpcficKeyValue/${productId}/${deleteSpcId}`,formSpcficationData).then((res) => {
            if(res.status === 200){
                console.log(res.data.data.ProductSpecification)
                setSpcTextData(res.data.data.ProductSpecification ?? []);
             setResMessage(res.data.message);
             setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
             CancelSpcToggle();
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

    const DeletePopupSpc = (e) => {
        const showPopup = document.querySelector(".preDeletebtnContainerFour");
        showPopup.style = `display:block`;
        const newUrl = e.currentTarget.getAttribute("dataurl");
        setSpcId(newUrl ?? "");
    }
    const DeleteSpecifiCation = async() => {
        await Altaxios.delete(`addproduct/deleteSpecification/${encodeURIComponent(productId)}/${encodeURIComponent(SpcId)}`).then((res) => {
            if(res.status === 200){
                setSpcTextData(res.data.data.ProductSpecification ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                cencelPopupFour();
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
        <h2>Product Specification</h2>
    <div className='contactInner'>

            <div className='preDeletebtnContainerFour'>
                <div className="preDeletePopup">
                    <h6>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={cencelPopupFour}>No</button>
                        <button className='nextsupportbtn' onClick={DeleteSpecifiCation}>Yes</button>
                    </div>
                </div>
                </div>

        <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading'>
                    <span style={{width:'200px'}}>Specification Key</span>
                    <span style={{width:'250px'}}>key value</span>
                    <span style={{width:'40px'}}>Edit</span>
                    <span style={{width:'60px'}}>Delete</span>
                </div>
                {
                 SpcTextData !== undefined && SpcTextData.length > 0  ? SpcTextData.map((d) => (
                    <div className='dbh_productFeuterValue' key={d._id}>
                        <div className='dbh_feauerview'>
                            <span style={{width:'200px'}}>{d.spcKey}</span>
                            <span style={{width:'250px'}}>{d.spcValue}</span>
                            <span style={{width:'40px'}}><EditIcon style={{color:"#25ff00"}} onClick={toggleSpcAndEdit}/></span>
                            <span style={{width:'60px'}}><DeleteIcon style={{color:"#d70000"}} onClick={DeletePopupSpc} dataurl={d._id}/></span>
                        </div>
                        <div className='dbh_feauterupdate'>
                            <input style={{width:'200px'}} type='text' name="FeaturesKey" defaultValue={d.spcKey} placeholder='Features Key...' futurid={d._id} onChange={(e) => {    
                                setDeleteSpcId(e.currentTarget.getAttribute("futurid"));
                                setSpcKeyUpdate(e.target.value);
                            }}/>
                            <input style={{width:'250px'}} type='text' name="FeaturesValue" defaultValue={d.spcValue} placeholder='Features Value...' 
                            futurid={d._id} onChange={(e) => {
                                setDeleteSpcId(e.currentTarget.getAttribute("futurid"));
                                setSpcValueUpdate(e.target.value);
                            }}/>
                            <button style={{width:'70px',background:'#339d00'}} onClick={CancelSpcToggle}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00'}}onClick={UpdateSpcFeauter} disabled={checSpckEmptyInput}>Update</button>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>Data no avilable...</h4>
    }           
         </div>
        </div>
        <h2 style={{margin:'0px auto 15px',fontSize:'20px',color:'#bb8600',width:'240px'}}>Add Product Specification</h2>

                <div className='ProductSpcInner'>
                    <label htmlFor='SpcKey'>
                        <span className='userinfotextdemo'>Specification Key</span>
                        <input type="text" name="SpcKey" placeholder="Features Key..." className='ProductSpcInnerLeft' id="SpcKey" value={SpcKey} onChange={(e) => (setSpcKey(e.target.value))} />
                    </label>
                    <label htmlFor='SpcValue'>
                        <span className='userinfotextdemo'>Specification value</span>
                        <input type="text" name="SpcValue" placeholder="Features Value..." className='ProductSpcInnerRight' id="SpcValue" value={SpcVal} onChange={(e) => (setSpcVal(e.target.value))} onKeyDown={(e) => {submitToSpc(e)}}/>
                    </label>
                    <button onClick={getSpcVal} disabled={isChangeData}>{loadingSpc === true ? "Adding..." : "Add"}</button>
                </div>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default ProductSpecification