import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./components/Login.jsx";
import Home from "./pages/Home.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<Login/>}/>
        <Route path = "/Home" element = {<Home/>}/>
      </Routes>
    </Router>
  );
}

export default App;
