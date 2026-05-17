import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import MyRequests from './pages/MyRequests';
import MyGarden from './pages/MyGarden';
import GrowerProfile from './pages/GrowerProfile';
import SeasonalCalendar from './pages/SeasonalCalendar';
import NotFound from './pages/NotFound';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pt-24 text-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/listings/new" element={<Protected><CreateListing /></Protected>} />
          <Route path="/listings/:id/edit" element={<Protected><EditListing /></Protected>} />
          <Route path="/my-requests" element={<Protected><MyRequests /></Protected>} />
          <Route path="/my-garden" element={<Protected><MyGarden /></Protected>} />
          <Route path="/profile/:id" element={<GrowerProfile />} />
          <Route path="/seasonal" element={<SeasonalCalendar />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
