const appID = '2f5a1799d225797f65692eec5248db12';
const MAX_HISTORY = 5;

let cityHistory = [];

const elements = {
  searchBtn: document.getElementById('search-btn'),
  searchInput: document.getElementById('site-search'),
  container: document.getElementById('weather-container'),
  city: document.getElementById('city'),
  temp: document.getElementById('temperature'),
  weather: document.getElementById('weather'),
  historyContainer: document.getElementById('history-container')
};

const weatherEmojis = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️'
};

elements.searchBtn.addEventListener('click', async () => {
  const city = elements.searchInput.value.trim();
  if (!city) return;

  try {
    const data = await fetchWeather(city);
    
    if (!data) {
      showError('Ville inconnue');
      return;
    }

    const meteo = createWeatherDTO(data);
    showWeather(meteo);
    addToHistory(meteo.city);
  } catch (err) {
    showError('Erreur de connexion');
    console.error(err);
  }
});

elements.searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') elements.searchBtn.click();
});

async function fetchWeather(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${appID}&units=metric&lang=fr`
  );
  const data = await res.json();
  return data.cod === '404' ? null : data;
}

function createWeatherDTO(data) {
  const main = data.weather[0].main;
  return {
    city: data.name,
    temperature: Math.round(data.main.temp) + '°C',
    weather: main,
    emoji: weatherEmojis[main] || '🌍'
  };
}

function showWeather(meteo) {
  elements.city.textContent = meteo.city;
  elements.temp.textContent = meteo.temperature;
  elements.weather.textContent = `${meteo.emoji} ${meteo.weather}`;
  elements.container.classList.remove('hidden');
  elements.container.classList.add('show');
}

function showError(msg) {
  elements.city.textContent = '';
  elements.temp.textContent = '';
  elements.weather.textContent = msg;
  elements.container.classList.remove('hidden');
  elements.container.classList.add('show');
}

function addToHistory(city) {
  cityHistory = cityHistory.filter(c => c !== city);
  cityHistory.unshift(city);
  if (cityHistory.length > MAX_HISTORY) {
    cityHistory.length = MAX_HISTORY;
  }
  renderHistory();
}

function renderHistory() {
  elements.historyContainer.innerHTML = cityHistory
    .map(city => `<button class="history-btn">${city}</button>`)
    .join('');
  
  elements.historyContainer.onclick = (e) => {
    if (e.target.classList.contains('history-btn')) {
      elements.searchInput.value = e.target.textContent;
      elements.searchBtn.click();
    }
  };
}

renderHistory();