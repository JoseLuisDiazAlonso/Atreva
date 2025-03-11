import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userImage from "../assets/Logo personal.png";
import '../css/Style.css';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate("");

    //Cargamos los credenciales almacenadas al iniciar.
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const storedPassword = localStorage.getItem("password");
        if (storedUsername && storedPassword) {
            setUsername(storedUsername);
            setPassword(storedPassword);
        }
    }, []);

    //Hacemos la comprobación de los datos introducidos en el login.
    const handleLogin = async () => {
        setError(""); //Reinicia errores
        if (!username || !password) {
            setError("Los campos deben de estar rellenos");
            return;
        }
        if (!/^[a-zA-Z]+$/.test(username)) {
            setError("El nombre de usuario solo puede tener texto.");
            return;
        }

        // Guardamos los credenciales en localStorage
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);

        try {
            // Realizamos la solicitud POST al backend para autenticar al usuario
            const response = await fetch('http://localhost:5000/login', {  // Asegúrate de que esta URL sea la correcta para tu servidor
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Si la autenticación es exitosa, redirige a Home
                navigate("/Home");
            } else {
                // Si la autenticación falla, muestra el error
                setError(data.message || "Error en el login");
            }
        } catch (error) {
            console.error('Error al hacer login:', error);
            setError("Hubo un problema con la conexión al servidor");
        }
    };

    return (
        <div className='container'>
            <div className='formulario'>
                <img src={userImage} alt='Usuario' className='logo'/>
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
