/**
 * Award showcase: one frame, three silent award clips, newest first.
 *
 * Only the visible clip plays, so nothing decodes video off-screen. Tapping the
 * frame hands off to the video lightbox, where the clip plays with sound.
 *
 * Requires: swipe.js
 */
(function (FSB) {
    'use strict';

    /**
     * @param {HTMLElement} root - the `.awards` element
     * @param {{ onSlideClick?: (detail: { src: string, year: string }) => void }} [options]
     */
    FSB.initAwardSlider = function initAwardSlider(root, options) {
        if (!root) return null;

        var settings = options || {};
        var track = root.querySelector('[data-awards-track]');
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-awards-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-awards-dot]'));
        var prevBtn = root.querySelector('[data-awards-prev]');
        var nextBtn = root.querySelector('[data-awards-next]');

        if (!track || slides.length === 0) return null;

        var slideWidth = 100 / slides.length;
        var index = 0;

        function videoAt(i) {
            return slides[i].querySelector('video');
        }

        /** Autoplay can be refused (battery saver, strict mobile policies). */
        function safePlay(video) {
            if (!video) return;
            var attempt = video.play();
            if (attempt && attempt.catch) attempt.catch(function () {});
        }

        function goTo(nextIndex) {
            var current = videoAt(index);
            if (current) current.pause();

            index = (nextIndex + slides.length) % slides.length;
            track.style.transform = 'translateX(-' + index * slideWidth + '%)';

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });

            var video = videoAt(index);
            if (video) {
                video.currentTime = 0;
                safePlay(video);
            }
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () { goTo(i); });
        });

        slides.forEach(function (slide) {
            slide.addEventListener('click', function () {
                var current = videoAt(index);
                if (current) current.pause();

                if (settings.onSlideClick) {
                    settings.onSlideClick({
                        src: slide.dataset.video,
                        year: slide.dataset.year
                    });
                }
            });
        });

        FSB.addSwipeListener(root, function (direction) {
            goTo(direction === 'left' ? index + 1 : index - 1);
        });

        // Start the first clip once there's something to show.
        var firstVideo = videoAt(0);
        if (firstVideo) {
            firstVideo.addEventListener('loadeddata', function () {
                safePlay(firstVideo);
            }, { once: true });
            safePlay(firstVideo);
        }

        return {
            resume: function () {
                safePlay(videoAt(index));
            }
        };
    };
})(window.FSB = window.FSB || {});
