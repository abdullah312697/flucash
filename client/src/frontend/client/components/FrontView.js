import { format } from 'date-fns';

function FrontView({data,onProductSelect}) {


    let date = new Date();
    const formattedDate = format(date, 'dd-MM-yyyy');
    const monthName = format(date, 'MMMM');
    const year = format(date, 'yyyy');

    Object.keys(data).forEach(d => {
       const ex =  data[d].productData[year] = {[monthName] : { [formattedDate] : {productPrice:270,saleOfAmount:5700,saleOfQuintity:170,TodayTargetQuentity:170,TodayReturn:73,TodayTargtSale:6700,TotaladCost:270,adCostPerSale:72,OtherCost:170,DelibaryCost:370,profit:27600,},}, } 
        console.log( ex );
    })
  return (
    <div className='cashFlowstactureview'>
      <h2 className='cashFlowinnerheading'>Current Product</h2>
      <ul className='viwe_cashflowUl'>
        {
        Object.keys(data).map(d => (
            <li key={data[d].productId} onClick={() => onProductSelect(d)} className='viewCahflowli'>
            <span>{data[d].productId}</span>
            <span><img src={data[d].productImg} alt="img"/></span>
            <span>
                <p>Price</p>
                <b>{data[d].productData[year][monthName][formattedDate].productPrice} KD</b>
            </span>
            <span>
                <p>Sold</p>
                <b>{data[d].productData[year][monthName][formattedDate].saleOfQuintity} Pieces</b>
            </span>
            <span>
                <p>Target Q</p>
                <b>{data[d].productData[year][monthName][formattedDate].TodayTargetQuentity} Pieces</b>
            </span>
            <span>
                <p>Sale Amount</p>
                <b>{data[d].productData[year][monthName][formattedDate].saleOfAmount} KD</b>
            </span>
            <span>
                <p>Target Amount</p>
                <b>{data[d].productData[year][monthName][formattedDate].TodayTargtSale} KD</b>
            </span>
            <span>
                <p>Return</p>
                <b>{data[d].productData[year][monthName][formattedDate].TodayReturn} Pieces</b>
            </span>
            <span>
                <p>Add Cost</p>
                <b>{data[d].productData[year][monthName][formattedDate].TotaladCost} KD</b>
            </span>
            <span>
                <p>Add Cost by SQ</p>
                <b>{data[d].productData[year][monthName][formattedDate].adCostPerSale} KD</b>
            </span>
            <span>
                <p>Other Cost</p>
                <b>{data[d].productData[year][monthName][formattedDate].OtherCost} KD</b>
            </span>
            <span>
                <p>Delibary Cost</p>
                <b>{data[d].productData[year][monthName][formattedDate].DelibaryCost} KD</b>
            </span>
            <span>
                <p>Profit</p>
                <b>{data[d].productData[year][monthName][formattedDate].profit} KD</b>
            </span>
        </li>

                ))
            
        }
      </ul>
    </div>
  )
}

export default FrontView