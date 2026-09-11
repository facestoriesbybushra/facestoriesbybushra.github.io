/**
 * Full-screen hero carousel: auto-advancing slides with prev/next/pause
 * controls and touch swipe support.
 *
 * Requires: swipe.js
 */
(function (FSB) {
    'use strict';

    var AUTOPLAY_INTERVAL = 5000;

    /**
     * @param {HTMLElement} root - the `.hero` element
     */
    FSB.initHeroCarousel = function initHeroCarousel(root) {
        if (!root) return;

        var track = root.querySelector('[data-hero-track]');
        var slides = root.querySelectorAll('[data-hero-slide]');
        var prevBtn = root.querySelector('[data-hero-prev]');
        var nextBtn = root.querySelector('[data-hero-next]');
        var pauseBtn = root.querySelector('[data-hero-pause]');

        if (!track || slides.length === 0) return;

        var slideWidth = 100 / slides.length;
        var index = 0;
        var isPlaying = true;
        var timerId = null;

        function render() {
            track.style.transform = 'translateX(-' + index * slideWidth + '%)';
        }

        function goTo(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            render();
        }

        function stopAutoplay() {
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
            }
        }

        function startAutoplay() {
            stopAutoplay();
            timerId = setInterval(function () {
                goTo(index + 1);
            }, AUTOPLAY_INTERVAL);
        }

        function setPlaying(playing) {
            isPlaying = playing;
            root.classList.toggle('is-paused', !playing);

            if (pauseBtn) {
                pauseBtn.innerHTML = playing
                    ? '<i class="fas fa-pause" aria-hidden="true"></i>'
                    : '<i class="fas fa-play" aria-hidden="true"></i>';
                pauseBtn.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
            }

            if (playing) startAutoplay();
            else stopAutoplay();
        }

        /** Manual navigation pauses autoplay, matching the original behaviour. */
        function navigate(step) {
            if (isPlaying) setPlaying(false);
            goTo(index + step);
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { navigate(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { navigate(1); });
        if (pauseBtn) pauseBtn.addEventListener('click', function () { setPlaying(!isPlaying); });

        FSB.addSwipeListener(root, function (direction) {
            navigate(direction === 'left' ? 1 : -1);
        });

        // Don't burn CPU animating a carousel nobody is looking at.
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stopAutoplay();
            else if (isPlaying) startAutoplay();
        });

        render();
        startAutoplay();
    };
})(window.FSB = window.FSB || {});
