import React, { useEffect, useRef, useState } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CloseIcon from '@mui/icons-material/Close';
import {Altaxios} from '../../Altaxios'
import Pagination from './Pagination';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import ReactToPrint from 'react-to-print';
import PrintableOrder from './PrintableOrder'; 
import { useNavigate } from 'react-router-dom';

function AllOrder() {
    const isAcitveView = useRef(false);
    const [allOrders,setAllOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 50;
    const [singleOrder,setSingleOrder] = useState({});
    const printRef = useRef();
    const [getupdatedData,setUpdatedData] = useState([]);
    const navigate = useNavigate();
    console.log(allOrders)
    useEffect(() => {
        Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
          if(res.status === 201 || res.data !== "All"){
            navigate("/newking");
          }
      })
      },[navigate]);
    useEffect(() => {
        const fetchOrders = async() => {
            try{
                await Altaxios.get("order/retriveOrder",{
                    params: { page, limit },
                  }).then((res) => {
                    if(res.status === 200){
                        setAllOrders(res.data.orders);
                        setTotalPages(Math.ceil(res.data.total / limit));
                    }else{
                        console.log(res.data);
                    }
                });    
            }catch(error){
                console.log(error)
            }
        };    
      fetchOrders();
    }, [page,getupdatedData]);
    const handlePageChange = (newPage) => {
        setPage(newPage);
      };
//section change<>
const changeOrderSection = (e) => {
    const findActiveBtn = document.querySelector(".activeOrderbtn");
    const nextActivBtn = e.currentTarget;
    const activeSectionClass = e.currentTarget.id;
    const activeNextClass = document.querySelector(`.${activeSectionClass}`);
    const activePrevClass = document.querySelector(".ActiveOrderSection");
    if(findActiveBtn){
        findActiveBtn.classList.remove("activeOrderbtn");
        nextActivBtn.classList.add("activeOrderbtn");
    }else{
        nextActivBtn && nextActivBtn.classList.add("activeOrderbtn");
    }
    if(activePrevClass && activeNextClass){
        activePrevClass.classList.remove("ActiveOrderSection")
        activeNextClass.classList.add("ActiveOrderSection")
    }else{
        activeNextClass && activeNextClass.classList.add("ActiveOrderSection")
    }
};
//section change</>

//order sheet toggle<>
const viewCustomerInfo = (orderId) => {
    const setActiveClass = document.querySelector(".singleOrder__Information");
    if(setActiveClass){
        if(!isAcitveView.current){
            const getSingleOrder = allOrders.find(order => order._id === orderId);
            setSingleOrder(getSingleOrder);   
            setActiveClass.style = `display:block`;
            isAcitveView.current = true;
        }else{
            setActiveClass.style = `display:none`;
            isAcitveView.current = false;
        }
    }
};
//order sheet toggle</>
//formate date<>
const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);

    const minutesDiff = differenceInMinutes(now, date);
    const hoursDiff = differenceInHours(now, date);
    const daysDiff = differenceInDays(now, date);

    if (minutesDiff < 1) {
      return 'less than a minute ago';
    } else if (minutesDiff < 60) {
      return `${minutesDiff} minutes ago`;
    } else if (hoursDiff < 24) {
      return `${hoursDiff} hours ago`;
    } else if (daysDiff < 7) {
      return `${daysDiff} days ago`;
    }else{
      return format(date, 'dd-MM-yyyy, hh:mm:ss a');
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), "dd-MM-yyyy 'at' h:mm:ss a");
  };
//formate date</>
const sortByCreatedAt = (orders) => {
    return orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };
    
//filter all status<>
const pendingOrders = sortByCreatedAt(allOrders.filter(order => order.orderStatus === 'Pending'));
const processingOrders = sortByCreatedAt(allOrders.filter(order => order.orderStatus === 'Processing'));
const underDeliveryOrders = sortByCreatedAt(allOrders.filter(order => order.orderStatus === 'UnderDelivery'));
const completedOrders = allOrders.filter(order => order.orderStatus === 'Completed');
const cancelledOrders = allOrders.filter(order => order.orderStatus === 'Cancelled');
const returnedOrders = allOrders.filter(order => order.orderStatus === 'Returned'); 
//filter all status </>

//update order Status<>
const updateOrderStatus = async(orderId,status) => {
    try{
        await Altaxios.put(`order/updateOrderStatus/${orderId}/${status}`).then((res) => {
            if(res.status === 200){
                setUpdatedData([...getupdatedData,res.data._id]);
            }
        });
    }catch(error){
        console.log(error)
    }
};
//update order Status</>

//delete order<>
const deleteOrder = async(orderId) => {
    try{
        await Altaxios.delete(`order/deleteOrderStatus/${orderId}`).then((res) => {
            if(res.status === 200){
                setUpdatedData([...getupdatedData,res.data._id]);
            }
        });
    }catch(error){
        console.log(error)
    }
};
//delete order</>
  return (
    <div className="OrderdeshBordmainSection">
      <section className='Orderdeshborad__Main'>
        <h1>All Order Status</h1>
        <div className='allOrderContainer'>
            <div className='allOrderButtonContainer'>
                <button className='activeOrderbtn' onClick={changeOrderSection} id="OrderPending">Pending Order</button>
                <button onClick={changeOrderSection} id="OrderProcessing">Processing Order</button>
                <button onClick={changeOrderSection} id="OrderUnderDeliviry">Under Delivery</button>
                <button onClick={changeOrderSection} id="OrderComplete">Completed Order</button>
                <button onClick={changeOrderSection} id="OrderCancel">Cancelled Order</button>
                <button onClick={changeOrderSection} id="OrderReturn">Returned Order</button>
            </div>
        <div className='order_deshboard_innerContainer'>
        <div className='orderInnerHeading'>
            <ul className='orderInnerDesktioHeading'>
                <li>Number</li>
                <li>Order Product</li>
                <li>Total Quentity</li>
                <li>Product Price</li>
                <li>Total Price</li>
                <li>Action</li>
                <li>View Order</li>
                <li>Delete/Cancel</li>
                <li>Order Date/Time</li>
            </ul>
            <ul className='orderInnerMobileHeading'>
                <li>N</li>
                <li>Order</li>
                <li>Unit</li>
                <li>Price</li>
                <li>Total</li>
                <li>Action</li>
                <li>View</li>
                <li>Date</li>
            </ul>

        </div>
        <div className='Orderdeshbord__inner OrderPending ActiveOrderSection'>
            <ul>
                {
                    pendingOrders.length > 0 ? pendingOrders.map((d,index) => (
                    <li key={d._id}>
                        <div className='order_number'>{index+1}</div>
                        <div className='order_Images'>
                            {
                                d.colorOfQuentity.map((newData) => (
                                <div className='order_ImgContainer' key={newData.colorId}>
                                    <img style={{width:'40px'}} src={newData.colorImg} alt="ordered product" />
                                    <span>{newData.colorQuentity}x</span>
                                </div>    
                                ))
                            }
                        </div>
                        <div className='order_TotoalQuentity'>{d.totalQuentity}</div>
                        <div className='order_ProductPrice'>{d.productPrice}KD</div>
                        <div className='order_TotalPrice'>{d.grandTotal}KD</div>
                        <div className='order_ActionBtn'>
                            <button onClick={() => {updateOrderStatus(d._id,"Processing")}} className='orderActionDesktop'>Move to Processing</button>
                            <button onClick={() => {updateOrderStatus(d._id,"Processing")}} className='orderActionMobile'>Next</button>
                        </div>
                        <div className='order_viewbtn'><button onClick={() => {viewCustomerInfo(d._id)}}>View</button></div>
                        <div className='order_Cancelbtn'><button onClick={() => {updateOrderStatus(d._id,"Cancelled")}}>Cancel Order</button></div>
                        <div className='order_confirmDate'>{formatTimestamp(d.createdAt)}</div>
                    </li>    
                    ))
                    :
                    (<li><h2>No Data Available!</h2></li>)
                }
            </ul>
        </div>
        <div className='Orderdeshbord__inner OrderProcessing'>
        <ul>
        {
            processingOrders.length > 0 ? processingOrders.map((d,index) => (
                <li key={d._id}>
                    <div className='order_number'>{index+1}</div>
                    <div className='order_Images'>
                        {
                            d.colorOfQuentity.map((newData) => (
                            <div className='order_ImgContainer' key={newData.colorId}>
                                <img style={{width:'40px'}} src={newData.colorImg} alt="ordered product" />
                                <span>{newData.colorQuentity}x</span>
                            </div>    
                            ))
                        }
                    </div>
                    <div className='order_TotoalQuentity'>{d.totalQuentity}</div>
                    <div className='order_ProductPrice'>{d.productPrice}KD</div>
                    <div className='order_TotalPrice'>{d.grandTotal}KD</div>
                    <div className='order_ActionBtnProcessing'>
                        <button onClick={() => {updateOrderStatus(d._id,"UnderDelivery")}} className='orderActionDesktop'>Move to Delivered</button>
                        <button onClick={() => {updateOrderStatus(d._id,"UnderDelivery")}} className='orderActionMobile'>Next</button>
                    </div>
                    <div className='order_viewbtn'><button onClick={() => {viewCustomerInfo(d._id)}}>View</button></div>
                    <div className='order_Cancelbtn'><button onClick={() => {updateOrderStatus(d._id,"Cancelled")}}>Cancel Order</button></div>
                    <div className='order_confirmDate'>{formatTimestamp(d.createdAt)}</div>
                </li>    
            ))
                
             : 
            
            (<li><h2>No Data Available!</h2></li>)
        }
            </ul>
        </div>
        <div className='Orderdeshbord__inner OrderUnderDeliviry'>
        <ul>
        {
            underDeliveryOrders.length > 0 ? underDeliveryOrders.map((d,index) => (
                <li key={d._id}>
                    <div className='order_number'>{index+1}</div>
                    <div className='order_Images'>
                        {
                            d.colorOfQuentity.map((newData) => (
                            <div className='order_ImgContainer' key={newData.colorId}>
                                <img style={{width:'40px'}} src={newData.colorImg} alt="ordered product" />
                                <span>{newData.colorQuentity}x</span>
                            </div>    
                            ))
                        }
                    </div>
                    <div className='order_TotoalQuentity'>{d.totalQuentity}</div>
                    <div className='order_ProductPrice'>{d.productPrice}KD</div>
                    <div className='order_TotalPrice'>{d.grandTotal}KD</div>
                    <div className='order_ActionBtnindelivery'>
                        <button onClick={() => {updateOrderStatus(d._id,"Completed")}} className='orderActionDesktop'>Move to Completed</button>
                        <button onClick={() => {updateOrderStatus(d._id,"Completed")}} className='orderActionMobile'>Next</button>
                    </div>
                    <div className='order_viewbtn'><button onClick={() => {viewCustomerInfo(d._id)}}>View</button></div>
                    <div className='order_Cancelbtn'><button onClick={() => {updateOrderStatus(d._id,"Cancelled")}}>Cancel Order</button></div>
                    <div className='order_confirmDate'>{formatTimestamp(d.createdAt)}</div>
                </li>    
            ))
                
             : 
            
            (<li><h2>No Data Available!</h2></li>)
        }
            </ul>
        </div>
        <div className='Orderdeshbord__inner OrderComplete'>
        <ul>
        {
            completedOrders.length > 0 ? completedOrders.map((d,index) => (
                <li key={d._id}>
                    <div className='order_number'>{index+1}</div>
                    <div className='order_Images'>
                        {
                            d.colorOfQuentity.map((newData) => (
                            <div className='order_ImgContainer' key={newData.colorId}>
                                <img style={{width:'40px'}} src={newData.colorImg} alt="ordered product" />
                                <span>{newData.colorQuentity}x</span>
                            </div>    
                            ))
                        }
                    </div>
                    <div className='order_TotoalQuentity'>{d.totalQuentity}</div>
                    <div className='order_ProductPrice'>{d.productPrice}KD</div>
                    <div className='order_TotalPrice'>{d.grandTotal}KD</div>
                    <div className='order_ActionBtnCompleted'><CheckCircleOutlineIcon/></div>
                    <div className='order_viewbtn'><button onClick={() => {viewCustomerInfo(d._id)}}>View</button></div>
                    <div className='order_deletebtn'><button onClick={() => {deleteOrder(d._id)}}>Delete Order</button></div>
                    <div className='order_confirmDate'>{formatTimestamp(d.createdAt)}</div>
                </li>    
            ))
                
             : 
            
            (<li><h2>No Data Available!</h2></li>)
        }
            </ul>
        </div>
        <div className='Orderdeshbord__inner OrderCancel'>
        <ul>
        {
            cancelledOrders.length > 0 ? cancelledOrders.map((d,index) => (
                <li key={d._id}>
                    <div className='order_number'>{index+1}</div>
                    <div className='order_Images'>
                        {
                            d.colorOfQuentity.map((newData) => (
                            <div className='order_ImgContainer' key={newData.colorId}>
                                <img style={{width:'40px'}} src={newData.colorImg} alt="ordered product" />
                                <span>{newData.colorQuentity}x</span>
                            </div>    
                            ))
                        }
                    </div>
                    <div className='order_TotoalQuentity'>{d.totalQuentity}</div>
                    <div className='order_ProductPrice'>{d.productPrice}KD</div>
                    <div className='order_TotalPrice'>{d.grandTotal}KD</div>
                    <div className='order_ActionBtnCancel'><HighlightOffIcon/></div>
                    <div className='order_viewbtn'><button onClick={() => {viewCustomerInfo(d._id)}}>View</button></div>
                    <div className='order_deletebtn'><button onClick={() => {deleteOrder(d._id)}}>Delete Order</button></div>
                    <div className='order_confirmDate'>{formatTimestamp(d.createdAt)}</div>
                </li>    
            ))
                
             : 
            
            (<li><h2>No Data Available!</h2></li>)
        }
            </ul>
        </div>
        <div className='Orderdeshbord__inner OrderReturn'>
        <ul>
        {
            returnedOrders.length > 0 ? returnedOrders.map((d,index) => (
                <li key={d._id}>
                    <div className='order_number'>{index+1}</div>
                    <div className='order_Images'>
                        {
                            d.colorOfQuentity.map((newData) => (
                            <div className='order_ImgContainer' key={newData.colorId}>
                                <img style={{width:'40px'}} src={newData.colorImg} alt="ordered product" />
                                <span>{newData.colorQuentity}x</span>
                            </div>    
                            ))
                        }
                    </div>
                    <div className='order_TotoalQuentity'>{d.totalQuentity}</div>
                    <div className='order_ProductPrice'>{d.productPrice}KD</div>
                    <div className='order_TotalPrice'>{d.grandTotal}KD</div>
                    <div className='order_ActionBtnCancel'><HighlightOffIcon/></div>
                    <div className='order_viewbtn'><button onClick={() => {viewCustomerInfo(d._id)}}>View</button></div>
                    <div className='order_deletebtn'><button onClick={() => {deleteOrder(d._id)}}>Delete Order</button></div>
                    <div className='order_confirmDate'>{formatTimestamp(d.createdAt)}</div>
                </li>    
            ))
                
             : 
            
            (<li><h2>No Data Available!</h2></li>)
        }

    </ul>
        </div>
        </div>
        </div>
        <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      </section>
      <section className='singleOrder__Information'>
        {
            Object.keys(singleOrder).length > 0 ? (
                <div className='singleOrder__InfoInner'>
                <CloseIcon onClick={viewCustomerInfo}/>
            <div className='singleOrder__Status'>
                <h3>Order Status: {singleOrder.orderStatus}</h3>
                <h3>Order Recived at: {singleOrder?.createdAt && formatDate(singleOrder.createdAt)}</h3>
            </div>
            <div className='singleOrder__infoContainer'>

            <div className='singleOrder__ProductIfo'>
                <h4>Product Info</h4>
                <p>Order Id: {singleOrder._id}</p>
                <p>Product Id: {singleOrder.productId}</p>
                <p>Product Name: {singleOrder.productName}</p>
                <div className='singleOrder__ColorImgMain'>
                <h4>Selected Product & Color</h4>
                    <div className='dbh_singleOrderImageContainer'>
                        {
                            singleOrder.colorOfQuentity.length > 0 && singleOrder.colorOfQuentity.map((d) => (
                            <div className='singleOrder__ColorImgContainer' key={d.colorId}>
                                <div className='dbh_colorandsize'>
                                    <img src={d.colorImg} alt='order color' style={{width:'100px'}}/>
                                    <span className='colorNameInorder'>{d.colorName}</span>
                                    <span className='colorQuentityInorder'>{d.colorQuentity}x</span>
                                </div>
                                <div className='dbh_colorandsizeContainer'>
                                    <h2>Sizes:</h2>
                                    {
                                        d?.size ? Object.entries(d.size).map(([key,value]) => (
                                            <div className='dbh_colorsizeInner' key={key}>
                                            <span>{key}</span> <span>{value} pc</span>
                                        </div>
    
                                        )) :
                                         (<h4>One Size</h4>)
                                    }
                                </div>
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
            <div className='singleOrder__CusotmerIfo'>
                <div className='singleOrder__DeliveryInfo'>
                <h4>Delivery Address</h4>
                    <p>Customer ID: {singleOrder.customerId}</p>
                    <p>Area Name: {singleOrder.areaName}</p>
                    <p>block: {singleOrder.block}</p>
                    <p>Jedda: {singleOrder.gidda}</p>
                    <p>Street: {singleOrder.street} </p>
                    <p>House No: {singleOrder.houseNo} </p>
                    <p>Floor No: {singleOrder.floorNo} </p>
                    <p>Appartment No: {singleOrder.appartment} </p>
                    <p>Preferred Time: {singleOrder.preferredTime}</p>
                </div>
                <div className='singleOrder__CusotmrContecr'>
                    <h4>Contact Info</h4>
                    <p>Customer Name: {singleOrder.fullname}</p>
                    <p>Phone Number: +965{singleOrder.mobilenumber}</p>
                    <p>Email: {singleOrder.email}</p>
                </div>
            </div>
            </div>
            <div className='singleOrder__Actionbtns'>
                {
                    (singleOrder.orderStatus === "Pending" || 
                    singleOrder.orderStatus === "Processing" ||
                    singleOrder.orderStatus === "UnderDelivery"
                    ? 
                        <ReactToPrint
                        trigger={() => <button>Print Order Info</button>}
                        content={() => printRef.current}
                        documentTitle={`order-${singleOrder._id}`}
                    /> :
                    ""
                  )
                }

                {
                  ( singleOrder.orderStatus === "Pending" ? 
                    (<button onClick={() => {updateOrderStatus(singleOrder._id,"Processing")}}>Move To Processing</button>) :
                    singleOrder.orderStatus === "Processing" ?
                    (<button onClick={() => {updateOrderStatus(singleOrder._id,"UnderDelivery")}}>Move To Delivery</button>) : 
                    singleOrder.orderStatus === "UnderDelivery" ?
                    (<button onClick={() => {updateOrderStatus(singleOrder._id,"Completed")}}>Move To Completed</button>) :
                    (<button style={{color:'red'}} onClick={() => {deleteOrder(singleOrder._id); viewCustomerInfo()}}>Delete Order</button>)
                  )
                }
            </div>
        </div>
            ) : 
            (<h2>No Data Available!</h2>)
        }
            <PrintableOrder  ref={printRef} order={singleOrder} />
    </section>
    </div>
  )
}

export default AllOrder