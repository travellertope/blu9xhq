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

        // Inject chevron toggle buttons for items with sub-menus
        qsa( '.mobile-nav__menu > li.menu-item-has-children', nav ).forEach( function ( li ) {
            var subMenu = li.querySelector( ':scope > .sub-menu' );
            if ( ! subMenu ) return;

            var btn = document.createElement( 'button' );
            btn.className = 'mobile-sub-toggle';
            btn.setAttribute( 'aria-expanded', 'false' );
            btn.setAttribute( 'aria-label', 'Toggle submenu' );
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

            btn.addEventListener( 'click', function ( e ) {
                e.stopPropagation();
                var isOpen = subMenu.classList.contains( 'is-open' );
                subMenu.classList.toggle( 'is-open', ! isOpen );
                btn.setAttribute( 'aria-expanded', String( ! isOpen ) );
            } );

            li.appendChild( btn );
        } );

        // Close nav when a link is clicked (but not the toggle buttons)
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
    /* ── FAQ Accordion with animated height ─────────────────────────────────── */
    function openFaqItem( item ) {
        var question = qs( '.faq-item__question', item );
        var answer   = qs( '.faq-item__answer', item );
        if ( ! question || ! answer ) { return; }

        answer.removeAttribute( 'hidden' );
        var h = answer.scrollHeight;
        answer.style.height = '0px';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'height 260ms cubic-bezier(0.4, 0, 0.2, 1)';

        requestAnimationFrame( function () {
            answer.style.height = h + 'px';
            question.setAttribute( 'aria-expanded', 'true' );
        } );

        answer.addEventListener( 'transitionend', function handler() {
            answer.style.height = '';
            answer.style.overflow = '';
            answer.style.transition = '';
            answer.removeEventListener( 'transitionend', handler );
        } );
    }

    function closeFaqItem( item ) {
        var question = qs( '.faq-item__question', item );
        var answer   = qs( '.faq-item__answer', item );
        if ( ! question || ! answer ) { return; }
        if ( answer.hasAttribute( 'hidden' ) ) { return; }

        var h = answer.scrollHeight;
        answer.style.height = h + 'px';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'height 220ms cubic-bezier(0.4, 0, 0.2, 1)';
        question.setAttribute( 'aria-expanded', 'false' );

        requestAnimationFrame( function () {
            answer.style.height = '0px';
        } );

        answer.addEventListener( 'transitionend', function handler() {
            answer.setAttribute( 'hidden', '' );
            answer.style.height = '';
            answer.style.overflow = '';
            answer.style.transition = '';
            answer.removeEventListener( 'transitionend', handler );
        } );
    }

    function initFaqAccordion() {
        var items = qsa( '.faq-item' );
        if ( ! items.length ) { return; }

        items.forEach( function ( item ) {
            var question = qs( '.faq-item__question', item );
            if ( ! question ) { return; }

            question.addEventListener( 'click', function () {
                var isOpen = question.getAttribute( 'aria-expanded' ) === 'true';

                // Close all others in same list
                var list = item.closest( '.faq-list' );
                if ( list ) {
                    qsa( '.faq-item', list ).forEach( function ( other ) {
                        if ( other !== item ) { closeFaqItem( other ); }
                    } );
                }

                if ( isOpen ) {
                    closeFaqItem( item );
                } else {
                    openFaqItem( item );
                }
            } );
        } );
    }

    /* ── FAQ Search & Category Filter ───────────────────────────────────────── */
    function initFaqSearch() {
        var searchInput  = qs( '#faq-search' );
        if ( ! searchInput ) { return; }

        var clearBtn     = qs( '.faq-search-clear' );
        var clearSearch  = qs( '.faq-clear-search' );
        var noResults    = qs( '.faq-no-results' );
        var tabs         = qsa( '.faq-tab' );
        var categories   = qsa( '.faq-category' );
        var allItems     = qsa( '.faq-item' );
        var activeCategory = 'all';
        var resultCount  = null;

        // Add a result count line after search field
        var countEl = document.createElement( 'p' );
        countEl.className = 'faq-result-count';
        countEl.setAttribute( 'aria-live', 'polite' );
        countEl.hidden = true;
        searchInput.closest( '.faq-search-field' ).insertAdjacentElement( 'afterend', countEl );
        resultCount = countEl;

        function escapeRegex( str ) {
            return str.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
        }

        function highlightText( el, term ) {
            // Restore original text first
            var original = el.getAttribute( 'data-original' ) || el.textContent;
            el.setAttribute( 'data-original', original );

            if ( ! term ) {
                el.textContent = original;
                return;
            }
            var regex = new RegExp( '(' + escapeRegex( term ) + ')', 'gi' );
            el.innerHTML = original.replace( regex, '<mark>$1</mark>' );
        }

        function runFilter() {
            var term = searchInput.value.trim().toLowerCase();
            var hasSearch = term.length > 0;
            var visible = 0;

            if ( clearBtn ) { clearBtn.hidden = ! hasSearch; }

            categories.forEach( function ( cat ) {
                var catId   = cat.getAttribute( 'data-category' );
                var catMatch = activeCategory === 'all' || activeCategory === catId;
                var catVisible = false;

                qsa( '.faq-item', cat ).forEach( function ( item ) {
                    var questionText = ( item.getAttribute( 'data-question' ) || '' );
                    var questionEl   = qs( '.faq-item__question-text', item );
                    var termMatch    = ! hasSearch || questionText.indexOf( term ) !== -1;
                    var show         = catMatch && termMatch;

                    if ( show ) {
                        item.removeAttribute( 'hidden' );
                        catVisible = true;
                        visible++;
                        if ( questionEl ) { highlightText( questionEl, term ); }
                    } else {
                        item.setAttribute( 'hidden', '' );
                        // Close if open
                        closeFaqItem( item );
                        if ( questionEl ) { highlightText( questionEl, '' ); }
                    }
                } );

                if ( catMatch && catVisible ) {
                    cat.removeAttribute( 'hidden' );
                } else {
                    cat.setAttribute( 'hidden', '' );
                }
            } );

            // No results state
            if ( noResults ) {
                noResults.hidden = visible > 0 || ! hasSearch;
            }

            // Result count
            if ( resultCount ) {
                if ( hasSearch ) {
                    resultCount.hidden = false;
                    resultCount.textContent = visible === 1
                        ? '1 question found'
                        : visible + ' questions found';
                } else {
                    resultCount.hidden = true;
                }
            }

            // Auto-open first visible result when searching
            if ( hasSearch && visible === 1 ) {
                var firstVisible = qs( '.faq-item:not([hidden])' );
                if ( firstVisible ) { openFaqItem( firstVisible ); }
            }
        }

        // Debounce
        var debounceTimer;
        searchInput.addEventListener( 'input', function () {
            clearTimeout( debounceTimer );
            debounceTimer = setTimeout( runFilter, 180 );
        } );

        function clearSearchFn() {
            searchInput.value = '';
            searchInput.focus();
            runFilter();
        }

        if ( clearBtn ) { clearBtn.addEventListener( 'click', clearSearchFn ); }
        if ( clearSearch ) { clearSearch.addEventListener( 'click', clearSearchFn ); }

        // Category tabs
        tabs.forEach( function ( tab ) {
            tab.addEventListener( 'click', function () {
                tabs.forEach( function ( t ) {
                    t.classList.remove( 'faq-tab--active' );
                    t.setAttribute( 'aria-selected', 'false' );
                } );
                tab.classList.add( 'faq-tab--active' );
                tab.setAttribute( 'aria-selected', 'true' );
                activeCategory = tab.getAttribute( 'data-category' );
                runFilter();

                // Scroll to category anchor if selecting a specific one
                if ( activeCategory !== 'all' ) {
                    var target = qs( '#' + activeCategory );
                    if ( target ) {
                        setTimeout( function () {
                            target.scrollIntoView( { behavior: 'smooth', block: 'start' } );
                        }, 50 );
                    }
                }
            } );
        } );
    }

    /* ── Contact Form AJAX ──────────────────────────────────────────────────── */
    function initContactForm() {
        var form = qs( '#contact-form' );
        if ( ! form ) { return; }

        var feedbackEl  = qs( '#contact-form-feedback' );
        var submitBtn   = qs( '#contact-submit', form );
        var submitText  = submitBtn ? qs( '.contact-form__submit-text',    submitBtn ) : null;
        var submitLoad  = submitBtn ? qs( '.contact-form__submit-loading', submitBtn ) : null;
        var tokenField  = qs( '#recaptcha_token', form );

        function showFeedback( message, isSuccess ) {
            if ( ! feedbackEl ) { return; }
            feedbackEl.textContent = message;
            feedbackEl.className   = 'contact-form__feedback ' + ( isSuccess ? 'contact-form__feedback--success' : 'contact-form__feedback--error' );
            feedbackEl.removeAttribute( 'hidden' );
            feedbackEl.scrollIntoView( { behavior: 'smooth', block: 'nearest' } );
        }

        function setLoading( loading ) {
            if ( submitBtn  ) { submitBtn.disabled = loading; }
            if ( submitText ) { submitText.hidden  = loading; }
            if ( submitLoad ) { submitLoad.hidden  = ! loading; }
        }

        function doSubmit() {
            var formData = new FormData( form );
            formData.append( 'action', 'bluu_contact' );
            formData.append( 'nonce',  window.bluuData ? window.bluuData.nonce : '' );

            fetch( window.bluuData ? window.bluuData.ajaxUrl : '/wp-admin/admin-ajax.php', {
                method:      'POST',
                body:        formData,
                credentials: 'same-origin',
            } )
                .then( function ( res ) { return res.json(); } )
                .then( function ( data ) {
                    if ( data.success ) {
                        showFeedback( data.data.message || ( window.bluuData && window.bluuData.strings.success ) || 'Message sent!', true );
                        form.reset();
                        if ( tokenField ) { tokenField.value = ''; }
                    } else {
                        showFeedback( ( data.data && data.data.message ) || ( window.bluuData && window.bluuData.strings.error ) || 'Something went wrong.', false );
                    }
                } )
                .catch( function () {
                    showFeedback( ( window.bluuData && window.bluuData.strings.error ) || 'Something went wrong. Please email us directly.', false );
                } )
                .finally( function () {
                    setLoading( false );
                } );
        }

        form.addEventListener( 'submit', function ( e ) {
            e.preventDefault();
            if ( feedbackEl ) { feedbackEl.setAttribute( 'hidden', '' ); }
            setLoading( true );

            /* Execute reCAPTCHA v3 if available, then submit */
            if ( window.grecaptcha && window.bluuRecaptcha && window.bluuRecaptcha.siteKey ) {
                window.grecaptcha.ready( function () {
                    window.grecaptcha.execute( window.bluuRecaptcha.siteKey, { action: window.bluuRecaptcha.action || 'contact_form' } )
                        .then( function ( token ) {
                            if ( tokenField ) { tokenField.value = token; }
                            doSubmit();
                        } )
                        .catch( function () {
                            doSubmit(); // submit anyway if reCAPTCHA fails
                        } );
                } );
            } else {
                doSubmit();
            }
        } );
    }

    /* ── Mega Menu (Desktop) ────────────────────────────────────────────────── */
    function initMegaMenu() {
        var megaItems = qsa( '.site-header__menu .has-mega' );
        if ( ! megaItems.length ) { return; }

        var closeTimer;

        function openMega( li ) {
            clearTimeout( closeTimer );
            megaItems.forEach( function ( other ) {
                if ( other !== li ) { closeMegaNow( other ); }
            } );
            li.classList.add( 'is-open' );
            var trigger = qs( '.mega-trigger', li );
            if ( trigger ) { trigger.setAttribute( 'aria-expanded', 'true' ); }
        }

        function closeMegaNow( li ) {
            li.classList.remove( 'is-open' );
            var trigger = qs( '.mega-trigger', li );
            if ( trigger ) { trigger.setAttribute( 'aria-expanded', 'false' ); }
        }

        function closeMegaAfterDelay( li ) {
            clearTimeout( closeTimer );
            closeTimer = setTimeout( function () { closeMegaNow( li ); }, 120 );
        }

        megaItems.forEach( function ( li ) {
            var trigger = qs( '.mega-trigger', li );
            var panel   = qs( '.mega-panel',   li );

            li.addEventListener( 'mouseenter', function () { openMega( li ); } );
            li.addEventListener( 'mouseleave', function () { closeMegaAfterDelay( li ); } );

            if ( panel ) {
                panel.addEventListener( 'mouseenter', function () { clearTimeout( closeTimer ); } );
                panel.addEventListener( 'mouseleave', function () { closeMegaAfterDelay( li ); } );
            }

            if ( trigger ) {
                // First click opens; second click navigates to parent page
                trigger.addEventListener( 'click', function ( e ) {
                    if ( ! li.classList.contains( 'is-open' ) ) {
                        e.preventDefault();
                        openMega( li );
                    }
                } );

                trigger.addEventListener( 'keydown', function ( e ) {
                    if ( e.key === 'ArrowDown' || ( e.key === 'Enter' && ! li.classList.contains( 'is-open' ) ) ) {
                        e.preventDefault();
                        openMega( li );
                        var firstLink = panel ? qs( 'a', panel ) : null;
                        if ( firstLink ) { firstLink.focus(); }
                    }
                    if ( e.key === 'Escape' ) {
                        closeMegaNow( li );
                        trigger.focus();
                    }
                } );
            }

            li.addEventListener( 'keydown', function ( e ) {
                if ( e.key === 'Escape' && li.classList.contains( 'is-open' ) ) {
                    closeMegaNow( li );
                    if ( trigger ) { trigger.focus(); }
                }
            } );
        } );

        // Close on click outside any mega item
        document.addEventListener( 'click', function ( e ) {
            megaItems.forEach( function ( li ) {
                if ( ! li.contains( e.target ) ) { closeMegaNow( li ); }
            } );
        } );

        // Close all on Escape from anywhere
        document.addEventListener( 'keydown', function ( e ) {
            if ( e.key === 'Escape' ) { megaItems.forEach( closeMegaNow ); }
        } );
    }

    /* ── Mobile Mega Accordion ──────────────────────────────────────────────── */
    function initMobileMegaMenu() {
        var toggleBtns = qsa( '.mobile-mega-btn' );
        if ( ! toggleBtns.length ) { return; }

        toggleBtns.forEach( function ( btn ) {
            var li   = btn.closest( '.has-mega' );
            if ( ! li ) { return; }

            btn.addEventListener( 'click', function () {
                var isOpen = li.classList.contains( 'is-open' );
                li.classList.toggle( 'is-open', ! isOpen );
                btn.setAttribute( 'aria-expanded', String( ! isOpen ) );
            } );
        } );

        // Reset accordion when mobile drawer closes
        var mobileToggle = qs( '#mobile-menu-toggle' );
        var mobileNav    = qs( '#mobile-nav' );
        if ( mobileToggle && mobileNav ) {
            mobileToggle.addEventListener( 'click', function () {
                if ( mobileNav.classList.contains( 'is-open' ) ) { return; }
                qsa( '.mobile-nav__menu .has-mega.is-open' ).forEach( function ( li ) {
                    li.classList.remove( 'is-open' );
                    var btn = qs( '.mobile-mega-btn', li );
                    if ( btn ) { btn.setAttribute( 'aria-expanded', 'false' ); }
                } );
            } );
        }
    }

    /* ── Mobile Industries Sub-accordion ────────────────────────────────────── */
    function initMobileIndustriesAccordion() {
        qsa( '.mobile-ind-toggle' ).forEach( function ( btn ) {
            var body = btn.closest( '.mobile-ind-group' ).querySelector( '.mobile-ind-group__body' );
            if ( ! body ) { return; }
            btn.addEventListener( 'click', function () {
                var isOpen = body.classList.contains( 'is-open' );
                body.classList.toggle( 'is-open', ! isOpen );
                btn.setAttribute( 'aria-expanded', String( ! isOpen ) );
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

    /* ── Industries mega menu — left-nav panel switching ─────────────────── */
    function initIndustriesMegaNav() {
        var wrap = qs( '.mega-ind-wrap' );
        if ( ! wrap ) { return; }
        var btns = wrap.querySelectorAll( '.mega-ind-btn' );

        function activatePanel( btn ) {
            var key = btn.getAttribute( 'data-panel' );
            wrap.querySelectorAll( '.mega-ind-btn' ).forEach( function ( b ) { b.classList.remove( 'is-active' ); } );
            wrap.querySelectorAll( '.mega-ind-panel' ).forEach( function ( p ) { p.classList.remove( 'is-active' ); } );
            btn.classList.add( 'is-active' );
            var panel = document.getElementById( 'mega-ind-panel-' + key );
            if ( panel ) { panel.classList.add( 'is-active' ); }
        }

        btns.forEach( function ( btn ) {
            btn.addEventListener( 'mouseenter', function () { activatePanel( btn ); } );
            btn.addEventListener( 'focus',      function () { activatePanel( btn ); } );
            btn.addEventListener( 'click',      function () { activatePanel( btn ); } );
        } );
    }

    /* ── Pricing table sticky thead (JS — overflow-x:auto breaks CSS sticky) ── */
    function initPricingTableSticky() {
        var wrap  = qs( '.pricing-table-wrap' );
        if ( ! wrap ) { return; }

        var thead  = wrap.querySelector( 'thead' );
        var ths    = Array.from( thead.querySelectorAll( 'th' ) );
        var navH   = parseInt(
            getComputedStyle( document.documentElement )
                .getPropertyValue( '--header-height' ), 10
        ) || 80;

        function update() {
            var r      = wrap.getBoundingClientRect();
            var theadH = thead.getBoundingClientRect().height;

            if ( r.top < navH && r.bottom > navH + theadH ) {
                var offset = navH - r.top;
                ths.forEach( function ( th ) {
                    th.style.transform  = 'translateY(' + offset + 'px)';
                    th.style.boxShadow  = '0 2px 6px rgba(0,0,0,0.08)';
                } );
            } else {
                ths.forEach( function ( th ) {
                    th.style.transform = '';
                    th.style.boxShadow = '';
                } );
            }
        }

        window.addEventListener( 'scroll', update, { passive: true } );
        window.addEventListener( 'resize', update );
        update();
    }

    /* ── Sync --header-height CSS var from actual rendered header ────────────── */
    function initHeaderHeight() {
        var header = qs( '.site-header' );
        if ( ! header ) { return; }

        function sync() {
            var h = Math.round( header.getBoundingClientRect().height );
            if ( h > 0 ) {
                document.documentElement.style.setProperty( '--header-height', h + 'px' );
            }
        }

        sync();
        window.addEventListener( 'resize', sync, { passive: true } );
    }

    /* ── Init ────────────────────────────────────────────────────────────────── */
    document.addEventListener( 'DOMContentLoaded', function () {
        initHeaderHeight();   // must run first — positions mega panel + mobile nav
        initMobileNav();
        initMegaMenu();
        initIndustriesMegaNav();
        initMobileMegaMenu();
        initMobileIndustriesAccordion();
        initScrollAnimations();
        initFaqAccordion();
        initFaqSearch();
        initContactForm();
        initStickyHeader();
        initPricingTableSticky();
    } );

} )();

/* ── What We Produce — off-canvas panels ──────────────────────────────────── */
( function () {

    function initWwpPanels() {
        var overlay    = document.getElementById( 'wwp-overlay' );
        var openBtns   = document.querySelectorAll( '[data-wwp-open]' );
        var allPanels  = document.querySelectorAll( '.wwp-panel' );

        if ( ! overlay || ! openBtns.length ) { return; }

        var activePanel   = null;
        var previousFocus = null;

        function openPanel( index ) {
            var panel = document.getElementById( 'wwp-panel-' + index );
            if ( ! panel ) { return; }

            previousFocus = document.activeElement;
            activePanel   = panel;

            // Show overlay (display first, then opacity for transition)
            overlay.style.display = 'block';
            requestAnimationFrame( function () {
                overlay.classList.add( 'is-open' );
                overlay.setAttribute( 'aria-hidden', 'false' );
            } );

            panel.classList.add( 'is-open' );
            panel.setAttribute( 'aria-hidden', 'false' );
            document.body.style.overflow = 'hidden';

            // Focus first focusable element inside panel
            var focusable = panel.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if ( focusable.length ) {
                setTimeout( function () { focusable[ 0 ].focus(); }, 50 );
            }
        }

        function closePanel() {
            if ( ! activePanel ) { return; }

            activePanel.classList.remove( 'is-open' );
            activePanel.setAttribute( 'aria-hidden', 'true' );
            activePanel = null;

            overlay.classList.remove( 'is-open' );
            overlay.setAttribute( 'aria-hidden', 'true' );

            document.body.style.overflow = '';

            // Hide overlay after transition ends
            overlay.addEventListener( 'transitionend', function handler() {
                overlay.style.display = 'none';
                overlay.removeEventListener( 'transitionend', handler );
            } );

            if ( previousFocus ) {
                previousFocus.focus();
                previousFocus = null;
            }
        }

        // Open buttons
        openBtns.forEach( function ( btn ) {
            btn.addEventListener( 'click', function () {
                openPanel( btn.getAttribute( 'data-wwp-open' ) );
            } );
        } );

        // Close buttons (inside panels)
        allPanels.forEach( function ( panel ) {
            panel.querySelectorAll( '[data-wwp-close]' ).forEach( function ( btn ) {
                btn.addEventListener( 'click', closePanel );
            } );
        } );

        // Overlay click
        overlay.addEventListener( 'click', closePanel );

        // Escape key
        document.addEventListener( 'keydown', function ( e ) {
            if ( e.key === 'Escape' && activePanel ) {
                closePanel();
            }
        } );

        // Focus trap
        document.addEventListener( 'keydown', function ( e ) {
            if ( e.key !== 'Tab' || ! activePanel ) { return; }

            var focusable = Array.from( activePanel.querySelectorAll(
                'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) );
            if ( ! focusable.length ) { return; }

            var first = focusable[ 0 ];
            var last  = focusable[ focusable.length - 1 ];

            if ( e.shiftKey ) {
                if ( document.activeElement === first ) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if ( document.activeElement === last ) {
                    e.preventDefault();
                    first.focus();
                }
            }
        } );
    }

    document.addEventListener( 'DOMContentLoaded', initWwpPanels );

} )();
