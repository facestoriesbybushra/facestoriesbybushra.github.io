/**
 * Horizontally scrolling testimonial cards, with a modal for the full text.
 *
 * The full quote lives in the markup (CSS clamps it to five lines), so the
 * modal simply re-reads it — no duplicated copy, and search engines see the
 * complete review text.
 *
 * Card width is measured from the DOM rather than hard-coded, so changing the
 * card size in CSS can't silently break the scroll maths.
 *
 * Requires: swipe.js, modal.js
 */
(function (FSB) {
    'use strict';

    /**
     * @param {HTMLElement} root - the `.testimonials` section
     */
    FSB.initTestimonialCarousel = function initTestimonialCarousel(root) {
        if (!root) return;

        var viewport = root.querySelector('[data-testimonial-viewport]');
        var track = root.querySelector('[data-testimonial-track]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-testimonial-card]'));
        var prevBtn = root.querySelector('[data-testimonial-prev]');
        var nextBtn = root.querySelector('[data-testimonial-next]');

        if (!viewport || !track || cards.length === 0) return;

        var modalRoot = document.querySelector('[data-testimonial-modal]');
        var modal = modalRoot ? FSB.createModal(modalRoot) : null;
        var modalImage = modalRoot ? modalRoot.querySelector('[data-modal-image]') : null;
        var modalQuote = modalRoot ? modalRoot.querySelector('[data-modal-quote]') : null;
        var modalName = modalRoot ? modalRoot.querySelector('[data-modal-name]') : null;

        var index = 0;

        /** Measured live so CSS stays the single source of truth for sizing. */
        function getStep() {
            var cardWidth = cards[0].getBoundingClientRect().width;
            var styles = window.getComputedStyle(track);
            var gap = parseFloat(styles.columnGap || styles.gap) || 0;
            return cardWidth + gap;
        }

        function getMaxIndex() {
            var visible = Math.max(1, Math.floor(viewport.clientWidth / getStep()));
            return Math.max(0, cards.length - visible);
        }

        function render() {
            index = Math.min(index, getMaxIndex());
            track.style.transform = 'translateX(-' + index * getStep() + 'px)';

            if (prevBtn) prevBtn.disabled = index === 0;
            if (nextBtn) nextBtn.disabled = index >= getMaxIndex();
        }

        function navigate(step) {
            index = Math.min(Math.max(index + step, 0), getMaxIndex());
            render();
        }

        function openTestimonial(card) {
            if (!modal) return;

            var photo = card.querySelector('img');
            var quote = card.querySelector('[data-testimonial-quote]');
            var name = card.querySelector('[data-testimonial-name]');

            if (modalImage && photo) {
                modalImage.src = photo.currentSrc || photo.src;
                modalImage.alt = photo.alt;
            }
            if (modalQuote && quote) modalQuote.textContent = quote.textContent.trim();
            if (modalName && name) modalName.textContent = name.textContent.trim();

            modal.open();
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { navigate(-1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { navigate(1); });

        cards.forEach(function (card) {
            card.addEventListener('click', function () { openTestimonial(card); });
        });

        FSB.addSwipeListener(viewport, function (direction) {
            navigate(direction === 'left' ? 1 : -1);
        });

        window.addEventListener('resize', render);
        render();
    };
})(window.FSB = window.FSB || {});
