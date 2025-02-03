import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StaticNavbar from './components/StaticNavbar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import InstancePage from './pages/InstancePage';
import SuggestionsPage from './pages/SuggestionsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { ToastProvider } from './context/ToastContext';
import JwtUtils from './utils/JwtUtils';
import JobChart from './pages/JobChart';
import MapPage from './pages/MapPage';
import EventStatisticsPage from './pages/EventStatisticsPage';
import SearchEventPage from './pages/SearchEventPage';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <StaticNavbar />
        <div style={{ paddingTop: `125px` }}>
          <JwtUtils/>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/instance/:id" element={<InstancePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/eventstatistics" element={<EventStatisticsPage />} />
            <Route path="/searchevent" element={<SearchEventPage />} />
            <Route path="*" element={<NotFoundPage />} /> {/* Catch-all route for 404 page */}
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
