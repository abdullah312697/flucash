import { useEffect, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import {closeMenu} from '../../../js/main.js';
import {Altaxios} from '../../Altaxios'

function Header() {
    const [branding,setBranding] = useState([]);
    const [isLogin,setIsLogin] = useState("");
    const param = useParams();

useEffect(() => {
  const verifyUser = async () => {
    try {
      const response = await Altaxios.get('/users/vefiryUsersLog');
      if (response.status === 200) {
        setIsLogin(false);
      }
    } catch (error) {
      if (error.response) {
        setIsLogin(true);
        console.log(error.response.data.message);
      } else {
        console.log("Unknown error:", error);
      }
    }
  };
  verifyUser();
}, [param]);

    useEffect(() => {
        Altaxios.get("/addproduct/getLogoandName").then((res) => {
          if(res.status === 200){
            setBranding(res.data.data);
          }
        });
      },[]);
      
      const logOut = () => {
        Altaxios.get("/users/logOut").then((res) => {
            if(res.status === 200){
                setIsLogin(true);
            }
          });  
      };

  return (
    <div className='headerToMainsection'>
    <div className='headerMain'>
        <div className='desktop_header'>
            {
                
                branding !== undefined && branding.length > 0 ?
                (<div className='logoandName'>
                    <Link to="/"><img src={branding[0].barndLogo} alt='logo'/></Link>
                    <h1>{branding[0].brandName}</h1>
                </div>)
                :
                    (<h6>Loading...</h6>)
            }
        <div className='pagesLink'>
            <ul>
                <li><NavLink to="/" end  className={({ isActive }) => (isActive ? 'activemanue' : undefined)} > Home </NavLink></li>
                <li><NavLink to="/contact" className={({ isActive }) => (isActive ? 'activemanue' : undefined)}> Contact </NavLink></li>
                <li><NavLink to="/product/666ad8c978581969a68645ac" className={({ isActive }) => (isActive ? 'activemanue' : undefined)}> Product </NavLink></li>
                <li><NavLink to="/cart" className={({ isActive }) => (isActive ? 'activemanue' : undefined)}> Cart </NavLink></li>
            </ul>
        </div>
        <div className='CartAndProfile'>
            {
                isLogin && isLogin !== "" ? (<Link to="/login"><div className='loginOut_in'>Login</div></Link>) : 
                (<div className='loginOut_out' onClick={logOut}>Logout</div>)
            }
        </div>
        </div>
        <div className='mobile_header'>
        <div className='mobileNavbutton'><MenuIcon onClick={closeMenu}/></div>
        <div className='mobile_menu'>
            <CloseIcon onClick={closeMenu}/>
            <div className='pagesLink'>
                <ul>
                    <li><NavLink to="/" end className={({ isActive }) => (isActive ? 'activemanue' : undefined)} onClick={closeMenu}> Home </NavLink></li>
                    <li><NavLink to="/contact" className={({ isActive }) => (isActive ? 'activemanue' : undefined)} onClick={closeMenu}> Contact </NavLink></li>
                    <li><NavLink to="/product/666ad8c978581969a68645ac" className={({ isActive }) => (isActive ? 'activemanue' : undefined)} onClick={closeMenu}> Product </NavLink></li>
                    <li><NavLink to="/cart" className={({ isActive }) => (isActive ? 'activemanue' : undefined)} onClick={closeMenu}> Cart </NavLink></li>
                </ul>
            </div>
        </div>

        {
                
                branding !== undefined && branding.length > 0 ?
                <div className='logoandName'>
                    <Link to="/"><img src={branding[0].barndLogo} alt='logo'/></Link>
                    <h1>{branding[0].brandName}</h1>
                </div>
                :
                <h2>loading...</h2>
            }
        <div className='CartAndProfile'>
            {
                isLogin && isLogin !== "" ? (<Link to="/login"><div className='loginOut_in'>Login</div></Link>) : 
                (<div className='loginOut_out' onClick={logOut}>Logout</div>)
            }
        </div>
        </div>
    </div>
    </div>
  )
}

export default Header