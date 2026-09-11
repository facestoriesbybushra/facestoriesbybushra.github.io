/**
 * Minimal horizontal swipe detection.
 *
 * Used by every carousel on the site, so the threshold and the maths live in
 * exactly one place.
 */
(function (FSB) {
    'use strict';

    var DEFAULT_THRESHOLD = 45;

    /**
     * @param {HTMLElement} element - element to watch
     * @param {(direction: 'left' | 'right') => void} onSwipe
     * @param {number} [threshold] - minimum horizontal travel, in pixels
     * @returns {() => void} teardown function
     */
    FSB.addSwipeListener = function addSwipeListener(element, onSwipe, threshold) {
        if (!element) return function () {};

        var limit = threshold || DEFAULT_THRESHOLD;
        var startX = 0;

        function handleTouchStart(event) {
            startX = event.touches[0].clientX;
        }

        function handleTouchEnd(event) {
            var distance = startX - event.changedTouches[0].clientX;
            if (Math.abs(distance) < limit) return;
            onSwipe(distance > 0 ? 'left' : 'right');
        }

        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return function teardown() {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    };
})(window.FSB = window.FSB || {});
