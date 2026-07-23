<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<a class="skip-link screen-reader-text" href="#main-content">
    <?php esc_html_e( 'Skip to main content', 'bluu-interactive' ); ?>
</a>

<?php
// A page belonging to one of the dedicated product pages (or a child page
// nested under one) gets that product's own logo and nav menu instead of the
// site-wide ones — see bluu_get_product_context() in functions.php.
$bluu_product_context = bluu_get_product_context();
$bluu_product          = $bluu_product_context ? bluu_product_registry()[ $bluu_product_context ] : null;
$bluu_product_logo_id  = $bluu_product ? get_theme_mod( $bluu_product['logo_mod'] ) : 0;
$bluu_header_menu_location = ( $bluu_product && has_nav_menu( $bluu_product['menu_header'] ) )
    ? $bluu_product['menu_header']
    : 'primary';
?>

<header class="site-header" id="site-header" role="banner">
    <div class="site-header__inner container">

        <!-- Logo -->
        <a href="<?php echo esc_url( $bluu_product ? home_url( '/' . $bluu_product_context ) : home_url( '/' ) ); ?>" class="site-header__logo" aria-label="<?php echo esc_attr( $bluu_product ? $bluu_product['label'] : get_bloginfo( 'name' ) ); ?> – <?php esc_attr_e( 'Home', 'bluu-interactive' ); ?>">
            <?php if ( $bluu_product_logo_id ) : ?>
                <img src="<?php echo esc_url( wp_get_attachment_image_url( $bluu_product_logo_id, 'full' ) ); ?>" alt="<?php echo esc_attr( $bluu_product['label'] ); ?>" class="custom-logo">
            <?php elseif ( $bluu_product ) : ?>
                <svg class="site-header__logo-mark" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                    <path d="M13 1L24 7.5V18.5L13 25L2 18.5V7.5L13 1Z" stroke="#2F5FE0" stroke-width="1.8"/>
                    <circle cx="13" cy="13" r="4.5" fill="#2F5FE0"/>
                </svg>
                <span class="site-header__logo-text">
                    <?php echo esc_html( get_theme_mod( $bluu_product['wordmark_mod'], $bluu_product['label'] ) ); ?>
                </span>
            <?php elseif ( has_custom_logo() ) : ?>
                <?php
                $custom_logo_id  = get_theme_mod( 'custom_logo' );
                $custom_logo_url = wp_get_attachment_image_url( $custom_logo_id, 'full' );
                ?>
                <img src="<?php echo esc_url( $custom_logo_url ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" class="custom-logo">
            <?php else : ?>
                <svg class="site-header__logo-mark" width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
                    <path d="M13 1L24 7.5V18.5L13 25L2 18.5V7.5L13 1Z" stroke="#2F5FE0" stroke-width="1.8"/>
                    <circle cx="13" cy="13" r="4.5" fill="#2F5FE0"/>
                </svg>
                <span class="site-header__logo-text">
                    <span class="site-header__logo-name">Bluu</span><span class="site-header__logo-name site-header__logo-name--accent">HQ</span>
                </span>
            <?php endif; ?>
        </a>

        <!-- Primary Navigation -->
        <nav class="site-header__nav" id="primary-nav" role="navigation" aria-label="<?php esc_attr_e( 'Primary Navigation', 'bluu-interactive' ); ?>">
            <?php
            wp_nav_menu( array(
                'theme_location' => $bluu_header_menu_location,
                'menu_class'     => 'site-header__menu',
                'container'      => false,
                'fallback_cb'    => 'bluu_fallback_nav',
                'walker'         => new Bluu_Mega_Menu_Walker(),
            ) );
            ?>
        </nav>

        <!-- CTA Buttons -->
        <div class="site-header__cta">
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-outline btn-outline--small">Let's talk</a>
            <a href="#top" class="btn-primary btn-primary--small">Run free scan</a>
        </div>

        <!-- Mobile Hamburger -->
        <button
            class="site-header__hamburger"
            id="mobile-menu-toggle"
            aria-expanded="false"
            aria-controls="primary-nav"
            aria-label="<?php esc_attr_e( 'Toggle mobile menu', 'bluu-interactive' ); ?>"
        >
            <span class="site-header__hamburger-icon" aria-hidden="true">
                <!-- Hamburger lines -->
                <svg class="hamburger-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <!-- Close X -->
                <svg class="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </span>
        </button>

    </div><!-- /.site-header__inner -->
</header><!-- /#site-header -->

<!-- Mobile Navigation Drawer -->
<div class="mobile-nav-overlay" id="mobile-nav-overlay" aria-hidden="true"></div>
<nav class="mobile-nav" id="mobile-nav" aria-label="<?php esc_attr_e( 'Mobile Navigation', 'bluu-interactive' ); ?>" aria-hidden="true">
    <div class="mobile-nav__inner">
        <?php
        wp_nav_menu( array(
            'theme_location' => $bluu_header_menu_location,
            'menu_class'     => 'mobile-nav__menu',
            'container'      => false,
            'fallback_cb'    => 'bluu_fallback_mobile_nav',
            'walker'         => new Bluu_Mobile_Menu_Walker(),
        ) );
        ?>
        <div class="mobile-nav__cta">
            <a href="<?php echo esc_url( get_theme_mod( 'bluu_nav_cta_url', home_url( '/contact' ) ) ); ?>" class="btn-primary" style="width:100%;justify-content:center;">
                <?php echo esc_html( get_theme_mod( 'bluu_nav_cta_text', "Let's talk" ) ); ?>
            </a>
        </div>
    </div>
</nav>

<main id="main-content" class="site-main" role="main">

<?php
/**
 * Fallback desktop nav — Industries left-nav mega menu.
 */
function bluu_fallback_nav() {
    echo '<ul class="site-header__menu">';

    // Home
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';

    // ── Products mega panel ───────────────────────────────────────────────────
    echo '<li class="has-mega has-mega--softwares">';
    echo '<a href="#" class="mega-trigger" aria-haspopup="true" aria-expanded="false">';
    echo esc_html__( 'Products', 'bluu-interactive' ) . bluu_mega_chevron();
    echo '</a>';
    echo bluu_softwares_mega_panel();
    echo '</li>';

    // ── Bluu Studios mega panel ───────────────────────────────────────────────
    echo '<li class="has-mega has-mega--services">';
    echo '<a href="' . esc_url( home_url( '/studios' ) ) . '" class="mega-trigger" aria-haspopup="true" aria-expanded="false">';
    echo esc_html__( 'Bluu Studios', 'bluu-interactive' ) . bluu_mega_chevron();
    echo '</a>';
    echo bluu_services_mega_panel();
    echo '</li>';

    // Insights
    echo '<li><a href="' . esc_url( home_url( '/insights' ) ) . '">' . esc_html__( 'Insights', 'bluu-interactive' ) . '</a></li>';

    echo '</ul>';
}

/**
 * Fallback mobile nav — accordion-style.
 */
function bluu_fallback_mobile_nav() {
    echo '<ul class="mobile-nav__menu">';

    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';

    // Products accordion
    echo '<li class="has-mega has-mega--softwares">';
    echo '<div class="mobile-mega-header">';
    echo '<a href="#">' . esc_html__( 'Products', 'bluu-interactive' ) . '</a>';
    echo '<button class="mobile-mega-btn" aria-expanded="false" aria-label="' . esc_attr__( 'Expand Products submenu', 'bluu-interactive' ) . '">' . bluu_mega_chevron() . '</button>';
    echo '</div>';
    echo bluu_softwares_mobile_list();
    echo '</li>';

    // Bluu Studios accordion
    echo '<li class="has-mega has-mega--services">';
    echo '<div class="mobile-mega-header">';
    echo '<a href="' . esc_url( home_url( '/studios' ) ) . '">' . esc_html__( 'Bluu Studios', 'bluu-interactive' ) . '</a>';
    echo '<button class="mobile-mega-btn" aria-expanded="false" aria-label="' . esc_attr__( 'Expand Bluu Studios submenu', 'bluu-interactive' ) . '">' . bluu_mega_chevron() . '</button>';
    echo '</div>';
    echo bluu_services_mobile_accordion();
    echo '</li>';

    echo '<li><a href="' . esc_url( home_url( '/insights' ) ) . '">' . esc_html__( 'Insights', 'bluu-interactive' ) . '</a></li>';

    echo '</ul>';
}
