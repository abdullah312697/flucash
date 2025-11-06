import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PreDelete from '../../deshbord/components/PreDelete';
import { differenceInYears, differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';
import {Altaxios} from '../../Altaxios';
import { Link } from 'react-router-dom';
import '../../deshbord/components/gpt/view.css';

function Goals() {
    const [Alldata,setAllDatas] = useState([]);
    const [deleteGoalId,setDeleteGoalId] = useState("");
  
    useEffect(() => {
      Altaxios.get('/setgole/getGoleData').then((res) => {
        if(res.status === 200){
          setAllDatas(res.data);
        }
        })
    },[]);
  
    function newDifferent(endTime, startTime) {
      const diffYears = differenceInYears(endTime, startTime);
      if (diffYears !== 0) {
          return `${diffYears} year${diffYears === 1 ? '' : 's'}`;
      }
      const diffMonths = differenceInMonths(endTime, startTime);
      if (diffMonths !== 0) {
          return `${diffMonths} month${diffMonths === 1 ? '' : 's'}`;
      }
      const diffWeeks = differenceInWeeks(endTime, startTime);
      if (diffWeeks !== 0) {
          return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'}`;
      }
  
      const diffDays = differenceInDays(endTime, startTime);
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  };
  
      const DeletePopup = (gId) => {
        const showPopup = document.querySelector(".preDeletebtnContainer");
        showPopup.style = `display:block`;
        setDeleteGoalId(gId)
    }
    // deleteGoalId,setDeleteGoalId
    const DeleteGoal = async() => {
        const showPopup = document.querySelector(".preDeletebtnContainer");
        await Altaxios.delete(`/setgole/deleteGoal/${deleteGoalId}`).then((res) => {
           if(res.status === 200){
            const filterDeleted = Alldata.filter((d) => (d._id !== res.data._id));
            setAllDatas(filterDeleted)
            showPopup.style = `display:none`;
        }
        });
    }
  
    return (
      <div className="View">
        <div className='viewInnerMain'>
          <div className='cashFlowHeading'>
            <h1 className='biusinness__cashflowheading'>Business Cash Flow</h1>
            <Link to="/settarget">Set Target</Link>
          </div>
  
          <div className='allGoalList'>
          <PreDelete confirmDelete={DeleteGoal}/>
          <div className='allGoalListTopSection'>
            <h2>All Goals</h2>
            <div className='allGoalListHeader'>
              <div className='allGoalListHeader_dateStart'>Start Date</div>
              <div className='allGoalListHeader_dateEnd'>End Date</div>
              <div className='allGoalListHeader_dateDiffirent'>Timeframe</div>
              <div className='allGoalListHeader_dateProgress'>Milestone</div>
              <div className='allGoalListHeader_dateAmount'>Amount</div>
              <div className='allGoalListHeader_dateName'>Name</div>
              <div className='allGoalListHeader_dateView'>View</div>
              <div className='allGoalListHeader_dateEdit'>Update</div>
              <div className='allGoalListHeader_dateDelete'>Action</div>
            </div>  
            </div>
            <div className='allGoalInnerContainer'>
            {Alldata.length > 0 ? 
              Alldata.map((goal,index) => (
                <div className='allGoalListInner' key={index} style={{backgroundColor: index % 2 === 0 ? '#011626' : '#cccccc1a',}}>
                <div className='allGoal_allinOneStyle allGoalListInner_dateStart'>{goal.targetStartDate}</div>
                <div className='allGoal_allinOneStyle allGoalListInner_dateEnd'>{goal.targetEndDate}</div>
                <div className='allGoal_allinOneStyle allGoalListInner_dateDiffirent'>{newDifferent(goal.targetEndDate, goal.targetStartDate)}</div>
                <div className='allGoal_allinOneStyle allGoalListInner_dateProgress'>
                  <div className='cashFlowProgressbar' style={{width:"100px",height:'6px'}}>
                        <div className='cashFlowProgressbarInner'></div>
                  </div>
                </div>
                <div className='allGoal_allinOneStyle allGoalListInner_dateAmount'>{goal.targetAmount}</div>
                <div className='allGoal_allinOneStyle allGoalListInner_dateName'>{goal.targetName}</div>
                <div className='allGoal_allinOneStyle allGoalListInner_dateView'><Link to={`/viewgoal/${goal._id}`}>View</Link></div>
                <Link to={`/updategoal/${goal._id}`}><EditIcon className='allGoal_allinOneStyle allGoalListInner_dateEdit'/></Link>
                <DeleteIcon onClick={() => {DeletePopup(goal._id)}} className='allGoal_allinOneStyle allGoalListInner_dateDelete'/>
              </div>  
              ))
              : 
              (<h1>You have any goal</h1>)
            }
            </div>
          </div>
        </div>
      </div>
    );
  }

export default Goals