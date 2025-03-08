
import {useState} from 'react';
import {useNavigate} from "react-router-dom";
import userImage from "../assets/Logo personal.png";
import '../css/Style.css';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate("");

    const handleLogin = async () => {
        setError("");

        if (!username || !password) {
            setError("Los campos deben de estar rellenos");
            return;
        }

        if (!/^[a-zA-Z]+$/.test(username)) {
            setError("El nombre de usuario solo puede tener texto");
            return;
        }

        try {
            const response = await fetch ("http:localhost:5000/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body:JSON.stringify({username, password})
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            localStorage.setItem("token", data.token);
            navigate("/Home");
        } catch(error) {
            console.error("Error en la solicitud: ", error);
            setError("Error de conexión con el servidor");
        }
    };

   
  return (
    <div className='container'>
        <div className='formulario'>
            <img src={userImage}
            alt='Usuario'
            className='logo'/>
            <h2>LOGIN</h2>
            {error && <p>{error}</p>}
            <input type='text' placeholder='Nombre de Usuario' className='input'
            value={username} onChange={(e) => setUsername(e.target.value)}/>
            <input type='password' placeholder='Contraseña' className='input'
            value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button className='boton' onClick={handleLogin}>Login</button>
        </div>
      
    </div>
  )
}

export default Login
