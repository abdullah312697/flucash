import React, { useEffect, useState } from 'react';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import XIcon from '@mui/icons-material/X';
import { Link } from 'react-router-dom';
import SkeletonLoader from '../../SkeletonLoader.js';
import {Altaxios} from '../../Altaxios'

function Footer() {
  const [branding,setBranding] = useState([]);
  useEffect(() => {
    Altaxios.get("/addproduct/getLogoandName").then((res) => {
      if(res.status === 200){
        setBranding(res.data.data);
      }
    });
  },[]);

  return (
    <div className='footerMain'>
      <div className='footerTopcontainer'>
        <div className='footerLeft'>
            <div className='soocialLink'>
                <a href='https://www.facebook.com/profile.php?id=61562813587791' target='_blank' rel="noopener noreferrer"><FacebookRoundedIcon/></a>
                <a href='https://www.instagram.com/nothun.ecommerce/' target='_blank' rel="noopener noreferrer"><InstagramIcon/></a>
                <a href='https://www.youtube.com' target='_blank' rel="noopener noreferrer"><YouTubeIcon/></a>
                <a href='https://www.x.com' target='_blank' rel="noopener noreferrer"><XIcon/></a>
            </div>
            {
                              branding !== undefined && branding.length > 0 ?
                              <div className='logoAndNameinFooter'><Link to="/"><img src={branding[0].barndLogo} alt="logo"/> </Link><h2>{branding[0].brandName}</h2></div>
                              :
                              <SkeletonLoader mainGap="10px" mainWidth="215px" mainHeight="97px" headingW="40%"headingH="10px"chaildOneW="90%"allChaieldH="8px"chaildTwoW="70%"chaildThreeW="90%"chaildForeW="100%"/>              
            }
        </div>
        <div className='footerCenter'>
                <Link to="/"><b>Home Page</b></Link>
                <Link to="/"><b>About</b></Link>
                <Link to="/contact"><b>Contact us</b></Link>
                <Link to="/"><b>Wishlist</b></Link>
                <Link to="/cancelorder"><b>Cancel Order</b></Link>
                <Link to="/trackorder"><b>Track your Order</b></Link>
        </div>
        <div className='footerRight'>
            <h5>Contact us</h5>
            <p>Email: nothun.ecommerce@gmail.com</p>
        </div>
        </div>
        <div className='footerCopyWright'>
          <span>&copy; 2024 Nothun. All rights reserved.</span>
        </div>
    </div>
  )
}

export default Footer