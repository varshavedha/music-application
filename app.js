import { supabase } from './supabase.js';

// DOM Elements
const songGrid = document.getElementById('songGrid');
const searchInput = document.getElementById('searchInput');
const loader = document.getElementById('loader');

// Player Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressWrapper = document.getElementById('progressWrapper');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');

const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');

// State
let allSongs = [];
let currentSongIndex = -1;
let isPlaying = false;

// Initialize
async function init() {
    await fetchSongs();
    setupEventListeners();
}

// Fetch songs from Supabase
async function fetchSongs() {
    try {
        loader.style.display = 'block';
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        allSongs = data || [];
        renderSongs(allSongs);
    } catch (error) {
        console.error('Error fetching songs:', error.message);
        songGrid.innerHTML = `<p style="color: red;">Failed to load songs: ${error.message}</p>`;
    } finally {
        loader.style.display = 'none';
    }
}

// Render songs to the grid
function renderSongs(songs) {
    songGrid.innerHTML = '';
    
    if (songs.length === 0) {
        songGrid.innerHTML = '<p>No songs found. Add some from the Admin Panel.</p>';
        return;
    }

    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.onclick = () => playSong(song.id);
        
        card.innerHTML = `
            <div class="song-cover-wrapper">
                <img src="${song.cover_url || 'https://via.placeholder.com/200?text=No+Cover'}" alt="${song.title}" class="song-cover">
                <div class="play-btn-overlay">
                    <i class="fa-solid fa-play"></i>
                </div>
            </div>
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
        `;
        songGrid.appendChild(card);
    });
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filteredSongs = allSongs.filter(song => 
        song.title.toLowerCase().includes(term) || 
        song.artist.toLowerCase().includes(term) ||
        (song.album && song.album.toLowerCase().includes(term))
    );
    renderSongs(filteredSongs);
});

// Player Logic
function playSong(id) {
    const songIndex = allSongs.findIndex(s => s.id === id);
    if (songIndex === -1) return;
    
    currentSongIndex = songIndex;
    const song = allSongs[currentSongIndex];
    
    // Update Audio
    audioPlayer.src = song.audio_url;
    audioPlayer.play().catch(e => console.error("Playback failed:", e));
    isPlaying = true;
    
    // Update UI
    playerCover.src = song.cover_url || 'https://via.placeholder.com/56?text=No+Cover';
    playerCover.style.display = 'block';
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;
    
    updatePlayPauseIcon();
}

function togglePlay() {
    if (currentSongIndex === -1 && allSongs.length > 0) {
        // Play first song if nothing is selected
        playSong(allSongs[0].id);
        return;
    }
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
    updatePlayPauseIcon();
}

function playNext() {
    if (allSongs.length === 0) return;
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= allSongs.length) nextIndex = 0; // Loop back
    playSong(allSongs[nextIndex].id);
}

function playPrev() {
    if (allSongs.length === 0) return;
    // If playing for more than 3 seconds, restart current song
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
        return;
    }
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = allSongs.length - 1; // Loop to end
    playSong(allSongs[prevIndex].id);
}

function updatePlayPauseIcon() {
    playPauseBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Event Listeners for Player
function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlay);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrev);
    
    // Audio events
    audioPlayer.addEventListener('timeupdate', () => {
        const { currentTime, duration } = audioPlayer;
        if (!isNaN(duration)) {
            const percent = (currentTime / duration) * 100;
            progressBar.style.width = `${percent}%`;
            currentTimeEl.textContent = formatTime(currentTime);
            totalTimeEl.textContent = formatTime(duration);
        }
    });
    
    audioPlayer.addEventListener('ended', playNext);
    
    // Progress bar click
    progressWrapper.addEventListener('click', (e) => {
        if (currentSongIndex === -1) return;
        const width = progressWrapper.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    });
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        audioPlayer.volume = volume;
        
        // Update icon based on volume
        if (volume == 0) {
            volumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (volume < 0.5) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high';
        }
    });
    
    // Set initial volume
    audioPlayer.volume = volumeSlider.value;
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
