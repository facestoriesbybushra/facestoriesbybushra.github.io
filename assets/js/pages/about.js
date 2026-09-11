/**
 * About page entry point — wires the award slider to the video lightbox.
 *
 * Requires: glitter-canvas.js, scroll-animations.js, award-slider.js,
 *           video-lightbox.js (and their own dependencies)
 */
(function (FSB) {
    'use strict';

    FSB.initScrollAnimations();
    FSB.initGlitterCanvas(document.querySelector('[data-glitter]'));

    var slider = null;

    var lightbox = FSB.initVideoLightbox(document.querySelector('[data-video-modal]'), {
        // Closing the lightbox hands playback back to the silent in-page preview.
        onClose: function () {
            if (slider) slider.resume();
        }
    });

    slider = FSB.initAwardSlider(document.querySelector('[data-awards]'), {
        onSlideClick: function (detail) {
            if (lightbox) lightbox.open(detail);
        }
    });
})(window.FSB = window.FSB || {});
