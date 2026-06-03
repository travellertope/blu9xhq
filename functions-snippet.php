<?php
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AI LANDING PAGE — functions.php snippet
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * HOW TO USE:
 * Copy everything below the file docblock and paste it into your
 * CHILD THEME's functions.php.
 *
 * FILE PLACEMENT (both files go in your child theme root):
 *   wp-content/themes/your-child-theme/
 *   ├── functions.php        ← paste the code below here
 *   ├── template-ai-landing.php
 *   └── landing-page.css
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * 1. GOOGLE FONTS
 *    Loads Fraunces (display) + DM Sans (body) from Google Fonts.
 *    Hooked on all front-end pages so fonts are available globally,
 *    but the stylesheet that uses them only loads on the landing page.
 */
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style(
		'ai-landing-google-fonts',
		'https://fonts.googleapis.com/css2?'
		. 'family=Fraunces:ital,opsz,wght@'
		.   '0,9..144,400;0,9..144,600;0,9..144,700;'
		.   '1,9..144,400;1,9..144,600'
		. '&family=DM+Sans:wght@400;500;600'
		. '&display=swap',
		[],
		null  // no version — Google Fonts handles its own cache-busting
	);
} );


/**
 * 2. LANDING PAGE STYLESHEET
 *    Enqueues landing-page.css ONLY when the "AI Landing Page"
 *    template is active. This keeps it off every other page.
 */
add_action( 'wp_enqueue_scripts', function () {
	if ( ! is_page_template( 'template-ai-landing.php' ) ) {
		return;
	}

	wp_enqueue_style(
		'ai-landing-page',
		get_stylesheet_directory_uri() . '/landing-page.css',
		[ 'ai-landing-google-fonts' ], // depends on fonts being registered first
		'1.0.0'
	);
}, 20 ); // priority 20 → runs after default theme styles, so our rules win


/**
 * 3. STRIP UNNECESSARY STYLES ON THE LANDING PAGE
 *    The template renders its own full page — no theme chrome, no sidebar.
 *    Dequeuing heavy theme / block stylesheets keeps the page lean.
 *
 *    ⚠️  CAUTION: test this after enabling. If your Gutenberg blocks look
 *    broken, comment out wp-block-library lines — some blocks need them.
 *    The landing-page.css re-styles all button/list/heading block output,
 *    so in most cases you can safely remove the block styles below.
 */
add_action( 'wp_enqueue_scripts', function () {
	if ( ! is_page_template( 'template-ai-landing.php' ) ) {
		return;
	}

	// Core WordPress block CSS (overridden by landing-page.css)
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );

	// ── Common theme handles to dequeue ────────────────────────────────
	// Replace with your actual theme's style handle(s) if needed.
	// Run wp_styles()->queue in a template to see what's loading.
	//
	// wp_dequeue_style( 'your-theme-style' );
	// wp_dequeue_style( 'storefront-style' );
	// wp_dequeue_style( 'astra-theme-css' );
}, 100 ); // priority 100 → after everything else has been enqueued


/**
 * 4. PRECONNECT TO GOOGLE FONTS (performance)
 *    Tells the browser to open the connection to Google Fonts early,
 *    reducing perceived font load time.
 */
add_action( 'wp_head', function () {
	if ( ! is_page_template( 'template-ai-landing.php' ) ) {
		return;
	}
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 ); // priority 1 → output before wp_head() collects other head items


/**
 * 5. BODY CLASS (optional utility)
 *    Adds a body class you can target in CSS when needed.
 *    landing-page.css already uses `.landing-page` (added by body_class()
 *    when WordPress detects the template name), but this makes it explicit.
 */
add_filter( 'body_class', function ( $classes ) {
	if ( is_page_template( 'template-ai-landing.php' ) ) {
		$classes[] = 'landing-page';
		$classes[] = 'no-header';
		$classes[] = 'no-footer';
	}
	return $classes;
} );
