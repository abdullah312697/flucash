import React, { useState,useRef, useEffect, useCallback } from 'react'
import back4 from '../../../images/productbg/pbg1.jpg';
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import {Altaxios} from '../../Altaxios';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { trackPageView } from '../../../js/trackEvents';
import {productArray} from './TshirtData';
import DeleteIcon from '@mui/icons-material/Delete';
import {handleFbclidCookie} from '../../../js/fbclidUtils';

function Cart() {
const containerRef = useRef(null);
const imageRef = useRef(null);
const [cartItems, setCartItems] = useState([]);
  // fbc click id<>
  const fbc = handleFbclidCookie();
  // fbc click id</>
  useEffect(() => {
    const savedCart = localStorage.getItem('cartValue');
    const productIds = savedCart ? JSON.parse(savedCart) : [];
    const selectedItems = productArray
    .filter(product => productIds.includes(product.id))
    .map(product => ({
      ...product,
      currentColorId: product.productColor[product.currentIndex].colorId,
    }));
    setCartItems(selectedItems);
  }, []);


const [porductForBuy, setPorductForBuy] = useState({
  customerId:"",
  totalQuentity:0,
  totalPrice: 0,
  Discount: 0,
  shipping: 0,
  grandTotal: 0,
  products:[]
  });
console.log(porductForBuy);

  // update button toggle <>
  const isActive = useRef(false);
  if(porductForBuy.totalPrice > 0){
    isActive.current = true;
  }else{
    isActive.current = false;
  }
  // update button toggle</> 
  const handleRemoveItem = (id) => {
    const updatedCartItems = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCartItems);
    const updatedProductIds = updatedCartItems.map(item => item.id);
    localStorage.setItem('cartValue', JSON.stringify(updatedProductIds));
  };

  //facebook pixle event<>
  useEffect(() => {
    const pageData = {
              page_title: document.title,
              page_path: window.location.pathname,
              page_url: window.location.href,
              fbc : fbc || null,
    };
      trackPageView(pageData);
    }, [fbc]);
  //facebook pixle event</>

  
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

const InitiateCheckout = () => {
  // set cart data for checkout<>
  localStorage.setItem("readyForCheckout", JSON.stringify(porductForBuy));
  // set cart data for checkout</>
  //reset initial Data<>
  const savedCart = localStorage.getItem('cartValue');
  const productIds = savedCart ? JSON.parse(savedCart) : [];
  const selectedItems = productArray
  .filter(product => productIds.includes(product.id))
  .map(product => ({
    ...product,
    currentColorId: product.productColor[product.currentIndex].colorId,
  }));  
  setCartItems(selectedItems);
  //separate data set
  setPorductForBuy({
    customerId:"",
    totalQuentity:0,
    totalPrice: 0,
    Discount: 0,
    shipping: 0,
    grandTotal: 0,
    products:[]
  });    
    //reset initial Data</>
};

// //inside all function for img Zoomin<>
const Zoomin = (e) => {
  const img = e.currentTarget.firstChild;
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

const Zoomout = (e) => {
  const img = e.currentTarget.firstChild;
  if(img){
    img.classList.remove("zoomabelImagestyle");
  }
};
// //image zooming for touch start<>

// // Handle touch move start<>
const handleTouchMove = (e) => {
  const img = e.currentTarget.firstChild;
  let ClientX = e.touches[0].clientX;
  let ClientY = e.touches[0].clientY;
  const mainRect = e.currentTarget.getBoundingClientRect();
  let X = ClientX - mainRect.x;
  let Y = ClientY - mainRect.y;
  if(img){
    img.classList.add("zoomabelImagestyle");
  }
  if(img){
    img.style.transformOrigin = `${X}px ${Y}px`;
  }
};

const changeColor = (e, parentId, colorId) => {
  const index = parseInt(e.currentTarget.id, 10); // Ensure index is a number
  setCartItems((prevProducts) =>
    prevProducts.map((product) =>
      product.id === parentId ? { ...product, currentIndex: index, currentColorId:colorId} : product
    )
  );
};


const updatePorductForBuy = useCallback(() => {
    const updateCheck = cartItems.filter(item => (item.TotalPrice > 0));
    if (updateCheck.length > 0) {
      let ProductDataNew = updateCheck.map(data => (
        {
          productId : data.id,
          TotalPrice : data.TotalPrice,
          TotalQuentity : data.TotalQuentity,
          productPrice : data.priceAfterDiscount,
          productName: data.productName,
          productColor : data.productColor.filter(d => (Object.keys(d.size).length > 0)),
        }
      ));

        // Calculate total quantity and total price for all items
  const totalQuentity = ProductDataNew.reduce((acc, product) => acc + product.TotalQuentity, 0);
  const totalPrice = ProductDataNew.reduce((acc, product) => acc + parseFloat(product.TotalPrice), 0);
  const discount = totalPrice * 0.45;
  const shipping = totalPrice > 0 ? 5 : 0;
  const grandTotal = totalPrice - discount + shipping;
  setPorductForBuy((prevState) => ({
    ...prevState,
    totalQuentity: totalQuentity,
    totalPrice: totalPrice.toFixed(2),
    Discount: discount.toFixed(2),
    shipping: shipping.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    products: ProductDataNew,  // Set the updated products array
  }));
    }else{
      setPorductForBuy({
        customerId:"",
        totalQuentity:0,
        totalPrice: 0,
        Discount: 0,
        shipping: 0,
        grandTotal: 0,
        products:[]
      });    
    }
  },[cartItems]);

const Increment = (s, parentId, colorId) => {
  setCartItems(prevCartItems =>
    prevCartItems.map(product => {
      if (product.id === parentId) {
        const updatedProductColor = product.productColor.map(color => {
          if (color.colorId === colorId) {
            const updatedProductSize = {
              ...color.size,
              [s]: (color.size[s] || 0) + 1,
            };
            const sizeQuantity = Object.values(updatedProductSize).reduce(
              (sizeAcc, sizeVal) => sizeAcc + sizeVal,
              0
            );
            return {
              ...color,
              colorOfQuentity:sizeQuantity,
              size: updatedProductSize,
            };
          }
          return color;
        });

        // Calculate the new total quantity by summing all sizes in all colors
        const totalQuantity = updatedProductColor.reduce((acc, color) => {
          const sizeQuantity = Object.values(color.size).reduce(
            (sizeAcc, sizeVal) => sizeAcc + sizeVal,
            0
          );
          return acc + sizeQuantity;
        }, 0);
        // Calculate the total price based on total quantity and priceAfterDiscount
        const priceAfterDiscount = parseFloat(product.priceAfterDiscount.replace('kd', ''));
        const totalPrice = totalQuantity * priceAfterDiscount;

        return {
          ...product,
          productColor: updatedProductColor,
          TotalQuentity: totalQuantity,
          TotalPrice: totalPrice.toFixed(2), // To 2 decimal places
        };
      }
      return product;
    })
  );
};

const Decrement = (s, parentId, colorId) => {
  setCartItems(prevCartItems =>
    prevCartItems.map(product => {
      if (product.id === parentId) {
        const updatedProductColor = product.productColor.map(color => {
          if (color.colorId === colorId) {
            const newProductSize = { ...color.size };

            if (newProductSize[s] > 1) {
              newProductSize[s] -= 1;
            } else {
              delete newProductSize[s];
            }
            const sizeQuantity = Object.values(newProductSize).reduce(
              (sizeAcc, sizeVal) => sizeAcc + sizeVal,
              0
            );  

            return {
              ...color,
              colorOfQuentity:sizeQuantity,
              size: newProductSize,
            };
          }
          return color;
        });

        // Calculate the new total quantity by summing all sizes in all colors
        const totalQuantity = updatedProductColor.reduce((acc, color) => {
          const sizeQuantity = Object.values(color.size).reduce(
            (sizeAcc, sizeVal) => sizeAcc + sizeVal,
            0
          );
          return acc + sizeQuantity;
        }, 0);

        // Calculate the total price based on total quantity and priceAfterDiscount
        const priceAfterDiscount = parseFloat(product.priceAfterDiscount.replace('kd', ''));
        const totalPrice = totalQuantity * priceAfterDiscount;
        return {
          ...product,
          productColor: updatedProductColor,
          TotalQuentity: totalQuantity,
          TotalPrice: totalPrice.toFixed(2), // To 2 decimal places
        };
      }
      return product;
    })
  );
};

useEffect(() => {
  updatePorductForBuy();
},[cartItems,updatePorductForBuy]);

  return (
    <div className='ProductPageMain' style={{marginTop:'20px',padding:'25px'}}>
      <h1 className='CartHeading'>Your Cart</h1>
              <Link to="/" className='arrowback_a' style={{top:'3px'}}><ArrowBackIcon className='arrowbackIcon'/></Link>
    {/* cart Items Iteration */}
      {
        cartItems.map((d,index) => (
        <div className='CartSelection' key={d.id}>
          <DeleteIcon className='cartDeleteIcon' onClick={() => {handleRemoveItem(d.id)}}/>
            <div className='ProductImages' style={{width:'280px',height:'250px'}}>
            <div className='imgslider'>
              <div  style={imageStyle}
              ref={containerRef}
              onMouseMove={Zoomin} 
              onMouseLeave={Zoomout}
              onTouchStart={handleTouchMove}
              onMouseUp={Zoomout}
              onTouchEnd={Zoomout}          
              onTouchMove={handleTouchMove}
              className="proImgzooming">

                <img
                src={d.productColor[d.currentIndex].colorImg}
                alt="product img"
                ref={imageRef}
                className="zoomabelImage"
              />
              </div>
            </div>

            </div>
            <div className='productQuentiti' style={{width:'250px'}}> 
              <div className='product_priceAndStock' style={{flexDirection:'column',alignItems:'flex-start',paddingBottom:'10px',borderBottom:'1px solid #ccc3'}}>
                <h2 style={{color:'#b7b7b7',marginBottom:'10px'}}>{d.productName}</h2>
                <h2 style={{color:'#cb9408'}}>Price: <span style={{color:'red',margin:'0px 10px'}}><del>{d.priceBeforeDiscount}</del></span><span style={{color:'#0dff00'}}>{d.priceAfterDiscount}</span></h2>
              </div>

            <div className='productColorSelection' style={{width:'100%'}}>
              <h2>Color: <span id="colorNameChange" style={{color:'#00fff2'}}>{d.productColor[d.currentIndex].colorName}</span></h2>
              <div className='colorSelectionList' style={{marginBottom:'0px'}}>
              {
                d.productColor.map((color,index) => (
                  <div className="singleColorInner" key={index} id={index} data-color={color.colorName} onClick={(e) => {changeColor(e,d.id,color.colorId)}}>
                    <span id={`colorName${index}`}>{color.colorOfQuentity}<sup>x</sup></span>
                    <img src={color.colorImg} alt={`${color.colorName} color`} className={index === d.currentIndex ? "selectedImageColor" : ""}/>
                    <div className='singleColorInnerfilter'></div>
                  </div>    
                ))
              }
              </div>
            </div>
            </div>

            <div className='productSizeContainer' style={{width:'225px',margin:'0px'}}>
                <h2 style={{color:'#cb9408'}}>size:</h2>
                {
                  d.size.map(s => (
                    <div className='productSizeInner' key={s}>
                    <div className='sizeName'>{s}</div>
                    <div className='sizeContainer'>
                        <RemoveIcon onClick={() => {Decrement(s,d.id,d.currentColorId,index)}}/>
                          <span>{d.productColor.find(item => item.colorId === d.currentColorId)?.size[s] || 0}</span>
                        <AddIcon onClick={() => {Increment(s,d.id,d.currentColorId,index)}}/>
                    </div>
                </div>
                  ))
                }
              </div>        
            <div className='priceIncrmentTable' style={{width:'200px',margin:'0px',placeSelf:'flex-end'}}>
              <span style={{color:'#05d7cc'}}>Total unit {d.TotalQuentity}</span>
              <span style={{color:'#05d7cc'}}>Price {d.TotalPrice}KD</span>
            </div>

        </div>
                ))
              }
    {/* cart Items Iteration */}
        <div className='allProductTotalPrice'>
          <h2>Order Summary</h2>
        <div className='priceIncInCart'>
          <div className='cartOrderSummary'>
              <span>Total price {porductForBuy.totalPrice}KD</span>
              <span>Discount {porductForBuy.Discount}KD</span>
              <span>Shipping {porductForBuy.shipping}KD</span>
              <span>Grand Total {porductForBuy.grandTotal}KD</span>
          </div>
          </div>
            <div className='allProductCartButtons'>
            <Link to="/" style={{textDecoration:'none'}}><button className='buyNowbtnInCart' >Continue shopping</button></Link>
            <Link to={`/checkout/`} style={{textDecoration:'none'}}><button className='buyNowbtnInCart' disabled={!isActive.current} onClick={InitiateCheckout} >Checkout</button></Link>
            </div>
        </div>
    </div>
  )
}

export default Cart