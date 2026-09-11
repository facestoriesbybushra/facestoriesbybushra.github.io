/**
 * Home page entry point.
 *
 * Requires: glitter-canvas.js, scroll-animations.js, hero-carousel.js,
 *           testimonial-carousel.js (and their own dependencies)
 */
(function (FSB) {
    'use strict';

    FSB.initScrollAnimations({ duration: 1000, offset: 120 });
    FSB.initGlitterCanvas(document.querySelector('[data-glitter]'));
    FSB.initHeroCarousel(document.querySelector('[data-hero]'));
    FSB.initTestimonialCarousel(document.querySelector('[data-testimonials]'));
})(window.FSB = window.FSB || {});
