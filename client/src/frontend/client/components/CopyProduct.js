import React, { useState,useRef, useEffect } from 'react'
import back4 from '../../../images/productbg/pbg1.jpg';
import male from '../../../images/profile/male.png'
import female from '../../../images/profile/female.png'
import { Link, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {Altaxios} from '../../Altaxios';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FormData from 'form-data';
import { format } from 'date-fns';
import { trackPageView, trackAddToCart, trackCustomizeProduct } from '../../../js/trackEvents';
import useDebounce from './useDebounce'; 

function Product() {
const { productId } = useParams();
const [productsData,setProductsData] = useState({});
const [quentity,setQuentity] = useState(0);
const [currentState,setCurrentState] = useState(0);
const [starpositin,setStarpositin] = useState("");
const [starText,setStarText] = useState("");
const [reviewImages,setReviewImages] = useState([]);
const [reviewComment,setReviewComment] = useState("");
const [resMessage,setResMessage] = useState("");
const [resMsgStyle,setResMsgStyle] = useState({});
const [loading,setLoading] = useState(false);
const [bagImg,setBagImg] = useState([]);
const [colorItemRef,setColorItemRef] = useState([]);
const [allReviews,setAllReviews] = useState([]);
const [userData,setUserData] = useState({});
const [isReview,setIsReview] = useState("nologin");
const [currentColorIdView,setCurrentColorIdView] = useState("");
const [productForBuy, setProductForBuy] = useState({
  productId: "",
  productName:"",
  customerId:"",
  totalQuentity: 0,
  productPrice: 0,
  totalPrice: 0,
  Discount: 0,
  grandTotal: 0,
  colorOfQuentity: [],
});

  //facebook pixle event<>
  useEffect(() => {
    const pageData = {
              page_title: document.title,
              page_path: window.location.pathname,
              page_url: window.location.href,
    };
      trackPageView(pageData);
    }, []);
  //facebook pixle event</>

useEffect(() => {
  Altaxios.get(`/addproduct/SinglePublicProduct/${productId}`).then((res) => {
      if(res.status === 200){
          setProductsData(res.data)
      }
  })
},[productId]);

let reviewData = new FormData();
let isChangeData = true;
let countQuentity = useRef(0);
let currentColor = useRef(0);
let setcolorIterm = {};
const containerRef = useRef(null);
const imageRef = useRef(null);
if(starpositin !== "" && starText !== "" && 
  reviewImages.length > 0 && reviewComment !== ""
){
  isChangeData = false;
}else{
  isChangeData = true;
};

useEffect(() => {
  Altaxios.get(`/review/getAllRevies/${productId}`).then((res) => {
    if(res.status === 200){
      setAllReviews(res.data)
    }
});
Altaxios.get("/users/userProfileData").then((res) => {
  if(res.status === 200){
      setUserData(res.data)
  }
});
},[productId,starpositin]);

useEffect(() => {
  if(JSON.stringify(userData) !== '{}' && allReviews.length > 0){
    const checkReview = allReviews.some(preview => preview.customerId === userData._id);
    if(checkReview){
      setIsReview("hasdata")
    }else{
      setIsReview("nodata")
    }
  }
  if(JSON.stringify(userData) !== '{}' && allReviews.length === 0){
    setIsReview("nodata")
  }
},[userData,allReviews]);

if(JSON.stringify(userData) !== '{}'){
  userData._id && reviewData.append("customerId",userData._id);
  userData.fullname && reviewData.append("customerName",userData.fullname);
  userData.gender && reviewData.append("customerGender",userData.gender);
};


    const checkData = Object.keys(productsData).length > 0;
    const oneTimeSetData = useRef(false);
    let i = 0;
    if(oneTimeSetData.current !== true && checkData && productsData.ProductColors){
      setBagImg(productsData.ProductColors)
      while(i < productsData.ProductColors.length){
        setcolorIterm = {...setcolorIterm,["bag"+i] : 0}
          i++;
        }
          oneTimeSetData.current = true
          setColorItemRef(setcolorIterm)
    };

    useEffect(() => {
    let selectedImg = document.getElementById(0);
    if(selectedImg !== undefined && selectedImg !== null && selectedImg !== ""){
      const chiled = selectedImg.children[1];
      chiled.classList.add("selectedImageColor");
    }
  },[productsData]);
  
  const bagLength = bagImg.length;
  const productPrice = (checkData && productsData.ProductPrice ? productsData.ProductPrice : 0);
  const productName = (checkData && productsData.ProductName ? productsData.ProductName : "");
  const PreviousPrice = (checkData && productsData.PreviousPrice ? productsData.PreviousPrice : 0);
  const maxCuentity = (checkData && productsData.InStockAvailableQuentity ? productsData.InStockAvailableQuentity : 1);
  const Discountprice = 100;
  const discountPercentage = (checkData && productsData.DescountPriceInPercent ? productsData.DescountPriceInPercent : 0);
  const totalPrice = Number(quentity * productPrice);
  const Discount = Number((totalPrice * discountPercentage) / Discountprice);
  const grandTotal = Number(totalPrice - Discount);
  //update state
  // const updateProductForBuy = () => {
  //   const currentColorId = bagLength > 0 && bagImg[currentState]?._id ? bagImg[currentState]._id : 0;
  //   const currentColorQuentity = colorItemRef[`bag${currentState}`];
  //   setProductForBuy(prevState => {  
  //     const existingColorIndex = prevState.colorOfQuentity.findIndex(
  //       item => item.colorId === currentColorId
  //     );
    
  //     let updatedColorOfQuentity;
  //     if (existingColorIndex !== -1) {
  //       // Update the existing object
  //       updatedColorOfQuentity = prevState.colorOfQuentity.map((item, index) => 
  //         index === existingColorIndex 
  //         ? { ...item, colorQuentity: currentColorQuentity, size:{}}
  //         : item
  //       );
  //     } else {
  //       // Add a new object
  //       updatedColorOfQuentity = [
  //         ...prevState.colorOfQuentity,
  //         {
  //           colorId: currentColorId,
  //           colorImg: bagLength > 0 && bagImg[currentState]?.colorImage ? bagImg[currentState].colorImage : "",
  //           colorName: bagLength > 0 && bagImg[currentState]?.colorName ? bagImg[currentState].colorName : "",
  //           colorQuentity: currentColorQuentity,
  //           size:{}
  //         },
  //       ];
  //     };
    
  //     // Filter out objects with colorQuentity === 0
  //     updatedColorOfQuentity = updatedColorOfQuentity.filter(item => item.colorQuentity !== 0 && item.colorQuentity !== undefined);
    
  //     const newTotalQuentity = updatedColorOfQuentity.reduce(
  //       (sum, item) => sum + (item.colorQuentity || 0),
  //       0
  //     );
  //     const newtotalPrice = newTotalQuentity > 0 ? Number(newTotalQuentity * productPrice) : 0;
  //     const newDiscount = newtotalPrice > 0 ? Number((newtotalPrice * discountPercentage) / Discountprice) : 0;
  //     const newgrandTotal = Number(newtotalPrice - newDiscount);


  //     return {
  //       ...prevState,
  //       productId: productId || prevState.productId,
  //       productName: productName || prevState.productName,
  //       customerId: userData._id || prevState.customerId,
  //       totalQuentity: newTotalQuentity,
  //       productPrice: productPrice || prevState.productPrice,
  //       totalPrice: newtotalPrice,
  //       Discount: newDiscount,
  //       grandTotal: newgrandTotal,
  //       colorOfQuentity: updatedColorOfQuentity,
  //     };
  //   });  
  // };
  //update state
  const updateProductForBuy = (size, quantityChange) => {
    const currentColorId = bagLength > 0 && bagImg[currentState]?._id ? bagImg[currentState]._id : 0;
    setCurrentColorIdView(currentColorId);
    setProductForBuy(prevState => {
      const existingColorIndex = prevState.colorOfQuentity.findIndex(
        item => item.colorId === currentColorId
      );
      let updatedColorOfQuentity;
      if (existingColorIndex !== -1) {
        // Update the existing object
        updatedColorOfQuentity = prevState.colorOfQuentity.map((item, index) => {
          if (index === existingColorIndex) {
            const updatedSize = {
              ...item.size,
              [size]: (item.size[size] || 0) + quantityChange
            };
            // Remove size if quantity is 0 or less
            if (updatedSize[size] <= 0) {
              delete updatedSize[size];
            }
  
            return { 
              ...item, 
              colorQuentity: Object.values(updatedSize).reduce((sum, qty) => sum + qty, 0),
              size: updatedSize
            };
          }
          return item;
        });
      } else {
        // Add a new object with the selected size
        const newSize = { [size]: Math.max(quantityChange, 0) };
        updatedColorOfQuentity = [
          ...prevState.colorOfQuentity,
          {
            colorId: currentColorId,
            colorImg: bagLength > 0 && bagImg[currentState]?.colorImage ? bagImg[currentState].colorImage : "",
            colorName: bagLength > 0 && bagImg[currentState]?.colorName ? bagImg[currentState].colorName : "",
            colorQuentity: Math.max(quantityChange, 0),
            size: newSize
          },
        ];
      }
  
      // Filter out objects with total color quantity === 0
      updatedColorOfQuentity = updatedColorOfQuentity.filter(item => item.colorQuentity > 0);
  
      const newTotalQuentity = updatedColorOfQuentity.reduce(
        (sum, item) => sum + (item.colorQuentity || 0),
        0
      );
      const newtotalPrice = newTotalQuentity > 0 ? Number(newTotalQuentity * productPrice) : 0;
      const newDiscount = newtotalPrice > 0 ? Number((newtotalPrice * discountPercentage) / Discountprice) : 0;
      const newgrandTotal = Number(newtotalPrice - newDiscount);
  
      return {
        ...prevState,
        productId: productId || prevState.productId,
        productName: productName || prevState.productName,
        customerId: userData._id || prevState.customerId,
        totalQuentity: newTotalQuentity,
        productPrice: productPrice || prevState.productPrice,
        totalPrice: newtotalPrice,
        Discount: newDiscount,
        grandTotal: newgrandTotal,
        colorOfQuentity: updatedColorOfQuentity,
      };
    });
  };
  
//add to cart<>  
  const addtoCart = () => {
    localStorage.setItem(String(productId),JSON.stringify(productForBuy));
    trackAddToCart({
      price : productForBuy.productPrice,
      name:productForBuy.productName,
      category:'Fashion > Accessories > Women\'s Accessories > Handbags',
      id:productForBuy.productId,
      quantity:productForBuy.totalQuentity,
    });    
  };
//add to cart</>  
const setCustomerReview = async() => {
  for (let i = 0; i < reviewImages.length; i++) {
    reviewData.append('files', reviewImages[i]);
  }
  reviewData.append("ratingPoints",starpositin);
  reviewData.append("ratingText",starText);
  reviewData.append("comments",reviewComment);
  setLoading(true);
  const preview = document.getElementById("imageViewrlist");
  const CloudinaryFoldername = 'reviewImages'
  const star = document.querySelectorAll(".starinActive");
  const textshow = document.getElementById("starRatingTextshow");
  try{
    await Altaxios.post(`/review/customerReview/${productId}/${CloudinaryFoldername}`,reviewData,{headers: {'Content-Type': 'multipart/form-data',}}).then((res) => {
      if(res.status === 200){
        setResMessage(res.data.message);
        setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
        setLoading(false);
        for(let i = 0; i <= star.length-1 ; i++){
          star[i].classList.remove("starFixStyle");
        }
        textshow.innerHTML = "";
        reviewData = new FormData();
        setTimeout(() => {
            preview.innerHTML = "";
            setStarpositin("");
            setStarText("");
            setReviewImages([]);
            setReviewComment("")
            setResMsgStyle({opacity:0,marginTop:"0px"});
        },3000);
       }else{
        setResMessage(res.data.message);
        setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
        setTimeout(() => {
            setResMsgStyle({opacity:0,marginTop:"0px"})
        },3000);
       }
  
    });  
  }catch(e){
    console.log(e)
  }
};

const imageStyle = {
  backgroundImage:`url(${back4})`,
  width:"100%",
  height:"100%",
  backgroundPosition:"center",
  backgroundSize:'cover',
  margin:'0px 10px',
  overflow: "hidden",
  cursor: "zoom-in",
  zIndex:1,
  borderRadius: "6px",
  touchAction: "pinch-zoom",
};

const updateCurrentState = (currentState, bagLength, direction) => {
  if (direction === 'decrement') {
      const isFirstItem = currentState === 0;
      return isFirstItem ? bagLength - 1 : currentState - 1;
  } else if (direction === 'increment') {
      const isLastItem = currentState === bagLength - 1;
      return isLastItem ? 0 : currentState + 1;
  }
  return currentState; // Fallback in case of an unexpected direction
};

const goToPrev = () => {
  const colorname = document.getElementById("colorNameChange");
  const ifAvailable = document.querySelector(".selectedImageColor");
  if(ifAvailable){
    ifAvailable.classList.remove("selectedImageColor")
  }
const newCurrentState = updateCurrentState(currentState, bagLength, 'decrement');
  setCurrentState(newCurrentState);
  currentColor.current = newCurrentState;
  let selectedImg = document.getElementById(currentColor.current);
  if(selectedImg){
    selectedImg.children[1].classList.add("selectedImageColor");
  }
  colorname.innerHTML = bagLength > 0 && bagImg[currentState]?.colorName ? bagImg[currentState].colorName  : "";
  const currentColorId = bagLength > 0 && bagImg[currentState]?._id ? bagImg[currentState]._id : 0;
  setCurrentColorIdView(currentColorId);
};

const goToNext = () => {
  const colorname = document.getElementById("colorNameChange");
  const ifAvailable = document.querySelector(".selectedImageColor");
  if(ifAvailable){
    ifAvailable.classList.remove("selectedImageColor");
  }
const newCurrentState = updateCurrentState(currentState, bagLength, 'increment');
setCurrentState(newCurrentState);
  currentColor.current = newCurrentState;
  let selectedImg = document.getElementById(currentColor.current);
  if(selectedImg){
    selectedImg.children[1].classList.add("selectedImageColor");
  }
  colorname.innerHTML = bagLength > 0 && bagImg[currentState]?.colorName ? bagImg[currentState].colorName : "";
  const currentColorId = bagLength > 0 && bagImg[currentState]?._id ? bagImg[currentState]._id : 0;
  setCurrentColorIdView(currentColorId);
};

//inside all function for img Zoomin<>
const Zoomin = (e) => {
  const img = document.querySelector(".zoomabelImage");
  if(img){
    img.classList.add("zoomabelImagestyle");
  }
  let ClientX = e.clientX;
  let ClientY = e.clientY;
  const mainRect = e.currentTarget.getBoundingClientRect();
  let X = ClientX - mainRect.x;
  let Y = ClientY - mainRect.y;
  if(img){
    img.style.transformOrigin = `${X}px ${Y}px`;
  }
};

const Zoomout = () => {
  const img = document.querySelector(".zoomabelImage");
  if(img){
    img.classList.remove("zoomabelImagestyle");
  }
};
//image zooming for touch start<>

// Handle touch move start<>
const handleTouchMove = (e) => {
  let ClientX = e.touches[0].clientX;
  let ClientY = e.touches[0].clientY;
  const mainRect = containerRef.current.getBoundingClientRect();
  let X = ClientX - mainRect.x;
  let Y = ClientY - mainRect.y;
  imageRef.current.classList.add("zoomabelImagestyle");
  imageRef.current.style.transformOrigin = `${X}px ${Y}px`;
};
// Handle touch move start</>

//inside all function for img Zoomin</>
const changeColor = (e) => {
  const colorNameElement = document.getElementById("colorNameChange");
  const selectedImageColorElement = document.querySelector(".selectedImageColor");
  const index = parseInt(e.currentTarget.id, 10); // Ensure index is a number
  if (selectedImageColorElement) {
    selectedImageColorElement.classList.remove("selectedImageColor");
  }
  e.currentTarget.children[1].classList.add("selectedImageColor");
  setCurrentState(index);
  const currentState = index; // Use the index directly as the new state
  const colorName = (bagImg && bagImg[currentState] && bagImg[currentState].colorName) ? bagImg[currentState].colorName : "";
  colorNameElement.innerHTML = bagLength > 0 ? colorName : "";
  const currentColorId = bagLength > 0 && bagImg[currentState]?._id ? bagImg[currentState]._id : 0;
  setCurrentColorIdView(currentColorId);
};

//fb addTo wishlist<>
const DebounceAction = useDebounce(() => {
  trackCustomizeProduct(
    {
      price:productForBuy.productPrice,
      name:productForBuy.productName,
      category:"Fashion > Accessories > Women's Accessories > Handbags",
      id: productForBuy.productId,
      quantity: quentity,
      customizationDetails:"The customer increased the quantity, indicating a potential purchase.",  
    }
  );  
}, 5000);
//fb addTo wishlist</>

const Incriment = (size) => {
  const buybtn = document.querySelector(".buyNowbtntwo");
  const spanIndex = document.getElementById("colorName"+currentState);
  if(Number(quentity) < maxCuentity){
    setQuentity(prevQuentity => prevQuentity + 1);
    countQuentity.current += 1;
    colorItemRef[`bag${currentState}`] = (Number(colorItemRef[`bag${currentState}`]) + 1);
    if(spanIndex){
      spanIndex.innerHTML = "<sub>X</sub>" + colorItemRef[`bag${currentState}`];
    }
  }
  if(colorItemRef[`bag${currentState}`] === 0){
    if(spanIndex){
      spanIndex.innerHTML = "";
    }
  }
if(countQuentity.current === 0){
  buybtn.setAttribute("disabled",true);
}else{
  buybtn.removeAttribute("disabled");
}
updateProductForBuy(size, 1);
DebounceAction();
};

const Decriment = (size, items) => {
  if(items > 0){
  const spanIndex = document.getElementById("colorName"+currentState);
  const buybtn = document.querySelector(".buyNowbtntwo");
  if(colorItemRef[`bag${currentState}`] > 0){
    setQuentity(Number(quentity) - 1);
    countQuentity.current -= 1;
    colorItemRef[`bag${currentState}`] = (Number(colorItemRef[`bag${currentState}`]) - 1);
    if(spanIndex){
      spanIndex.innerHTML = "<sub>X</sub>" + colorItemRef[`bag${currentState}`];
    }
  }
  if(colorItemRef[`bag${currentState}`] === 0){
    if(spanIndex){
      spanIndex.innerHTML = "";
    }
  }
  if(countQuentity.current === 0){
    buybtn.setAttribute("disabled",true);
  }else{
    buybtn.removeAttribute("disabled");
  }  
  updateProductForBuy(size, -1);
  DebounceAction();
}
};


const starColor = (e) => {
  const star = document.querySelectorAll(".starinActive");
  const length = (star.length - 1);
  const position = e.currentTarget.getAttribute("value");
  const textshow = document.getElementById("starRatingTextshow");
  let text = e.currentTarget.getAttribute("text");
  setStarpositin(position);
  setStarText(text);
  for(let i = 0; i <= position; i++){
    star[i].classList.add("starFixStyle");
  }
  let newPosition = Number(position) + 1;
  for(let i = newPosition; i <= length; i++){
    star[i].classList.remove("starFixStyle");
  }
  textshow.innerHTML = text;
};

const uploadReviewPhotos = (e) => {
  const preview = document.getElementById("imageViewrlist");
  preview.innerHTML = "";
  let files = e.currentTarget.files;
  setReviewImages([]);
  function readAndPreview(file) {
    // Make sure `file.name` matches our extensions criteria
    if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          const image = new Image();
          image.className = "imagePreviwstyle";
          image.title = file.name;
          image.src = reader.result;
          preview.appendChild(image);
        },
        false,
      );

      reader.readAsDataURL(file);
    }
  };
  let imageContainer = [];
  let mintarget = 0;
  let targetmax = files.length < 4 ? files.length : 4;
  while(mintarget < targetmax){
    readAndPreview(files[mintarget]);
    imageContainer.push(files[mintarget]);
    mintarget++
  }
  setReviewImages(imageContainer);
};


const rateTextChange = (e) => {
  const textshow = document.getElementById("starRatingTextshow");
  let text = e.currentTarget.getAttribute("text");
  textshow.innerHTML = text;
};
const rateTextFixed = (e) => {
  const star = document.querySelectorAll(".starinActive");
  const textshow = document.getElementById("starRatingTextshow");
  if(starpositin !== ""){
    let text = star[starpositin].getAttribute("text");
    textshow.innerHTML = text;  
  }else{
    textshow.innerHTML = "";  
  }
};
const showCustomer = () => {
  const showCustomer = document.querySelector(".allReviewContainer");
  const addReview = document.querySelector(".customerReviwAllContainer");
  if(showCustomer){
    showCustomer.style.display = "block";
  }
  if(addReview){
    addReview.style.display = "none";
  }
};
const addReview = () => {
  const showCustomer = document.querySelector(".allReviewContainer");
  const addReview = document.querySelector(".customerReviwAllContainer");
  if(showCustomer){
    showCustomer.style.display = "none";
  }
  if(addReview){
    addReview.style.display = "block";
  }
};


  return (
    <div className='ProductPageMain'>
              <Link to="/" className='arrowback_a'><ArrowBackIcon className='arrowbackIcon'/></Link>
        <div className='productSelection'>
            <div className='ProductImages'>
            <div className='imgslider'>
              <div className='arrowStyle' onClick={goToPrev}>〈 </div>
              <div ref={containerRef} style={imageStyle}
                onMouseMove={Zoomin} 
                onMouseLeave={Zoomout}
                onTouchStart={handleTouchMove}
                onMouseUp={Zoomout}
                onTouchEnd={Zoomout}          
                onTouchMove={handleTouchMove}
              className="proImgzooming">
                <img
                key={bagLength > 0 && bagImg[currentState]?.colorImage ? bagImg[currentState].colorImage : ""}
                src={bagLength > 0 && bagImg[currentState]?.colorImage ? bagImg[currentState].colorImage : ""}
                ref={imageRef}
                alt="product img"
                className="zoomabelImage"
              />
              </div>
              <div className='arrowStyle arrowStyleRight' onClick={goToNext}> 〉</div>
            </div>

            </div>
            <hr className="productpagehr"/>
            <div className='ProductnameAndshortDesc'>
              {productsData?.ProductShortDescription && 
              productsData.ProductShortDescription?.productShortHeading ?
              (<h2>{productsData.ProductShortDescription.productShortHeading}</h2>)
              :
              (<h2>loading...</h2>)
              }
              <div className='productDescriptionshort'>
                <h2>Variations</h2>
                <div className='productDainamicKeyValue'>
                  {
                    productsData?.ProductShortDescription && 
                    productsData.ProductShortDescription?.productShortDescVariations &&
                    productsData.ProductShortDescription.productShortDescVariations.length > 0
                     ?
                     productsData.ProductShortDescription.productShortDescVariations.map((d) => (
                      <b key={d._id}>{d.key}: {d.value}</b>
                     ))
                     :
                     (<b>loading...</b>)
                  }
                </div>
                <h2>Key attributes</h2>
                <div className='productDainamicKeyValue'>
                  {
                    productsData?.ProductShortDescription && 
                    productsData.ProductShortDescription?.productShortDescKeyAttributes &&
                    productsData.ProductShortDescription.productShortDescKeyAttributes.length > 0
                     ?
                     productsData.ProductShortDescription.productShortDescKeyAttributes.map((d) => (
                      <b key={d._id}>{d.key}: {d.value}</b>
                     ))
                     :
                     (<b>loading...</b>)
                  }
                </div>
                <h2>Other attributes</h2>
                <div className='productDainamicKeyValue'>
                  {
                    productsData?.ProductShortDescription && 
                    productsData.ProductShortDescription?.productShortDescOtherAttributes &&
                    productsData.ProductShortDescription.productShortDescOtherAttributes.length > 0
                     ?
                     productsData.ProductShortDescription.productShortDescOtherAttributes.map((d) => (
                      <b key={d._id}>{d.key}: {d.value}</b>
                     ))
                     :
                     (<b>loading...</b>)
                  }
                </div>
              </div>
            </div>
            <hr className="productpagehr"/>
            <div className='productQuentiti'>
              <div className='product_priceAndStock'>
                <h2>Price: <span style={{color:'red',margin:'0px 10px'}}><del>{PreviousPrice}KD</del></span><span style={{color:'#0dff00'}}>{productPrice}KD</span></h2>
                <div className='inStockInner'>{checkData && productsData.InStock ? <div className='stockContainer'>Instock<div className='inStockActionTrue'></div></div> : <div className='stockContainer'>Out of Stock <div className='inStockActionFalse'></div></div>}</div>
              </div>
            <div className='productColorSelection'>
              <h2>Color: <span id="colorNameChange" style={{color:'#00fff2'}}>{bagLength > 0 && bagImg[currentState]?.colorName ? bagImg[currentState].colorName : ""}</span></h2>
              <div className='colorSelectionList'>
                {bagLength > 0 && bagImg[currentState]?.colorImage && bagImg[currentState]?.colorName ?
                  bagImg.map((value, index) => {return(
                  <div className='singleColorInner' key={index} id={index} data-color={value.colorName} onClick={changeColor}>
                    <span id={`colorName${index}`}></span>
                    <img src={value.colorImage} alt={`${value.colorName} color`} key={value.colorImage}/>
                    <div className='singleColorInnerfilter'></div>
                  </div>     
                  )}) 
                  : 
                  ""
                }
              </div>
            </div>
            {
              productsData?.ProductSize && productsData.ProductSize.length > 0 ? (
                <div className='productSizeContainer'>
                <h2>Size:</h2>
                {
                  productsData.ProductSize.map(d => (
                  <div className='productSizeInner' key={d}>
                      <div className='sizeName'>{d}</div>
                      <div className='sizeContainer'>
                          <RemoveIcon  onClick={() => {Decriment(d, productForBuy.colorOfQuentity.find(item => item.colorId === currentColorIdView)?.size[d] || 0)}}/>
                            <span>{productForBuy.colorOfQuentity.find(item => item.colorId === currentColorIdView)?.size[d] || 0}</span>
                          <AddIcon  onClick={() => {Incriment(d)}}/>
                      </div>
                  </div>
                  ))
                }
              </div>        
              ) : (
                <div className='productquentitySelection'>
                <button className='productQuentityAddmines' onClick={() => {Decriment("available", quentity)}}>-</button>
                  <span className='productQuentityDisplay'>{quentity}</span>
                <button className='productQuentityAddplus' onClick={() => {Incriment("available")}}>+</button>
                </div>  
              )
            }
            <div className='priceIncrmentTable'>
              <span>Total price {quentity} x {productPrice} = {totalPrice}KD</span>
              <span>Discount {Discount}KD</span>
              <span>Grand Total {grandTotal}KD</span>
            </div>
            <Link to={`/checkout/${productId}`} onClick={addtoCart} style={{textDecoration:'none'}}><button className='buyNowbtntwo' disabled={true} >Buy Now</button></Link>
            </div>
        </div>
        <div className='customerReview'>
          <div className='customerReviwheading'>
            <h2 onClick={showCustomer}>Customer Review</h2>
            <h2 onClick={addReview}>Add your Review</h2>
          </div>
          <div className='allReviewContainer'>
          {
            allReviews !== undefined && allReviews.length > 0 ? allReviews.map((d) => (
              <div className='allReview' key={d._id}>
              <div className='userProfile'>
                <img src={d.customerGender === "Male" ? male : female} alt="profile"/>
                <span>{d.customerName}</span>
              </div>
                <div className='userComment'> 
                <div className='productImage'>
                  {
                    d.imageLink.map((d) => (
                      <img src={d.image} alt="productImage" key={d._id}/>
                    ))
                  }
                </div>
                <div className='userCommentText'>
                  {d.comments}
                </div>
                </div>
                <div className='ratingReview'>
                  <h2>Ratings</h2>
                  <div className='starContainer'>
                    {
                      d.ratingPoints === 0 ?
                      <div className='starOptionsEmpty'>
                        <i>★</i>
                        <i className='starCustomerView'>★</i>
                        <i className='starCustomerView'>★</i>
                        <i className='starCustomerView'>★</i>
                        <i className='starCustomerView'>★</i>
                      </div>
                    : d.ratingPoints === 1 ? 
                      <div className='starOptionsEmpty'>
                        <i>★</i>
                        <i>★</i>
                        <i className='starCustomerView'>★</i>
                        <i className='starCustomerView'>★</i>
                        <i className='starCustomerView'>★</i>
                      </div>
                    : d.ratingPoints === 2 ? 
                    <div className='starOptionsEmpty'>
                        <i>★</i>
                        <i>★</i>
                        <i>★</i>
                      <i className='starCustomerView'>★</i>
                      <i className='starCustomerView'>★</i>
                    </div>
                  : d.ratingPoints === 3 ? 
                  <div className='starOptionsEmpty'>
                        <i>★</i>
                        <i>★</i>
                        <i>★</i>
                        <i>★</i>
                    <i className='starCustomerView'>★</i>
                  </div>
                :
                  <div className='starOptionsEmpty'>
                        <i>★</i>
                        <i>★</i>
                        <i>★</i>
                        <i>★</i>
                        <i>★</i>
                  </div>
                    }
                    <span>{Number(d.ratingPoints)+1}</span>
                  </div>
                  
                </div>
                <div className='dateformateInReview'>{format(d.createdAt, 'd MMMM yyyy')}</div>
            </div>  
            ))
             : (<h3 className='reviewisReviewCheck'>don't have any reviews yet!</h3>)
          }
          </div>
          <div className='customerReviwAllContainer'>

          {isReview === "nologin" ? (<h3 className='reviewisReviewCheck'>Login/Register Please</h3>) : isReview === "hasdata" ? (<h3 className='reviewisReviewCheck'>You have already reviewed</h3>) : (
                  <div>
                      <div className='addreviews'>
                      <div className='addreviewcomment'>
                        <h6>write you comment</h6>
                        <textarea rows={5} cols={50}  resizeable="true" placeholder='write here...' onChange={(e) => {setReviewComment(e.target.value)}} value={reviewComment}></textarea>
                      </div>
                      <div className='addreviewsphotos'>
                        <h6>add product Images</h6>
                        <div className='addreviewsImageContainer'>
                          <label htmlFor='addreviewimg' className='addreviewimg'>
                            Add Images
                            <input type='file' id="addreviewimg" multiple={true} onChange={uploadReviewPhotos}/>
                          </label>
                         <div id="imageViewrlist">
          
                         </div>
                        </div>
                      </div>
                      <div className='addreviesrating'>
                        <h6>Give a product Ratings</h6>
                        <div className='starInnerContainer'>
                        <div className="addrateing rate">
                                  <i onClick={starColor} onMouseOver={rateTextChange} onMouseLeave={rateTextFixed} text="bad" value="0" className='starinActive'>★</i>
                                  <i onClick={starColor} onMouseOver={rateTextChange} onMouseLeave={rateTextFixed} text="good" value="1" className='starinActive'>★</i>
                                  <i onClick={starColor} onMouseOver={rateTextChange} onMouseLeave={rateTextFixed} text="avarage" value="2" className='starinActive'>★</i>
                                  <i onClick={starColor} onMouseOver={rateTextChange} onMouseLeave={rateTextFixed} text="super" value="3" className='starinActive'>★</i>
                                  <i onClick={starColor} onMouseOver={rateTextChange} onMouseLeave={rateTextFixed} text="excelent" value="4" className='starinActive'>★</i>
                          </div>      
                          <span id="starRatingTextshow"></span>
                        </div>
                      </div>
                    </div>     
                      <div className='submitreviewsContainer'>

                      <button className='submitreviews' onClick={setCustomerReview} disabled={isChangeData}>{loading ? "Submiting..." :"Submit"}</button>
                      <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
                    </div>
                </div>
          )}
            </div>
        </div>
    </div>
  )
}

export default Product