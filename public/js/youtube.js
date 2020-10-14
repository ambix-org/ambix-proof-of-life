'use strict';

let tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api'

let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;

function onYouTubeIframeAPIReady() {
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

const rainButton = document.getElementById('rain');
rainButton.addEventListener('click', () => {
  player.loadVideoById('LlKyGAGHc4c');
});

const fireplaceButton = document.getElementById('fireplace');
fireplaceButton.addEventListener('click', () => {
  player.loadVideoById('K0pJRo0XU8s');
});

const cafeButton = document.getElementById('cafe');
cafeButton.addEventListener('click', () => {
  player.loadVideoById('gaGrHUekGrc')
})

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
