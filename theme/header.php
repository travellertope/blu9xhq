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
 * Fallback desktop nav — Industries left-nav mega menu.
 */
function bluu_fallback_nav() {
    $chevron = bluu_mega_chevron();

    // SVG helper
    $svg = function( $paths ) {
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $paths . '</svg>';
    };

    // Industry data: key, label, url, sub-industries[], use-cases[]
    $industries = array(
        array(
            'key'  => 'tech-saas',
            'label'=> 'Tech & SaaS',
            'url'  => home_url( '/industries/tech-saas' ),
            'subs' => array(
                array( 'label' => 'Seed to Series A',      'url' => home_url( '/industries/tech-saas/seed-series-a' ) ),
                array( 'label' => 'B2B SaaS growth teams', 'url' => home_url( '/industries/tech-saas/b2b-saas-growth' ) ),
                array( 'label' => 'No-code & AI startups', 'url' => home_url( '/industries/tech-saas/no-code-ai-startups' ) ),
                array( 'label' => 'Developer tools',       'url' => home_url( '/industries/tech-saas/developer-tools' ) ),
            ),
            'usecases' => array(
                array( 'label' => 'Competitor intelligence',  'url' => home_url( '/industries/tech-saas/competitor-intelligence' ),  'icon' => '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' ),
                array( 'label' => 'Founder brand',            'url' => home_url( '/industries/tech-saas/founder-brand' ),            'icon' => '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>' ),
                array( 'label' => 'Content repurposing',      'url' => home_url( '/industries/tech-saas/content-repurposing' ),      'icon' => '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>' ),
                array( 'label' => 'Product launch content',   'url' => home_url( '/industries/tech-saas/product-launch-content' ),   'icon' => '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' ),
            ),
        ),
        array(
            'key'  => 'agencies-consultants',
            'label'=> 'Agencies & Consultants',
            'url'  => home_url( '/industries/agencies-consultants' ),
            'subs' => array(
                array( 'label' => 'Marketing consultants',    'url' => home_url( '/industries/agencies-consultants/marketing-consultants' ) ),
                array( 'label' => 'Branding & design',        'url' => home_url( '/industries/agencies-consultants/branding-design-studios' ) ),
                array( 'label' => 'PR & communications',      'url' => home_url( '/industries/agencies-consultants/pr-communications' ) ),
                array( 'label' => 'Strategy consultants',     'url' => home_url( '/industries/agencies-consultants/strategy-consultants' ) ),
                array( 'label' => 'Recruitment consultants',  'url' => home_url( '/industries/agencies-consultants/recruitment-consultants' ) ),
                array( 'label' => 'Business coaches',         'url' => home_url( '/industries/agencies-consultants/business-coaches' ) ),
                array( 'label' => 'Paid media agencies',      'url' => home_url( '/industries/agencies-consultants/paid-media-agencies' ) ),
                array( 'label' => 'Full-service agencies',    'url' => home_url( '/industries/agencies-consultants/full-service-agencies' ) ),
            ),
            'usecases' => array(
                array( 'label' => 'Own-brand content',          'url' => home_url( '/industries/agencies-consultants/own-brand-content' ),        'icon' => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' ),
                array( 'label' => 'Thought leadership',         'url' => home_url( '/industries/agencies-consultants/thought-leadership' ),        'icon' => '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' ),
                array( 'label' => 'White-label production',     'url' => home_url( '/industries/agencies-consultants/white-label-production' ),    'icon' => '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>' ),
                array( 'label' => 'New service launch',         'url' => home_url( '/industries/agencies-consultants/service-launch' ),            'icon' => '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' ),
            ),
        ),
        array(
            'key'  => 'ecommerce-dtc',
            'label'=> 'E-commerce & DTC',
            'url'  => home_url( '/industries/ecommerce-dtc' ),
            'subs' => array(
                array( 'label' => 'Emerging DTC brands',        'url' => home_url( '/industries/ecommerce-dtc/emerging-dtc-brands' ) ),
                array( 'label' => 'Subscription & lifestyle',   'url' => home_url( '/industries/ecommerce-dtc/subscription-lifestyle' ) ),
                array( 'label' => 'Marketplaces & platforms',   'url' => home_url( '/industries/ecommerce-dtc/marketplaces-platforms' ) ),
            ),
            'usecases' => array(
                array( 'label' => 'Brand storytelling',         'url' => home_url( '/industries/ecommerce-dtc/brand-storytelling' ),   'icon' => '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>' ),
                array( 'label' => 'Product content',            'url' => home_url( '/industries/ecommerce-dtc/product-content' ),      'icon' => '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.97 1.61h9.72a2 2 0 001.97-1.61L23 6H6"/>' ),
                array( 'label' => 'Email & newsletter',         'url' => home_url( '/industries/ecommerce-dtc/email-newsletter' ),     'icon' => '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>' ),
                array( 'label' => 'Market intelligence',        'url' => home_url( '/industries/ecommerce-dtc/market-intelligence' ),  'icon' => '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' ),
            ),
        ),
        array(
            'key'  => 'professional-services',
            'label'=> 'Professional Services',
            'url'  => home_url( '/industries/professional-services' ),
            'subs' => array(
                array( 'label' => 'Financial advisors',          'url' => home_url( '/industries/professional-services/financial-advisors' ) ),
                array( 'label' => 'Boutique law firms',          'url' => home_url( '/industries/professional-services/boutique-law-firms' ) ),
                array( 'label' => 'Management consultancies',    'url' => home_url( '/industries/professional-services/management-consultancies' ) ),
            ),
            'usecases' => array(
                array( 'label' => 'Expert commentary',           'url' => home_url( '/industries/professional-services/expert-commentary' ),     'icon' => '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>' ),
                array( 'label' => 'Client education',            'url' => home_url( '/industries/professional-services/client-education' ),      'icon' => '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>' ),
                array( 'label' => 'Referral & trust content',    'url' => home_url( '/industries/professional-services/referral-trust-content' ),'icon' => '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' ),
                array( 'label' => 'LinkedIn authority',          'url' => home_url( '/industries/professional-services/linkedin-authority' ),    'icon' => '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>' ),
            ),
        ),
    );

    echo '<ul class="site-header__menu">';

    // Home
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';

    // ── Industries mega panel — left-nav layout ───────────────────────────────
    echo '<li class="has-mega">';
    echo '<a href="' . esc_url( home_url( '/industries' ) ) . '" class="mega-trigger" aria-haspopup="true" aria-expanded="false">';
    echo esc_html__( 'Industries', 'bluu-interactive' ) . $chevron;
    echo '</a>';
    echo '<div class="mega-panel mega-panel--left-nav"><div class="mega-panel__inner">';
    echo '<div class="mega-ind-wrap">';

    // Left nav
    echo '<nav class="mega-ind-left" aria-label="' . esc_attr__( 'Industries', 'bluu-interactive' ) . '">';
    $first = true;
    foreach ( $industries as $ind ) {
        $active = $first ? ' is-active' : '';
        echo '<button class="mega-ind-btn' . $active . '" data-panel="' . esc_attr( $ind['key'] ) . '" type="button">';
        echo '<span>' . esc_html( $ind['label'] ) . '</span>';
        echo '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
        echo '</button>';
        $first = false;
    }
    echo '<a href="' . esc_url( home_url( '/industries' ) ) . '" class="mega-ind-all-link">';
    echo esc_html__( 'All industries →', 'bluu-interactive' );
    echo '</a>';
    echo '</nav>';

    // Right panels
    echo '<div class="mega-ind-panels">';
    $first = true;
    foreach ( $industries as $ind ) {
        $active = $first ? ' is-active' : '';
        echo '<div class="mega-ind-panel' . $active . '" id="mega-ind-panel-' . esc_attr( $ind['key'] ) . '">';

        // Sub-industries
        echo '<p class="mega-ind-section-label">' . esc_html__( 'Sub-industries', 'bluu-interactive' ) . '</p>';
        echo '<div class="mega-chip-grid">';
        foreach ( $ind['subs'] as $sub ) {
            echo '<a href="' . esc_url( $sub['url'] ) . '" class="mega-chip">' . esc_html( $sub['label'] ) . '</a>';
        }
        echo '</div>';

        // Use cases
        echo '<p class="mega-ind-section-label mega-ind-section-label--uc">' . esc_html__( 'Use cases', 'bluu-interactive' ) . '</p>';
        echo '<div class="mega-use-grid">';
        foreach ( $ind['usecases'] as $uc ) {
            echo '<a href="' . esc_url( $uc['url'] ) . '" class="mega-use-card">';
            echo '<span class="mega-use-card__icon">' . $svg( $uc['icon'] ) . '</span>';
            echo '<span>' . esc_html( $uc['label'] ) . '</span>';
            echo '</a>';
        }
        echo '</div>';

        echo '</div>'; // .mega-ind-panel
        $first = false;
    }
    echo '</div>'; // .mega-ind-panels

    echo '</div>'; // .mega-ind-wrap
    echo '</div></div></li>'; // .mega-panel__inner / .mega-panel / li

    // Use Cases, Pricing, Insights, FAQs
    echo '<li><a href="' . esc_url( home_url( '/use-cases' ) ) . '">' . esc_html__( 'Use Cases', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/pricing' ) ) . '">' . esc_html__( 'Pricing', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/insights' ) ) . '">' . esc_html__( 'Insights', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/faqs' ) ) . '">' . esc_html__( 'FAQs', 'bluu-interactive' ) . '</a></li>';

    echo '</ul>';
}

/**
 * Fallback mobile nav — accordion-style.
 */
function bluu_fallback_mobile_nav() {
    $chevron = bluu_mega_chevron();

    $industries = array(
        array( '/industries/tech-saas',             'Tech & SaaS'            ),
        array( '/industries/agencies-consultants',  'Agencies & Consultants' ),
        array( '/industries/ecommerce-dtc',         'E-commerce & DTC'       ),
        array( '/industries/professional-services', 'Professional Services'  ),
    );

    echo '<ul class="mobile-nav__menu">';

    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';

    // Industries accordion
    echo '<li class="has-mega">';
    echo '<div class="mobile-mega-header">';
    echo '<a href="' . esc_url( home_url( '/industries' ) ) . '">' . esc_html__( 'Industries', 'bluu-interactive' ) . '</a>';
    echo '<button class="mobile-mega-btn" aria-expanded="false" aria-label="' . esc_attr__( 'Expand Industries submenu', 'bluu-interactive' ) . '">' . $chevron . '</button>';
    echo '</div>';
    echo '<ul class="mobile-mega-list">';
    foreach ( $industries as $ind ) {
        echo '<li><a href="' . esc_url( home_url( $ind[0] ) ) . '">' . esc_html( $ind[1] ) . '</a></li>';
    }
    echo '</ul></li>';

    echo '<li><a href="' . esc_url( home_url( '/use-cases' ) ) . '">' . esc_html__( 'Use Cases', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/pricing' ) ) . '">' . esc_html__( 'Pricing', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/insights' ) ) . '">' . esc_html__( 'Insights', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/faqs' ) ) . '">' . esc_html__( 'FAQs', 'bluu-interactive' ) . '</a></li>';

    echo '</ul>';
}
