'use strict';

// Token Management

const TOKEN = localStorage.getItem('token');

const fieldset = document.getElementById('token-fieldset');
let tokenStatus = document.createElement('p');
let playerStatus = document.createElement('p');
playerStatus.textContent = 'Player Initializing...';
playerStatus.setAttribute('class', 'warning');

fieldset.appendChild(tokenStatus);
fieldset.appendChild(playerStatus);

if (!TOKEN) {
  tokenStatus.setAttribute('class', 'error');
  tokenStatus.textContent = 'Please submit an access token...';
} else {
  tokenStatus.setAttribute('class', 'success');
  tokenStatus.textContent = 'Token retrieved from storage';
}

const clearTokenButton = document.getElementById('clear-token');
clearTokenButton.addEventListener('click', () => {
  localStorage.removeItem('token');
  tokenStatus.textContent = 'Token cleared. Please submit token.'
  tokenStatus.setAttribute('class', 'warning')
  location.reload();
})

// Spotify Web Playback SDK

let spotifyPlayer;

window.onSpotifyWebPlaybackSDKReady = () => {
  console.log(TOKEN)
  spotifyPlayer = new Spotify.Player({
    name: 'Ambix',
    getOAuthToken: cb => { cb(TOKEN); }
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
    playerStatus.textContent = 'Spotify Web Playback SDK is ready';
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
