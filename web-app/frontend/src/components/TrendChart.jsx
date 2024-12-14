import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

const TrendChart = ({data}) => {
  // Process data to be compatible with the chart, filtering for -1, 0, and 1 sentiment scores
  const filteredData = data.filter(item => [-1, 0, 1].includes(item.sentiment_score))
  const chartData = filteredData.map(item => ({
    date: item.date, // X-axis value
    sentiment: item.sentiment_score, // Y-axis value
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="date" />
        <YAxis 
          domain={[-1, 1]} 
          ticks={[-1, 0, 1]} 
        />
        <Tooltip />
        <Line type="monotone" dataKey="sentiment" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
