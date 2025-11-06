import React, { useState } from 'react'
import {Altaxios} from '../../Altaxios';
import './view.css';
import numWords from 'num-words';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function SetTarget() {
    const [myTarget,setMyTarget] = useState({
        targetStartDate:"",
        targetEndDate:"",
        targetAmount:"",
        targetName:""
    });
    const [resMessage,setResMessage] = useState("");
    const [resMsgStyle,setResMsgStyle] = useState({});
    const [loading,setLoading] = useState(false);

let isChangeData = true;
if( myTarget.targetStartDate !== "" && 
    myTarget.targetEndDate !== "" &&
    myTarget.targetAmount !== "" &&
    myTarget.targetName !== "" 
){
    isChangeData = false
}else{
    isChangeData = true
}


    const setTargets = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        if(name === "targetAmount"){
            if(value.length <= 17){
                setMyTarget({
                    ...myTarget,
                    [name] : value
                })        
            }
        }else{
            setMyTarget({
                ...myTarget,
                [name] : value,
            })    
        }
    };
     
    const setDataToDatabase = async() => {
        setLoading(true);
        try{
            await Altaxios.post('/setgole/addNewGoles',myTarget).then((res) => {
                if(res.status === 200){
                    setResMessage(res.data);     
                    setResMsgStyle({color:"green",opacity:1,marginTop:"15px"});
                    setLoading(false);
                    setMyTarget({                        
                        targetStartDate:"",
                        targetEndDate:"",
                        targetAmount:"",
                        targetName:"",
                    });
                    setTimeout(() => {
                        setResMsgStyle({opacity:0,marginTop:"0px"});
                    },3000);
                }else{
                    setResMessage(res.data);
                    setResMsgStyle({color:"red",opacity:1,marginTop:"15px"});
                    setLoading(false);
                    setMyTarget({
                        targetStartDate:"",
                        targetEndDate:"",
                        targetAmount:"",
                        targetName:"",
                    });
                    setTimeout(() => {
                        setResMsgStyle({opacity:0,marginTop:"0px"});
                    },3000);        
                }
            })
        }catch(e){
            console.log(e)
        };
    };

function formatLargeNumber(number) {
    if (number >= 1e15) {
        return `${(number / 1e15).toFixed(0)} quadrillion`;
      } else if (number >= 1e12) {
        return `${(number / 1e12).toFixed(0)} trillion`;
      } else if (number >= 1e9) {
        return `${(number / 1e9).toFixed(0)} billion`;
      } else if (number >= 1e6) {
        return `${(number / 1e6).toFixed(0)} million`;
      } else if (number >= 1e3) {
        return `${(number / 1e3).toFixed(0)} thousand`;
      } else {
        return `${numWords(number)}`; // For smaller numbers, convert to words
      }
}


  return (
    <div className='setTargetMain'>
        <div className='setTargetInner'>
        <Link to="/" className="backToPrevious"><ArrowBackIcon/></Link>
            <h1>Set your Life time Target</h1>
            <div className='setCurrentTarget'>
                <div className='setCurrentTargetInner'>
                <div className='setTargetDateInput'>
                    <h2>Set Target Start Date</h2>
                    <input type='date' id="targetStartDate" value={myTarget.targetStartDate} name="targetStartDate" onChange={setTargets}/>
                </div>
                <div className='setTargetDateInput'>
                    <h2>Set Target End Date</h2>
                    <input type='date' id="setTargetDate" value={myTarget.targetEndDate} name="targetEndDate" onChange={setTargets}/>
                </div>
                <div className='setTargetAmountInput'>
                    <div className='setTargetAmountPopup'>
                        <h2>Set Target Amount</h2>
                        <span>{myTarget.targetAmount !== "" ? formatLargeNumber(Number(myTarget.targetAmount)) : ("")}</span>
                    </div>
                    <input type='number' max={1000000000000000} value={myTarget.targetAmount} placeholder='$1,000,000,000,000' id="setTargetAmount" name="targetAmount" onChange={setTargets}/>
                </div>
                <div className='setTargetAmountInput'>
                    <h2>Set Target Name</h2>
                    <input type='text' value={myTarget.targetName} placeholder='set your target name' id="targetName" name="targetName" onChange={setTargets}/>
                </div>
                </div>
                <div className='setTargetButton'>
                    <button onClick={setDataToDatabase} disabled={isChangeData}> {!loading ? "Set Your Gole" : "Setting..."}</button>
                </div>
            </div>
            <div className='showErrorOrSuccess' style={resMsgStyle}>{resMessage}</div>
        </div>
    </div>
  )
}

export default SetTarget