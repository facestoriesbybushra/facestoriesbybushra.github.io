/**
 * Portfolio page entry point — photo wall plus full-resolution lightbox.
 *
 * Requires: swipe.js, modal.js, photo-wall.js, image-lightbox.js
 */
(function (FSB) {
    'use strict';

    var wallEl = document.querySelector('[data-photo-wall]');
    var toggleBtn = document.querySelector('[data-wall-toggle]');
    var lightbox = null;

    var wall = FSB.initPhotoWall(wallEl, {
        onPhotoClick: function (index) {
            if (lightbox) lightbox.open(index);
        }
    });

    if (!wall) return;

    lightbox = FSB.initImageLightbox(document.querySelector('[data-lightbox]'), wall.photos);

    // Explicit pause control, for visitors who can't hover.
    var isPaused = false;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            isPaused = !isPaused;
            wall.setPaused(isPaused);

            toggleBtn.innerHTML = isPaused
                ? '<i class="fas fa-play" aria-hidden="true"></i>'
                : '<i class="fas fa-pause" aria-hidden="true"></i>';
            toggleBtn.setAttribute(
                'aria-label',
                isPaused ? 'Resume gallery motion' : 'Pause gallery motion'
            );
        });
    }
})(window.FSB = window.FSB || {});
