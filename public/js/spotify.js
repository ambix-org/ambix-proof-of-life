'use strict';

const REFRESH = localStorage.getItem('refresh');
const REFRESH_URI = 'http://localhost:3000/spotify-refresh';

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

let spotifyPlayer;

window.onSpotifyWebPlaybackSDKReady = () => {
  spotifyPlayer = new Spotify.Player({
    name: 'Ambix',
    getOAuthToken: cb => {
      console.log('Authorizing Spotify Player')
      if (REFRESH === null) throw 'Please sign in to Spotify';
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

  spotifyPlayer.addListener('player_state_changed', state => {
    displayTrackInfo(state);
    renderControls(state);
    spotifyPlayer.getVolume()
      .then(currentLevel => {
        $volumeRangeSpotify.value = currentLevel * 100;
      });
  });

  spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    $playerStatus.text('Ready, select \'Ambix\' in Spotify');
    $playerStatus.attr('class', 'success');
    spotifyPlayer.setVolume(.3)
      .then(() => {
        $volumeRangeSpotify.value = 30;
      });
  });

  spotifyPlayer.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  spotifyPlayer.connect();
};

function displayTrackInfo(state){
  const $artwork = $('#artwork');
  const $artist = $('#artist');
  const $title = $('#song-title');
  let artistName, songTitle, artworkURL;
  if (state){
    artistName = state.track_window.current_track.artists.reduce((accum, artist) => {
      return accum ? `${accum} | ${artist.name}` : `${artist.name}`;
    }, '');
    songTitle = state.track_window.current_track.name;
    artworkURL = state.track_window.current_track.album.images[0].url || './img/spotify-icon.png';
    $artwork.addClass('display-artwork');
  } else {
    songTitle = 'Select \'Ambix\' in Spotify';
    artistName = '';
    artworkURL= 'img/spotify-icon.png';
    $artwork.removeClass('display-artwork');
  }

  $artwork.attr('src', artworkURL);
  $artwork.attr('alt', songTitle);
  $title.text(songTitle);
  $artist.text(artistName);
}

function renderControls(state) {
  const $prevButton = $('#previous');
  const $nextButton = $('#next');
  const $playbackButton = $('#playback');

  if (state) {
    const paused = state.paused;
    const nextTracks = state.track_window.next_tracks.length;
    const previousTracks = state.track_window.previous_tracks.length;

    const playbackClass = paused ? 'fas fa-play' : 'fas fa-pause';
    const nextClass = nextTracks ? 'fas fa-forward' : 'fas fa-forward dim';
    const prevClass = previousTracks ? 'fas fa-backward' : 'fas fa-backward dim';

    $playbackButton.attr('class', playbackClass);
    $nextButton.attr('class', nextClass);
    $prevButton.attr('class', prevClass);
  } else {
    $playbackButton.attr('class', 'fa fa-play dim');
    $nextButton.attr('class', 'fa fa-forward dim');
    $prevButton.attr('class', 'fa fa-backward dim');
  }
}

// Controls

const $toggleSptofiyPlayback = $('#playback');
$toggleSptofiyPlayback.click( () => {
  if ($toggleSptofiyPlayback.hasClass('fa-play')){
    spotifyPlayer.resume();
  } else {
    spotifyPlayer.pause();
  }
});

const $nextTrack = $('#next');
$nextTrack.click( () => {
  spotifyPlayer.nextTrack();
});

const $previousTrack = $('#previous');
$previousTrack.click( () => {
  spotifyPlayer.previousTrack();
});

const $volumeDownSpotify = $('#volume-down-spotify');
$volumeDownSpotify.click( () => {
  const currentLevel = parseInt($volumeRangeSpotify.val());
  if (currentLevel > 0) {
    const newLevel = currentLevel - 1;
    $volumeRangeSpotify.val(newLevel);
    spotifyPlayer.setVolume(newLevel / 100);
  }
});

const $volumeUpSpotify = $('#volume-up-spotify');
$volumeUpSpotify.click( () => {
  const currentLevel = parseInt($volumeRangeSpotify.val());
  if (currentLevel < 100) {
    const newLevel = currentLevel + 1;
    $volumeRangeSpotify.val(newLevel);
    spotifyPlayer.setVolume(newLevel / 100);
  }
});

const $volumeRangeSpotify = $('#volume-range-spotify');
$volumeRangeSpotify.change( () => {
  let newLevel = $volumeRangeSpotify.val() / 100;
  spotifyPlayer.setVolume(newLevel);
})
