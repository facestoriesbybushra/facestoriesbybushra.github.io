/**
 * Auto-scrolling, endlessly looping photo wall.
 *
 * Progressive enhancement: the markup ships as a plain responsive grid that
 * works with no JavaScript at all. This module reads those items and rebuilds
 * them into looping columns, so search engines and no-JS visitors still get a
 * complete, linkable gallery.
 */
(function (FSB) {
    'use strict';

    var BREAKPOINTS = [
        { minWidth: 1100, columns: 4 },
        { minWidth: 760, columns: 3 },
        { minWidth: 480, columns: 2 },
        { minWidth: 0, columns: 1 }
    ];

    var SECONDS_PER_PHOTO = 7;
    var MIN_DURATION = 20;
    var RESIZE_DEBOUNCE = 200;

    function getColumnCount() {
        var width = window.innerWidth;

        for (var i = 0; i < BREAKPOINTS.length; i += 1) {
            if (width >= BREAKPOINTS[i].minWidth) return BREAKPOINTS[i].columns;
        }

        return 1;
    }

    /**
     * @param {HTMLElement} root - the `.photo-wall` element
     * @param {{ onPhotoClick?: (index: number) => void }} [options]
     */
    FSB.initPhotoWall = function initPhotoWall(root, options) {
        if (!root) return null;

        var settings = options || {};
        var source = root.querySelector('[data-photo-source]');
        if (!source) return null;

        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /**
         * Read the photos once, straight out of the server-rendered markup. Each
         * item is a real link to the original file, so the no-JS fallback is a
         * working, crawlable gallery rather than an empty container.
         */
        var photos = Array.prototype.slice
            .call(source.querySelectorAll('[data-photo]'))
            .map(function (item, index) {
                var link = item.querySelector('a');
                var img = item.querySelector('img');
                return {
                    index: index,
                    thumb: img.getAttribute('src'),
                    full: link.getAttribute('href'),
                    alt: img.getAttribute('alt')
                };
            });

        if (photos.length === 0) return null;

        var page = root.closest('[data-portfolio-page]') || root;
        var columnsEl = null;
        var renderedColumnCount = null;

        function buildPhotoItem(photo, isDuplicate) {
            var item = document.createElement('button');
            item.type = 'button';
            item.className = 'photo-wall__item';
            item.setAttribute('aria-label', 'View full-size: ' + photo.alt);

            var img = document.createElement('img');
            img.src = photo.thumb;
            img.alt = photo.alt;
            /*
             * The wall is always moving, so every photo becomes visible within
             * one loop. Lazy-loading the first pass risks blank tiles scrolling
             * into view; the duplicate pass reuses the same URLs and comes
             * straight from cache, so it can stay lazy.
             */
            img.loading = isDuplicate ? 'lazy' : 'eager';
            img.decoding = 'async';

            item.appendChild(img);
            item.addEventListener('click', function () {
                if (settings.onPhotoClick) settings.onPhotoClick(photo.index);
            });

            return item;
        }

        function build() {
            var columnCount = getColumnCount();
            if (columnCount === renderedColumnCount) return;
            renderedColumnCount = columnCount;

            if (columnsEl) columnsEl.remove();
            columnsEl = document.createElement('div');
            columnsEl.className = 'photo-wall__columns';

            var buckets = [];
            for (var c = 0; c < columnCount; c += 1) buckets.push([]);
            photos.forEach(function (photo, i) {
                buckets[i % columnCount].push(photo);
            });

            buckets.forEach(function (bucket, columnIndex) {
                var column = document.createElement('div');
                column.className = 'photo-wall__column';

                var track = document.createElement('div');
                track.className = 'photo-wall__track';
                // Alternate columns drift the opposite direction.
                if (columnIndex % 2 === 1) track.classList.add('photo-wall__track--reverse');

                // The set is duplicated so the animation's wrap-around is seamless:
                // translating by -50% lands on a visually identical frame.
                var passes = prefersReducedMotion ? 1 : 2;
                for (var pass = 0; pass < passes; pass += 1) {
                    var isDuplicate = pass > 0;
                    bucket.forEach(function (photo) {
                        track.appendChild(buildPhotoItem(photo, isDuplicate));
                    });
                }

                if (!prefersReducedMotion) {
                    var duration = Math.max(bucket.length * SECONDS_PER_PHOTO, MIN_DURATION);
                    track.style.animationDuration = duration + 's';
                }

                column.appendChild(track);
                columnsEl.appendChild(column);
            });

            root.appendChild(columnsEl);
        }

        // Swap the static grid out for the animated wall.
        source.hidden = true;
        page.classList.add('is-animated');
        build();

        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(build, RESIZE_DEBOUNCE);
        });

        return {
            photos: photos,
            setPaused: function (paused) {
                root.classList.toggle('is-paused', paused);
            }
        };
    };
})(window.FSB = window.FSB || {});
