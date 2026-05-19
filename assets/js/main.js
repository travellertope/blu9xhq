/**
 * Bluu Interactive — Main JavaScript
 * Handles: mobile nav, scroll animations, FAQ accordion, contact form AJAX
 */

( function () {
    'use strict';

    /* ── Helpers ────────────────────────────────────────────────────────────── */
    function qs( selector, ctx ) {
        return ( ctx || document ).querySelector( selector );
    }

    function qsa( selector, ctx ) {
        return Array.from( ( ctx || document ).querySelectorAll( selector ) );
    }

    /* ── Mobile Navigation ──────────────────────────────────────────────────── */
    function initMobileNav() {
        var toggle  = qs( '#mobile-menu-toggle' );
        var nav     = qs( '#mobile-nav' );
        var overlay = qs( '#mobile-nav-overlay' );
        var header  = qs( '#site-header' );

        if ( ! toggle || ! nav ) { return; }

        function openNav() {
            toggle.setAttribute( 'aria-expanded', 'true' );
            nav.classList.add( 'is-open' );
            nav.setAttribute( 'aria-hidden', 'false' );
            if ( overlay ) {
                overlay.classList.add( 'is-open' );
                overlay.setAttribute( 'aria-hidden', 'false' );
            }
            if ( header ) { header.classList.add( 'site-header--open' ); }
            document.body.style.overflow = 'hidden';
        }

        function closeNav() {
            toggle.setAttribute( 'aria-expanded', 'false' );
            nav.classList.remove( 'is-open' );
            nav.setAttribute( 'aria-hidden', 'true' );
            if ( overlay ) {
                overlay.classList.remove( 'is-open' );
                overlay.setAttribute( 'aria-hidden', 'true' );
            }
            if ( header ) { header.classList.remove( 'site-header--open' ); }
            document.body.style.overflow = '';
        }

        toggle.addEventListener( 'click', function () {
            var isOpen = nav.classList.contains( 'is-open' );
            if ( isOpen ) { closeNav(); } else { openNav(); }
        } );

        if ( overlay ) {
            overlay.addEventListener( 'click', closeNav );
        }

        document.addEventListener( 'keydown', function ( e ) {
            if ( e.key === 'Escape' && nav.classList.contains( 'is-open' ) ) {
                closeNav();
                toggle.focus();
            }
        } );

        // Close nav when a link is clicked
        qsa( '.mobile-nav__menu a', nav ).forEach( function ( link ) {
            link.addEventListener( 'click', closeNav );
        } );
    }

    /* ── Scroll-based Animations ────────────────────────────────────────────── */
    function initScrollAnimations() {
        var elements = qsa( '.animate-on-scroll' );
        if ( ! elements.length ) { return; }

        // Respect prefers-reduced-motion
        if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
            elements.forEach( function ( el ) {
                el.classList.add( 'is-visible' );
            } );
            return;
        }

        var observer = new IntersectionObserver(
            function ( entries ) {
                entries.forEach( function ( entry ) {
                    if ( entry.isIntersecting ) {
                        entry.target.classList.add( 'is-visible' );
                        observer.unobserve( entry.target );
                    }
                } );
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        elements.forEach( function ( el ) {
            observer.observe( el );
        } );
    }

    /* ── FAQ Accordion ──────────────────────────────────────────────────────── */
    function initFaqAccordion() {
        var items = qsa( '.faq-item' );
        if ( ! items.length ) { return; }

        items.forEach( function ( item ) {
            var question = qs( '.faq-item__question', item );
            var answer   = qs( '.faq-item__answer', item );

            if ( ! question || ! answer ) { return; }

            question.addEventListener( 'click', function () {
                var isOpen = question.getAttribute( 'aria-expanded' ) === 'true';

                // Close all others
                items.forEach( function ( other ) {
                    var otherQ = qs( '.faq-item__question', other );
                    var otherA = qs( '.faq-item__answer', other );
                    if ( otherQ && otherA ) {
                        otherQ.setAttribute( 'aria-expanded', 'false' );
                        otherA.classList.remove( 'is-open' );
                    }
                } );

                // Toggle this one
                if ( ! isOpen ) {
                    question.setAttribute( 'aria-expanded', 'true' );
                    answer.classList.add( 'is-open' );
                }
            } );
        } );
    }

    /* ── Contact Form AJAX ──────────────────────────────────────────────────── */
    function initContactForm() {
        var form = qs( '#contact-form' );
        if ( ! form ) { return; }

        var statusEl = qs( '#contact-form-status' );
        var submitBtn = qs( '[type="submit"]', form );

        form.addEventListener( 'submit', function ( e ) {
            e.preventDefault();

            if ( ! window.bluuData ) { return; }

            var originalText = submitBtn ? submitBtn.textContent : '';
            if ( submitBtn ) {
                submitBtn.disabled = true;
                submitBtn.textContent = window.bluuData.strings.sending || 'Sending…';
            }

            if ( statusEl ) {
                statusEl.className = 'form-status';
                statusEl.textContent = '';
            }

            var formData = new FormData( form );
            formData.append( 'action', 'bluu_contact' );
            formData.append( 'nonce', window.bluuData.nonce );

            fetch( window.bluuData.ajaxUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
            } )
                .then( function ( res ) { return res.json(); } )
                .then( function ( data ) {
                    if ( data.success ) {
                        if ( statusEl ) {
                            statusEl.className = 'form-status form-status--success';
                            statusEl.textContent = data.data.message || window.bluuData.strings.success;
                        }
                        form.reset();
                    } else {
                        if ( statusEl ) {
                            statusEl.className = 'form-status form-status--error';
                            statusEl.textContent = ( data.data && data.data.message ) || window.bluuData.strings.error;
                        }
                    }
                } )
                .catch( function () {
                    if ( statusEl ) {
                        statusEl.className = 'form-status form-status--error';
                        statusEl.textContent = window.bluuData.strings.error;
                    }
                } )
                .finally( function () {
                    if ( submitBtn ) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                } );
        } );
    }

    /* ── Sticky Header scroll class ─────────────────────────────────────────── */
    function initStickyHeader() {
        var header = qs( '.site-header' );
        if ( ! header ) { return; }

        function onScroll() {
            if ( window.scrollY > 10 ) {
                header.classList.add( 'site-header--scrolled' );
            } else {
                header.classList.remove( 'site-header--scrolled' );
            }
        }

        window.addEventListener( 'scroll', onScroll, { passive: true } );
        onScroll();
    }

    /* ── Init ────────────────────────────────────────────────────────────────── */
    document.addEventListener( 'DOMContentLoaded', function () {
        initMobileNav();
        initScrollAnimations();
        initFaqAccordion();
        initContactForm();
        initStickyHeader();
    } );

} )();
