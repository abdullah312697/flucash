import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductUpdate from './ProductUpdate';
import ProductVideos from './ProductVideos';
import ProductPhotos from './ProductPhotos';
import ProductFeauter from './ProductFeauter'
import ProductSpecification from './ProductSpecification'
import ProductDescription from './ProductDescription'
import ShortDescription from './ShortDescription'
import ProductColor from './ProductColor'
import ProductSize from './ProductSize'
import {Altaxios} from '../../Altaxios'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function EditProduct() {
    const [productData,setProductData] = useState({});
    const { productId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
          if(res.status === 201 || res.data !== "All"){
            navigate("/newking");
          }
      })
      },[navigate]);

    useEffect(() => {
        Altaxios.get(`addproduct/singleProductData/${productId}`).then((res) => {
            if(res.status === 200){
                setProductData(res.data)
            }
        });
    },[productId]);
    const ChangeTab = (e) => {
        const nextTab = e.currentTarget;
        const nextStyle = e.currentTarget.id;
        const prevTab = document.querySelector(".Dsh_current_Tab");
        const prevTabStyle = document.querySelector(".Dsh_current");
        const prevTabStyleSet = document.querySelector(`.${nextStyle}`);
        prevTab.classList.remove("Dsh_current_Tab");
        nextTab.classList.add("Dsh_current_Tab");
        prevTabStyle.classList.remove("Dsh_current");
        prevTabStyleSet.classList.add("Dsh_current");
    }
  return (
    <div className="EditProductMainSection">
        <div className='Dsh_editProductHeading'>
            <h2>Edit Product Data</h2>
            <Link to="/newking/addproduct">Add new Product</Link>
        </div>
     <div className='Dsh_editProdutInner'>
        <div className="Dsh_editProductInnerTab">
            <button className='Dsh_tabNavigation Dsh_current_Tab' id="new_product" onClick={ChangeTab}>Product</button>
            <button className='Dsh_tabNavigation' id="new_videos" onClick={ChangeTab}>Videos</button>
            <button className='Dsh_tabNavigation' id="new_photos" onClick={ChangeTab}>Photos</button>
            <button className='Dsh_tabNavigation' id="new_futurs" onClick={ChangeTab}>Futurs</button>
            <button className='Dsh_tabNavigation' id="new_specification" onClick={ChangeTab}>Specification</button>
            <button className='Dsh_tabNavigation' id="new_description" onClick={ChangeTab}>Description</button>
            <button className='Dsh_tabNavigation' id="new_shortdescription" onClick={ChangeTab}>Short Description</button>
            <button className='Dsh_tabNavigation' id="new_colors" onClick={ChangeTab}>Colors</button>
            <button className='Dsh_tabNavigation' id="new_sizes" onClick={ChangeTab}>Sizes</button>
        </div>
        <div className='Dsh_EditProContiner new_product Dsh_current'>
            <ProductUpdate data={productData}/>
        </div>
        <div className='Dsh_EditProContiner new_videos'>
           <ProductVideos data={productData?.ProductVideos ? productData.ProductVideos : ""}/>
        </div>
        <div className='Dsh_EditProContiner new_photos'>
            <ProductPhotos data={productData?.ProductPhotos ? productData.ProductPhotos : ""}/>
        </div>
        <div className='Dsh_EditProContiner new_futurs'>
            <ProductFeauter data={productData?.ProductFutures ? productData.ProductFutures : ""}/>
        </div>
        <div className='Dsh_EditProContiner new_specification'>
            <ProductSpecification data={productData?.ProductSpecification ? productData.ProductSpecification : ""}/>
        </div>
        <div className='Dsh_EditProContiner new_description'>
            <ProductDescription data={productData?.ProductDescription ? productData.ProductDescription : ""}/>
        </div>
        <div className='Dsh_EditProContiner new_shortdescription'>
            <ShortDescription data={productData?.ProductShortDescription ? productData.ProductShortDescription : ""}/>
        </div>
        <div className='Dsh_EditProContiner new_colors'>
            <ProductColor data={productData?.ProductColors ? productData.ProductColors : ""} isPublic={productData?.IsPublic ? productData.IsPublic : ""}/>
        </div>
        <div className='Dsh_EditProContiner new_sizes'>
            <ProductSize data={productData?.ProductSize ? productData.ProductSize : ""}/>
        </div>
     </div>
    </div>
  )
}

export default EditProduct