import React, { useEffect, useState } from 'react'
import FilterListIcon from '@mui/icons-material/FilterList';
// import {Altaxios} from '../../../Altaxios';
import { differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';

function ChangeDate({currentViewGoal,addTask,TimeDeffirent}) {
    const [deffirent,setDeffirent] = useState({year:0,month:0,week:0,day:0})
    const [amountPerYear, setAmountPerYear] = useState(0);
    const [amountPerMonth, setAmountPerMonth] = useState(0);
    const [amountPerWeek, setAmountPerWeek] = useState(0);
    const [amountPerDay, setAmountPerDay] = useState(0);
    const [currentTarget,setCurrentTarget] = useState(0);


    useEffect(() => {
               const diffYears = differenceInYears(currentViewGoal.targetEndDate, currentViewGoal.targetStartDate);
               const diffMonths = differenceInMonths(currentViewGoal.targetEndDate, currentViewGoal.targetStartDate);
               const diffWeeks = differenceInWeeks(currentViewGoal.targetEndDate, currentViewGoal.targetStartDate);
               const diffDays = differenceInDays(currentViewGoal.targetEndDate, currentViewGoal.targetStartDate);
               if (!isNaN(diffYears && diffMonths && diffWeeks && diffDays)) {
                setDeffirent({year:diffYears,month:diffMonths,week:diffWeeks,day:diffDays})
                }
               setAmountPerYear(diffYears > 0 ? (currentViewGoal.targetAmount / diffYears) : currentViewGoal.targetAmount);
               setAmountPerMonth(diffMonths > 0 ? (currentViewGoal.targetAmount / diffMonths) : currentViewGoal.targetAmount);
               setAmountPerWeek(diffWeeks > 0 ? (currentViewGoal.targetAmount / diffWeeks) : currentViewGoal.targetAmount);
               setAmountPerDay(diffDays > 0 ?  (currentViewGoal.targetAmount / diffDays) : currentViewGoal.targetAmount);
               setCurrentTarget(Math.floor(diffDays > 0 ? (currentViewGoal.targetAmount / diffDays) : currentViewGoal.targetAmount).toLocaleString());
   },[currentViewGoal]);

   useEffect(() => {
    TimeDeffirent(deffirent);
    },[deffirent,TimeDeffirent]);

  const setChunckTarget = (e) => {
    setCurrentTarget(e.target.value);
  }
     return (
    <div className='cashFlowDateSelectionMain'>
        <div className='ChangGoalTopPart'>
            <Link to="/"><ArrowBackIcon style={{fontSize:'30px !important',color:'#fc0'}}/></Link>
            <h2>{currentViewGoal.targetName}</h2>
            <button onClick={addTask}>Add Step</button>
        </div>
        <div className='cashFlowDateChange'>
            <div className='cashFlow__dateOne'>
                <h4>Select Date</h4>
                <div className='targetFinterOptions'>
                <select name="cashFlowDate" className='cashFlowDateSection' onChange={setChunckTarget}>
                    <option value={Math.floor(amountPerDay).toLocaleString()}>Today</option>
                    <option value={Math.floor(amountPerWeek).toLocaleString()}>This Week</option>
                    <option value={Math.floor(amountPerMonth).toLocaleString()}>This Month</option>
                    <option value={Math.floor(amountPerYear).toLocaleString()}>This Year</option>
                    <option value={Math.floor(currentViewGoal.targetAmount).toLocaleString()}>Full Target</option>
                    <option value="Custom">Custom</option>
                </select>
                    <FilterListIcon/>
                </div>
            </div>
            <div className='cashFlow__dateTwo'>
            <h4>Progress bar</h4>
                <div className='cashFlowProgressbar'>
                    <div className='cashFlowProgressbarInner'></div>
                </div>
            </div>
            <div className='cashFlow__dateThree'>
            <h4>Target</h4>
                <h2 className='cashFlowTargetCount'>${currentTarget}</h2>
            </div>
        </div>
    </div>
  )
}

export default ChangeDate