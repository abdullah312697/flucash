import React, { useEffect, useRef, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

function Campaign() {
const [resMessage,setResMessage] = useState("");
const [resMsgStyle,setResMsgStyle] = useState({});
const [isChangeData, setIsChangeData] = useState(true);
const [campgianOriginaValue,setCampgianOriginaValue] = useState({
  BannerHeading:"",
  ProductCurrentPrice:"",
  ProductId:"",
  ProductPreviousPrice:"",
  Style:"",
  campaignEndDate:"",
  isActive:"",
});

const [campgianValue,setCampgianValue] = useState({
  BannerHeading:"",
  ProductCurrentPrice:"",
  ProductId:"",
  ProductPreviousPrice:"",
  Style:"",
  campaignEndDate:"",
  isActive:"",
});

const [loading,setLoading] = useState(false)
const navigate = useNavigate();
const isFirstSet = useRef(false);

useEffect(() => {
  if (campgianValue?.campaignEndDate && !isFirstSet.current) {
    const { campaignEndDate } = campgianValue;
    try {
      // Assuming campaignEndDate is in ISO format "yyyy-MM-dd'T'HH:mm"
      const parsedDate = parseISO(campaignEndDate);
      const formattedDatetime = format(parsedDate, "yyyy-MM-dd'T'HH:mm");

      setCampgianOriginaValue((prevState) => ({
        ...prevState, campaignEndDate: formattedDatetime
      }));
      setCampgianValue((prevState) => ({
        ...prevState, campaignEndDate: formattedDatetime
      }));
      isFirstSet.current = true;
    } catch (error) {
      console.error('Error parsing or formatting date:', error);
    }
  }
}, [campgianValue]);

useEffect(() => {
    Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
      if(res.status === 201 || res.data !== "All"){
        navigate("/newking");
      }
  })
  },[navigate]);

  
useEffect(() => {
  Altaxios.get("banner/getBannerData").then((res) => {
    if(res.status === 200){
      const data = res.data;
        setCampgianValue((prevState)=>({
          ...prevState,
          BannerHeading: data.BannerHeading ?? "",
          ProductCurrentPrice: String(data.ProductCurrentPrice ?? ""),
          ProductId: data.ProductId ?? "",
          ProductPreviousPrice: String(data.ProductPreviousPrice ?? ""),
          Style: data.Style ?? "",
          campaignEndDate: data.campaignEndDate ?? "",
          isActive: String(data.isActive ?? ""),        
        }));
        setCampgianOriginaValue((prevState) => ({
          ...prevState,
          BannerHeading: data.BannerHeading ?? "",
          ProductCurrentPrice: String(data.ProductCurrentPrice ?? ""),
          ProductId: data.ProductId ?? "",
          ProductPreviousPrice: String(data.ProductPreviousPrice ?? ""),
          Style: data.Style ?? "",
          campaignEndDate: data.campaignEndDate ?? "",
          isActive: String(data.isActive ?? ""),        
        }))
    }
  });
},[]);


useEffect(() => {
  const hasChanges = Object.entries(campgianValue).some(
    ([key, value]) => campgianOriginaValue[key] !== value && value !== ""
  );
  setIsChangeData(hasChanges);
}, [campgianValue, campgianOriginaValue]);

//upload product data

    const updateCampaign = async() => {
      setLoading(true);
        await Altaxios.put("banner/updateCampaign",campgianValue).then((res) => {
           if(res.status === 200){
            setCampgianOriginaValue(campgianValue);
            setResMessage(res.data.message);
            setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
            setLoading(false); 
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"});
                setLoading(false); 
            },3000);
           }else{
            setResMessage(res.data);
            setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"})
            },3000)
           }
        });
    };

//upload product data

const setDataForUpdate = (e) => {
  const key = e.target.name;
  const value = e.target.value;
  setCampgianValue((prevState) => ({
    ...prevState,
    [key] : value
  }));
};

  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain">
      <h2 style={{color:'#ccc',fontSize:'22px',marginBottom:'10px'}}>Current Campaign Data</h2>
      {
        Object.keys(campgianValue).length > 0 ? (
          <div className='contactInner'>
          <label htmlFor='BannerHeading'>
              <span className='userinfotextdemo'>Campaign Heading</span>
              <input type="text" name="BannerHeading" value={campgianValue?.BannerHeading} placeholder="Type campaign heading..."  id="BannerHeading" className='contactinput' onChange={setDataForUpdate}/>
          </label>
          <label htmlFor='ProductCurrentPrice'>
              <span className='userinfotextdemo'>Product Current Price</span>
              <input type="text" name="ProductCurrentPrice" value={campgianValue?.ProductCurrentPrice} placeholder="Type Product Current Price..."  id="ProductCurrentPrice" className='contactinput' onChange={setDataForUpdate}/>
          </label>
          <label htmlFor='ProductPreviousPrice'>
              <span className='userinfotextdemo'>Product previous Price</span>
              <input type="text" name="ProductPreviousPrice" value={campgianValue?.ProductPreviousPrice} placeholder="Type Product previous Price..."  id="ProductPreviousPrice" className='contactinput' onChange={setDataForUpdate}/>
          </label>
          <label htmlFor='ProductId'>
              <span className='userinfotextdemo'>Product id</span>
              <input type="text" name="ProductId" value={campgianValue?.ProductId} placeholder="Type your campaign heading..."  id="ProductId" className='contactinput' onChange={setDataForUpdate}/>
          </label>
          <label htmlFor='Style'>
              <span className='userinfotextdemo'>Campaign Style</span>
              <input type="text" name="Style" value={campgianValue?.Style} placeholder="Type your campaign Style..."  id="Style" className='contactinput' onChange={setDataForUpdate}/>
          </label>
          <label htmlFor='campaignEndDate'>
              <span className='userinfotextdemo'>Campaign EndDate</span>
              <input type="datetime-local" name="campaignEndDate"  value={campgianValue.campaignEndDate}  id="campaignEndDate"className='contactinput' onChange={setDataForUpdate}/>
          </label>
          <label htmlFor='isActive'>
              <span className='userinfotextdemo'>Campaign isActive</span>
              <input type="text" name="isActive" placeholder='set isActive true or false' value={campgianValue.isActive}  id="isActive"className='contactinput' onChange={setDataForUpdate}/>
          </label>
              <button className='contactsendbtn'  onClick={updateCampaign} disabled={!isChangeData}>{loading === true ? "Uploading..." : "Upload"}</button>
              <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
          </div>  
        ) : (<h2>Data not available</h2>)
      }
  </div>
  </div>
  )
}

export default Campaign