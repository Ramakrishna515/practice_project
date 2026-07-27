import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Sinup from "./components/Sinup";
import Sinin from "./components/Sinin";

export default function App() {
  const location = useLocation(); 
  const state = location.state || {};

  return (
    <>
      <LandingPage />
      {/* <Sinin /> */}
      <Routes location={state.backgroundLocation || location}>
        <Route path="/signup" element={<Sinup />} />
        <Route path="/signin" element={<Sinin />} />
      </Routes>
    </>
  );
}
