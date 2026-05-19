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
    $version = wp_get_theme()->get( 'Version' );

    // Google Fonts – Roboto
    wp_enqueue_style(
        'bluu-google-fonts',
        'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
        array(),
        null
    );

    // Main stylesheet
    wp_enqueue_style(
        'bluu-main-css',
        get_template_directory_uri() . '/assets/css/main.css',
        array( 'bluu-google-fonts' ),
        $version
    );

    // Main JavaScript
    wp_enqueue_script(
        'bluu-main-js',
        get_template_directory_uri() . '/assets/js/main.js',
        array(),
        $version,
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
}
add_action( 'wp_enqueue_scripts', 'bluu_enqueue_assets' );

// ── Preconnect for Google Fonts ────────────────────────────────────────────────
function bluu_preconnect_fonts() {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}
add_action( 'wp_head', 'bluu_preconnect_fonts', 1 );

// ── Contact Form AJAX Handler ──────────────────────────────────────────────────
function bluu_handle_contact_form() {
    // Verify nonce
    if ( ! check_ajax_referer( 'bluu_contact_nonce', 'nonce', false ) ) {
        wp_send_json_error( array( 'message' => esc_html__( 'Security check failed.', 'bluu-interactive' ) ), 403 );
        return;
    }

    // Honeypot check
    if ( ! empty( $_POST['website'] ) ) {
        wp_send_json_success( array( 'message' => esc_html__( 'Message sent!', 'bluu-interactive' ) ) );
        return;
    }

    // Sanitize inputs
    $name      = sanitize_text_field( wp_unslash( $_POST['contact_name'] ?? '' ) );
    $company   = sanitize_text_field( wp_unslash( $_POST['contact_company'] ?? '' ) );
    $email     = sanitize_email( wp_unslash( $_POST['contact_email'] ?? '' ) );
    $phone     = sanitize_text_field( wp_unslash( $_POST['contact_phone'] ?? '' ) );
    $situation = sanitize_textarea_field( wp_unslash( $_POST['contact_situation'] ?? '' ) );

    // Validate required fields
    if ( empty( $name ) || empty( $email ) || empty( $situation ) ) {
        wp_send_json_error( array( 'message' => esc_html__( 'Please fill in all required fields.', 'bluu-interactive' ) ), 400 );
        return;
    }

    if ( ! is_email( $email ) ) {
        wp_send_json_error( array( 'message' => esc_html__( 'Please enter a valid email address.', 'bluu-interactive' ) ), 400 );
        return;
    }

    // Build email
    $to      = get_field( 'contact_email', 'option' ) ?: 'hello@bluuhq.com';
    $subject = sprintf( '[Bluu Interactive] New inquiry from %s at %s', $name, $company );

    $body  = "New contact form submission from bluuhq.com\n\n";
    $body .= "Name:    {$name}\n";
    $body .= "Company: {$company}\n";
    $body .= "Email:   {$email}\n";
    $body .= "Phone:   {$phone}\n\n";
    $body .= "Situation:\n{$situation}\n";

    $headers = array(
        'Content-Type: text/plain; charset=UTF-8',
        "Reply-To: {$name} <{$email}>",
    );

    $sent = wp_mail( $to, $subject, $body, $headers );

    if ( $sent ) {
        wp_send_json_success( array( 'message' => esc_html__( 'Message sent! We\'ll be in touch within 1 business day.', 'bluu-interactive' ) ) );
    } else {
        wp_send_json_error( array( 'message' => esc_html__( 'Could not send email. Please contact us directly at hello@bluuhq.com', 'bluu-interactive' ) ), 500 );
    }
}
add_action( 'wp_ajax_bluu_contact',        'bluu_handle_contact_form' );
add_action( 'wp_ajax_nopriv_bluu_contact', 'bluu_handle_contact_form' );

// ── Custom Excerpt Length ──────────────────────────────────────────────────────
function bluu_excerpt_length( $length ) {
    return 25;
}
add_filter( 'excerpt_length', 'bluu_excerpt_length' );

function bluu_excerpt_more( $more ) {
    return '&hellip;';
}
add_filter( 'excerpt_more', 'bluu_excerpt_more' );

// ── Google Analytics ───────────────────────────────────────────────────────────
function bluu_google_analytics() {
    $ga_id = get_theme_mod( 'bluu_ga_id', '' );
    if ( empty( $ga_id ) ) {
        return;
    }
    $ga_id = esc_attr( $ga_id );
    ?>
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo $ga_id; ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '<?php echo $ga_id; ?>');
    </script>
    <?php
}
add_action( 'wp_head', 'bluu_google_analytics', 99 );

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

// ── Include Files ──────────────────────────────────────────────────────────────
require_once get_template_directory() . '/inc/acf-fields.php';
require_once get_template_directory() . '/inc/customizer.php';
