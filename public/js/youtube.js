'use strict';

let tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api'

let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;

function onYouTubeIframeAPIReady() {  // eslint-disable-line
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'LlKyGAGHc4c',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

const playYTButton = document.getElementById('play-yt')
playYTButton.addEventListener('click', () => {
  console.log('Starting Video');
  player.playVideo();
});

const stopYTButton = document.getElementById('stop-yt');
stopYTButton.addEventListener('click', () => {
  console.log('Stopping Video');
  player.stopVideo();
});



const volumeRange = document.getElementById('volume-range-yt');
volumeRange.addEventListener('change', () => {
  let newLevel = volumeRange.value;
  player.setVolume(newLevel);
  console.log(`Volume set to ${newLevel}`);
})

const volumeUpButton = document.getElementById('volume-up-yt');
volumeUpButton.addEventListener('click', () => {
  let currentLevel = player.getVolume();
  let newLevel = currentLevel + 1;
  if (newLevel <= 100) {
    player.setVolume(newLevel);
    volumeRange.value = newLevel;
    console.log(`Volume set to ${currentLevel}`);
  } else {
    console.log('Volume maxxed out.');
  }
});

const volumeDownButton = document.getElementById('volume-down-yt');
volumeDownButton.addEventListener('click', () => {
  let currentLevel = player.getVolume();
  let newLevel = currentLevel - 1;
  if (newLevel >= 0) {
    player.setVolume(newLevel);
    volumeRange.value = newLevel;
    console.log(`Volume set to ${currentLevel}`);
  } else {
    console.log('Volume minned out.');
  }
});

function onPlayerReady() {
  console.log('Video Ready!')
  console.log(`Default volume: ${player.getVolume()}`)
  volumeRange.value = player.getVolume();
}

function onPlayerStateChange(event) {
  console.log('State Changed!')
  console.log(event.data)
}

// Ambient Sources
const ambienceSources = [
  ['Rain', 'LlKyGAGHc4c'],
  ['Fireplace', 'K0pJRo0XU8s'],
  ['Cafe', 'gaGrHUekGrc']
]

const ambientTracks = document.getElementById('ambience-tracks');
ambienceSources.forEach(source => {
  // const button = document.getElementById(source[0]);
  const button = document.createElement('button');
  button.textContent = source[0]
  button.setAttribute('class', 'track');
  button.addEventListener('click', () => {
    player.loadVideoById(source[1])
    const buttons = document.getElementsByClassName('track');
    for (let i = 0; i < buttons.length; i++){
      buttons[i].setAttribute('class', 'track');
    }
    button.setAttribute('class', 'selected track');

  });
  ambientTracks.appendChild(button);
});
