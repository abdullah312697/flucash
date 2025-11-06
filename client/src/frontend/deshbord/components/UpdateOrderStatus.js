import React, { useState, useEffect } from 'react';
import {Altaxios} from '../../Altaxios'
import { useNavigate } from 'react-router-dom';
import QrCodeCamera from './QrCodeCamera';

function UpdateOrderStatus() {
    const [qrData, setQRData] = useState('');
    const [loading, setLoading] = useState(false);
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraId, setCameraId] = useState(null);
    const [videoDevices, setVideoDevices] = useState([]);
    const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
        if(res.status === 201 && res.data !== "All" && res.data !== "Delivery"){
            navigate('/newking');
        }
    })
    },[navigate]);
    const handleScan = (data) => {
        if (data) {
            setQRData(data.text);
            setCameraActive(false);
        }
    };

    const handleError = (err) => {
        console.error(err);
        setResMessage("Error scanning QR code");
        setQRData('');
        setResMsgStyle({color:"red",opacity:1,marginTop:"15px"});    
    };

    const handleConfirm = async () => {
        if (!qrData) {
            setResMessage("No QR code data found");
            setQRData('');
            setResMsgStyle({color:"red",opacity:1,marginTop:"15px"});        
            return;
        }

        setLoading(true);

        try {
             await Altaxios.put(qrData).then((res) => {
                if (res.status === 200) {
                    setQRData('');
                    setResMessage("Order status updated successfully");
                    setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});    
                    setTimeout(() => {
                        setResMsgStyle({opacity:0,marginTop:"0px"})
                    },3000)
                } else {
                    setQRData('');
                    setResMessage(res.data);
                    setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
                    setTimeout(() => {
                        setResMsgStyle({opacity:0,marginTop:"0px"})
                    },3000)
                }    
            });
        } catch (err) {
            console.error(err);
            setResMessage("Error updating order status")
            setResMsgStyle({color:"red",opacity:1,marginTop:"15px"});        
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async() => {
        setCameraActive(true);
        setResMessage('')
        setQRData('');
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            setVideoDevices(videoDevices);
            console.log('Available video devices:', videoDevices); // Debug log

            let selectedDeviceId;

            if (isMobile()) {
                // Select the back camera on mobile devices
                selectedDeviceId = videoDevices.find(device => device.label.toLowerCase().includes('back'))?.deviceId;
            } else {
                // Select the front camera on laptops
                selectedDeviceId = videoDevices.find(device => device.label.toLowerCase().includes('front'))?.deviceId;
            }

            if (!selectedDeviceId && videoDevices.length > 0) {
                // Fallback to the first available camera if a specific camera is not found
                selectedDeviceId = videoDevices[0].deviceId;
            }

            console.log('Selected camera ID:', selectedDeviceId); // Debug log

            setCameraId(selectedDeviceId);
        } catch (err) {
            console.error(err);
            setResMessage("Error accessing cameras")
            setResMsgStyle({color:"red",opacity:1,marginTop:"15px"});        
        }
    };
    
const isMobile = () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  };

    const offCamera = () => {
        setCameraActive(false);
        setResMessage('')
        setQRData('');
    };
    const switchCamera = () => {
        if (videoDevices.length > 1) {
            const newIndex = (currentCameraIndex + 1) % videoDevices.length;
            setCurrentCameraIndex(newIndex);
            setCameraId(videoDevices[newIndex].deviceId);
        }
    };

  return (
    <div className='contactContainerMain'>
      <div className='contactinnerMain'>
        <QrCodeCamera   cameraActive={cameraActive}
                        handleScan={handleScan}
                        handleError={handleError}
                        startCamera={startCamera}
                        handleConfirm={handleConfirm}
                        switchCamera={switchCamera}
                        offCamera={offCamera}
                        cameraId={cameraId}
                        resMsgStyle={resMsgStyle}
                        resMessage={resMessage}
                        loading={loading}
                        qrData={qrData}
                        delay={3000}
                        />
      </div>
    </div>
  )
}
export default UpdateOrderStatus