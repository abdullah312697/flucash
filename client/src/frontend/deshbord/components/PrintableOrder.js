import React from 'react';
import { format } from 'date-fns';
import QRCode from 'qrcode.react';

const nextStatusMapping = {
  'Pending': 'Processing',
  'Processing': 'UnderDelivery',
  'UnderDelivery': 'Completed'
};

const PrintableOrder = React.forwardRef(({ order }, ref) => (
  <div ref={ref} className="printable-order" style={{display:'none'}}>
    <h1>Nothun</h1>
    {order ? (
        <div id="print-section">
            <div className='printableInnerContainer'>
                <h3>Order Details</h3>
                <p>Order Date: {order.createdAt && format(new Date(order.createdAt), "dd-MM-yyyy 'at' h:mm:ss a")}</p>
                <p>Order ID: {order._id}</p>
                {
                  order?.colorOfQuentity && order.colorOfQuentity.length > 0 ? order.colorOfQuentity.map((d) => (
                    <div key={d.colorName} className='printabelOrderColorandSizes'>
                      <div className='printable_order_clr'>Color: {d.colorName}</div>
                    {
                    d.size !== undefined && d.size !== null ?(
                    <div className='printabel_order_sizes'>{
                    Object.entries(d.size).map(([key,value]) => (
                      <div key={key} className='printableOrderSizesInner'>
                        <span>{key}={value}pc</span>
                      </div>
                    ))}
                    </div>)
                    :
                    (<div className='printableOrder_nosize'></div>)
                  }
                    </div>
                  )) : 
                  (<div className='printableOrder_nosize'></div>)
                }
                <p>Total Quentity: {order.totalQuentity}</p>
                <p>Product Price: {order.productPrice}KD</p>
                <p>Total Price: {order.totalPrice}KD</p>
                <p>Discount: {order.Discount}KD</p>
                <p>Grand Total: {order.grandTotal}KD</p>
            </div>
            <div className='printableInnerContainer'>
                <h3>Delivery Address</h3>
                <p>Area Name: {order.areaName}</p>
                <p>Block: {order.block}</p>
                {order.gidda !== "" && <p>Jedda: {order.gidda}</p>}
                <p>Street: {order.street} </p>
                <p>House No: {order.houseNo} </p>
                {order.floorNo !== "" && <p>Floor No: {order.floorNo} </p>}
                {order.appartment !== "" && <p>Appartment No: {order.appartment} </p>}
                <p>Preferred Time: {order.preferredTime}</p>
            </div>
            <div className='printableInnerContainer'>
                <h3>Contact Info</h3>
                <p>Customer Name: {order.fullname}</p>
                <p>Phone Number: +965{order.mobilenumber}</p>
                <p>Email: {order.email}</p>
            </div>
            <div className='printableInnerContainer'>
                <QRCode value={`/order/updateOrderStatusbyQr/${order._id}/${nextStatusMapping[order.orderStatus]}`} />
            </div>
    </div>
    ) : (
      <p>No order selected</p>
    )}
                    <a href='https://www.nothun.com'>nothun.com</a>
  </div>
));

export default PrintableOrder;
