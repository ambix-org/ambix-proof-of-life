'use strict';

// Token Management

const REFRESH = localStorage.getItem('refresh');

const fieldset = document.getElementById('token-fieldset');
let playerStatus = document.createElement('p');
playerStatus.textContent = 'Player Initializing...';
playerStatus.setAttribute('class', 'warning');

fieldset.appendChild(playerStatus);

if (!REFRESH) {
  playerStatus.setAttribute('class', 'error');
  playerStatus.textContent = 'Please sign in to Spotify';
  const logoutButton = document.getElementById('clear-token');
  logoutButton.setAttribute('class', 'hidden');
} else {
  const spotifyButton = document.getElementById('spotify-button');
  spotifyButton.textContent = 'Reauthorize';
}

const clearTokenButton = document.getElementById('clear-token');
clearTokenButton.addEventListener('click', () => {
  localStorage.removeItem('refresh');
  location.reload();
});

// Spotify Web Playback SDK

let spotifyPlayer;

window.onSpotifyWebPlaybackSDKReady = () => {
  spotifyPlayer = new Spotify.Player({
    name: 'Ambix',
    // This function is called on connect() and every hour to re-auth
    getOAuthToken: cb => {
      console.log('Authorizing Spotify Player')
      axios.post('http://localhost:3000/spotify-refresh', `refresh=${REFRESH}`)
        .then(response => {
          const accessToken = response.data.accessToken;
          const refreshToken = response.data.refreshToken;
          localStorage.setItem('refresh', refreshToken);
          cb(accessToken);
        })
        .catch( err => console.error('TOKEN ERROR:', err));
    }
  });

  // Error handling
  spotifyPlayer.addListener('initialization_error', ({ message }) => {
    console.error('Initialization Error:', message);
  });
  spotifyPlayer.addListener('authentication_error', ({ message }) => {
    console.error('Authentication Error:', message);
    playerStatus.textContent = 'Authorization Failed. Token stale?';
    playerStatus.setAttribute('class', 'error');
  });
  spotifyPlayer.addListener('account_error', ({ message }) => {
    console.error('Account Error:', message);
  });
  spotifyPlayer.addListener('playback_error', ({ message }) => {
    console.error('Playback Error:', message);
  });

  // Playback status updates
  spotifyPlayer.addListener('player_state_changed', state => {
    console.log('State Change: ', state);
    spotifyPlayer.getVolume()
      .then(currentLevel => {
        volumeRangeSpotify.value = currentLevel * 100;
      });
  });

  // Ready
  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    playerStatus.textContent = 'Ready, select \'Ambix\' in Spotify';
    playerStatus.setAttribute('class', 'success');
  });

  // Not Ready
  spotifyPlayer.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  spotifyPlayer.connect();
};

// Controls

const playSpotifyButton = document.getElementById('play');
playSpotifyButton.addEventListener('click', () => {
  spotifyPlayer.resume().then(() => {
    console.log('Resumed!');
  });
});

const pauseSpotifyButton = document.getElementById('pause');
pauseSpotifyButton.addEventListener('click', () => {
  spotifyPlayer.pause().then(() => {
    console.log('Paused!');
  });
});

const nextSpotifyButton = document.getElementById('next');
nextSpotifyButton.addEventListener('click', () => {
  spotifyPlayer.nextTrack().then(() => {
    console.log('Skipped to next track!');
  });
});

const previousSpotifyButton = document.getElementById('previous');
previousSpotifyButton.addEventListener('click', () => {
  spotifyPlayer.previousTrack().then(() => {
    console.log('Set to previous track!');
  });
});

const volumeDownSpotify = document.getElementById('volume-down-spotify');
volumeDownSpotify.addEventListener('click', () => {
  spotifyPlayer.getVolume()
    .then(currentLevel => {
      const newLevel = currentLevel - 0.01;
      if (newLevel >= 0) {
        spotifyPlayer.setVolume(newLevel)
          .then(() => {
            console.log(`Volume set to ${newLevel}.`);
          });
      }
    });
});

const volumeUpSpotify = document.getElementById('volume-up-spotify');
volumeUpSpotify.addEventListener('click', () => {
  spotifyPlayer.getVolume()
    .then(currentLevel => {
      const newLevel = currentLevel + 0.01;
      if (newLevel <= 1) {
        spotifyPlayer.setVolume(newLevel)
          .then(() => {
            console.log(`Volume set to ${newLevel}.`)
          });
      }
    });
});

const volumeRangeSpotify = document.getElementById('volume-range-spotify');
volumeRangeSpotify.addEventListener('change', () => {
  let newLevel = volumeRangeSpotify.value / 100;
  spotifyPlayer.setVolume(newLevel)
    .then(() => {
      console.log(`Volume set to ${newLevel}.`)
    })
})
