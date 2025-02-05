document.getElementById('searchButton').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        buscarFilme(searchTerm);
    } else {
        alert('Por favor, digite o nome de um filme.');
    }
});

function buscarFilme(searchTerm) {
    const apiKey = '65cd60ac'; // Substitua pela sua chave de API
    const url = `http://www.omdbapi.com/?t=${encodeURIComponent(searchTerm)}&apikey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === 'True') {
                exibirFilme(data);
            } else {
                document.getElementById('result').innerHTML = '<p>Filme não encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar filme:', error);
        });
}

function exibirFilme(filme) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <h2>${filme.Title} (${filme.Year})</h2>
        <img src="${filme.Poster}" alt="${filme.Title}">
        <p><strong>Diretor:</strong> ${filme.Director}</p>
        <p><strong>Atores:</strong> ${filme.Actors}</p>
        <p><strong>Gênero:</strong> ${filme.Genre}</p>
        <p><strong>Sinopse:</strong> ${filme.Plot}</p>
        <p><strong>Imdb:</strong> ${filme.imdbRating}</p>
    `;
}
