import React from 'react';
import QrScanner from 'react-qr-scanner';

function QrCodeCamera({ cameraActive, handleScan, handleError, startCamera, handleConfirm, switchCamera, offCamera, cameraId, resMsgStyle, resMessage, loading, qrData, delay}) {
    const mainData = qrData.split('/');
  return (
        <div className='thankspageInner'>
            <h2>Scan QR Code</h2>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'15px'}}>
            <button onClick={startCamera} disabled={cameraActive}>
                {cameraActive ? 'Camera Active' : 'Start Camera'}
            </button>
            <button onClick={offCamera} disabled={!cameraActive} style={{marginLeft:'50px'}}>
                {!cameraActive ? 'Camera Inactive' : 'Close Camera'}
            </button>
            </div>
            <p style={{width:'100%',textWrap:'pretty',color:'#ccc'}}>{qrData ? "QR Data: " + mainData[3] + "/" + mainData[4] : "No QR Data Found"}</p>
            {cameraActive && (
                <QrScanner
                    delay={delay}
                    onError={handleError}
                    onScan={handleScan}
                    constraints={{
                        video: { deviceId: cameraId ? { exact: cameraId } : undefined }
                    }}
                    className="qrScannerPreview"
                />                
            )}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <button onClick={switchCamera} disabled={!cameraActive} >
                    Switch Camera
                </button>
                <button onClick={handleConfirm} disabled={loading || !qrData} style={{ marginLeft: '40px' }}>
                    {loading ? 'Trying...' : 'Confirm'}
                </button>
            </div>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
  )
}
export default QrCodeCamera