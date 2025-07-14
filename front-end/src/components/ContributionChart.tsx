import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface ContributionData {
  name: string;
  value: number;
  fill: string;
}

interface ContributionChartProps {
  data: ContributionData[];
  title: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-gray-300 rounded shadow-lg">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const CustomYAxisTick = ({ y, payload }: any) => {
  const value = payload.value as string;
  // Adjust the x offset as needed
  const xOffset = 95;
  const yOffset = 4; // Vertical alignment
  
  return (
    <g transform={`translate(0,${y})`}>
      <text x={xOffset} y={yOffset} textAnchor="end" fill="#666" fontSize={10}>
        {value}
      </text>
    </g>
  );
};

const ContributionChart: React.FC<ContributionChartProps> = ({ data, title }) => {
  return (
    <div className="flex-1 py-1 px-2 rounded">
      <h3 className="text-center mb-1 text-xs text-gray-600 p-1 rounded">{title}</h3>
      <div style={{ width: '100%', height: 110 }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
          >
            <XAxis type="number" hide domain={['auto', 'auto']} />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              width={100}
              tick={<CustomYAxisTick />}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}}/>
            <ReferenceLine x={0} stroke="#666" strokeDasharray="2 2" />
            <Bar dataKey="value" barSize={10} radius={0}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ContributionChart; 