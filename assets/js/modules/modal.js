/**
 * Accessible modal controller.
 *
 * Handles the behaviour every dialog on this site needs: escape to close,
 * click-the-backdrop to close, body scroll lock, and returning focus to
 * whatever opened it.
 */
(function (FSB) {
    'use strict';

    /**
     * @param {HTMLElement} root - element carrying the `.modal` class
     * @param {{ onOpen?: () => void, onClose?: () => void }} [hooks]
     */
    FSB.createModal = function createModal(root, hooks) {
        var options = hooks || {};
        var closeBtn = root.querySelector('[data-modal-close]');
        var lastFocused = null;

        function isOpen() {
            return root.classList.contains('is-open');
        }

        function open() {
            if (isOpen()) return;

            lastFocused = document.activeElement;
            root.classList.add('is-open');
            root.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            if (closeBtn) closeBtn.focus();
            if (options.onOpen) options.onOpen();
        }

        function close() {
            if (!isOpen()) return;

            root.classList.remove('is-open');
            root.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            if (options.onClose) options.onClose();

            // Send focus back where the visitor left it.
            if (lastFocused && lastFocused.focus) lastFocused.focus();
            lastFocused = null;
        }

        if (closeBtn) closeBtn.addEventListener('click', close);

        // Clicking the backdrop (but not the dialog itself) dismisses it.
        root.addEventListener('click', function (event) {
            if (event.target === root) close();
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isOpen()) close();
        });

        return { open: open, close: close, isOpen: isOpen };
    };
})(window.FSB = window.FSB || {});
