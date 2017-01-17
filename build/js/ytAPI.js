/**
 * Created by I323504 on 24/11/2015.
 */
// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//This function creates the iframe in whcich the youtube video will display
var player;
var time;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        width: '100%%',
        height: '50%',
        videoId: videoId,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}
var done = false;
function onPlayerStateChange(event) {

}
function stopVideo() {
    player.stopVideo();
}