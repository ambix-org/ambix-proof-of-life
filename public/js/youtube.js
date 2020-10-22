'use strict';

var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
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

const $playYT = $('#play-yt')
$playYT.click( () => {
  player.playVideo();
});

const $stopYT = $('#stop-yt');
$stopYT.click( () => {
  player.stopVideo();
});

const $volumeRange = $('#volume-range-yt');
$volumeRange.change( () => {
  let newLevel = $volumeRange.val();
  player.setVolume(newLevel);
})

const $volumeUpYT = $('#volume-up-yt');
$volumeUpYT.click( () => {
  let currentLevel = player.getVolume();
  let newLevel = currentLevel + 1;
  if (newLevel <= 100) {
    player.setVolume(newLevel);
    $volumeRange.val(newLevel);
  }
});

const $volumeDownYT = $('#volume-down-yt');
$volumeDownYT.click( () => {
  let currentLevel = player.getVolume();
  let newLevel = currentLevel - 1;
  if (newLevel >= 0) {
    player.setVolume(newLevel);
    $volumeRange.val(newLevel);
  }
});

function onPlayerReady() {
  $volumeRange.val(player.getVolume());
}

function onPlayerStateChange(event) {
  // console.log('State Changed!')
  // console.log(event.data)
}

const ambienceSources = [
  ['Cafe', 'gaGrHUekGrc'],
  ['Campfire', 'QMJYlmX1sNU'],
  ['Fireplace', 'K0pJRo0XU8s'],
  ['Lab', 'eGeJF85SOdQ'],
  ['Rain', 'LlKyGAGHc4c'],
  ['Storm', 'EbMZh-nQFsU'],
  ['Waves', 'ibZUd-6pDeY'],
]

const $ambientTracks = $('#ambience-tracks');
ambienceSources.forEach(source => {
  const $button = $(`<button class="track">${source[0]}</button>`);
  $button.click( () => {
    player.loadVideoById(source[1])
    $('.track').removeClass('selected');
    $button.addClass('selected');
  });
  $ambientTracks.append($button);
});
