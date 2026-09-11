/**
 * Contact page entry point.
 *
 * Requires: glitter-canvas.js, scroll-animations.js
 */
(function (FSB) {
    'use strict';

    FSB.initScrollAnimations();
    FSB.initGlitterCanvas(document.querySelector('[data-glitter]'));
})(window.FSB = window.FSB || {});
