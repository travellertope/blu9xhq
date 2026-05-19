<?php
/**
 * WordPress Customizer Settings
 *
 * @package bluu-interactive
 */

defined( 'ABSPATH' ) || exit;

function bluu_customizer_register( $wp_customize ) {

    // ── Bluu Interactive Panel ─────────────────────────────────────────────────
    $wp_customize->add_panel( 'bluu_panel', array(
        'title'       => esc_html__( 'Bluu Interactive Settings', 'bluu-interactive' ),
        'description' => esc_html__( 'Theme-specific settings for Bluu Interactive.', 'bluu-interactive' ),
        'priority'    => 30,
    ) );

    // ── Brand Section ──────────────────────────────────────────────────────────
    $wp_customize->add_section( 'bluu_brand', array(
        'title'    => esc_html__( 'Brand & Colors', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 10,
    ) );

    $wp_customize->add_setting( 'bluu_accent_color', array(
        'default'           => '#1A73E8',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'bluu_accent_color', array(
        'label'   => esc_html__( 'Accent Color (Primary)', 'bluu-interactive' ),
        'section' => 'bluu_brand',
    ) ) );

    $wp_customize->add_setting( 'bluu_accent_dark_color', array(
        'default'           => '#1557B0',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'bluu_accent_dark_color', array(
        'label'   => esc_html__( 'Accent Color (Dark)', 'bluu-interactive' ),
        'section' => 'bluu_brand',
    ) ) );

    // ── Footer Section ─────────────────────────────────────────────────────────
    $wp_customize->add_section( 'bluu_footer', array(
        'title'    => esc_html__( 'Footer', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 20,
    ) );

    $wp_customize->add_setting( 'bluu_footer_tagline', array(
        'default'           => 'One Team. One Strategy. Total Growth.',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_footer_tagline', array(
        'label'   => esc_html__( 'Footer Tagline', 'bluu-interactive' ),
        'section' => 'bluu_footer',
        'type'    => 'text',
    ) );

    $wp_customize->add_setting( 'bluu_copyright_text', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_copyright_text', array(
        'label'       => esc_html__( 'Custom Copyright Text', 'bluu-interactive' ),
        'description' => esc_html__( 'Leave blank for automatic year + company name.', 'bluu-interactive' ),
        'section'     => 'bluu_footer',
        'type'        => 'text',
    ) );

    // ── Social Links Section ───────────────────────────────────────────────────
    $wp_customize->add_section( 'bluu_social', array(
        'title'    => esc_html__( 'Social Links', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 30,
    ) );

    $wp_customize->add_setting( 'bluu_linkedin_url', array(
        'default'           => 'https://linkedin.com/company/bluuinteractive',
        'sanitize_callback' => 'esc_url_raw',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( 'bluu_linkedin_url', array(
        'label'   => esc_html__( 'LinkedIn URL', 'bluu-interactive' ),
        'section' => 'bluu_social',
        'type'    => 'url',
    ) );

    $wp_customize->add_setting( 'bluu_twitter_url', array(
        'default'           => 'https://twitter.com/bluuinteractive',
        'sanitize_callback' => 'esc_url_raw',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( 'bluu_twitter_url', array(
        'label'   => esc_html__( 'Twitter / X URL', 'bluu-interactive' ),
        'section' => 'bluu_social',
        'type'    => 'url',
    ) );

    // ── Analytics Section ──────────────────────────────────────────────────────
    $wp_customize->add_section( 'bluu_analytics', array(
        'title'    => esc_html__( 'Analytics', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 40,
    ) );

    $wp_customize->add_setting( 'bluu_ga_id', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( 'bluu_ga_id', array(
        'label'       => esc_html__( 'Google Analytics Measurement ID', 'bluu-interactive' ),
        'description' => esc_html__( 'e.g. G-XXXXXXXXXX', 'bluu-interactive' ),
        'section'     => 'bluu_analytics',
        'type'        => 'text',
    ) );

    // ── Selective Refresh ──────────────────────────────────────────────────────
    $wp_customize->selective_refresh->add_partial( 'bluu_footer_tagline', array(
        'selector'        => '.footer__tagline',
        'render_callback' => function() {
            return esc_html( get_theme_mod( 'bluu_footer_tagline', 'One Team. One Strategy. Total Growth.' ) );
        },
    ) );
}
add_action( 'customize_register', 'bluu_customizer_register' );

/**
 * Output dynamic CSS custom properties from customizer settings.
 */
function bluu_customizer_css() {
    $primary     = sanitize_hex_color( get_theme_mod( 'bluu_accent_color',      '#1A73E8' ) );
    $primary_dark = sanitize_hex_color( get_theme_mod( 'bluu_accent_dark_color', '#1557B0' ) );

    if ( ! $primary && ! $primary_dark ) {
        return;
    }

    echo '<style id="bluu-customizer-css">:root{';
    if ( $primary )      echo '--md-primary:' . esc_attr( $primary ) . ';';
    if ( $primary_dark ) echo '--md-primary-dark:' . esc_attr( $primary_dark ) . ';';
    echo '}</style>' . "\n";
}
add_action( 'wp_head', 'bluu_customizer_css', 99 );
