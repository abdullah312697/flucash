import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {Altaxios} from '../../Altaxios';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';

function ReturnOrder() {
const [orderId,setOrderId] = useState("");
const [singleOrder,setSingleOrder] = useState({});
const isPopupOpen = useRef(false);
const [feedBack,setFeedBack] = useState("");
const [confirmationMsg,setConfirmationMsg] = useState("");

let isChangeData = true;
let isEmptyIdfield = true;
let isEmptyforFeedback = true;
if(feedBack !== ""){
    isEmptyforFeedback = false;
}else{
    isEmptyforFeedback = true;
};

if(orderId !== "" && orderId.length === 24){
  isChangeData = false;
}else{
  isChangeData = true;
}

const getOrderStatusOne = async() => {
  isEmptyIdfield = false;
  await Altaxios.get(`/order/getOneOrderStatus/${orderId}`).then((res)=>{
    if(res.status === 200){
    setSingleOrder(res.data);
      isEmptyIdfield = true;
    }else{
      isEmptyIdfield = true;
      setSingleOrder({orderStatus:"notfound"});
    }
  })
};

const showPopupForCancel = () => {
    const mainSection = document.querySelector(".thankspageInner_incancel");
    const SecondSection = document.querySelector(".canCelOrder_popup");
    if(!isPopupOpen.current){
        SecondSection.style = 'display:block';
        mainSection.style = 'display:none';
        isPopupOpen.current = true;
    }else{
        SecondSection.style = 'display:none';
        mainSection.style = 'display:block';
        isPopupOpen.current = false;
    }
};
const cencelPopupTwo = () => {
    const getpr = document.querySelector(".preDeletePopup_incancel");
    getpr.style = `display:none`;
}

const CancelConfirmPopup = () => {
    const showPopup = document.querySelector(".preDeletePopup_incancel");
    showPopup.style = `display:block`;
}

const cancelConfirm = async(orderId) => {
    const showPopup = document.querySelector(".preDeletePopup_incancel");
    try{
        await Altaxios.put(`/order/updateOrderStatus/${orderId}/Returned`,{FeedBack:feedBack}).then((res) => {
            if(res.status === 200){
                showPopup.style = `display:none`;
                setConfirmationMsg("Your request was submitted Successfully!");
                setTimeout(() => {
                    setConfirmationMsg("");
                    showPopupForCancel();
                    setFeedBack("");
                    setSingleOrder({});
                    setOrderId("");
                },3000)
            }else{
                showPopup.style = `display:none`;
            }
        });
    }catch(error){
        console.log(error)
    }
};

  return (
    <div className='contactContainerMain' style={{flexDirection:'column'}}>
        <div className='returnrequesPolicy'>
            <h3>Product Return Policy</h3>
            <div className='returnrequesPolicy_inner'>
                <div className='returnrequesPolicyText'>
                    <p>
                        We strive to ensure that our customers are completely satisfied with their purchases. If you need to return a product, please review our return policy below:
                    </p>
                </div>
                <div className='returnrequesPolicyText'>
                    <h4>Eligibility for Returns:</h4>
                    <p>
                    Items must be returned within 3 days of the delivery date.
                    <br/>
                    <br/>
                    Products must be in their original condition, unused, and with all tags and packaging intact.
                    <br/>
                    <br/>
                    Items that are damaged, altered, or show signs of wear and tear are not eligible for return.
                    </p>
                </div>
                <div className='returnrequesPolicyText'>
                    <h4>Return Process:</h4>
                    <p>
                        If you need to return a product, follow these simple steps:
                        <br/>
                        <br/>
                        Enter your order number in the input field and find your order.
                        <br/>
                        <br/>
                        Click on the "Submit Return Request" button.
                        <br/>
                        <br/>
                        Provide the reason for the return in the text field and click "Confirm."
                        <br/>
                        <br/>
                        We will review your request and contact you as soon as possible.
                    </p>
                </div>
            </div>
        </div>
        <h2 style={{color:'#ffb100d9',marginBottom:'20px'}}>Return Request Processing</h2>
      <div className='contactinnerMain'>
        <div className='thankspageInner_incancel'>
            <h2 style={{color:'#bb8600',fontSize:'20px',marginBottom:'15px'}}>Retrieve data using your order ID!</h2>
            <div className='TrackOrderSerchContianer'>
                <div className='TrackOrderSerchInner'>
                    <input type='text' placeholder='Type your order id...' value={orderId} onChange={(e) => {setOrderId(e.target.value)}} maxLength={24}/>
                    <button disabled={isChangeData} onClick={getOrderStatusOne}>{isEmptyIdfield ? "Find" : "Finding..."}</button>
                </div>
                {
                    Object.keys(singleOrder).length > 0 ?
                    (singleOrder.orderStatus === "Completed") ?
                    (
                        <div>
                            <div className='singleOrder__Status' style={{flexDirection:'column',alignItems:'flex-start',color:'#00e3d7'}}>
                                <h3 style={{marginBottom:'8px'}}>Order Status: {singleOrder.orderStatus}</h3>
                                <h3 style={{marginBottom:'8px'}}>Order Date: {singleOrder?.createdAt && format(new Date(singleOrder.createdAt), "dd-MM-yyyy 'at' h:mm:ss a")}</h3>
                                <h3>Completed Data: {singleOrder?.updatedAt && format(new Date(singleOrder.updatedAt), "dd-MM-yyyy 'at' h:mm:ss a")}</h3>
                            </div>
                        <div className='singleOrder__ProductIfo'>
                        <h4>Product Info</h4>
                        <p>Order Id: {singleOrder._id}</p>
                        <p>Product Id: {singleOrder.productId}</p>
                        <p>Product Name: {singleOrder.productName}</p>
                        <div className='singleOrder__ColorImgMain'>
                        <h4>Your Selected Product</h4>
                            <div className='dbh_singleOrderImageContainer' style={{width:'auto'}}>
                                {
                                    singleOrder.colorOfQuentity.length > 0 && singleOrder.colorOfQuentity.map((d) => (
                                    <div className='singleOrder__ColorImgContainer' key={d.colorId}>
                                        <img src={d.colorImg} alt='order color' style={{width:'100px'}}/>
                                        <span className='colorNameInorder'>{d.colorName}</span>
                                        <span className='colorQuentityInorder'>{d.colorQuentity}x</span>
                                    </div>
                                    ))
                                }
                            </div>
                        </div>
                        <p>Total Quentity: {singleOrder.totalQuentity}</p>
                        <p>Product Price: {singleOrder.productPrice}KD</p>
                        <p>Total Price: {singleOrder.totalPrice}KD</p>
                        <p>Discount: {singleOrder.Discount}KD</p>
                        <p>Grand Total: {singleOrder.grandTotal}KD</p>
                    </div>
                        <button className='cancelOrder_btn' onClick={showPopupForCancel} style={{width:'190px',padding:'10px'}}>Submit Return Request</button>
                    </div>
                    ) :
                    (singleOrder.orderStatus === "Returned") ?
                    (<h4>You already submit a Return Request</h4>) :
                    (<h4>Sorry, we did not find any Completed order by this ID.</h4>) :
                    ""
                }
            </div>
            <Link to="/" style={{fontSize:'13px'}}>Back To Home</Link>
        </div>
        <div className='canCelOrder_popup'>
                <CloseIcon onClick={showPopupForCancel}/>
                <div className='canCelOrder_popupInner'>
                    <h4 style={{fontSize:'16px'}}>Please provide the reason for returning this order.</h4>
                    <textarea className='canselOrder_reason' value={feedBack} onChange={(e) => {setFeedBack(e.target.value)}}></textarea>
                    <div style={{width:'100%',color:'green',fontSize:'16px',textAlign:'center'}}>{confirmationMsg}</div>
                    <button disabled={isEmptyforFeedback} onClick={CancelConfirmPopup}>Submit</button>
                </div>
                <div className="preDeletePopup_incancel">
                    <h6 style={{fontSize:'16px'}}>Confirm Return Request Submission?</h6>
                    <div className='deleteornotbutton_cancel'>
                        <button className='nextnotsupportbtn_cancel' onClick={cencelPopupTwo} style={{fontSize:'16px'}}>Cancel</button>
                        <button className='nextsupportbtn_cancel' onClick={() => {cancelConfirm(singleOrder._id)}} style={{fontSize:'16px'}}>Confirm</button>
                    </div>
                </div>
        </div>
      </div>
    </div>
  )
}

export default ReturnOrder