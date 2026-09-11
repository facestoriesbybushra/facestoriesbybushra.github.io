/**
 * Contact page entry point.
 *
 * Requires: glitter-canvas.js, scroll-animations.js, contact-form.js
 */
(function (FSB) {
    'use strict';

    FSB.initScrollAnimations();
    FSB.initGlitterCanvas(document.querySelector('[data-glitter]'));
    FSB.initContactForm(document.querySelector('[data-contact-form]'));
})(window.FSB = window.FSB || {});
