const BASE_URL = 'https://api.themoviedb.org/3';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NWVjOTk1ZWZmMzllMzc4NGMwYWZiZmY1ZWVkZGMyMSIsIm5iZiI6MTcyNzgyNDc1NS4xMDk3OTksInN1YiI6IjY2ZmI0MjRiMDYxYWZlMTE0YmYxNjA4NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Xly7sta5CFHGt6trD9KJo-bd3GTu3xBPC5mHtuyAbUs';

const detailsContainer = document.getElementById('details-container');
let episodeCache = {};

async function fetchDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');

    if (!id || !type) {
        detailsContainer.innerHTML = '<p>Invalid request. Please go back and try again.</p>';
        return;
    }

    const url = `${BASE_URL}/${type}/${id}?language=en-US`;
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
        displayDetails(data, type);
    } catch (error) {
        console.error('Error fetching details:', error);
        detailsContainer.innerHTML = '<p>An error occurred while fetching details. Please try again later.</p>';
    }
}

function displayDetails(item, type) {
    const formattedId = type === 'movie' ? `${item.id}-0-0` : item.id;
    let html = `
        <div class="details-header">
            <img src="${POSTER_BASE_URL}${item.poster_path}" alt="${item.title || item.name}" class="details-poster">
            <div class="details-info">
                <h2>${item.title || item.name}</h2>
                <p class="overview">${item.overview}</p>
                <p>Release Date: ${item.release_date || item.first_air_date}</p>
                <p>ID: <span class="copyable" onclick="copyToClipboard('${formattedId}')">${formattedId}</span></p>
    `;

    if (type === 'movie') {
        html += `
                <p>Runtime: ${item.runtime} minutes</p>
                <p>Budget: $${item.budget.toLocaleString()}</p>
                <p>Revenue: $${item.revenue.toLocaleString()}</p>
            </div>
        </div>
        `;
    } else if (type === 'tv') {
        html += `
                <p>Number of Seasons: ${item.number_of_seasons}</p>
                <p>Number of Episodes: ${item.number_of_episodes}</p>
                <p>Status: ${item.status}</p>
            </div>
        </div>
        <div class="seasons-container">
            <h3>Seasons</h3>
            ${item.seasons.map(season => `
                <div class="season-item">
                    <h4>Season ${season.season_number}</h4>
                    <p>Episodes: ${season.episode_count}</p>
                    <p>Air Date: ${season.air_date || 'N/A'}</p>
                    <p>ID: <span class="copyable" onclick="copyToClipboard('${item.id}-${season.season_number}-0')">${item.id}-${season.season_number}-0</span></p>
                    <button class="load-episodes" data-season="${season.season_number}">Load Episodes</button>
                    <div class="episodes-list" id="episodes-${season.season_number}"></div>
                </div>
            `).join('')}
        </div>
        `;
    }

    detailsContainer.innerHTML = html;

    if (type === 'tv') {
        const loadButtons = document.querySelectorAll('.load-episodes');
        loadButtons.forEach(button => {
            button.addEventListener('click', () => loadEpisodes(item.id, button.dataset.season));
        });
    }
}

async function loadEpisodes(tvShowId, seasonNumber) {
    const episodesContainer = document.getElementById(`episodes-${seasonNumber}`);
    const button = document.querySelector(`[data-season="${seasonNumber}"]`);

    if (episodesContainer.innerHTML !== '') {
        episodesContainer.innerHTML = '';
        button.textContent = 'Load Episodes';
        return;
    }

    button.textContent = 'Hide Episodes';

    const cacheKey = `${tvShowId}-${seasonNumber}`;
    if (episodeCache[cacheKey]) {
        episodesContainer.innerHTML = episodeCache[cacheKey];
        return;
    }

    const url = `${BASE_URL}/tv/${tvShowId}/season/${seasonNumber}?language=en-US`;
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
        let episodesList = '<ul class="episodes-grid">';
        data.episodes.forEach(episode => {
            episodesList += `
                <li class="episode-item">
                    <h5>Episode ${episode.episode_number}: ${episode.name}</h5>
                    <p>Air Date: ${episode.air_date || 'N/A'}</p>
                    <p>ID: <span class="copyable" onclick="copyToClipboard('${tvShowId}-${seasonNumber}-${episode.episode_number}')">${tvShowId}-${seasonNumber}-${episode.episode_number}</span></p>
                </li>
            `;
        });
        episodesList += '</ul>';
        episodeCache[cacheKey] = episodesList;
        episodesContainer.innerHTML = episodesList;
    } catch (error) {
        console.error('Error fetching episode details:', error);
        episodesContainer.innerHTML = '<p>An error occurred while fetching episode details. Please try again later.</p>';
    }
}

function copyToClipboard(text) {
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    alert('ID copied to clipboard!');
}

fetchDetails();
