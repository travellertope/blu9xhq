<?php
/**
 * Register ACF field group for the Bluu Affiliate Landing Page template.
 * All fields are optional — the template shows hardcoded defaults when empty.
 * Set BAFF_USE_ACF true in template-affiliates.php after saving content.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', function (): void {

	if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

	acf_add_local_field_group( [
		'key'      => 'group_baff_v1',
		'title'    => 'Affiliate Landing Page — Content',
		'location' => [ [ [
			'param'    => 'page_template',
			'operator' => '==',
			'value'    => 'templates/template-affiliates.php',
		] ] ],
		'menu_order'      => 0,
		'position'        => 'normal',
		'style'           => 'default',
		'label_placement' => 'top',
		'fields' => [

			// ── SEO ───────────────────────────────────────────────────────────
			[ 'key' => 'field_baff_tab_seo', 'label' => 'SEO', 'type' => 'tab' ],
			[ 'key' => 'field_baff_seo_title', 'label' => 'Page Title', 'name' => 'seo_title', 'type' => 'text',
			  'default_value' => 'Bluu Affiliate Program — Earn 30% Recurring Commissions' ],
			[ 'key' => 'field_baff_seo_desc', 'label' => 'Meta Description', 'name' => 'seo_desc', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => 'Join the Bluu affiliate program. Promote Bluu products and services and earn up to 30% recurring commissions with no cap and no expiry.' ],

			// ── Settings ──────────────────────────────────────────────────────
			[ 'key' => 'field_baff_tab_settings', 'label' => 'Settings', 'type' => 'tab' ],
			[ 'key' => 'field_baff_portal_url', 'label' => 'Portal Register URL', 'name' => 'portal_register_url', 'type' => 'text',
			  'default_value' => 'https://crm.bluuhq.com/affiliate-register' ],

			// ── Hero ──────────────────────────────────────────────────────────
			[ 'key' => 'field_baff_tab_hero', 'label' => 'Hero', 'type' => 'tab' ],
			[ 'key' => 'field_baff_hero_eyebrow', 'label' => 'Eyebrow Badge', 'name' => 'hero_eyebrow', 'type' => 'text',
			  'default_value' => 'Open Enrollment · Free to Join' ],
			[ 'key' => 'field_baff_hero_headline', 'label' => 'Headline', 'name' => 'hero_headline', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => 'Earn 30% recurring commissions promoting Bluu' ],
			[ 'key' => 'field_baff_hero_sub', 'label' => 'Sub-headline', 'name' => 'hero_sub', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => 'Share Bluu with your audience. Earn every month your referrals stay — no cap, no expiry.' ],
			[ 'key' => 'field_baff_hero_cta_text', 'label' => 'CTA Button Label', 'name' => 'hero_cta_text', 'type' => 'text',
			  'default_value' => 'Join the Affiliate Program — Free' ],
			[ 'key' => 'field_baff_hero_meta', 'label' => 'Meta text below CTA', 'name' => 'hero_meta', 'type' => 'text',
			  'default_value' => 'Open to everyone · Takes 60 seconds · No approval required' ],
		],
	] );
} );
