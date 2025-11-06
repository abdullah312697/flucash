import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {Altaxios} from '../../Altaxios';
// import { format } from 'date-fns';

function TrackOrder() {
const [orderId,setOrderId] = useState("");
const [orderData,setOrderData] = useState({});
let isChangeData = true;
let isEmptyIdfield = true;

if(orderId !== "" && orderId.length === 24){
  isChangeData = false;
}else{
  isChangeData = true;
}
const getOrderStatusOne = async() => {
  isEmptyIdfield = false;
  await Altaxios.get(`/order/getOneOrderStatus/${orderId}`).then((res)=>{
    if(res.status === 200){
      setOrderData(res.data);
      isEmptyIdfield = true;
    }else{
      setOrderData({orderStatus:"notfound"});
      isEmptyIdfield = true;
    }
  })
};
  return (
    <div className='contactContainerMain'>
      <div className='contactinnerMain'>
        <div className='thankspageInner'>
            <h2 style={{color:'#bb8600',fontSize:'20px',marginBottom:'15px'}}>Track Your ordar status by order id</h2>
            <div className='TrackOrderSerchContianer'>
                <div className='TrackOrderSerchInner'>
                    <input type='text' placeholder='Type your order id...' value={orderId} onChange={(e) => {setOrderId(e.target.value)}} maxLength={24}/>
                    <button disabled={isChangeData} onClick={getOrderStatusOne}>{isEmptyIdfield ? "Find" : "Finding..."}</button>
                </div>
                <div className='TrackOrderSerchStatus'>
                  {
                    Object.keys(orderData).length > 0 ? 
                    orderData.orderStatus === "Pending" ? 
                    (<h4>Your order is pending and awaiting confirmation.</h4>) : 
                     orderData.orderStatus === "Processing" ?
                     (<h4>Your order is currently being processed.</h4>) :
                     orderData.orderStatus === "UnderDelivery" ?
                     (<h4>Your order is out for delivery.</h4>) :
                     orderData.orderStatus === "Completed" ?
                     (<h4>Your order has been successfully delivered.</h4>) :
                     orderData.orderStatus === "Cancelled" ?
                     (<h4>Your order has been cancelled.</h4>) :
                     orderData.orderStatus === "Returned" ?
                     (<h4>Your order has been returned.</h4>) :
                     (<h4>Sorry, we did not find any order by this ID.</h4>)
                     : ""
                  }
                </div>
            </div>
            <Link to="/" style={{fontSize:'13px'}}>Back To Home</Link>
        </div>
      </div>
    </div>
  )
}

export default TrackOrder