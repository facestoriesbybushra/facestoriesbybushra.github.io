/**
 * Decorative falling-glitter background.
 *
 * Renders gold particles drifting down a full-viewport canvas. Purely
 * ornamental, so it bows out entirely when the visitor prefers reduced motion.
 */
(function (FSB) {
    'use strict';

    var PARTICLE_DENSITY = 0.15; // particles per pixel of viewport width
    var GOLD = '255, 215, 0';

    /**
     * @param {HTMLCanvasElement} canvas
     * @returns {() => void} teardown function
     */
    FSB.initGlitterCanvas = function initGlitterCanvas(canvas) {
        if (!canvas) return function () {};

        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            canvas.hidden = true;
            return function () {};
        }

        var ctx = canvas.getContext('2d');
        var particles = [];
        var frameId = null;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            var count = Math.floor(window.innerWidth * PARTICLE_DENSITY);
            particles = [];

            for (var i = 0; i < count; i += 1) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.8 + 0.4,
                    speed: Math.random() * 0.3 + 0.1,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < particles.length; i += 1) {
                var particle = particles[i];
                particle.y += particle.speed;

                if (particle.y > canvas.height) {
                    particle.y = 0;
                    particle.x = Math.random() * canvas.width;
                }

                ctx.beginPath();
                ctx.fillStyle = 'rgba(' + GOLD + ', ' + particle.opacity + ')';
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }

            frameId = requestAnimationFrame(draw);
        }

        function handleResize() {
            resize();
            createParticles();
        }

        resize();
        createParticles();
        draw();
        window.addEventListener('resize', handleResize);

        return function teardown() {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
        };
    };
})(window.FSB = window.FSB || {});
