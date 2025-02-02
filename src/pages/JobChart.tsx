import React, { useEffect, useState, useMemo } from 'react';
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
import StatisticsService from '../service/StatisticsService';
import { JobData, ChartData } from '../service/StatisticsService';

const api = new StatisticsService('http://localhost:8888/api/v1');

const fetchJobData = async (): Promise<JobData[]> => {
  const response = await api.getEntityInstances("http://www.semanticweb.org/ana/ontologies/2024/10/JobHunterOntology#Agility");
  return response.map((job: any) => ({
    job: job.job,
    datePosted: job.datePosted.replace(/\"|\^\^xsd:date/g, ""),
    dateRemoved: job.dateRemoved ? job.dateRemoved.replace(/\"|\^\^xsd:date/g, "") : null,
  }));
};

const generateChartData = (data: JobData[]): ChartData[] => {
  const dateCounts: Record<string, number> = {};
  const today = new Date().toISOString().split("T")[0];

  data.forEach(({ datePosted, dateRemoved }) => {
    if (datePosted) {
      dateCounts[datePosted] = (dateCounts[datePosted] || 0) + 1;
    }
    if (dateRemoved) {
      dateCounts[dateRemoved] = (dateCounts[dateRemoved] || 0) - 1;
    }
  });

  const sortedDates = Object.keys(dateCounts).sort();
  let runningTotal = 0;
  let jobsRemoved = 0;
  const chartData: ChartData[] = sortedDates.map((date) => {
    runningTotal += dateCounts[date] || 0;
    if (dateCounts[date] < 0) {
      jobsRemoved += Math.abs(dateCounts[date]);
    }
    return { date, availableJobs: runningTotal, removedJobs: jobsRemoved };
  });

  return chartData.filter((entry) => entry.date <= today);
};

const JobChart: React.FC = () => {
  const [jobData, setJobData] = useState<JobData[]>([]);

  useEffect(() => {
    fetchJobData().then(setJobData);
  }, []);

  const chartData = useMemo(() => generateChartData(jobData), [jobData]);

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line connectNulls type="monotone" dataKey="availableJobs" stroke="#8884d8" name="Available Jobs" />
          <Line connectNulls type="monotone" dataKey="removedJobs" stroke="#ff4d4d" name="Removed Jobs" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobChart;
