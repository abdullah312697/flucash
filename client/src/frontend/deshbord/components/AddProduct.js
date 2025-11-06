import React, { useEffect, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import FormData from 'form-data';
import { useNavigate } from 'react-router-dom';

function AddProduct() {
const [porductData,setProductData] = useState({
    ProductName:"",ColorVariant:"",SizeVariant:"",ProductPrice:"",ProductMainHeading:"",PreviousPrice:"",DescountPriceInPercent:"",
    TotalTargetSaleAmount:"",InStockQuentity:"",StartDate:"",EndDate:"",
});
const [productImg,setProductImg] = useState(null);
const [productImgTwo,setProductImgTwo] = useState(null);
const [resMessage,setResMessage] = useState("");
const [resMsgStyle,setResMsgStyle] = useState({});
const [loading,setLoading] = useState(false);

const navigate = useNavigate();

useEffect(() => {
    Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
      if(res.status === 201 || res.data !== "All"){
        navigate("/newking");
      }
  })
},[navigate]);

let isChangeData = true;
if( porductData.ProductName !== "" && 
    porductData.ColorVariant !== "" &&
    porductData.SizeVariant !== "" &&
    porductData.ProductPrice !== "" &&
    porductData.ProductMainHeading !== "" &&
    porductData.PreviousPrice !== "" &&
    porductData.DescountPriceInPercent !== "" &&
    porductData.TotalTargetSaleAmount !== "" &&
    porductData.InStockQuentity !== "" &&
    porductData.StartDate !== "" &&
    porductData.EndDate !== "" &&
    productImg !== null && 
    productImgTwo !== null
){
    isChangeData = false
}else{
    isChangeData = true
}

//preview photos  start
const uploadReviewPhotos = (e) => {
    const preview = document.getElementById("imageViewrlist");
    preview.innerHTML = "";
    let files = e.currentTarget.files[0];
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
//preview photos  start
const uploadReviewPhotosTwo = (e) => {
    const preview = document.getElementById("imageViewrlistTwo");
    preview.innerHTML = "";
    let files = e.currentTarget.files[0];
    if(files){
    setProductImgTwo(files);
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
let formdataAddProduct = new FormData();
formdataAddProduct.append("FrontImage", productImg);
formdataAddProduct.append("BackImage", productImgTwo);
formdataAddProduct.append("ProductName", porductData["ProductName"]);
formdataAddProduct.append("ColorVariant", porductData["ColorVariant"]);
formdataAddProduct.append("SizeVariant", porductData["SizeVariant"]);
formdataAddProduct.append("ProductPrice", porductData["ProductPrice"]);
formdataAddProduct.append("ProductMainHeading", porductData["ProductMainHeading"]);
formdataAddProduct.append("PreviousPrice", porductData["PreviousPrice"]);
formdataAddProduct.append("DescountPriceInPercent", porductData["DescountPriceInPercent"]);
formdataAddProduct.append("TotalTargetSaleAmount", porductData["TotalTargetSaleAmount"]);
formdataAddProduct.append("InStockQuentity", porductData["InStockQuentity"]);
formdataAddProduct.append("StartDate", porductData["StartDate"]);
formdataAddProduct.append("EndDate",  porductData["EndDate"]);

//upload product data
const cloudinaryFolderName = "currentProduct";
    const AddProducts = async() => {
        setLoading(true);
        const preview = document.getElementById("imageViewrlist");
        const previewTwo = document.getElementById("imageViewrlistTwo");
        await Altaxios.post(`addproduct/singleProduct/${encodeURIComponent(cloudinaryFolderName)}`,formdataAddProduct,
        {headers: {'Content-Type': 'multipart/form-data',}}).then((res) => {
           if(res.status === 200){
            setResMessage(res.data.message);
            setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
            setLoading(false);
            formdataAddProduct = new FormData();
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"});
                preview.innerHTML = "";
                previewTwo.innerHTML = "";
                setProductData({
                    ProductName:"",ProductPrice:"", PreviousPrice:"", TotalTargetSaleAmount:"",InStockQuentity:"",StartDate:"",EndDate:"",
                });
                setProductImg(null);
                setProductImgTwo(null);
                navigate('/newking/mycurrentproducts');
            },3000);
           }else{
            setResMessage(res.data.message);
            setResMsgStyle({color:"red",opacity:1,marginTop:"15px",});
            setLoading(false);
            setTimeout(() => {
                setResMsgStyle({opacity:0,marginTop:"0px"})
            },3000);
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
            <span className='userinfotextdemo'>Product Name</span>
            <input type="text" name="ProductName" value={porductData.ProductName} placeholder="Type Prduct Name"  id="productName" onChange={prductDataSet} className='contactinput'/>
        </label>

        <div className='addreviewsImageContainerOne'>
                <label htmlFor='ProductImg' className='addreviewimg addreviewimgOne'>
                  Select Front Image
                  <input  name="ProductImg" type='file' id="ProductImg" multiple={false} onChange={uploadReviewPhotos}/>
                </label>
               <div id="imageViewrlist">

               </div>
        </div>
        <div className='addreviewsImageContainerOne'>
                <label htmlFor='ProductImgTwo' className='addreviewimg addreviewimgOne'>
                  Select Back Image
                  <input  name="ProductImgTwo" type='file' id="ProductImgTwo" multiple={false} onChange={uploadReviewPhotosTwo}/>
                </label>
               <div id="imageViewrlistTwo">

               </div>
        </div>
        <label htmlFor='ColorVariant'>
            <span className='userinfotextdemo'>Color Variant</span>
            <input type="number" name="ColorVariant"  value={porductData.ColorVariant} placeholder="Color Variant..."  id="ColorVariant" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='SizeVariant'>
            <span className='userinfotextdemo'>Size Variant</span>
            <input type="number" name="SizeVariant"  value={porductData.SizeVariant} placeholder="Size Variant..."  id="SizeVariant" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='ProductPrice'>
            <span className='userinfotextdemo'>Product Price</span>
            <input type="number" name="ProductPrice"  value={porductData.ProductPrice} placeholder="Product Price..."  id="ProductPrice" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='ProductMainHeading'>
            <span className='userinfotextdemo'>Product main Heading</span>
            <input type="text" name="ProductMainHeading"  value={porductData.ProductMainHeading} placeholder="Product main Heading..."  id="ProductMainHeading" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='PreviousPrice'>
            <span className='userinfotextdemo'>Previous Price</span>
            <input type="number" name="PreviousPrice"  value={porductData.PreviousPrice} placeholder="Product Previous Price..."  id="PreviousPrice" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='DescountPriceInPercent'>
            <span className='userinfotextdemo'>Discount Price</span>
            <input type="number" name="DescountPriceInPercent"  value={porductData.DescountPriceInPercent} placeholder="Product Discount Price in%..."  id="DescountPriceInPercent" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='TotalTargetSaleAmount'>
            <span className='userinfotextdemo'>Target Amount</span>
            <input type="number" name="TotalTargetSaleAmount"  value={porductData.TotalTargetSaleAmount} placeholder="Target Sale Amount..."  id="TotalTargetSaleAmount" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='InStockQuentity'>
            <span className='userinfotextdemo'>Product Quentity</span>
            <input type="number" name="InStockQuentity"  value={porductData.InStockQuentity} placeholder="Product Quentity..."  id="InStockQuentity" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='StartDate'>
            <span className='userinfotextdemo'>Starting date</span>
            <input type="date" name="StartDate"  value={porductData.StartDate}  id="StartDate" onChange={prductDataSet} className='contactinput'/>
        </label>
        <label htmlFor='EndDate'>
            <span className='userinfotextdemo'>End date</span>
            <input type="date" name="EndDate"  value={porductData.EndDate}  id="EndDate" onChange={prductDataSet} className='contactinput'/>
        </label>

            <button className='contactsendbtn' onClick={AddProducts} disabled={isChangeData}>{loading ? "Uploading..." : "Upload"}</button>

            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  </div>
  </div>
  )
}

export default AddProduct