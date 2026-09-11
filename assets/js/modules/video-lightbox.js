/**
 * Video lightbox — plays an award clip full-size, with sound and native controls.
 *
 * Requires: modal.js
 */
(function (FSB) {
    'use strict';

    /**
     * @param {HTMLElement} root - the `.video-modal` element
     * @param {{ onClose?: () => void }} [hooks]
     */
    FSB.initVideoLightbox = function initVideoLightbox(root, hooks) {
        if (!root) return null;

        var options = hooks || {};
        var player = root.querySelector('[data-video-player]');
        var caption = root.querySelector('[data-video-caption]');

        var modal = FSB.createModal(root, {
            onClose: function () {
                // Fully unload the clip so it stops buffering in the background.
                player.pause();
                player.removeAttribute('src');
                player.load();
                if (options.onClose) options.onClose();
            }
        });

        /**
         * @param {{ src: string, year: string }} detail
         */
        function open(detail) {
            player.src = detail.src;
            if (caption) {
                caption.textContent = "WedMeGood Users' Choice Award — " + detail.year;
            }

            modal.open();

            var attempt = player.play();
            if (attempt && attempt.catch) attempt.catch(function () {});
        }

        return { open: open, close: modal.close, isOpen: modal.isOpen };
    };
})(window.FSB = window.FSB || {});
