"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ComparativeBarData {
  name: string; // e.g., Category Name or Month
  value1: number;
  value2?: number;
  label1: string;
  label2?: string;
  color1: string;
  color2?: string;
}

interface ComparativeBarChartProps {
  data: ComparativeBarData[];
  dataKey1: string;
  dataKey2?: string;
  label1: string;
  label2?: string;
  color1: string;
  color2?: string;
}

const ComparativeBarChart: React.FC<ComparativeBarChartProps> = ({
  data,
  dataKey1,
  dataKey2,
  label1,
  label2,
  color1,
  color2,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="fill-foreground text-xs" />
        <YAxis className="fill-foreground text-xs" />
        <Tooltip
          formatter={(value: number) => `₹${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Bar dataKey={dataKey1} name={label1} fill={color1} />
        {dataKey2 && label2 && color2 && (
          <Bar dataKey={dataKey2} name={label2} fill={color2} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export { ComparativeBarChart };