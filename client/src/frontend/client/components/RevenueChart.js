import React, { useState } from 'react';
import { ResponsiveLine } from '@nivo/line';

const RevenueChart = () => {
    const [selectedRange, setSelectedRange] = useState("monthly");

    const data = {
        monthly: [
            {
                id: "Revenue",
                data: [
                    { x: "Jan", y: 1200 },
                    { x: "Feb", y: 500 },
                    { x: "Mar", y: 1100 },
                    { x: "Apr", y: 1600 },
                    { x: "May", y: 800 },
                    { x: "Jun", y: 1700 },
                    { x: "Jul", y: 2900 },
                    { x: "Aug", y: 1800 },
                    { x: "Sep", y: 2500 },
                    { x: "Oct", y: 1000 },
                    { x: "Nov", y: 3000 },
                    { x: "Dec", y: 4000 },
                ],
            },
        ],
        yearly: [
            {
                id: "Revenue",
                data: [
                    { x: 2018, y: 15000 },
                    { x: 2019, y: 18000 },
                    { x: 2020, y: 17000 },
                    { x: 2021, y: 20000 },
                    { x: 2022, y: 22000 },
                    { x: 2023, y: 12000 },
                    { x: 2024, y: 30000 },
                    { x: 2025, y: 35000 },
                    { x: 2026, y: 45000 },
                    { x: 2027, y: 65000 },
                    { x: 2028, y: 55000 },
                    { x: 2029, y: 70000 },
                    { x: 2030, y: 80000 },
                    { x: 2031, y: 90000 },
                ],
            },
        ],
    };

    const chartData = data[selectedRange];
    return (
        <div style={{width:'100%',height:'100%',padding:'10px'}}>
            <div className='YearlyMonthlyButton'>
                <button onClick={() => setSelectedRange("monthly")}>Monthly</button>
                <button onClick={() => setSelectedRange("yearly")}>Yearly</button>
            </div>

            {/* Chart */}
            <div style={{width:'100%', height:'250px'}}>
                        <ResponsiveLine
                        data={chartData}
                        margin={{ top: 20, right: 80, bottom: 40, left: 55 }}
                        xScale={{
                            type: selectedRange === "monthly" ? "point" : "linear",
                            min: selectedRange === "yearly" ? 2018 : 0, // Ensure proper spacing for yearly data
                            max: selectedRange === "yearly" ? 2031 : 0 // Ensure proper spacing for yearly data
                        }}
                        
                        yScale={{
                            type: 'linear',
                            min: 'auto',
                            max: 'auto',
                            stacked: false, // Change from true to false
                            reverse: false
                        }}
                        
                        yFormat=" >-$.2f"
                        axisTop={null}
                        axisRight={null}
                        enableGridX={false}
                        enableGridY={false}
                        axisBottom={{
                            tickValues: selectedRange === "monthly"
                                ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                : [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031], // Ensure these are correct
                            tickSize: 7,
                            tickPadding: 4,
                            tickRotation: 0,
                            legend: selectedRange === "monthly" ? 'Months' : 'Years',
                            legendOffset: 36,
                            legendPosition: 'middle',
                            truncateTickAt: 0
                        }}
                    axisLeft={{
                            tickSize: 4,
                            tickPadding: 4,
                            tickRotation: 0,
                            legend: 'Revenue',
                            legendOffset: -50,
                            legendPosition: 'middle',
                            truncateTickAt: 0
                        }}
                        colors={{ scheme: 'brown_blueGreen' }}
                        lineWidth={3}
                    enablePoints={true}
                    pointSize={8}
                    pointColor="#fff"
                    pointBorderWidth={2}
                    pointBorderColor="#000"
                        enableArea={true}
                        enableTouchCrosshair={true}
                        useMesh={true}
                        enableSlices='x'
                        sliceTooltip={({ slice }) => (
                            <div className="custom-tooltip" style={{width:'auto',boxSizing:'border-box',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                <strong style={{color:'#bb8600'}}>{slice.points[0].data.xFormatted}</strong>
                                {slice.points.map((point) => (
                                    <strong style={{color:'#00fff2',marginLeft:'8px'}} key={point.id}>{point.data.yFormatted}</strong>
                                ))}
                            </div>
                        )}                        
                    />
            </div>
        </div>
    );
};

export default RevenueChart;
