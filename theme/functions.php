<?php
/**
 * Bluu Interactive Theme Functions
 *
 * @package bluu-interactive
 */

defined( 'ABSPATH' ) || exit;

// ── Theme Setup ────────────────────────────────────────────────────────────────
if ( ! function_exists( 'bluu_theme_setup' ) ) :
    function bluu_theme_setup() {
        // Enable <title> tag management
        add_theme_support( 'title-tag' );

        // Enable featured images
        add_theme_support( 'post-thumbnails' );

        // HTML5 markup support
        add_theme_support( 'html5', array(
            'search-form',
            'comment-form',
            'comment-list',
            'gallery',
            'caption',
            'style',
            'script',
        ) );

        // Custom logo support
        add_theme_support( 'custom-logo', array(
            'height'      => 60,
            'width'       => 200,
            'flex-height' => true,
            'flex-width'  => true,
        ) );

        // Automatic feed links
        add_theme_support( 'automatic-feed-links' );

        // Selective refresh for widgets
        add_theme_support( 'customize-selective-refresh-widgets' );

        // Wide/full alignment support (Gutenberg)
        add_theme_support( 'align-wide' );

        // Editor styles
        add_theme_support( 'editor-styles' );

        // Register navigation menus
        register_nav_menus( array(
            'primary' => esc_html__( 'Primary Navigation', 'bluu-interactive' ),
            'footer'  => esc_html__( 'Footer Navigation', 'bluu-interactive' ),
        ) );

        // Load text domain
        load_theme_textdomain( 'bluu-interactive', get_template_directory() . '/languages' );
    }
endif;
add_action( 'after_setup_theme', 'bluu_theme_setup' );

// ── Content Width ──────────────────────────────────────────────────────────────
function bluu_content_width() {
    $GLOBALS['content_width'] = apply_filters( 'bluu_content_width', 1200 );
}
add_action( 'after_setup_theme', 'bluu_content_width', 0 );

// ── Custom Image Sizes ─────────────────────────────────────────────────────────
function bluu_add_image_sizes() {
    add_image_size( 'bluu-hero',        1440, 900,  true );
    add_image_size( 'bluu-card',        800,  500,  true );
    add_image_size( 'bluu-thumbnail',   600,  400,  true );
    add_image_size( 'bluu-portrait',    400,  600,  true );
    add_image_size( 'bluu-square',      600,  600,  true );
    add_image_size( 'bluu-wide',        1200, 600,  true );
}
add_action( 'after_setup_theme', 'bluu_add_image_sizes' );

// ── Enqueue Scripts & Styles ───────────────────────────────────────────────────
function bluu_enqueue_assets() {
    $js_ver  = filemtime( get_template_directory() . '/assets/js/main.js' );
    $css_ver = filemtime( get_template_directory() . '/assets/css/main.css' );
    $version = wp_get_theme()->get( 'Version' );

    // Google Fonts – Plus Jakarta Sans
    wp_enqueue_style(
        'bluu-google-fonts',
        'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
        array(),
        null
    );

    // Main stylesheet
    wp_enqueue_style(
        'bluu-main-css',
        get_template_directory_uri() . '/assets/css/main.css',
        array( 'bluu-google-fonts' ),
        $css_ver
    );

    // Industry page styles — loaded on industry + sub-industry templates only
    if ( is_page_template( array( 'page-industry.php', 'page-subindustry.php', 'page-usecase.php', 'page-industries.php', 'page-usecases.php' ) ) ) {
        wp_enqueue_style(
            'bluu-industry-css',
            get_template_directory_uri() . '/assets/css/industry-page.css',
            array( 'bluu-main-css' ),
            $version
        );
    }

    // What We Produce page styles — inlined after main.css (no file path dependency)
    $wwp_css_path = get_template_directory() . '/assets/css/what-we-produce.css';
    if ( file_exists( $wwp_css_path ) ) {
        wp_add_inline_style( 'bluu-main-css', file_get_contents( $wwp_css_path ) ); // phpcs:ignore
    }

    // Main JavaScript
    wp_enqueue_script(
        'bluu-main-js',
        get_template_directory_uri() . '/assets/js/main.js',
        array(),
        $js_ver,
        true // Load in footer
    );

    // Pass data to JS
    wp_localize_script( 'bluu-main-js', 'bluuData', array(
        'ajaxUrl' => esc_url( admin_url( 'admin-ajax.php' ) ),
        'nonce'   => wp_create_nonce( 'bluu_contact_nonce' ),
        'strings' => array(
            'sending'   => esc_html__( 'Sending…', 'bluu-interactive' ),
            'success'   => esc_html__( 'Message sent! We\'ll be in touch within 1 business day.', 'bluu-interactive' ),
            'error'     => esc_html__( 'Something went wrong. Please email us directly at hello@bluuhq.com', 'bluu-interactive' ),
        ),
    ) );

    // Comment reply script
    if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
        wp_enqueue_script( 'comment-reply' );
    }

    // Blog CSS & JS — only on blog-related pages
    if ( is_singular( 'post' ) || is_home() || is_archive() || is_page_template( 'page-blog.php' ) ) {
        wp_enqueue_style(
            'bluu-blog-css',
            get_template_directory_uri() . '/assets/css/blog.css',
            array( 'bluu-main-css' ),
            $version
        );
        wp_enqueue_script(
            'bluu-blog-js',
            get_template_directory_uri() . '/assets/js/blog.js',
            array(),
            $version,
            true
        );
        wp_localize_script( 'bluu-blog-js', 'bluuSearch', array(
            'ajaxUrl' => esc_url( admin_url( 'admin-ajax.php' ) ),
            'nonce'   => wp_create_nonce( 'bluu_archive_search' ),
        ) );
    }
}
add_action( 'wp_enqueue_scripts', 'bluu_enqueue_assets' );

// ── Preconnect for Google Fonts ────────────────────────────────────────────────
function bluu_preconnect_fonts() {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
    // Update font-family CSS var to Plus Jakarta Sans
    echo '<style>:root{--font-family-base:"Plus Jakarta Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}</style>' . "\n";
}
add_action( 'wp_head', 'bluu_preconnect_fonts', 1 );

// ── SEO Meta Tags ──────────────────────────────────────────────────────────────
function bluu_seo_meta_tags() {
    if ( function_exists( 'yoast_head' ) || class_exists( 'RankMath\RankMath' ) ) {
        return;
    }

    $description = '';

    if ( is_singular( 'page' ) && function_exists( 'get_field' ) ) {
        $template = get_post_meta( get_the_ID(), '_wp_page_template', true );
        $field_map = array(
            'page-industry.php'    => 'ind_meta_description',
            'page-subindustry.php' => 'si_meta_description',
            'page-usecase.php'     => 'uc_meta_description',
            'page-industries.php'  => 'hub_meta_description',
        );
        if ( isset( $field_map[ $template ] ) ) {
            $description = get_field( $field_map[ $template ] );
        }
    }

    if ( ! $description ) {
        $description = get_bloginfo( 'description' ) ?: 'Bluu Interactive runs your complete content operation — research, writing, publishing, and reporting — all content built to SEO and AI crawl standard.';
    }

    echo '<meta name="description" content="' . esc_attr( $description ) . '">' . "\n";

    if ( ! is_singular( 'page' ) || ! get_post_meta( get_the_ID(), '_wp_page_template', true ) ) {
        $schema = array(
            '@context'        => 'https://schema.org',
            '@type'           => 'Organization',
            'name'            => 'Bluu Interactive',
            'url'             => 'https://bluuhq.com',
            'description'     => 'B2B content operations agency. All content built to SEO and AI crawl standard — structured for discovery in Google, AI Overviews, and Perplexity.',
            'contentStandard' => 'SEO and AI crawl standard',
            'sameAs'          => array(
                'https://linkedin.com/company/bluuinteractive',
                'https://twitter.com/bluuinteractive',
            ),
        );
        echo '<script type="application/ld+json">' . wp_json_encode( $schema ) . '</script>' . "\n";
    }
}
add_action( 'wp_head', 'bluu_seo_meta_tags', 5 );

// ── Safe rich-text output helper ──────────────────────────────────────────────
// Use bluu_text( $str ) instead of esc_html( $str ) for ACF fields where
// editors need <br>, <strong>, or <em> — all other tags are stripped.
function bluu_text( $str ) {
    return wp_kses( $str, array(
        'br'     => array(),
        'strong' => array(),
        'em'     => array(),
    ) );
}

// Contact form AJAX handler is registered in inc/contact-submissions.php

// ── Custom Excerpt Length ──────────────────────────────────────────────────────
function bluu_excerpt_length( $length ) {
    return 25;
}
add_filter( 'excerpt_length', 'bluu_excerpt_length' );

function bluu_excerpt_more( $more ) {
    return '&hellip;';
}
add_filter( 'excerpt_more', 'bluu_excerpt_more' );

// Google Analytics and font loading are handled in inc/customizer.php

// ── Widget Areas ───────────────────────────────────────────────────────────────
function bluu_register_widgets() {
    register_sidebar( array(
        'name'          => esc_html__( 'Blog Sidebar', 'bluu-interactive' ),
        'id'            => 'blog-sidebar',
        'description'   => esc_html__( 'Add widgets for the blog sidebar.', 'bluu-interactive' ),
        'before_widget' => '<div id="%1$s" class="widget %2$s">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ) );
}
add_action( 'widgets_init', 'bluu_register_widgets' );

// ── Body Classes ───────────────────────────────────────────────────────────────
function bluu_body_classes( $classes ) {
    if ( ! is_singular() ) {
        $classes[] = 'hfeed';
    }
    if ( is_page_template() ) {
        $classes[] = 'page-template-active';
    }
    return $classes;
}
add_filter( 'body_class', 'bluu_body_classes' );

// ── Mega Menu Helpers ──────────────────────────────────────────────────────────

function bluu_mega_chevron() {
    return '<svg class="mega-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';
}

function bluu_mega_icon( $paths, $size = 16 ) {
    return sprintf(
        '<svg width="%1$d" height="%1$d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%2$s</svg>',
        (int) $size,
        $paths
    );
}

function bluu_mega_item( $url, $icon_paths, $title, $desc = '' ) {
    $icon = bluu_mega_icon( $icon_paths );
    return '<li><a href="' . esc_url( $url ) . '" class="mega-panel__item">' .
        '<span class="mega-panel__item-icon">' . $icon . '</span>' .
        '<span class="mega-panel__item-body">' .
        '<span class="mega-panel__item-title">' . esc_html( $title ) . '</span>' .
        ( $desc ? '<span class="mega-panel__item-desc">' . esc_html( $desc ) . '</span>' : '' ) .
        '</span></a></li>';
}

// ── Desktop Mega Menu Walker ───────────────────────────────────────────────────
if ( ! class_exists( 'Bluu_Mega_Menu_Walker' ) ) :
class Bluu_Mega_Menu_Walker extends Walker_Nav_Menu {

    private $industries_injected = false;

    public function start_lvl( &$output, $depth = 0, $args = null ) {
        if ( $this->industries_injected && $depth === 0 ) {
            $output .= '<div style="display:none" aria-hidden="true"><ul>';
        } elseif ( 0 === $depth ) {
            $output .= '<div class="mega-panel"><div class="mega-panel__inner"><ul class="mega-panel__simple-list">';
        } else {
            $output .= '<ul class="sub-menu">';
        }
    }

    public function end_lvl( &$output, $depth = 0, $args = null ) {
        if ( $this->industries_injected && $depth === 0 ) {
            $output .= '</ul></div>';
            $this->industries_injected = false;
        } elseif ( 0 === $depth ) {
            $output .= '</ul></div></div>';
        } else {
            $output .= '</ul>';
        }
    }

    public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
        if ( $this->industries_injected && $depth > 0 ) {
            $output .= '<li>';
            return;
        }

        $classes      = empty( $item->classes ) ? array() : (array) $item->classes;
        $has_children = in_array( 'menu-item-has-children', $classes );
        $url          = ! empty( $item->url ) ? esc_url( $item->url ) : '#';
        $title        = apply_filters( 'nav_menu_item_title', $item->title, $item, $args, $depth );
        $lb           = isset( $args->link_before ) ? $args->link_before : '';
        $la           = isset( $args->link_after )  ? $args->link_after  : '';

        if ( $depth === 0 && $has_children && false !== strpos( $item->url, 'industries' ) ) {
            $output .= '<li class="has-mega has-mega--industries">';
            $output .= '<a href="' . $url . '" class="mega-trigger" aria-haspopup="true" aria-expanded="false">' . $lb . $title . $la . bluu_mega_chevron() . '</a>';
            $output .= bluu_industries_mega_panel();
            $this->industries_injected = true;
        } elseif ( $depth === 0 && $has_children ) {
            $filtered  = array_diff( $classes, array( 'menu-item-has-children' ) );
            $filtered[] = 'has-mega';
            $class_str = trim( implode( ' ', array_filter( array_map( 'sanitize_html_class', $filtered ) ) ) );
            $output .= '<li class="' . esc_attr( $class_str ) . '">';
            $output .= '<a href="' . $url . '" class="mega-trigger" aria-haspopup="true" aria-expanded="false">' . $lb . $title . $la . bluu_mega_chevron() . '</a>';
        } elseif ( $depth === 0 ) {
            $filtered  = array_diff( $classes, array( 'menu-item-has-children' ) );
            $class_str = trim( implode( ' ', array_filter( array_map( 'sanitize_html_class', $filtered ) ) ) );
            $output .= '<li' . ( $class_str ? ' class="' . esc_attr( $class_str ) . '"' : '' ) . '>';
            $output .= '<a href="' . $url . '">' . $lb . $title . $la . '</a>';
        } else {
            $output .= '<li>';
            $output .= '<a href="' . $url . '">' . $lb . $title . $la . '</a>';
        }
    }

    public function end_el( &$output, $item, $depth = 0, $args = null ) {
        $output .= '</li>';
    }
}
endif;

// ── Mobile Mega Menu Walker ────────────────────────────────────────────────────
if ( ! class_exists( 'Bluu_Mobile_Menu_Walker' ) ) :
class Bluu_Mobile_Menu_Walker extends Walker_Nav_Menu {

    private $industries_injected = false;

    public function start_lvl( &$output, $depth = 0, $args = null ) {
        if ( $this->industries_injected && $depth === 0 ) {
            $output .= '<div style="display:none" aria-hidden="true"><ul>';
        } elseif ( 0 === $depth ) {
            $output .= '<ul class="mobile-mega-list">';
        } else {
            $output .= '<ul class="sub-menu">';
        }
    }

    public function end_lvl( &$output, $depth = 0, $args = null ) {
        if ( $this->industries_injected && $depth === 0 ) {
            $output .= '</ul></div>';
            $this->industries_injected = false;
        } else {
            $output .= '</ul>';
        }
    }

    public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
        if ( $this->industries_injected && $depth > 0 ) {
            $output .= '<li>';
            return;
        }

        $classes      = empty( $item->classes ) ? array() : (array) $item->classes;
        $has_children = in_array( 'menu-item-has-children', $classes );
        $url          = ! empty( $item->url ) ? esc_url( $item->url ) : '#';
        $title        = apply_filters( 'nav_menu_item_title', $item->title, $item, $args, $depth );
        $lb           = isset( $args->link_before ) ? $args->link_before : '';
        $la           = isset( $args->link_after )  ? $args->link_after  : '';

        if ( $depth === 0 && $has_children && false !== strpos( $item->url, 'industries' ) ) {
            $label = esc_attr__( 'Expand Industries submenu', 'bluu-interactive' );
            $output .= '<li class="has-mega has-mega--industries">';
            $output .= '<div class="mobile-mega-header">';
            $output .= '<a href="' . $url . '">' . $lb . $title . $la . '</a>';
            $output .= '<button class="mobile-mega-btn" aria-expanded="false" aria-label="' . $label . '">' . bluu_mega_chevron() . '</button>';
            $output .= '</div>';
            $output .= bluu_industries_mobile_accordion();
            $this->industries_injected = true;
        } elseif ( $depth === 0 && $has_children ) {
            $label = sprintf( esc_attr__( 'Expand %s submenu', 'bluu-interactive' ), $item->title );
            $filtered   = array_diff( $classes, array( 'menu-item-has-children' ) );
            $filtered[] = 'has-mega';
            $class_str  = trim( implode( ' ', array_filter( array_map( 'sanitize_html_class', $filtered ) ) ) );
            $output .= '<li class="' . esc_attr( $class_str ) . '">';
            $output .= '<div class="mobile-mega-header">';
            $output .= '<a href="' . $url . '">' . $lb . $title . $la . '</a>';
            $output .= '<button class="mobile-mega-btn" aria-expanded="false" aria-label="' . $label . '">' . bluu_mega_chevron() . '</button>';
            $output .= '</div>';
        } elseif ( $depth === 0 ) {
            $output .= '<li>';
            $output .= '<a href="' . $url . '">' . $lb . $title . $la . '</a>';
        } else {
            $output .= '<li>';
            $output .= '<a href="' . $url . '">' . $lb . $title . $la . '</a>';
        }
    }

    public function end_el( &$output, $item, $depth = 0, $args = null ) {
        $output .= '</li>';
    }
}
endif;

// ── Industries mega panel data ────────────────────────────────────────────────
function bluu_industries_data() {
    return array(
        array(
            'key'  => 'tech-saas',
            'name' => 'Tech &amp; SaaS',
            'url'  => '/industries/tech-saas',
            'subs' => array(
                array( 'Seed to Series A',         '/industries/tech-saas/seed-series-a' ),
                array( 'B2B SaaS growth teams',    '/industries/tech-saas/b2b-saas-growth' ),
                array( 'No-code &amp; AI startups','/industries/tech-saas/no-code-ai-startups' ),
                array( 'Developer tools',          '/industries/tech-saas/developer-tools' ),
            ),
            'ucs' => array(
                array( 'Competitor Intelligence', '/industries/tech-saas/competitor-intelligence' ),
                array( 'Founder Brand',           '/industries/tech-saas/founder-brand' ),
                array( 'Content Repurposing',     '/industries/tech-saas/content-repurposing' ),
                array( 'Product Launch Content',  '/industries/tech-saas/product-launch-content' ),
            ),
        ),
        array(
            'key'  => 'agencies-consultants',
            'name' => 'Agencies &amp; Consultants',
            'url'  => '/industries/agencies-consultants',
            'subs' => array(
                array( 'Marketing Consultants',     '/industries/agencies-consultants/marketing-consultants' ),
                array( 'Branding &amp; Design',     '/industries/agencies-consultants/branding-design-studios' ),
                array( 'PR &amp; Communications',   '/industries/agencies-consultants/pr-communications' ),
                array( 'Strategy Consultants',      '/industries/agencies-consultants/strategy-consultants' ),
                array( 'Recruitment Consultants',   '/industries/agencies-consultants/recruitment-consultants' ),
                array( 'Business Coaches',          '/industries/agencies-consultants/business-coaches' ),
                array( 'Paid Media Agencies',       '/industries/agencies-consultants/paid-media-agencies' ),
                array( 'Full-service Agencies',     '/industries/agencies-consultants/full-service-agencies' ),
            ),
            'ucs' => array(
                array( 'Own-brand Content',      '/industries/agencies-consultants/own-brand-content' ),
                array( 'Thought Leadership',     '/industries/agencies-consultants/thought-leadership' ),
                array( 'White-label Production', '/industries/agencies-consultants/white-label-production' ),
                array( 'Service Launch',         '/industries/agencies-consultants/service-launch' ),
            ),
        ),
        array(
            'key'  => 'ecommerce-dtc',
            'name' => 'E-commerce &amp; DTC',
            'url'  => '/industries/ecommerce-dtc',
            'subs' => array(
                array( 'Emerging DTC brands',          '/industries/ecommerce-dtc/emerging-dtc-brands' ),
                array( 'Subscription &amp; lifestyle', '/industries/ecommerce-dtc/subscription-lifestyle' ),
                array( 'Marketplaces &amp; platforms', '/industries/ecommerce-dtc/marketplaces-platforms' ),
            ),
            'ucs' => array(
                array( 'Brand Storytelling',   '/industries/ecommerce-dtc/brand-storytelling' ),
                array( 'Product Content',      '/industries/ecommerce-dtc/product-content' ),
                array( 'Email &amp; Newsletter','/industries/ecommerce-dtc/email-newsletter' ),
                array( 'Market Intelligence',  '/industries/ecommerce-dtc/market-intelligence' ),
            ),
        ),
        array(
            'key'  => 'professional-services',
            'name' => 'Professional Services',
            'url'  => '/industries/professional-services',
            'subs' => array(
                array( 'Financial Advisors',       '/industries/professional-services/financial-advisors' ),
                array( 'Boutique Law Firms',       '/industries/professional-services/boutique-law-firms' ),
                array( 'Management Consultancies', '/industries/professional-services/management-consultancies' ),
            ),
            'ucs' => array(
                array( 'Expert Commentary',     '/industries/professional-services/expert-commentary' ),
                array( 'Client Education',      '/industries/professional-services/client-education' ),
                array( 'Referral &amp; Trust',  '/industries/professional-services/referral-trust-content' ),
                array( 'LinkedIn Authority',    '/industries/professional-services/linkedin-authority' ),
            ),
        ),
    );
}

// ── Desktop industries mega panel HTML ────────────────────────────────────────
function bluu_industries_mega_panel() {
    $industries = bluu_industries_data();

    // Left sidebar buttons
    $left = '<nav class="mega-ind-left" aria-label="Industries">';
    $first = true;
    foreach ( $industries as $ind ) {
        $key    = $ind['key'];
        $active = $first ? ' is-active' : '';
        $left  .= '<button class="mega-ind-btn' . $active . '" data-panel="' . esc_attr( $key ) . '" type="button">';
        $left  .= '<span>' . $ind['name'] . '</span>';
        $left  .= '</button>';
        $first  = false;
    }
    $left .= '</nav>';

    // Right panels
    $panels = '<div class="mega-ind-panels">';
    $first  = true;
    foreach ( $industries as $ind ) {
        $key    = $ind['key'];
        $active = $first ? ' is-active' : '';
        $panels .= '<div class="mega-ind-panel' . $active . '" id="mega-ind-panel-' . esc_attr( $key ) . '">';

        if ( ! empty( $ind['subs'] ) ) {
            $panels .= '<p class="mega-ind-section-label">Sub-industries</p><div class="mega-chip-grid">';
            foreach ( $ind['subs'] as $s ) {
                $panels .= '<a href="' . esc_url( home_url( $s[1] ) ) . '" class="mega-chip">' . $s[0] . '</a>';
            }
            $panels .= '</div>';
        }

        if ( ! empty( $ind['ucs'] ) ) {
            $panels .= '<p class="mega-ind-section-label mega-ind-section-label--uc">Use cases</p><div class="mega-use-grid">';
            foreach ( $ind['ucs'] as $u ) {
                $panels .= '<a href="' . esc_url( home_url( $u[1] ) ) . '" class="mega-use-card">';
                $panels .= '<span>' . $u[0] . '</span>';
                $panels .= '</a>';
            }
            $panels .= '</div>';
        }

        $panels .= '</div>';
        $first   = false;
    }
    $panels .= '</div>';

    $left_col = '<div class="mega-ind-left-col">' . $left
        . '<a href="' . esc_url( home_url( '/industries' ) ) . '" class="mega-ind-all-link">View all industries →</a>'
        . '</div>';

    return '<div class="mega-panel mega-panel--left-nav"><div class="mega-panel__inner"><div class="mega-ind-wrap">'
        . $left_col . $panels
        . '</div></div></div>';
}

// ── Mobile industries accordion HTML ──────────────────────────────────────────
function bluu_industries_mobile_accordion() {
    $html = '<ul class="mobile-mega-list mobile-mega-list--industries">';
    foreach ( bluu_industries_data() as $ind ) {
        $html .= '<li class="mobile-ind-group">';
        $html .= '<div class="mobile-ind-group__header">';
        $html .= '<a href="' . esc_url( home_url( $ind['url'] ) ) . '" class="mobile-ind-group__name">' . $ind['name'] . '</a>';
        $html .= '<button class="mobile-ind-toggle" aria-expanded="false">' . bluu_mega_chevron() . '</button>';
        $html .= '</div>';
        $html .= '<div class="mobile-ind-group__body">';
        if ( ! empty( $ind['subs'] ) ) {
            $html .= '<div class="mobile-ind-section"><span class="mobile-ind-section__label">Sub-industries</span><div class="mobile-pill-grid">';
            foreach ( $ind['subs'] as $s ) {
                $html .= '<a href="' . esc_url( home_url( $s[1] ) ) . '" class="mobile-pill">' . $s[0] . '</a>';
            }
            $html .= '</div></div>';
        }
        if ( ! empty( $ind['ucs'] ) ) {
            $html .= '<div class="mobile-ind-section mobile-ind-section--uc"><span class="mobile-ind-section__label">Use cases</span><div class="mobile-pill-grid">';
            foreach ( $ind['ucs'] as $u ) {
                $html .= '<a href="' . esc_url( home_url( $u[1] ) ) . '" class="mobile-pill mobile-pill--uc">' . $u[0] . '</a>';
            }
            $html .= '</div></div>';
        }
        $html .= '</div></li>';
    }
    $html .= '</ul>';
    return $html;
}

// ── Admin Enqueue ──────────────────────────────────────────────────────────────
function bluu_admin_assets( $hook ) {
    if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
        return;
    }
    wp_enqueue_style(
        'bluu-admin-css',
        get_template_directory_uri() . '/assets/css/admin.css',
        array(),
        wp_get_theme()->get( 'Version' )
    );
}
add_action( 'admin_enqueue_scripts', 'bluu_admin_assets' );

// ── Blog Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns estimated reading time string, e.g. "4 min read".
 */
function bluu_reading_time( $post_id = null ) {
    if ( ! $post_id ) { $post_id = get_the_ID(); }
    $content    = get_post_field( 'post_content', $post_id );
    $word_count = str_word_count( strip_tags( $content ) );
    $minutes    = max( 1, (int) ceil( $word_count / 200 ) );
    return $minutes . ' min read';
}

/**
 * Returns a CSS class string mapping a post's primary category to a colour token.
 */
function bluu_get_cat_class( $post_id = null ) {
    if ( ! $post_id ) { $post_id = get_the_ID(); }
    $cat = get_the_category( $post_id );
    if ( empty( $cat ) ) { return 'bluu-cat-default'; }
    $map = array(
        'content-strategy'   => 'bluu-cat-content-strategy',
        'competitor-intel'   => 'bluu-cat-competitor-intel',
        'thought-leadership' => 'bluu-cat-thought-leadership',
        'industry'           => 'bluu-cat-industry',
        'bluu-pov'           => 'bluu-cat-bluu-pov',
    );
    return isset( $map[ $cat[0]->slug ] ) ? $map[ $cat[0]->slug ] : 'bluu-cat-default';
}

/**
 * Default OG image used when no featured image and no SEO plugin is active.
 * (Place the actual image at /theme/assets/images/bluu-og-default.jpg)
 */
define( 'BLUU_DEFAULT_OG_IMAGE', get_template_directory_uri() . '/assets/images/bluu-og-default.jpg' );

// ── FAQ Helper: Default Categories & Content ───────────────────────────────────
function bluu_default_faq_categories() {
    return array(
        array(
            'category_name'        => 'General',
            'category_description' => 'What Bluu Interactive is and how we work.',
            'category_icon'        => 'info',
            'faq_items'            => array(
                array(
                    'question' => 'What exactly is Bluu Interactive?',
                    'answer'   => "Bluu Interactive is a unified digital growth agency. We replace the fragmented vendor model — where you manage a separate web developer, SEO agency, and sales content team — with one synchronized engine.\n\nOur three pillars work together: we manage your web infrastructure (The Hub), create SME-verified authority content to drive traffic (The Traffic), and produce case studies and sales assets that help your team close (The Conversion). One team, one strategy, one monthly subscription.",
                ),
                array(
                    'question' => 'How is Bluu Interactive different from a traditional agency?',
                    'answer'   => "Traditional agencies sell isolated deliverables — an SEO agency optimizes for rankings without knowing your sales objections; a web developer optimizes for uptime without understanding your conversion path. The outputs never talk to each other.\n\nBluu Interactive is the Anti-Agency. We don't sell deliverables; we sell total funnel alignment. Every piece of content we produce is informed by your sales team's real objections. Every web decision we make is informed by what's actually converting. Everything is connected.",
                ),
                array(
                    'question' => 'Do you work with startups or early-stage companies?',
                    'answer'   => "Our model is optimized for companies with $2M–$50M ARR that have an active sales team and a marketing budget, but lack a cohesive in-house digital team.\n\nIf you're pre-revenue or very early stage, our retainer tiers may not yet be the right fit. However, we do offer a standalone 'Wedge' engagement — a premium Case Study suite — that's a great low-risk starting point for any stage. Reach out and we'll be honest about whether we're the right match.",
                ),
                array(
                    'question' => 'Do you work with companies outside the US?',
                    'answer'   => "Yes. Bluu Interactive is remote-first and serves high-growth businesses across North America. For Enterprise-tier clients, we can discuss arrangements for other English-speaking markets on a case-by-case basis.",
                ),
            ),
        ),
        array(
            'category_name'        => 'Pricing & Packages',
            'category_description' => 'Costs, tiers, and how our subscription model works.',
            'category_icon'        => 'pricing',
            'faq_items'            => array(
                array(
                    'question' => 'How much does Bluu Interactive cost?',
                    'answer'   => "We offer three subscription tiers:\n\n• **Growth Engine** — $3,000–$4,500/month: Managed WordPress Hub + 2 SME-verified articles/month + 1 Case Study suite per quarter.\n• **Scale Engine** — $6,000–$8,500/month: Everything in Growth + 4 articles/month + 1 Case Study per month + VIP technical support.\n• **Enterprise** — $12,000+/month: Custom infrastructure integrations, high-volume content, multiple case studies, and dedicated strategic consulting.\n\nAll tiers are month-to-month after an initial 3-month onboarding period.",
                ),
                array(
                    'question' => 'Do you offer one-off projects?',
                    'answer'   => "We don't typically sell isolated deliverables — our model only creates real results when strategy, content, and infrastructure are fully aligned over time.\n\nThat said, we do offer a 'Wedge' engagement: a premium Case Study suite (PDF, one-pager, and social assets) for a flat $850. It's designed as a low-risk first engagement that demonstrates the quality of our work. Many retainer clients start here.",
                ),
                array(
                    'question' => 'Is there a minimum contract length?',
                    'answer'   => "There's a 3-month onboarding period during which we build your Hub infrastructure, establish your content strategy, and complete your first Case Study. After that, the engagement is month-to-month with 30 days written notice to cancel.\n\nWe don't believe in locking clients into long contracts. Our retention strategy is results.",
                ),
                array(
                    'question' => 'Can I upgrade or downgrade my plan?',
                    'answer'   => "Yes. You can upgrade at any time — upgrades take effect the following billing cycle. Downgrades require 30 days notice and take effect the cycle after that. We'll always tell you honestly if we think a different tier is a better fit for your current stage.",
                ),
                array(
                    'question' => 'What does the onboarding process look like?',
                    'answer'   => "After a Discovery Call and signed agreement, onboarding begins within 5 business days and runs for approximately 30 days:\n\n1. **Discovery & Audit** — We audit your existing web infrastructure, content, and sales materials.\n2. **Strategy Alignment** — We interview your sales team to map their real objections and your top-converting customer profiles.\n3. **Engine Launch** — We stand up your managed Hub, begin your first content brief, and schedule your first case study interview.\n\nMost clients see their first deliverables within 3–4 weeks of signing.",
                ),
            ),
        ),
        array(
            'category_name'        => 'Content & SMEs',
            'category_description' => 'How our content is created and why it\'s different.',
            'category_icon'        => 'content',
            'faq_items'            => array(
                array(
                    'question' => 'What is SME-verified content and why does it matter?',
                    'answer'   => "SME stands for Subject Matter Expert. Every article we produce is researched and drafted by our team, then reviewed, edited, and fact-checked by a vetted expert in your industry — a freelance nurse for healthcare content, a practicing attorney for legal content, a credentialed engineer for technical SaaS content, and so on.\n\nThis matters for two reasons:\n\n1. **Compliance** — In regulated industries, a factual error isn't just embarrassing; it's a liability. SME verification means zero hallucinations and zero generic advice.\n2. **E-E-A-T** — Google rewards content that demonstrates real Experience, Expertise, Authoritativeness, and Trustworthiness. SME-verified content is the only way to genuinely earn this in a competitive, high-stakes niche.",
                ),
                array(
                    'question' => 'Do you use AI to write content?',
                    'answer'   => "We use AI as a research and formatting accelerator internally, but every piece of content that leaves our studio has been written, shaped, and verified by human experts. We never publish AI-generated drafts as final deliverables.\n\nFor our clients in Healthcare, Legal, and Finance, this is non-negotiable — generic AI content poses real compliance and brand risks. Our model is built on the exact opposite: human expertise at scale.",
                ),
                array(
                    'question' => 'How fast can you produce a case study?',
                    'answer'   => "Our zero-friction interview process is designed for busy clients and their customers. Here's the timeline:\n\n• **Day 1** — We schedule and conduct a 15-minute structured interview with your client (we handle all scheduling).\n• **Day 2** — Our team drafts the full Case Study suite from the interview transcript.\n• **Day 3** — Review round and revisions.\n• **Day 4** — Final delivery of PDF, one-pager, and social assets.\n\nFull turnaround: 48–72 hours from interview to delivery.",
                ),
                array(
                    'question' => 'What if our clients don\'t want to be interviewed?',
                    'answer'   => "We've refined our outreach approach specifically for this. We position the interview as a 15-minute recognition opportunity for your client — not a sales exercise. Our interviewers are trained to make the conversation feel natural and low-effort.\n\nIf a client declines, we can also build strong case studies from existing data: support tickets, review platforms, internal metrics, and sales call notes. A live interview produces the best result, but it's not always required.",
                ),
                array(
                    'question' => 'How many articles do we get per month?',
                    'answer'   => "Growth Engine includes 2 SME-verified articles per month. Scale Engine includes 4. Enterprise is fully custom and typically includes 6–10+ pieces per month depending on your strategy.\n\nEvery article is long-form, technically accurate, and written to capture high-intent search traffic — not filler content to hit a word count.",
                ),
            ),
        ),
        array(
            'category_name'        => 'Infrastructure & Tech',
            'category_description' => 'How we manage your web infrastructure.',
            'category_icon'        => 'tech',
            'faq_items'            => array(
                array(
                    'question' => 'What does "Managed WordPress Infrastructure" mean?',
                    'answer'   => "It means you never have to think about your website again. We handle:\n\n• **Hosting & performance** — enterprise-grade hosting with uptime monitoring, CDN configuration, and Core Web Vitals optimization.\n• **Security** — automated backups, malware scanning, SSL management, and firewall rules.\n• **Updates** — WordPress core, plugin, and theme updates tested in staging before being pushed live.\n• **ADA compliance** — ongoing WCAG 2.1 AA audit and remediation so you're protected from accessibility lawsuits.\n• **Plugin management** — zero-conflict updates with a tested update cadence. No more white screens of death.\n\nYou get a dedicated technical team for a fraction of the cost of hiring one.",
                ),
                array(
                    'question' => 'Do we need to switch hosting providers?',
                    'answer'   => "In most cases, yes. Our managed infrastructure model requires hosting on our vetted, enterprise-grade infrastructure to guarantee our SLAs around performance, security, and uptime. We handle the migration completely — it's zero-effort on your end and your site will experience zero downtime during the move.",
                ),
                array(
                    'question' => 'What is ADA compliance and why does it matter?',
                    'answer'   => "ADA (Americans with Disabilities Act) compliance for websites refers to meeting WCAG 2.1 AA accessibility standards — things like proper color contrast, keyboard navigation, screen reader compatibility, and alt text on all images.\n\nBeyond being the right thing to do, it's a legal requirement for many businesses and a growing source of litigation. Healthcare and Legal clients in particular face significant exposure. We run quarterly compliance audits and remediate any issues as part of your Hub subscription.",
                ),
                array(
                    'question' => 'What happens if our site goes down?',
                    'answer'   => "Scale Engine and Enterprise clients get VIP technical support with a 4-hour response SLA for critical issues and 24-hour for non-critical. Growth Engine clients get standard support with a next-business-day response SLA.\n\nWe monitor your site 24/7 with automated alerts, so in most cases we're aware of an issue before you are.",
                ),
            ),
        ),
        array(
            'category_name'        => 'Getting Started',
            'category_description' => 'How to begin working with Bluu Interactive.',
            'category_icon'        => 'start',
            'faq_items'            => array(
                array(
                    'question' => 'How do we get started?',
                    'answer'   => "The first step is a Discovery Call — a 30-minute, no-pressure conversation where we learn about your business, your current vendor setup, and your growth goals. If we're a good fit, we'll follow up with a custom proposal within 48 hours.\n\nYou can book directly from our Contact page.",
                ),
                array(
                    'question' => 'What do we need to provide to get started?',
                    'answer'   => "Not much. We come in as a team and do the heavy lifting. To get started we'll need:\n\n• Access to your current website's hosting and WordPress admin\n• Access to your Google Analytics and Search Console (we can set these up if needed)\n• 30 minutes with someone from your sales team for a strategy alignment call\n• A short list of your 3–5 happiest customers for the first case study outreach\n\nThat's it. We handle everything from there.",
                ),
                array(
                    'question' => 'Can you integrate with our existing CRM or sales tools?',
                    'answer'   => "Yes. On Scale Engine and Enterprise plans, we build integrations between your website and tools like HubSpot, Salesforce, Pipedrive, and others. This typically covers lead capture forms, pipeline tracking from organic traffic, and content performance dashboards synced to your CRM.\n\nGrowth Engine clients can add CRM integration as an à la carte service.",
                ),
                array(
                    'question' => 'We already have an SEO agency. Can Bluu work alongside them?',
                    'answer'   => "We can, but it's worth having an honest conversation about whether that makes sense. Our model's power comes from alignment — when content strategy, web infrastructure, and sales assets are unified under one roof.\n\nIf you keep a separate SEO agency, you risk recreating the same fragmentation problem we're designed to solve. Most clients find that the transition to Bluu fully replaces their existing SEO retainer at a comparable or lower cost, with dramatically better coordination.",
                ),
            ),
        ),
    );
}

// ── FAQ Helper: Category Icon SVG ──────────────────────────────────────────────
function bluu_faq_category_icon( $icon ) {
    $icons = array(
        'info'    => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
        'pricing' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
        'content' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
        'tech'    => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
        'start'   => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5,3 19,12 5,21 5,3"/></svg>',
        'default' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>',
    );
    return isset( $icons[ $icon ] ) ? $icons[ $icon ] : $icons['default'];
}

// ── Archive search AJAX handler ────────────────────────────────────────────────
function bluu_archive_search_handler() {
    check_ajax_referer( 'bluu_archive_search', 'nonce' );

    $q = isset( $_POST['q'] ) ? sanitize_text_field( wp_unslash( $_POST['q'] ) ) : '';
    if ( '' === $q ) {
        wp_send_json_error( array( 'message' => 'Empty query' ) );
    }

    $args = array(
        'post_type'           => 'post',
        'post_status'         => 'publish',
        'posts_per_page'      => 24,
        'no_found_rows'       => false,
        'ignore_sticky_posts' => true,
        's'                   => $q,
        'orderby'             => 'relevance',
    );

    $query = new WP_Query( $args );
    $posts = array();

    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            $pid      = get_the_ID();
            $thumb_id = get_post_thumbnail_id( $pid );
            $cats     = get_the_category( $pid );
            $posts[]  = array(
                'url'       => get_permalink( $pid ),
                'title'     => get_the_title( $pid ),
                'excerpt'   => wp_trim_words( get_the_excerpt(), 18, '…' ),
                'date'      => get_the_date( 'j M Y', $pid ),
                'thumb'     => $thumb_id ? ( wp_get_attachment_image_url( $thumb_id, 'bluu-card' ) ?: wp_get_attachment_image_url( $thumb_id, 'large' ) ?: wp_get_attachment_image_url( $thumb_id, 'full' ) ) : '',
                'cat'       => $cats ? $cats[0]->name : '',
                'read_time' => function_exists( 'bluu_reading_time' ) ? bluu_reading_time( $pid ) : '',
            );
        }
        wp_reset_postdata();
    }

    wp_send_json_success( array(
        'posts' => $posts,
        'total' => (int) $query->found_posts,
    ) );
}
add_action( 'wp_ajax_bluu_archive_search',        'bluu_archive_search_handler' );
add_action( 'wp_ajax_nopriv_bluu_archive_search', 'bluu_archive_search_handler' );

// ── Include Files ──────────────────────────────────────────────────────────────
require_once get_template_directory() . '/inc/acf-fields.php';
require_once get_template_directory() . '/inc/customizer.php';
require_once get_template_directory() . '/inc/contact-submissions.php';
if ( is_admin() ) {
    require_once get_template_directory() . '/inc/seeder-tool.php';
}
