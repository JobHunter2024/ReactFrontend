import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css'; 
import './EventStatisticsPage.css';
import { format, set} from 'date-fns';

// Register required Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const EventStatisticsPage: React.FC = () => {
  const [eventsByType, setEventsByType] = useState<any[]>([]);
  const [eventsIsOnline, setEventsIsOnline] = useState<any[]>([]);
  const [eventsPerTopic, setEventsPerTopic] = useState<any[]>([]);
  const [eventsPerDate, setEventsPerDate] = useState<any[]>([]);
  const [eventsPerTechnicalSkill, setEventsPerTechnicalSkill] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsType, eventsOnline, eventsTopic, eventsDate, eventsTechnicalSkill] = await Promise.all([
          axios.get('http://localhost:8000/events-by-type'),
          axios.get('http://localhost:8000/events-is-online'),
          axios.get('http://localhost:8000/events-per-topic'),
          axios.get('http://localhost:8000/events-per-date'),
          axios.get('http://localhost:8000/events-per-technical-skill'),
        ]);

        console.log('Fetched Data:', {
          eventsByType: eventsType.data,
          eventsIsOnline: eventsOnline.data,
          eventsPerTopic: eventsTopic.data,
          eventsPerDate: eventsDate.data,
          eventsPerTechnicalSkill: eventsTechnicalSkill.data,
        });

        setEventsByType(eventsType.data);
        setEventsIsOnline(eventsOnline.data);
        setEventsPerTopic(eventsTopic.data);
        setEventsPerDate(eventsDate.data);
        setEventsPerTechnicalSkill(eventsTechnicalSkill.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Prepare the Pie Chart Data (Events by Type)
  const pieDataType = {
    labels: eventsByType.map(item => item.label || "Unknown"),
    datasets: [
      {
        data: eventsByType.map(item => item.value || 0),
        backgroundColor: ['#c9e9ae', '	#6bb92d', '#015134', '#042812', '#9966FF'],
      },
    ],
  };

  // Prepare the Pie Chart Data (Events is Online)
  const pieDataOnline = {
    labels: eventsIsOnline.map(item => item.label === "true" ? "Online" : item.label === "false" ? "Onsite Romania" : "Unknown"
    ),
    datasets: [
      {
        data: eventsIsOnline.map(item => item.value || 0),
        backgroundColor: ['#7fbf7f', '#004000'],
      },
    ],
  };

  // Prepare the Bar Chart Data (Events per Topic)
  const barDataTopic = {
    labels: eventsPerTopic.map(item => item.label || "Unknown"),
    datasets: [
      {
        label: 'Event Count',
        data: eventsPerTopic.map(item => item.value || 0),
        backgroundColor: '#79a471',
        borderColor: '#278664',
        borderWidth: 1,
      },
    ],
  };

  // Prepare the Calendar Heatmap Data (Events per Date)
  const calendarData = eventsPerDate.map(item => ({
    date: format(new Date(item.label), 'yyyy-MM-dd'), // Format date as YYYY-MM-DD
    count: item.value || 0,
  }));


  // grouped bar chart
  const technicalSkillLabels = [...new Set(eventsPerTechnicalSkill.map(item => item.name))];

  // Extract unique categories dynamically
  const uniqueCategories = [...new Set(eventsPerTechnicalSkill.map(item => item.category))];

  const categoryColors: Record<string, string> = {
    "ProgrammingLanguage": "#5b2f13",
    "Framework": "#cdc673", 
    "Library": "#1f5514", 
  };
  
  const datasetByCategory = uniqueCategories.map(category => ({
    label: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize category name
    data: technicalSkillLabels.map(skill => {
      const item = eventsPerTechnicalSkill.find(event => event.name === skill && event.category === category);
      return item ? item.count : 0;
    }),
    backgroundColor: categoryColors[category] || "#CCCCCC", // Default gray if category not found
    borderColor: "#000000",
    borderWidth: 1,
  }));
  

  // Prepare the Grouped Bar Chart Data (Events per Technical Skill)
  const barDataTechnicalSkill = {
    labels: technicalSkillLabels, // X-axis labels (Unique skill names)
    datasets: datasetByCategory,
  };

  const barOptionsTechnicalSkill = {
    responsive: true,
    plugins: {
      legend: { position: "top" as "top" | "right" | "bottom" | "left"  },
    },
    scales: {
      x: { stacked: false }, // Not stacked for grouped bars
      y: { stacked: false },
    },
  };

  return (
    <div className="container">
      <h1>Event Statistics</h1>

      <div className="pie-chart-container">
        {/* Pie Chart: Events by Type */}
        <div className="pie-chart-section">
          <h2>Event Distribution by Type</h2>
          {eventsByType.length > 0 ? <Pie data={pieDataType} /> : <p>Loading Events by Type</p>}
        </div>

        {/* Pie Chart: Events is Online */}
        <div className="pie-chart-section">
          <h2>Online vs Onsite Romania Events</h2>
          {eventsIsOnline.length > 0 ? <Pie data={pieDataOnline} /> : <p>Loading Events Is Online</p>}
        </div>
      </div>

      {/* Bar Chart: Events per Topic */}
      <div className="chart-section">
        <h2>Event Count by Topic</h2>
        {eventsPerTopic.length > 0 ? <Bar data={barDataTopic} /> : <p>Loading Events per Topic</p>}
      </div>

      {/* Grouped Bar Chart: Events per Technical Skill */}
      <div className="chart-section">
        <h2>Event Count by Technical Skill(Programming Language, Framework, Library)</h2>
        {eventsPerTechnicalSkill.length > 0 ? (
          <Bar data={barDataTechnicalSkill} options={barOptionsTechnicalSkill} />
        ) : (
          <p>Loading Events per Technical Skill...</p>
        )}
      </div>

      {/* Calendar Heatmap: Events per Date */}
      <div className = "chart-section">
        <h2>Event Density Throughout the Year 2025</h2>
        <CalendarHeatmap
            startDate={new Date('2025-01-01')}   // Show last 1 year of data
            endDate={new Date('2025-12-31')} // End at today’s date
            values={calendarData.map((item) => ({
              date: item.date,
              count: item.count,
              title: `${item.date}: ${item.count} events`, // Native tooltip text
            }))}
            classForValue={(value) => {
              if (!value) return 'color-empty';
              return `color-scale-${Math.min(value.count, 4)}`; // Scale from 0-4
            }}
            showWeekdayLabels={true}
            onClick={(value) => {
              if (value) console.log(`Events on ${value.date}: ${value.count}`);
            }}
          />
        </div>
    </div>
  );
};

export default EventStatisticsPage;
