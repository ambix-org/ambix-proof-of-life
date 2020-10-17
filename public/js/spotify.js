'use strict';

// Token Management

const REFRESH = localStorage.getItem('refresh');
const REFRESH_URI = 'https://ambix.herokuapp.com/spotify-refresh';

const $spotifyConnect = $('#spotify-connect');
let $playerStatus = $('#player-status');
$playerStatus.text('Player Initializing...');
$playerStatus.addClass('warning');

$spotifyConnect.append($playerStatus);

if (!REFRESH) {
  $playerStatus.attr('class', 'error');
  $playerStatus.text('Please sign in to Spotify');
  const $logoutButton = $('#logout');
  $logoutButton.addClass('hidden');
} else {
  const $spotifyButton = $('#login');
  $spotifyButton.text('Reauthorize');
}
const $logout = $('#logout');
$logout.click( () => {
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
      axios.post(REFRESH_URI, `refresh=${REFRESH}`)
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
    $playerStatus.text('Authorization Failed. Token stale?');
    $playerStatus.attr('class', 'error');
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
    displayTrackInfo(state);
    spotifyPlayer.getVolume()
      .then(currentLevel => {
        $volumeRangeSpotify.value = currentLevel * 100;
      });
  });

  // Ready
  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    $playerStatus.text('Ready, select \'Ambix\' in Spotify');
    $playerStatus.attr('class', 'success');
  });

  // Not Ready
  spotifyPlayer.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  spotifyPlayer.connect();
};

function displayTrackInfo(state){
  const $artwork = $('#artwork');
  const $artist = $('#artist');
  const $title = $('#song-title')

  const artistName = state.track_window.current_track.artists.reduce((accum, artist) => {
    return accum ? `${accum} | ${artist.name}` : `${artist.name}`;
  }, '');
  const songTitle = state.track_window.current_track.name;
  const artworkURL = state.track_window.current_track.album.images[0].url || './img/spotify-icon.png';

  $artwork.attr('src', artworkURL);
  $artwork.attr('alt', songTitle);
  $artwork.addClass('display-artwork');
  $title.text(songTitle);
  $artist.text(artistName);
}

// Controls

const $playSpotify = $('#play');
$playSpotify.click( () => {
  spotifyPlayer.resume().then(() => {
    console.log('Resumed!');
  });
});

const $pauseSpotify = $('#pause');
$pauseSpotify.click( () => {
  spotifyPlayer.pause().then(() => {
    console.log('Paused!');
  });
});

const $nextTrack = $('#next');
$nextTrack.click( () => {
  spotifyPlayer.nextTrack().then(() => {
    console.log('Skipped to next track!');
  });
});

const $previousTrack = $('#previous');
$previousTrack.click( () => {
  spotifyPlayer.previousTrack().then(() => {
    console.log('Set to previous track!');
  });
});

const $volumeDownSpotify = $('#volume-down-spotify');
$volumeDownSpotify.click( () => {
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

const $volumeUpSpotify = $('#volume-up-spotify');
$volumeUpSpotify.click( () => {
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

const $volumeRangeSpotify = $('#volume-range-spotify');
$volumeRangeSpotify.change( () => {
  let newLevel = $volumeRangeSpotify.val() / 100;
  spotifyPlayer.setVolume(newLevel)
    .then(() => {
      console.log(`Volume set to ${newLevel}.`)
    })
})
