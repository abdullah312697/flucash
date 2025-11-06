import React, {useRef, useEffect, useState } from 'react';
import {KuwaitCity} from './KW';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from 'react-router-dom'
import {Altaxios} from '../../Altaxios';
// import { trackPageView, trackPurchase } from '../../../js/trackEvents';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
// import {handleFbclidCookie} from '../../../js/fbclidUtils';

function Checkout() {
const navigate = useNavigate();

  // fbc click id<>
//   const fbc = handleFbclidCookie();
  // fbc click id</>

  //facebook pixle event<>
//   useEffect(() => {
//     const pageData = {
//               page_title: document.title,
//               page_path: window.location.pathname,
//               page_url: window.location.href,
//               fbc : fbc || null,
//     };
//       trackPageView(pageData);
//     }, [fbc]);
  //facebook pixle event</>

const [loading,setLoading] = useState(false);
const [productForBuy, setProductForBuy] = useState(
    {
        customerId:"",
        totalQuentity: 0,
        totalPrice: 0,
        Discount: 0,
        shipping:0,
        grandTotal: 0,
        colorOfQuentity:[],
        areaName:"",
        block:"",
        gidda:"",
        street:"",
        houseNo:"",
        floorNo:"",
        appartment:"",
        fullname:"",
        mobilenumber:"",
        email:"",
        preferredTime:"",
        // paymentMethod:"paypal"
      }
);
let isChangeData = true;
if(productForBuy.areaName !== "" && 
 productForBuy.block !== "" &&
 productForBuy.street !== "" &&
 productForBuy.houseNo !== "" &&
 productForBuy.fullname !== "" &&
 productForBuy.mobilenumber !== "" &&
 productForBuy.email !== "" &&
 productForBuy.preferredTime !== ""
//  productForBuy.paymentMethod !== ""
){
    isChangeData = false;
}else{
    isChangeData = true;
}

useEffect(() => {
    const data = localStorage.getItem("readyForCheckout");
    try {
        if (data !== null) {
            const productData = JSON.parse(data);
            if (typeof productData === 'object' && productData !== null) {
                setProductForBuy((prevState) => ({
                    ...prevState,
                    customerId: productData.customerId,
                    totalQuentity: productData.totalQuentity,
                    totalPrice: productData.totalPrice,
                    Discount: productData.Discount,
                    shipping: productData.shipping,
                    grandTotal: productData.grandTotal,
                    colorOfQuentity: productData.colorOfQuentity,
                }));
            } else {
                throw new Error('Parsed data is not an object');
            }
        } else {
            navigate(`/cart/`);
        }
    } catch (error) {
        console.error('Failed to parse localStorage data:', error);
        navigate(`/cart/`);
    }
}, [navigate]);

const currentStep = useRef(0);
const currentStyle = useRef(0);
const productSliderContainer = useRef(null);
const productSlider = useRef(null);
let touchStartX = 0;
let touchEndX = 0;

    const userDatacollect = (e) => {
        const sibling = e.currentTarget.previousElementSibling;
        const value = e.currentTarget.value;
        const name = e.currentTarget.name;
        if(name === "mobilenumber"){
            const isValid = /^[0-9]*$/.test(value); 
            if(isValid){
                setProductForBuy({...productForBuy,[name] : value});
            }
          }else{
            setProductForBuy({...productForBuy,[name] : value});
        }
      
       if(value !== ""){
        sibling.style.display = "block";
        if(name === "mobilenumber"){
            const phoneDailCode = document.querySelector(".phoneDailCodeCheckout");
            phoneDailCode.style = `top:17px`;
        }    
       }else{
        sibling.style.display = "none";
        if(name === "mobilenumber"){
            const phoneDailCode = document.querySelector(".phoneDailCodeCheckout");
            phoneDailCode.style = `top:0px`;
        }    
       }
    };
    useEffect(() => {
        const dainamicDiv = document.querySelector(".checkoutimgContainer");
        const child = dainamicDiv.children.length;
        const left = document.querySelector(".checkoutImgleftbtn");
        const right = document.querySelector(".checkoutImgrightbtn");
        
        if(child > 4){
            left.style = `display:block;color:#664700`;
            right.style = `display:block`;
        }
    },[productForBuy]);

    const productDainamic = (e) => {
        const dainamicDiv = document.querySelector(".checkoutimgContainer");
        const imgContainer = document.querySelector(".checkoutsingleImgContainer");
        const child = dainamicDiv.children;
        const currentbtn = e.currentTarget;
        const left = document.querySelector(".checkoutImgleftbtn");
        const right = document.querySelector(".checkoutImgrightbtn");
        const allStyle = window.getComputedStyle(imgContainer);
        const width = parseInt(allStyle.width);
        const marginleft = parseInt(allStyle.marginLeft);
        const marginright = parseInt(allStyle.marginRight);
        const totalsize = (width + marginleft + marginright);
        const cSize = productSliderContainer.current.clientWidth;
        const chieldWidth = child.length * totalsize;
        const stepfirst = Math.abs(chieldWidth - cSize);
        const steplast = Math.ceil(stepfirst / totalsize);
if(chieldWidth > cSize){
        
     if(currentbtn.className === "checkoutImgrightbtn"){

        if(currentStep.current < steplast){
            currentStyle.current += totalsize;
            dainamicDiv.style = `margin-left:${-currentStyle.current}px`
            currentStep.current += 1;
        }
    }else{
        if(currentStep.current > 0){
            currentStyle.current -= totalsize;
            dainamicDiv.style = `margin-left:${-currentStyle.current}px`
            currentStep.current -= 1;
        }
    }
    if(currentStep.current === 0){
        left.style = `display:block;color:#664700`;
    }else{
        left.style = `display:block;color:#ffb100`;
    }
    if(currentStep.current === steplast){
        right.style = `display:block;color:#664700`;
    }else{
        right.style = `display:block;color:#ffb100`;
    }

}
    };

    const touchSlide = (types) => {
        const dainamicDiv = document.querySelector(".checkoutimgContainer");
        const imgContainer = document.querySelector(".checkoutsingleImgContainer");
        const allStyle = window.getComputedStyle(imgContainer);
        const width = parseInt(allStyle.width);
        const marginleft = parseInt(allStyle.marginLeft);
        const marginright = parseInt(allStyle.marginRight);
        const totalsize = (width + marginleft + marginright);
        const child = dainamicDiv.children;
        const cSize = productSliderContainer.current.clientWidth;
        const chieldWidth = child.length * totalsize;
        const stepfirst = Math.abs(chieldWidth - cSize);
        const steplast = Math.ceil(stepfirst / totalsize);
if(chieldWidth > cSize){
     if(types === "left"){
        if(currentStep.current < steplast){
            currentStyle.current += totalsize;
            dainamicDiv.style = `margin-left:${-currentStyle.current}px`
            currentStep.current += 1;
        }
    }else{
        if(currentStep.current > 0){
            currentStyle.current -= totalsize;
            dainamicDiv.style = `margin-left:${-currentStyle.current}px`
            currentStep.current -= 1;
        }
    }
    }
    }

    const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
      };
    
      const handleTouchMove = (e) => {
        touchEndX = e.touches[0].clientX;
      };
    
      const handleTouchEnd = () => {
        const deltaX = touchEndX - touchStartX;
        if (deltaX > 50) {
            touchSlide("right");
        } else if (deltaX < -50) {
            touchSlide("left");
        }
      };
    const changeTimeColor = (e) => {
        const getItem = document.querySelector(".activeSelectTime");
        setProductForBuy({...productForBuy, preferredTime : e.currentTarget.value});
        if(getItem){
            getItem.classList.remove("activeSelectTime");
            e.currentTarget.classList.add("activeSelectTime")
        }else{
            e.currentTarget.classList.add("activeSelectTime")
        }
    }

    const confirmOrder = async() => {
        // trackPurchase({
        //     email : productForBuy.email,
        //     fullName : productForBuy.fullname,
        //     phone:productForBuy.mobilenumber,
        //     city:productForBuy.areaName,
        //     total:productForBuy.totalPrice,
        //     // itemName:productForBuy.productName,
        //     itemCategory:'Fashion > Accessories > Women\'s Accessories > Handbags',
        //     // itemId:productForBuy.productId,
        //     quantity:productForBuy.totalQuentity,
        //     // itemPrice:productForBuy.productPrice,
        //     fbc : fbc || null,
        // });

        const getItem = document.querySelector(".activeSelectTime");
        setLoading(true);
        try{
            await Altaxios.post('/order/addNewOrder',productForBuy).then((res) => {
                if(res.status === 200){
                    localStorage.removeItem("readyForCheckout");
                    setLoading(false);
                    if(getItem){
                        getItem.classList.remove("activeSelectTime");
                    }
                    setProductForBuy({
                        customerId:"",
                        totalQuentity: 0,
                        totalPrice: 0,
                        Discount: 0,
                        shipping:0,
                        grandTotal: 0,
                        colorOfQuentity:[], 
                        areaName:"",
                        block:"",
                        gidda:"",
                        street:"",
                        houseNo:"",
                        floorNo:"",
                        appartment:"",
                        fullname:"",
                        mobilenumber:"",
                        email:"",
                        preferredTime:"",
                      });
                      navigate("/thanks");
                }else{
                    setLoading(false);
                }
            });
        }catch(e){
            console.log(e)
        }
    };

    // const setPaymentMethod = (e) => {
    //     const value = e.target.value;
    //     setProductForBuy((prevState) => ({
    //         ...prevState,
    //         paymentMethod :value
    //     }));
    // };

    // const checkedPyamet = (value) => {
    //     setProductForBuy((prevState) => ({
    //         ...prevState,
    //         paymentMethod :value
    //     }));
    // }
  return (
    <div className='checkoutmain'>
        <Link to={`/`} className='arrowback_aProduct'><ArrowBackIcon className='arrowbackIcon'/></Link>
        <div className='checkoutContact'>
            <div className='checloutcontactInner'>
                <h2 className='allcheckoutheading'>Delivery Address</h2>
                <div className='delebaryaddrss'>
                    <label htmlFor='kwareaselect'>
                    <span className='userinfotextdemo'>Area<i>*</i></span>
                        <select id="kwareaselect" name="areaName" value={productForBuy.areaName} autoComplete='off' onChange={userDatacollect} className='useraddressinput'>
                            {
                                KuwaitCity.map(d => (
                                    <option key={d["key"]} value={d["value"]}>{d["text"]}</option>
                                ))
                            }
                        </select>
                    </label>
                        <label htmlFor='kwblock'>
                            <span className='userinfotextdemo'>Block<i>*</i></span>
                            <input className="useraddressinput" autoComplete="off" onChange={userDatacollect} type='text' id="kwblock" name='block' value={productForBuy.block} placeholder='Block...'/>
                        </label>
                        <label htmlFor='kwgidda'>
                            <span className='userinfotextdemo'>Jadda/Avenue (optional)</span>
                            <input className="useraddressinput" autoComplete="off"  onChange={userDatacollect} type='text' id="kwgidda" name='gidda'  value={productForBuy.gidda} placeholder='Jadda/Avenue...'/>
                        </label>
                        <label htmlFor='kwstreet'>
                            <span className='userinfotextdemo'>Street Number<i>*</i></span>
                            <input className="useraddressinput" autoComplete="off" id="kwstreet" onChange={userDatacollect} type='text' name='street' value={productForBuy.street} placeholder='Street Number...'/>
                        </label>
                        <label htmlFor='kwhouseno'>
                            <span className='userinfotextdemo'>Building Number<i>*</i></span>
                            <input className="useraddressinput" autoComplete="off" id="kwhouseno" onChange={userDatacollect} type='text' name='houseNo' value={productForBuy.houseNo} placeholder='Building Number...'/>
                        </label>
                        <label htmlFor='kwfloorno'>
                            <span className='userinfotextdemo'>Floor Number (optional)</span>
                            <input className="useraddressinput" autoComplete="off" id="kwfloorno"  onChange={userDatacollect} type='text' name='floorNo' value={productForBuy.floorNo} placeholder='Floor Number...'/>
                        </label>
                        <label htmlFor='kwappratment'>
                            <span className='userinfotextdemo'>Flat Number (optional)</span>
                            <input className="useraddressinput" autoComplete="off" id="kwappratment"  onChange={userDatacollect} type='text' name='appartment' value={productForBuy.appartment} placeholder='Flat Number...'/>
                        </label>
                </div>
                <div className='contactinformatin'>
                    <h2 className='allcheckoutheading'>Contact info</h2>
                        <label htmlFor='kwfullname'>
                            <span className='userinfotextdemo'>Full Name<i>*</i></span>
                            <input className="useraddressinput" autoComplete="off"  onChange={userDatacollect} type='text' id="kwfullname" name='fullname' value={productForBuy.fullname} placeholder='Full Name...'/>
                        </label>
                        <label htmlFor='kwmobilenumber' style={{position:'relative'}}>
                            <span className='userinfotextdemo'>Mobile Number<i>*</i></span>
                            <input type='tel' style={{marginTop:'0px'}} className="useraddressinput phoneNumberINputChkout" autoComplete="off"  onChange={userDatacollect}   maxLength="8" id="kwmobilenumber" name='mobilenumber' value={productForBuy.mobilenumber}placeholder='Mobile Number...'/>
                            <span className='phoneDailCodeCheckout'>+965</span>
                        </label>
                        <label htmlFor='kwemail'>
                            <span className='userinfotextdemo'>Email<i>*</i></span>
                            <input className="useraddressinput" autoComplete="off"  onChange={userDatacollect} type='text' id="kwemail" name='email' value={productForBuy.email} placeholder='Email Address...'/>
                        </label>
                </div>
            </div>
        </div>
        <hr className="horizenterline"/>
        <div className='checkoutpaymentandtime'>
            <div className="delibarytimeselection">
                <h2 className='allcheckoutheading'><LocalShippingRoundedIcon style={{fontSize:'17px',marginBottom:'-2px',color:'#00a79e'}}/> Free Delivery within 1-2 days</h2>
                <div className='prefeertime'>
                    <div className='timeContaniner'>
                    <h4 className='allcheckoutheading'>Select your preferred time</h4>
                        <button onClick={changeTimeColor} value={"All-day   10AM - 10PM"}>All-day   10AM - 10PM</button>
                        <button onClick={changeTimeColor} value={"Morning   10AM - 01PM"}>Morning   10AM - 01PM</button>
                        <button onClick={changeTimeColor} value={"Afternoon 01PM - 06PM"}>Afternoon 01PM - 06PM</button>
                        <button onClick={changeTimeColor} value={"Evening   06PM - 10PM"}>Evening   06PM - 10PM</button>
                    </div>

                </div>
            </div>
            <div className='checkoutpaymentMethod'>
                <h3 className='allcheckoutheading'>Payment Method</h3>
                <div className='paymentMethod'>

                    <div className='cashonDalibary'>
                        <input type="radio" defaultChecked className='genderRadioLabelInput' name="paymentMethod"  value="cod" id="cashonbtn"/>
                        <label htmlFor='cashonbtn' className='genderRadioLabel paymentRadioLable' ></label>
                        <span className='cashinputtext'>Cash on Delivery</span>
                        <LocalShippingRoundedIcon style={{fontSize:'17px',marginBottom:'-2px',color:'#00a79e'}}/>
                    </div>                
                </div>
                    </div>
                    </div>
        <hr className="horizenterline"/>
        <div className='checkoutProductinfo'>
            <h2 className='allcheckoutheading'>Your Selected Product</h2>
            <div className='checkoutproductinfoInner'>
            <div className='checkoutImgleftbtn' onClick={productDainamic}>
              <ArrowBackIosIcon/>
            </div>
            <div className='checkoutImgrightbtn' onClick={productDainamic}>
               <ArrowForwardIosIcon/>
            </div>
               <div className='productcheckoutslider' 
                     onTouchStart={handleTouchStart}
                     onTouchMove={handleTouchMove}
                     onTouchEnd={handleTouchEnd}    
                     ref={productSliderContainer}           
               >
            <div className='checkoutimgContainer' ref={productSlider}>
        {/* {
            productForBuy !== undefined && 
            productForBuy?.products.length > 0 ?
            productForBuy?.products.map(item => {
                if(item?.productColor.length > 0){
                    item.productColor.map(clr => (
                        <div className='checkoutsingleImgContainer' 
                            key={clr.colorId}>
                            <span>x{clr.colorOfQuentity}</span>
                            <img src={clr.colorImg} alt="product"/>
                        </div>        
                    ))
                }
            }
            )
            :
            (<h4>You don't have any product</h4>)
        } */}
{
            productForBuy !== undefined && productForBuy.colorOfQuentity.length > 0 ? 
            productForBuy.colorOfQuentity.map((d) => (
                <div className='checkoutsingleImgContainer' 
                key={d.colorId}>
                <span>x{d.colorQuentity}</span>
                <img src={d.colorImg} alt="product"/>
            </div>

            )) :
            (<h4>You don't have any product</h4>)
        }
        </div>
                </div>
                <div className='checkouttextshowing'>Total Quantity = { productForBuy !== undefined ? productForBuy.totalQuentity : 0}</div>
                <div className='checkouttextshowing'>Total Price {productForBuy !== undefined ? productForBuy.grandTotal : 0}KD</div>
                <button className='purchesproduct' disabled={isChangeData} onClick={confirmOrder}>{loading ? "Confirming..." : "Confirm Order"}</button>
            </div>
        </div>
    </div>
  )
}

export default Checkout