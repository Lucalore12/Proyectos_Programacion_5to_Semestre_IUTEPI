const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para manejar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renombrar el archivo
  }
});

const upload = multer({ storage });

// Ruta para subir una tarea
router.post('/uploads', upload.single('file'), (req, res) => {
  const task = {
    title: req.body.title,
    description: req.body.description,
    fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    // Aquí puedes agregar más campos según lo que necesites, como el ID del estudiante o la fecha de publicación
  };

  // Aquí deberías guardar la tarea en tu base de datos
  // Ejemplo: tasks.push(task);
  
  res.status(201).json({ message: 'Tarea subida exitosamente', task });
});

// Ruta para ver las tareas (las que subió el profesor)
router.get('/', (req, res) => {
  // Aquí deberías recuperar las tareas de la base de datos
  // Ejemplo: res.json(tasks);
});

// Ruta para ver las tareas enviadas por los estudiantes
router.get('/submitted', (req, res) => {
  // Aquí deberías recuperar las tareas enviadas por los estudiantes de la base de datos
  // Ejemplo: res.json(submittedTasks);
});

module.exports = router;

  