import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AddMedicine from "./routes/AddMedicine";
import Calendar from "./routes/Calendar";
import DayDetails from "./routes/DayDetails";
import Home from "./routes/Home";
import Login from "./routes/Login";
import OAuthCallback from "./routes/OAuthCallback";
import Signup from "./routes/Signup";
import Splash from "./routes/Splash";
import Today from "./routes/Today";
import { isSessionValid } from "./utils/session";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  if (!isSessionValid(token, userId)) {
    localStorage.clear();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/oauth2/callback" element={<OAuthCallback />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/add-medicine" element={<PrivateRoute><AddMedicine /></PrivateRoute>} />
      <Route path="/today" element={<PrivateRoute><Today /></PrivateRoute>} />
      <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
      <Route path="/day-details" element={<PrivateRoute><DayDetails /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}