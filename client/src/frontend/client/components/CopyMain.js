import React, { useEffect, useState, useRef } from 'react'
import back from '../../../images/productbg/pbg7.jpg';
import {Link} from 'react-router-dom';
import Slider from './slider/Slider';
import ProductLiner from './slider/ProductLiner';
import {Altaxios} from '../../Altaxios'
import SkeletonLoader from '../../SkeletonLoader';
import back4 from '../../../images/productbg/pbg1.jpg';
import { trackPageView, trackAddToWishlist } from '../../../js/trackEvents';


function Main() {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [productsData,setProductsData] = useState([]);
  const [currentState,setCurrentState] = useState(0);
  const [photoAndVideo,setPhotoAndVideo] = useState([]);
  // const [fillBackground,setFillBackground] = useState([]);
  const [emptyBackground,setEmptyBackground] = useState([]);
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
      Altaxios.get("/addproduct/allPublicProducs").then((res) => {
          if(res.status === 200){
              setProductsData(res.data);
          }
      });
  },[]);
  useEffect(() => {
    if(productsData.length > 0 && (productsData[0]?.ProductPhotos || productsData[0]?.ProductVideos) && (productsData[0].ProductPhotos.length > 0 || productsData[0].ProductVideos.length > 0)){
      const fillPhotos = productsData[0].ProductPhotos.filter(photo => photo.backgroundType === "fill");
      const emptyPhotos = productsData[0].ProductPhotos.filter(photo => photo.backgroundType === "empty");
      const newarray = [...productsData[0].ProductVideos, ...fillPhotos];
      setPhotoAndVideo(newarray);
      // setFillBackground(fillPhotos);
      setEmptyBackground(emptyPhotos);
    }
  },[productsData]);
  //image system<>
  const bagLangth = photoAndVideo !== undefined && photoAndVideo.length;
  const goToNext = () => {
    const isLast = currentState === (bagLangth - 1);
    const newIndex = isLast ? 0 : Number(currentState) + 1;
    setCurrentState(newIndex);
  };
  const goToPrev = () => {
    const isFirst = currentState === 0;
    const newIndex = isFirst ? (bagLangth - 1) : Number(currentState) - 1;
    setCurrentState(newIndex);
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
  }
  const Zoomout = (e) => {
    const img = document.querySelector(".zoomabelImage");
    if(img){
      img.classList.remove("zoomabelImagestyle");
    }
  }
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
  }
  const navigatToProductAndsetFbData = () => {
    trackAddToWishlist({
      price: productsData[0]?.ProductPrice,
      name: productsData[0]?.ProductName,
      id: productsData[0]?._id,
      category:"Fashion > Accessories > Women's Accessories > Handbags",
      quantity:1,
    });
  }
  //image system</>
  return (
    <div className="mainSection">
      <div className='topSliderContainer'>
        <Slider FbWishList={navigatToProductAndsetFbData}/>
      </div>
      <div className='productViewSection'>
      {
             productsData !== undefined && productsData.length > 0 &&
             productsData[0]?.ProductMainHeading ?
             (<h2>{productsData[0].ProductMainHeading}</h2>)
             :
             (<h2>Loading...</h2>)
      }
        <div className='productOverview'>
          {
             productsData !== undefined && productsData.length > 0 ?
              <div className='productDemoFirst'>
                <h6>Key Features</h6>
                {
                   productsData[0].ProductFutures !== undefined &&  productsData[0].ProductFutures.length > 0 ?
                  productsData[0].ProductFutures.map((d) => (
                    <div className='Clnt_productFutureContainr' key={d._id}>
                      <b>{d.key}: {d.value}</b>
                    </div>
                  ))
                  :
                  <span>Loadig...</span>
                }
              </div>

             :

             <SkeletonLoader mainWidth="365px" mainHeight="100%" headingW="40%" headingH="25px"chaildOneW="90%"allChaieldH="20px"chaildTwoW="70%"chaildThreeW="90%"chaildForeW="100%"/>
          }
          {
            photoAndVideo !== undefined && photoAndVideo.length > 0 ?
          <div className='productDemoCenter'>
            <div className='imgslider'>
              <div className='arrowStyleMain' onClick={goToPrev}>〈 </div>
              <div ref={containerRef} style={imageStyle}
                onMouseMove={Zoomin} 
                onMouseLeave={Zoomout}
                onTouchStart={handleTouchMove}
                onMouseUp={Zoomout}
                onTouchEnd={Zoomout}          
                onTouchMove={handleTouchMove}
              className="proImgzooming">
                {
                  photoAndVideo[currentState].fileType.split("/")[0] === "video" ? 
                  <video controls playsInline style={{width:'100%',height:'100%',cursor:'auto',objectFit:'cover'}} key={photoAndVideo[currentState].videoUrl}>
                    <source src={photoAndVideo[currentState].videoUrl} type={photoAndVideo[currentState].fileType} />
                    Your browser does not support the video tag.
                  </video> 
                  :
                  <img src={photoAndVideo[currentState].photoUrl} ref={imageRef} alt="product img"className='zoomabelImage' key={photoAndVideo[currentState].photoUrl}/>
                }
              </div>
              <div className='arrowStyleMain arrowStyleMainRight' onClick={goToNext}> 〉</div>
            </div>

          </div>
          : 
          <SkeletonLoader mainWidth="365px" mainHeight="100%" headingW="40%" headingH="25px"chaildOneW="90%"allChaieldH="20px"chaildTwoW="70%"chaildThreeW="90%"chaildForeW="100%"/>
          }
          {
             productsData !== undefined && productsData.length > 0 ?
              <div className='productDemoLast'>
                <h6>Specifications</h6>
                {
                  productsData[0].ProductSpecification !== undefined && productsData[0].ProductSpecification.length > 0 ?
                  productsData[0].ProductSpecification.map((d) => (
                      <div className='Clnt_productFutureContainr' key={d._id}>
                      <b>{d.spcKey}: {d.spcValue}</b>
                    </div>
                  ))
                  :
                  <span>Loading...</span>
                }
              </div> 
             :
             <SkeletonLoader mainWidth="365px" mainHeight="100%" headingW="40%" headingH="25px"chaildOneW="90%"allChaieldH="20px"chaildTwoW="70%"chaildThreeW="90%"chaildForeW="100%"/>
          }
        </div>
        <div className='productBuynowSection'>
          <Link className='buyNowbtn'onClick={navigatToProductAndsetFbData} to={`product/${productsData.length > 0 ? productsData[0]._id : ""}`} >Buy Now</Link>
        </div>
      </div>

      <div className='productDetais'>
        <div className='productTitle'>
          <h2>Product Description</h2>
        </div>
        <div className='productDemoStyle'>
            <div className='productDemo'>
            {productsData[0]?.ProductDescription?.length > 0 ?
              productsData[0].ProductDescription.map((d,index) => (
                <div className={(index % 2) === 0 ? 'productDemoLeft' : 'productDemoRight'} key={d._id}>
                  <div className='productImgContainer' style={{backgroundImage:`url(${back})`}}>
                    <img src={d.photoUrl}  alt="bag" className='productDemoImg'/>
                  </div>
                  <div className='product_textDescription'>
                    <h2>{d.heading}</h2>
                    <p>{d.descripTion}</p>
                  </div>
                </div>
              ))
              :
              <SkeletonLoader mainWidth="365px" mainHeight="100%" headingW="40%" headingH="25px"chaildOneW="90%"allChaieldH="20px"chaildTwoW="70%"chaildThreeW="90%"chaildForeW="100%"/>
            }
    </div>
               {/* product liner slider */}
        <div className='productSlidingliner'>
          <ProductLiner photos={emptyBackground !== undefined && emptyBackground.length > 0 ? emptyBackground : []} productId={productsData !== undefined && productsData.length > 0 ? productsData[0]._id : "1"} FbWishList={navigatToProductAndsetFbData}/>
        </div>
        {/* product liner slider */}
        </div>
      </div>
    </div>
  )
}

export default Main