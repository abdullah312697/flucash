import { ResponsiveLine } from '@nivo/line';
const data = [];
function ChartData() {
  return (
    <div>
        <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'linear' }}
        xFormat=" >-1.2f"
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        yFormat=" >-$.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Months',
            legendOffset: 36,
            legendPosition: 'middle',
            truncateTickAt: 0
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Revenue',
            legendOffset: -40,
            legendPosition: 'middle',
            truncateTickAt: 0
        }}
        colors={{ scheme: 'brown_blueGreen' }}
        lineWidth={3}
        pointSize={10}
        pointColor="#0084ff"
        pointBorderWidth={3}
        pointBorderColor="#535050"
        enablePointLabel={true}
        pointLabel="data.yFormatted"
        pointLabelYOffset={-14}
        enableArea={true}
        enableTouchCrosshair={true}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 107,
                translateY: 23,
                itemWidth: 94,
                itemHeight: 50,
                itemsSpacing: 12,
                symbolSize: 12,
                symbolShape: 'circle',
                itemDirection: 'left-to-right',
                itemTextColor: '#777',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
    />
    </div>
  )
}

export default ChartData