/**
 * Load this script into the DOM and access globally:
 * 
 * <script src="path/to/fullScreenToggle.js"></script>
 * <script>
 *  fullScreenButton.init("buttonId");
 * </script>
 */

window.fullScreenButton = {
  init: function(buttonId) {
    const fullscreenButton = document.getElementById(buttonId);

    fullscreenButton.addEventListener("click", function() {
      if (document.fullscreenElement) {
        exitFullscreen();
      } else {
        enterFullscreen();
      }
    });

    function enterFullscreen() {
      const element = document.documentElement;

      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }

    function exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

  }
}