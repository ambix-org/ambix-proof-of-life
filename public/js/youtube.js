'use strict';

//========================
// DON'T convert to JQuery
var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
//========================

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

const $playYT = $('#play-yt')
$playYT.click( () => {
  console.log('Starting Video');
  player.playVideo();
});

const $stopYT = $('#stop-yt');
$stopYT.click( () => {
  console.log('Stopping Video');
  player.stopVideo();
});

const $volumeRange = $('#volume-range-yt');
$volumeRange.change( () => {
  let newLevel = $volumeRange.value;
  player.setVolume(newLevel);
  console.log(`Volume set to ${newLevel}`);
})

const $volumeUpYT = $('#volume-up-yt');
$volumeUpYT.click( () => {
  let currentLevel = player.getVolume();
  let newLevel = currentLevel + 1;
  if (newLevel <= 100) {
    player.setVolume(newLevel);
    $volumeRange.val(newLevel);
    console.log(`Volume set to ${currentLevel}`);
  } else {
    console.log('Volume maxxed out.');
  }
});

const $volumeDownYT = $('#volume-down-yt');
$volumeDownYT.click( () => {
  let currentLevel = player.getVolume();
  let newLevel = currentLevel - 1;
  if (newLevel >= 0) {
    player.setVolume(newLevel);
    $volumeRange.val(newLevel);
    console.log(`Volume set to ${currentLevel}`);
  } else {
    console.log('Volume minned out.');
  }
});
// ===================================
function onPlayerReady() {
  console.log('Video Ready!')
  console.log(`Default volume: ${player.getVolume()}`)
  $volumeRange.val(player.getVolume());
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

const $ambientTracks = $('#ambience-tracks');
ambienceSources.forEach(source => {
  const $button = $(`<button class="track">${source[0]}</button>`);
  $button.click( () => {
    player.loadVideoById(source[1])
    $('track').each(() => $(this).attr('class', 'track'));
    $button.addClass('selected');
  });
  $ambientTracks.append($button);
});
