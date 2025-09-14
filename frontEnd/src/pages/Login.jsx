import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userImage from "../assets/media/Logo personal.png";
import axios from 'axios';


// Usamos la variable de entorno VITE_API_BASE_URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
    const [username, setUsername] = useState(""); 
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Cargamos los credenciales almacenadas al iniciar
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const storedPassword = localStorage.getItem("password");
        if (storedUsername && storedPassword) {
            setUsername(storedUsername);
            setPassword(storedPassword);
        }
    }, []);

    // Hacemos la comprobación de los datos introducidos en el login
    const handleLogin = async () => {
        setError(""); // Reinicia errores
        if (!username || !password) {
            setError("Los campos deben de estar rellenos");
            return;
        }
        if (!/^[a-zA-Z]+$/.test(username)) {
            setError("El nombre de usuario solo puede tener texto.");
            return;
        }

        try {
            // Realizamos la solicitud POST al backend para autenticar al usuario
            const response = await axios.post(`${API_URL}/auth/login`, {
                usuario: username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                const { token } = response.data;

                // Guardamos el token y el username
                localStorage.setItem("token", token);
                localStorage.setItem("username", username);

                navigate("/Home");
            } else {
                setError(response.data.message || "Error en el login");
            }
        } catch (error) {
            console.error("Error al hacer login", error);
            setError("Hubo un problema con la conexión al servidor");
        }
    };

    return (
        <div className='container'>
            <div className='formulario'>
                <img src={userImage} alt='Usuario' className='logo' />
                <h1>ATHENEA</h1>
                <h2>LOGIN</h2>
                {error && <p>{error}</p>}
                <input
                    type='text'
                    placeholder='Nombre de Usuario'
                    className='input'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type='password'
                    placeholder='Contraseña'
                    className='input'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className='boton' onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
};

export default Login;
