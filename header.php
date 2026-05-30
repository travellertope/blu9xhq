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
        <?php if ( has_custom_logo() ) : ?>
            <div class="site-header__logo">
                <?php the_custom_logo(); ?>
            </div>
        <?php else : ?>
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-header__logo" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> – <?php esc_attr_e( 'Home', 'bluu-interactive' ); ?>">
                <span class="site-header__logo-text">
                    <span class="site-header__logo-name">Bluu</span> <span class="site-header__logo-name site-header__logo-name--accent">Interactive</span>
                </span>
            </a>
        <?php endif; ?>

        <!-- Primary Navigation -->
        <nav class="site-header__nav" id="primary-nav" role="navigation" aria-label="<?php esc_attr_e( 'Primary Navigation', 'bluu-interactive' ); ?>">
            <?php
            wp_nav_menu( array(
                'theme_location' => 'primary',
                'menu_class'     => 'site-header__menu',
                'container'      => false,
                'fallback_cb'    => 'bluu_fallback_nav',
                'walker'         => new Bluu_Mega_Menu_Walker(),
            ) );
            ?>
        </nav>

        <!-- CTA Button -->
        <div class="site-header__cta">
            <?php
            $cta_text = get_theme_mod( 'bluu_nav_cta_text', 'Book a Call' );
            $cta_url  = get_theme_mod( 'bluu_nav_cta_url',  home_url( '/contact' ) );
            ?>
            <a href="<?php echo esc_url( $cta_url ); ?>" class="btn-primary btn-primary--small">
                <?php echo esc_html( $cta_text ); ?>
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
            'walker'         => new Bluu_Mobile_Menu_Walker(),
        ) );
        ?>
        <div class="mobile-nav__cta">
            <a href="<?php echo esc_url( get_theme_mod( 'bluu_nav_cta_url', home_url( '/contact' ) ) ); ?>" class="btn-primary" style="width:100%;justify-content:center;">
                <?php echo esc_html( get_theme_mod( 'bluu_nav_cta_text', 'Book a Discovery Call' ) ); ?>
            </a>
        </div>
    </div>
</nav>

<main id="main-content" class="site-main" role="main">

<?php
/**
 * Fallback desktop nav — outputs full mega menu structure.
 */
function bluu_fallback_nav() {
    $chevron     = bluu_mega_chevron();
    $contact_url = get_theme_mod( 'bluu_nav_cta_url', home_url( '/contact' ) );
    $cta_text    = get_theme_mod( 'bluu_nav_cta_text', 'Book a Call' );

    echo '<ul class="site-header__menu">';

    // Home
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';

    // ── Services mega panel ───────────────────────────────────────────────────
    echo '<li class="has-mega">';
    echo '<a href="' . esc_url( home_url( '/services' ) ) . '" class="mega-trigger" aria-haspopup="true" aria-expanded="false">' . esc_html__( 'Services', 'bluu-interactive' ) . $chevron . '</a>';
    echo '<div class="mega-panel"><div class="mega-panel__inner"><div class="mega-panel__body">';

    // Column 1 — AI & Automation
    echo '<div class="mega-panel__col"><div class="mega-panel__col-head">' . esc_html__( 'AI & Automation', 'bluu-interactive' ) . '</div><ul class="mega-panel__list">';
    echo bluu_mega_item( home_url( '/services/ai-chatbots' ),          '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',                                                                                                 'AI Chatbots',          'Intelligent 24/7 conversational agents' );
    echo bluu_mega_item( home_url( '/services/workflow-automation' ),  '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/>',                                         'Workflow Automation',  'Streamline and scale your operations' );
    echo bluu_mega_item( home_url( '/services/analytics' ),            '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',                                                    'Smart Analytics',      'Data-driven insights that move the needle' );
    echo '</ul></div>';

    // Column 2 — Web & Digital
    echo '<div class="mega-panel__col"><div class="mega-panel__col-head">' . esc_html__( 'Web & Digital', 'bluu-interactive' ) . '</div><ul class="mega-panel__list">';
    echo bluu_mega_item( home_url( '/services/web-design' ),           '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',                                                                                                  'Web Design & Dev',     'High-performance, conversion-focused sites' );
    echo bluu_mega_item( home_url( '/services/ecommerce' ),            '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>',                                        'E-Commerce Solutions', 'End-to-end digital storefronts that convert' );
    echo bluu_mega_item( home_url( '/services/seo' ),                  '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',                                                                                           'SEO & Performance',    'Top rankings and blazing-fast load times' );
    echo '</ul></div>';

    // Column 3 — Strategy & Growth
    echo '<div class="mega-panel__col"><div class="mega-panel__col-head">' . esc_html__( 'Strategy & Growth', 'bluu-interactive' ) . '</div><ul class="mega-panel__list">';
    echo bluu_mega_item( home_url( '/services/brand' ),                '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>',                                                                                  'Brand & Identity',     'Purposeful design that builds trust' );
    echo bluu_mega_item( home_url( '/services/marketing' ),            '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',                                                                                   'Digital Marketing',    'Campaigns that attract and convert' );
    echo bluu_mega_item( home_url( '/services/cro' ),                  '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',                                                                         'CRO & UX',             'Turn more visitors into paying customers' );
    echo '</ul></div>';

    // Feature panel
    echo '<div class="mega-panel__feature">';
    echo '<span class="mega-panel__feature-badge">' . esc_html__( 'Free', 'bluu-interactive' ) . '</span>';
    echo '<h3 class="mega-panel__feature-title">' . esc_html__( 'Ready to Transform?', 'bluu-interactive' ) . '</h3>';
    echo '<p class="mega-panel__feature-desc">' . esc_html__( 'Book a free discovery call and let\'s map your path to digital growth.', 'bluu-interactive' ) . '</p>';
    echo '<a href="' . esc_url( $contact_url ) . '" class="btn-primary btn-primary--small">' . esc_html( $cta_text ) . '</a>';
    echo '</div>';

    echo '</div></div></div></li>'; // .mega-panel__body / .mega-panel__inner / .mega-panel / </li>

    // ── Industries mega panel ─────────────────────────────────────────────────
    echo '<li class="has-mega">';
    echo '<a href="' . esc_url( home_url( '/industries' ) ) . '" class="mega-trigger" aria-haspopup="true" aria-expanded="false">' . esc_html__( 'Industries', 'bluu-interactive' ) . $chevron . '</a>';
    echo '<div class="mega-panel mega-panel--industries"><div class="mega-panel__inner"><div class="mega-panel__body">';

    $ind_svg = function ( $paths ) {
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $paths . '</svg>';
    };

    echo '<div class="mega-panel__industries-grid">';
    $industries = array(
        array( '/industries/healthcare',  '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',                                                                                                                                    'Healthcare & MedTech'    ),
        array( '/industries/finance',     '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',                                                                                        'Finance & FinTech'       ),
        array( '/industries/ecommerce',   '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.97 1.61h9.72a2 2 0 001.97-1.61L23 6H6"/>',                                            'E-Commerce & Retail'     ),
        array( '/industries/real-estate', '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',                                                                                     'Real Estate'             ),
        array( '/industries/legal',       '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>',                                                                          'Legal & Professional'    ),
        array( '/industries/hospitality', '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',                                                                             'Hospitality & Tourism'   ),
    );
    foreach ( $industries as $ind ) {
        echo '<a href="' . esc_url( home_url( $ind[0] ) ) . '" class="mega-panel__industry-tile">';
        echo '<span class="mega-panel__industry-icon">' . $ind_svg( $ind[1] ) . '</span>';
        echo '<span class="mega-panel__industry-name">' . esc_html( $ind[2] ) . '</span>';
        echo '</a>';
    }
    echo '</div>';

    echo '<div class="mega-panel__feature">';
    echo '<span class="mega-panel__feature-badge">' . esc_html__( 'Explore', 'bluu-interactive' ) . '</span>';
    echo '<h3 class="mega-panel__feature-title">' . esc_html__( 'Your Industry, Solved', 'bluu-interactive' ) . '</h3>';
    echo '<p class="mega-panel__feature-desc">' . esc_html__( 'Sector-specific strategies built on deep industry knowledge and measurable outcomes.', 'bluu-interactive' ) . '</p>';
    echo '<a href="' . esc_url( home_url( '/industries' ) ) . '" class="btn-primary btn-primary--small">' . esc_html__( 'All Industries', 'bluu-interactive' ) . '</a>';
    echo '</div>';

    echo '</div></div></div></li>';

    // Pricing & Contact
    echo '<li><a href="' . esc_url( home_url( '/pricing' ) ) . '">' . esc_html__( 'Pricing', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/contact' ) ) . '">' . esc_html__( 'Contact', 'bluu-interactive' ) . '</a></li>';

    echo '</ul>';
}

/**
 * Fallback mobile nav — accordion-style sub-menus.
 */
function bluu_fallback_mobile_nav() {
    $chevron = bluu_mega_chevron();

    echo '<ul class="mobile-nav__menu">';

    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';

    // Services accordion
    echo '<li class="has-mega">';
    echo '<div class="mobile-mega-header">';
    echo '<a href="' . esc_url( home_url( '/services' ) ) . '">' . esc_html__( 'Services', 'bluu-interactive' ) . '</a>';
    echo '<button class="mobile-mega-btn" aria-expanded="false" aria-label="' . esc_attr__( 'Expand Services submenu', 'bluu-interactive' ) . '">' . $chevron . '</button>';
    echo '</div>';
    echo '<ul class="mobile-mega-list">';
    $services = array(
        array( '/services/ai-chatbots',         'AI Chatbots'          ),
        array( '/services/workflow-automation',  'Workflow Automation'  ),
        array( '/services/analytics',            'Smart Analytics'      ),
        array( '/services/web-design',           'Web Design & Dev'     ),
        array( '/services/ecommerce',            'E-Commerce Solutions' ),
        array( '/services/seo',                  'SEO & Performance'    ),
        array( '/services/brand',                'Brand & Identity'     ),
        array( '/services/marketing',            'Digital Marketing'    ),
        array( '/services/cro',                  'CRO & UX'             ),
    );
    foreach ( $services as $s ) {
        echo '<li><a href="' . esc_url( home_url( $s[0] ) ) . '">' . esc_html( $s[1] ) . '</a></li>';
    }
    echo '</ul></li>';

    // Industries accordion
    echo '<li class="has-mega">';
    echo '<div class="mobile-mega-header">';
    echo '<a href="' . esc_url( home_url( '/industries' ) ) . '">' . esc_html__( 'Industries', 'bluu-interactive' ) . '</a>';
    echo '<button class="mobile-mega-btn" aria-expanded="false" aria-label="' . esc_attr__( 'Expand Industries submenu', 'bluu-interactive' ) . '">' . $chevron . '</button>';
    echo '</div>';
    echo '<ul class="mobile-mega-list">';
    $industries = array(
        array( '/industries/healthcare',  'Healthcare & MedTech'  ),
        array( '/industries/finance',     'Finance & FinTech'     ),
        array( '/industries/ecommerce',   'E-Commerce & Retail'   ),
        array( '/industries/real-estate', 'Real Estate'           ),
        array( '/industries/legal',       'Legal & Professional'  ),
        array( '/industries/hospitality', 'Hospitality & Tourism' ),
    );
    foreach ( $industries as $ind ) {
        echo '<li><a href="' . esc_url( home_url( $ind[0] ) ) . '">' . esc_html( $ind[1] ) . '</a></li>';
    }
    echo '</ul></li>';

    echo '<li><a href="' . esc_url( home_url( '/pricing' ) ) . '">' . esc_html__( 'Pricing', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/contact' ) ) . '">' . esc_html__( 'Contact', 'bluu-interactive' ) . '</a></li>';

    echo '</ul>';
}
