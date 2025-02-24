// Configurações
const apiKey = '65cd60ac'; // Substitua pela sua chave
const suggestionCache = new Map();
let searchTimeout;

// Elementos DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const autocompleteResults = document.getElementById('autocompleteResults');

// Event Listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', e => e.key === 'Enter' && performSearch());
searchInput.addEventListener('input', handleInput);

// Função principal de busca
async function performSearch() {
    const searchTerm = searchInput.value.trim();
    clearAutocomplete();

    if (!searchTerm) {
        showError('Por favor, digite o nome de um filme.');
        return;
    }

    try {
        toggleLoading(true);
        const movieData = await fetchMovieData(searchTerm);
        
        if (movieData.Response === 'True') {
            showMovieDetails(movieData);
            searchInput.classList.add('success');
        } else {
            showError('Filme não encontrado. Tente outro nome.');
        }
    } catch (error) {
        showError(`Erro na busca: ${error.message}`);
    } finally {
        toggleLoading(false);
    }
}

// Autocomplete
async function handleInput(e) {
    clearTimeout(searchTimeout);
    const term = e.target.value.trim();
    
    if (term.length < 3) {
        clearAutocomplete();
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const suggestions = await fetchSuggestions(term);
            showAutocomplete(suggestions);
        } catch (error) {
            console.error('Erro no autocomplete:', error);
        }
    }, 300);
}

async function fetchSuggestions(term) {
    if (suggestionCache.has(term)) {
        return suggestionCache.get(term);
    }

    const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(term)}&apikey=${apiKey}`);
    const data = await response.json();
    
    if (data.Response === 'True') {
        suggestionCache.set(term, data.Search);
        return data.Search;
    }
    return [];
}

function showAutocomplete(suggestions) {
    autocompleteResults.innerHTML = suggestions
        .slice(0, 5)
        .map(movie => `
            <div class="autocomplete-item" data-title="${movie.Title}">
                ${movie.Title} (${movie.Year})
            </div>
        `).join('');

    document.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            searchInput.value = item.dataset.title;
            performSearch();
        });
    });
}

// Funções de apoio
async function fetchMovieData(term) {
    const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(term)}&apikey=${apiKey}`);
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return await response.json();
}

function showMovieDetails(movie) {
    resultDiv.innerHTML = `
        <h2>${movie.Title} (${movie.Year})</h2>
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title}">
        <div class="movie-info">
            <p><strong>Diretor:</strong> ${movie.Director}</p>
            <p><strong>Atores:</strong> ${movie.Actors}</p>
            <p><strong>Gênero:</strong> ${movie.Genre}</p>
            <p><strong>Sinopse:</strong> ${movie.Plot}</p>
            <p><strong>IMDb:</strong> ${movie.imdbRating}/10</p>
        </div>
    `;
}

function toggleLoading(show) {
    searchButton.disabled = show;
    searchButton.innerHTML = show ? '<div class="loading"></div>' : 'Buscar';
}

function showError(message) {
    errorDiv.textContent = message;
    setTimeout(() => errorDiv.textContent = '', 3000);
    searchInput.classList.add('error');
    setTimeout(() => searchInput.classList.remove('error'), 3000);
}

function clearAutocomplete() {
    autocompleteResults.innerHTML = '';
}
