/**
 * Thin wrapper around AOS (Animate On Scroll), which is loaded from a CDN as a
 * global. Keeping it behind one function means the rest of the codebase never
 * touches the global directly, and swapping the library out is a one-file change.
 */
(function (FSB) {
    'use strict';

    /**
     * @param {{ duration?: number, offset?: number }} [options]
     */
    FSB.initScrollAnimations = function initScrollAnimations(options) {
        if (typeof window.AOS === 'undefined') return;

        var settings = options || {};
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.AOS.init({
            duration: settings.duration || 800,
            offset: settings.offset || 100,
            once: true,
            disable: prefersReducedMotion
        });
    };
})(window.FSB = window.FSB || {});
