function saveScore(username, score) {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    // Agregar la nueva puntuación
    scores.push({ username, score });

    // Ordenar y mantener solo las 10 mejores puntuaciones
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);

    // Guardar en localStorage
    localStorage.setItem('scores', JSON.stringify(scores));
}
function loadHighScores() {
    const scoreTableBody = document.getElementById('scoreTableBody');
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];


    // Agregar las puntuaciones al DOM
    scores.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.score}</td>
        `;
        scoreTableBody.appendChild(row);
    });
}