const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Definir la ruta del archivo de usuarios
const usuariosFilePath = path.join(__dirname, '../data/usuarios.json');

// Función para cargar usuarios desde el archivo
const loadUsuarios = () => {
    if (fs.existsSync(usuariosFilePath)) {
        return JSON.parse(fs.readFileSync(usuariosFilePath, 'utf8'));
    }
    return [];
};

// Función para guardar usuarios en el archivo
const saveUsuarios = (usuarios) => {
    fs.writeFileSync(usuariosFilePath, JSON.stringify(usuarios, null, 2)); // Formatear JSON con dos espacios
};

// Ruta para obtener la lista de usuarios
router.get('/', (req, res) => {
    const usuarios = loadUsuarios();
    res.json(usuarios);
});

// Ruta para registrar un nuevo usuario (tanto administradores como usuarios)
router.post('/', async (req, res) => {
    const { nombre, apellido, cedula, correo, direccion, username, password, role } = req.body;

    // Validaciones
    if (!nombre || !apellido || !cedula || !correo || !direccion || !username || !password || !role) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const usuarios = loadUsuarios(); // Cargar usuarios
    const existeUsuario = usuarios.find(usuario => usuario.username === username);
    if (existeUsuario) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = { 
        id: usuarios.length + 1, 
        nombre, 
        apellido, 
        cedula, 
        correo, 
        direccion, 
        role, // Añadido para que se guarde el rol
        username, 
        password: hashedPassword // Guardar contraseña encriptada
    };

    usuarios.push(nuevoUsuario);
    saveUsuarios(usuarios); // Guardar usuarios

    res.status(201).json({ message: 'Usuario registrado con éxito' }); // Código de estado 201 para recursos creados
});

// Ruta para registrar un nuevo administrador
router.post('/register-admin', async (req, res) => {
    const { nombre, apellido, cedula, correo, direccion, username, password } = req.body;

    // Validaciones
    if (!nombre || !apellido || !cedula || !correo || !direccion || !username || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const usuarios = loadUsuarios(); // Cargar usuarios
    const existeUsuario = usuarios.find(usuario => usuario.username === username);
    if (existeUsuario) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = { 
        id: usuarios.length + 1, 
        nombre, 
        apellido, 
        cedula, 
        correo, 
        direccion, 
        role: 'admin', // Asignar el rol de administrador
        username, 
        password: hashedPassword // Guardar contraseña encriptada
    };

    usuarios.push(nuevoUsuario);
    saveUsuarios(usuarios); // Guardar usuarios

    res.status(201).json({ message: 'Administrador registrado con éxito' }); // Código de estado 201 para recursos creados
});

// Ruta para obtener un usuario específico por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const usuarios = loadUsuarios();
    const usuario = usuarios.find(u => u.id == id);

    if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario);
});

// Ruta para eliminar un usuario por ID
router.delete('/:username', (req, res) => {
    const { username } = req.params;
    let usuarios = loadUsuarios();
    const usuarioIndex = usuarios.findIndex(u => u.username === username);

    if (usuarioIndex === -1) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuarios.splice(usuarioIndex, 1); // Eliminar usuario
    saveUsuarios(usuarios); // Guardar cambios

    res.json({ message: 'Usuario eliminado con éxito' });
});

module.exports = router;




