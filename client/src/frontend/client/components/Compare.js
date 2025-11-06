const finalNum = Number(newValue);
const totalNum = Number(viewGoal.targetAmount);
const preveData = viewGoal.goalLadder.find((fdata) => (fdata._id === id));
if(isCond === "update"){
  //updating and calculating
  switch (updname) {
    case 'ProductPrice':
      if(finalNum > 0 && finalNum !== null && !Number.isNaN(finalNum) && finalNum !== ""){
        const updatedValuesPrice = updatedGoals.map(item => {
          const newTotalTargetQuentity = Math.ceil(
            item?.ProductPrice > 0 
              ? item.TotalTargetSaleAmount / item.ProductPrice 
              : item.TotalTargetQuentity
          );
          const newTodayTargetQuentity = Math.ceil(
            item?.ProductPrice > 0 
              ? item.TodayTargetSaleAmount / item.ProductPrice 
              : item.TodayTargetQuentity
          );
          const newTotalSoldAmount = Math.ceil(item.TotalSoldQuentity * item.ProductPrice);
          const newTodaySoldAmount = Math.ceil(item.TodaySoldQuentity * item.ProductPrice);
          return {
            ...item,
            TotalTargetQuentity: newTotalTargetQuentity,
            TodayTargetQuentity: newTodayTargetQuentity,
            TotalSoldAmount: newTotalSoldAmount,
            TodaySoldAmount: newTodaySoldAmount,
          };
        });
          await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedValuesPrice).then(res => {
              if(res.status === 200){
                const targetData = res.data;
                if(targetData){
                  setGoalLadder(targetData);
                  setViewGoal({...viewGoal, goalLadder:targetData})
                  setAddingTask(false);
                }
              }
            });
          }else{
            setErrorMsg("your price can't set 0");
            setErrStyle({color:'red',opacity:1});
            setTimeout(() => {
              setGoalLadder(viewGoal.goalLadder);
              setErrStyle({opacity:0});
              setAddingTask(false);
            },3000);
            return    
          }
            break;
    case 'TotalTargetSaleAmount':
      if(finalNum > totalNum){
        setErrorMsg("You can't set a value that exceeds your goal.");
        setErrStyle({color:'red',opacity:1});
        setTimeout(() => {
          setGoalLadder(viewGoal.goalLadder);
          setErrStyle({opacity:0});
          setAddingTask(false);
        },3000);
        return
      }
      if(finalNum > 0 && finalNum !== null && !Number.isNaN(finalNum) && finalNum !== ""){
      const outhotLock = updatedGoals.filter((d) => (d._id !== id && d.isLock !== true));
        const totalSumLock = updatedGoals.reduce((acc, item) => {
          return item.isLock === true ? acc + Number(item.TotalTargetSaleAmount) : acc;
        }, 0);
        const checkisfalse = updatedGoals.find((d) => (d._id === id));
        let currentunlockValue;
        if(checkisfalse.isLock){
           currentunlockValue = (totalNum - totalSumLock) / outhotLock.length;
        }else{
          currentunlockValue = ((totalNum - totalSumLock) - finalNum ) / outhotLock.length;
        }

        const calculateTargetQuentities = (saleAmount, productPrice, days) => ({
          total: Math.ceil(productPrice > 0 ? saleAmount / productPrice : 0),
          today: Math.ceil(productPrice > 0 ? (saleAmount / days) / productPrice : 0)
        });
        
        const updatedValues = updatedGoals.map(item => {
          const isTargeted = item._id === id;
          const isLocked = item.isLock;
        
          const saleAmount = isTargeted ? finalNum : isLocked ? item.TotalTargetSaleAmount : currentunlockValue;
        
          const { total: totalQuentity, today: todayQuentity } = calculateTargetQuentities(saleAmount, item.ProductPrice, deffirent.day);
        
          return {
            ...item,
            TotalTargetSaleAmount: Math.ceil(saleAmount),
            TodayTargetSaleAmount: Math.ceil(saleAmount / deffirent.day),
            TotalTargetQuentity: totalQuentity,
            TodayTargetQuentity: todayQuentity,
            ProductPrice: item.ProductPrice
          };
        });
        const totalSum = Math.ceil(
          updatedValues.reduce((acc, item) => acc + Number(item.TotalTargetSaleAmount), 0)
        );
        if (totalSum <= totalNum + 100) {
          await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedValues).then(res => {
            if(res.status === 200){
              const targetData = res.data;
              if(targetData){
                setGoalLadder(targetData);
                setViewGoal({...viewGoal, goalLadder:targetData})
                setAddingTask(false);
              }
            }
          });        
        }else{
          setErrorMsg("Your new sum value is greater then your goal")
          setErrStyle({color:'red',opacity:1});
          setTimeout(() => {
            setGoalLadder(viewGoal.goalLadder);
            setErrStyle({opacity:0});
            setAddingTask(false);
          },3000);
        }
      }
          break;
        case 'TodaySoldQuentity' :
          if(finalNum > 0 && finalNum !== null && !Number.isNaN(finalNum) && finalNum !== ""){
          const totalSoldQt = preveData.TodaySoldQuentity > finalNum ? "small" : "big";
          const updatedSoldValue = updatedGoals.map(item => {
              const newTotalSoldQuentity = totalSoldQt === "small"
                  ? item.TotalSoldQuentity > finalNum ? - (preveData.TodaySoldQuentity - finalNum) : finalNum
                  : item.TotalSoldQuentity + (finalNum - preveData.TodaySoldQuentity);
              const newTodaySoldAmount = finalNum * item.ProductPrice;
              const newTotalSoldAmount = newTotalSoldQuentity * item.ProductPrice;
              const newInStockAvailableQuentity = item.InStockQuentity > 0 ? item.InStockQuentity - newTotalSoldQuentity : 0;
              return {
                ...item,
                TodaySoldQuentity: Math.ceil(finalNum),
                TotalSoldQuentity: Math.ceil(newTotalSoldQuentity),
                TodaySoldAmount: Math.ceil(newTodaySoldAmount),
                TotalSoldAmount: Math.ceil(newTotalSoldAmount),
                InStockAvailableQuentity: Math.ceil(newInStockAvailableQuentity)
              };
          });
        await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedSoldValue).then(res => {
                if(res.status === 200){
                  const targetData = res.data;
                  if(targetData){
                    setGoalLadder(targetData);
                    setViewGoal({...viewGoal, goalLadder:targetData})
                    setAddingTask(false);
                  }
                }
              });
            }else{
              setErrorMsg("your change can't update");
              setErrStyle({color:'red',opacity:1});
              setTimeout(() => {
                setGoalLadder(viewGoal.goalLadder);
                setErrStyle({opacity:0});
                setAddingTask(false);
              },3000);
              return      
            }
          break
          case 'TodayReturn' :
            if(finalNum > 0 && finalNum !== null && !Number.isNaN(finalNum) && finalNum !== ""){
            const totalReturnQt = preveData.TodayReturn > finalNum ? "small" : "big";
            const updatedReturn = updatedGoals.map(item => {
              const newTotalReturn = totalReturnQt === "small" 
                ? item.TotalReturn - (preveData.TodayReturn - finalNum)
                : item.TotalReturn + (finalNum - preveData.TodayReturn);
              const newTodaySoldQuentity = totalReturnQt === "small" 
                ? item.TodaySoldQuentity + (preveData.TodayReturn - finalNum)
                : item.TodaySoldQuentity - (finalNum - preveData.TodayReturn);
              const newTotalSoldQuentity = item.TotalSoldQuentity - newTodaySoldQuentity;
              return { 
                ...item,
                TodayReturn: Math.ceil(finalNum),
                TotalReturn: Math.ceil(newTotalReturn),
                TodaySoldQuentity: Math.ceil(newTodaySoldQuentity),
                TotalSoldQuentity: Math.ceil(newTotalSoldQuentity),
                TodaySoldAmount: Math.ceil(newTodaySoldQuentity * item.ProductPrice),
                TotalSoldAmount: Math.ceil(newTotalSoldQuentity * item.ProductPrice),
                InStockAvailableQuentity: Math.ceil(item.InStockQuentity > 0 ? item.InStockQuentity - newTotalSoldQuentity : 0)
              };
            });
              await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedReturn).then(res => {
                  if(res.status === 200){
                    const targetData = res.data;
                    if(targetData){
                      setGoalLadder(targetData);
                      setViewGoal({...viewGoal, goalLadder:targetData})
                      setAddingTask(false);
                    }
                  }
                });
              }else{
                setErrorMsg("your change can't update");
                setErrStyle({color:'red',opacity:1});
                setTimeout(() => {
                  setGoalLadder(viewGoal.goalLadder);
                  setErrStyle({opacity:0});
                  setAddingTask(false);
                },3000);
                return      
              }
            break  
            case 'TodayTotaladCost' :
              if(finalNum > 0 && finalNum !== null && !Number.isNaN(finalNum) && finalNum !== ""){
              const updatedAdCost = updatedGoals.map(item => {
                return { ...item,
                  TodayTotaladCost: Math.ceil(finalNum),
                  TotalAdCost: Math.ceil(item.TotalAdCost + finalNum),
                  TodayadCostPerSale: Math.round(item.TodayTotaladCost / item.TodaySoldQuentity),
                  TotalAdCostPerSale: Math.round(item.TotalAdCost / item.TotalSoldQuentity),
                  };
            });
                  await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedAdCost).then(res => {
                    if(res.status === 200){
                      const targetData = res.data;
                      if(targetData){
                        setGoalLadder(targetData);
                        setViewGoal({...viewGoal, goalLadder:targetData})
                        setAddingTask(false);
                      }
                    }
                  });
                }else{
                  setErrorMsg("your change can't update");
                  setErrStyle({color:'red',opacity:1});
                  setTimeout(() => {
                    setGoalLadder(viewGoal.goalLadder);
                    setErrStyle({opacity:0});
                    setAddingTask(false);
                  },3000);
                  return      
                }
              break    
      default:
        if(finalNum > 0 && finalNum !== null && !Number.isNaN(finalNum) && finalNum !== ""){

        await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedGoals).then(res => {
              if(res.status === 200){
                const targetData = res.data;
                if(targetData){
                  setGoalLadder(targetData);
                  setViewGoal({...viewGoal, goalLadder:targetData})
                  setAddingTask(false);
                }
              }
            });
          }
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
    await Altaxios.put(`/setgole/updateGoalLadder/${goalId}`, updatedValues).then(res => {
      if(res.status === 200){
        const targetData = res.data;
        if(targetData){
          setGoalLadder(targetData);
          setViewGoal({...viewGoal, goalLadder:targetData});
          setAddingTask(false);
        }
      }
    });  
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
            setGoalLadder(targetData);   
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
}, [goalId,viewGoal,deffirent.day]);

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
