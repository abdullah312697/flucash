import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import {closeMenu} from '../../../js/main.js';
import {Altaxios} from '../../Altaxios'
import GradientTimeDate from './clock/GradientTimeDate.js';

function Header() {
    const [branding,setBranding] = useState([]);

    useEffect(() => {
        Altaxios.get("addproduct/getLogoandName").then((res) => {
          if(res.status === 200){
            setBranding(res.data.data);
          }
        });
      },[]);

  return (
    <div className='headerMain'>
        <div className='desktop_header'>
            {
                branding !== undefined && branding.length > 0 ?
                        <div className='logoandName'>
                        <Link to="/"><img src={branding[0].barndLogo} alt='logo'/></Link>
                        <h1>{branding[0].brandName}</h1>
                        </div> :
                        <h5>loading...</h5>
            }
        <div className='pagesLink' style={{marginLeft:'160px'}}>
            <h1 style={{fontSize:'16px',marginBottom:'10px',color:'#ffd400',textAlign:'center'}}>بسم الله الرحمن الرحيم</h1>

            <ul>
                <li><NavLink to="/newking/orderstatus" end  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Deshbord </NavLink></li>
                <li><NavLink to="/newking/product" className={({ isActive }) => (isActive ? 'activemanue' : undefined)}> Products</NavLink>
                    <ul>
                        <li><NavLink to="orderstatus"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Order Status </NavLink></li>
                        <li><NavLink to="confirmorder"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Confirm Order </NavLink></li>
                        <li><NavLink to="addproduct"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Add Product </NavLink></li>
                        <li><NavLink to="changelogoandname"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Name&Logo </NavLink></li>
                        <li><NavLink to="addsliderdata"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Update Slider </NavLink></li>
                        <li><NavLink to="mycurrentproducts"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Current Products </NavLink></li>
                        <li><NavLink to="messages"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Messages </NavLink></li>
                        <li><NavLink to="campaign"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Campaign </NavLink></li>
                    </ul>
                </li>
                <li><NavLink to="/newking/view" className={({ isActive }) => (isActive ? 'activemanue' : undefined)}> Sales </NavLink></li>
            </ul>
        </div>
        <GradientTimeDate/>

        <div className='CartAndProfile'>
            {/* <div className='CartLogo'>
                <ShoppingCartRoundedIcon className='cartLogobtn'/>
                <span className='cartCount'>1</span>
            </div> */}
            <div className='loginOut'>logout</div>
        </div>
        </div>
        <div className='mobile_header'>
        <div className='mobileNavbutton'><MenuIcon onClick={closeMenu}/></div>
        <div className='mobile_menu'>
            <CloseIcon onClick={closeMenu}/>
            <div className='pagesLink'>
            <ul>
                <li><NavLink to="/newking/orderstatus" end  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Deshbord </NavLink></li>
                <li><NavLink to="/newking/product" className={({ isActive }) => (isActive ? 'activemanue' : undefined)}> Products</NavLink>
                    <ul>
                        <li><NavLink to="orderstatus"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Order Status </NavLink></li>
                        <li><NavLink to="confirmorder"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Confirm Order </NavLink></li>
                        <li><NavLink to="addproduct"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Add Product </NavLink></li>
                        <li><NavLink to="changelogoandname"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Name&Logo </NavLink></li>
                        <li><NavLink to="addsliderdata"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Update Slider </NavLink></li>
                        <li><NavLink to="mycurrentproducts"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Current Products </NavLink></li>
                        <li><NavLink to="messages"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Messages </NavLink></li>
                        <li><NavLink to="campaign"  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Campaign </NavLink></li>
                    </ul>
                </li>
                <li><NavLink to="/newking/view" className={({ isActive }) => (isActive ? 'activemanue' : undefined)}> Sales </NavLink></li>
            </ul>
            </div>
        </div>

        {
                branding !== undefined && branding.length > 0 ?
                        <div className='logoandName'>
                        <Link to="/"><img src={branding[0].barndLogo} alt='logo'/></Link>
                        <h1>{branding[0].brandName}</h1>
                        </div> :
                        <h5>loading...</h5>
            }

        <div className='CartAndProfile'>
            {/* <div className='CartLogo'>
                <ShoppingCartRoundedIcon className='cartLogobtn'/>
                <span className='cartCount'>1</span>
            </div> */}
            <div className='loginOut'>logout</div>
        </div>
        </div>
    </div>
  )
}

export default Header