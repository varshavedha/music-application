import { supabase } from './supabase.js';

const form = document.getElementById('addSongForm');
const submitBtn = document.getElementById('submitBtn');
const songTableBody = document.getElementById('songTableBody');
const loader = document.getElementById('loader');

// Initialize
async function init() {
    await fetchAdminSongs();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const newSong = {
            title: document.getElementById('title').value,
            artist: document.getElementById('artist').value,
            album: document.getElementById('album').value,
            cover_url: document.getElementById('cover_url').value,
            audio_url: document.getElementById('audio_url').value
        };

        try {
            const { data, error } = await supabase
                .from('songs')
                .insert([newSong]);

            if (error) throw error;

            alert('Song added successfully!');
            form.reset();
            fetchAdminSongs(); // Refresh table
        } catch (error) {
            console.error('Error adding song:', error.message);
            alert('Error adding song: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Song';
        }
    });
}

// Fetch and display songs in the table
async function fetchAdminSongs() {
    try {
        loader.style.display = 'block';
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderAdminTable(data || []);
    } catch (error) {
        console.error('Error fetching songs for admin:', error.message);
        songTableBody.innerHTML = `<tr><td colspan="4" style="color:red;text-align:center;">Failed to load songs: ${error.message}</td></tr>`;
    } finally {
        loader.style.display = 'none';
    }
}

function renderAdminTable(songs) {
    songTableBody.innerHTML = '';

    if (songs.length === 0) {
        songTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No songs available</td></tr>';
        return;
    }

    songs.forEach(song => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${song.cover_url || 'https://via.placeholder.com/40?text=No+Cover'}" alt="${song.title}"></td>
            <td>${song.title}</td>
            <td>${song.artist}</td>
            <td>
                <button class="btn-danger delete-btn" data-id="${song.id}">Delete</button>
            </td>
        `;
        songTableBody.appendChild(tr);
    });

    // Attach event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this song?')) {
                await deleteSong(id);
            }
        });
    });
}

async function deleteSong(id) {
    try {
        const { error } = await supabase
            .from('songs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert('Song deleted successfully!');
        fetchAdminSongs(); // Refresh table
    } catch (error) {
        console.error('Error deleting song:', error.message);
        alert('Error deleting song: ' + error.message);
    }
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
