import React, { useEffect, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import FormData from 'form-data';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';


function ProductUpdate({data}) {
const [porductData,setProductData] = useState({
    ProductName:"",ProductPrice:"",ProductMainHeading:"",PreviousPrice:"",DescountPriceInPercent:"",
    TotalTargetSaleAmount:"",InStockQuentity:"",StartDate:"",EndDate:"",
});
const [productImg,setProductImg] = useState(null);
const [resMessage,setResMessage] = useState("");
const [resMsgStyle,setResMsgStyle] = useState({});
const [imageSrc,setImageSrc] = useState(null);
const [loading,setLoading] = useState(false);
const navigate = useNavigate();

useEffect(() => {
    Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
    if(res.status === 201 || res.data !== "All"){
        navigate("/newking");
    }
})
},[navigate]);

let productId = data && data._id;

useEffect(() => {
    if (data) {
        setProductData({
            ProductName: data.ProductName ?? "",
            ProductPrice: data.ProductPrice ?? "",
            ProductMainHeading: data.ProductMainHeading ?? "",
            PreviousPrice: data.PreviousPrice ?? "",
            DescountPriceInPercent: data.DescountPriceInPercent ?? "",
            TotalTargetSaleAmount: data.TotalTargetSaleAmount ?? "",
            InStockQuentity: data.InStockQuentity ?? "",
            StartDate: data.StartDate !== undefined ? format(data.StartDate, 'yyyy-MM-dd') : "",
            EndDate: data.EndDate !== undefined ? format(data.EndDate, 'yyyy-MM-dd') : "",
        });
        setImageSrc(data?.FrontImage?.image);
    }
}, [data]);

let isChangeData = true;

if(data){
if(
    (porductData.ProductName !== "" && porductData.ProductName === data.ProductName) &&
   (porductData.ProductPrice !== "" && Number(porductData.ProductPrice) === Number(data.ProductPrice)) &&
   (porductData.ProductMainHeading !== "" && porductData.ProductMainHeading === data.ProductMainHeading) &&
   (porductData.PreviousPrice !== "" && Number(porductData.PreviousPrice) === Number(data.PreviousPrice)) &&
   (porductData.DescountPriceInPercent !== "" && Number(porductData.DescountPriceInPercent) === Number(data.DescountPriceInPercent)) &&
    (porductData.TotalTargetSaleAmount !== "" && Number(porductData.TotalTargetSaleAmount) === Number(data.TotalTargetSaleAmount)) &&
    (porductData.InStockQuentity !== "" && Number(porductData.InStockQuentity) === Number(data.InStockQuentity)) &&
    (porductData.StartDate !== "" && porductData.StartDate === format(data.StartDate,'yyyy-MM-dd')) && 
    (porductData.EndDate !== "" && porductData.EndDate === format(data.EndDate,'yyyy-MM-dd')) && productImg === null
){
    isChangeData = true;
}else{
    isChangeData = false;
}
}
//preview photos  start
const uploadReviewPhotos = (e) => {
    let files = e.currentTarget.files[0];
    if(files){
    setProductImg(files);
    function readAndPreview(file) {
      if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            setImageSrc(reader.result)
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
const prductDataSet = (e) => {
    let data = e.target.value;
    let name = e.target.name;
    setProductData({
        ...porductData,
        [name] : data,
    });
};

//set product data end

let formdata = new FormData();
if(data){
if(productImg !== null){
    formdata.append("file", productImg);
}
if(porductData["ProductName"] !== "" && porductData["ProductName"] !== data.ProductName){
    formdata.append("ProductName", porductData["ProductName"]);
}
if(porductData["ProductPrice"] !== "" && porductData["ProductPrice"] !== data.ProductPrice){
    formdata.append("ProductPrice", porductData["ProductPrice"]);
}
if(porductData["ProductMainHeading"] !== "" && porductData["ProductMainHeading"] !== data.ProductMainHeading){
    formdata.append("ProductMainHeading", porductData["ProductMainHeading"]);
}
if(porductData["PreviousPrice"] !== "" && porductData["PreviousPrice"] !== data.PreviousPrice){
    formdata.append("PreviousPrice", porductData["PreviousPrice"]);
}
if(porductData["DescountPriceInPercent"] !== "" && porductData["DescountPriceInPercent"] !== data.DescountPriceInPercent){
    formdata.append("DescountPriceInPercent", porductData["DescountPriceInPercent"]);
}
if(porductData["TotalTargetSaleAmount"] !== "" && porductData["TotalTargetSaleAmount"] !== data.TotalTargetSaleAmount){
    formdata.append("TotalTargetSaleAmount", porductData["TotalTargetSaleAmount"]);
}
if(porductData["InStockQuentity"] !== "" && porductData["InStockQuentity"] !== data.InStockQuentity){
    formdata.append("InStockQuentity", porductData["InStockQuentity"]);
}
if(porductData["StartDate"] !== "" && porductData["StartDate"] !== format(data.StartDate,'yyyy-MM-dd')){
    formdata.append("StartDate", porductData["StartDate"]);
}
if(porductData["EndDate"] !== "" && porductData["EndDate"] !== format(data.EndDate,'yyyy-MM-dd')){
    formdata.append("EndDate", porductData["EndDate"]);
}
}
//upload product data
const cloudinaryFolderName = "currentProduct";
    const AddProducts = async() => {
        setLoading(true);
        await Altaxios.put(`addproduct/singleProductUpdate/${cloudinaryFolderName}/${productId}`,formdata,
        {
            headers: {"Content-Type": "multipart/form-data"}
        }).then((res) => {
           if(res.status === 200){
            const updData = res.data.data;
            if(updData){
                setProductData({
                    ProductName: updData.ProductName,
                    ProductPrice: updData.ProductPrice,
                    ProductMainHeading: updData.ProductMainHeading,
                    PreviousPrice: updData.PreviousPrice,
                    DescountPriceInPercent: updData.DescountPriceInPercent,
                    TotalTargetSaleAmount: updData.TotalTargetSaleAmount,
                    InStockQuentity: updData.InStockQuentity,
                    StartDate: format(updData.StartDate, 'yyyy-MM-dd'),
                    EndDate: format(updData.EndDate, 'yyyy-MM-dd'),
                });
                setImageSrc(updData?.FrontImage?.image);    
            }
            formdata = new FormData();
            setResMessage(res.data.message);
            setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
            setLoading(false);
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"});
                setProductImg(null);
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

//upload product data
  return (
    <div className="contactContainerMain_DBH">
    <div className="contactinnerMain">
        <h2>Add your Product</h2>
    <div className='contactInner'>
        <label htmlFor='productName'>
            <span className='userinfotextdemo' style={{display:"block"}}>Product Name</span>
            <input type="text" name="ProductName" value={porductData.ProductName} placeholder="Type Prduct Name"  id="productName" onChange={prductDataSet} className='contactinput'/>
        </label>

        <div className='addreviewsImageContainerOne'>
                <label htmlFor='ProductImg' className='addreviewimg addreviewimgOne'>
                  Change Product Image
                  <input  name="ProductImg" type='file' id="ProductImg" multiple={false} onChange={uploadReviewPhotos}/>
                </label>
               <div id="imageViewrlist">
                 {imageSrc &&  <img src={imageSrc} alt="imagePreview" className='productPreviwstyle'/> }
               </div>
        </div>
        <label htmlFor='ProductPrice'>
            <span className='userinfotextdemo' style={{display:"block"}}>Product Price</span>
            <input type="number" name="ProductPrice" value={porductData.ProductPrice} placeholder="Product Price..."  id="ProductPrice" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='ProductMainHeading'>
            <span className='userinfotextdemo' style={{display:"block"}}>Product Main Heading</span>
            <input type="text" name="ProductMainHeading" value={porductData.ProductMainHeading} placeholder="Product Main Heading..."  id="ProductMainHeading" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='PreviousPrice'>
            <span className='userinfotextdemo' style={{display:"block"}}>Previous Price</span>
            <input type="number" name="PreviousPrice" value={porductData.PreviousPrice} placeholder="Product Previous Price..."  id="PreviousPrice" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='DescountPriceInPercent'>
            <span className='userinfotextdemo' style={{display:"block"}}>Discount Price</span>
            <input type="number" name="DescountPriceInPercent" value={porductData.DescountPriceInPercent} placeholder="Product Discount Price in%..."  id="DescountPriceInPercent" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='TotalTargetSaleAmount'>
            <span className='userinfotextdemo' style={{display:"block"}}>Target Amount</span>
            <input type="number" name="TotalTargetSaleAmount" value={porductData.TotalTargetSaleAmount}  placeholder="Target Sale Amount..."  id="TotalTargetSaleAmount" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='InStockQuentity'>
            <span className='userinfotextdemo' style={{display:"block"}}>Product Quentity</span>
            <input type="number" name="InStockQuentity"  value={porductData.InStockQuentity} placeholder="Product Quentity..."  id="InStockQuentity" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='StartDate'>
            <span className='userinfotextdemo' style={{display:"block"}}>Starting date</span>
            <input type="date" name="StartDate" value={porductData.StartDate}   id="StartDate" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='EndDate'>
            <span className='userinfotextdemo' style={{display:"block"}}>End date</span>
            <input type="date" name="EndDate" value={porductData.EndDate}   id="EndDate" onChange={prductDataSet} className='contactinput'/>
        </label>

            <button className='contactsendbtn updateButtonToggle' onClick={AddProducts} disabled={isChangeData}>{loading ? "Uploading..." : "Upload"}</button>

            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default ProductUpdate