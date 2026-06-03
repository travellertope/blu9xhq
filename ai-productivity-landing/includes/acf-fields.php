<?php
/**
 * Register ACF field group for the AI Landing Page template.
 * All fields are optional — the template shows hardcoded defaults when empty.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', function (): void {

	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'      => 'group_ailp_v3',
		'title'    => 'AI Landing Page — Content',
		'location' => [ [ [
			'param'    => 'page_template',
			'operator' => '==',
			'value'    => 'templates/template-ai-landing.php',
		] ] ],
		'menu_order'  => 0,
		'position'    => 'normal',
		'style'       => 'default',
		'label_placement' => 'top',
		'fields' => [

			// ── TAB: Hero ─────────────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_hero', 'label' => 'Hero', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_hero_headline', 'label' => 'Headline (HTML allowed)', 'name' => 'hero_headline', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => 'Stop Drowning in Tasks.<br>Let AI Handle It.' ],

			[ 'key' => 'field_ailp_hero_sub', 'label' => 'Sub-headline', 'name' => 'hero_sub', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => 'A 2.5-hour live class teaching UK professionals to harness Claude AI for content, writing, and operations — so you can reclaim your week.' ],

			[ 'key' => 'field_ailp_hero_cta_text', 'label' => 'CTA Button Label', 'name' => 'hero_cta_text', 'type' => 'text',
			  'default_value' => 'Reserve My Spot — £79' ],

			[ 'key' => 'field_ailp_hero_cta_url', 'label' => 'CTA Button URL', 'name' => 'hero_cta_url', 'type' => 'text',
			  'default_value' => '#booking' ],

			// ── TAB: Problem ──────────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_problem', 'label' => 'Problem Section', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_prob_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'prob_eyebrow', 'type' => 'text',
			  'default_value' => 'Sound familiar?' ],

			[ 'key' => 'field_ailp_prob_heading', 'label' => 'Heading (HTML allowed)', 'name' => 'prob_heading', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => "You're working harder.\nNot smarter." ],

			[ 'key' => 'field_ailp_prob_intro', 'label' => 'Intro Line', 'name' => 'prob_intro', 'type' => 'text',
			  'default_value' => "The tools are everywhere. The time isn't. Here's what's eating your week:" ],

			[ 'key' => 'field_ailp_pain_points', 'label' => 'Pain Point Cards', 'name' => 'pain_points', 'type' => 'repeater',
			  'min' => 1, 'max' => 3, 'layout' => 'block', 'button_label' => 'Add Pain Point',
			  'sub_fields' => [
				[ 'key' => 'field_ailp_pp_icon',  'label' => 'Icon', 'name' => 'pp_icon', 'type' => 'select',
				  'choices' => [ 'clock' => 'Clock', 'email' => 'Email', 'document' => 'Document', 'chart' => 'Chart', 'lightning' => 'Lightning', 'users' => 'People', 'settings' => 'Settings', 'star' => 'Star' ],
				  'default_value' => 'clock' ],
				[ 'key' => 'field_ailp_pp_title', 'label' => 'Title', 'name' => 'pp_title', 'type' => 'text' ],
				[ 'key' => 'field_ailp_pp_text',  'label' => 'Description', 'name' => 'pp_text', 'type' => 'textarea', 'rows' => 3 ],
			  ],
			],

			// ── TAB: Modules ──────────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_modules', 'label' => 'Modules Section', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_mod_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'mod_eyebrow', 'type' => 'text',
			  'default_value' => 'The Curriculum' ],

			[ 'key' => 'field_ailp_mod_heading', 'label' => 'Heading', 'name' => 'mod_heading', 'type' => 'text',
			  'default_value' => "What You'll Learn" ],

			[ 'key' => 'field_ailp_mod_intro', 'label' => 'Intro Line', 'name' => 'mod_intro', 'type' => 'text',
			  'default_value' => 'Three focused modules, one transformative afternoon.' ],

			[ 'key' => 'field_ailp_modules', 'label' => 'Module Cards', 'name' => 'modules', 'type' => 'repeater',
			  'min' => 1, 'max' => 3, 'layout' => 'block', 'button_label' => 'Add Module',
			  'sub_fields' => [
				[ 'key' => 'field_ailp_mod_num',     'label' => 'Module Number (e.g. 01)', 'name' => 'mod_num',     'type' => 'text' ],
				[ 'key' => 'field_ailp_mod_title',   'label' => 'Module Title',             'name' => 'mod_title',   'type' => 'text' ],
				[ 'key' => 'field_ailp_mod_desc',    'label' => 'Short Description',        'name' => 'mod_desc',    'type' => 'textarea', 'rows' => 2 ],
				[ 'key' => 'field_ailp_mod_outcomes','label' => 'Outcomes (one per line)',   'name' => 'mod_outcomes','type' => 'textarea', 'rows' => 4 ],
			  ],
			],

			// ── TAB: For You ──────────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_foryou', 'label' => 'Who It\'s For', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_foryou_heading', 'label' => 'Heading', 'name' => 'foryou_heading', 'type' => 'text',
			  'default_value' => "This Class Is For You If…" ],

			[ 'key' => 'field_ailp_for_you_items', 'label' => 'Checklist Items', 'name' => 'for_you_items', 'type' => 'repeater',
			  'layout' => 'table', 'button_label' => 'Add Item',
			  'sub_fields' => [
				[ 'key' => 'field_ailp_fy_item', 'label' => 'Item Text', 'name' => 'fy_item', 'type' => 'text' ],
			  ],
			],

			// ── TAB: Break Quote ──────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_break', 'label' => 'Break Quote', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_break_quote', 'label' => 'Pull Quote', 'name' => 'break_quote', 'type' => 'textarea', 'rows' => 3,
			  'default_value' => '"The professionals winning in the next five years won\'t be the ones who work the hardest — they\'ll be the ones who learn to think alongside AI."' ],

			// ── TAB: Instructor ───────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_instructor', 'label' => 'Instructor', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_instr_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'instr_eyebrow', 'type' => 'text',
			  'default_value' => 'Your Instructor' ],

			[ 'key' => 'field_ailp_instr_name', 'label' => 'Name', 'name' => 'instr_name', 'type' => 'text',
			  'default_value' => 'Your Name Here' ],

			[ 'key' => 'field_ailp_instr_bio', 'label' => 'Bio (paragraphs)', 'name' => 'instr_bio', 'type' => 'textarea', 'rows' => 5,
			  'default_value' => "I've spent the past two years deep in the AI productivity space — testing every tool, breaking every workflow, and finding what actually saves time for real business owners.\n\nThis class is the distillation of everything I wish I'd known on day one. I teach it live, in plain English, with no fluff." ],

			[ 'key' => 'field_ailp_instr_photo', 'label' => 'Headshot (optional)', 'name' => 'instr_photo', 'type' => 'image',
			  'return_format' => 'id', 'preview_size' => 'medium' ],

			// ── TAB: What's Included ──────────────────────────────────────
			[ 'key' => 'field_ailp_tab_included', 'label' => "What's Included", 'type' => 'tab' ],

			[ 'key' => 'field_ailp_incl_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'incl_eyebrow', 'type' => 'text',
			  'default_value' => 'Everything You Get' ],

			[ 'key' => 'field_ailp_incl_heading', 'label' => 'Heading', 'name' => 'incl_heading', 'type' => 'text',
			  'default_value' => "What's Included" ],

			[ 'key' => 'field_ailp_incl_intro', 'label' => 'Intro Line', 'name' => 'incl_intro', 'type' => 'text',
			  'default_value' => 'One fee. Everything you need to hit the ground running.' ],

			[ 'key' => 'field_ailp_included_items', 'label' => 'Included Items', 'name' => 'included_items', 'type' => 'repeater',
			  'layout' => 'table', 'button_label' => 'Add Item',
			  'sub_fields' => [
				[ 'key' => 'field_ailp_incl_icon', 'label' => 'Icon', 'name' => 'incl_icon', 'type' => 'select',
				  'choices' => [ 'video' => 'Video', 'document' => 'Document', 'template' => 'Template', 'recording' => 'Recording', 'qa' => 'Q&A', 'star' => 'Star', 'check' => 'Check' ],
				  'default_value' => 'check' ],
				[ 'key' => 'field_ailp_incl_text', 'label' => 'Description', 'name' => 'incl_text', 'type' => 'text' ],
			  ],
			],

			// ── TAB: Pricing ──────────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_pricing', 'label' => 'Pricing', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_price_heading', 'label' => 'Heading', 'name' => 'price_heading', 'type' => 'text',
			  'default_value' => 'One Class. Transformative Results.' ],

			[ 'key' => 'field_ailp_price_amount', 'label' => 'Price (number only)', 'name' => 'price_amount', 'type' => 'text',
			  'default_value' => '79' ],

			[ 'key' => 'field_ailp_price_currency', 'label' => 'Currency Symbol', 'name' => 'price_currency', 'type' => 'text',
			  'default_value' => '£' ],

			[ 'key' => 'field_ailp_price_urgency', 'label' => 'Urgency Line', 'name' => 'price_urgency', 'type' => 'text',
			  'default_value' => 'Limited to 20 seats — next cohort fills fast.' ],

			[ 'key' => 'field_ailp_price_support', 'label' => 'Supporting Copy', 'name' => 'price_support', 'type' => 'text',
			  'default_value' => 'One-time payment. Lifetime access to the recording and materials.' ],

			[ 'key' => 'field_ailp_price_cta_text', 'label' => 'CTA Button Label', 'name' => 'price_cta_text', 'type' => 'text',
			  'default_value' => 'Reserve My Spot — £79' ],

			[ 'key' => 'field_ailp_price_cta_url', 'label' => 'CTA Button URL', 'name' => 'price_cta_url', 'type' => 'text',
			  'default_value' => '#booking' ],

			// ── TAB: FAQ ──────────────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_faq', 'label' => 'FAQ', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_faq_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'faq_eyebrow', 'type' => 'text',
			  'default_value' => 'FAQs' ],

			[ 'key' => 'field_ailp_faq_heading', 'label' => 'Heading', 'name' => 'faq_heading', 'type' => 'text',
			  'default_value' => 'Common Questions' ],

			[ 'key' => 'field_ailp_faq_items', 'label' => 'FAQ Items', 'name' => 'faq_items', 'type' => 'repeater',
			  'layout' => 'block', 'button_label' => 'Add Question',
			  'sub_fields' => [
				[ 'key' => 'field_ailp_faq_q', 'label' => 'Question', 'name' => 'faq_q', 'type' => 'text' ],
				[ 'key' => 'field_ailp_faq_a', 'label' => 'Answer',   'name' => 'faq_a', 'type' => 'textarea', 'rows' => 3 ],
			  ],
			],

			// ── TAB: Footer CTA ───────────────────────────────────────────
			[ 'key' => 'field_ailp_tab_ftrcta', 'label' => 'Footer CTA', 'type' => 'tab' ],

			[ 'key' => 'field_ailp_ftrcta_heading', 'label' => 'Heading', 'name' => 'ftrcta_heading', 'type' => 'text',
			  'default_value' => 'Ready to Reclaim Your Week?' ],

			[ 'key' => 'field_ailp_ftrcta_sub', 'label' => 'Supporting Line', 'name' => 'ftrcta_sub', 'type' => 'text',
			  'default_value' => 'Join 20 professionals who are about to change how they work — permanently.' ],

			[ 'key' => 'field_ailp_ftrcta_cta_text', 'label' => 'CTA Button Label', 'name' => 'ftrcta_cta_text', 'type' => 'text',
			  'default_value' => 'Reserve My Spot — £79' ],

			[ 'key' => 'field_ailp_ftrcta_cta_url', 'label' => 'CTA Button URL', 'name' => 'ftrcta_cta_url', 'type' => 'text',
			  'default_value' => '#booking' ],

		],
	] );

} );
