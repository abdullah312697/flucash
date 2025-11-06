import React, { useEffect, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Altaxios} from '../../Altaxios'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ShortDescription({data}) {
    const [shortDescription,setShortDescription] = useState({});  
    const [shortDescKey,setShortDescKey] = useState({
        input1: '',
        input2: '',
        input3: ''
    });
    const [shortDescVal,SetshortDescVal] = useState({ 
        input1: '',
        input2: '',
        input3: ''
    });
    const [resMessageDesc,setResMessageDesc] = useState("");
    const [resMsgStyleDesc,setResMsgStyleDesc] = useState({});
    const [loadingDesc,setLoadingDesc] = useState(false);
    const [shortDescId,setShortDescId] = useState("");
    const [deleteShortDescId,SetdeleteShortDescId] = useState("");
    const [deleteShortDescEndPoint,setDeleteShortDescEndPoint] = useState("");
    const { productId } = useParams();
    const [ShortDescKeyUpdate,setShortDescKeyUpdate] = useState("notChange");
    const [shortDescValueUpdate,setShortDescValueUpdate] = useState("notChange");
    const [shortDescriptionHeadingUpdate,setShortDescriptionHeadingUpdate] = useState("");
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
            setShortDescription(data ?? []);
        }
    }, [data]);
    let checkEmptyInput = true;
    if(ShortDescKeyUpdate === "notChange" && shortDescValueUpdate === "notChange"){
        checkEmptyInput = true;
    }else if((ShortDescKeyUpdate !== "notChange" || shortDescValueUpdate !== "notChange") && (ShortDescKeyUpdate === "" || shortDescValueUpdate === "")){
        checkEmptyInput = true;
    }else{
        checkEmptyInput = false;
    }

    let checkEmptyHeading = true;

    if(shortDescriptionHeadingUpdate === ""){
        checkEmptyHeading = true;
    }else{
        checkEmptyHeading = false;
    }

    const cencelPopupNine = () => {
        const getpr = document.querySelector(".preDeletebtnContainerNine");
        getpr.style = `display:none`;
    }

    const getFeuterVal = async(endPoint) => {
          const f_shortDescKey = Object.values(shortDescKey).filter(value => value.trim() !== '');
          const f_shortDescVal = Object.values(shortDescVal).filter(value => value.trim() !== '');
            setLoadingDesc(true); 
            const formdatafuture = {ProductFeauterKey : f_shortDescKey[0], ProductFeauterVal : f_shortDescVal[0]}
            await Altaxios.put(`addproduct/${endPoint}/${productId}`,formdatafuture).then((res) => {
               if(res.status === 200){
                if(endPoint === "setVariations"){
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescVariations : res.data.data
                    }));
                }else if(endPoint === "setKeyAttrubutes"){
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescKeyAttributes : res.data.data
                    }));
                }else{
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescOtherAttributes : res.data.data
                    }));
                }
                setShortDescKey({
                    input1: '',
                    input2: '',
                    input3: ''
                });
                SetshortDescVal({
                    input1: '',
                    input2: '',
                    input3: ''
                })            
                setResMessageDesc(res.data.message);
                setResMsgStyleDesc({color:"green",opacity:1,marginTop:"15px"});
                setLoadingDesc(false);
                cencelPopupNine();
                setTimeout(() => {
                    setResMsgStyleDesc({opacity:0,marginTop:"0px"});
                },3000);
               }else{
                setResMessageDesc(res.data.message);
                setShortDescKey({
                    input1: '',
                    input2: '',
                    input3: ''
                });
                SetshortDescVal({
                    input1: '',
                    input2: '',
                    input3: ''
                })            
                setResMsgStyleDesc({color:"red",opacity:1,marginTop:"15px",})
                setTimeout(() => {
                    setResMsgStyleDesc({opacity:0,marginTop:"0px"})
                },3000)
               }
            });
    };
    
    function submitTodo(e, endPoint){
        if (e.key === 'Enter') {
            getFeuterVal(endPoint);
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
        setShortDescKeyUpdate("notChange");
        setShortDescValueUpdate("notChange");
    };

    const toggleUpdateAndEdit = (e) => {
        CancelToggle();
        const parents = e.currentTarget.parentElement.parentElement;
        parents.classList.add("DeActiveFutureUpdate")
        const grandParents = parents.nextElementSibling;
        grandParents.classList.add("activeFutureUpdate");
    };

    let formFutureData = {};
    if(ShortDescKeyUpdate !== "" && ShortDescKeyUpdate !== "notChange"){
        formFutureData.key = ShortDescKeyUpdate;
    }
    if(shortDescValueUpdate !== "" && shortDescValueUpdate !== "notChange"){
        formFutureData.value = shortDescValueUpdate;
    }
    const UpdateFeauter = async(endPoint) => {
        await Altaxios.put(`addproduct/${endPoint}/${productId}/${deleteShortDescId}`,formFutureData).then((res) => {
            if(res.status === 200){
                if(endPoint === "updateVariations"){
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescVariations : res.data.data
                    }));
                }else if(endPoint === "updateKeyAttrubutes"){
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescKeyAttributes : res.data.data
                    }));
                }else{
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescOtherAttributes : res.data.data
                    }));
                }
             setResMessageDesc(res.data.message);
             setResMsgStyleDesc({color:"green",opacity:1,marginTop:"15px"});
             CancelToggle();
             setTimeout(() => {
                 setResMsgStyleDesc({opacity:0,marginTop:"0px"});
             },3000);
            }else{
             setResMessageDesc(res.data.message);
             setResMsgStyleDesc({color:"red",opacity:1,marginTop:"15px",})
             setTimeout(() => {
                 setResMsgStyleDesc({opacity:0,marginTop:"0px"})
             },3000)
            }
         });

    };

    const UpdateHeading = async() => {
        await Altaxios.put(`addproduct/updateShortHeading/${productId}`,{productShortHeading:shortDescriptionHeadingUpdate}).then((res) => {
            if(res.status === 200){
                setShortDescription((prevState) => ({
                    ...prevState,
                    productShortHeading: res.data.data
                }));
                setResMessageDesc(res.data.message);
             setResMsgStyleDesc({color:"green",opacity:1,marginTop:"15px"});
             CancelToggle();
             setTimeout(() => {
                 setResMsgStyleDesc({opacity:0,marginTop:"0px"});
             },3000);
            }else{
             setResMessageDesc(res.data.message);
             setResMsgStyleDesc({color:"red",opacity:1,marginTop:"15px",})
             setTimeout(() => {
                 setResMsgStyleDesc({opacity:0,marginTop:"0px"})
             },3000)
            }
         });

    }

    const DeletePopupOn = (e, endPoint) => {
        const showPopup = document.querySelector(".preDeletebtnContainerNine");
        showPopup.style = `display:block`;
        const newUrl = e.currentTarget.getAttribute("dataurl");
        setShortDescId(newUrl ?? "");
        setDeleteShortDescEndPoint(endPoint);
    }
    const DeleteShortDesc = async() => {
        await Altaxios.delete(`addproduct/deleteShortDescription/${encodeURIComponent(productId)}/${encodeURIComponent(shortDescId)}/${encodeURIComponent(deleteShortDescEndPoint)}`).then((res) => {
            if(res.status === 200){

                if(deleteShortDescEndPoint === "productShortDescVariations"){
                    const filterDeldata = shortDescription.productShortDescVariations.filter((d) => (d._id !== res.data.data));
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescVariations : filterDeldata
                    }));
                }else if(deleteShortDescEndPoint === "productShortDescKeyAttributes"){
                    const filterDeldata = shortDescription.productShortDescKeyAttributes.filter((d) => (d._id !== res.data.data));
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescKeyAttributes : filterDeldata
                    }));
                }else{
                    const filterDeldata = shortDescription.productShortDescOtherAttributes.filter((d) => (d._id !== res.data.data));
                    setShortDescription((prevState) => ({
                        ...prevState,
                        productShortDescOtherAttributes : filterDeldata
                    }));
                }
                setResMessageDesc(res.data.message);
                setResMsgStyleDesc({color:"green",opacity:1,marginTop:"15px"});
                cencelPopupNine();
                setTimeout(() => {
                    setResMsgStyleDesc({opacity:0,marginTop:"0px"});
                },3000);
               }else{
                setResMessageDesc(res.data.message);
                setResMsgStyleDesc({color:"red",opacity:1,marginTop:"15px",})
                setTimeout(() => {
                    setResMsgStyleDesc({opacity:0,marginTop:"0px"})
                },3000)
               }
        });
    }
    const handleInputChange = (e, inputName) => {
        const { value } = e.target;

        SetshortDescVal(() => {
          const newState = {
            input1: '',
            input2: '',
            input3: ''
          };
          newState[inputName] = value;
          return newState;
        });
      };
    
      const handleInputChangeValue = (e, inputName) => {
        const { value } = e.target;
        setShortDescKey(() => {
            const newState = {
              input1: '',
              input2: '',
              input3: ''
            };
            newState[inputName] = value;
            return newState;
          });
        };

      const isButtonDisabled = (inputName) => {
        return  shortDescKey[inputName] === '' || shortDescVal[inputName] === '';
      };

  return (
    <div className="contactContainerMain_DBH" style={{flexDirection:'column'}}>
        <h2 style={{marginBottom:'50px',color:'#bb8600'}}>Product Short Description in product page</h2>
    <div className="contactinnerMain">
    {shortDescription?.productShortHeading ? (
                    <div className='dbh_productFeuterValue' style={{paddingBottom:'45px',marginBottom:'20px'}}>
                        <div className='dbh_feauerview'>
                            <h2 style={{width:'565px'}}>{shortDescription.productShortHeading}</h2>
                            <span style={{width:'40px'}}><EditIcon style={{color:"#25ff00"}} onClick={toggleUpdateAndEdit}/></span>
                        </div>
                        <div className='dbh_feauterupdate'>
                            <input style={{width:'475px'}} type='text' name="productShortHeading" defaultValue={shortDescription.productShortHeading} placeholder='product short heading ...' 
                             onChange={(e) => {
                                setShortDescriptionHeadingUpdate(e.target.value);
                            }}/>
                            <button style={{width:'70px',background:'#339d00'}} onClick={CancelToggle}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00'}}onClick={UpdateHeading} disabled={checkEmptyHeading}>Update</button>
                        </div>
                    </div>
  ) : (
    <div className='dbh_productFeuterValue' style={{paddingBottom:'45px',marginBottom:'20px'}}>
    <div className='dbh_feauterupdate' style={{display:'flex'}}>
                <input style={{width:'565px'}} type='text' name="productShortHeading" defaultValue={shortDescription.productShortHeading} placeholder='product short heading ...' 
                 onChange={(e) => {
                    setShortDescriptionHeadingUpdate(e.target.value);
                }}/>
                <button style={{width:'70px',background:'#d99b00'}}onClick={UpdateHeading} disabled={checkEmptyHeading}>Add</button>
            </div>
        </div>
        )
    }
    <div className='contactInner'>
            <div className='preDeletebtnContainerNine'>
                <div className="preDeletePopup">
                    <h6>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={cencelPopupNine}>No</button>
                        <button className='nextsupportbtn' onClick={DeleteShortDesc}>Yes</button>
                    </div>
                </div>
            </div>
<div className='productShortDescConatiner'>
    <h2 style={{fontSize:'16px',marginBottom:'10px',color:'#bb8600'}}>Variations</h2>
        <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading'>
                    <span style={{width:'200px'}}>Product Key</span>
                    <span style={{width:'250px'}}>key value</span>
                    <span style={{width:'40px'}}>Edit</span>
                    <span style={{width:'60px'}}>Delete</span>
                </div>
                {JSON.stringify(shortDescription) !== '{}' && shortDescription?.productShortDescVariations && 
               shortDescription.productShortDescVariations.length > 0  ? shortDescription.productShortDescVariations.map((d) => (
                    <div className='dbh_productFeuterValue' key={d._id}>
                        <div className='dbh_feauerview'>
                            <span style={{width:'200px'}}>{d.key}</span>
                            <span style={{width:'250px'}}>{d.value}</span>
                            <span style={{width:'40px'}}><EditIcon style={{color:"#25ff00"}} onClick={toggleUpdateAndEdit}/></span>
                            <span style={{width:'60px'}}><DeleteIcon style={{color:"#d70000"}} onClick={(e) => {DeletePopupOn(e, "productShortDescVariations")}} dataurl={d._id}/></span>
                        </div>
                        <div className='dbh_feauterupdate'>
                            <input style={{width:'200px'}} type='text' name="FeaturesKey" defaultValue={d.key} placeholder='Features Key...' futurid={d._id} onChange={(e) => {    
                                SetdeleteShortDescId(e.currentTarget.getAttribute("futurid"));
                                setShortDescKeyUpdate(e.target.value);
                            }}/>
                            <input style={{width:'250px'}} type='text' name="FeaturesValue" defaultValue={d.value} placeholder='Features Value...' 
                            futurid={d._id} onChange={(e) => {
                                SetdeleteShortDescId(e.currentTarget.getAttribute("futurid"));
                                setShortDescValueUpdate(e.target.value);
                            }}/>
                            <button style={{width:'70px',background:'#339d00'}} onClick={CancelToggle}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00'}} onClick={() => {UpdateFeauter("updateVariations")}} disabled={checkEmptyInput}>Update</button>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>Variations not avilable...</h4>
    }           
         </div>
        </div>
        <h2 style={{margin:'0px auto 15px',fontSize:'20px',color:'#bb8600',width:'240px'}}>Add Product Variations</h2>

                <div className='ProductSpcInner'>
                    <label htmlFor='futurseKey'>
                        <span className='userinfotextdemo'>Key Variations</span>
                        <input type="text" name="futurseKey" placeholder="Features Key..." className='ProductSpcInnerLeft' id="futurseKey" value={shortDescKey.input1}
                        onChange={(e) => handleInputChangeValue(e, 'input1')} />
                    </label>
                    <label htmlFor='futurseValue'>
                        <span className='userinfotextdemo'>Value Variations</span>
                        <input type="text" name="futurseValue" placeholder="Features Value..." className='ProductSpcInnerRight' id="futurseValue" value={shortDescVal.input1}
                        onChange={(e) => handleInputChange(e, 'input1')}
                        onKeyDown={(e) => {submitTodo(e, "setVariations")}}/>
                    </label>
                    <button onClick={() => {getFeuterVal("setVariations")}} disabled={isButtonDisabled('input1')}>{loadingDesc === true ? "Adding..." : "Add"}</button>
                </div>
    </div>
<div className='productShortDescConatiner'>
    <h2 style={{fontSize:'16px',marginBottom:'10px',color:'#bb8600'}}>Key attributes</h2>
        <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading'>
                    <span style={{width:'200px'}}>Product Key</span>
                    <span style={{width:'250px'}}>key value</span>
                    <span style={{width:'40px'}}>Edit</span>
                    <span style={{width:'60px'}}>Delete</span>
                </div>
                {JSON.stringify(shortDescription) !== '{}' && shortDescription?.productShortDescKeyAttributes && 
                    shortDescription.productShortDescKeyAttributes.length > 0  ? shortDescription.productShortDescKeyAttributes.map((d) => (
                         <div className='dbh_productFeuterValue' key={d._id}>
                        <div className='dbh_feauerview'>
                            <span style={{width:'200px'}}>{d.key}</span>
                            <span style={{width:'250px'}}>{d.value}</span>
                            <span style={{width:'40px'}}><EditIcon style={{color:"#25ff00"}} onClick={toggleUpdateAndEdit}/></span>
                            <span style={{width:'60px'}}><DeleteIcon style={{color:"#d70000"}} onClick={(e) => {DeletePopupOn(e, "productShortDescKeyAttributes")}} dataurl={d._id}/></span>
                        </div>
                        <div className='dbh_feauterupdate'>
                            <input style={{width:'200px'}} type='text' name="FeaturesKey" defaultValue={d.key} placeholder='Features Key...' futurid={d._id} onChange={(e) => {    
                                SetdeleteShortDescId(e.currentTarget.getAttribute("futurid"));
                                setShortDescKeyUpdate(e.target.value);
                            }}/>
                            <input style={{width:'250px'}} type='text' name="FeaturesValue" defaultValue={d.value} placeholder='Features Value...' 
                            futurid={d._id} onChange={(e) => {
                                SetdeleteShortDescId(e.currentTarget.getAttribute("futurid"));
                                setShortDescValueUpdate(e.target.value);
                            }}/>
                            <button style={{width:'70px',background:'#339d00'}} onClick={CancelToggle}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00'}} onClick={() => {UpdateFeauter("updateKeyAttrubutes")}} disabled={checkEmptyInput}>Update</button>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>key attributes not avilable...</h4>
    }           
         </div>
        </div>
        <h2 style={{margin:'0px auto 15px',fontSize:'20px',color:'#bb8600',width:'240px'}}>Add Key attributes</h2>

                <div className='ProductSpcInner'>
                    <label htmlFor='futurseKey'>
                        <span className='userinfotextdemo'>Key attributes</span>
                        <input type="text" name="futurseKey" placeholder="Features Key..." className='ProductSpcInnerLeft' id="futurseKey" value={shortDescKey.input2}
                        onChange={(e) => handleInputChangeValue(e, 'input2')} />
                    </label>
                    <label htmlFor='futurseValue'>
                        <span className='userinfotextdemo'>Attributes value</span>
                        <input type="text" name="futurseValue" placeholder="Features Value..." className='ProductSpcInnerRight' id="futurseValue" value={shortDescVal.input2}
                        onChange={(e) => handleInputChange(e, 'input2')}
                        onKeyDown={(e) => {submitTodo(e, "setKeyAttrubutes")}}/>
                    </label>
                    <button onClick={() => {getFeuterVal("setKeyAttrubutes")}} disabled={isButtonDisabled('input2')}>{loadingDesc === true ? "Adding..." : "Add"}</button>
                </div>
    </div>
    <div className='productShortDescConatiner'>
    <h2 style={{fontSize:'16px',marginBottom:'10px',color:'#bb8600'}}>Other attributes</h2>
        <div className='dbh_productFeutersShow'>
            <div className='dbh_productFeuterInner'>
                <div className='dbh_feuterHeading'>
                    <span style={{width:'200px'}}>Product Key</span>
                    <span style={{width:'250px'}}>key value</span>
                    <span style={{width:'40px'}}>Edit</span>
                    <span style={{width:'60px'}}>Delete</span>
                </div>
                {JSON.stringify(shortDescription) !== '{}' && shortDescription?.productShortDescOtherAttributes && 
                    shortDescription.productShortDescOtherAttributes.length > 0  ? shortDescription.productShortDescOtherAttributes.map((d) => (
                    <div className='dbh_productFeuterValue' key={d._id}>
                        <div className='dbh_feauerview'>
                            <span style={{width:'200px'}}>{d.key}</span>
                            <span style={{width:'250px'}}>{d.value}</span>
                            <span style={{width:'40px'}}><EditIcon style={{color:"#25ff00"}} onClick={toggleUpdateAndEdit}/></span>
                            <span style={{width:'60px'}}><DeleteIcon style={{color:"#d70000"}} onClick={(e) => {DeletePopupOn(e, "productShortDescOtherAttributes")}} dataurl={d._id}/></span>
                        </div>
                        <div className='dbh_feauterupdate'>
                            <input style={{width:'200px'}} type='text' name="FeaturesKey" defaultValue={d.key} placeholder='Features Key...' futurid={d._id} onChange={(e) => {    
                                SetdeleteShortDescId(e.currentTarget.getAttribute("futurid"));
                                setShortDescKeyUpdate(e.target.value);
                            }}/>
                            <input style={{width:'250px'}} type='text' name="FeaturesValue" defaultValue={d.value} placeholder='Features Value...' 
                            futurid={d._id} onChange={(e) => {
                                SetdeleteShortDescId(e.currentTarget.getAttribute("futurid"));
                                setShortDescValueUpdate(e.target.value);
                            }}/>
                            <button style={{width:'70px',background:'#339d00'}} onClick={CancelToggle}> Cancel</button>
                            <button style={{width:'70px',background:'#d99b00'}} onClick={() => {UpdateFeauter("updateOtherAttrubutes")}} disabled={checkEmptyInput}>Update</button>
                        </div>
                    </div>
                    ))
                    :
                    <h4 style={{color:'#ccc',textAlign:'center',margin:'15px 0px'}}>Other attributes not avilable...</h4>
    }           
         </div>
        </div>
        <h2 style={{margin:'0px auto 15px',fontSize:'20px',color:'#bb8600',width:'240px'}}>Add Other attributes</h2>

                <div className='ProductSpcInner'>
                    <label htmlFor='futurseKey'>
                        <span className='userinfotextdemo'>Other Attributes</span>
                        <input type="text" name="futurseKey" placeholder="Features Key..." className='ProductSpcInnerLeft' id="futurseKey" value={shortDescKey.input3}
                        onChange={(e) => handleInputChangeValue(e, 'input3')} />
                    </label>
                    <label htmlFor='futurseValue'>
                        <span className='userinfotextdemo'>Attributes Value</span>
                        <input type="text" name="futurseValue" placeholder="Features Value..." className='ProductSpcInnerRight' id="futurseValue" value={shortDescVal.input3}
                        onChange={(e) => handleInputChange(e, 'input3')} onKeyDown={(e) => {submitTodo(e, "setOtherAttrubutes")}}/>
                    </label>
                    <button onClick={() => {getFeuterVal("setOtherAttrubutes")}} disabled={isButtonDisabled('input3')}>{loadingDesc === true ? "Adding..." : "Add"}</button>
                </div>
    </div>
            <div className='showErrorOrSuccess' style={resMsgStyleDesc}>{resMessageDesc}</div>

        </div>
  </div>
  </div>
  )
}

export default ShortDescription