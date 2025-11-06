import React, { useEffect, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import EditIcon from '@mui/icons-material/Edit';
import ToggleOffRoundedIcon from '@mui/icons-material/ToggleOffRounded';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';


function MyProduct() {
const [productsData,setProductsData] = useState([]);
const [CludpublicId,setCludpublicId] = useState("");
const [DeldocId,setDeldocId] = useState("");
const navigate = useNavigate();
useEffect(() => {
    Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
      if(res.status === 201 || res.data !== "All"){
        navigate("/newking");
      }
  })
  },[navigate]);

useEffect(() => {
    Altaxios.get("addproduct/allProducs").then((res) => {
        if(res.status === 200){
            setProductsData(res.data)
        }
    })
},[]);

const inStockToggle = (e,condition) => {
    const productId = e.currentTarget.getAttribute("productid");
    Altaxios.put(`addproduct/toggeInStock/${productId}`,{toggleName:condition}).then((res) => {
        if(res.status === 200){
            setProductsData(res.data.data)
        }
    });
};
const cencelPopupEight = () => {
    const getpr = document.querySelector(".preDeletebtnContainerEight");
    getpr.style = `display:none`;
}

const showDelPopup = (docid, publicid) => {
    const showPopup = document.querySelector(".preDeletebtnContainerEight");
    showPopup.style = `display:block`;
    setCludpublicId(publicid);
    setDeldocId(docid)
}
const DeleteProduct = async() => {
    const showPopup = document.querySelector(".preDeletebtnContainerEight");
    await Altaxios.delete(`addproduct/DeleteSingleProduct/${encodeURIComponent(DeldocId)}/${encodeURIComponent(CludpublicId)}`).then((res) => {
       if(res.status === 200){
        const pdata = res.data.data._id;
        const products = productsData.filter((docId) => (docId._id !== pdata));
        setProductsData(products);
        showPopup.style = `display:none`;
    }
    });
}

  return (
    <div className="EditProductMainSection">
        <h2>All Current Products</h2>
        <div className='preDeletebtnContainerEight'>
                <div className="preDeletePopup">
                    <h6>Are you sure to Delete!?</h6>
                    <div className='deleteornotbutton'>
                        <button className='nextnotsupportbtn' onClick={cencelPopupEight}>No</button>
                        <button className='nextsupportbtn' onClick={DeleteProduct}>Yes</button>
                    </div>
                </div>
                </div>

        <div className='AllProductList'>
{productsData !== undefined && productsData.length > 0 ? productsData.map((d) => (
            <div className='Dsh_productContainer' key={d._id}>
            <div className='allProductTopEditandDelete'>
                <DeleteIcon onClick={() => {showDelPopup(d._id, [d.FrontImage.publicId,d.BackImage.publicId])}} className='Dsh_deletebutton'/>
                <Link to={`/newking/editproduct/${d._id}`}><EditIcon className='Dsh_editbutton'/></Link>
            </div>
        <div className='Dsh_productTop'>
            <h3>{d.ProductName}</h3>
            <img src={d?.FrontImage?.image} alt="woman hand bag"/>
            <div className='Dsh_togglebtn'>
                <b>InStock: </b>
                <div className='Dsh__toggleContianer'>
                {
                    d.InStock !== true ?
                    <ToggleOffRoundedIcon className='Dsh_tooggleOffbtn' onClick={(e) => {inStockToggle(e,true)}} productid={d._id}/>
                    :
                    <ToggleOnRoundedIcon className='Dsh_tooggleOnbtn' onClick={(e) => {inStockToggle(e,false)}} productid={d._id}/>
                }
                </div>
            </div>
        </div>
        <div className='Dsh_startEndDate'>
            <span><b>start: </b> {format(d.StartDate, 'dd-MM-yyyy')}</span>
            <span><b>End: </b>{format(d.EndDate, 'dd-MM-yyyy')}</span>
        </div>
        <div className='Dsh_salesSection'>
            <span><b>Total Sales:</b> 1000KD</span>
            <span><b>Target Sales:</b> {d.TotalTargetSaleAmount}KD</span>
        </div>
        </div>

))
:
<h2>Data not avilable...</h2>
}
        </div>
    </div>
  )
}

export default MyProduct