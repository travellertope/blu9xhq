<?php
/**
 * ACF field group registration for the AI Landing Page template.
 * Fields are organised into tabs — one tab per page section.
 * All fields include sensible default values so the page renders
 * immediately after install without any required input.
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', function (): void {

	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'                   => 'group_ailp_landing',
		'title'                 => 'AI Landing Page — Content',
		'fields'                => ai_landing_fields(),
		'location'              => [ [
			[
				'param'    => 'page_template',
				'operator' => '==',
				'value'    => AI_LANDING_TEMPLATE_KEY,
			],
		] ],
		'menu_order'            => 0,
		'position'              => 'normal',
		'style'                 => 'default',
		'label_placement'       => 'top',
		'instruction_placement' => 'label',
		'active'                => true,
	] );

} );

// ─────────────────────────────────────────────────────────────────────────
// Field definitions
// ─────────────────────────────────────────────────────────────────────────
function ai_landing_fields(): array {
	return array_merge(
		ai_landing_tab_hero(),
		ai_landing_tab_problem(),
		ai_landing_tab_modules(),
		ai_landing_tab_for_you(),
		ai_landing_tab_break(),
		ai_landing_tab_instructor(),
		ai_landing_tab_included(),
		ai_landing_tab_pricing(),
		ai_landing_tab_faq(),
		ai_landing_tab_footer_cta()
	);
}


// ── 1. HERO ───────────────────────────────────────────────────────────────
function ai_landing_tab_hero(): array {
	return [
		[
			'key'       => 'field_ailp_tab_hero',
			'label'     => 'Hero',
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_hero_headline',
			'label'         => 'Headline',
			'name'          => 'hero_headline',
			'type'          => 'text',
			'default_value' => 'Stop Drowning in Tasks. Let AI Handle It.',
			'instructions'  => 'Wrap a word in <em> tags to colour it in the accent colour.',
		],
		[
			'key'           => 'field_ailp_hero_subheadline',
			'label'         => 'Subheadline',
			'name'          => 'hero_subheadline',
			'type'          => 'textarea',
			'rows'          => 2,
			'default_value' => 'A 2.5-hour live virtual class for UK professionals and small business owners. Learn to use Claude AI for content, writing, and operations — in one afternoon.',
		],
		[
			'key'           => 'field_ailp_hero_meta',
			'label'         => 'Event Detail Line',
			'name'          => 'hero_meta',
			'type'          => 'text',
			'default_value' => 'Second week of July  ·  Live via Zoom  ·  2.5 hours',
			'instructions'  => 'Small line below the CTA — date, platform, duration.',
		],
		[
			'key'           => 'field_ailp_hero_cta_label',
			'label'         => 'CTA Button Label',
			'name'          => 'hero_cta_label',
			'type'          => 'text',
			'default_value' => 'Reserve My Spot — £79',
		],
		[
			'key'           => 'field_ailp_hero_cta_url',
			'label'         => 'CTA Button URL',
			'name'          => 'hero_cta_url',
			'type'          => 'text',
			'default_value' => '#booking',
			'placeholder'   => '#booking  or  https://your-booking-url.com  or  /checkout',
			'instructions'  => 'Accepts full URLs, relative paths (/checkout), or anchor links (#booking).',
		],
		[
			'key'           => 'field_ailp_hero_bg',
			'label'         => 'Background Image',
			'name'          => 'hero_background_image',
			'type'          => 'image',
			'return_format' => 'array',
			'preview_size'  => 'medium',
			'instructions'  => 'Minimum 1400px wide. Leave blank to use the CSS default Unsplash image.',
		],
	];
}


// ── 2. PROBLEM ────────────────────────────────────────────────────────────
function ai_landing_tab_problem(): array {

	$icon_choices = [
		'clock'     => 'Clock — time / deadlines',
		'email'     => 'Email — inbox / communication',
		'document'  => 'Document — writing / content',
		'chart'     => 'Chart — reporting / analytics',
		'lightning' => 'Lightning — speed / efficiency',
		'users'     => 'People — clients / team',
		'settings'  => 'Gear — operations / systems',
		'star'      => 'Star — quality / standards',
	];

	return [
		[
			'key'       => 'field_ailp_tab_problem',
			'label'     => 'Problem',
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_prob_eyebrow',
			'label'         => 'Eyebrow Label',
			'name'          => 'problem_eyebrow',
			'type'          => 'text',
			'default_value' => 'Sound familiar?',
		],
		[
			'key'           => 'field_ailp_prob_headline',
			'label'         => 'Headline',
			'name'          => 'problem_headline',
			'type'          => 'text',
			'default_value' => "You're working harder. Not smarter.",
		],
		[
			'key'           => 'field_ailp_prob_intro',
			'label'         => 'Intro Paragraph',
			'name'          => 'problem_intro',
			'type'          => 'textarea',
			'rows'          => 2,
			'default_value' => 'Every day you lose hours to tasks AI could handle in minutes.',
		],
		[
			'key'          => 'field_ailp_pain_points',
			'label'        => 'Pain Points',
			'name'         => 'pain_points',
			'type'         => 'repeater',
			'min'          => 1,
			'max'          => 3,
			'layout'       => 'block',
			'button_label' => 'Add Pain Point',
			'instructions' => 'Add up to 3 pain points. They display in a 3-column grid.',
			'sub_fields'   => [
				[
					'key'           => 'field_ailp_pp_icon',
					'label'         => 'Icon',
					'name'          => 'icon',
					'type'          => 'select',
					'choices'       => $icon_choices,
					'default_value' => 'clock',
				],
				[
					'key'           => 'field_ailp_pp_title',
					'label'         => 'Title',
					'name'          => 'title',
					'type'          => 'text',
					'default_value' => 'Emails eat your mornings',
				],
				[
					'key'           => 'field_ailp_pp_text',
					'label'         => 'Description',
					'name'          => 'text',
					'type'          => 'textarea',
					'rows'          => 3,
					'default_value' => 'Client updates, proposals, follow-ups — each one takes 20 minutes you do not have.',
				],
			],
		],
	];
}


// ── 3. MODULES ────────────────────────────────────────────────────────────
function ai_landing_tab_modules(): array {
	return [
		[
			'key'       => 'field_ailp_tab_modules',
			'label'     => 'Modules',
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_mod_eyebrow',
			'label'         => 'Eyebrow Label',
			'name'          => 'modules_eyebrow',
			'type'          => 'text',
			'default_value' => 'The Curriculum',
		],
		[
			'key'           => 'field_ailp_mod_headline',
			'label'         => 'Headline',
			'name'          => 'modules_headline',
			'type'          => 'text',
			'default_value' => "What You'll Learn",
		],
		[
			'key'           => 'field_ailp_mod_intro',
			'label'         => 'Intro Paragraph',
			'name'          => 'modules_intro',
			'type'          => 'textarea',
			'rows'          => 2,
			'default_value' => 'Three focused modules. Practical skills you can use the same day.',
		],
		[
			'key'          => 'field_ailp_modules',
			'label'        => 'Modules',
			'name'         => 'modules',
			'type'         => 'repeater',
			'min'          => 1,
			'max'          => 3,
			'layout'       => 'block',
			'button_label' => 'Add Module',
			'sub_fields'   => [
				[
					'key'           => 'field_ailp_mod_number',
					'label'         => 'Module Number Label',
					'name'          => 'module_number',
					'type'          => 'text',
					'default_value' => 'Module 01',
				],
				[
					'key'           => 'field_ailp_mod_title',
					'label'         => 'Module Title',
					'name'          => 'module_title',
					'type'          => 'text',
					'default_value' => 'Content Engine',
				],
				[
					'key'           => 'field_ailp_mod_desc',
					'label'         => 'Short Description',
					'name'          => 'module_description',
					'type'          => 'textarea',
					'rows'          => 2,
					'default_value' => 'Write faster than you ever thought possible.',
				],
				[
					'key'           => 'field_ailp_mod_outcomes',
					'label'         => 'Outcomes',
					'name'          => 'module_outcomes',
					'type'          => 'textarea',
					'rows'          => 5,
					'default_value' => "Draft a week of LinkedIn posts in 20 minutes\nTurn a voice note into a polished newsletter\nRepurpose any existing content instantly\nBuild a content system that runs itself",
					'instructions'  => 'One outcome per line. Each line becomes a bullet point.',
				],
			],
		],
	];
}


// ── 4. WHO IT'S FOR ───────────────────────────────────────────────────────
function ai_landing_tab_for_you(): array {
	return [
		[
			'key'       => 'field_ailp_tab_for_you',
			'label'     => "Who It's For",
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_fy_headline',
			'label'         => 'Headline',
			'name'          => 'for_you_headline',
			'type'          => 'text',
			'default_value' => 'This Class Is For You If…',
		],
		[
			'key'           => 'field_ailp_fy_intro',
			'label'         => 'Intro Paragraph',
			'name'          => 'for_you_intro',
			'type'          => 'textarea',
			'rows'          => 2,
			'default_value' => 'No technical background needed. Just a willingness to work differently.',
		],
		[
			'key'          => 'field_ailp_fy_items',
			'label'        => 'Checklist Items',
			'name'         => 'for_you_items',
			'type'         => 'repeater',
			'min'          => 1,
			'max'          => 10,
			'layout'       => 'table',
			'button_label' => 'Add Item',
			'sub_fields'   => [
				[
					'key'           => 'field_ailp_fy_item',
					'label'         => 'Item',
					'name'          => 'item',
					'type'          => 'text',
					'default_value' => '',
				],
			],
		],
	];
}


// ── 5. MID-PAGE BREAK ─────────────────────────────────────────────────────
function ai_landing_tab_break(): array {
	return [
		[
			'key'       => 'field_ailp_tab_break',
			'label'     => 'Image Break',
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_break_quote',
			'label'         => 'Pull Quote',
			'name'          => 'break_quote',
			'type'          => 'textarea',
			'rows'          => 2,
			'default_value' => 'The professionals winning right now aren\'t working harder. They\'ve just found a smarter way to work.',
		],
		[
			'key'           => 'field_ailp_break_attr',
			'label'         => 'Attribution (optional)',
			'name'          => 'break_attribution',
			'type'          => 'text',
			'default_value' => '',
			'placeholder'   => 'e.g. — Name, Job Title',
		],
	];
}


// ── 6. INSTRUCTOR ─────────────────────────────────────────────────────────
function ai_landing_tab_instructor(): array {
	return [
		[
			'key'       => 'field_ailp_tab_instructor',
			'label'     => 'Instructor',
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_inst_eyebrow',
			'label'         => 'Eyebrow Label',
			'name'          => 'instructor_eyebrow',
			'type'          => 'text',
			'default_value' => 'Your Instructor',
		],
		[
			'key'           => 'field_ailp_inst_name',
			'label'         => 'Name',
			'name'          => 'instructor_name',
			'type'          => 'text',
			'default_value' => 'Your Name',
		],
		[
			'key'           => 'field_ailp_inst_photo',
			'label'         => 'Photo',
			'name'          => 'instructor_photo',
			'type'          => 'image',
			'return_format' => 'array',
			'preview_size'  => 'medium',
			'instructions'  => 'Portrait orientation works best — roughly 4:5 ratio.',
		],
		[
			'key'           => 'field_ailp_inst_bio',
			'label'         => 'Bio',
			'name'          => 'instructor_bio',
			'type'          => 'wysiwyg',
			'tabs'          => 'visual',
			'toolbar'       => 'basic',
			'media_upload'  => 0,
			'default_value' => '<p>Write a short, punchy bio here. Focus on your credibility and why you are the right person to teach this. Keep it to 2–3 paragraphs.</p>',
		],
		[
			'key'           => 'field_ailp_inst_link_label',
			'label'         => 'Link Label (optional)',
			'name'          => 'instructor_link_label',
			'type'          => 'text',
			'default_value' => '',
			'placeholder'   => 'e.g. Connect on LinkedIn',
		],
		[
			'key'           => 'field_ailp_inst_link_url',
			'label'         => 'Link URL (optional)',
			'name'          => 'instructor_link_url',
			'type'          => 'text',
			'default_value' => '',
			'placeholder'   => 'https://linkedin.com/in/yourprofile',
		],
	];
}


// ── 7. WHAT'S INCLUDED ────────────────────────────────────────────────────
function ai_landing_tab_included(): array {
	return [
		[
			'key'       => 'field_ailp_tab_included',
			'label'     => "What's Included",
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_inc_eyebrow',
			'label'         => 'Eyebrow Label',
			'name'          => 'included_eyebrow',
			'type'          => 'text',
			'default_value' => 'Everything You Get',
		],
		[
			'key'           => 'field_ailp_inc_headline',
			'label'         => 'Headline',
			'name'          => 'included_headline',
			'type'          => 'text',
			'default_value' => "What's Included",
		],
		[
			'key'           => 'field_ailp_inc_intro',
			'label'         => 'Intro Paragraph',
			'name'          => 'included_intro',
			'type'          => 'textarea',
			'rows'          => 2,
			'default_value' => 'One price. Everything you need to hit the ground running.',
		],
		[
			'key'          => 'field_ailp_inc_items',
			'label'        => 'Deliverables',
			'name'         => 'included_items',
			'type'         => 'repeater',
			'min'          => 1,
			'max'          => 8,
			'layout'       => 'table',
			'button_label' => 'Add Deliverable',
			'sub_fields'   => [
				[
					'key'  => 'field_ailp_inc_item',
					'label'=> 'Item',
					'name' => 'item',
					'type' => 'text',
				],
			],
		],
	];
}


// ── 8. PRICING ────────────────────────────────────────────────────────────
function ai_landing_tab_pricing(): array {
	return [
		[
			'key'       => 'field_ailp_tab_pricing',
			'label'     => 'Pricing',
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_price_headline',
			'label'         => 'Headline',
			'name'          => 'pricing_headline',
			'type'          => 'text',
			'default_value' => 'One Class. Transformative Results.',
		],
		[
			'key'           => 'field_ailp_price_currency',
			'label'         => 'Currency Symbol',
			'name'          => 'pricing_currency',
			'type'          => 'text',
			'default_value' => '£',
		],
		[
			'key'           => 'field_ailp_price_amount',
			'label'         => 'Price (number only)',
			'name'          => 'pricing_amount',
			'type'          => 'text',
			'default_value' => '79',
		],
		[
			'key'           => 'field_ailp_price_urgency',
			'label'         => 'Urgency Line',
			'name'          => 'pricing_urgency',
			'type'          => 'text',
			'default_value' => 'Limited to 20 seats',
		],
		[
			'key'           => 'field_ailp_price_body',
			'label'         => 'Supporting Copy',
			'name'          => 'pricing_body',
			'type'          => 'textarea',
			'rows'          => 2,
			'default_value' => 'One payment. Lifetime access to the recording and all materials.',
		],
		[
			'key'           => 'field_ailp_price_cta_label',
			'label'         => 'CTA Button Label',
			'name'          => 'pricing_cta_label',
			'type'          => 'text',
			'default_value' => 'Reserve My Spot — £79',
		],
		[
			'key'           => 'field_ailp_price_cta_url',
			'label'         => 'CTA Button URL',
			'name'          => 'pricing_cta_url',
			'type'          => 'text',
			'default_value' => '#booking',
			'placeholder'   => '#booking  or  https://your-booking-url.com',
		],
	];
}


// ── 9. FAQ ────────────────────────────────────────────────────────────────
function ai_landing_tab_faq(): array {
	return [
		[
			'key'       => 'field_ailp_tab_faq',
			'label'     => 'FAQ',
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_faq_eyebrow',
			'label'         => 'Eyebrow Label',
			'name'          => 'faq_eyebrow',
			'type'          => 'text',
			'default_value' => 'FAQs',
		],
		[
			'key'           => 'field_ailp_faq_headline',
			'label'         => 'Headline',
			'name'          => 'faq_headline',
			'type'          => 'text',
			'default_value' => 'Common Questions',
		],
		[
			'key'          => 'field_ailp_faq_items',
			'label'        => 'FAQ Items',
			'name'         => 'faq_items',
			'type'         => 'repeater',
			'min'          => 1,
			'layout'       => 'block',
			'button_label' => 'Add Question',
			'sub_fields'   => [
				[
					'key'           => 'field_ailp_faq_q',
					'label'         => 'Question',
					'name'          => 'question',
					'type'          => 'text',
					'default_value' => '',
				],
				[
					'key'           => 'field_ailp_faq_a',
					'label'         => 'Answer',
					'name'          => 'answer',
					'type'          => 'textarea',
					'rows'          => 4,
					'default_value' => '',
				],
			],
		],
	];
}


// ── 10. FOOTER CTA ────────────────────────────────────────────────────────
function ai_landing_tab_footer_cta(): array {
	return [
		[
			'key'       => 'field_ailp_tab_footer_cta',
			'label'     => 'Footer CTA',
			'name'      => '',
			'type'      => 'tab',
			'placement' => 'top',
			'endpoint'  => 0,
		],
		[
			'key'           => 'field_ailp_fcta_headline',
			'label'         => 'Headline',
			'name'          => 'footer_cta_headline',
			'type'          => 'text',
			'default_value' => 'Your Seat Won\'t Wait.',
		],
		[
			'key'           => 'field_ailp_fcta_body',
			'label'         => 'Body Copy',
			'name'          => 'footer_cta_body',
			'type'          => 'textarea',
			'rows'          => 2,
			'default_value' => '20 places. Once they\'re gone, they\'re gone. The next cohort has no confirmed date.',
		],
		[
			'key'           => 'field_ailp_fcta_cta_label',
			'label'         => 'CTA Button Label',
			'name'          => 'footer_cta_label',
			'type'          => 'text',
			'default_value' => 'Reserve My Spot — £79',
		],
		[
			'key'           => 'field_ailp_fcta_cta_url',
			'label'         => 'CTA Button URL',
			'name'          => 'footer_cta_url',
			'type'          => 'text',
			'default_value' => '#booking',
			'placeholder'   => '#booking  or  https://your-booking-url.com',
		],
	];
}
