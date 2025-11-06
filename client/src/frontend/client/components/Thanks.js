import React from 'react'
import { Link } from 'react-router-dom'

function Thanks() {

  return (
    <div className='contactContainerMain'>
      <div className='contactinnerMain'>
        <div className='thankspageInner'>
            <h2>Thank you for purchasing our product !</h2>
            <p>We will send you an email with all the order details.</p>
            <Link to="/">Back To Home</Link>
        </div>
      </div>
    </div>
  )
}

export default Thanks