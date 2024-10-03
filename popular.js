const BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NWVjOTk1ZWZmMzllMzc4NGMwYWZiZmY1ZWVkZGMyMSIsIm5iZiI6MTcyNzgyNDc1NS4xMDk3OTksInN1YiI6IjY2ZmI0MjRiMDYxYWZlMTE0YmYxNjA4NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Xly7sta5CFHGt6trD9KJo-bd3GTu3xBPC5mHtuyAbUs';

let currentPage = 1;
let totalPages = 1;

const popularMoviesContainer = document.getElementById('popular-movies');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');

async function fetchPopularMovies() {
    const url = `${BASE_URL}/movie/popular?language=en-US&page=${currentPage}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        totalPages = data.total_pages;
        currentPageSpan.textContent = currentPage;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
        displayPopularMovies(data.results);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        popularMoviesContainer.innerHTML = '<p>An error occurred while fetching popular movies. Please try again later.</p>';
    }
}

function displayPopularMovies(movies) {
    popularMoviesContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-item');
        movieElement.innerHTML = `
            <img src="${POSTER_BASE_URL}${movie.poster_path}" alt="${movie.title}">
            <h2>${movie.title}</h2>
            <p>Release Date: ${movie.release_date}</p>
            <a href="details.html?id=${movie.id}&type=movie">View Details</a>
        `;
        popularMoviesContainer.appendChild(movieElement);
    });
}

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchPopularMovies();
    }
});

nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchPopularMovies();
    }
});

fetchPopularMovies();
