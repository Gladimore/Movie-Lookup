const BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NWVjOTk1ZWZmMzllMzc4NGMwYWZiZmY1ZWVkZGMyMSIsIm5iZiI6MTcyNzgyNDc1NS4xMDk3OTksInN1YiI6IjY2ZmI0MjRiMDYxYWZlMTE0YmYxNjA4NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Xly7sta5CFHGt6trD9KJo-bd3GTu3xBPC5mHtuyAbUs';

let currentPage = 1;
let totalPages = 1;
let currentQuery = '';

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');

searchButton.addEventListener('click', () => {
    currentQuery = searchInput.value;
    currentPage = 1;
    searchMoviesAndShows();
});

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        searchMoviesAndShows();
    }
});

nextPageButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        searchMoviesAndShows();
    }
});

async function searchMoviesAndShows() {
    const url = `${BASE_URL}/search/multi?query=${encodeURIComponent(currentQuery)}&include_adult=false&language=en-US&page=${currentPage}`;
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
        displayResults(data.results);
    } catch (error) {
        console.error('Error fetching data:', error);
        resultsContainer.innerHTML = '<p>An error occurred while fetching results. Please try again later.</p>';
    }
}

function displayResults(results) {
    resultsContainer.innerHTML = '';
    results.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        resultItem.style.opacity = '0';
        resultItem.style.transform = 'translateY(20px)';
        resultItem.innerHTML = `
            <img src="${result.poster_path ? `${POSTER_BASE_URL}${result.poster_path}` : 'placeholder.jpg'}" alt="${result.title || result.name}" class="poster">
            <div class="result-info">
                <h2>${result.title || result.name}</h2>
                <p>Type: ${result.media_type}</p>
                <p>Release Date: ${result.release_date || result.first_air_date || 'N/A'}</p>
            </div>
        `;
        resultsContainer.appendChild(resultItem);

        // Add click event listener to the poster
        const poster = resultItem.querySelector('.poster');
        poster.addEventListener('click', () => {
            window.location.href = `details.html?id=${result.id}&type=${result.media_type}`;
        });

        // Trigger the domino effect
        setTimeout(() => {
            resultItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            resultItem.style.opacity = '1';
            resultItem.style.transform = 'translateY(0)';
        }, index * 100);
    });
}
