import Header from './frontend/client/components/Header';
import Footer from './frontend/client/components/Footer';
import { Outlet } from 'react-router-dom';

function userLayout() {
  return (
    <div className='userLayoutMain'>
      <Header/>
        <Outlet/>
      <Footer/>
    </div>
  )
}

export default userLayout