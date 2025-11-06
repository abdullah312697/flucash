import React, { useEffect } from 'react'
import GradientTimeDate from './clock/GradientTimeDate.js';
import {Altaxios} from '../../Altaxios'
import { useNavigate } from 'react-router-dom';

// import img from '../../../images/products/1.png';
function Main() {
  const navigate = useNavigate();

  useEffect(() => {
      Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
        if(res.status === 201 || res.data !== "All"){
          navigate("/newking");
        }
    })
    },[navigate]);
  
  return (
    <div className="deshBordmainSection">
      <section className='deshborad_top'>
        <GradientTimeDate/>
      </section>
      <section className='deshborad__Main'>
        <div className='deshbord__inner'>
          <table>
            <caption>Mon,May,20</caption>
            <thead>
              <tr>
                <th>Id</th>
                <th>Product</th>
                <th>Price</th>
                <th>Today Sale</th>
                <th>Total Sale</th>
                <th>Today Profit</th>
                <th>Target Sale</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>
              <tr>
                <td>2</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>
              <tr>
                <td>3</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>
              <tr>
                <td>4</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>
              <tr>
                <td>5</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>
              <tr>
                <td>6</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>
              <tr>
                <td>7</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>
              <tr>
                <td>8</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>
              <tr>
                <td>9</td>
                <td><img src="https://res.cloudinary.com/dwhrcr5ox/image/upload/v1719225116/nothun/productPhotos/1719225107228.png" alt="product_img"/></td>
                <td>20 KD</td>
                <td>10 Peace</td>
                <td>200 KD</td>
                <td>100 KD</td>
                <td>400 KD</td>
              </tr>

            </tbody>
          </table>
          {/* <div className='deshbord__inner_heading'>
            <span>Id</span>
            <span>Product</span>
            <span>Price</span>
            <span>Today Sale</span>
            <span>Total Sale</span>
            <span>Today Profit</span>
            <span>Target Sale</span>
          </div> */}
          {/* <div className='deshbord__inner_heading deshbord__inner_content'>
            <span>1</span>
            <img src={img} alt="product_img"/>
            <span>20 KD</span>
            <span>10 Peace</span>
            <span>200 KD</span>
            <span>100 KD</span>
            <span>400 KD</span>
          </div> */}
        </div>
      </section>
    </div>
  )
}

export default Main