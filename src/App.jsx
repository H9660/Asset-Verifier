import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Candidate from "./pages/Candidate";
import { ToastContainer } from "react-toastify";
import Verify from "./pages/Verify";

function App() {
  return (
    <Router>
      <ToastContainer
        position="bottom-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        // transition="Bounce"
      />
      <Routes>
        <Route path="/candidate" element={<Candidate />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </Router>
  );
}

export default App;
