"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface MonthlyTrendData {
  month: string; // e.g., "Jan 2023"
  income: number;
  expenses: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = React.memo(({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tickFormatter={(value) => format(new Date(value), 'MMM yy')}
          className="fill-foreground text-xs"
        />
        <YAxis className="fill-foreground text-xs" />
        <Tooltip
          formatter={(value: number) => `₹${value.toFixed(2)}`}
          labelFormatter={(label) => format(new Date(label), 'MMM yyyy')}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="hsl(142.1 76.2% 36.3%)" // Green
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="hsl(0 84.2% 60.2%)" // Red
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
MonthlyTrendChart.displayName = "MonthlyTrendChart";

export { MonthlyTrendChart };