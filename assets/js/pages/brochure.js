/**
 * Brochure page entry point.
 *
 * Requires: glitter-canvas.js, force-download.js
 */
(function (FSB) {
    'use strict';

    FSB.initGlitterCanvas(document.querySelector('[data-glitter]'));
    FSB.initForceDownload('[data-download]');
})(window.FSB = window.FSB || {});
