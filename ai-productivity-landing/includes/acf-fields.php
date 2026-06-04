<?php
/**
 * Register ACF field group for the AI Landing Page template.
 * All fields are optional — the template shows hardcoded defaults when empty.
 *
 * Version: 4.1 — group_ailp_v4 key orphans v3 saved data so PHP defaults take over.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', function (): void {

	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'      => 'group_ailp_v4',
		'title'    => 'AI Landing Page — Content',
		'location' => [ [ [
			'param'    => 'page_template',
			'operator' => '==',
			'value'    => 'templates/template-ai-landing.php',
		] ] ],
		'menu_order'      => 0,
		'position'        => 'normal',
		'style'           => 'default',
		'label_placement' => 'top',
		'fields' => [

			// ── TAB: Hero ─────────────────────────────────────────────────
			[ 'key' => 'field_v4_tab_hero', 'label' => 'Hero', 'type' => 'tab' ],

			[ 'key' => 'field_v4_hero_eyebrow', 'label' => 'Eyebrow Badge', 'name' => 'hero_eyebrow', 'type' => 'text',
			  'default_value' => 'Live Virtual Class · July 2026' ],

			[ 'key' => 'field_v4_hero_headline', 'label' => 'Headline (use line breaks for splits)', 'name' => 'hero_headline', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => "Stop Spending Hours on Work\nAI Can Do in Minutes" ],

			[ 'key' => 'field_v4_hero_sub', 'label' => 'Sub-headline', 'name' => 'hero_sub', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => 'A practical 2.5-hour live class for UK professionals and small business owners who want to use AI to create content, handle business writing, and free up time — without the overwhelm.' ],

			[ 'key' => 'field_v4_hero_cta_text', 'label' => 'CTA Button Label', 'name' => 'hero_cta_text', 'type' => 'text',
			  'default_value' => 'Reserve My Spot — £79' ],

			[ 'key' => 'field_v4_hero_cta_url', 'label' => 'CTA Button URL', 'name' => 'hero_cta_url', 'type' => 'text',
			  'default_value' => '#booking' ],

			[ 'key' => 'field_v4_hero_meta', 'label' => 'Meta line below CTA', 'name' => 'hero_meta', 'type' => 'text',
			  'default_value' => 'Limited to 20 seats · Zoom · Second week of July' ],

			// ── TAB: Problem ──────────────────────────────────────────────
			[ 'key' => 'field_v4_tab_problem', 'label' => 'Problem Section', 'type' => 'tab' ],

			[ 'key' => 'field_v4_prob_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'prob_eyebrow', 'type' => 'text',
			  'default_value' => 'Sound familiar?' ],

			[ 'key' => 'field_v4_prob_heading', 'label' => 'Heading', 'name' => 'prob_heading', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => "You're working harder than you need to." ],

			[ 'key' => 'field_v4_prob_intro', 'label' => 'Intro Line', 'name' => 'prob_intro', 'type' => 'text',
			  'default_value' => "Most professionals know AI exists. Very few know how to actually use it to get their time back." ],

			[ 'key' => 'field_v4_pain_points', 'label' => 'Pain Point Cards', 'name' => 'pain_points', 'type' => 'repeater',
			  'min' => 1, 'max' => 3, 'layout' => 'block', 'button_label' => 'Add Pain Point',
			  'sub_fields' => [
				[ 'key' => 'field_v4_pp_icon',  'label' => 'Icon', 'name' => 'pp_icon', 'type' => 'select',
				  'choices' => [ 'clock' => 'Clock', 'document' => 'Document', 'chart' => 'Chart', 'email' => 'Email', 'lightning' => 'Lightning', 'users' => 'People', 'settings' => 'Settings', 'star' => 'Star' ],
				  'default_value' => 'clock' ],
				[ 'key' => 'field_v4_pp_title', 'label' => 'Title',       'name' => 'pp_title', 'type' => 'text' ],
				[ 'key' => 'field_v4_pp_text',  'label' => 'Description', 'name' => 'pp_text',  'type' => 'textarea', 'rows' => 3 ],
			  ],
			],

			// ── TAB: Modules ──────────────────────────────────────────────
			[ 'key' => 'field_v4_tab_modules', 'label' => 'Modules Section', 'type' => 'tab' ],

			[ 'key' => 'field_v4_mod_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'mod_eyebrow', 'type' => 'text',
			  'default_value' => 'The Curriculum' ],

			[ 'key' => 'field_v4_mod_heading', 'label' => 'Heading', 'name' => 'mod_heading', 'type' => 'text',
			  'default_value' => "Three modules. One complete AI system for your business." ],

			[ 'key' => 'field_v4_mod_intro', 'label' => 'Intro Line', 'name' => 'mod_intro', 'type' => 'text',
			  'default_value' => "This isn't a theory class. Every module is hands-on, practical, and built around real tasks you face every week." ],

			[ 'key' => 'field_v4_modules', 'label' => 'Module Blocks', 'name' => 'modules', 'type' => 'repeater',
			  'min' => 1, 'max' => 3, 'layout' => 'block', 'button_label' => 'Add Module',
			  'sub_fields' => [
				[ 'key' => 'field_v4_mod_num',      'label' => 'Module Number (e.g. 01)',  'name' => 'mod_num',      'type' => 'text' ],
				[ 'key' => 'field_v4_mod_title',    'label' => 'Module Title',              'name' => 'mod_title',    'type' => 'text' ],
				[ 'key' => 'field_v4_mod_subtitle', 'label' => 'Subtitle (italic tagline)', 'name' => 'mod_subtitle', 'type' => 'text' ],
				[ 'key' => 'field_v4_mod_desc',     'label' => 'Short Description',         'name' => 'mod_desc',     'type' => 'textarea', 'rows' => 2 ],
				[ 'key' => 'field_v4_mod_outcomes', 'label' => "What's Covered (one per line)", 'name' => 'mod_outcomes', 'type' => 'textarea', 'rows' => 5 ],
			  ],
			],

			// ── TAB: For You ──────────────────────────────────────────────
			[ 'key' => 'field_v4_tab_foryou', 'label' => "Who It's For", 'type' => 'tab' ],

			[ 'key' => 'field_v4_foryou_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'foryou_eyebrow', 'type' => 'text',
			  'default_value' => 'Is This For You?' ],

			[ 'key' => 'field_v4_foryou_heading', 'label' => 'Heading', 'name' => 'foryou_heading', 'type' => 'text',
			  'default_value' => "You're in the right place if…" ],

			[ 'key' => 'field_v4_for_you_items', 'label' => 'Checklist Items', 'name' => 'for_you_items', 'type' => 'repeater',
			  'layout' => 'table', 'button_label' => 'Add Item',
			  'sub_fields' => [
				[ 'key' => 'field_v4_fy_item', 'label' => 'Item Text', 'name' => 'fy_item', 'type' => 'text' ],
			  ],
			],

			[ 'key' => 'field_v4_not_for_you', 'label' => '"Not for you" disclaimer', 'name' => 'not_for_you', 'type' => 'textarea', 'rows' => 2,
			  'default_value' => "This is NOT for you if you're looking for a deep technical course on building AI tools. This class is about using AI as a practical business tool — no coding, no complexity." ],

			// ── TAB: Break Quote ──────────────────────────────────────────
			[ 'key' => 'field_v4_tab_break', 'label' => 'Break Quote', 'type' => 'tab' ],

			[ 'key' => 'field_v4_break_quote', 'label' => 'Pull Quote', 'name' => 'break_quote', 'type' => 'textarea', 'rows' => 3,
			  'default_value' => '"The professionals winning in the next five years won\'t be the ones who work the hardest — they\'ll be the ones who learn to think alongside AI."' ],

			// ── TAB: Testimonials ─────────────────────────────────────────
			[ 'key' => 'field_v4_tab_testimonials', 'label' => 'Testimonials', 'type' => 'tab' ],

			[ 'key' => 'field_v4_test_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'test_eyebrow', 'type' => 'text',
			  'default_value' => 'What Attendees Say' ],

			[ 'key' => 'field_v4_test_heading', 'label' => 'Heading', 'name' => 'test_heading', 'type' => 'text',
			  'default_value' => 'Real results from real professionals.' ],

			[ 'key' => 'field_v4_testimonials', 'label' => 'Testimonials', 'name' => 'testimonials', 'type' => 'repeater',
			  'min' => 1, 'max' => 6, 'layout' => 'block', 'button_label' => 'Add Testimonial',
			  'sub_fields' => [
				[ 'key' => 'field_v4_test_name',  'label' => 'Name',       'name' => 'test_name',  'type' => 'text' ],
				[ 'key' => 'field_v4_test_role',  'label' => 'Role/Title', 'name' => 'test_role',  'type' => 'text' ],
				[ 'key' => 'field_v4_test_quote', 'label' => 'Quote',      'name' => 'test_quote', 'type' => 'textarea', 'rows' => 3 ],
			  ],
			],

			// ── TAB: Instructor ───────────────────────────────────────────
			[ 'key' => 'field_v4_tab_instructor', 'label' => 'Instructor', 'type' => 'tab' ],

			[ 'key' => 'field_v4_instr_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'instr_eyebrow', 'type' => 'text',
			  'default_value' => 'Your Instructor' ],

			[ 'key' => 'field_v4_instr_heading', 'label' => 'Section Heading', 'name' => 'instr_heading', 'type' => 'text',
			  'default_value' => 'Built with AI. Taught from experience.' ],

			[ 'key' => 'field_v4_instr_name', 'label' => 'Name', 'name' => 'instr_name', 'type' => 'text',
			  'default_value' => 'Your Name Here' ],

			[ 'key' => 'field_v4_instr_bio', 'label' => 'Bio (double line-break = new paragraph)', 'name' => 'instr_bio', 'type' => 'textarea', 'rows' => 6,
			  'default_value' => "I'm a digital builder and strategist who has used AI to create platforms, produce content, and run lean operations across multiple projects — from culture publications to community organisations to client digital builds.\n\nI don't teach theory. Everything in this class comes directly from workflows I use in my own work. I've built websites, content systems, and digital products using AI tools — and I've spent time figuring out what actually works so you don't have to.\n\nThis class exists because too many capable professionals are still doing manually what AI can handle in minutes. I want to change that." ],

			[ 'key' => 'field_v4_instr_photo', 'label' => 'Headshot (optional)', 'name' => 'instr_photo', 'type' => 'image',
			  'return_format' => 'id', 'preview_size' => 'medium' ],

			// ── TAB: What's Included ──────────────────────────────────────
			[ 'key' => 'field_v4_tab_included', 'label' => "What's Included", 'type' => 'tab' ],

			[ 'key' => 'field_v4_incl_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'incl_eyebrow', 'type' => 'text',
			  'default_value' => 'Your Investment' ],

			[ 'key' => 'field_v4_incl_heading', 'label' => 'Heading', 'name' => 'incl_heading', 'type' => 'text',
			  'default_value' => "Everything you need to hit the ground running." ],

			[ 'key' => 'field_v4_incl_intro', 'label' => 'Intro Line', 'name' => 'incl_intro', 'type' => 'text',
			  'default_value' => 'One fee. Every resource. Yours to keep forever.' ],

			[ 'key' => 'field_v4_included_items', 'label' => 'Included Items', 'name' => 'included_items', 'type' => 'repeater',
			  'layout' => 'table', 'button_label' => 'Add Item',
			  'sub_fields' => [
				[ 'key' => 'field_v4_incl_icon', 'label' => 'Icon', 'name' => 'incl_icon', 'type' => 'select',
				  'choices' => [ 'video' => 'Video', 'document' => 'Document', 'template' => 'Template', 'recording' => 'Recording', 'qa' => 'Q&A', 'lightning' => 'Lightning', 'star' => 'Star', 'check' => 'Check' ],
				  'default_value' => 'check' ],
				[ 'key' => 'field_v4_incl_text', 'label' => 'Description', 'name' => 'incl_text', 'type' => 'text' ],
			  ],
			],

			// ── TAB: Pricing ──────────────────────────────────────────────
			[ 'key' => 'field_v4_tab_pricing', 'label' => 'Pricing', 'type' => 'tab' ],

			[ 'key' => 'field_v4_price_eyebrow',  'label' => 'Eyebrow Label',     'name' => 'price_eyebrow',  'type' => 'text', 'default_value' => 'Secure Your Seat' ],
			[ 'key' => 'field_v4_price_heading',  'label' => 'Heading',           'name' => 'price_heading',  'type' => 'text', 'default_value' => "One class. A system you'll use for years." ],
			[ 'key' => 'field_v4_price_amount',   'label' => 'Price (number only)','name' => 'price_amount',   'type' => 'text', 'default_value' => '79' ],
			[ 'key' => 'field_v4_price_currency', 'label' => 'Currency Symbol',    'name' => 'price_currency', 'type' => 'text', 'default_value' => '£' ],
			[ 'key' => 'field_v4_price_value',    'label' => 'Value Statement',    'name' => 'price_value',    'type' => 'textarea', 'rows' => 2,
			  'default_value' => "That's less than a single hour of most consultants' time — for 2.5 hours of hands-on training and a toolkit you keep forever." ],
			[ 'key' => 'field_v4_price_urgency',  'label' => 'Urgency Line',       'name' => 'price_urgency',  'type' => 'text', 'default_value' => 'Limited to 20 seats to keep the class interactive and valuable.' ],
			[ 'key' => 'field_v4_price_cta_text', 'label' => 'CTA Button Label',   'name' => 'price_cta_text', 'type' => 'text', 'default_value' => 'Reserve My Spot — £79' ],
			[ 'key' => 'field_v4_price_cta_url',  'label' => 'CTA Button URL',     'name' => 'price_cta_url',  'type' => 'text', 'default_value' => '#booking' ],
			[ 'key' => 'field_v4_price_reassure', 'label' => 'Post-CTA Reassurance','name' => 'price_reassure','type' => 'text',
			  'default_value' => "You'll receive a confirmation email with your Zoom link immediately after booking." ],

			// ── TAB: FAQ ──────────────────────────────────────────────────
			[ 'key' => 'field_v4_tab_faq', 'label' => 'FAQ', 'type' => 'tab' ],

			[ 'key' => 'field_v4_faq_eyebrow', 'label' => 'Eyebrow Label', 'name' => 'faq_eyebrow', 'type' => 'text',
			  'default_value' => 'Questions' ],

			[ 'key' => 'field_v4_faq_heading', 'label' => 'Heading', 'name' => 'faq_heading', 'type' => 'text',
			  'default_value' => 'Everything you need to know before you book.' ],

			[ 'key' => 'field_v4_faq_items', 'label' => 'FAQ Items', 'name' => 'faq_items', 'type' => 'repeater',
			  'layout' => 'block', 'button_label' => 'Add Question',
			  'sub_fields' => [
				[ 'key' => 'field_v4_faq_q', 'label' => 'Question', 'name' => 'faq_q', 'type' => 'text' ],
				[ 'key' => 'field_v4_faq_a', 'label' => 'Answer',   'name' => 'faq_a', 'type' => 'textarea', 'rows' => 3 ],
			  ],
			],

			// ── TAB: Footer CTA ───────────────────────────────────────────
			[ 'key' => 'field_v4_tab_ftrcta', 'label' => 'Footer CTA', 'type' => 'tab' ],

			[ 'key' => 'field_v4_ftrcta_heading',  'label' => 'Heading',          'name' => 'ftrcta_heading',  'type' => 'text', 'default_value' => 'Your time is worth more than this.' ],
			[ 'key' => 'field_v4_ftrcta_sub',      'label' => 'Supporting Line',  'name' => 'ftrcta_sub',      'type' => 'textarea', 'rows' => 2,
			  'default_value' => "Stop putting it off. Two and a half hours from now, you could have a content system, a writing toolkit, and an AI workflow you'll use every single week." ],
			[ 'key' => 'field_v4_ftrcta_cta_text', 'label' => 'CTA Button Label', 'name' => 'ftrcta_cta_text', 'type' => 'text', 'default_value' => 'Reserve My Spot — £79' ],
			[ 'key' => 'field_v4_ftrcta_cta_url',  'label' => 'CTA Button URL',   'name' => 'ftrcta_cta_url',  'type' => 'text', 'default_value' => '#booking' ],
			[ 'key' => 'field_v4_ftrcta_meta',     'label' => 'Meta line',         'name' => 'ftrcta_meta',     'type' => 'text', 'default_value' => 'Second week of July · Live on Zoom · Limited to 20 seats' ],

		], // end fields
	] );

} );
