import "./styles/app.css";
import BitPredict from "./components/bit-predict";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
import PrivateRoute from "./components/private-routes";
import { AuthProvider } from "./contexts/auth-context";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<PrivateRoute />}>
            <Route path="/game" element={<BitPredict />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
