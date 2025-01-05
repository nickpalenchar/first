/**
 * Load this script into the DOM and access globally:
 * 
 * <script src="path/to/fullScreenToggle.js"></script>
 * <script>
 *  fullScreenButton.init("buttonId");
 * </script>
 */

function toggleFullScreen() {
  const element = document.documentElement;

  if (!document.fullscreenElement && !document.mozFullScreenElement &&
      !document.webkitFullscreenElement && !document.msFullscreenElement) {
    // Enter fullscreen
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  } else {
    // Exit fullscreen
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

window.fullScreenButton = {
  init: function(buttonId) {
    const fullscreenButton = document.getElementById(buttonId);

    fullscreenButton.addEventListener("click", function() {
      if (document.fullscreenElement) {
        exitFullscreen();
        this.textContent = 'Enter Full Screen'
      } else {
        enterFullscreen();
        console.log('thi,', this)
        this.textContent = 'Exit Full Screen'
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