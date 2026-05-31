<?php
/**
 * ACF Local Field Groups
 * Registers all ACF field groups programmatically so they work without the DB.
 *
 * @package bluu-interactive
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'acf_add_local_field_group' ) ) {
    return;
}

// ── HOME PAGE ──────────────────────────────────────────────────────────────────
acf_add_local_field_group( array(
    'key'      => 'group_home_hero',
    'title'    => 'Home: Hero Section',
    'fields'   => array(
        array(
            'key'           => 'field_hero_badge',
            'label'         => 'Badge Text',
            'name'          => 'hero_badge',
            'type'          => 'text',
            'default_value' => 'B2B Growth Agency',
        ),
        array(
            'key'           => 'field_hero_headline',
            'label'         => 'Headline (line 2 becomes blue accent — use Enter to separate)',
            'name'          => 'hero_headline',
            'type'          => 'textarea',
            'rows'          => 2,
            'new_lines'     => '',
            'default_value' => "Your content operation.\nRunning. Every month.",
        ),
        array(
            'key'           => 'field_hero_subheadline',
            'label'         => 'Subheadline',
            'name'          => 'hero_subheadline',
            'type'          => 'textarea',
            'rows'          => 3,
            'default_value' => 'Bluu Interactive handles your research, content, publishing, and reporting — so your brand shows up consistently while you focus on running the business.',
        ),
        array(
            'key'           => 'field_hero_cta_primary_text',
            'label'         => 'Primary CTA Text',
            'name'          => 'hero_cta_primary_text',
            'type'          => 'text',
            'default_value' => 'Book a Discovery Call',
        ),
        array(
            'key'           => 'field_hero_cta_primary_url',
            'label'         => 'Primary CTA URL',
            'name'          => 'hero_cta_primary_url',
            'type'          => 'text',
            'default_value' => '/contact',
        ),
        array(
            'key'           => 'field_hero_cta_secondary_text',
            'label'         => 'Secondary CTA Text',
            'name'          => 'hero_cta_secondary_text',
            'type'          => 'text',
            'default_value' => "See What's Included",
        ),
        array(
            'key'           => 'field_hero_cta_secondary_url',
            'label'         => 'Secondary CTA URL',
            'name'          => 'hero_cta_secondary_url',
            'type'          => 'text',
            'default_value' => '#solution',
        ),
        array(
            'key'        => 'field_hero_stats',
            'label'      => 'Stats',
            'name'       => 'hero_stats',
            'type'       => 'repeater',
            'min'        => 0,
            'max'        => 6,
            'layout'     => 'table',
            'sub_fields' => array(
                array(
                    'key'           => 'field_hero_stat_number',
                    'label'         => 'Number',
                    'name'          => 'stat_number',
                    'type'          => 'text',
                    'default_value' => '',
                    'column_width'  => '',
                ),
                array(
                    'key'           => 'field_hero_stat_label',
                    'label'         => 'Label',
                    'name'          => 'stat_label',
                    'type'          => 'text',
                    'default_value' => '',
                    'column_width'  => '',
                ),
            ),
        ),
        array(
            'key'           => 'field_hero_image',
            'label'         => 'Hero Image',
            'name'          => 'hero_image',
            'type'          => 'image',
            'return_format' => 'array',
            'preview_size'  => 'medium',
            'library'       => 'all',
            'instructions'  => 'Right-hand image in the hero section. Recommended size: 900×675px (4:3). If left empty a default image is used.',
        ),
    ),
    'location' => array(
        array( array( 'param' => 'page_type',     'operator' => '==', 'value' => 'front_page' ) ),
        array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'front-page.php' ) ),
    ),
    'menu_order'            => 10,
    'position'              => 'normal',
    'style'                 => 'default',
    'label_placement'       => 'top',
    'instruction_placement' => 'label',
    'active'                => true,
) );

acf_add_local_field_group( array(
    'key'    => 'group_home_problem',
    'title'  => 'Home: Problem Section',
    'fields' => array(
        array(
            'key'           => 'field_problem_badge',
            'label'         => 'Badge',
            'name'          => 'problem_badge',
            'type'          => 'text',
            'default_value' => 'The Problem',
        ),
        array(
            'key'           => 'field_problem_headline',
            'label'         => 'Headline',
            'name'          => 'problem_headline',
            'type'          => 'text',
            'default_value' => 'Inconsistency is costing you clients.',
        ),
        array(
            'key'           => 'field_problem_body',
            'label'         => 'Body',
            'name'          => 'problem_body',
            'type'          => 'textarea',
            'rows'          => 3,
            'default_value' => 'Most growing teams are producing content when they can, not when they should — with no strategy behind it, no one accountable for it, and no clear picture of whether it\'s working.',
        ),
        array(
            'key'        => 'field_problem_items',
            'label'      => 'Problem Items',
            'name'       => 'problem_items',
            'type'       => 'repeater',
            'min'        => 0,
            'max'        => 6,
            'layout'     => 'block',
            'sub_fields' => array(
                array(
                    'key'           => 'field_problem_item_icon',
                    'label'         => 'Icon (SVG name)',
                    'name'          => 'icon',
                    'type'          => 'text',
                    'default_value' => 'x-circle',
                ),
                array(
                    'key'           => 'field_problem_item_title',
                    'label'         => 'Title',
                    'name'          => 'title',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_problem_item_description',
                    'label'         => 'Description',
                    'name'          => 'description',
                    'type'          => 'textarea',
                    'rows'          => 3,
                    'default_value' => '',
                ),
            ),
        ),
    ),
    'location'   => array(
        array( array( 'param' => 'page_type',     'operator' => '==', 'value' => 'front_page' ) ),
        array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'front-page.php' ) ),
    ),
    'menu_order' => 20,
    'active'     => true,
) );

acf_add_local_field_group( array(
    'key'    => 'group_home_solution',
    'title'  => 'Home: Solution / Pillars Section',
    'fields' => array(
        array(
            'key'           => 'field_solution_badge',
            'label'         => 'Solution Badge',
            'name'          => 'solution_badge',
            'type'          => 'text',
            'default_value' => 'The Solution',
        ),
        array(
            'key'           => 'field_solution_headline',
            'label'         => 'Solution Headline',
            'name'          => 'solution_headline',
            'type'          => 'text',
            'default_value' => 'One retainer. Everything running.',
        ),
        array(
            'key'           => 'field_solution_body',
            'label'         => 'Solution Body',
            'name'          => 'solution_body',
            'type'          => 'textarea',
            'rows'          => 3,
            'default_value' => 'We handle research, content creation, publishing, and reporting in one connected monthly retainer — so your brand shows up consistently, across every channel, without you having to manage it.',
        ),
        array(
            'key'           => 'field_solution_sidebar_title',
            'label'         => 'Sidebar Title',
            'name'          => 'solution_sidebar_title',
            'type'          => 'text',
            'default_value' => 'The complete content operation',
        ),
        array(
            'key'           => 'field_solution_sidebar_body',
            'label'         => 'Sidebar Body',
            'name'          => 'solution_sidebar_body',
            'type'          => 'textarea',
            'rows'          => 4,
            'default_value' => 'Instead of briefing three different suppliers and chasing deliverables across four different tools, Bluu runs your entire content operation in one seamless monthly engagement. Research informs content. Content gets published. Results get reported. Every month, without fail.',
        ),
        array(
            'key'           => 'field_solution_sidebar_cta_text',
            'label'         => 'Sidebar CTA Text',
            'name'          => 'solution_sidebar_cta_text',
            'type'          => 'text',
            'default_value' => "See what's included",
        ),
        array(
            'key'           => 'field_solution_sidebar_cta_url',
            'label'         => 'Sidebar CTA URL',
            'name'          => 'solution_sidebar_cta_url',
            'type'          => 'text',
            'default_value' => '/pricing',
        ),
    ),
    'location'   => array(
        array( array( 'param' => 'page_type',     'operator' => '==', 'value' => 'front_page' ) ),
        array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'front-page.php' ) ),
    ),
    'menu_order' => 30,
    'active'     => true,
) );

acf_add_local_field_group( array(
    'key'    => 'group_home_icp',
    'title'  => 'Home: ICP / Who We Serve Section',
    'fields' => array(
        array(
            'key'           => 'field_icp_badge',
            'label'         => 'Badge',
            'name'          => 'icp_badge',
            'type'          => 'text',
            'default_value' => 'Who We Serve',
        ),
        array(
            'key'           => 'field_icp_headline',
            'label'         => 'Headline',
            'name'          => 'icp_headline',
            'type'          => 'text',
            'default_value' => 'Built for teams who have outgrown doing content themselves.',
        ),
        array(
            'key'           => 'field_icp_body',
            'label'         => 'Body',
            'name'          => 'icp_body',
            'type'          => 'textarea',
            'rows'          => 3,
            'default_value' => '',
        ),
        array(
            'key'        => 'field_icp_verticals',
            'label'      => 'Verticals',
            'name'       => 'icp_verticals',
            'type'       => 'repeater',
            'min'        => 0,
            'max'        => 8,
            'layout'     => 'block',
            'sub_fields' => array(
                array(
                    'key'           => 'field_icp_vertical_icon',
                    'label'         => 'Icon',
                    'name'          => 'icon',
                    'type'          => 'text',
                    'default_value' => 'briefcase',
                ),
                array(
                    'key'           => 'field_icp_vertical_title',
                    'label'         => 'Title',
                    'name'          => 'title',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_icp_vertical_description',
                    'label'         => 'Description',
                    'name'          => 'description',
                    'type'          => 'textarea',
                    'rows'          => 3,
                    'default_value' => '',
                ),
            ),
        ),
        array(
            'key'           => 'field_home_cta_headline',
            'label'         => 'CTA Headline',
            'name'          => 'home_cta_headline',
            'type'          => 'text',
            'default_value' => 'Ready to hand off your content operation for good?',
        ),
        array(
            'key'           => 'field_home_cta_body',
            'label'         => 'CTA Body',
            'name'          => 'home_cta_body',
            'type'          => 'textarea',
            'rows'          => 2,
            'default_value' => 'Book a 15-minute Discovery Call. No pitch, no pressure — just an honest conversation to see if Bluu is the right fit for where your business is right now.',
        ),
        array(
            'key'           => 'field_home_cta_note',
            'label'         => 'CTA Note',
            'name'          => 'home_cta_note',
            'type'          => 'text',
            'default_value' => 'Limited monthly capacity.',
        ),
        array(
            'key'           => 'field_home_cta_button_text',
            'label'         => 'CTA Button Text',
            'name'          => 'home_cta_button_text',
            'type'          => 'text',
            'default_value' => 'Book a Discovery Call',
        ),
        array(
            'key'           => 'field_home_cta_button_url',
            'label'         => 'CTA Button URL',
            'name'          => 'home_cta_button_url',
            'type'          => 'text',
            'default_value' => '/contact',
        ),
    ),
    'location'   => array(
        array( array( 'param' => 'page_type',     'operator' => '==', 'value' => 'front_page' ) ),
        array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'front-page.php' ) ),
    ),
    'menu_order' => 40,
    'active'     => true,
) );

// ── PRICING PAGE ───────────────────────────────────────────────────────────────
acf_add_local_field_group( array(
    'key'    => 'group_pricing',
    'title'  => 'Pricing Page Fields',
    'fields' => array(
        array(
            'key'           => 'field_pricing_hero_headline',
            'label'         => 'Hero Headline',
            'name'          => 'pricing_hero_headline',
            'type'          => 'text',
            'default_value' => 'Transparent, All-Inclusive Pricing',
        ),
        array(
            'key'           => 'field_pricing_hero_subheadline',
            'label'         => 'Hero Subheadline',
            'name'          => 'pricing_hero_subheadline',
            'type'          => 'textarea',
            'rows'          => 2,
            'default_value' => 'No retainer games. No surprise invoices. One subscription that covers everything your growth engine needs.',
        ),
        array(
            'key'        => 'field_pricing_tiers',
            'label'      => 'Pricing Tiers',
            'name'       => 'pricing_tiers',
            'type'       => 'repeater',
            'min'        => 0,
            'max'        => 5,
            'layout'     => 'block',
            'sub_fields' => array(
                array(
                    'key'           => 'field_tier_badge',
                    'label'         => 'Badge',
                    'name'          => 'tier_badge',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_tier_name',
                    'label'         => 'Tier Name',
                    'name'          => 'tier_name',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_tier_price',
                    'label'         => 'Price',
                    'name'          => 'tier_price',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_tier_price_suffix',
                    'label'         => 'Price Suffix',
                    'name'          => 'tier_price_suffix',
                    'type'          => 'text',
                    'default_value' => '/month',
                ),
                array(
                    'key'           => 'field_tier_tagline',
                    'label'         => 'Tagline',
                    'name'          => 'tier_tagline',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_tier_features',
                    'label'         => 'Features (one per line)',
                    'name'          => 'tier_features',
                    'type'          => 'textarea',
                    'rows'          => 6,
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_tier_cta_text',
                    'label'         => 'CTA Text',
                    'name'          => 'tier_cta_text',
                    'type'          => 'text',
                    'default_value' => 'Get Started',
                ),
                array(
                    'key'           => 'field_tier_cta_url',
                    'label'         => 'CTA URL',
                    'name'          => 'tier_cta_url',
                    'type'          => 'text',
                    'default_value' => '/contact',
                ),
                array(
                    'key'           => 'field_tier_is_featured',
                    'label'         => 'Is Featured (Most Popular)?',
                    'name'          => 'tier_is_featured',
                    'type'          => 'true_false',
                    'default_value' => 0,
                ),
                array(
                    'key'           => 'field_tier_note',
                    'label'         => 'Footer Note',
                    'name'          => 'tier_note',
                    'type'          => 'text',
                    'default_value' => '',
                ),
            ),
        ),
        array(
            'key'        => 'field_pricing_faq',
            'label'      => 'FAQ Items',
            'name'       => 'pricing_faq',
            'type'       => 'repeater',
            'min'        => 0,
            'max'        => 20,
            'layout'     => 'block',
            'sub_fields' => array(
                array(
                    'key'           => 'field_faq_question',
                    'label'         => 'Question',
                    'name'          => 'question',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_faq_answer',
                    'label'         => 'Answer',
                    'name'          => 'answer',
                    'type'          => 'textarea',
                    'rows'          => 4,
                    'default_value' => '',
                ),
            ),
        ),
        array(
            'key'           => 'field_pricing_bottom_cta_headline',
            'label'         => 'Bottom CTA Headline',
            'name'          => 'pricing_bottom_cta_headline',
            'type'          => 'text',
            'default_value' => 'Not Sure Which Plan Fits?',
        ),
        array(
            'key'           => 'field_pricing_bottom_cta_body',
            'label'         => 'Bottom CTA Body',
            'name'          => 'pricing_bottom_cta_body',
            'type'          => 'textarea',
            'rows'          => 2,
            'default_value' => 'Let\'s talk. A 30-minute Discovery Call is free and commitment-free. We\'ll tell you exactly which plan — if any — makes sense for your stage.',
        ),
        array(
            'key'           => 'field_pricing_bottom_cta_button_text',
            'label'         => 'Bottom CTA Button Text',
            'name'          => 'pricing_bottom_cta_button_text',
            'type'          => 'text',
            'default_value' => 'Book a Discovery Call',
        ),
        array(
            'key'           => 'field_pricing_bottom_cta_button_url',
            'label'         => 'Bottom CTA Button URL',
            'name'          => 'pricing_bottom_cta_button_url',
            'type'          => 'text',
            'default_value' => '/contact',
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-pricing.php',
    ) ) ),
    'menu_order' => 10,
    'active'     => true,
) );

// ── INDUSTRIES PAGE ────────────────────────────────────────────────────────────
acf_add_local_field_group( array(
    'key'    => 'group_industries',
    'title'  => 'Industries Page Fields',
    'fields' => array(
        array(
            'key'           => 'field_industries_hero_headline',
            'label'         => 'Hero Headline',
            'name'          => 'industries_hero_headline',
            'type'          => 'text',
            'default_value' => 'Built for Industries Where Trust Is Non-Negotiable',
        ),
        array(
            'key'           => 'field_industries_hero_subheadline',
            'label'         => 'Hero Subheadline',
            'name'          => 'industries_hero_subheadline',
            'type'          => 'textarea',
            'rows'          => 2,
            'default_value' => 'We don\'t work in every industry. We go deep in four — where our expertise creates an unfair competitive advantage for our clients.',
        ),
        array(
            'key'        => 'field_industries',
            'label'      => 'Industries',
            'name'       => 'industries',
            'type'       => 'repeater',
            'min'        => 0,
            'max'        => 8,
            'layout'     => 'block',
            'sub_fields' => array(
                array(
                    'key'           => 'field_industry_icon',
                    'label'         => 'Icon',
                    'name'          => 'industry_icon',
                    'type'          => 'text',
                    'default_value' => 'briefcase',
                ),
                array(
                    'key'           => 'field_industry_name',
                    'label'         => 'Industry Name',
                    'name'          => 'industry_name',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_industry_tagline',
                    'label'         => 'Tagline',
                    'name'          => 'industry_tagline',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_industry_challenge',
                    'label'         => 'Challenge',
                    'name'          => 'industry_challenge',
                    'type'          => 'textarea',
                    'rows'          => 3,
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_industry_solution',
                    'label'         => 'Solution',
                    'name'          => 'industry_solution',
                    'type'          => 'textarea',
                    'rows'          => 3,
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_industry_stat_number',
                    'label'         => 'Stat Number',
                    'name'          => 'industry_stat_number',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_industry_stat_label',
                    'label'         => 'Stat Label',
                    'name'          => 'industry_stat_label',
                    'type'          => 'text',
                    'default_value' => '',
                ),
            ),
        ),
        array(
            'key'           => 'field_industries_bottom_cta_headline',
            'label'         => 'Bottom CTA Headline',
            'name'          => 'industries_bottom_cta_headline',
            'type'          => 'text',
            'default_value' => 'Your Industry. Your Rules. Our Engine.',
        ),
        array(
            'key'           => 'field_industries_bottom_cta_body',
            'label'         => 'Bottom CTA Body',
            'name'          => 'industries_bottom_cta_body',
            'type'          => 'textarea',
            'rows'          => 2,
            'default_value' => 'We only take on clients we know we can win for. Let\'s find out if we\'re the right fit.',
        ),
        array(
            'key'           => 'field_industries_bottom_cta_button_text',
            'label'         => 'Bottom CTA Button Text',
            'name'          => 'industries_bottom_cta_button_text',
            'type'          => 'text',
            'default_value' => 'Book a Discovery Call',
        ),
        array(
            'key'           => 'field_industries_bottom_cta_button_url',
            'label'         => 'Bottom CTA Button URL',
            'name'          => 'industries_bottom_cta_button_url',
            'type'          => 'text',
            'default_value' => '/contact',
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-industries.php',
    ) ) ),
    'menu_order' => 10,
    'active'     => true,
) );

// ── CONTACT PAGE ───────────────────────────────────────────────────────────────
acf_add_local_field_group( array(
    'key'    => 'group_contact',
    'title'  => 'Contact Page Fields',
    'fields' => array(
        array(
            'key'           => 'field_contact_hero_headline',
            'label'         => 'Hero Headline',
            'name'          => 'contact_hero_headline',
            'type'          => 'text',
            'default_value' => 'Let\'s Build Your Unified Growth Engine',
        ),
        array(
            'key'           => 'field_contact_hero_subheadline',
            'label'         => 'Hero Subheadline',
            'name'          => 'contact_hero_subheadline',
            'type'          => 'textarea',
            'rows'          => 2,
            'default_value' => 'No pitch decks. No canned proposals. Tell us about your situation and we\'ll have an honest conversation about what growth actually looks like for you.',
        ),
        array(
            'key'           => 'field_contact_email',
            'label'         => 'Contact Email',
            'name'          => 'contact_email',
            'type'          => 'text',
            'default_value' => 'hello@bluuhq.com',
        ),
        array(
            'key'           => 'field_contact_phone',
            'label'         => 'Contact Phone',
            'name'          => 'contact_phone',
            'type'          => 'text',
            'default_value' => '',
        ),
        array(
            'key'           => 'field_contact_location',
            'label'         => 'Location',
            'name'          => 'contact_location',
            'type'          => 'text',
            'default_value' => 'Remote-first, serving North America',
        ),
        array(
            'key'           => 'field_contact_form_headline',
            'label'         => 'Form Headline',
            'name'          => 'contact_form_headline',
            'type'          => 'text',
            'default_value' => 'Start the Conversation',
        ),
        array(
            'key'        => 'field_contact_process',
            'label'      => 'Process Steps',
            'name'       => 'contact_process',
            'type'       => 'repeater',
            'min'        => 0,
            'max'        => 5,
            'layout'     => 'block',
            'sub_fields' => array(
                array(
                    'key'           => 'field_process_step_number',
                    'label'         => 'Step Number',
                    'name'          => 'step_number',
                    'type'          => 'text',
                    'default_value' => '01',
                ),
                array(
                    'key'           => 'field_process_step_title',
                    'label'         => 'Step Title',
                    'name'          => 'step_title',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_process_step_description',
                    'label'         => 'Step Description',
                    'name'          => 'step_description',
                    'type'          => 'textarea',
                    'rows'          => 3,
                    'default_value' => '',
                ),
            ),
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-contact.php',
    ) ) ),
    'menu_order' => 10,
    'active'     => true,
) );

// ── FAQ PAGE ───────────────────────────────────────────────────────────────────
acf_add_local_field_group( array(
    'key'    => 'group_faq_page',
    'title'  => 'FAQ Page',
    'fields' => array(

        // Hero
        array(
            'key'           => 'field_faq_headline',
            'label'         => 'Page Headline',
            'name'          => 'faq_headline',
            'type'          => 'text',
            'default_value' => 'Everything You Need to Know',
        ),
        array(
            'key'           => 'field_faq_subheadline',
            'label'         => 'Page Subheadline',
            'name'          => 'faq_subheadline',
            'type'          => 'textarea',
            'rows'          => 2,
            'default_value' => 'Straight answers about how Bluu Interactive works, what we cost, and what you can expect.',
        ),

        // FAQ Categories (repeater → sub-repeater)
        array(
            'key'        => 'field_faq_categories',
            'label'      => 'FAQ Categories',
            'name'       => 'faq_categories',
            'type'       => 'repeater',
            'min'        => 1,
            'layout'     => 'block',
            'button_label' => 'Add Category',
            'sub_fields' => array(

                array(
                    'key'           => 'field_faq_cat_name',
                    'label'         => 'Category Name',
                    'name'          => 'category_name',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_faq_cat_desc',
                    'label'         => 'Category Description (optional)',
                    'name'          => 'category_description',
                    'type'          => 'text',
                    'default_value' => '',
                ),
                array(
                    'key'           => 'field_faq_cat_icon',
                    'label'         => 'Category Icon',
                    'name'          => 'category_icon',
                    'type'          => 'select',
                    'choices'       => array(
                        'info'    => 'General / Info',
                        'pricing' => 'Pricing',
                        'content' => 'Content',
                        'tech'    => 'Technology',
                        'start'   => 'Getting Started',
                        'default' => 'Default (Question mark)',
                    ),
                    'default_value' => 'default',
                ),

                // Nested repeater: FAQ items within each category
                array(
                    'key'          => 'field_faq_items',
                    'label'        => 'Questions & Answers',
                    'name'         => 'faq_items',
                    'type'         => 'repeater',
                    'min'          => 1,
                    'layout'       => 'row',
                    'button_label' => 'Add Question',
                    'sub_fields'   => array(
                        array(
                            'key'           => 'field_faq_question',
                            'label'         => 'Question',
                            'name'          => 'question',
                            'type'          => 'text',
                            'default_value' => '',
                        ),
                        array(
                            'key'           => 'field_faq_answer',
                            'label'         => 'Answer',
                            'name'          => 'answer',
                            'type'          => 'textarea',
                            'rows'          => 5,
                            'default_value' => '',
                            'instructions'  => 'Supports line breaks. Use **bold** notation — it will be rendered as bold text.',
                        ),
                    ),
                ),
            ),
        ),

        // Bottom CTA
        array(
            'key'           => 'field_faq_cta_headline',
            'label'         => 'CTA Headline',
            'name'          => 'faq_cta_headline',
            'type'          => 'text',
            'default_value' => 'Still Have Questions?',
        ),
        array(
            'key'           => 'field_faq_cta_body',
            'label'         => 'CTA Body',
            'name'          => 'faq_cta_body',
            'type'          => 'textarea',
            'rows'          => 2,
            'default_value' => "We'd rather talk than leave you guessing. Book a no-pressure, 30-minute discovery call and we'll answer everything specific to your situation.",
        ),
        array(
            'key'           => 'field_faq_cta_button_text',
            'label'         => 'CTA Button Text',
            'name'          => 'faq_cta_button_text',
            'type'          => 'text',
            'default_value' => 'Book a Discovery Call',
        ),
        array(
            'key'  => 'field_faq_cta_button_url',
            'label' => 'CTA Button URL',
            'name'  => 'faq_cta_button_url',
            'type'  => 'text',
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-faq.php',
    ) ) ),
    'menu_order' => 10,
    'active'     => true,
) );

// ── USE CASE PAGE TEMPLATE ─────────────────────────────────────────────────────

// Group 1 — Page meta & hero
acf_add_local_field_group( array(
    'key'    => 'group_uc_hero',
    'title'  => 'Use Case: Page Meta & Hero',
    'fields' => array(
        array(
            'key'     => 'field_uc_industry',
            'label'   => 'Industry',
            'name'    => 'uc_industry',
            'type'    => 'select',
            'choices' => array(
                'tech-saas'              => 'Tech & SaaS',
                'agencies-consultants'   => 'Agencies & Consultants',
                'ecommerce-dtc'          => 'E-commerce & DTC',
                'professional-services'  => 'Professional Services',
            ),
            'allow_null'    => 0,
            'multiple'      => 0,
            'return_format' => 'value',
        ),
        array(
            'key'           => 'field_uc_seo_title',
            'label'         => 'SEO Page Title',
            'name'          => 'uc_seo_title',
            'type'          => 'text',
            'maxlength'     => 60,
            'instructions'  => 'Used in the <title> tag. Different from the hero headline.',
        ),
        array(
            'key'          => 'field_uc_meta_description',
            'label'        => 'Meta Description',
            'name'         => 'uc_meta_description',
            'type'         => 'textarea',
            'maxlength'    => 155,
            'rows'         => 3,
            'instructions' => 'Meta description for search engines.',
        ),
        array(
            'key'          => 'field_uc_hero_tag',
            'label'        => 'Hero Tag',
            'name'         => 'uc_hero_tag',
            'type'         => 'text',
            'maxlength'    => 40,
            'instructions' => 'Small label above the headline. E.g. "Use case — Tech & SaaS"',
        ),
        array(
            'key'          => 'field_uc_hero_headline',
            'label'        => 'Hero Headline',
            'name'         => 'uc_hero_headline',
            'type'         => 'text',
            'maxlength'    => 80,
            'instructions' => 'Main H1 headline. Outcome-led. Sentence case.',
        ),
        array(
            'key'          => 'field_uc_hero_subheadline',
            'label'        => 'Hero Subheadline',
            'name'         => 'uc_hero_subheadline',
            'type'         => 'textarea',
            'maxlength'    => 180,
            'rows'         => 3,
            'instructions' => '1–2 sentences below the headline. Plain language, no jargon.',
        ),
        array(
            'key'           => 'field_uc_hero_cta_label',
            'label'         => 'Primary CTA Label',
            'name'          => 'uc_hero_cta_label',
            'type'          => 'text',
            'maxlength'     => 40,
            'default_value' => 'Book a Discovery Call',
        ),
        array(
            'key'           => 'field_uc_hero_cta_url',
            'label'         => 'Primary CTA URL',
            'name'          => 'uc_hero_cta_url',
            'type'          => 'text',
            'default_value' => '/contact',
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-use-case.php',
    ) ) ),
    'menu_order' => 10,
    'active'     => true,
) );

// Group 2 — The situation
acf_add_local_field_group( array(
    'key'    => 'group_uc_situation',
    'title'  => 'Use Case: The Situation',
    'fields' => array(
        array(
            'key'          => 'field_uc_situation_heading',
            'label'        => 'Section Heading',
            'name'         => 'uc_situation_heading',
            'type'         => 'text',
            'maxlength'    => 60,
            'default_value' => 'The situation',
        ),
        array(
            'key'          => 'field_uc_situation_body',
            'label'        => 'Section Body',
            'name'         => 'uc_situation_body',
            'type'         => 'textarea',
            'maxlength'    => 400,
            'rows'         => 4,
            'instructions' => '2–3 sentences describing the specific pain this use case addresses. Written for the reader, not about them.',
        ),
        array(
            'key'          => 'field_uc_situation_pain_points',
            'label'        => 'Pain Points',
            'name'         => 'uc_situation_pain_points',
            'type'         => 'repeater',
            'min'          => 3,
            'max'          => 3,
            'layout'       => 'block',
            'button_label' => 'Add pain point',
            'sub_fields'   => array(
                array(
                    'key'       => 'field_uc_pain_title',
                    'label'     => 'Title',
                    'name'      => 'uc_pain_title',
                    'type'      => 'text',
                    'maxlength' => 50,
                ),
                array(
                    'key'       => 'field_uc_pain_body',
                    'label'     => 'Body',
                    'name'      => 'uc_pain_body',
                    'type'      => 'textarea',
                    'maxlength' => 120,
                    'rows'      => 2,
                ),
            ),
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-use-case.php',
    ) ) ),
    'menu_order' => 20,
    'active'     => true,
) );

// Group 3 — The approach
acf_add_local_field_group( array(
    'key'    => 'group_uc_approach',
    'title'  => 'Use Case: The Approach',
    'fields' => array(
        array(
            'key'           => 'field_uc_approach_heading',
            'label'         => 'Section Heading',
            'name'          => 'uc_approach_heading',
            'type'          => 'text',
            'maxlength'     => 60,
            'default_value' => 'How Bluu approaches this',
        ),
        array(
            'key'          => 'field_uc_approach_body',
            'label'        => 'Section Body',
            'name'         => 'uc_approach_body',
            'type'         => 'textarea',
            'maxlength'    => 400,
            'rows'         => 4,
            'instructions' => "2–3 sentences explaining Bluu's method for this use case. Specific, not generic.",
        ),
        array(
            'key'          => 'field_uc_approach_steps',
            'label'        => 'Steps',
            'name'         => 'uc_approach_steps',
            'type'         => 'repeater',
            'min'          => 3,
            'max'          => 4,
            'layout'       => 'block',
            'button_label' => 'Add step',
            'sub_fields'   => array(
                array(
                    'key'   => 'field_uc_step_number',
                    'label' => 'Step Number',
                    'name'  => 'uc_step_number',
                    'type'  => 'text',
                ),
                array(
                    'key'       => 'field_uc_step_title',
                    'label'     => 'Step Title',
                    'name'      => 'uc_step_title',
                    'type'      => 'text',
                    'maxlength' => 50,
                ),
                array(
                    'key'       => 'field_uc_step_body',
                    'label'     => 'Step Body',
                    'name'      => 'uc_step_body',
                    'type'      => 'textarea',
                    'maxlength' => 140,
                    'rows'      => 2,
                ),
            ),
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-use-case.php',
    ) ) ),
    'menu_order' => 30,
    'active'     => true,
) );

// Group 4 — What you get
acf_add_local_field_group( array(
    'key'    => 'group_uc_deliverables',
    'title'  => 'Use Case: What You Get',
    'fields' => array(
        array(
            'key'           => 'field_uc_deliverables_heading',
            'label'         => 'Section Heading',
            'name'          => 'uc_deliverables_heading',
            'type'          => 'text',
            'maxlength'     => 60,
            'default_value' => 'What you receive',
        ),
        array(
            'key'          => 'field_uc_deliverables_intro',
            'label'        => 'Intro Sentence',
            'name'         => 'uc_deliverables_intro',
            'type'         => 'textarea',
            'maxlength'    => 200,
            'rows'         => 2,
            'instructions' => 'One sentence framing the deliverables list.',
        ),
        array(
            'key'          => 'field_uc_deliverables_list',
            'label'        => 'Deliverables',
            'name'         => 'uc_deliverables_list',
            'type'         => 'repeater',
            'min'          => 4,
            'max'          => 6,
            'layout'       => 'block',
            'button_label' => 'Add deliverable',
            'sub_fields'   => array(
                array(
                    'key'       => 'field_uc_deliverable_name',
                    'label'     => 'Deliverable Name',
                    'name'      => 'uc_deliverable_name',
                    'type'      => 'text',
                    'maxlength' => 60,
                ),
                array(
                    'key'       => 'field_uc_deliverable_detail',
                    'label'     => 'Detail',
                    'name'      => 'uc_deliverable_detail',
                    'type'      => 'textarea',
                    'maxlength' => 120,
                    'rows'      => 2,
                ),
            ),
        ),
        array(
            'key'          => 'field_uc_cadence',
            'label'        => 'Cadence Note',
            'name'         => 'uc_cadence',
            'type'         => 'text',
            'maxlength'    => 80,
            'default_value' => 'Delivered weekly as part of your retainer.',
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-use-case.php',
    ) ) ),
    'menu_order' => 40,
    'active'     => true,
) );

// Group 5 — Who this is for
acf_add_local_field_group( array(
    'key'    => 'group_uc_fit',
    'title'  => 'Use Case: Who This Is For',
    'fields' => array(
        array(
            'key'           => 'field_uc_fit_heading',
            'label'         => 'Section Heading',
            'name'          => 'uc_fit_heading',
            'type'          => 'text',
            'maxlength'     => 60,
            'default_value' => 'Who this is right for',
        ),
        array(
            'key'          => 'field_uc_fit_list',
            'label'        => 'Fit Statements',
            'name'         => 'uc_fit_list',
            'type'         => 'repeater',
            'min'          => 3,
            'max'          => 4,
            'layout'       => 'block',
            'button_label' => 'Add fit statement',
            'instructions' => 'Each statement should start with "You are..." or "You have..."',
            'sub_fields'   => array(
                array(
                    'key'       => 'field_uc_fit_statement',
                    'label'     => 'Statement',
                    'name'      => 'uc_fit_statement',
                    'type'      => 'textarea',
                    'maxlength' => 120,
                    'rows'      => 2,
                ),
            ),
        ),
        array(
            'key'          => 'field_uc_not_fit_note',
            'label'        => 'Not a Fit Note',
            'name'         => 'uc_not_fit_note',
            'type'         => 'textarea',
            'maxlength'    => 180,
            'rows'         => 2,
            'instructions' => 'Optional. One honest sentence about who this is NOT right for. Builds trust.',
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-use-case.php',
    ) ) ),
    'menu_order' => 50,
    'active'     => true,
) );

// Group 6 — Related use cases
acf_add_local_field_group( array(
    'key'    => 'group_uc_related',
    'title'  => 'Use Case: Related Use Cases',
    'fields' => array(
        array(
            'key'          => 'field_uc_related_pages',
            'label'        => 'Related Pages',
            'name'         => 'uc_related_pages',
            'type'         => 'repeater',
            'min'          => 2,
            'max'          => 3,
            'layout'       => 'block',
            'button_label' => 'Add related page',
            'sub_fields'   => array(
                array(
                    'key'   => 'field_uc_related_title',
                    'label' => 'Title',
                    'name'  => 'uc_related_title',
                    'type'  => 'text',
                ),
                array(
                    'key'   => 'field_uc_related_url',
                    'label' => 'URL',
                    'name'  => 'uc_related_url',
                    'type'  => 'text',
                ),
                array(
                    'key'       => 'field_uc_related_description',
                    'label'     => 'Description',
                    'name'      => 'uc_related_description',
                    'type'      => 'textarea',
                    'maxlength' => 100,
                    'rows'      => 2,
                ),
            ),
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-use-case.php',
    ) ) ),
    'menu_order' => 60,
    'active'     => true,
) );

// Group 7 — Closing CTA
acf_add_local_field_group( array(
    'key'    => 'group_uc_cta',
    'title'  => 'Use Case: Closing CTA',
    'fields' => array(
        array(
            'key'          => 'field_uc_cta_heading',
            'label'        => 'CTA Heading',
            'name'         => 'uc_cta_heading',
            'type'         => 'text',
            'maxlength'    => 80,
            'instructions' => 'Closing CTA headline. Specific to this use case, not generic.',
        ),
        array(
            'key'          => 'field_uc_cta_subtext',
            'label'        => 'CTA Subtext',
            'name'         => 'uc_cta_subtext',
            'type'         => 'textarea',
            'maxlength'    => 200,
            'rows'         => 3,
            'instructions' => '1–2 sentences. Low pressure. References the Discovery Call.',
        ),
        array(
            'key'           => 'field_uc_cta_primary_label',
            'label'         => 'Primary Button Label',
            'name'          => 'uc_cta_primary_label',
            'type'          => 'text',
            'maxlength'     => 40,
            'default_value' => 'Book a Discovery Call',
        ),
        array(
            'key'           => 'field_uc_cta_primary_url',
            'label'         => 'Primary Button URL',
            'name'          => 'uc_cta_primary_url',
            'type'          => 'text',
            'default_value' => '/contact',
        ),
        array(
            'key'           => 'field_uc_cta_secondary_label',
            'label'         => 'Secondary Button Label',
            'name'          => 'uc_cta_secondary_label',
            'type'          => 'text',
            'maxlength'     => 40,
            'default_value' => 'See pricing',
        ),
        array(
            'key'           => 'field_uc_cta_secondary_url',
            'label'         => 'Secondary Button URL',
            'name'          => 'uc_cta_secondary_url',
            'type'          => 'text',
            'default_value' => '/pricing',
        ),
    ),
    'location'   => array( array( array(
        'param'    => 'page_template',
        'operator' => '==',
        'value'    => 'page-use-case.php',
    ) ) ),
    'menu_order' => 70,
    'active'     => true,
) );

// ── INDUSTRY PAGE (page-industry.php) ─────────────────────────────────────────

// Group 1 — SEO & meta
acf_add_local_field_group( array(
    'key'    => 'group_ind_meta',
    'title'  => 'Industry: SEO & Meta',
    'fields' => array(
        array( 'key' => 'field_ind_seo_title',        'label' => 'SEO Title',          'name' => 'ind_seo_title',        'type' => 'text',     'maxlength' => 60 ),
        array( 'key' => 'field_ind_meta_description', 'label' => 'Meta Description',   'name' => 'ind_meta_description', 'type' => 'textarea', 'maxlength' => 155, 'rows' => 3 ),
        array( 'key' => 'field_ind_industry_slug',    'label' => 'Industry Slug',       'name' => 'ind_industry_slug',    'type' => 'text', 'instructions' => 'e.g. tech-saas — matches URL segment' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-industry.php' ) ) ),
    'menu_order' => 10, 'active' => true,
) );

// Group 2 — Hero
acf_add_local_field_group( array(
    'key'    => 'group_ind_hero',
    'title'  => 'Industry: Hero',
    'fields' => array(
        array( 'key' => 'field_ind_hero_tag',         'label' => 'Tag',         'name' => 'ind_hero_tag',         'type' => 'text',     'maxlength' => 60,  'default_value' => 'Industry — Tech & SaaS startups' ),
        array( 'key' => 'field_ind_hero_headline',    'label' => 'Headline',    'name' => 'ind_hero_headline',    'type' => 'text',     'maxlength' => 100, 'default_value' => 'You are building the product. We run the content.' ),
        array( 'key' => 'field_ind_hero_subheadline', 'label' => 'Subheadline', 'name' => 'ind_hero_subheadline', 'type' => 'textarea', 'rows' => 3,        'default_value' => 'SaaS founders are pulled in every direction. Content is always the thing that gets pushed to next week — and next week never comes. Bluu becomes your content team: research, writing, publishing, and results tracking handled every month without you having to manage it.' ),
        array( 'key' => 'field_ind_hero_cta_label',   'label' => 'CTA Label',   'name' => 'ind_hero_cta_label',   'type' => 'text',     'default_value' => 'Book a Discovery Call' ),
        array( 'key' => 'field_ind_hero_cta_url',     'label' => 'CTA URL',     'name' => 'ind_hero_cta_url',     'type' => 'text',      'default_value' => '/contact' ),
        array( 'key' => 'field_ind_hero_image',       'label' => 'Hero Image',  'name' => 'ind_hero_image',       'type' => 'image',    'return_format' => 'array', 'preview_size' => 'medium', 'instructions' => 'Right-hand hero image. ~1200×800px recommended.' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-industry.php' ) ) ),
    'menu_order' => 20, 'active' => true,
) );

// Group 3 — Pain
acf_add_local_field_group( array(
    'key'    => 'group_ind_pain',
    'title'  => 'Industry: Pain Section',
    'fields' => array(
        array( 'key' => 'field_ind_pain_heading', 'label' => 'Heading', 'name' => 'ind_pain_heading', 'type' => 'text', 'default_value' => 'The content problem every SaaS founder recognises' ),
        array( 'key' => 'field_ind_pain_body',    'label' => 'Body',    'name' => 'ind_pain_body',    'type' => 'textarea', 'rows' => 4, 'default_value' => 'You know content drives pipeline. You know competitor intelligence matters. You know your personal brand on LinkedIn is an untapped growth channel. But between product, sales, and team, none of it gets the attention it deserves. Content is something you intend to do properly — just not this sprint, not this quarter, not until things slow down. Things do not slow down.' ),
        array( 'key' => 'field_ind_pain_1_title', 'label' => 'Pain 1 Title', 'name' => 'ind_pain_point_1_title', 'type' => 'text', 'default_value' => 'No competitor visibility' ),
        array( 'key' => 'field_ind_pain_1_body',  'label' => 'Pain 1 Body',  'name' => 'ind_pain_point_1_body',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'By the time you notice a competitor\'s new positioning or campaign, they have had weeks of impact. Reactive awareness is not a competitive advantage.' ),
        array( 'key' => 'field_ind_pain_2_title', 'label' => 'Pain 2 Title', 'name' => 'ind_pain_point_2_title', 'type' => 'text', 'default_value' => 'Inconsistent publishing' ),
        array( 'key' => 'field_ind_pain_2_body',  'label' => 'Pain 2 Body',  'name' => 'ind_pain_point_2_body',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'Posts go up when someone has time. Months pass between pieces. The compounding effect of consistent content never kicks in because there is no consistent engine behind it.' ),
        array( 'key' => 'field_ind_pain_3_title', 'label' => 'Pain 3 Title', 'name' => 'ind_pain_point_3_title', 'type' => 'text', 'default_value' => 'Founder brand invisible' ),
        array( 'key' => 'field_ind_pain_3_body',  'label' => 'Pain 3 Body',  'name' => 'ind_pain_point_3_body',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'Your name and perspective should be building trust with your target market every week. Instead they are building product documentation and replying to investor updates.' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-industry.php' ) ) ),
    'menu_order' => 30, 'active' => true,
) );

// Group 4 — Solution
acf_add_local_field_group( array(
    'key'    => 'group_ind_solution',
    'title'  => 'Industry: Solution Section',
    'fields' => array(
        array( 'key' => 'field_ind_solution_heading', 'label' => 'Heading', 'name' => 'ind_solution_heading', 'type' => 'text', 'default_value' => 'What the retainer covers for SaaS teams' ),
        array( 'key' => 'field_ind_solution_body',    'label' => 'Body',    'name' => 'ind_solution_body',    'type' => 'textarea', 'rows' => 3, 'default_value' => 'Bluu runs a complete monthly content operation tailored to the specific needs of a SaaS startup. Everything below is included in a single flat retainer — no project fees, no hourly billing, no scope creep conversations.' ),
        array( 'key' => 'field_ind_solution_image',   'label' => 'Section Image', 'name' => 'ind_solution_image', 'type' => 'image', 'return_format' => 'array', 'preview_size' => 'medium', 'instructions' => 'Image shown alongside the solution list.' ),
        array( 'key' => 'field_ind_sol_1_title', 'label' => 'Item 1 Title', 'name' => 'ind_solution_item_1_title', 'type' => 'text', 'default_value' => 'Weekly competitor intelligence' ),
        array( 'key' => 'field_ind_sol_1_body',  'label' => 'Item 1 Body',  'name' => 'ind_solution_item_1_body',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'A structured weekly digest monitoring your top competitors — content output, messaging shifts, new feature announcements, and positioning changes. Delivered every Monday.' ),
        array( 'key' => 'field_ind_sol_2_title', 'label' => 'Item 2 Title', 'name' => 'ind_solution_item_2_title', 'type' => 'text', 'default_value' => 'Founder brand content' ),
        array( 'key' => 'field_ind_sol_2_body',  'label' => 'Item 2 Body',  'name' => 'ind_solution_item_2_body',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'Consistent LinkedIn content written in your voice — opinion, market commentary, product perspective, and lessons learned. Published on your schedule without taking hours from your week.' ),
        array( 'key' => 'field_ind_sol_3_title', 'label' => 'Item 3 Title', 'name' => 'ind_solution_item_3_title', 'type' => 'text', 'default_value' => 'Long-form content and repurposing' ),
        array( 'key' => 'field_ind_sol_3_body',  'label' => 'Item 3 Body',  'name' => 'ind_solution_item_3_body',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'Blog posts, LinkedIn articles, and newsletter content — each piece repurposed across every channel so your best thinking reaches the widest possible audience.' ),
        array( 'key' => 'field_ind_sol_4_title', 'label' => 'Item 4 Title', 'name' => 'ind_solution_item_4_title', 'type' => 'text', 'default_value' => 'Product launch content packages' ),
        array( 'key' => 'field_ind_sol_4_body',  'label' => 'Item 4 Body',  'name' => 'ind_solution_item_4_body',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'A complete content package for every significant launch or feature release — blog post, email, LinkedIn posts, X thread, and social captions — ready before the launch date.' ),
        array( 'key' => 'field_ind_sol_5_title', 'label' => 'Item 5 Title', 'name' => 'ind_solution_item_5_title', 'type' => 'text', 'default_value' => 'Monthly performance reporting' ),
        array( 'key' => 'field_ind_sol_5_body',  'label' => 'Item 5 Body',  'name' => 'ind_solution_item_5_body',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'A clean monthly report covering what content performed, what drove engagement, and what changes in the month ahead. No vanity metrics — just a clear picture of what is working.' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-industry.php' ) ) ),
    'menu_order' => 40, 'active' => true,
) );

// Group 5 — Who it's for
acf_add_local_field_group( array(
    'key'    => 'group_ind_who',
    'title'  => 'Industry: Who This Is For',
    'fields' => array(
        array( 'key' => 'field_ind_who_heading', 'label' => 'Heading', 'name' => 'ind_who_heading', 'type' => 'text', 'default_value' => 'Who this is right for' ),
        array( 'key' => 'field_ind_who_body',    'label' => 'Body',    'name' => 'ind_who_body',    'type' => 'textarea', 'rows' => 3, 'default_value' => 'Bluu works best with SaaS companies between seed and Series B where the founding team is still deeply involved in product and sales, and content is chronically under-resourced as a result. If you have a full in-house content team, you probably do not need us. If you are doing it yourself or not doing it at all, you almost certainly do.' ),
        array( 'key' => 'field_ind_who_1', 'label' => 'Statement 1', 'name' => 'ind_who_item_1', 'type' => 'textarea', 'rows' => 2, 'default_value' => 'You are a seed to Series B SaaS company with between 2 and 30 people and no dedicated content resource.' ),
        array( 'key' => 'field_ind_who_2', 'label' => 'Statement 2', 'name' => 'ind_who_item_2', 'type' => 'textarea', 'rows' => 2, 'default_value' => 'You are shipping product in a competitive category where positioning and content visibility genuinely influence purchase decisions.' ),
        array( 'key' => 'field_ind_who_3', 'label' => 'Statement 3', 'name' => 'ind_who_item_3', 'type' => 'textarea', 'rows' => 2, 'default_value' => 'You want content that is informed by real market intelligence — not just blog posts written in a vacuum.' ),
        array( 'key' => 'field_ind_who_4', 'label' => 'Statement 4', 'name' => 'ind_who_item_4', 'type' => 'textarea', 'rows' => 2, 'default_value' => 'You have tried to manage content yourself or with a freelancer and it has been inconsistent. You want a system, not another supplier to chase.' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-industry.php' ) ) ),
    'menu_order' => 50, 'active' => true,
) );

// Group 6 — Use cases grid
acf_add_local_field_group( array(
    'key'    => 'group_ind_usecases',
    'title'  => 'Industry: Use Cases Grid',
    'fields' => array(
        array( 'key' => 'field_ind_usecases_heading', 'label' => 'Heading', 'name' => 'ind_usecases_heading', 'type' => 'text', 'default_value' => 'Use cases for Tech & SaaS startups' ),
        array( 'key' => 'field_ind_usecases_intro',   'label' => 'Intro',   'name' => 'ind_usecases_intro',   'type' => 'textarea', 'rows' => 2, 'default_value' => 'Each use case below is a specific way Bluu solves a specific problem for SaaS teams. Most retainers combine two or three use cases depending on what your business needs most right now.' ),
        array(
            'key'          => 'field_ind_use_cases',
            'label'        => 'Use Cases',
            'name'         => 'ind_use_cases',
            'type'         => 'repeater',
            'min'          => 2,
            'max'          => 6,
            'layout'       => 'block',
            'button_label' => 'Add use case',
            'sub_fields'   => array(
                array( 'key' => 'field_ind_uc_title',       'label' => 'Title',       'name' => 'ind_uc_title',       'type' => 'text' ),
                array( 'key' => 'field_ind_uc_description', 'label' => 'Description', 'name' => 'ind_uc_description', 'type' => 'textarea', 'rows' => 2 ),
                array( 'key' => 'field_ind_uc_url',         'label' => 'URL',         'name' => 'ind_uc_url',         'type' => 'text' ),
                array( 'key' => 'field_ind_uc_cta',         'label' => 'CTA Text',    'name' => 'ind_uc_cta',         'type' => 'text', 'default_value' => 'See this use case' ),
            ),
        ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-industry.php' ) ) ),
    'menu_order' => 60, 'active' => true,
) );

// Group 7 — Pricing callout
acf_add_local_field_group( array(
    'key'    => 'group_ind_pricing',
    'title'  => 'Industry: Pricing Callout',
    'fields' => array(
        array( 'key' => 'field_ind_pricing_heading',   'label' => 'Heading',   'name' => 'ind_pricing_heading',   'type' => 'text',     'default_value' => 'One flat monthly retainer. No surprises.' ),
        array( 'key' => 'field_ind_pricing_body',      'label' => 'Body',      'name' => 'ind_pricing_body',      'type' => 'textarea', 'rows' => 3, 'default_value' => 'Bluu retainers for SaaS startups start at $1,500 per month and scale to $3,500 depending on the volume of content, number of platforms, and depth of intelligence coverage you need. No project fees. No hourly billing. Everything in one predictable monthly number.' ),
        array( 'key' => 'field_ind_pricing_cta_label', 'label' => 'CTA Label', 'name' => 'ind_pricing_cta_label', 'type' => 'text',     'default_value' => 'See full pricing' ),
        array( 'key' => 'field_ind_pricing_cta_url',   'label' => 'CTA URL',   'name' => 'ind_pricing_cta_url',   'type' => 'text',      'default_value' => '/pricing' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-industry.php' ) ) ),
    'menu_order' => 70, 'active' => true,
) );

// Group 8 — Closing CTA
acf_add_local_field_group( array(
    'key'    => 'group_ind_cta',
    'title'  => 'Industry: Closing CTA',
    'fields' => array(
        array( 'key' => 'field_ind_cta_heading',         'label' => 'Heading',          'name' => 'ind_cta_heading',         'type' => 'text',     'default_value' => 'Stop putting content off until next sprint.' ),
        array( 'key' => 'field_ind_cta_subtext',         'label' => 'Subtext',          'name' => 'ind_cta_subtext',         'type' => 'textarea', 'rows' => 2, 'default_value' => 'Book a 15-minute Discovery Call. We will tell you honestly whether Bluu makes sense for your stage, your team size, and your goals. No pitch, no pressure.' ),
        array( 'key' => 'field_ind_cta_primary_label',   'label' => 'Primary Label',    'name' => 'ind_cta_primary_label',   'type' => 'text',     'default_value' => 'Book a Discovery Call' ),
        array( 'key' => 'field_ind_cta_primary_url',     'label' => 'Primary URL',      'name' => 'ind_cta_primary_url',     'type' => 'text',      'default_value' => '/contact' ),
        array( 'key' => 'field_ind_cta_secondary_label', 'label' => 'Secondary Label',  'name' => 'ind_cta_secondary_label', 'type' => 'text',     'default_value' => 'See pricing' ),
        array( 'key' => 'field_ind_cta_secondary_url',   'label' => 'Secondary URL',    'name' => 'ind_cta_secondary_url',   'type' => 'text',      'default_value' => '/pricing' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-industry.php' ) ) ),
    'menu_order' => 80, 'active' => true,
) );

// ── Sub-industry (si_*) field groups ─────────────────────────────────────────
// Targeting page-subindustry.php

// SI Group 1 — SEO & page meta
acf_add_local_field_group( array(
    'key'    => 'group_si_meta',
    'title'  => 'Sub-industry: SEO & Meta',
    'fields' => array(
        array( 'key' => 'field_si_seo_title',          'label' => 'SEO Title',          'name' => 'si_seo_title',          'type' => 'text' ),
        array( 'key' => 'field_si_meta_description',   'label' => 'Meta Description',   'name' => 'si_meta_description',   'type' => 'textarea', 'rows' => 2 ),
        array( 'key' => 'field_si_industry_parent',    'label' => 'Industry Parent Slug','name' => 'si_industry_parent',   'type' => 'text' ),
        array( 'key' => 'field_si_slug',               'label' => 'Page Slug',           'name' => 'si_slug',              'type' => 'text' ),
        array( 'key' => 'field_si_publish_status',     'label' => 'Publish Status Note', 'name' => 'si_publish_status',    'type' => 'text' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-subindustry.php' ) ) ),
    'menu_order' => 10, 'active' => true,
) );

// SI Group 2 — Hero
acf_add_local_field_group( array(
    'key'    => 'group_si_hero',
    'title'  => 'Sub-industry: Hero',
    'fields' => array(
        array( 'key' => 'field_si_hero_tag',         'label' => 'Tag',         'name' => 'si_hero_tag',         'type' => 'text',     'default_value' => 'Tech & SaaS — Seed to Series A founders' ),
        array( 'key' => 'field_si_hero_headline',    'label' => 'Headline',    'name' => 'si_hero_headline',    'type' => 'text',     'default_value' => 'You are building the company. Content should not be your problem too.' ),
        array( 'key' => 'field_si_hero_subheadline', 'label' => 'Subheadline', 'name' => 'si_hero_subheadline', 'type' => 'textarea', 'rows' => 3, 'default_value' => 'Between product, hiring, fundraising, and sales, content is always the thing that gets pushed to next sprint. At seed to Series A stage, your brand needs to be moving even when you cannot give it attention. Bluu runs the content operation so it does not depend on you finding the time.' ),
        array( 'key' => 'field_si_hero_cta_label',  'label' => 'CTA Label',   'name' => 'si_hero_cta_label',   'type' => 'text',     'default_value' => 'Book a Discovery Call' ),
        array( 'key' => 'field_si_hero_cta_url',    'label' => 'CTA URL',     'name' => 'si_hero_cta_url',     'type' => 'text',      'default_value' => '/contact' ),
        array( 'key' => 'field_si_hero_image',      'label' => 'Hero Image',  'name' => 'si_hero_image',       'type' => 'image',    'return_format' => 'array', 'preview_size' => 'medium' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-subindustry.php' ) ) ),
    'menu_order' => 20, 'active' => true,
) );

// SI Group 3 — Who this is for
acf_add_local_field_group( array(
    'key'    => 'group_si_who',
    'title'  => 'Sub-industry: Who This Is For',
    'fields' => array(
        array( 'key' => 'field_si_who_heading', 'label' => 'Heading',  'name' => 'si_who_heading', 'type' => 'text',     'default_value' => 'Exactly who this is built for' ),
        array( 'key' => 'field_si_who_body',    'label' => 'Body',     'name' => 'si_who_body',    'type' => 'textarea', 'rows' => 3, 'default_value' => 'This is for SaaS founders between pre-seed and Series A — typically 2 to 15 people — where the founding team is still doing most things and content is the lowest priority despite being strategically important.' ),
        array( 'key' => 'field_si_who_item_1',  'label' => 'Item 1',   'name' => 'si_who_item_1',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'You are building a B2B SaaS product in a competitive category and you know that visibility and positioning matter as much as the product itself.' ),
        array( 'key' => 'field_si_who_item_2',  'label' => 'Item 2',   'name' => 'si_who_item_2',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'You have no dedicated content resource and no realistic plans to hire one in the next six months — but content is falling further behind every week.' ),
        array( 'key' => 'field_si_who_item_3',  'label' => 'Item 3',   'name' => 'si_who_item_3',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'You or a co-founder have things worth saying — market opinions, product perspectives, hard-won lessons — but no system for saying them consistently.' ),
        array( 'key' => 'field_si_who_item_4',  'label' => 'Item 4',   'name' => 'si_who_item_4',  'type' => 'textarea', 'rows' => 2, 'default_value' => 'You want competitor intelligence but have never had a structured way to get it without spending hours doing it yourself.' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-subindustry.php' ) ) ),
    'menu_order' => 30, 'active' => true,
) );

// SI Group 4 — Pain
acf_add_local_field_group( array(
    'key'    => 'group_si_pain',
    'title'  => 'Sub-industry: Specific Pain',
    'fields' => array(
        array( 'key' => 'field_si_pain_heading',  'label' => 'Heading',       'name' => 'si_pain_heading',  'type' => 'text',     'default_value' => 'The early-stage content problem' ),
        array( 'key' => 'field_si_pain_body',     'label' => 'Body',          'name' => 'si_pain_body',     'type' => 'textarea', 'rows' => 3, 'default_value' => 'At seed to Series A, content is caught between being critically important and completely deprioritised. You know your competitors are publishing. You know your founder LinkedIn should be more active. You know a weekly competitor digest would make your product and GTM decisions better. None of it happens consistently because everything else is on fire.' ),
        array( 'key' => 'field_si_pain_1_title',  'label' => 'Pain 1 Title',  'name' => 'si_pain_1_title',  'type' => 'text',     'default_value' => 'Fundraising narrative has no content amplification' ),
        array( 'key' => 'field_si_pain_1_body',   'label' => 'Pain 1 Body',   'name' => 'si_pain_1_body',   'type' => 'textarea', 'rows' => 2, 'default_value' => 'Your investor pitch deck tells a compelling story. Almost none of that narrative is visible to the market — it lives in a PDF that only people you have already met ever see.' ),
        array( 'key' => 'field_si_pain_2_title',  'label' => 'Pain 2 Title',  'name' => 'si_pain_2_title',  'type' => 'text',     'default_value' => 'Competitors are building authority you are not' ),
        array( 'key' => 'field_si_pain_2_body',   'label' => 'Pain 2 Body',   'name' => 'si_pain_2_body',   'type' => 'textarea', 'rows' => 2, 'default_value' => 'While you are heads-down building, competitors are publishing consistently. By the time you surface for air, they have six months of compounding content advantage working against you.' ),
        array( 'key' => 'field_si_pain_3_title',  'label' => 'Pain 3 Title',  'name' => 'si_pain_3_title',  'type' => 'text',     'default_value' => 'Every sprint deprioritises content' ),
        array( 'key' => 'field_si_pain_3_body',   'label' => 'Pain 3 Body',   'name' => 'si_pain_3_body',   'type' => 'textarea', 'rows' => 2, 'default_value' => 'Content never makes it into the sprint because there is always something more urgent. A content operation that runs independently of your sprint cycle is the only solution that actually works at this stage.' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-subindustry.php' ) ) ),
    'menu_order' => 40, 'active' => true,
) );

// SI Group 5 — Use cases (repeater)
acf_add_local_field_group( array(
    'key'    => 'group_si_usecases',
    'title'  => 'Sub-industry: Curated Use Cases',
    'fields' => array(
        array( 'key' => 'field_si_usecases_heading', 'label' => 'Heading', 'name' => 'si_usecases_heading', 'type' => 'text',     'default_value' => 'Where most seed to Series A founders start' ),
        array( 'key' => 'field_si_usecases_intro',   'label' => 'Intro',   'name' => 'si_usecases_intro',   'type' => 'textarea', 'rows' => 2, 'default_value' => 'Most early-stage SaaS retainers combine competitor intelligence with founder brand content — the two use cases that deliver the most visible impact fastest with the least input required from the founding team.' ),
        array(
            'key'          => 'field_si_use_cases',
            'label'        => 'Use Cases',
            'name'         => 'si_use_cases',
            'type'         => 'repeater',
            'min'          => 0,
            'max'          => 6,
            'layout'       => 'block',
            'button_label' => 'Add Use Case',
            'sub_fields'   => array(
                array( 'key' => 'field_si_uc_title', 'label' => 'Title',    'name' => 'si_uc_title', 'type' => 'text' ),
                array( 'key' => 'field_si_uc_why',   'label' => 'Why text', 'name' => 'si_uc_why',   'type' => 'textarea', 'rows' => 3 ),
                array( 'key' => 'field_si_uc_url',   'label' => 'URL',      'name' => 'si_uc_url',   'type' => 'text' ),
                array( 'key' => 'field_si_uc_cta',   'label' => 'CTA Text', 'name' => 'si_uc_cta',   'type' => 'text', 'default_value' => 'See this use case' ),
            ),
        ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-subindustry.php' ) ) ),
    'menu_order' => 50, 'active' => true,
) );

// SI Group 6 — Why Bluu fits
acf_add_local_field_group( array(
    'key'    => 'group_si_fit',
    'title'  => 'Sub-industry: Why Bluu Fits',
    'fields' => array(
        array( 'key' => 'field_si_fit_heading', 'label' => 'Heading',    'name' => 'si_fit_heading', 'type' => 'text',     'default_value' => 'Why Bluu works at this stage' ),
        array( 'key' => 'field_si_fit_body',    'label' => 'Body',       'name' => 'si_fit_body',    'type' => 'textarea', 'rows' => 4, 'default_value' => 'Bluu is designed to run with minimal input from founders. A single monthly conversation is enough to keep the content relevant and in your voice. Everything else — research, writing, publishing, reporting — is handled. No briefing overhead, no project management, no chasing. For a founding team already at capacity, that is the only model that actually works.' ),
        array( 'key' => 'field_si_fit_proof',   'label' => 'Investment / Proof', 'name' => 'si_fit_proof', 'type' => 'textarea', 'rows' => 3, 'default_value' => "Retainers for early-stage SaaS teams start at \$1,500 per month — less than a junior hire's first month salary, with no onboarding time and no management overhead." ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-subindustry.php' ) ) ),
    'menu_order' => 60, 'active' => true,
) );

// SI Group 7 — Closing CTA
acf_add_local_field_group( array(
    'key'    => 'group_si_cta',
    'title'  => 'Sub-industry: Closing CTA',
    'fields' => array(
        array( 'key' => 'field_si_cta_heading',         'label' => 'Heading',         'name' => 'si_cta_heading',         'type' => 'text',     'default_value' => 'Your content should be working while you are in product reviews.' ),
        array( 'key' => 'field_si_cta_subtext',         'label' => 'Subtext',         'name' => 'si_cta_subtext',         'type' => 'textarea', 'rows' => 2, 'default_value' => 'Book a 15-minute Discovery Call — we will tell you honestly whether Bluu makes sense for your stage and what starting would look like.' ),
        array( 'key' => 'field_si_cta_primary_label',   'label' => 'Primary Label',   'name' => 'si_cta_primary_label',   'type' => 'text',     'default_value' => 'Book a Discovery Call' ),
        array( 'key' => 'field_si_cta_primary_url',     'label' => 'Primary URL',     'name' => 'si_cta_primary_url',     'type' => 'text',      'default_value' => '/contact' ),
        array( 'key' => 'field_si_cta_secondary_label', 'label' => 'Secondary Label', 'name' => 'si_cta_secondary_label', 'type' => 'text',     'default_value' => 'See pricing' ),
        array( 'key' => 'field_si_cta_secondary_url',   'label' => 'Secondary URL',   'name' => 'si_cta_secondary_url',   'type' => 'text',      'default_value' => '/pricing' ),
    ),
    'location'   => array( array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'page-subindustry.php' ) ) ),
    'menu_order' => 70, 'active' => true,
) );

// ── BLOG POST META ─────────────────────────────────────────────────────────────
add_action( 'acf/init', function () {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) { return; }

    acf_add_local_field_group( array(
        'key'      => 'group_blog_post_meta',
        'title'    => 'Blog Post Meta',
        'fields'   => array(
            array(
                'key'          => 'field_bluu_post_subtitle',
                'label'        => 'Post subtitle',
                'name'         => 'bluu_post_subtitle',
                'type'         => 'text',
                'instructions' => 'A short supporting sentence shown below the headline on the archive card and single post hero. Max 120 characters. Optional.',
            ),
            array(
                'key'          => 'field_bluu_post_category_label',
                'label'        => 'Category label',
                'name'         => 'bluu_post_category_label',
                'type'         => 'text',
                'instructions' => "Short label shown as a badge on the card and post header. E.g. 'Content strategy' or 'Competitor intelligence'. Optional — falls back to first WordPress category if empty.",
            ),
            array(
                'key'          => 'field_bluu_post_author_bio',
                'label'        => 'Author bio (short)',
                'name'         => 'bluu_post_author_bio',
                'type'         => 'textarea',
                'rows'         => 3,
                'instructions' => '1–2 sentence bio shown in the author block at the bottom of single posts. Optional.',
            ),
            array(
                'key'          => 'field_bluu_post_cta_heading',
                'label'        => 'Post CTA heading',
                'name'         => 'bluu_post_cta_heading',
                'type'         => 'text',
                'instructions' => "The headline for the CTA block at the bottom of each single post. E.g. 'Ready to hand off your content operation?' If empty, a default CTA is shown.",
            ),
            array(
                'key'          => 'field_bluu_post_cta_subtext',
                'label'        => 'Post CTA subtext',
                'name'         => 'bluu_post_cta_subtext',
                'type'         => 'textarea',
                'rows'         => 2,
                'instructions' => 'The supporting sentence under the CTA heading. If empty, a default is shown.',
            ),
            array(
                'key'          => 'field_bluu_post_cta_button_label',
                'label'        => 'CTA button label',
                'name'         => 'bluu_post_cta_button_label',
                'type'         => 'text',
                'instructions' => "Defaults to 'Book a Discovery Call' if empty.",
            ),
            array(
                'key'          => 'field_bluu_post_cta_button_url',
                'label'        => 'CTA button URL',
                'name'         => 'bluu_post_cta_button_url',
                'type'         => 'url',
                'instructions' => 'Defaults to /contact if empty.',
            ),
            array(
                'key'          => 'field_bluu_post_related_posts',
                'label'        => 'Related posts',
                'name'         => 'bluu_post_related_posts',
                'type'         => 'relationship',
                'post_type'    => array( 'post' ),
                'max'          => 3,
                'instructions' => 'Manually select up to 3 related posts to show at the bottom of this post. If empty, fallback to 3 most recent posts in the same category.',
                'return_format' => 'post_object',
            ),
        ),
        'location' => array(
            array(
                array(
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'post',
                ),
            ),
        ),
        'menu_order'            => 0,
        'position'              => 'normal',
        'style'                 => 'default',
        'label_placement'       => 'top',
        'instruction_placement' => 'label',
        'active'                => true,
    ) );
} );

// ── HOME: TESTIMONIAL ─────────────────────────────────────────────────────────
acf_add_local_field_group( array(
    'key'    => 'group_home_testimonial',
    'title'  => 'Home: Testimonial Section',
    'fields' => array(
        array(
            'key'           => 'field_testimonial_quote',
            'label'         => 'Quote',
            'name'          => 'testimonial_quote',
            'type'          => 'textarea',
            'rows'          => 4,
            'default_value' => 'Bluu took the content operation completely off our plate. Within three months we were publishing consistently and our inbound pipeline started moving again.',
        ),
        array(
            'key'           => 'field_testimonial_name',
            'label'         => 'Person Name',
            'name'          => 'testimonial_name',
            'type'          => 'text',
            'default_value' => 'Sarah Mitchell',
        ),
        array(
            'key'           => 'field_testimonial_title',
            'label'         => 'Person Title',
            'name'          => 'testimonial_title',
            'type'          => 'text',
            'default_value' => 'VP of Marketing, Clairen Software',
        ),
        array(
            'key'           => 'field_testimonial_photo',
            'label'         => 'Person Photo',
            'name'          => 'testimonial_photo',
            'type'          => 'image',
            'return_format' => 'array',
            'preview_size'  => 'medium',
            'instructions'  => 'Portrait photo. Recommended: 400×530px (3:4 ratio).',
        ),
    ),
    'location' => array(
        array( array( 'param' => 'page_type',     'operator' => '==', 'value' => 'front_page' ) ),
        array( array( 'param' => 'page_template', 'operator' => '==', 'value' => 'front-page.php' ) ),
    ),
    'menu_order' => 35,
    'active'     => true,
) );
