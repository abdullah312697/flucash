import React, { useEffect, useState } from 'react'
import {Altaxios} from '../../Altaxios'
import FormData from 'form-data';
import DeleteIcon from '@mui/icons-material/Delete';
import PreDelete from './PreDelete';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ProductVideos({data}) {
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [videoFile, setVideoFile] = useState(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [loading,setLoading] = useState(false);
    const [currentlink,setCurrentLink] = useState("");
    const [publicId,setPublicId] = useState("");
    const [productAllVideos,setProductAllVideos] = useState([])
    const { productId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        Altaxios.get('/users/vefiryKingUsersLog').then((res) => {
        if(res.status === 201 || res.data !== "All"){
            navigate("/newking");
        }
    })
    },[navigate]);

    let isChangeData = true;
    if(videoSrc !== null){
        isChangeData = false
    }else{
        isChangeData = true
    }


    useEffect(() => {
        if (data) {
            setProductAllVideos(data ?? []);
        }
    }, [data]);
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          setVideoFile(file);
          const videoURL = URL.createObjectURL(file);
          setVideoSrc(videoURL);
          event.target.value = null;
        }
      };
    
        let formdataVideos = new FormData();
        formdataVideos.append("file",videoFile);
    //upload product data
    const cloudinaryFolderName = "productVideos";
        const UplodadVideo = async() => {
            setLoading(true);
            await Altaxios.put(`addproduct/uploadVideos/${encodeURIComponent(cloudinaryFolderName)}/${productId}`,formdataVideos,
            {headers: {'Content-Type': 'multipart/form-data',}}).then((res) => {
               if(res.status === 200){
                setProductAllVideos(res.data.data.ProductVideos ?? []);
                setResMessage(res.data.message);
                setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                formdataVideos = new FormData();
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"});
                    setVideoSrc(null);
                    setVideoFile(null)
                    setLoading(false);
                },3000);
               }else{
                setResMessage(res.data.message);
                setResMsgStyle({color:"red",opacity:1,marginTop:"15px",})
                setTimeout(() => {
                    setResMsgStyle({opacity:0,marginTop:"0px"})
                },3000)
               }
            });
        };

        const DeletePopup = (e) => {
            const showPopup = document.querySelector(".preDeletebtnContainer");
            showPopup.style = `display:block`;
            const newUrl = e.currentTarget.getAttribute("dataurl");
            const publiId = e.currentTarget.getAttribute("upblicid");
            setCurrentLink(publiId ?? "");
            setPublicId(newUrl ?? "")
        }
        const DeleteVideo = async() => {
            const showPopup = document.querySelector(".preDeletebtnContainer");
            await Altaxios.delete(`addproduct/deleteVideo/${encodeURIComponent(productId)}/${encodeURIComponent(currentlink)}/${encodeURIComponent(publicId)}`).then((res) => {
               if(res.status === 200){
                // setData(res.data.data)
                setProductAllVideos(res.data.data.ProductVideos ?? []);
                showPopup.style = `display:none`;
            }
            });
        }
    //upload product data
      return (
        <div className="contactContainerMain_DBH">
        <div className="contactinnerMain">
            <h2>Product Videos</h2>
        <div className='allProductVideos'>
                <PreDelete confirmDelete={DeleteVideo}/>
            {
                productAllVideos !== undefined && productAllVideos.length > 0 ? productAllVideos.map((d) => (
                    <div id="videoViewrlistAll" key={d._id}>
                        <DeleteIcon onClick={DeletePopup} dataurl={d.CloudinaryPublicId} upblicid={d._id}/>
                        <video width="100%" controls>
                            <source src={d.videoUrl} type={d.fileType} />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )) : <h3 style={{color:'#ccc'}}>Videos Not available</h3>
            }
        </div>
        <div className='contactInner' style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div className='addreviewsImageContainerOne' style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                    <label htmlFor='productVideo' className='addreviewimg addreviewimgOne'>
                      Add Product Video
                      <input  name="productVideo" type='file' id="productVideo" multiple={false} accept="video/*" onChange={handleFileChange}/>
                    </label>
                    {videoSrc && (
                   <div id="videoViewrlistTwo">
                   <video width="100%" controls>
                        <source src={videoSrc} type={videoFile.type} />
                        Your browser does not support the video tag.
                    </video>
                   </div>
                )}
            </div>
                <button className='contactsendbtn' onClick={UplodadVideo} disabled={isChangeData}>{loading ? "Uploading..." : "Upload"}</button>
                <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
            </div>
      </div>
      </div>
      )
    }

export default ProductVideos