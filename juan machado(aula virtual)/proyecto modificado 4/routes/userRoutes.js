const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para guardar archivos subidos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Archivo de base de datos en Excel para usuarios
const userFilePath = path.join(__dirname, '../data/usuarios.xlsx');
const userWorkbook = XLSX.readFile(userFilePath);

// Middleware para verificar la autenticación
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.status(403).json({ message: 'No autorizado' });
    }
}

// Ruta para registrar un administrador
router.post('/register-admin', async (req, res) => {
    const { nombre, apellido, cedula, correo, direccion, username, password } = req.body;
    const usersSheet = userWorkbook.Sheets['Usuarios'];
    const users = XLSX.utils.sheet_to_json(usersSheet);

    const existingAdmin = users.find(user => user.role === 'admin');
    if (existingAdmin) {
        return res.status(400).json({ message: 'Ya existe un administrador registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
        nombre,
        apellido,
        cedula,
        correo,
        direccion,
        username,
        password: hashedPassword,
        role: 'admin'
    });

    const newSheet = XLSX.utils.json_to_sheet(users);
    userWorkbook.Sheets['Usuarios'] = newSheet;
    XLSX.writeFile(userWorkbook, userFilePath);

    res.status(201).json({ message: 'Administrador registrado exitosamente.' });
});

// Ruta de registro de usuarios
router.post('/register', async (req, res) => {
    const { nombre, apellido, cedula, correo, direccion, username, password, role } = req.body;
    const usersSheet = userWorkbook.Sheets['Usuarios'];
    const users = XLSX.utils.sheet_to_json(usersSheet);

    // Validar rol de administrador
    if (role === 'admin') {
        const existingAdmin = users.find(user => user.role === 'admin');
        if (existingAdmin) {
            return res.status(400).json({ message: 'Ya existe un administrador registrado.' });
        }
    }

    // Verificar si el usuario ya existe
    if (users.some(user => user.username === username || user.cedula === cedula)) {
        return res.status(400).json({ message: 'El usuario o la cédula ya existen' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
        nombre,
        apellido,
        cedula,
        correo,
        direccion,
        username,
        password: hashedPassword,
        role
    });

    const newSheet = XLSX.utils.json_to_sheet(users);
    userWorkbook.Sheets['Usuarios'] = newSheet;
    XLSX.writeFile(userWorkbook, userFilePath);

    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
});

// Ruta de login de usuarios
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const usersSheet = userWorkbook.Sheets['Usuarios'];
    const users = XLSX.utils.sheet_to_json(usersSheet);

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    req.session.user = user;
    res.json({ message: 'Inicio de sesión exitoso', role: user.role });
});

// Ruta de cierre de sesión
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Error al cerrar sesión' });
        res.json({ message: 'Sesión cerrada exitosamente' });
    });
});

// Ruta para obtener todos los usuarios
router.get('/', isAuthenticated, (req, res) => { // Aplicando el middleware de autenticación
    const usersSheet = userWorkbook.Sheets['Usuarios'];
    const users = XLSX.utils.sheet_to_json(usersSheet);
    res.json(users);
});

// Ruta para subir tareas sin fechas
router.post('/tasks/uploads', upload.single('file'), async (req, res) => {
  const { title, description, assignedTo } = req.body;

  // Validar si se subió un archivo
  if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
  }

  // Validar los campos necesarios
  if (!title || !description || !assignedTo) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Leer las tareas existentes
  const taskFilePath = path.join(__dirname, '../data/tareas.xlsx');

  try {
      const taskWorkbook = XLSX.readFile(taskFilePath);
      const taskSheet = taskWorkbook.Sheets['Tareas'];
      const tasks = XLSX.utils.sheet_to_json(taskSheet);

      // Agregar la nueva tarea
      tasks.push({
          title,
          description,
          file: req.file.path,
          assignedTo // Asegúrate de guardar a quién está asignada la tarea
      });

      const newTaskSheet = XLSX.utils.json_to_sheet(tasks);
      taskWorkbook.Sheets['Tareas'] = newTaskSheet;
      XLSX.writeFile(taskWorkbook, taskFilePath);

      res.json({ message: 'Tarea subida exitosamente', title, description, file: req.file.path });
  } catch (error) {
      console.error('Error al guardar la tarea:', error);
      res.status(500).json({ message: 'Error al guardar la tarea' });
  }
});



// Ruta para obtener todas las tareas
router.get('/tasks', isAuthenticated, (req, res) => { // Aplicando el middleware de autenticación
    const taskFilePath = path.join(__dirname, '../data/tareas.xlsx');
    const taskWorkbook = XLSX.readFile(taskFilePath);
    const taskSheet = taskWorkbook.Sheets['Tareas'];
    const tasks = XLSX.utils.sheet_to_json(taskSheet);
    res.json(tasks);
});

// Ruta para eliminar un usuario por username
router.delete('/:username', isAuthenticated, (req, res) => { // Aplicando el middleware de autenticación
    const { username } = req.params;
    const usersSheet = userWorkbook.Sheets['Usuarios'];
    const users = XLSX.utils.sheet_to_json(usersSheet);

    const newUsers = users.filter(user => user.username !== username);

    if (newUsers.length === users.length) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const newSheet = XLSX.utils.json_to_sheet(newUsers);
    userWorkbook.Sheets['Usuarios'] = newSheet;
    XLSX.writeFile(userWorkbook, userFilePath);

    res.json({ message: 'Usuario eliminado con éxito' });
});

// Ruta para obtener todos los estudiantes
router.get('/students', isAuthenticated, (req, res) => { // Aplicando el middleware de autenticación
    const usersSheet = userWorkbook.Sheets['Usuarios'];
    const users = XLSX.utils.sheet_to_json(usersSheet);

    const students = users.filter(user => user.role === 'student');

    if (students.length === 0) {
        return res.status(404).json({ message: 'No se encontraron estudiantes' });
    }

    res.json(students);
});

// Ruta para registrar un estudiante
router.post('/register-student', async (req, res) => {
    const { nombre, apellido, cedula, correo, direccion, username, password } = req.body;

    const usersSheet = userWorkbook.Sheets['Usuarios'];
    const users = XLSX.utils.sheet_to_json(usersSheet);

    if (users.some(user => user.username === username || user.cedula === cedula)) {
        return res.status(400).json({ message: 'El usuario o la cédula ya existen' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
        nombre,
        apellido,
        cedula,
        correo,
        direccion,
        username,
        password: hashedPassword,
        role: 'student'
    });

    const newSheet = XLSX.utils.json_to_sheet(users);
    userWorkbook.Sheets['Usuarios'] = newSheet;
    XLSX.writeFile(userWorkbook, userFilePath);

    res.status(201).json({ message: 'Estudiante registrado exitosamente.' });
});

router.get('/tasks/assigned', isAuthenticated, (req, res) => {
  console.log('Solicitud recibida para tareas asignadas por el usuario:', req.session.user.username);
  const taskFilePath = path.join(__dirname, '../data/tareas.xlsx');
  const taskWorkbook = XLSX.readFile(taskFilePath);
  const taskSheet = taskWorkbook.Sheets['Tareas'];
  const tasks = XLSX.utils.sheet_to_json(taskSheet);

  const assignedTasks = tasks.filter(task => task.assignedTo === req.session.user.username);

  res.json(assignedTasks);
});


module.exports = router;




