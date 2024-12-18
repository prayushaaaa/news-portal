import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TrendChart = ({ data }) => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  // Process data to be compatible with the chart, filtering for -1, 0, and 1 sentiment scores
  const filteredData = data.filter(item => [-1, 0, 1].includes(item.sentiment_score));
  const chartData = filteredData.map(item => ({
    date: item.date, // X-axis value
    sentiment: item.sentiment_score, // Y-axis value
    news_article: item.news_article
  }));

  const yAxisTickFormatter = (value) => {
    if (value === -1) return "Negative";
    if (value === 0) return "Neutral";
    if (value === 1) return "Positive";
    return value;
  };

  const dotClicked = (news_article) => {
    navigate(`/news-detail/${news_article}`);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="date" />
        <YAxis
          domain={[-1, 1]}
          ticks={[-1, 0, 1]}
          tickFormatter={yAxisTickFormatter}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="sentiment"
          stroke="#8884d8"
          activeDot={{
            r: 8,
            onClick: (event, payload) => dotClicked(payload.payload.news_article)
          }}
          style={{ cursor: "pointer" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
