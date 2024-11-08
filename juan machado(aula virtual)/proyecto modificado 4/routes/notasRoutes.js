const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Definir la ruta del archivo de notas en formato Excel
const notasFilePath = path.join(__dirname, '../data/notas.xlsx');
// Ruta al archivo usuarios.xlsx
const usuariosFilePath = path.join(__dirname, '../data/usuarios.xlsx');

// Función para leer el archivo de usuarios
const loadUsuarios = () => {
    if (fs.existsSync(usuariosFilePath)) {
        const workbook = xlsx.readFile(usuariosFilePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(worksheet);
    }
    return [];
};

// Función para cargar notas desde el archivo Excel
const loadNotas = () => {
    if (!fs.existsSync(notasFilePath)) {
        // Crear un archivo Excel vacío con los encabezados si no existe
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet([]);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Notas');
        xlsx.writeFile(workbook, notasFilePath);
        return [];
    }
    const workbook = xlsx.readFile(notasFilePath);
    const worksheet = workbook.Sheets['Notas'];
    return xlsx.utils.sheet_to_json(worksheet);
};

// Función para guardar notas en el archivo Excel
const saveNotas = (notas) => {
    const workbook = xlsx.readFile(notasFilePath); // Abrir archivo existente
    const worksheet = xlsx.utils.json_to_sheet(notas);
    workbook.Sheets['Notas'] = worksheet;  // Reemplazar la hoja existente
    xlsx.writeFile(workbook, notasFilePath);
};

// Ruta para asignar una nueva nota
router.post('/assign', (req, res) => {
    const { studentId, grade, taskTitle } = req.body;

    if (!studentId || grade === undefined || !taskTitle) {
        return res.status(400).json({ message: 'studentId, grade y taskTitle son obligatorios' });
    }

    const numericGrade = Number(grade);
    if (isNaN(numericGrade)) {
        return res.status(400).json({ message: 'El grado debe ser un número' });
    }

    // Cargar los usuarios y verificar si el estudiante existe
    const usuarios = loadUsuarios();
    const student = usuarios.find(user => user.cedula === studentId && user.role === 'student');

    if (!student) {
        return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Cargar las notas actuales y añadir la nueva nota
    const notas = loadNotas();
    const newNota = {
        taskTitle,
        studentId,
        grade: numericGrade
    };

    notas.push(newNota);
    saveNotas(notas);

    res.status(201).json({
        message: 'Nota asignada con éxito',
        nota: newNota
    });
});

// Ruta para obtener las notas de un estudiante
router.get('/:studentId', (req, res) => {
    const { studentId } = req.params;
    const notas = loadNotas(); // Cargar todas las notas

    // Filtrar las notas del estudiante por su ID
    const studentNotas = notas.filter(nota => String(nota.studentId) === String(studentId));

    if (studentNotas.length === 0) {
        return res.status(404).json({ message: 'No se encontraron notas para este estudiante' });
    }

    // Crear un worksheet a partir de las notas del estudiante
    const worksheet = xlsx.utils.json_to_sheet(studentNotas);

    // Crear un nuevo libro de trabajo (workbook) y agregarle la hoja de notas
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Notas');

    // Configurar los encabezados para que el navegador reconozca la respuesta como un archivo Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=notas_estudiante.xlsx');
    
    // Enviar el archivo Excel al cliente
    res.send(xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' }));
});

// Ruta para actualizar una nota
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { grade } = req.body;

    const notas = loadNotas();
    const notaIndex = notas.findIndex((nota, index) => index == id);

    if (notaIndex === -1) {
        return res.status(404).json({ message: 'Nota no encontrada' });
    }

    if (grade !== undefined) {
        const numericGrade = Number(grade);
        if (isNaN(numericGrade)) {
            return res.status(400).json({ message: 'El grado debe ser un número' });
        }
        notas[notaIndex].grade = numericGrade;
    }

    saveNotas(notas);
    res.json({ message: 'Nota actualizada con éxito', nota: notas[notaIndex] });
});

// Ruta para eliminar una nota
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const notas = loadNotas();

    const newNotas = notas.filter((_, index) => index != id);

    if (newNotas.length === notas.length) {
        return res.status(404).json({ message: 'Nota no encontrada' });
    }

    saveNotas(newNotas);
    res.json({ message: 'Nota eliminada con éxito' });
});

// Ruta para obtener todas las notas
router.get('/', (req, res) => {
    const notas = loadNotas();
    res.json(notas);
});

module.exports = router;

