import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Sinup from "./components/Sinup";

export default function App() {
  const location = useLocation(); 
  debugger;
  const state = location.state || {};

  return (
    <>
      <LandingPage />
      <Routes location={state.backgroundLocation || location}>
        <Route path="/signup" element={<Sinup />} />
      </Routes>
    </>
  );
}
