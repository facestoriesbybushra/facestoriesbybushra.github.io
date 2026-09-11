/**
 * Force a file to download instead of opening in the browser.
 *
 * The `download` attribute alone is not enough for PDFs: Safari (and iOS in
 * particular) ignores it and hands the file to its built-in viewer, so the
 * visitor ends up staring at the brochure instead of saving it.
 *
 * Fetching the file as a Blob and clicking an object URL sidesteps the inline
 * viewer entirely. If anything fails — no fetch support, offline, or opened
 * straight from disk over file:// where fetch is blocked — it falls back to
 * normal link behaviour, which is exactly what happens today.
 */
(function (FSB) {
    'use strict';

    var BUSY_CLASS = 'is-busy';

    function canUseBlobDownload() {
        return Boolean(
            window.fetch &&
            window.URL &&
            window.URL.createObjectURL &&
            'download' in document.createElement('a')
        );
    }

    function saveBlob(blob, filename) {
        var objectUrl = window.URL.createObjectURL(blob);
        var temp = document.createElement('a');

        temp.href = objectUrl;
        temp.download = filename;
        temp.style.display = 'none';

        document.body.appendChild(temp);
        temp.click();
        document.body.removeChild(temp);

        // Give the browser a moment to start the save before releasing the URL.
        window.setTimeout(function () {
            window.URL.revokeObjectURL(objectUrl);
        }, 1000);
    }

    /**
     * @param {string} [selector] - links to upgrade (default `[data-download]`)
     */
    FSB.initForceDownload = function initForceDownload(selector) {
        if (!canUseBlobDownload()) return;

        var links = document.querySelectorAll(selector || '[data-download]');

        Array.prototype.forEach.call(links, function (link) {
            link.addEventListener('click', function (event) {
                var url = link.getAttribute('href');
                if (!url) return;

                event.preventDefault();

                var filename = link.getAttribute('download') || url.split('/').pop();
                link.classList.add(BUSY_CLASS);

                window.fetch(url)
                    .then(function (response) {
                        if (!response.ok) throw new Error('HTTP ' + response.status);
                        return response.blob();
                    })
                    .then(function (blob) {
                        saveBlob(blob, filename);
                    })
                    .catch(function () {
                        // Blocked or offline — let the browser do whatever it would
                        // have done normally rather than leaving a dead button.
                        window.location.href = url;
                    })
                    .then(function () {
                        link.classList.remove(BUSY_CLASS);
                    });
            });
        });
    };
})(window.FSB = window.FSB || {});
