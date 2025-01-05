/**
 * Load this script into the DOM and access globally:
 * 
 * <script src="path/to/fullScreenToggle.js"></script>
 * <script>
 *  wakeLockCheckbox.init("buttonId");
 * </script>
 */


window.wakeLockCheckbox = {
  init: function(buttonId) {
     const $wakeLockCheckbox = document.getElementById(buttonId);
    if (!$wakeLockCheckbox) {
      return;
    }

    $wakeLockCheckbox.addEventListener("click", function({ target }) {
      if (target && target.checked && target.checked.isChecked !== undefined) {
        if (target.checked.isChecked) {
          lockScreen();
        }
        else {
          unlockScreen();
        }
      }
      if (document.fullscreenElement) {
        unlockScreen();
        this.textContent = 'Keep Screen Awake (recommended)'
      } else {
        lockScreen($wakeLockCheckbox);
        this.textContent = 'Exit Full Screen'
      }
    });
    document.addEventListener('visibilitychange', function() {
      var el = document.getElementById(buttonId)
      if (el && 'textContent' in el) {
        el.textContent = 'Keep Awake (recommended)'
      }
    });

    let wakeLock;
    function lockScreen($wakeLockCheckbox) {
      if ("wakeLock" in navigator) {
        navigator.wakeLock.request("screen").then((lock) => {
          wakeLock = lock
          wakeLock.addEventListener('release', () => {
            console.log('wakeLock released');
            $wakeLockCheckbox.checked = false;
          })
        })
      }
      if ('screen' in window && 'keepAwake' in window.screen) {
        window.screen.keepAwake = true
      }
    }
    function unlockScreen() {
      if ("wakeLock" in navigator && wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
        })
      }
      if ('screen' in window && 'keepAwake' in window.screen) {
        window.screen.keepAwake = false
      }
    }
  }
}