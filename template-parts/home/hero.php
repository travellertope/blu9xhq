<?php
/**
 * Home Hero Section
 *
 * @package bluu-interactive
 */

$hero_badge           = function_exists( 'get_field' ) ? get_field( 'hero_badge' )           : '';
$hero_headline        = function_exists( 'get_field' ) ? get_field( 'hero_headline' )         : '';
$hero_subheadline     = function_exists( 'get_field' ) ? get_field( 'hero_subheadline' )      : '';
$hero_cta_primary_text = function_exists( 'get_field' ) ? get_field( 'hero_cta_primary_text' ) : '';
$hero_cta_primary_url  = function_exists( 'get_field' ) ? get_field( 'hero_cta_primary_url' )  : '';
$hero_cta_secondary_text = function_exists( 'get_field' ) ? get_field( 'hero_cta_secondary_text' ) : '';
$hero_cta_secondary_url  = function_exists( 'get_field' ) ? get_field( 'hero_cta_secondary_url' )  : '';
$hero_stats           = function_exists( 'get_field' ) ? get_field( 'hero_stats' )            : array();

// Defaults
$hero_badge               = $hero_badge               ?: 'Anti-Fragmentation Agency';
$hero_headline            = $hero_headline            ?: 'Stop Managing Vendors. Start Closing Revenue.';
$hero_subheadline         = $hero_subheadline         ?: 'Bluu Interactive replaces your web developer, SEO agency, and sales content team with one synchronized engine that drives traffic, converts leads, and closes deals.';
$hero_cta_primary_text    = $hero_cta_primary_text    ?: 'Book a Discovery Call';
$hero_cta_primary_url     = $hero_cta_primary_url     ?: home_url( '/contact' );
$hero_cta_secondary_text  = $hero_cta_secondary_text  ?: 'See How It Works';
$hero_cta_secondary_url   = $hero_cta_secondary_url   ?: '#pillars';

// Default stats if none set
if ( empty( $hero_stats ) ) {
    $hero_stats = array(
        array( 'stat_number' => '3 → 1', 'stat_label' => 'Vendors Consolidated' ),
        array( 'stat_number' => '48h',    'stat_label' => 'Case Study Turnaround' ),
        array( 'stat_number' => '100%',   'stat_label' => 'SME-Verified Content' ),
    );
}
?>

<section class="hero" id="hero" aria-label="<?php esc_attr_e( 'Hero section', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="hero__inner">

            <!-- Left Content -->
            <div class="hero__content animate-on-scroll">
                <div class="md-chip hero__badge" aria-label="<?php esc_attr_e( 'Agency type', 'bluu-interactive' ); ?>">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <?php echo esc_html( $hero_badge ); ?>
                </div>

                <h1 class="hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>

                <p class="hero__subheadline"><?php echo esc_html( $hero_subheadline ); ?></p>

                <div class="hero__cta-group">
                    <a
                        href="<?php echo esc_url( $hero_cta_primary_url ); ?>"
                        class="btn-primary btn-primary--large"
                        aria-label="<?php echo esc_attr( $hero_cta_primary_text ); ?>"
                    >
                        <?php echo esc_html( $hero_cta_primary_text ); ?>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </a>
                    <a
                        href="<?php echo esc_url( $hero_cta_secondary_url ); ?>"
                        class="btn-secondary btn-secondary--large"
                        aria-label="<?php echo esc_attr( $hero_cta_secondary_text ); ?>"
                    >
                        <?php echo esc_html( $hero_cta_secondary_text ); ?>
                    </a>
                </div>

                <!-- Stats Row -->
                <?php if ( ! empty( $hero_stats ) ) : ?>
                <div class="hero__stats" aria-label="<?php esc_attr_e( 'Key statistics', 'bluu-interactive' ); ?>">
                    <?php foreach ( $hero_stats as $stat ) : ?>
                        <div class="hero__stat-item">
                            <span class="hero__stat-number"><?php echo esc_html( $stat['stat_number'] ); ?></span>
                            <span class="hero__stat-label"><?php echo esc_html( $stat['stat_label'] ); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div><!-- /.hero__content -->

            <!-- Right: Abstract Geometric Illustration (CSS/SVG) -->
            <div class="hero__visual animate-on-scroll" aria-hidden="true">
                <div class="hero__illustration">
                    <svg
                        class="hero__svg"
                        viewBox="0 0 520 480"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        role="img"
                        aria-label="Abstract illustration of connected systems"
                    >
                        <!-- Background glow -->
                        <defs>
                            <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#1A73E8" stop-opacity="0.08"/>
                                <stop offset="100%" stop-color="#1A73E8" stop-opacity="0"/>
                            </radialGradient>
                            <linearGradient id="nodeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#1A73E8"/>
                                <stop offset="100%" stop-color="#0D47A1"/>
                            </linearGradient>
                            <linearGradient id="nodeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#137333"/>
                                <stop offset="100%" stop-color="#0F5928"/>
                            </linearGradient>
                            <linearGradient id="nodeGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#1557B0"/>
                                <stop offset="100%" stop-color="#1A73E8"/>
                            </linearGradient>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#1A73E8" flood-opacity="0.2"/>
                            </filter>
                        </defs>

                        <!-- Background circle -->
                        <circle cx="260" cy="240" r="220" fill="url(#heroGlow)"/>

                        <!-- Connecting lines -->
                        <line x1="260" y1="240" x2="100" y2="120" stroke="#1A73E8" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>
                        <line x1="260" y1="240" x2="420" y2="120" stroke="#1A73E8" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>
                        <line x1="260" y1="240" x2="120" y2="380" stroke="#1A73E8" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>
                        <line x1="260" y1="240" x2="400" y2="380" stroke="#1A73E8" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>
                        <line x1="260" y1="240" x2="260" y2="60" stroke="#137333" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>

                        <!-- Outer ring -->
                        <circle cx="260" cy="240" r="160" stroke="#1A73E8" stroke-width="1" stroke-opacity="0.12" fill="none" stroke-dasharray="4 8"/>
                        <circle cx="260" cy="240" r="110" stroke="#1A73E8" stroke-width="1" stroke-opacity="0.18" fill="none" stroke-dasharray="4 6"/>

                        <!-- Satellite nodes -->
                        <!-- Top: The Hub -->
                        <g filter="url(#shadow)">
                            <rect x="220" y="20" width="80" height="80" rx="16" fill="url(#nodeGrad1)"/>
                            <text x="260" y="55" text-anchor="middle" font-family="Roboto, sans-serif" font-size="10" font-weight="500" fill="white">THE</text>
                            <text x="260" y="70" text-anchor="middle" font-family="Roboto, sans-serif" font-size="10" font-weight="500" fill="white">HUB</text>
                            <!-- Server icon -->
                            <rect x="245" y="35" width="30" height="6" rx="2" fill="white" fill-opacity="0.5"/>
                            <circle cx="270" cy="38" r="2" fill="#4FC3F7"/>
                        </g>

                        <!-- Top-Left: Web -->
                        <g filter="url(#shadow)">
                            <circle cx="100" cy="120" r="44" fill="url(#nodeGrad3)"/>
                            <text x="100" y="115" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="500" fill="white">WEB</text>
                            <text x="100" y="128" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="500" fill="white">INFRA</text>
                        </g>

                        <!-- Top-Right: SEO -->
                        <g filter="url(#shadow)">
                            <circle cx="420" cy="120" r="44" fill="url(#nodeGrad2)"/>
                            <text x="420" y="115" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="500" fill="white">AUTHORITY</text>
                            <text x="420" y="128" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="500" fill="white">CONTENT</text>
                        </g>

                        <!-- Center: Bluu Core -->
                        <g filter="url(#shadow)">
                            <circle cx="260" cy="240" r="64" fill="url(#nodeGrad1)"/>
                            <text x="260" y="234" text-anchor="middle" font-family="Roboto, sans-serif" font-size="11" font-weight="700" fill="white">BLUU</text>
                            <text x="260" y="252" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="400" fill="rgba(255,255,255,0.8)">INTERACTIVE</text>
                        </g>

                        <!-- Bottom-Left: Sales -->
                        <g filter="url(#shadow)">
                            <circle cx="120" cy="380" r="44" fill="url(#nodeGrad3)"/>
                            <text x="120" y="376" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="500" fill="white">SALES</text>
                            <text x="120" y="389" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="500" fill="white">ASSETS</text>
                        </g>

                        <!-- Bottom-Right: Conversion -->
                        <g filter="url(#shadow)">
                            <rect x="356" y="336" width="88" height="88" rx="44" fill="url(#nodeGrad2)"/>
                            <text x="400" y="376" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="500" fill="white">CONVERSION</text>
                            <text x="400" y="389" text-anchor="middle" font-family="Roboto, sans-serif" font-size="9" font-weight="500" fill="white">ENGINE</text>
                        </g>

                        <!-- Animated pulse rings (via CSS) -->
                        <circle class="hero-pulse" cx="260" cy="240" r="80" stroke="#1A73E8" stroke-width="2" fill="none" stroke-opacity="0.4"/>
                        <circle class="hero-pulse hero-pulse--delay" cx="260" cy="240" r="100" stroke="#1A73E8" stroke-width="1" fill="none" stroke-opacity="0.2"/>

                        <!-- Small connector dots -->
                        <circle cx="180" cy="180" r="5" fill="#1A73E8" fill-opacity="0.5"/>
                        <circle cx="340" cy="180" r="5" fill="#1A73E8" fill-opacity="0.5"/>
                        <circle cx="190" cy="310" r="5" fill="#137333" fill-opacity="0.5"/>
                        <circle cx="330" cy="310" r="5" fill="#1A73E8" fill-opacity="0.5"/>

                        <!-- Flow arrows -->
                        <polygon points="260,148 255,140 265,140" fill="#1A73E8" fill-opacity="0.5"/>
                        <polygon points="172,196 165,190 168,200" fill="#1A73E8" fill-opacity="0.5"/>
                        <polygon points="348,196 356,190 353,200" fill="#1A73E8" fill-opacity="0.5"/>
                    </svg>
                </div>

                <!-- Floating stat cards for visual interest -->
                <div class="hero__float-card hero__float-card--1">
                    <span class="hero__float-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#137333" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                            <polyline points="16 7 22 7 22 13"/>
                        </svg>
                    </span>
                    <span class="hero__float-text"><?php esc_html_e( 'Pipeline Growing', 'bluu-interactive' ); ?></span>
                </div>

                <div class="hero__float-card hero__float-card--2">
                    <span class="hero__float-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </span>
                    <span class="hero__float-text"><?php esc_html_e( 'Fully Unified', 'bluu-interactive' ); ?></span>
                </div>

            </div><!-- /.hero__visual -->

        </div><!-- /.hero__inner -->
    </div><!-- /.container -->
</section>
