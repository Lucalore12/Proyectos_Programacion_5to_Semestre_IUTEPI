// app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

// Importar las rutas
const usuariosRoutes = require('./routes/usuariosRoutes');
const userRoutes = require('./routes/userRoutes'); 
const notasRoutes = require('./routes/notasRoutes'); 
const tasksRoutes=require('./routes/tasksRoutes')

// Inicializar express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir solicitudes CORS
app.use(cors());

// Middleware para parsear JSON y datos de formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la sesión
app.use(session({
    secret: 'tu_secreto_aqui', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Asegúrate de tener esto

// Rutas
app.use('/api/usuarios', usuariosRoutes); 
app.use('/api/notas', notasRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/tasks',tasksRoutes)

// Ruta principal para login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).send('No se encontró la ruta');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.use(cors({
    origin: 'http://localhost:3000', // Cambia esto al origen de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

