import React, { useEffect, useState } from 'react';
import {Altaxios} from '../../Altaxios'
import { Link } from 'react-router-dom';

function Footer() {
  const [branding,setBranding] = useState([]);

  useEffect(() => {
      Altaxios.get("addproduct/getLogoandName").then((res) => {
        if(res.status === 200){
          setBranding(res.data.data);
        }
      });
    },[]);

  return (
    <div className='footerMain'>
      <div className='footerTopcontainer' style={{justifyContent:"center"}}>
        <div className='footerLeft'>
            {
                branding !== undefined && branding.length > 0 ?
                        <div className='logoAndNameinFooter'><Link to="/"><img src={branding[0].barndLogo} alt="logo"/> </Link><h2>{branding[0].brandName}</h2></div> :
                        <h5>loading...</h5>
            }
        </div>
        <div className='footerCenter' style={{width:"200px",justifyContent:"space-between",marginLeft:"40px",flexDirection:"row"}}>
                <Link to="/"><b>Deshbord</b></Link>
                <Link to="/"><b>Products</b></Link>
                <Link to="/"><b>Sales</b></Link>
        </div>
        </div>
        <div className='footerCopyWright'>
          <span>&copy; 2024 Nothun. All rights reserved.</span>
        </div>
    </div>
  )
}

export default Footer