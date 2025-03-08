import mysql from 'mysql2';
import process from 'process';

const db =mysql.createConnection ({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    multipleStatement:true,
});

db.connect((err)=>{
    if (err) {
        console.error("Error al contectar a MySQL: ", err);
        return;
    }
    console.log("Conectado a la base de datos MySQL");
});
