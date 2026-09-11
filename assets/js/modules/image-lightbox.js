/**
 * Full-resolution image lightbox.
 *
 * The gallery itself shows compressed thumbnails; the original file is only
 * fetched when a visitor actually opens a photo, with a spinner while it loads.
 *
 * Requires: swipe.js, modal.js
 */
(function (FSB) {
    'use strict';

    /**
     * @param {HTMLElement} root - the `.lightbox` modal element
     * @param {Array<{ full: string, alt: string }>} photos
     */
    FSB.initImageLightbox = function initImageLightbox(root, photos) {
        if (!root || !photos || photos.length === 0) return null;

        var image = root.querySelector('[data-lightbox-image]');
        var spinner = root.querySelector('[data-lightbox-spinner]');
        var prevBtn = root.querySelector('[data-lightbox-prev]');
        var nextBtn = root.querySelector('[data-lightbox-next]');

        var index = 0;
        /** Guards against a slow earlier image resolving after a newer one. */
        var requestToken = 0;

        var modal = FSB.createModal(root, {
            onClose: function () {
                image.removeAttribute('src');
                image.classList.remove('is-visible');
            }
        });

        function load(photo) {
            requestToken += 1;
            var token = requestToken;

            image.classList.remove('is-visible');
            spinner.hidden = false;

            var preloader = new Image();

            preloader.onload = function () {
                if (token !== requestToken) return; // a newer request won
                image.src = photo.full;
                image.alt = photo.alt;
                spinner.hidden = true;
                image.classList.add('is-visible');
            };

            preloader.onerror = function () {
                if (token !== requestToken) return;
                spinner.hidden = true;
            };

            preloader.src = photo.full;
        }

        function show(nextIndex) {
            index = (nextIndex + photos.length) % photos.length;
            load(photos[index]);
        }

        function open(startIndex) {
            show(startIndex);
            modal.open();
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { show(index - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { show(index + 1); });

        FSB.addSwipeListener(root, function (direction) {
            show(direction === 'left' ? index + 1 : index - 1);
        });

        document.addEventListener('keydown', function (event) {
            if (!modal.isOpen()) return;
            if (event.key === 'ArrowLeft') show(index - 1);
            if (event.key === 'ArrowRight') show(index + 1);
        });

        return { open: open, close: modal.close, isOpen: modal.isOpen };
    };
})(window.FSB = window.FSB || {});
