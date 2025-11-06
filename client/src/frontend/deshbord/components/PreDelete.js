import React from 'react'

function PreDelete({confirmDelete,preDeleting}) {
    const cencelPopup = () => {
        const getpr = document.querySelector(".preDeletebtnContainer");
        getpr.style = `display:none`;
    }
  return (
    <div className='preDeletebtnContainer'>
    <div className="preDeletePopup">
        <h6>Are you sure to Delete!?</h6>
        <div className='deleteornotbutton'>
            <button className='nextnotsupportbtn' onClick={cencelPopup}>No</button>
            <button className='nextsupportbtn' onClick={confirmDelete}>Yes</button>
        </div>
    </div>
    {preDeleting && <div className='spinner'></div>}
    </div>
  )
}

export default PreDelete