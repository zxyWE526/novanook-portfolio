import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Typography } from 'antd';
import * as echarts from 'echarts';
import { mockAnalyticsData } from '../services/mockData';

const { Title } = Typography;

function Chart({ option }: { option: echarts.EChartsOption }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [option]);

  return <div ref={ref} style={{ width: '100%', height: 350 }} />;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const AnalyticsPage: React.FC = () => {
  const { dailyTrend, wrongTrend, subjectAccuracy } = mockAnalyticsData;

  const dailyTrendOption: echarts.EChartsOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['完成题数', '正确题数'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dailyTrend.map((d) => formatDate(d.date)),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '完成题数',
        type: 'line',
        smooth: true,
        data: dailyTrend.map((d) => d.done),
        itemStyle: { color: '#1677ff' },
      },
      {
        name: '正确题数',
        type: 'line',
        smooth: true,
        data: dailyTrend.map((d) => d.correct),
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  const wrongTrendOption: echarts.EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: wrongTrend.map((d) => formatDate(d.date)),
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '新增错题',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.15 },
        data: wrongTrend.map((d) => d.count),
        itemStyle: { color: '#ff4d4f' },
      },
    ],
  };

  const subjectAccuracyOption: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        return `${item.name}<br/>正确率: ${((item.value as number) * 100).toFixed(0)}%`;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: subjectAccuracy.map((d) => d.subject),
      axisLabel: { interval: 0 },
    },
    yAxis: {
      type: 'value',
      max: 1,
      axisLabel: {
        formatter: (val: number) => `${(val * 100).toFixed(0)}%`,
      },
    },
    series: [
      {
        name: '正确率',
        type: 'bar',
        barWidth: '40%',
        data: subjectAccuracy.map((d) => d.accuracy),
        itemStyle: {
          color: (params) => {
            const colors = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1'];
            return colors[params.dataIndex % colors.length];
          },
        },
      },
    ],
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>数据分析</Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="每日刷题趋势" bordered={false}>
            <Chart option={dailyTrendOption} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="错题数量变化" bordered={false}>
            <Chart option={wrongTrendOption} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="各学科正确率" bordered={false}>
            <Chart option={subjectAccuracyOption} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage;
