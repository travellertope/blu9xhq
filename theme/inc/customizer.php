<?php
/**
 * WordPress Customizer Settings
 * Covers: Logo (image + sizes), Colors, Typography, Footer, Social, Analytics
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

    // =========================================================================
    // SECTION: Logo & Site Identity
    // =========================================================================
    // (WordPress built-in Site Identity section is extended here)
    $wp_customize->add_section( 'bluu_logo', array(
        'title'    => esc_html__( 'Logo & Identity', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 5,
    ) );

    // Logo max-width (desktop)
    $wp_customize->add_setting( 'bluu_logo_width', array(
        'default'           => 160,
        'sanitize_callback' => 'absint',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_logo_width', array(
        'label'       => esc_html__( 'Logo Width (px) — Desktop', 'bluu-interactive' ),
        'description' => esc_html__( 'Max-width of your logo image in the header. Default: 160px.', 'bluu-interactive' ),
        'section'     => 'bluu_logo',
        'type'        => 'number',
        'input_attrs' => array( 'min' => 60, 'max' => 400, 'step' => 4 ),
    ) );

    // Logo max-height
    $wp_customize->add_setting( 'bluu_logo_height', array(
        'default'           => 40,
        'sanitize_callback' => 'absint',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_logo_height', array(
        'label'       => esc_html__( 'Logo Height (px)', 'bluu-interactive' ),
        'description' => esc_html__( 'Max-height of your logo image in the header. Default: 40px.', 'bluu-interactive' ),
        'section'     => 'bluu_logo',
        'type'        => 'number',
        'input_attrs' => array( 'min' => 20, 'max' => 100, 'step' => 2 ),
    ) );

    // Logo mobile width
    $wp_customize->add_setting( 'bluu_logo_width_mobile', array(
        'default'           => 120,
        'sanitize_callback' => 'absint',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_logo_width_mobile', array(
        'label'       => esc_html__( 'Logo Width (px) — Mobile', 'bluu-interactive' ),
        'section'     => 'bluu_logo',
        'type'        => 'number',
        'input_attrs' => array( 'min' => 60, 'max' => 260, 'step' => 4 ),
    ) );

    // Fallback wordmark (text logo)
    $wp_customize->add_setting( 'bluu_wordmark', array(
        'default'           => 'bluu interactive',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_wordmark', array(
        'label'       => esc_html__( 'Text Wordmark (shown if no logo image uploaded)', 'bluu-interactive' ),
        'section'     => 'bluu_logo',
        'type'        => 'text',
    ) );

    // =========================================================================
    // SECTION: Colors
    // =========================================================================
    $wp_customize->add_section( 'bluu_colors', array(
        'title'    => esc_html__( 'Colors', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 10,
    ) );

    // Accent / brand blue
    $wp_customize->add_setting( 'bluu_color_accent', array(
        'default'           => '#0d6efd',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'bluu_color_accent', array(
        'label'       => esc_html__( 'Brand / Accent Color', 'bluu-interactive' ),
        'description' => esc_html__( 'Used for buttons, links, chips, and highlights.', 'bluu-interactive' ),
        'section'     => 'bluu_colors',
    ) ) );

    // Accent dark (hover)
    $wp_customize->add_setting( 'bluu_color_accent_dark', array(
        'default'           => '#0b5ed7',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'bluu_color_accent_dark', array(
        'label'       => esc_html__( 'Accent Color — Hover / Dark', 'bluu-interactive' ),
        'description' => esc_html__( 'Shown on button hover. Usually a darker shade of your accent.', 'bluu-interactive' ),
        'section'     => 'bluu_colors',
    ) ) );

    // Heading / body text color
    $wp_customize->add_setting( 'bluu_color_text', array(
        'default'           => '#0a192f',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'bluu_color_text', array(
        'label'       => esc_html__( 'Heading & Body Text Color', 'bluu-interactive' ),
        'description' => esc_html__( 'Primary text color used for headings and body copy.', 'bluu-interactive' ),
        'section'     => 'bluu_colors',
    ) ) );

    // Secondary text color
    $wp_customize->add_setting( 'bluu_color_text_secondary', array(
        'default'           => '#6c757d',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'bluu_color_text_secondary', array(
        'label'       => esc_html__( 'Secondary / Muted Text Color', 'bluu-interactive' ),
        'description' => esc_html__( 'Used for subtitles, captions, and supporting copy.', 'bluu-interactive' ),
        'section'     => 'bluu_colors',
    ) ) );

    // Surface / card background
    $wp_customize->add_setting( 'bluu_color_surface_variant', array(
        'default'           => '#F8F9FA',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'bluu_color_surface_variant', array(
        'label'       => esc_html__( 'Section Background (Alternate)', 'bluu-interactive' ),
        'description' => esc_html__( 'Used for alternating section backgrounds, page hero areas.', 'bluu-interactive' ),
        'section'     => 'bluu_colors',
    ) ) );

    // Outline / border color
    $wp_customize->add_setting( 'bluu_color_outline', array(
        'default'           => '#e9ecef',
        'sanitize_callback' => 'sanitize_hex_color',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'bluu_color_outline', array(
        'label'       => esc_html__( 'Border / Outline Color', 'bluu-interactive' ),
        'description' => esc_html__( 'Used for card borders, dividers, and form outlines.', 'bluu-interactive' ),
        'section'     => 'bluu_colors',
    ) ) );

    // =========================================================================
    // SECTION: Typography
    // =========================================================================
    $wp_customize->add_section( 'bluu_typography', array(
        'title'       => esc_html__( 'Typography', 'bluu-interactive' ),
        'panel'       => 'bluu_panel',
        'priority'    => 20,
        'description' => esc_html__( 'Control fonts and type sizes across the site. Changes take effect on page reload.', 'bluu-interactive' ),
    ) );

    // Heading font
    $wp_customize->add_setting( 'bluu_font_heading', array(
        'default'           => 'Plus Jakarta Sans',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( 'bluu_font_heading', array(
        'label'       => esc_html__( 'Heading Font', 'bluu-interactive' ),
        'description' => esc_html__( 'Google Font name for all headings (H1–H6).', 'bluu-interactive' ),
        'section'     => 'bluu_typography',
        'type'        => 'select',
        'choices'     => array(
            'Plus Jakarta Sans' => 'Plus Jakarta Sans (Default)',
            'Inter'        => 'Inter',
            'Roboto'       => 'Roboto',
            'Raleway'      => 'Raleway',
            'Poppins'      => 'Poppins',
            'Montserrat'   => 'Montserrat',
            'Playfair Display' => 'Playfair Display (Serif)',
            'Lora'         => 'Lora (Serif)',
            'Nunito'       => 'Nunito',
            'DM Sans'      => 'DM Sans',
        ),
    ) );

    // Body font
    $wp_customize->add_setting( 'bluu_font_body', array(
        'default'           => 'Plus Jakarta Sans',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( 'bluu_font_body', array(
        'label'       => esc_html__( 'Body Font', 'bluu-interactive' ),
        'description' => esc_html__( 'Google Font name for body text and UI elements.', 'bluu-interactive' ),
        'section'     => 'bluu_typography',
        'type'        => 'select',
        'choices'     => array(
            'Plus Jakarta Sans' => 'Plus Jakarta Sans (Default)',
            'Inter'      => 'Inter',
            'Roboto'     => 'Roboto',
            'Open Sans'  => 'Open Sans',
            'Lato'       => 'Lato',
            'Source Sans 3' => 'Source Sans 3',
            'Noto Sans'  => 'Noto Sans',
            'DM Sans'    => 'DM Sans',
            'Nunito'     => 'Nunito',
            'Poppins'    => 'Poppins',
        ),
    ) );

    // Base font size
    $wp_customize->add_setting( 'bluu_font_size_base', array(
        'default'           => 16,
        'sanitize_callback' => 'absint',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_font_size_base', array(
        'label'       => esc_html__( 'Base Font Size (px)', 'bluu-interactive' ),
        'description' => esc_html__( 'Body text size. Heading sizes scale proportionally. Default: 16px.', 'bluu-interactive' ),
        'section'     => 'bluu_typography',
        'type'        => 'number',
        'input_attrs' => array( 'min' => 13, 'max' => 20, 'step' => 1 ),
    ) );

    // Heading weight
    $wp_customize->add_setting( 'bluu_heading_weight', array(
        'default'           => '700',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_heading_weight', array(
        'label'   => esc_html__( 'Heading Font Weight', 'bluu-interactive' ),
        'section' => 'bluu_typography',
        'type'    => 'select',
        'choices' => array(
            '400' => 'Regular (400)',
            '500' => 'Medium (500)',
            '600' => 'SemiBold (600)',
            '700' => 'Bold (700) — Default',
            '800' => 'ExtraBold (800)',
            '900' => 'Black (900)',
        ),
    ) );

    // Letter spacing for headings
    $wp_customize->add_setting( 'bluu_heading_letter_spacing', array(
        'default'           => '-0.025',
        'sanitize_callback' => 'bluu_sanitize_decimal',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_heading_letter_spacing', array(
        'label'       => esc_html__( 'Heading Letter Spacing (em)', 'bluu-interactive' ),
        'description' => esc_html__( 'Negative tightens, positive loosens. Default: -0.025', 'bluu-interactive' ),
        'section'     => 'bluu_typography',
        'type'        => 'number',
        'input_attrs' => array( 'min' => -0.1, 'max' => 0.15, 'step' => 0.005 ),
    ) );

    // Body line height
    $wp_customize->add_setting( 'bluu_body_line_height', array(
        'default'           => '1.65',
        'sanitize_callback' => 'bluu_sanitize_decimal',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_body_line_height', array(
        'label'       => esc_html__( 'Body Line Height', 'bluu-interactive' ),
        'description' => esc_html__( 'Line height for body text. Default: 1.65', 'bluu-interactive' ),
        'section'     => 'bluu_typography',
        'type'        => 'number',
        'input_attrs' => array( 'min' => 1.3, 'max' => 2.0, 'step' => 0.05 ),
    ) );

    // Border radius (card roundness)
    $wp_customize->add_setting( 'bluu_border_radius', array(
        'default'           => '0',
        'sanitize_callback' => 'absint',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_border_radius', array(
        'label'       => esc_html__( 'Card Border Radius (px)', 'bluu-interactive' ),
        'description' => esc_html__( 'Roundness of cards, modals, and chips. 0 = square, 24 = very round. Default: 12px.', 'bluu-interactive' ),
        'section'     => 'bluu_typography',
        'type'        => 'number',
        'input_attrs' => array( 'min' => 0, 'max' => 32, 'step' => 2 ),
    ) );

    // =========================================================================
    // SECTION: Header
    // =========================================================================
    $wp_customize->add_section( 'bluu_header', array(
        'title'    => esc_html__( 'Header & Navigation', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 25,
    ) );

    $wp_customize->add_setting( 'bluu_nav_cta_text', array(
        'default'           => 'Let's talk',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_nav_cta_text', array(
        'label'   => esc_html__( 'Header CTA Button Text', 'bluu-interactive' ),
        'section' => 'bluu_header',
        'type'    => 'text',
    ) );

    $wp_customize->add_setting( 'bluu_nav_cta_url', array(
        'default'           => '/contact',
        'sanitize_callback' => 'esc_url_raw',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( 'bluu_nav_cta_url', array(
        'label'   => esc_html__( 'Header CTA Button URL', 'bluu-interactive' ),
        'section' => 'bluu_header',
        'type'    => 'url',
    ) );

    // =========================================================================
    // SECTION: Footer
    // =========================================================================
    $wp_customize->add_section( 'bluu_footer', array(
        'title'    => esc_html__( 'Footer', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 40,
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

    $wp_customize->add_setting( 'bluu_footer_descriptor', array(
        'default'           => 'We replace fragmented vendors with one unified growth engine — managed infrastructure, SME-verified content, and strategic sales assets under one subscription.',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_footer_descriptor', array(
        'label'   => esc_html__( 'Footer Description', 'bluu-interactive' ),
        'section' => 'bluu_footer',
        'type'    => 'textarea',
    ) );

    $wp_customize->add_setting( 'bluu_copyright_text', array(
        'default'           => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport'         => 'postMessage',
    ) );
    $wp_customize->add_control( 'bluu_copyright_text', array(
        'label'       => esc_html__( 'Custom Copyright Text', 'bluu-interactive' ),
        'description' => esc_html__( 'Leave blank for automatic "© 2025 Company Name".', 'bluu-interactive' ),
        'section'     => 'bluu_footer',
        'type'        => 'text',
    ) );

    // =========================================================================
    // SECTION: Social Links
    // =========================================================================
    $wp_customize->add_section( 'bluu_social', array(
        'title'    => esc_html__( 'Social Links', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 50,
    ) );

    $wp_customize->add_setting( 'bluu_linkedin_url', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( 'bluu_linkedin_url', array(
        'label'   => esc_html__( 'LinkedIn URL', 'bluu-interactive' ),
        'section' => 'bluu_social',
        'type'    => 'url',
    ) );

    $wp_customize->add_setting( 'bluu_twitter_url', array(
        'default'           => '',
        'sanitize_callback' => 'esc_url_raw',
        'transport'         => 'refresh',
    ) );
    $wp_customize->add_control( 'bluu_twitter_url', array(
        'label'   => esc_html__( 'Twitter / X URL', 'bluu-interactive' ),
        'section' => 'bluu_social',
        'type'    => 'url',
    ) );

    // =========================================================================
    // SECTION: Analytics
    // =========================================================================
    $wp_customize->add_section( 'bluu_analytics', array(
        'title'    => esc_html__( 'Analytics', 'bluu-interactive' ),
        'panel'    => 'bluu_panel',
        'priority' => 60,
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

    // ── Selective Refresh partials ─────────────────────────────────────────────
    if ( isset( $wp_customize->selective_refresh ) ) {
        $wp_customize->selective_refresh->add_partial( 'bluu_footer_tagline', array(
            'selector'        => '.footer__tagline',
            'render_callback' => function() {
                return esc_html( get_theme_mod( 'bluu_footer_tagline', 'One Team. One Strategy. Total Growth.' ) );
            },
        ) );
        $wp_customize->selective_refresh->add_partial( 'bluu_footer_descriptor', array(
            'selector'        => '.site-footer__descriptor',
            'render_callback' => function() {
                return esc_html( get_theme_mod( 'bluu_footer_descriptor', '' ) );
            },
        ) );
        $wp_customize->selective_refresh->add_partial( 'bluu_nav_cta_text', array(
            'selector'        => '.site-header__cta .btn-primary',
            'render_callback' => function() {
                return esc_html( get_theme_mod( 'bluu_nav_cta_text', 'Let's talk' ) );
            },
        ) );
    }
}
add_action( 'customize_register', 'bluu_customizer_register' );

/**
 * Sanitize decimal / float values for Customizer.
 */
function bluu_sanitize_decimal( $value ) {
    return is_numeric( $value ) ? (float) $value : 0;
}

/**
 * Output dynamic CSS custom properties from Customizer settings.
 * Only emits a variable when the stored value differs from both the current default
 * AND all known legacy defaults — so stale DB values never override main.css.
 */
function bluu_customizer_css() {
    // All valid defaults: current design values + legacy values that should also be treated as "no override"
    $legacy_color_values = [
        'bluu_color_accent'          => [ '#1a73e8', '#1A73E8' ],
        'bluu_color_accent_dark'     => [ '#1557b0', '#1557B0' ],
        'bluu_color_text'            => [ '#1c1b1f', '#1C1B1F' ],
        'bluu_color_text_secondary'  => [ '#5f6368', '#5F6368' ],
        'bluu_color_outline'         => [ '#e0e3e7', '#E0E3E7' ],
        'bluu_border_radius'         => [ 12 ],
    ];

    // Design defaults (must match main.css :root values)
    $defaults = [
        'bluu_color_accent'          => '#0d6efd',
        'bluu_color_accent_dark'     => '#0b5ed7',
        'bluu_color_text'            => '#0a192f',
        'bluu_color_text_secondary'  => '#6c757d',
        'bluu_color_surface_variant' => '#f8f9fa',
        'bluu_color_outline'         => '#e9ecef',
        'bluu_font_size_base'        => 16,
        'bluu_heading_weight'        => '700',
        'bluu_heading_letter_spacing'=> '-0.025',
        'bluu_body_line_height'      => '1.65',
        'bluu_border_radius'         => 0,
        'bluu_logo_width'            => 160,
        'bluu_logo_height'           => 40,
        'bluu_logo_width_mobile'     => 120,
    ];

    // Colors
    $accent          = sanitize_hex_color( get_theme_mod( 'bluu_color_accent',          $defaults['bluu_color_accent'] ) );
    $accent_dark     = sanitize_hex_color( get_theme_mod( 'bluu_color_accent_dark',      $defaults['bluu_color_accent_dark'] ) );
    $text            = sanitize_hex_color( get_theme_mod( 'bluu_color_text',             $defaults['bluu_color_text'] ) );
    $text_secondary  = sanitize_hex_color( get_theme_mod( 'bluu_color_text_secondary',   $defaults['bluu_color_text_secondary'] ) );
    $surface_variant = sanitize_hex_color( get_theme_mod( 'bluu_color_surface_variant',  $defaults['bluu_color_surface_variant'] ) );
    $outline         = sanitize_hex_color( get_theme_mod( 'bluu_color_outline',          $defaults['bluu_color_outline'] ) );

    // Logo sizes
    $logo_w        = absint( get_theme_mod( 'bluu_logo_width',        $defaults['bluu_logo_width'] ) );
    $logo_h        = absint( get_theme_mod( 'bluu_logo_height',       $defaults['bluu_logo_height'] ) );
    $logo_w_mobile = absint( get_theme_mod( 'bluu_logo_width_mobile', $defaults['bluu_logo_width_mobile'] ) );

    // Typography
    $font_size_base = absint( get_theme_mod( 'bluu_font_size_base',    $defaults['bluu_font_size_base'] ) );
    $heading_weight = sanitize_text_field( get_theme_mod( 'bluu_heading_weight', $defaults['bluu_heading_weight'] ) );
    $heading_ls     = bluu_sanitize_decimal( get_theme_mod( 'bluu_heading_letter_spacing', $defaults['bluu_heading_letter_spacing'] ) );
    $body_lh        = bluu_sanitize_decimal( get_theme_mod( 'bluu_body_line_height', $defaults['bluu_body_line_height'] ) );
    $border_radius  = absint( get_theme_mod( 'bluu_border_radius', $defaults['bluu_border_radius'] ) );

    // Build accent container tint
    $accent_container = bluu_lighten_hex( $accent, 0.90 );

    $root_vars = '';

    // Helper: true when a value matches the current default OR any legacy default (stale DB value).
    $is_default = function( $key, $value ) use ( $defaults, $legacy_color_values ) {
        if ( $value === $defaults[ $key ] ) return true;
        if ( isset( $legacy_color_values[ $key ] ) && in_array( $value, $legacy_color_values[ $key ], true ) ) return true;
        return false;
    };

    // Only emit each variable when it differs from both the current default and all legacy defaults
    if ( ! $is_default( 'bluu_color_accent', $accent ) )                         $root_vars .= '--md-accent:'              . esc_attr( $accent )          . ';--md-accent-container:' . esc_attr( $accent_container ) . ';';
    if ( ! $is_default( 'bluu_color_accent_dark', $accent_dark ) )               $root_vars .= '--md-accent-dark:'         . esc_attr( $accent_dark )     . ';';
    if ( ! $is_default( 'bluu_color_text', $text ) )                             $root_vars .= '--md-on-surface:'          . esc_attr( $text )            . ';';
    if ( ! $is_default( 'bluu_color_text_secondary', $text_secondary ) )         $root_vars .= '--md-on-surface-variant:'  . esc_attr( $text_secondary )  . ';';
    if ( ! $is_default( 'bluu_color_surface_variant', $surface_variant ) )       $root_vars .= '--md-surface-variant:'     . esc_attr( $surface_variant ) . ';';
    if ( ! $is_default( 'bluu_color_outline', $outline ) )                       $root_vars .= '--md-outline-variant:'     . esc_attr( $outline )         . ';';
    if ( $font_size_base !== $defaults['bluu_font_size_base'] )                  $root_vars .= '--font-size-base:'         . esc_attr( $font_size_base )  . 'px;';
    if ( $heading_weight !== $defaults['bluu_heading_weight'] )                  $root_vars .= '--heading-weight:'         . esc_attr( $heading_weight )  . ';';
    if ( (float)$heading_ls !== (float)$defaults['bluu_heading_letter_spacing'] ) $root_vars .= '--heading-letter-spacing:' . esc_attr( $heading_ls ) . 'em;';
    if ( (float)$body_lh    !== (float)$defaults['bluu_body_line_height'] )       $root_vars .= '--body-line-height:'       . esc_attr( $body_lh )     . ';';
    if ( ! $is_default( 'bluu_border_radius', $border_radius ) )                 $root_vars .= '--radius-md:'              . esc_attr( $border_radius )   . 'px;';

    $css = '';

    if ( $root_vars ) {
        $css .= '<style id="bluu-customizer-css">:root{' . $root_vars . '}';
        if ( $heading_weight !== $defaults['bluu_heading_weight'] ) {
            $css .= 'h1,h2,h3,h4,h5,h6{font-weight:' . esc_attr( $heading_weight ) . ';}';
        }
        if ( (float)$heading_ls !== (float)$defaults['bluu_heading_letter_spacing'] ) {
            $css .= 'h1,h2,h3{letter-spacing:' . esc_attr( $heading_ls ) . 'em;}';
        }
        if ( (float)$body_lh !== (float)$defaults['bluu_body_line_height'] ) {
            $css .= 'body,p{line-height:' . esc_attr( $body_lh ) . ';}';
        }
        $css .= '</style>' . "\n";
    }

    // Logo sizing always output (non-destructive, controls image element sizing)
    $css .= '<style id="bluu-logo-css">';
    $css .= '.site-header__logo img,.site-header .custom-logo{max-width:' . esc_attr( $logo_w ) . 'px;max-height:' . esc_attr( $logo_h ) . 'px;width:auto;height:auto;}';
    $css .= '@media(max-width:768px){.site-header__logo img,.site-header .custom-logo{max-width:' . esc_attr( $logo_w_mobile ) . 'px;}}';
    $css .= '.site-footer__logo img,.site-footer .custom-logo{max-height:32px;width:auto;}';
    $css .= '</style>' . "\n";

    echo $css; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
add_action( 'wp_head', 'bluu_customizer_css', 99 );

/**
 * Enqueue font choices from Customizer.
 * Only fires when the user has explicitly selected a non-default font.
 * Plus Jakarta Sans is always loaded by bluu_enqueue_assets() — no override needed.
 */
function bluu_customizer_fonts() {
    $heading_font = sanitize_text_field( get_theme_mod( 'bluu_font_heading', 'Plus Jakarta Sans' ) );
    $body_font    = sanitize_text_field( get_theme_mod( 'bluu_font_body',    'Plus Jakarta Sans' ) );

    // If both fonts are the default (or the old legacy default 'Roboto'), output nothing.
    // main.css already defines the correct CSS vars — no override needed.
    $non_override_fonts = [ 'Plus Jakarta Sans', 'Roboto' ];
    $custom_fonts = array_unique( array_filter( array_diff( [ $heading_font, $body_font ], $non_override_fonts ) ) );

    if ( empty( $custom_fonts ) ) {
        return; // Default font — main.css handles everything, no override needed.
    }

    // Load the non-default Google Font(s)
    $families = array_map( function( $font ) {
        return urlencode( $font ) . ':wght@300;400;500;600;700;800';
    }, $custom_fonts );
    wp_enqueue_style( 'bluu-custom-fonts', 'https://fonts.googleapis.com/css2?family=' . implode( '&family=', $families ) . '&display=swap', [], null );

    // Output CSS custom properties only — do NOT apply font-family directly to elements.
    $heading_stack = '"' . esc_attr( $heading_font ) . '", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    $body_stack    = '"' . esc_attr( $body_font )    . '", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    echo '<style id="bluu-font-vars">:root{--font-family-heading:' . esc_attr( $heading_stack ) . ';--font-family-base:' . esc_attr( $body_stack ) . ';}</style>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
add_action( 'wp_head', 'bluu_customizer_fonts', 10 );

/**
 * Google Analytics tag output.
 */
function bluu_google_analytics() {
    $ga_id = sanitize_text_field( get_theme_mod( 'bluu_ga_id', '' ) );
    if ( empty( $ga_id ) ) {
        return;
    }
    ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $ga_id ); ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '<?php echo esc_attr( $ga_id ); ?>');
    </script>
    <?php
}
add_action( 'wp_head', 'bluu_google_analytics', 99 );

/**
 * Generate a lightened hex color for accent container tint.
 * Blends the accent color toward white at the given ratio (0–1).
 */
function bluu_lighten_hex( $hex, $ratio = 0.90 ) {
    $hex = ltrim( $hex, '#' );
    if ( strlen( $hex ) === 3 ) {
        $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    }
    if ( strlen( $hex ) !== 6 ) {
        return '#E8F0FE';
    }
    $r = hexdec( substr( $hex, 0, 2 ) );
    $g = hexdec( substr( $hex, 2, 2 ) );
    $b = hexdec( substr( $hex, 4, 2 ) );

    $r = (int) round( $r + ( 255 - $r ) * $ratio );
    $g = (int) round( $g + ( 255 - $g ) * $ratio );
    $b = (int) round( $b + ( 255 - $b ) * $ratio );

    return sprintf( '#%02x%02x%02x', $r, $g, $b );
}
