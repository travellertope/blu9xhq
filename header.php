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

<header class="site-header" id="site-header" role="banner">
    <div class="site-header__inner container">

        <!-- Logo -->
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-header__logo" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> – <?php esc_attr_e( 'Home', 'bluu-interactive' ); ?>">
            <?php if ( has_custom_logo() ) : ?>
                <?php the_custom_logo(); ?>
            <?php else : ?>
                <span class="site-header__logo-text">
                    <span class="site-header__logo-name">bluu</span><span class="site-header__logo-dot" aria-hidden="true">.</span><span class="site-header__logo-name">interactive</span>
                </span>
            <?php endif; ?>
        </a>

        <!-- Primary Navigation -->
        <nav class="site-header__nav" id="primary-nav" role="navigation" aria-label="<?php esc_attr_e( 'Primary Navigation', 'bluu-interactive' ); ?>">
            <?php
            wp_nav_menu( array(
                'theme_location' => 'primary',
                'menu_class'     => 'site-header__menu',
                'container'      => false,
                'fallback_cb'    => 'bluu_fallback_nav',
            ) );
            ?>
        </nav>

        <!-- CTA Button -->
        <div class="site-header__cta">
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary btn-primary--small">
                <?php esc_html_e( 'Book a Call', 'bluu-interactive' ); ?>
            </a>
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
            'theme_location' => 'primary',
            'menu_class'     => 'mobile-nav__menu',
            'container'      => false,
            'fallback_cb'    => 'bluu_fallback_mobile_nav',
        ) );
        ?>
        <div class="mobile-nav__cta">
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary" style="width:100%;justify-content:center;">
                <?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?>
            </a>
        </div>
    </div>
</nav>

<main id="main-content" class="site-main" role="main">

<?php
/**
 * Fallback nav for primary menu.
 */
function bluu_fallback_nav() {
    echo '<ul class="site-header__menu">';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/pricing' ) ) . '">' . esc_html__( 'Pricing', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/industries' ) ) . '">' . esc_html__( 'Industries', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/contact' ) ) . '">' . esc_html__( 'Contact', 'bluu-interactive' ) . '</a></li>';
    echo '</ul>';
}

/**
 * Fallback nav for mobile menu.
 */
function bluu_fallback_mobile_nav() {
    echo '<ul class="mobile-nav__menu">';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/pricing' ) ) . '">' . esc_html__( 'Pricing', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/industries' ) ) . '">' . esc_html__( 'Industries', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/contact' ) ) . '">' . esc_html__( 'Contact', 'bluu-interactive' ) . '</a></li>';
    echo '</ul>';
}
