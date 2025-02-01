import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StaticNavbar from './components/StaticNavbar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import InstancePage from './pages/InstancePage';
import SuggestionsPage from './pages/SuggestionsPage';
import NotFoundPage from './pages/NotFoundPage'; // Import NotFoundPage
import EventStatisticsPage from './pages/EventStatisticsPage';
import SearchEventPage from './pages/SearchEventPage';

const App: React.FC = () => {
  return (
    <Router>
      <StaticNavbar />
      <div style={{ paddingTop: `125px` }}>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/instance/:id" element={<InstancePage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/eventstatistics" element={<EventStatisticsPage />} />
          <Route path="/searchevent" element={<SearchEventPage />} />
          <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route for 404 page */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
