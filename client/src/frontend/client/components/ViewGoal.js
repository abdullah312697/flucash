import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams } from 'react-router-dom';
import ChangeDate from './ChangeDate';
import {Altaxios} from '../../Altaxios';
import './view.css';
import debounce from 'lodash.debounce';
import CloseIcon from '@mui/icons-material/Close';
import PreDelete from './PreDelete';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
function ViewGoal() {
  const { goalId } = useParams();
  const [viewGoal,setViewGoal] = useState({targetAmount:0,targetEndDate:0,targetName:"",targetStartDate:0,goalLadder:[]});
  const [goalLadder,setGoalLadder] = useState([]);
  const [deffirent,setDeffirent] = useState({year: 0, month: 0, week: 0, day: 0});
  const [stepIdForDelete,setStepIdForDelete] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const inputRefs = useRef({});
  const [errorMsg,setErrorMsg] = useState("");
  const [errStyle,setErrStyle] = useState({});
  const Assigndate = new Date();
  const formattedDate = Assigndate.toLocaleDateString('en-GB');
  const [newTotalSum,setNewTotalSum] = useState({
    ProductPrice:0,
    TotalSoldAmount:0,
    TodaySoldAmount:0,
    TodayTargetSaleAmount:0,
    TotalTargetSaleAmount:0,
    TotalSoldQuentity:0,
    TodaySoldQuentity:0,
    TodayTargetQuentity:0,
    TotalTargetQuentity:0,
    TodayReturn:0,
    TotalReturn:0,
    InStockQuentity: 0,
    InStockAvailableQuentity: 0,
    TodayTotaladCost:0,
    TodayadCostPerSale:0,
    TotalAdCostPerSale:0,
    TotalAdCost:0,
    TodayOtherCost:0,
    TodayOtherCostPerSale:0,
    TotalOtherCostPerSale:0,
    TotalOtherCost:0,
    TodayDelibaryCost:0,
    TodayDelibaryCostPersale:0,
    TotalDelibaryCostPersale:0,
    TotalDelibaryCost:0,
    TodayTotalProfit:0,
    TodayProfitPerSale:0,
    TotalProfitPerSale:0,
    TotalProfit:0,
    TodayTargetProfit:0,
    TotalTargetProfit:0,
    TotalPackgingCost:0,
    PackgingCostPerProduct:0,
    TotalPrductBuyingCost:0,
    BuyingCostPerProduct:0,
    TotalShippingCost:0,
    ShippingCostPerProduct:0,
    TotalProcessingCost:0,
    ProcessingCostPerProduct:0,
  });


  const [productCalculation, setProductCalculation] = useState({
    AssignDate:formattedDate,
    ProductName:"",
    ProductPrice:0,
    TotalSoldAmount:0,
    TodaySoldAmount:0,
    TodayTargetSaleAmount:0,
    TotalTargetSaleAmount:0,
    TotalSoldQuentity:0,
    TodaySoldQuentity:0,
    TodayTargetQuentity:0,
    TotalTargetQuentity:0,
    TodayReturn:0,
    TotalReturn:0,
    InStockQuentity: 0,
    InStockAvailableQuentity: 0,
    TodayTotaladCost:0,
    TodayadCostPerSale:0,
    TotalAdCostPerSale:0,
    TotalAdCost:0,
    TodayOtherCost:0,
    TodayOtherCostPerSale:0,
    TotalOtherCostPerSale:0,
    TotalOtherCost:0,
    TodayDelibaryCost:0,
    TodayDelibaryCostPersale:0,
    TotalDelibaryCostPersale:0,
    TotalDelibaryCost:0,
    TodayTotalProfit:0,
    TodayProfitPerSale:0,
    TotalProfitPerSale:0,
    TotalProfit:0,
    TodayTargetProfit:0,
    TotalTargetProfit:0,
    TotalPackgingCost:0,
    PackgingCostPerProduct:0,
    TotalPrductBuyingCost:0,
    BuyingCostPerProduct:0,
    TotalShippingCost:0,
    ShippingCostPerProduct:0,
    TotalProcessingCost:0,
    ProcessingCostPerProduct:0,
  });
  // let proLength = goalLadder.length;
  const proLength = useRef(null);
  proLength.current = goalLadder.length;
  useEffect(() => {
    Altaxios.get(`/setgole/getOneGoal/${goalId}`).then(res => {
      if(res.status === 200){
        const targetData = res.data;
        if(targetData){
          setViewGoal({
            targetAmount:targetData.targetAmount,
            targetEndDate:targetData.targetEndDate,
            targetName:targetData.targetName,
            targetStartDate:targetData.targetStartDate,
            goalLadder:targetData.goalLadder
          });
          setGoalLadder(targetData.goalLadder || []);
        }
      }
    })
  },[goalId]);
// add first gola function start <>
  const addFirstGoal = async(firstAddGoal) => {
    try{
        await Altaxios.put(`/setgole/addNewGoalLadder/${goalId}`, firstAddGoal).then(res => {
          if(res.status === 200){
            const targetData = res.data;
            if(targetData){
              debouncedCalculateValues("add", targetData);
            }
          }
        });      
    }catch(error){
      console.log(error)
    }
  };
// add first gola function end </>
//handle error function start <>
  const handleError = useCallback((message,color) => {
    setErrorMsg(message);
    setErrStyle({ color: color, opacity: 1 });
    setTimeout(() => {
      setGoalLadder(viewGoal.goalLadder || []); // Reset to the original goal ladder
      setErrStyle({ opacity: 0 }); // Hide error
      setAddingTask(false); // Stop the adding task process
    }, 3000);
    },[viewGoal.goalLadder]);
//handle error function end </>

//handle update function start <>
const handleUpdate = useCallback(async(updatedValues) => {
  await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedValues).then(res => {
    if(res.status === 200){
      const targetData = res.data;
      if(targetData){
        setGoalLadder(targetData || []);
        setViewGoal({...viewGoal, goalLadder:targetData});
        setAddingTask(false);
      }
    }else{
        setErrorMsg("You change is not update!");
        setErrStyle({color:'red',opacity:1});
        setTimeout(() => {
          setErrStyle({opacity:0});
          setAddingTask(false);
        },3000);
      }
  });  
},[goalId,viewGoal]);
// handle update function end </>
const calculateAllSum = useCallback(() => {
  const newFormateObject = {
    ProductPrice:0,
    TotalSoldAmount:0,
    TodaySoldAmount:0,
    TodayTargetSaleAmount:0,
    TotalTargetSaleAmount:0,
    TotalSoldQuentity:0,
    TodaySoldQuentity:0,
    TodayTargetQuentity:0,
    TotalTargetQuentity:0,
    TodayReturn:0,
    TotalReturn:0,
    InStockQuentity: 0,
    InStockAvailableQuentity: 0,
    TodayTotaladCost:0,
    TodayadCostPerSale:0,
    TotalAdCostPerSale:0,
    TotalAdCost:0,
    TodayOtherCost:0,
    TodayOtherCostPerSale:0,
    TotalOtherCostPerSale:0,
    TotalOtherCost:0,
    TodayDelibaryCost:0,
    TodayDelibaryCostPersale:0,
    TotalDelibaryCostPersale:0,
    TotalDelibaryCost:0,
    TodayTotalProfit:0,
    TodayProfitPerSale:0,
    TotalProfitPerSale:0,
    TotalProfit:0,
    TodayTargetProfit:0,
    TotalTargetProfit:0,
    TotalPackgingCost:0,
    PackgingCostPerProduct:0,
    TotalPrductBuyingCost:0,
    BuyingCostPerProduct:0,
    TotalShippingCost:0,
    ShippingCostPerProduct:0,
    TotalProcessingCost:0,
    ProcessingCostPerProduct:0,
  }

  const toValidNumber = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 0;
    }
    return num; 
  };
  const result = {};
  Object.keys(newFormateObject).forEach((key) => {
    const sum = viewGoal.goalLadder.reduce((acc, obj) => {
      return acc + toValidNumber(obj[key]);
    }, 0);
        result[key] = Math.round(sum * 100) / 100;
  });
  setNewTotalSum(result);
},[viewGoal.goalLadder]);

useEffect(() => {
  calculateAllSum();
},[calculateAllSum]);

//calculate all the field function Main start<>
const calculateAndUpdateFields = useCallback(async(isCond, updatedGoals, newValue, id, updname) => {
    try{
        const totalNum = Number(viewGoal.targetAmount); 
        // const finalNum = Number(newValue);
      if(isCond === "update"){
        const checkAndRunFunction = (array, callback) => {
          for (const obj of array) {
            for (const value of Object.values(obj)) {
              if (value === "" || value === null || value === undefined || Number.isNaN(value)) {
                callback(`Value cannot be empty.`,"red");
                return;
              }
            }
          }
        };
        checkAndRunFunction(updatedGoals,handleError);
        const outhotLock = updatedGoals.filter((d) => (d.isLock !== true));
        const totalSumLock = updatedGoals.reduce((acc, item) => {
          return item.isLock === true ? acc + Number(item.TotalTargetSaleAmount) : acc;
        }, 0);

        let updatedValueTotla
        if(totalSumLock > totalNum){
          handleError(`Your goal cannot exceed ${totalNum}`,"red");
          return  
        }else{
          updatedValueTotla = (totalNum - totalSumLock) / outhotLock.length
        };

        const calculateTargetQuentities = (saleAmount, productPrice, days) => ({
          total: Math.ceil(productPrice > 0 ? saleAmount / productPrice : 0),
          today: Math.ceil(productPrice > 0 ? (saleAmount / days) / productPrice : 0)
        });

        if (updatedGoals.some((item) => item.TotalTargetSaleAmount > totalNum)) {
          handleError(`Your target is only ${totalNum}`, "red");
          return;
        }
        const updatedValues = updatedGoals.map(item => {
          const isLocked = item.isLock;
          const saleAmount = isLocked ? item.TotalTargetSaleAmount : updatedValueTotla;
          const { total: totalQuentity, today: todayQuentity } = calculateTargetQuentities(saleAmount, item.ProductPrice, deffirent.day);
          return {
            ...item,
            TotalTargetSaleAmount: Math.ceil(saleAmount),
            TodayTargetSaleAmount: Math.ceil(saleAmount / deffirent.day),
            TotalTargetQuentity: totalQuentity,
            TodayTargetQuentity: todayQuentity,
          };
        });
        const totalSum = Math.ceil(
          updatedValues.reduce((acc, item) => acc + Number(item.TotalTargetSaleAmount), 0)
        );
        if(totalSum > totalNum + 100){
          handleError(`Your goal cannot exceed ${totalNum}`,"red");
          return
        }
    const updatedSoldValue = updatedValues.map(newItem => {
        const oldItem = viewGoal.goalLadder.find(old => old._id === newItem._id);
        if (!oldItem) return newItem;
        const totalTargetSaleAmount = newItem.TotalTargetSaleAmount;
        const todayTargetSaleAmount = newItem.TodayTargetSaleAmount;
        let todaySoldQuentity = newItem.TodaySoldQuentity;
        const productPrice = newItem.ProductPrice;
        const todayReturn = newItem.TodayReturn;
        const todayTotaladCost = newItem.TodayTotaladCost;
        const todayOtherCost = newItem.TodayOtherCost;
        const todayDelibaryCostPersale = newItem.TodayDelibaryCostPersale;
        const todayProfitPerSale = newItem.TodayProfitPerSale;
        const totalPackgingCost = newItem.TotalPackgingCost;
        const packgingCostPerProduct = newItem.PackgingCostPerProduct;
        const inStockQuentity = newItem.InStockQuentity;
        const buyingCostPerProduct = newItem.BuyingCostPerProduct;
        const totalPrductBuyingCost = newItem.TotalPrductBuyingCost;
        const totalShippingCost = newItem.TotalShippingCost;
        const newShippingCost = newItem.ShippingCostPerProduct;   
        const todayProfitCostPerSaleNew = newItem.TodayProfitPerSale;   
        const totalTodayReturn = oldItem.TodayReturn !== todayReturn ? oldItem.TodayReturn > todayReturn ? "small" : "big" : "same";
        const finalTodayReturn = totalTodayReturn === "same" ?
        todayReturn :
        totalTodayReturn === "small" ?
        newItem.TotalReturn - (oldItem.TodayReturn - todayReturn)
        : 
        newItem.TotalReturn + (todayReturn - oldItem.TodayReturn);

        if(totalTodayReturn === "small"){
          todaySoldQuentity += (oldItem.TodayReturn - todayReturn)
        }else{
          todaySoldQuentity -= (todayReturn - oldItem.TodayReturn)
        }
        const totalSoldQt = oldItem.TodaySoldQuentity !== todaySoldQuentity ? oldItem.TodaySoldQuentity > todaySoldQuentity ? "small" : "big" : "same";
        const newTotalSoldQuentity = 
        totalSoldQt === "same" ?
        todaySoldQuentity :
        totalSoldQt === "small" ? 
        newItem.TotalSoldQuentity - (oldItem.TodaySoldQuentity - todaySoldQuentity) : 
        newItem.TotalSoldQuentity + (todaySoldQuentity - oldItem.TodaySoldQuentity);

  const newTodaySoldAmount = todaySoldQuentity * productPrice;
  const newTotalSoldAmount = newTotalSoldQuentity * productPrice;
  const totalNewadCostPerSale = todayTotaladCost > 0 && todaySoldQuentity > 0 ? todayTotaladCost / todaySoldQuentity : 0;
  const getNewAdCost = oldItem.TodayTotaladCost !== todayTotaladCost ? oldItem.TodayTotaladCost > todayTotaladCost ? "small" : "big" : "same";
  const newTotalAdCost = 
  getNewAdCost === "same" ?
  todayTotaladCost :
  getNewAdCost === "small" ? 
  newItem.TotalAdCost - (oldItem.TodayTotaladCost - todayTotaladCost) : 
  newItem.TotalAdCost + (todayTotaladCost - oldItem.TodayTotaladCost);
  const newTotaAdCostPerSale = newTotalAdCost > 0 && newTotalSoldQuentity > 0 ? newTotalAdCost / newTotalSoldQuentity : 0;
  const newInStockAvailableQuentity = Math.max(
    0,
    inStockQuentity - newTotalSoldQuentity
  );
  const todayTargetQuentity = productPrice > 0 ? todayTargetSaleAmount / productPrice : 0;
  const totalTargetQuentity = productPrice > 0 ? totalTargetSaleAmount / productPrice : 0;
  const todayOtherCostPerSaleNew = todayOtherCost > 0 && todaySoldQuentity > 0 ? todayOtherCost / todaySoldQuentity : 0;
  const getNewOtherCost = oldItem.TodayOtherCost !== todayOtherCost ? oldItem.TodayOtherCost > todayOtherCost ? "small" : "big" : "same";
  const newTotalOtherCost = 
  getNewOtherCost === "same" ?
  todayOtherCost :
  getNewOtherCost === "small" ? 
  newItem.TotalOtherCost - (oldItem.TodayOtherCost - todayOtherCost) : 
  newItem.TotalOtherCost + (todayOtherCost - oldItem.TodayOtherCost);
  const newTotaOtherCostPerSale = newTotalOtherCost > 0 && newTotalSoldQuentity > 0 ? newTotalOtherCost / newTotalSoldQuentity : 0;
  const newTodayDeliveryCost = todayDelibaryCostPersale > 0 && todaySoldQuentity > 0 ? todayDelibaryCostPersale * todaySoldQuentity : 0;

  const getNewDeliveryCost = oldItem.TodayDelibaryCost !== newTodayDeliveryCost ? oldItem.TodayDelibaryCost > newTodayDeliveryCost ? "small" : "big" : "same";
  const newTotalDeliverCost = 
  getNewDeliveryCost === "same" ?
  newTodayDeliveryCost :
  getNewDeliveryCost === "small" ? 
  newItem.TotalDelibaryCost - (oldItem.TodayDelibaryCost - newTodayDeliveryCost) : 
  newItem.TotalDelibaryCost + (newTodayDeliveryCost - oldItem.TodayDelibaryCost);
  const newTotaDeliveryCostPerSale = newTotalDeliverCost > 0 && newTotalSoldQuentity > 0 ? newTotalDeliverCost / newTotalSoldQuentity : 0;
  const newTodayProfitPersale =  todayProfitCostPerSaleNew > 0 && todaySoldQuentity > 0 ? todayProfitCostPerSaleNew * todaySoldQuentity : 0;
  const getNewProfitCost = oldItem.TodayTotalProfit !== newTodayProfitPersale ? oldItem.TodayTotalProfit > newTodayProfitPersale ? "small" : "big" : "same";
  const newTotalProfitCost = 
  getNewProfitCost === "same" ?
  newTodayProfitPersale :
  getNewProfitCost === "small" ? 
  newItem.TotalProfit - (oldItem.TodayTotalProfit - newTodayProfitPersale) : 
  newItem.TotalProfit + (newTodayProfitPersale - oldItem.TodayTotalProfit);

  const newTotaProfitCostPerSale = newTotalProfitCost > 0 && newTotalSoldQuentity > 0 ? newTotalProfitCost / newTotalSoldQuentity : 0;
  const todayTargetProfit = todayProfitPerSale > 0 && todayTargetQuentity > 0 ? todayProfitPerSale * todayTargetQuentity : 0;
  const totalTargetProfit = newTotaProfitCostPerSale > 0 && totalTargetQuentity > 0 ? newTotaProfitCostPerSale * totalTargetQuentity : 0;
  let newTotalPackgingCost = 0;
  let newPackgingCostPerProduct = 0;
  let newBuyingCostPerProduct = 0;
  let newTotalPrductBuyingCost = 0;
  let shippingCostPerProduct = 0;
  let totalshippingCost = 0;

  if(oldItem.TotalPackgingCost === totalPackgingCost && packgingCostPerProduct !== oldItem.PackgingCostPerProduct) {
    newTotalPackgingCost = packgingCostPerProduct * inStockQuentity;
    newPackgingCostPerProduct = newTotalPackgingCost > 0 && inStockQuentity > 0 ? newTotalPackgingCost / inStockQuentity : 0;
  }else{
    newPackgingCostPerProduct = totalPackgingCost > 0 && inStockQuentity > 0 ? totalPackgingCost /  inStockQuentity : 0;
    newTotalPackgingCost = newPackgingCostPerProduct * inStockQuentity;
  }

  if(oldItem.TotalPrductBuyingCost === totalPrductBuyingCost && buyingCostPerProduct !== oldItem.BuyingCostPerProduct) {
    newTotalPrductBuyingCost = buyingCostPerProduct * inStockQuentity;
    newBuyingCostPerProduct = newTotalPrductBuyingCost > 0 && inStockQuentity > 0 ? newTotalPrductBuyingCost / inStockQuentity : 0;
  }else{
    newBuyingCostPerProduct = totalPrductBuyingCost > 0 && inStockQuentity > 0 ? totalPrductBuyingCost /  inStockQuentity : 0;
    newTotalPrductBuyingCost = newBuyingCostPerProduct * inStockQuentity;
  }

  if(oldItem.TotalShippingCost === totalShippingCost && newShippingCost !== oldItem.ShippingCostPerProduct) {
    totalshippingCost = newShippingCost * inStockQuentity;
    shippingCostPerProduct = totalshippingCost > 0 && inStockQuentity > 0 ? totalshippingCost / inStockQuentity : 0;
  }else{
    shippingCostPerProduct = totalShippingCost > 0 && inStockQuentity > 0 ? totalShippingCost / inStockQuentity : 0;
    totalshippingCost = shippingCostPerProduct * inStockQuentity;
  }
  
  const totalProcessingCost = Number(newTotalAdCost) + Number(newTotalOtherCost) + Number(newTotalDeliverCost) + Number(totalPackgingCost) + Number(totalPrductBuyingCost) + Number(totalShippingCost);
  const processingCostPerProduct = totalProcessingCost > 0 && inStockQuentity > 0 ? totalProcessingCost / inStockQuentity : 0;

  return {
    ...newItem,
    TotalTargetQuentity: Math.ceil(Number(totalTargetQuentity)),
    TodayTargetQuentity: Math.ceil(Number(todayTargetQuentity)),
    TodaySoldQuentity: Math.ceil(Number(todaySoldQuentity)),
    TotalSoldQuentity: Math.ceil(Number(newTotalSoldQuentity)),
    TodaySoldAmount: Math.ceil(Number(newTodaySoldAmount)),
    TotalSoldAmount: Math.ceil(Number(newTotalSoldAmount)),
    InStockAvailableQuentity: Math.ceil(Number(newInStockAvailableQuentity)),
    TotalReturn:Math.ceil(Number(finalTodayReturn)),
    TodayadCostPerSale: Number(totalNewadCostPerSale.toFixed(2)),
    TotalAdCost: Math.ceil(Number(newTotalAdCost)),
    TotalAdCostPerSale: Number(newTotaAdCostPerSale.toFixed(2)),
    TodayOtherCostPerSale: Number(todayOtherCostPerSaleNew.toFixed(2)),
    TotalOtherCost: Number(newTotalOtherCost.toFixed(2)),
    TotalOtherCostPerSale: Number(newTotaOtherCostPerSale.toFixed(2)),
    TodayDelibaryCost: Number(newTodayDeliveryCost.toFixed(2)),
    TotalDelibaryCost: Number(newTotalDeliverCost.toFixed(2)),
    TotalDelibaryCostPersale: Number(newTotaDeliveryCostPerSale.toFixed(2)),
    TodayTotalProfit: Number(newTodayProfitPersale.toFixed(2)),
    TotalProfitPerSale: Number(newTotaProfitCostPerSale.toFixed(2)),
    TotalProfit: Number(newTotalProfitCost.toFixed(2)),
    TodayTargetProfit: Math.ceil(Number(todayTargetProfit)),
    TotalTargetProfit: Math.ceil(Number(totalTargetProfit)),
    PackgingCostPerProduct: Number(newPackgingCostPerProduct.toFixed(2)),
    TotalPackgingCost: Number(newTotalPackgingCost.toFixed(2)),
    TotalPrductBuyingCost: Number(newTotalPrductBuyingCost.toFixed(2)),
    BuyingCostPerProduct: Number(newBuyingCostPerProduct.toFixed(2)),
    TotalShippingCost: parseFloat(totalshippingCost.toFixed(2)),
    ShippingCostPerProduct: parseFloat(shippingCostPerProduct.toFixed(2)),
    TotalProcessingCost: Math.ceil(Number(totalProcessingCost)),
    ProcessingCostPerProduct: Number(processingCostPerProduct.toFixed(2)),
  };
});

if (updatedSoldValue) {  
  handleUpdate(updatedSoldValue);
}

}else if(isCond === "add"){
                //updating and calculating
        const outhotLock = updatedGoals.filter((d) => (d.isLock !== true));
        const totalSumLock = updatedGoals.reduce((acc, item) => {
          return item.isLock === true ? acc + Number(item.TotalTargetSaleAmount) : acc;
        }, 0);
    const currentunlockValue = (totalNum - totalSumLock) / outhotLock.length;
    const updatedValues = updatedGoals.map(item => {
          if(item.isLock !== true){
            return {
              ...item,
              TotalTargetSaleAmount: Math.ceil(currentunlockValue),
              TodayTargetSaleAmount: Math.ceil(currentunlockValue / deffirent.day),
              TotalTargetQuentity: Math.ceil(item.ProductPrice > 0 ? item.TotalTargetSaleAmount / item.ProductPrice : item.TotalTargetQuentity),
              TodayTargetQuentity: Math.ceil(item.ProductPrice > 0 ? item.TodayTargetSaleAmount / item.ProductPrice : item.TodayTargetQuentity),    
            };  
          }else{
            return{
              ...item,
              TotalTargetSaleAmount: Math.ceil(item.TotalTargetSaleAmount),
              TodayTargetSaleAmount: Math.ceil(item.TotalTargetSaleAmount / deffirent.day),
              TotalTargetQuentity: Math.ceil(item.ProductPrice > 0 ? item.TotalTargetSaleAmount / item.ProductPrice : item.TotalTargetQuentity),
              TodayTargetQuentity: Math.ceil(item.ProductPrice > 0 ? item.TodayTargetSaleAmount / item.ProductPrice : item.TodayTargetQuentity),    
            }
          }
    });
        if(updatedValues){
          handleUpdate(updatedValues)
        }
      }else{
          const showPopup = document.querySelector(".preDeletebtnContainer");
          const outhotLock = updatedGoals.filter((d) => (d.isLock !== true));
          const totalSumLock = updatedGoals.reduce((acc, item) => {
            return item.isLock === true ? acc + Number(item.TotalTargetSaleAmount) : acc;
          }, 0);
      const currentunlockValue = (totalNum - totalSumLock) / outhotLock.length;
      const updatedValues = updatedGoals.map(item => {
            if(item.isLock !== true){
              return {
                ...item,
                TotalTargetSaleAmount: Math.ceil(currentunlockValue),
                TodayTargetSaleAmount: Math.ceil(currentunlockValue / deffirent.day),
                TotalTargetQuentity: Math.ceil(item.ProductPrice > 0 ? item.TotalTargetSaleAmount / item.ProductPrice : item.TotalTargetQuentity),
                TodayTargetQuentity: Math.ceil(item.ProductPrice > 0 ? item.TodayTargetSaleAmount / item.ProductPrice : item.TodayTargetQuentity),      
              };  
            }else{
              return{
                ...item,
                TotalTargetSaleAmount: Math.ceil(item.TotalTargetSaleAmount),
                TodayTargetSaleAmount: Math.ceil(item.TotalTargetSaleAmount / deffirent.day),
                TotalTargetQuentity: Math.ceil(item.ProductPrice > 0 ? item.TotalTargetSaleAmount / item.ProductPrice : item.TotalTargetQuentity),
                TodayTargetQuentity: Math.ceil(item.ProductPrice > 0 ? item.TodayTargetSaleAmount / item.ProductPrice : item.TodayTargetQuentity),      
              }
            }
      });
          if(updatedValues){
            await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedValues).then(res => {
              if(res.status === 200){
                const targetData = res.data;
                if(targetData){
                  setGoalLadder(targetData || []);   
                  setViewGoal({...viewGoal, goalLadder:targetData})                 
                  showPopup.style = `display:none`;
                  setLoading(false);
                  setAddingTask(false);
                }
              }
            });  
          }
      }
    }catch(error){
      console.log(error)
    }
  }, [goalId,viewGoal,deffirent.day,handleError,handleUpdate]);
//calculate all the field function Main end </>

 const debouncedCalculateValues = useMemo(
    () =>
      debounce((isCond, data, isFirst, updatedGoals, updname) => {
        calculateAndUpdateFields(isCond, data, isFirst, updatedGoals, updname);
        if(isCond === "update"){
          setAddingTask(true);
        }
      }, 4000),
    [calculateAndUpdateFields]
  );

  
  const AddNewTask = () => {
    setAddingTask(true);
    const newProductCalculation = {
      ...productCalculation,
      ProductName: "Task" + proLength.current,
    };
    setProductCalculation(newProductCalculation);
    addFirstGoal(newProductCalculation);
  };
  
const getTimeDeff = (deff) => {
    setDeffirent(deff);
  };  


const handleChange = (e, index, objectId) => {
    const { name, value } = e.target;
    const updatedGoals = goalLadder.map((item) =>
      item._id === objectId ? { ...item, [name]: value } : item
    )
    setGoalLadder(updatedGoals || []);
    debouncedCalculateValues("update", updatedGoals, value, objectId, name);
};

const DeletePopup = (setpId) => {
  const showPopup = document.querySelector(".preDeletebtnContainer");
  showPopup.style = `display:block`;
  setStepIdForDelete(setpId ?? "");
}
// setStepIdForDelete

const deleteGoalStep = async() => {
  try{
    setLoading(true);
    setAddingTask(true);
    await Altaxios.put(`/setgole/deleteGoalStep/${goalId}/${stepIdForDelete}`).then(res => {
      if(res.status === 200){
        const targetData = res.data;
        if(targetData){
          debouncedCalculateValues("delete",targetData);
        }
      }
    });      
}catch(error){
  console.log(error)
}
};

//prevent auto scroll for number input <>
const preventScroll = (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    e.stopPropagation();
  }
};

const preventScrollWheel = (e) => {
  if (e.type === 'wheel') {
    e.preventDefault();
    e.stopPropagation();
  }
};

useEffect(() => {
  const currentRefs = Object.values(inputRefs.current);
  currentRefs.forEach((input) => {
    if (input) {
      input.addEventListener('wheel', preventScrollWheel, { passive: false });
      input.addEventListener('keydown', preventScroll);
    }
  });
  return () => {
    currentRefs.forEach((input) => {
      if (input) {
        input.removeEventListener('wheel', preventScrollWheel);
        input.removeEventListener('keydown', preventScroll);
      }
    });
  };
}, [goalLadder]);

const setInputRef = (el, index) => {
  inputRefs.current[index] = el;
};
//prevent auto scroll for number input </>
const updateLockUnlock = async(chId,tfValue) => {
  try{
    await Altaxios.put(`/setgole/updateTrueFalse/${goalId}/${chId}`, {isLock:tfValue} ).then((res) => {
      if(res.status === 200){
        setGoalLadder(res.data || [])
      }
    })
  }catch(error){
    console.log(error)
  }
}
  return (
    <div className='viewGoalMain'>
      {addingTask && <div className='addStepSpinner'>
        <div className='spinnerAdding'></div>
        </div>
        }

      <div className='viewGaolaTop'>
        <ChangeDate currentViewGoal={viewGoal} addTask={AddNewTask} TimeDeffirent={getTimeDeff}/>
      </div>

      <div className='viewGoalsInner'>
        <div className='shwoCalculateErrorMsg' style={errStyle}>{errorMsg}</div>
        <PreDelete confirmDelete={deleteGoalStep} preDeleting={loading}/>
        {goalLadder?.length > 0 ? goalLadder.map((ldr,index) => (
        <div className='viewGolasInnerTask' key={index}>
        <CloseIcon onClick={() => DeletePopup(ldr._id)}/>
          <div className='viewGoalsTaskContainer'>
          <div className='taskGoalInner'>
              <label htmlFor={'AssignDate' + index}>Assigned Date</label>
              <input type='text'  id={"AssignDate"+index} name="AssignDate" readOnly  value={ldr.AssignDate} ref={(el) => setInputRef(el, "AssignDate"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
          <div className='taskGoalInner'>
              <label htmlFor={'ProductName' + index}>Product Name</label>
              <input type='text'  id={"ProductName"+index} name="ProductName"  value={ldr.ProductName} ref={(el) => setInputRef(el, "ProductName"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'ProductPrice' + index}>Product Price</label>
              <input type='number' id={"ProductPrice"+index} name="ProductPrice"  value={ldr.ProductPrice} ref={(el) => setInputRef(el, "ProductPrice"+index)} onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalSoldAmount' + index}>Total Sold Amount</label>
              <input type='number' id={"TotalSoldAmount"+index}  name="TotalSoldAmount" readOnly value={ldr.TotalSoldAmount} ref={(el) => setInputRef(el, "TotalSoldAmount"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodaySoldAmount' + index}>Today Sold Amount</label>
              <input type='number' id={"TodaySoldAmount"+index}  name="TodaySoldAmount" readOnly value={ldr.TodaySoldAmount} ref={(el) => setInputRef(el, "TodaySoldAmount"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayTargetSaleAmount' + index}>Today Target Sale Amount</label>
              <input type='number' id={"TodayTargetSaleAmount"+index}  name="TodayTargetSaleAmount" readOnly value={ldr.TodayTargetSaleAmount} ref={(el) => setInputRef(el, "TodayTargetSaleAmount"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalTargetSaleAmount' + index}>Total Target Sale Amount</label>
              <input type='number' id={"TotalTargetSaleAmount"+index} name="TotalTargetSaleAmount"  value={ldr.TotalTargetSaleAmount} ref={(el) => setInputRef(el, "TotalTargetSaleAmount"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
              <div className='targetLockUnlock'>
                {
                  ldr.isLock === false ? 
                  (<div className='lockUnlockInner'>
                    <LockOpenOutlinedIcon className="targetUnlock" onClick={() => {updateLockUnlock(ldr._id, true)}}/> 
                    <div className='lockunlocktitle'>Click to Lock</div>
                  </div>)
                  : 
                  (<div className='lockUnlockInner'>
                    <LockOutlinedIcon className='targetLock' onClick={() => {updateLockUnlock(ldr._id, false)}}/>
                    <div className='lockunlocktitle'>Click to UnLock</div>
                  </div>)
                }
              </div>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalSoldQuentity' + index}>Total Sold Quentity</label>
              <input type='number' id={"TotalSoldQuentity"+index} name="TotalSoldQuentity" value={ldr.TotalSoldQuentity} ref={(el) => setInputRef(el, "TotalSoldQuentity"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodaySoldQuentity' + index}>Today Sold Quentity</label>
              <input type='number' id={"TodaySoldQuentity"+index} name="TodaySoldQuentity" value={ldr.TodaySoldQuentity} ref={(el) => setInputRef(el, "TodaySoldQuentity"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayTargetQuentity' + index}>Today Target Quentity</label>
              <input type='number' id={"TodayTargetQuentity"+index} name="TodayTargetQuentity" readOnly value={ldr.TodayTargetQuentity} ref={(el) => setInputRef(el, "TodayTargetQuentity"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalTargetQuentity' + index}>Total Target Quentity</label>
              <input type='number' id={"TotalTargetQuentity"+index} name="TotalTargetQuentity" readOnly value={ldr.TotalTargetQuentity} ref={(el) => setInputRef(el, "TotalTargetQuentity"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayReturn' + index}>Today Return</label>
              <input type='number' id={"TodayReturn"+index} name="TodayReturn" value={ldr.TodayReturn} ref={(el) => setInputRef(el, "TodayReturn"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalReturn' + index}>Total Return</label>
              <input type='number' id={"TotalReturn"+index} name="TotalReturn" value={ldr.TotalReturn} ref={(el) => setInputRef(el, "TotalReturn"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'InStockQuentity' + index}>InStock Quentity</label>
              <input type='number' id={"InStockQuentity"+index} name="InStockQuentity" value={ldr.InStockQuentity} ref={(el) => setInputRef(el, "InStockQuentity"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'InStockAvailableQuentity' + index}>InStock Available Quentity</label>
              <input type='number' id={"InStockAvailableQuentity"+index} name="InStockAvailableQuentity" readOnly value={ldr.InStockAvailableQuentity} ref={(el) => setInputRef(el, "InStockAvailableQuentity"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayTotaladCost' + index}>Today Total Ad Cost</label>
              <input type='number' id={"TodayTotaladCost"+index} name="TodayTotaladCost" value={ldr.TodayTotaladCost} ref={(el) => setInputRef(el, "TodayTotaladCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayadCostPerSale' + index}>Today Ad Cost Per Sale</label>
              <input type='number' id={"TodayadCostPerSale"+index} name="TodayadCostPerSale" readOnly value={ldr.TodayadCostPerSale} ref={(el) => setInputRef(el, "TodayadCostPerSale"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalAdCostPerSale' + index}>Total Ad Cost Per Sale</label>
              <input type='number' id={"TotalAdCostPerSale"+index} name="TotalAdCostPerSale" readOnly value={ldr.TotalAdCostPerSale} ref={(el) => setInputRef(el, "TotalAdCostPerSale"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalAdCost' + index}>Total AdCost</label>
              <input type='number' id={"TotalAdCost"+index} name="TotalAdCost" readOnly value={ldr.TotalAdCost} ref={(el) => setInputRef(el, "TotalAdCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayOtherCost' + index}>Today Other Cost</label>
              <input type='number' id={"TodayOtherCost"+index} name="TodayOtherCost" value={ldr.TodayOtherCost} ref={(el) => setInputRef(el, "TodayOtherCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayOtherCostPerSale' + index}>Today Other Cost PerSale</label>
              <input type='number' id={"TodayOtherCostPerSale"+index} name="TodayOtherCostPerSale" readOnly value={ldr.TodayOtherCostPerSale} ref={(el) => setInputRef(el, "TodayOtherCostPerSale"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalOtherCostPerSale' + index}>Total Other Cost PerSale</label>
              <input type='number' id={"TotalOtherCostPerSale"+index} name="TotalOtherCostPerSale" readOnly value={ldr.TotalOtherCostPerSale} ref={(el) => setInputRef(el, "TotalOtherCostPerSale"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalOtherCost' + index}>Total Other Cost</label>
              <input type='number' id={"TotalOtherCost"+index} name="TotalOtherCost" readOnly value={ldr.TotalOtherCost} ref={(el) => setInputRef(el, "TotalOtherCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayDelibaryCostPersale' + index}>Today Delibary Cost Persale</label>
              <input type='number' id={"TodayDelibaryCostPersale"+index} name="TodayDelibaryCostPersale"  value={ldr.TodayDelibaryCostPersale} ref={(el) => setInputRef(el, "TodayDelibaryCostPersale"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayDelibaryCost' + index}>Today Delibary Cost</label>
              <input type='number' id={"TodayDelibaryCost"+index} name="TodayDelibaryCost" readOnly value={ldr.TodayDelibaryCost} ref={(el) => setInputRef(el, "TodayDelibaryCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalDelibaryCostPersale' + index}>Total Delibary Cost Persale</label>
              <input type='number' id={"TotalDelibaryCostPersale"+index} name="TotalDelibaryCostPersale" readOnly value={ldr.TotalDelibaryCostPersale} ref={(el) => setInputRef(el, "TotalDelibaryCostPersale"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalDelibaryCost' + index}>Total Delibary Cost</label>
              <input type='number' id={"TotalDelibaryCost"+index} name="TotalDelibaryCost" readOnly value={ldr.TotalDelibaryCost} ref={(el) => setInputRef(el, "TotalDelibaryCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayProfitPerSale' + index}>Today Profit PerSale</label>
              <input type='number' id={"TodayProfitPerSale"+index} name="TodayProfitPerSale" value={ldr.TodayProfitPerSale} ref={(el) => setInputRef(el, "TodayProfitPerSale"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayTotalProfit' + index}>Today Total Profit</label>
              <input type='number' id={"TodayTotalProfit"+index} name="TodayTotalProfit" readOnly value={ldr.TodayTotalProfit} ref={(el) => setInputRef(el, "TodayTotalProfit"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalProfitPerSale' + index}>Total Profit PerSale</label>
              <input type='number' id={"TotalProfitPerSale"+index} name="TotalProfitPerSale" readOnly value={ldr.TotalProfitPerSale} ref={(el) => setInputRef(el, "TotalProfitPerSale"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalProfit' + index}>Total Profit</label>
              <input type='number' id={"TotalProfit"+index} name="TotalProfit" readOnly value={ldr.TotalProfit} ref={(el) => setInputRef(el, "TotalProfit"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TodayTargetProfit' + index}>Today Target Profit</label>
              <input type='number' id={"TodayTargetProfit"+index} name="TodayTargetProfit" readOnly value={ldr.TodayTargetProfit} ref={(el) => setInputRef(el, "TodayTargetProfit"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalTargetProfit' + index}>Total Target Profit</label>
              <input type='number' id={"TotalTargetProfit"+index} name="TotalTargetProfit" readOnly value={ldr.TotalTargetProfit} ref={(el) => setInputRef(el, "TotalTargetProfit"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalPackgingCost' + index}>Total Packging Cost</label>
              <input type='number' id={"TotalPackgingCost"+index} name="TotalPackgingCost" value={ldr.TotalPackgingCost} ref={(el) => setInputRef(el, "TotalPackgingCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'PackgingCostPerProduct' + index}>Packging CostPer Product</label>
              <input type='number' id={"PackgingCostPerProduct"+index} name="PackgingCostPerProduct" value={ldr.PackgingCostPerProduct} ref={(el) => setInputRef(el, "PackgingCostPerProduct"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalPrductBuyingCost' + index}>Total Prduct Buying Cost</label>
              <input type='number' id={"TotalPrductBuyingCost"+index} name="TotalPrductBuyingCost" value={ldr.TotalPrductBuyingCost} ref={(el) => setInputRef(el, "TotalPrductBuyingCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'BuyingCostPerProduct' + index}>Buying Cost PerProduct</label>
              <input type='number' id={"BuyingCostPerProduct"+index} name="BuyingCostPerProduct" value={ldr.BuyingCostPerProduct} ref={(el) => setInputRef(el, "BuyingCostPerProduct"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalShippingCost' + index}>Total Shipping Cost</label> 
              <input type='number' id={"TotalShippingCost"+index} name="TotalShippingCost" value={ldr.TotalShippingCost} ref={(el) => setInputRef(el, "TotalShippingCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'ShippingCostPerProduct' + index}>Shipping Cost Per Product</label>
              <input type='number' id={"ShippingCostPerProduct"+index} name="ShippingCostPerProduct" value={ldr.ShippingCostPerProduct} ref={(el) => setInputRef(el, "ShippingCostPerProduct"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'TotalProcessingCost' + index}>Total Processing Cost</label>
              <input type='number' id={"TotalProcessingCost"+index} name="TotalProcessingCost" readOnly value={ldr.TotalProcessingCost} ref={(el) => setInputRef(el, "TotalProcessingCost"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
            <div className='taskGoalInner'>
              <label htmlFor={'ProcessingCostPerProduct' + index}>Processing Cost Per Product</label>
              <input type='number' id={"ProcessingCostPerProduct"+index} name="ProcessingCostPerProduct" readOnly value={ldr.ProcessingCostPerProduct} ref={(el) => setInputRef(el, "ProcessingCostPerProduct"+index)}  onWheel={preventScrollWheel} onKeyDown={preventScroll} onChange={(e) => {handleChange(e,index,ldr._id)}}/>
            </div>
          </div>
        </div>
)) : (<div className='addLadderNoData'>Click to Add Step Button and Add your first ladder</div>)
}
{goalLadder.length > 0 &&
   (<div className='viewGolasInnerTaskResult'>
    <div className='viewGoalsTaskContainer'>
    <div className='taskGoalInnerResult'>
        <label htmlFor='AssignDate'>Result Date</label>
        <input type='text'  id="AssignDate" name="AssignDate" readOnly  value={formattedDate}/>
      </div>
     <div className='taskGoalInnerResult'>
        <label htmlFor='totlaSum'>Totla Sum</label>
        <input type='text'  id="totlaSum" name="totlaSum" readOnly value="Total Sum"/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='ProductPrice'>Total Product Price</label>
        <input type='number' id="ProductPrice" name="ProductPrice"  readOnly value={newTotalSum.ProductPrice}/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalSoldAmount'>Total Sold Amount</label>
        <input type='number' id="TotalSoldAmount"  name="TotalSoldAmount" readOnly value={newTotalSum.TotalSoldAmount}/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodaySoldAmount'>Total Today Sold Amount</label>
        <input type='number' id="TodaySoldAmount"  name="TodaySoldAmount" readOnly value={newTotalSum.TodaySoldAmount}/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayTargetSaleAmount'>Total Today Target Sale Amount</label>
        <input type='number' id="TodayTargetSaleAmount"  name="TodayTargetSaleAmount" readOnly value={newTotalSum.TodayTargetSaleAmount}/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalTargetSaleAmount'>Total Target Sale Amount</label>
        <input type='number' id="TotalTargetSaleAmount" name="TotalTargetSaleAmount" readOnly  value={newTotalSum.TotalTargetSaleAmount}/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalSoldQuentity'>Total Sold Quentity</label>
        <input type='number' id="TotalSoldQuentity" name="TotalSoldQuentity" readOnly value={newTotalSum.TotalSoldQuentity}/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodaySoldQuentity'>Today Sold Quentity</label>
        <input type='number' id="TodaySoldQuentity" name="TodaySoldQuentity" readOnly value={newTotalSum.TodaySoldQuentity} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayTargetQuentity'>Today Target Quentity</label>
        <input type='number' id="TodayTargetQuentity" name="TodayTargetQuentity" readOnly value={newTotalSum.TodayTargetQuentity} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalTargetQuentity'>Total Target Quentity</label>
        <input type='number' id="TotalTargetQuentity" name="TotalTargetQuentity" readOnly value={newTotalSum.TotalTargetQuentity} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayReturn'>Today Return</label>
        <input type='number' id="TodayReturn" name="TodayReturn" readOnly value={newTotalSum.TodayReturn}/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalReturn'>Total Return</label>
        <input type='number' id="TotalReturn" name="TotalReturn" readOnly value={newTotalSum.TotalReturn} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='InStockQuentity'>InStock Quentity</label>
        <input type='number' id="InStockQuentity" name="InStockQuentity" readOnly value={newTotalSum.InStockQuentity}/>
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='InStockAvailableQuentity'>InStock Available Quentity</label>
        <input type='number' id="InStockAvailableQuentity" name="InStockAvailableQuentity" readOnly value={newTotalSum.InStockAvailableQuentity} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayTotaladCost'>Today Total Ad Cost</label>
        <input type='number' id="TodayTotaladCost" name="TodayTotaladCost" readOnly value={newTotalSum.TodayTotaladCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayadCostPerSale'>Today Ad Cost Per Sale</label>
        <input type='number' id="TodayadCostPerSale" name="TodayadCostPerSale" readOnly value={newTotalSum.TodayadCostPerSale} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalAdCostPerSale'>Total Ad Cost Per Sale</label>
        <input type='number' id="TotalAdCostPerSale" name="TotalAdCostPerSale" readOnly value={newTotalSum.TotalAdCostPerSale} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalAdCost'>Total AdCost</label>
        <input type='number' id="TotalAdCost" name="TotalAdCost" readOnly value={newTotalSum.TotalAdCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayOtherCost'>Today Other Cost</label>
        <input type='number' id="TodayOtherCost" name="TodayOtherCost" readOnly value={newTotalSum.TodayOtherCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayOtherCostPerSale'>Today Other Cost PerSale</label>
        <input type='number' id="TodayOtherCostPerSale" name="TodayOtherCostPerSale" readOnly value={newTotalSum.TodayOtherCostPerSale} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalOtherCostPerSale'>Total Other Cost PerSale</label>
        <input type='number' id="TotalOtherCostPerSale" name="TotalOtherCostPerSale" readOnly value={newTotalSum.TotalOtherCostPerSale} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalOtherCost'>Total Other Cost</label>
        <input type='number' id="TotalOtherCost" name="TotalOtherCost" readOnly value={newTotalSum.TotalOtherCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayDelibaryCost'>Today Delibary Cost</label>
        <input type='number' id="TodayDelibaryCost" name="TodayDelibaryCost" readOnly value={newTotalSum.TodayDelibaryCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayDelibaryCostPersale'>Today Delibary Cost Persale</label>
        <input type='number' id="TodayDelibaryCostPersale" name="TodayDelibaryCostPersale" readOnly value={newTotalSum.TodayDelibaryCostPersale} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalDelibaryCostPersale'>Total Delibary Cost Persale</label>
        <input type='number' id="TotalDelibaryCostPersale" name="TotalDelibaryCostPersale" readOnly value={newTotalSum.TotalDelibaryCostPersale} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalDelibaryCost'>Total Delibary Cost</label>
        <input type='number' id="TotalDelibaryCost" name="TotalDelibaryCost" readOnly value={newTotalSum.TotalDelibaryCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayTotalProfit'>Today Total Profit</label>
        <input type='number' id="TodayTotalProfit" name="TodayTotalProfit" readOnly value={newTotalSum.TodayTotalProfit} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayProfitPerSale'>Today Profit PerSale</label>
        <input type='number' id="TodayProfitPerSale" name="TodayProfitPerSale" readOnly value={newTotalSum.TodayProfitPerSale} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalProfitPerSale'>Total Profit PerSale</label>
        <input type='number' id="TotalProfitPerSale" name="TotalProfitPerSale" readOnly value={newTotalSum.TotalProfitPerSale} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalProfit'>Total Profit</label>
        <input type='number' id="TotalProfit" name="TotalProfit" readOnly value={newTotalSum.TotalProfit} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TodayTargetProfit'>Today Target Profit</label>
        <input type='number' id="TodayTargetProfit" name="TodayTargetProfit" readOnly value={newTotalSum.TodayTargetProfit} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalTargetProfit'>Total Target Profit</label>
        <input type='number' id="TotalTargetProfit" name="TotalTargetProfit" readOnly value={newTotalSum.TotalTargetProfit} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalPackgingCost'>Total Packging Cost</label>
        <input type='number' id="TotalPackgingCost" name="TotalPackgingCost" readOnly value={newTotalSum.TotalPackgingCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='PackgingCostPerProduct'>Packging CostPer Product</label>
        <input type='number' id="PackgingCostPerProduct" name="PackgingCostPerProduct" readOnly value={newTotalSum.PackgingCostPerProduct} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalPrductBuyingCost'>Total Prduct Buying Cost</label>
        <input type='number' id="TotalPrductBuyingCost" name="TotalPrductBuyingCost" readOnly value={newTotalSum.TotalPrductBuyingCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='BuyingCostPerProduct'>Buying Cost PerProduct</label>
        <input type='number' id="BuyingCostPerProduct" name="BuyingCostPerProduct" readOnly value={newTotalSum.BuyingCostPerProduct} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalShippingCost'>Total Shipping Cost</label> 
        <input type='number' id="TotalShippingCost" name="TotalShippingCost" readOnly value={newTotalSum.TotalShippingCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='ShippingCostPerProduct'>Shipping Cost Per Product</label>
        <input type='number' id="ShippingCostPerProduct" name="ShippingCostPerProduct" readOnly value={newTotalSum.ShippingCostPerProduct} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='TotalProcessingCost'>Total Processing Cost</label>
        <input type='number' id="TotalProcessingCost" name="TotalProcessingCost" readOnly value={newTotalSum.TotalProcessingCost} />
      </div>
      <div className='taskGoalInnerResult'>
        <label htmlFor='ProcessingCostPerProduct'>Processing Cost Per Product</label>
        <input type='number' id="ProcessingCostPerProduct" name="ProcessingCostPerProduct" readOnly value={newTotalSum.ProcessingCostPerProduct} />
      </div>
    </div>
  </div>
  )
}
      </div>
    </div>
  )
}

export default ViewGoal