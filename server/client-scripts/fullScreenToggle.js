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
        unlockScreen();
        this.textContent = 'Keep Screen Awake (recommended)'
      } else {
        enterFullscreen();
        lockScreen();
        console.log('thi,', this)
        this.textContent = 'Exit Full Screen'
      }
    });
    document.addEventListener('visibilitychange', function() {
      var el = document.getElementById(buttonId)
      if (el && 'textContent' in el) {
        el.textContent = 'Keep Awake (recommended)'
      }
    })

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
    let wakeLock;
    function lockScreen() {
      if ("wakeLock" in navigator) {
        navigator.wakeLock.request("screen").then((lock) => {
          console.log('requestedddddd')
          alert('debug - screen lock successful');
          wakeLock = lock
          wakeLock.addEventListener('release', () => {
            console.log('wakeLock released')
          })
        })
      }
      if ('screen' in window && 'keepAwake' in window.screen) {
        alert('debug - screen lock for older browsers')
        window.screen.keepAwake = true
      }
    }
    function unlockScreen() {
      if ("wakeLock" in navigator && wakeLock) {
        wakeLock.release().then(() => {
          alert('debug - screen unlock successful');
          wakeLock = null;
        })
      }
      if ('screen' in window && 'keepAwake' in window.screen) {
        alert('debug - screen unlock for older browsers')
        window.screen.keepAwake = false
      }
    }
  }
}