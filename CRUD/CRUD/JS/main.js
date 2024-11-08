let users = [];
let selectedUserIndex =-1;

// Función para guardar datos en Local Storage
function saveToLocalStorage() {
  localStorage.setItem("users", JSON.stringify(users));
}

// Función para cargar datos desde Local Storage
function loadFromLocalStorage() {
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) {
    users = JSON.parse(storedUsers);
    displayUsers(); // Muestra los datos cargados en la tabla
  }
}

// Función para agregar o actualizar datos
function addData() {
  const email = document.getElementById("inputEmail").value;
  const name = document.getElementById("inputName").value;
  const phone = document.getElementById("inputPhone").value;

  if (!email || !name || !phone) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  const user = { email, name, phone };

  if (selectedUserIndex === -1) {
    users.push(user); // Agrega el usuario si no estamos en modo edición
  } else {
    users[selectedUserIndex] = user; // Actualiza el usuario en la posición seleccionada
    selectedUserIndex = -1;
    document.getElementById("btnAdd").style.display = "inline";
    document.getElementById("btnUpdate").style.display = "none";
  }
  clearForm();
  saveToLocalStorage(); // Guarda los datos en Local Storage
  displayUsers(); // Muestra la tabla actualizada
}

// Función para limpiar el formulario
function clearForm() {
  document.getElementById("inputEmail").value = "";
  document.getElementById("inputName").value = "";
  document.getElementById("inputPhone").value = "";
}

// Función para mostrar los datos en la tabla
function displayUsers() {
  const tableBody = document.querySelector("#tableData tbody");
  tableBody.innerHTML = ""; // Limpia la tabla antes de agregar nuevos datos

  users.forEach((user, index) => {
    const row = `<tr>
      <td>${user.email}</td>
      <td>${user.name}</td>
      <td>${user.phone}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editUser(${index})">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteUser(${index})">Eliminar</button>
      </td>
    </tr>`;
    tableBody.insertAdjacentHTML("beforeend", row); // Agrega cada fila a la tabla
  });
}

// Función para editar un usuario
function editUser(index) {
  const user = users[index];
  document.getElementById("inputEmail").value = user.email;
  document.getElementById("inputName").value = user.name;
  document.getElementById("inputPhone").value = user.phone;
  selectedUserIndex = index;

  document.getElementById("btnAdd").style.display = "none";
  document.getElementById("btnUpdate").style.display = "inline";
}

// Función para eliminar un usuario
function deleteUser(index) {
  users.splice(index, 1); // Elimina el usuario en la posición indicada
  saveToLocalStorage(); // Guarda los cambios en Local Storage
  displayUsers(); // Vuelve a mostrar los usuarios en la tabla
}

// Iniciar sesión de usuario
function login(event) {
  event.preventDefault(); // Evitar el envío del formulario por defecto

  const form = document.getElementById("loginForm");
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Validar formulario
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  const user = registeredUsers.find(user => user.email === email && user.password === password);

  if (user) {
    localStorage.setItem("loggedIn", "true");
    alert("Inicio de sesión exitoso.");
    showCRUDSection(); // Muestra la sección CRUD
  } else {
    alert("Correo electrónico o contraseña incorrectos.");
  }
}

// Registrar usuario
function registerUser(event) {
  event.preventDefault(); // Evitar el envío del formulario por defecto

  const form = document.getElementById("registerForm");
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  // Validar formulario
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
  registeredUsers.push({ email, password });

  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
  alert("Usuario registrado exitosamente.");
  form.reset(); // Limpiar el formulario después de registrar
}

// Mostrar sección CRUD y ocultar login
function showCRUDSection() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("crudSection").style.display = "block";
  loadFromLocalStorage(); // Cargar y mostrar los datos
}

// Verificar si el usuario ya ha iniciado sesión
function checkLoginStatus() {
  if (localStorage.getItem("loggedIn") === "true") {
    showCRUDSection();
  }
}

// Cerrar sesión
function logout() {
  localStorage.removeItem("loggedIn");
  document.getElementById("crudSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

// Ejecuta la verificación de login al cargar la página
checkLoginStatus();

// Event listeners para los formularios
document.getElementById("loginForm").addEventListener("submit", login);
document.getElementById("registerForm").addEventListener("submit", registerUser);

// Event listener para el botón de actualización
document.getElementById("btnUpdate").addEventListener("click", (e) => {
  e.preventDefault();
  addData(); // Llama a la función addData al hacer clic en actualizar
});

// Función para descargar la tabla de usuarios como PDF usando html2canvas
function downloadPDF() {
  // Seleccionamos el elemento que queremos capturar (la tabla de usuarios)
  const element = document.getElementById("tableData"); // ID de la tabla con los datos de usuarios

  if (!element || element.rows.length === 0) {
      alert("No hay datos en la tabla para descargar.");
      return;
  }

  // Usamos html2canvas para capturar el contenido de la tabla como una imagen
  html2canvas(element, { 
      scale: 2, // Aumenta la escala para mejorar la calidad de la imagen
      logging: true, // Habilita el registro para depuración
      useCORS: true, // Permite cargar imágenes de otras fuentes (si las hubiera)
  }).then(canvas => {
      // Creamos un nuevo documento PDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Convertimos el canvas en una imagen (data URL) en formato PNG
      const imgData = canvas.toDataURL('image/png');
      
      // Agregamos la imagen al documento PDF
      const imgWidth = 180; // Ajusta el tamaño de la imagen en el PDF
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Mantén la proporción de la imagen

      doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight); // Ajusta el tamaño de la imagen dentro del PDF
      
      // Guardamos el archivo PDF generado
      doc.save('usuarios.pdf');
  }).catch(error => {
      console.error("Error al generar el PDF:", error);
  });
}

function searchData() {
  let input = document.getElementById("searchInput");
  let filter = input.value.toUpperCase();
  let table = document.getElementById("tableData");
  let tr = table.getElementsByTagName("tr");

  for (let i = 1; i < tr.length; i++) {
      tr[i].style.display = "none"; // Oculta todas las filas inicialmente
      let td = tr[i].getElementsByTagName("td");
      for (let j = 0; j < td.length; j++) {
          if (td[j]) {
              let txtValue = td[j].textContent || td[j].innerText;
              if (txtValue.toUpperCase().indexOf(filter) > -1) {
                  tr[i].style.display = ""; // Muestra la fila si coincide con la búsqueda
                  break;
              }
          }
      }
  }
}
