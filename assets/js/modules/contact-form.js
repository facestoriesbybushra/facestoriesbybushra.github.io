/**
 * Contact form hardening.
 *
 * - Blank or whitespace-only answers are rejected field by field, with the
 *   reason shown under the field. (Native `required` happily accepts "   ".)
 * - The submit button locks while a message is sending, so double-clicks and
 *   repeated Enter presses can't send it twice.
 * - Once an enquiry has actually been delivered, a fingerprint of it is kept
 *   in this browser for 24 hours. Sending the identical enquiry again inside
 *   that window is blocked with an explanation.
 *
 * Submissions go to Netlify over fetch, so a failed send is never recorded as
 * delivered and the visitor can simply retry. Without fetch (or when the page
 * is opened from disk) it falls back to a normal POST after validation.
 *
 * All of this runs in the browser: it stops honest mistakes, not someone
 * posting to Netlify directly. The honeypot field and Netlify's own spam
 * filtering handle bots.
 */
(function (FSB) {
    'use strict';

    var MIN_NAME_LENGTH = 2;
    var MIN_MESSAGE_LENGTH = 5;
    var MIN_PHONE_DIGITS = 10;
    var MAX_PHONE_DIGITS = 13;
    var DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
    var MAX_REMEMBERED = 20;
    var STORAGE_KEY = 'fsb.sentEnquiries';
    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var PHONE_ALLOWED = /^[0-9+()\s-]+$/;

    var MESSAGES = {
        sending: 'Sending…',
        fixErrors: 'Please fix the highlighted fields.',
        failed: 'Sorry, your message couldn’t be sent. Please check your connection and try again, or message us on WhatsApp.',
        duplicate: 'You’ve already sent us this exact enquiry. We’ll reply within 24–48 hours — for anything urgent, message us on WhatsApp.'
    };

    var VALIDATORS = {
        name: function (value) {
            if (!value) return 'Please enter your name.';
            if (value.length < MIN_NAME_LENGTH) return 'Please enter your full name.';
            return '';
        },
        email: function (value) {
            if (!value) return 'Please enter your email address.';
            if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address, like name@example.com.';
            return '';
        },
        phone: function (value) {
            if (!value) return 'Please enter your phone number.';
            var digits = value.replace(/\D/g, '');
            if (!PHONE_ALLOWED.test(value) || digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
                return 'Please enter a valid phone number — 10 digits, with +91 if you like.';
            }
            return '';
        },
        service: function (value) {
            return value ? '' : 'Please choose the service you need.';
        },
        message: function (value) {
            if (!value) return 'Please write a short message.';
            if (value.length < MIN_MESSAGE_LENGTH) return 'Please add a little more detail to your message.';
            return '';
        }
    };

    /** Lowercase and collapse whitespace, so trivial differences don't count. */
    function normalise(value) {
        return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
    }

    /** FNV-1a. Only used to recognise a repeat, so it needn't be cryptographic. */
    function hash(text) {
        var h = 0x811c9dc5;
        for (var i = 0; i < text.length; i += 1) {
            h ^= text.charCodeAt(i);
            h = Math.imul(h, 0x01000193) >>> 0;
        }
        return h.toString(16);
    }

    /** Same enquiry = same content, ignoring case, spacing and phone formatting. */
    function fingerprint(values) {
        return hash([
            normalise(values.name),
            normalise(values.email),
            values.phone.replace(/\D/g, '').slice(-10),
            normalise(values.service),
            normalise(values.message)
        ].join('|'));
    }

    // Storage can be unavailable (private browsing, blocked site data). Duplicate
    // detection then quietly switches off rather than breaking the form.
    function readSent() {
        try {
            var list = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
            var cutoff = Date.now() - DUPLICATE_WINDOW_MS;
            return Array.isArray(list)
                ? list.filter(function (entry) { return entry && entry.t > cutoff; })
                : [];
        } catch (error) {
            return [];
        }
    }

    function rememberSent(id) {
        try {
            var list = readSent();
            list.push({ id: id, t: Date.now() });
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_REMEMBERED)));
        } catch (error) {
            // Storage unavailable — nothing to remember with.
        }
    }

    function wasRecentlySent(id) {
        return readSent().some(function (entry) { return entry.id === id; });
    }

    function canSubmitWithFetch() {
        return Boolean(window.fetch && window.FormData && window.URLSearchParams) &&
            /^https?:$/.test(window.location.protocol);
    }

    /**
     * @param {HTMLFormElement} form
     */
    FSB.initContactForm = function initContactForm(form) {
        if (!form) return;

        var submitBtn = form.querySelector('[data-submit]');
        var status = form.querySelector('[data-form-status]');
        var submitLabel = submitBtn ? submitBtn.textContent : '';
        var fields = Object.keys(VALIDATORS)
            .map(function (name) { return form.elements[name]; })
            .filter(Boolean);
        var isSending = false;

        // Our messages replace the browser's bubbles; the HTML attributes stay
        // in place as the no-JavaScript fallback.
        form.noValidate = true;

        function setFieldError(field, message) {
            var errorEl = document.getElementById(field.id + '-error');
            field.setAttribute('aria-invalid', message ? 'true' : 'false');
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.hidden = !message;
            }
        }

        function checkField(field) {
            var message = VALIDATORS[field.name](field.value.trim());
            setFieldError(field, message);
            return !message;
        }

        function showStatus(message, tone) {
            if (!status) return;
            status.textContent = message || '';
            status.hidden = !message;
            status.className = 'form-status' + (tone ? ' form-status--' + tone : '');
        }

        function setSending(sending) {
            isSending = sending;
            form.setAttribute('aria-busy', sending ? 'true' : 'false');
            if (!submitBtn) return;
            submitBtn.disabled = sending;
            submitBtn.classList.toggle('is-busy', sending);
            submitBtn.textContent = sending ? MESSAGES.sending : submitLabel;
        }

        function readValues() {
            var values = {};
            fields.forEach(function (field) { values[field.name] = field.value.trim(); });
            return values;
        }

        // Clear an error the moment it's fixed; check a filled-in field on blur.
        // Empty fields aren't flagged on blur, so tabbing through doesn't nag.
        fields.forEach(function (field) {
            var liveEvent = field.tagName === 'SELECT' ? 'change' : 'input';

            field.addEventListener(liveEvent, function () {
                if (field.getAttribute('aria-invalid') === 'true') checkField(field);
            });

            field.addEventListener('blur', function () {
                if (field.value.trim() || field.getAttribute('aria-invalid') === 'true') checkField(field);
            });
        });

        form.addEventListener('submit', function (event) {
            // A second click, or Enter pressed again, while the first send is in flight.
            if (isSending) {
                event.preventDefault();
                return;
            }

            var firstInvalid = null;
            fields.forEach(function (field) {
                if (!checkField(field) && !firstInvalid) firstInvalid = field;
            });

            if (firstInvalid) {
                event.preventDefault();
                showStatus(MESSAGES.fixErrors, 'error');
                firstInvalid.focus();
                return;
            }

            // Send exactly what was validated, without stray spaces.
            fields.forEach(function (field) { field.value = field.value.trim(); });

            var id = fingerprint(readValues());

            if (wasRecentlySent(id)) {
                event.preventDefault();
                showStatus(MESSAGES.duplicate, 'info');
                return;
            }

            showStatus('');

            if (!canSubmitWithFetch()) {
                // Plain POST. Locking the button still prevents a double send.
                setSending(true);
                return;
            }

            event.preventDefault();
            setSending(true);

            window.fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(new FormData(form)).toString()
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    rememberSent(id);
                    window.location.assign(form.getAttribute('action') || '/success.html');
                })
                .catch(function () {
                    setSending(false);
                    showStatus(MESSAGES.failed, 'error');
                });
        });

        // Editing after a warning clears it.
        form.addEventListener('input', function () {
            if (!isSending && status && !status.hidden) showStatus('');
        });

        // Coming back with the Back button restores the page from cache with the
        // button still locked; unlock it.
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) setSending(false);
        });
    };
})(window.FSB = window.FSB || {});
