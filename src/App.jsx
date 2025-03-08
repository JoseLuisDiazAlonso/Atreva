import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/Login.jsx";
import Home from "./pages/Home.jsx";
import PropTypes from "prop-types";

const PrivateRoute = ({children}) => {
  const token = localStorage.getItem("token");
  return token ? children:<Navigate to="/login"/>
};

//Validamos los props con PropTypes
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<Login/>}/>
        <Route path = "/Home" element = {<PrivateRoute><Home/></PrivateRoute>}/>
        <Route patch = "*" element = {<Navigate to="/Login"/>}/>
      </Routes>
    </Router>
  );
}

export default App;

