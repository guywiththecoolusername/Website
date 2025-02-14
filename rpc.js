const DISCORD_ID = '927917673344557108';
const WS_URL = 'wss://api.lanyard.rest/socket';
let currentActivity = null;

// Time formatting utility
function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// WebSocket connection
const ws = new WebSocket(WS_URL);
ws.onopen = () => ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));

ws.onmessage = ({ data }) => {
    const packet = JSON.parse(data);
    if (['INIT_STATE', 'PRESENCE_UPDATE'].includes(packet.t)) {
        handlePresenceUpdate(packet.d);
    }
};

function handlePresenceUpdate(data) {
    // Update core presence
    document.getElementById('dynamicAvatar').src = 
        `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${data.discord_user.avatar}.webp`;
    
    document.getElementById('statusIndicator').src = 
        `https://assets.guns.lol/${data.discord_status}.png`;
    
    document.getElementById('username').textContent = 
        data.discord_user.global_name || data.discord_user.username;

    // Update badges
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = data.discord_user.public_flags_array
        .map(flag => `<img src="https://cdn.discordapp.com/badge-icons/${flag}.png" 
                         alt="Badge" 
                         style="height:22px;width:22px">`)
        .join('');

    // Handle activities
    currentActivity = data.activities.find(a => a.type === 2) || 
                    data.activities.find(a => a.type === 4) || 
                    null;

    updateActivityDisplay(data);
    updateLastSeen(data);
}

function updateActivityDisplay(data) {
    const spotifyContainer = document.getElementById('spotifyContainer');
    const statusText = document.getElementById('statusText');

    if (data.listening_to_spotify && data.spotify) {
        // Spotify display
        spotifyContainer.style.display = 'block';
        statusText.textContent = 'Listening to Spotify';
        
        document.getElementById('spotifyAlbumArt').src = data.spotify.album_art_url;
        document.getElementById('spotifyTitle').textContent = data.spotify.song;
        document.getElementById('spotifyDetails').textContent = 
            `${data.spotify.artist} • ${data.spotify.album}`;
        
        updateProgressBar(data.spotify.timestamps);
    } else if (currentActivity?.type === 4) {
        // Custom status
        spotifyContainer.style.display = 'none';
        statusText.textContent = currentActivity.state;
    } else {
        // No activity
        spotifyContainer.style.display = 'none';
    }
}

function updateProgressBar(timestamps) {
    const total = timestamps.end - timestamps.start;
    const current = Date.now() - timestamps.start;
    const progress = Math.min((current / total) * 100, 100);
    document.getElementById('spotifyProgress').style.width = `${progress}%`;
}

function updateLastSeen(data) {
    if (data.discord_status !== 'offline') {
        localStorage.setItem('lastSeen', Date.now());
    } else {
        const lastSeen = localStorage.getItem('lastSeen') || Date.now();
        document.getElementById('statusText').textContent = 
            `Last seen ${timeAgo(lastSeen)}`;
    }
}

// Initialize last seen
if (!localStorage.getItem('lastSeen')) {
    localStorage.setItem('lastSeen', Date.now());
}

window.addEventListener('load', function () {
    document.querySelectorAll('.big-name').forEach((el) => {
      // Check if the element's content is wider than its container
      if (el.scrollWidth > el.parentElement.clientWidth) {
        el.classList.add('scrolling');
      }
    });
  });
  

// Update progress every second
setInterval(() => {
    if (currentActivity?.type === 2 && currentActivity.spotify) {
        updateProgressBar(currentActivity.spotify.timestamps);
    }
}, 1000);

window.addEventListener('load', function () {
    const titleEl = document.getElementById('spotifyTitle');
    const container = titleEl.parentElement; // .spotify-text-container
  
    if (titleEl.scrollWidth > container.clientWidth) {
      titleEl.classList.add('scrolling');
    }
  });
  