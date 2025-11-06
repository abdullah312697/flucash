import React from 'react'
import Header from './frontend/deshbord/components/Header';
import Footer from './frontend/deshbord/components/Footer';
import { Outlet } from 'react-router-dom';
function DeshbordLayout() {
  return (
    <div className='deshboreMain'>
        <Header/>
            <Outlet/>
        <Footer/>
    </div>
  )
}

export default DeshbordLayout