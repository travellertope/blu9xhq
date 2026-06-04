<?php
/**
 * Template Name: AI Landing Page
 * Template Post Type: page
 *
 * AI Productivity Accelerator — full-page sales template.
 * All content defaults are hardcoded below; ACF fields override them when saved.
 * The page renders fully populated even with zero ACF configuration.
 */

defined( 'ABSPATH' ) || exit;

// ─── Helpers ──────────────────────────────────────────────────────────────

function ailp_f( string $key, string $default ): string {
	if ( function_exists( 'get_field' ) ) {
		$v = get_field( $key );
		if ( $v !== null && $v !== '' && $v !== false ) {
			return (string) $v;
		}
	}
	return $default;
}

function ailp_rows( string $key, array $default ): array {
	if ( function_exists( 'get_field' ) ) {
		$rows = get_field( $key );
		if ( is_array( $rows ) && count( $rows ) > 0 ) {
			// Verify rows have real content; empty rows from stale ACF data fall through.
			foreach ( $rows as $row ) {
				if ( is_array( $row ) ) {
					foreach ( $row as $v ) {
						if ( $v !== null && $v !== '' && $v !== false ) {
							return $rows;
						}
					}
				}
			}
		}
	}
	return $default;
}

// ─── Default content ──────────────────────────────────────────────────────

$pain_points_default = [
	[
		'pp_icon'  => 'clock',
		'pp_title' => 'The Content Grind',
		'pp_text'  => 'You know you should be posting consistently. But writing captions, drafting newsletters, and coming up with ideas every week eats hours you don\'t have.',
	],
	[
		'pp_icon'  => 'document',
		'pp_title' => 'The Writing Backlog',
		'pp_text'  => 'Proposals, follow-up emails, reports, bios — professional writing piles up fast. And staring at a blank page never gets easier.',
	],
	[
		'pp_icon'  => 'chart',
		'pp_title' => 'The Repetition Trap',
		'pp_text'  => 'You\'re doing the same tasks over and over. Planning, summarising, brainstorming, organising — work that should take 10 minutes somehow takes an hour.',
	],
];

$modules_default = [
	[
		'mod_num'      => '01',
		'mod_title'    => 'Content Engine',
		'mod_subtitle' => 'Stop starting from scratch every time you need to post',
		'mod_desc'     => 'Build a content system that generates a full month of social media posts, captions, hooks, and ideas in a single session — in your voice, for your audience.',
		'mod_outcomes' => "Teaching AI to write in your brand voice\nBuilding a 4-week content calendar in under 20 minutes\nWriting posts, carousels, and captions that actually sound human\nTurning one idea into 10 pieces of content across platforms",
	],
	[
		'mod_num'      => '02',
		'mod_title'    => 'Business Brain',
		'mod_subtitle' => 'Handle your professional writing in a fraction of the time',
		'mod_desc'     => 'Proposals, emails, client pitches, meeting prep — AI can handle the heavy lifting so you focus on the relationships, not the admin.',
		'mod_outcomes' => "Writing compelling proposals and follow-up emails fast\nSummarising research and competitor information in minutes\nCreating reusable professional writing templates\nPrepping for meetings, presentations, and pitches with AI",
	],
	[
		'mod_num'      => '03',
		'mod_title'    => 'Ops Autopilot',
		'mod_subtitle' => 'Eliminate the repetitive tasks draining your week',
		'mod_desc'     => 'The hours you lose to planning, note-taking, brainstorming, and organising add up. This module gives you a system to reclaim them.',
		'mod_outcomes' => "Turning messy notes into structured action plans\nWriting SOPs and process documents in minutes\nUsing AI for faster decision-making and problem-solving\nBuilding your personal AI toolkit (what's free, what's worth paying for)",
	],
];

$for_you_default = [
	[ 'fy_item' => 'You run a small business or work independently and wear too many hats' ],
	[ 'fy_item' => 'You know AI is a big deal but haven\'t found a practical way into it yet' ],
	[ 'fy_item' => 'You spend too much time on content, emails, and admin that should be quicker' ],
	[ 'fy_item' => 'You\'ve tried ChatGPT once or twice but didn\'t get results worth talking about' ],
	[ 'fy_item' => 'You want a system you can actually use every week — not just a one-off trick' ],
	[ 'fy_item' => 'You\'re based in the UK and want training that speaks to your context' ],
];

$included_default = [
	[ 'incl_icon' => 'video',     'incl_text' => 'Live 2.5-hour virtual class via Zoom — interactive, not a lecture' ],
	[ 'incl_icon' => 'document',  'incl_text' => 'Prompt Library — a ready-to-use collection of prompts for content, writing, and ops tasks' ],
	[ 'incl_icon' => 'template',  'incl_text' => 'Templates Pack — reusable frameworks you can deploy immediately after class' ],
	[ 'incl_icon' => 'recording', 'incl_text' => 'Recording Access — full replay sent within 24 hours so you never miss a thing' ],
	[ 'incl_icon' => 'qa',        'incl_text' => 'Live Q&A — 20 minutes at the end to get your specific questions answered' ],
	[ 'incl_icon' => 'lightning', 'incl_text' => 'Bonus: AI Toolkit Guide — the exact free and paid tools worth your time in 2026' ],
];

/* Replace these with real testimonials via ACF repeater (key: testimonials) */
$testimonials_default = [
	[
		'test_name'  => 'Sarah M.',
		'test_role'  => 'Freelance Marketing Consultant',
		'test_quote' => 'I used to spend an entire afternoon writing proposals. After this class, I had a full proposal drafted and polished in 35 minutes. Genuinely life-changing.',
	],
	[
		'test_name'  => 'James O.',
		'test_role'  => 'Small Business Owner',
		'test_quote' => 'I\'d dabbled with ChatGPT but never got results I could actually use. This class gave me a proper system. I now produce a month of social content in one Sunday afternoon session.',
	],
	[
		'test_name'  => 'Priya K.',
		'test_role'  => 'HR Business Partner',
		'test_quote' => 'The ops module alone was worth the investment. I\'ve built SOPs and process documents in minutes that used to take me days. My team is genuinely impressed.',
	],
];

$faq_default = [
	[
		'faq_q' => 'Do I need any technical experience to attend?',
		'faq_a' => 'Not at all. This class is designed for professionals who want practical results, not developers or tech specialists. If you can send an email, you can do everything in this class.',
	],
	[
		'faq_q' => 'Which AI tools will we be using?',
		'faq_a' => 'The class is built primarily around Claude (by Anthropic), which is available free or at low cost. We\'ll also briefly cover other tools worth knowing about. You don\'t need to purchase anything in advance.',
	],
	[
		'faq_q' => 'What if I can\'t attend live?',
		'faq_a' => 'A full recording will be sent to all registered attendees within 24 hours of the class. That said, the live session includes Q&A and real-time interaction — so attending live is strongly recommended if you can.',
	],
	[
		'faq_q' => 'How is the class delivered?',
		'faq_a' => 'Via Zoom. You\'ll receive a link in your confirmation email. The class runs for approximately 2.5 hours including a short break and a Q&A session at the end.',
	],
	[
		'faq_q' => 'What\'s your refund policy?',
		'faq_a' => 'If you change your mind before the class, we offer a full refund up to 48 hours before the session. No questions asked.',
	],
];

// ─── Pull field values (ACF if set, defaults otherwise) ───────────────────

$hero_eyebrow  = ailp_f( 'hero_eyebrow',  'Live Virtual Class · July 2026' );
$hero_headline = ailp_f( 'hero_headline', "Stop Spending Hours on Work\nAI Can Do in Minutes" );
$hero_sub      = ailp_f( 'hero_sub',      'A practical 2.5-hour live class for UK professionals and small business owners who want to use AI to create content, handle business writing, and free up time — without the overwhelm.' );
$hero_cta_text = ailp_f( 'hero_cta_text', 'Reserve My Spot — £79' );
$hero_cta_url  = ailp_f( 'hero_cta_url',  '#booking' );
$hero_meta     = ailp_f( 'hero_meta',     'Limited to 20 seats · Zoom · Second week of July' );

$prob_eyebrow  = ailp_f( 'prob_eyebrow', 'Sound familiar?' );
$prob_heading  = ailp_f( 'prob_heading', "You're working harder than you need to." );
$prob_intro    = ailp_f( 'prob_intro',   "Most professionals know AI exists. Very few know how to actually use it to get their time back." );

$mod_eyebrow   = ailp_f( 'mod_eyebrow', 'The Curriculum' );
$mod_heading   = ailp_f( 'mod_heading', "Three modules. One complete AI system for your business." );
$mod_intro     = ailp_f( 'mod_intro',   "This isn't a theory class. Every module is hands-on, practical, and built around real tasks you face every week." );

$foryou_eyebrow = ailp_f( 'foryou_eyebrow', 'Is This For You?' );
$foryou_heading = ailp_f( 'foryou_heading', "You're in the right place if…" );
$not_for_you    = ailp_f( 'not_for_you',    "This is NOT for you if you're looking for a deep technical course on building AI tools. This class is about using AI as a practical business tool — no coding, no complexity." );

$break_quote   = ailp_f( 'break_quote', '"The professionals winning in the next five years won\'t be the ones who work the hardest — they\'ll be the ones who learn to think alongside AI."' );

$test_eyebrow  = ailp_f( 'test_eyebrow', 'What Attendees Say' );
$test_heading  = ailp_f( 'test_heading', 'Real results from real professionals.' );

$instr_eyebrow = ailp_f( 'instr_eyebrow', 'Your Instructor' );
$instr_heading = ailp_f( 'instr_heading', 'Built with AI. Taught from experience.' );
$instr_name    = ailp_f( 'instr_name',    'Your Name Here' );
$instr_bio     = ailp_f( 'instr_bio',     "I'm a digital builder and strategist who has used AI to create platforms, produce content, and run lean operations across multiple projects — from culture publications to community organisations to client digital builds.\n\nI don't teach theory. Everything in this class comes directly from workflows I use in my own work. I've built websites, content systems, and digital products using AI tools — and I've spent time figuring out what actually works so you don't have to.\n\nThis class exists because too many capable professionals are still doing manually what AI can handle in minutes. I want to change that." );

$incl_eyebrow  = ailp_f( 'incl_eyebrow', 'Your Investment' );
$incl_heading  = ailp_f( 'incl_heading', "Everything you need to hit the ground running." );
$incl_intro    = ailp_f( 'incl_intro',   'One fee. Every resource. Yours to keep forever.' );

$price_eyebrow  = ailp_f( 'price_eyebrow',  'Secure Your Seat' );
$price_heading  = ailp_f( 'price_heading',   "One class. A system you'll use for years." );
$price_amount   = ailp_f( 'price_amount',    '79' );
$price_currency = ailp_f( 'price_currency',  '£' );
$price_value    = ailp_f( 'price_value',     "That's less than a single hour of most consultants' time — for 2.5 hours of hands-on training and a toolkit you keep forever." );
$price_urgency  = ailp_f( 'price_urgency',   'Limited to 20 seats to keep the class interactive and valuable.' );
$price_cta_text = ailp_f( 'price_cta_text',  'Reserve My Spot — £79' );
$price_cta_url  = ailp_f( 'price_cta_url',   '#booking' );
$price_reassure = ailp_f( 'price_reassure',  "You'll receive a confirmation email with your Zoom link immediately after booking." );

$faq_eyebrow    = ailp_f( 'faq_eyebrow', 'Questions' );
$faq_heading    = ailp_f( 'faq_heading', 'Everything you need to know before you book.' );

$ftrcta_heading  = ailp_f( 'ftrcta_heading',  'Your time is worth more than this.' );
$ftrcta_sub      = ailp_f( 'ftrcta_sub',      "Stop putting it off. Two and a half hours from now, you could have a content system, a writing toolkit, and an AI workflow you'll use every single week." );
$ftrcta_cta_text = ailp_f( 'ftrcta_cta_text', 'Reserve My Spot — £79' );
$ftrcta_cta_url  = ailp_f( 'ftrcta_cta_url',  '#booking' );
$ftrcta_meta     = ailp_f( 'ftrcta_meta',      'Second week of July · Live on Zoom · Limited to 20 seats' );

$pain_points  = ailp_rows( 'pain_points',    $pain_points_default );
$modules      = ailp_rows( 'modules',        $modules_default );
$for_you      = ailp_rows( 'for_you_items',  $for_you_default );
$testimonials = ailp_rows( 'testimonials',   $testimonials_default );
$included     = ailp_rows( 'included_items', $included_default );
$faqs         = ailp_rows( 'faq_items',      $faq_default );

$instr_photo_id  = function_exists( 'get_field' ) ? get_field( 'instr_photo' ) : null;
$instr_photo_url = $instr_photo_id ? wp_get_attachment_image_url( $instr_photo_id, 'large' ) : '';

// ─── Inline SVG icons ─────────────────────────────────────────────────────

function ailp_icon( string $name ): string {
	static $paths = null;
	if ( $paths === null ) {
		$paths = [
			'clock'     => '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>',
			'document'  => '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>',
			'chart'     => '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
			'video'     => '<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>',
			'template'  => '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-2h7v2zm5-4H5v-2h12v2zm0-4H5V7h12v2z"/>',
			'recording' => '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>',
			'qa'        => '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>',
			'lightning' => '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
			'star'      => '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
			'check'     => '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>',
			'shield'    => '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
			'quote'     => '<path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>',
		];
	}
	$path = $paths[ $name ] ?? $paths['check'];
	return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' . $path . '</svg>';
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class( 'ailp-page' ); ?>>
<?php wp_body_open(); ?>


<!-- ═══════════════════════════════ NAV ════════════════════════════════════ -->
<header class="ailp-nav" role="banner">
  <div class="ailp-nav__inner">

    <a href="<?php echo esc_url( home_url( '/' ) ); ?>"
       class="ailp-nav__logo"
       aria-label="<?php bloginfo( 'name' ); ?> — home">
      <?php if ( has_custom_logo() ) : ?>
        <?php the_custom_logo(); ?>
      <?php else : ?>
        <span class="ailp-nav__wordmark"><?php bloginfo( 'name' ); ?></span>
      <?php endif; ?>
    </a>

    <div class="ailp-nav__right">
      <span class="ailp-nav__seats">20 seats remaining</span>
      <a href="<?php echo esc_url( $hero_cta_url ); ?>" class="ailp-btn ailp-btn--accent ailp-btn--sm">
        <?php echo esc_html( $hero_cta_text ); ?>
      </a>
    </div>

  </div>
</header><!-- /ailp-nav -->


<!-- ═══════════════════════════════ HERO ═══════════════════════════════════ -->
<section class="ailp-hero" aria-labelledby="hero-headline">
  <div class="ailp-hero__overlay"></div>
  <div class="ailp-hero__content">

    <div class="ailp-hero__eyebrow">
      <span class="ailp-hero__eyebrow-dot" aria-hidden="true"></span>
      <?php echo esc_html( $hero_eyebrow ); ?>
    </div>

    <h1 id="hero-headline" class="ailp-hero__headline">
      <?php echo wp_kses( nl2br( esc_html( $hero_headline ) ), [ 'br' => [] ] ); ?>
    </h1>
    <p class="ailp-hero__sub"><?php echo esc_html( $hero_sub ); ?></p>

    <div class="ailp-hero__cta-wrap">
      <a href="<?php echo esc_url( $hero_cta_url ); ?>" class="ailp-btn ailp-btn--accent ailp-btn--lg">
        <?php echo esc_html( $hero_cta_text ); ?>
      </a>
      <p class="ailp-hero__meta"><?php echo esc_html( $hero_meta ); ?></p>
    </div>

  </div>
</section><!-- /ailp-hero -->


<!-- ═══════════════════════════ TRUST STRIP ════════════════════════════════ -->
<div class="ailp-trust-strip" aria-label="Class at a glance">
  <div class="ailp-container">
    <ul class="ailp-trust-strip__list">
      <li class="ailp-trust-strip__item">
        <span class="ailp-trust-strip__value">2.5</span>
        <span class="ailp-trust-strip__label">Hours Live Training</span>
      </li>
      <li class="ailp-trust-strip__sep" aria-hidden="true"></li>
      <li class="ailp-trust-strip__item">
        <span class="ailp-trust-strip__value">20</span>
        <span class="ailp-trust-strip__label">Seats Maximum</span>
      </li>
      <li class="ailp-trust-strip__sep" aria-hidden="true"></li>
      <li class="ailp-trust-strip__item">
        <span class="ailp-trust-strip__value">3</span>
        <span class="ailp-trust-strip__label">Practical Modules</span>
      </li>
      <li class="ailp-trust-strip__sep" aria-hidden="true"></li>
      <li class="ailp-trust-strip__item">
        <span class="ailp-trust-strip__value">£79</span>
        <span class="ailp-trust-strip__label">One-Time Investment</span>
      </li>
    </ul>
  </div>
</div><!-- /ailp-trust-strip -->


<!-- ═══════════════════════════ PROBLEM ════════════════════════════════════ -->
<section class="ailp-section ailp-problem">
  <div class="ailp-container">
    <p class="ailp-eyebrow"><?php echo esc_html( $prob_eyebrow ); ?></p>
    <h2 class="ailp-section__heading">
      <?php echo wp_kses( nl2br( esc_html( $prob_heading ) ), [ 'br' => [] ] ); ?>
    </h2>
    <p class="ailp-section__intro"><?php echo esc_html( $prob_intro ); ?></p>

    <div class="ailp-cards ailp-cards--3">
      <?php foreach ( $pain_points as $pp ) :
        $icon  = esc_attr( $pp['pp_icon']  ?? 'clock' );
        $title = esc_html( $pp['pp_title'] ?? '' );
        $text  = esc_html( $pp['pp_text']  ?? '' );
      ?>
      <div class="ailp-card ailp-pain-card">
        <div class="ailp-pain-card__icon"><?php echo ailp_icon( $icon ); ?></div>
        <h3 class="ailp-pain-card__title"><?php echo $title; ?></h3>
        <p class="ailp-pain-card__text"><?php echo $text; ?></p>
      </div>
      <?php endforeach; ?>
    </div>

  </div>
</section><!-- /ailp-problem -->


<!-- ═══════════════════════════ MODULES ════════════════════════════════════ -->
<section class="ailp-section ailp-modules ailp-section--alt">
  <div class="ailp-container">
    <p class="ailp-eyebrow"><?php echo esc_html( $mod_eyebrow ); ?></p>
    <h2 class="ailp-section__heading"><?php echo esc_html( $mod_heading ); ?></h2>
    <p class="ailp-section__intro"><?php echo esc_html( $mod_intro ); ?></p>

    <div class="ailp-module-list">
      <?php foreach ( $modules as $mod ) :
        $num      = esc_html( $mod['mod_num']      ?? '' );
        $title    = esc_html( $mod['mod_title']    ?? '' );
        $subtitle = esc_html( $mod['mod_subtitle'] ?? '' );
        $desc     = esc_html( $mod['mod_desc']     ?? '' );
        $outcomes = isset( $mod['mod_outcomes'] )
          ? array_filter( array_map( 'trim', explode( "\n", $mod['mod_outcomes'] ) ) )
          : [];
      ?>
      <div class="ailp-module-block">

        <div class="ailp-module-block__header">
          <span class="ailp-module-block__num"><?php echo $num; ?></span>
          <h3 class="ailp-module-block__title"><?php echo $title; ?></h3>
          <?php if ( $subtitle ) : ?>
          <p class="ailp-module-block__subtitle"><?php echo $subtitle; ?></p>
          <?php endif; ?>
        </div>

        <div class="ailp-module-block__body">
          <p class="ailp-module-block__desc"><?php echo $desc; ?></p>
          <?php if ( $outcomes ) : ?>
          <p class="ailp-module-block__covered-label">What's covered:</p>
          <ul class="ailp-module-block__outcomes">
            <?php foreach ( $outcomes as $outcome ) : ?>
            <li><?php echo esc_html( $outcome ); ?></li>
            <?php endforeach; ?>
          </ul>
          <?php endif; ?>
        </div>

      </div>
      <?php endforeach; ?>
    </div>

  </div>
</section><!-- /ailp-modules -->


<!-- ═══════════════════════════ FOR YOU ════════════════════════════════════ -->
<section class="ailp-section ailp-foryou">
  <div class="ailp-container ailp-container--narrow">
    <p class="ailp-eyebrow"><?php echo esc_html( $foryou_eyebrow ); ?></p>
    <h2 class="ailp-section__heading"><?php echo esc_html( $foryou_heading ); ?></h2>

    <ul class="ailp-checklist">
      <?php foreach ( $for_you as $row ) :
        $item = esc_html( $row['fy_item'] ?? ( is_string( $row ) ? $row : '' ) );
      ?>
      <li class="ailp-checklist__item">
        <span class="ailp-checklist__icon"><?php echo ailp_icon( 'check' ); ?></span>
        <span><?php echo $item; ?></span>
      </li>
      <?php endforeach; ?>
    </ul>

    <?php if ( $not_for_you ) : ?>
    <div class="ailp-not-for-you">
      <p class="ailp-not-for-you__label">Not right for you?</p>
      <p class="ailp-not-for-you__text"><?php echo esc_html( $not_for_you ); ?></p>
    </div>
    <?php endif; ?>

  </div>
</section><!-- /ailp-foryou -->


<!-- ═══════════════════════════ BREAK ══════════════════════════════════════ -->
<section class="ailp-break" aria-label="Pull quote">
  <div class="ailp-break__overlay"></div>
  <div class="ailp-container">
    <div class="ailp-break__quote-wrap">
      <span class="ailp-break__quote-icon" aria-hidden="true"><?php echo ailp_icon( 'quote' ); ?></span>
      <blockquote class="ailp-break__quote">
        <?php echo esc_html( $break_quote ); ?>
      </blockquote>
    </div>
  </div>
</section><!-- /ailp-break -->


<!-- ══════════════════════════ TESTIMONIALS ════════════════════════════════ -->
<section class="ailp-section ailp-testimonials ailp-section--alt">
  <div class="ailp-container">
    <p class="ailp-eyebrow ailp-eyebrow--center"><?php echo esc_html( $test_eyebrow ); ?></p>
    <h2 class="ailp-section__heading ailp-section__heading--center">
      <?php echo esc_html( $test_heading ); ?>
    </h2>

    <div class="ailp-cards ailp-cards--3" style="margin-top:var(--space-lg)">
      <?php foreach ( $testimonials as $t ) :
        $name  = esc_html( $t['test_name']  ?? '' );
        $role  = esc_html( $t['test_role']  ?? '' );
        $quote = esc_html( $t['test_quote'] ?? '' );
      ?>
      <div class="ailp-testimonial-card">
        <div class="ailp-testimonial-card__stars" aria-label="5 stars">
          <?php for ( $s = 0; $s < 5; $s++ ) : ?><?php echo ailp_icon( 'star' ); ?><?php endfor; ?>
        </div>
        <p class="ailp-testimonial-card__quote"><?php echo $quote; ?></p>
        <div class="ailp-testimonial-card__author">
          <span class="ailp-testimonial-card__name"><?php echo $name; ?></span>
          <?php if ( $role ) : ?>
          <span class="ailp-testimonial-card__role"><?php echo $role; ?></span>
          <?php endif; ?>
        </div>
      </div>
      <?php endforeach; ?>
    </div>

  </div>
</section><!-- /ailp-testimonials -->


<!-- ═══════════════════════════ INSTRUCTOR ═════════════════════════════════ -->
<section class="ailp-section ailp-instructor">
  <div class="ailp-container">
    <div class="ailp-instructor__layout">

      <div class="ailp-instructor__photo-wrap">
        <?php if ( $instr_photo_url ) : ?>
          <img src="<?php echo esc_url( $instr_photo_url ); ?>"
               alt="<?php echo esc_attr( $instr_name ); ?>"
               class="ailp-instructor__photo"
               loading="lazy">
        <?php else : ?>
          <div class="ailp-instructor__placeholder">
            <span>Add your headshot via ACF → Instructor → Headshot</span>
          </div>
        <?php endif; ?>
      </div>

      <div class="ailp-instructor__bio">
        <p class="ailp-eyebrow"><?php echo esc_html( $instr_eyebrow ); ?></p>
        <h2 class="ailp-instructor__heading"><?php echo esc_html( $instr_heading ); ?></h2>
        <p class="ailp-instructor__name"><?php echo esc_html( $instr_name ); ?></p>
        <?php
        $bio_paragraphs = array_filter( array_map( 'trim', explode( "\n\n", $instr_bio ) ) );
        foreach ( $bio_paragraphs as $para ) :
        ?>
        <p class="ailp-instructor__para"><?php echo esc_html( $para ); ?></p>
        <?php endforeach; ?>
      </div>

    </div>
  </div>
</section><!-- /ailp-instructor -->


<!-- ═══════════════════════════ INCLUDED ═══════════════════════════════════ -->
<section class="ailp-section ailp-included ailp-section--alt">
  <div class="ailp-container ailp-container--narrow">
    <p class="ailp-eyebrow ailp-eyebrow--center"><?php echo esc_html( $incl_eyebrow ); ?></p>
    <h2 class="ailp-section__heading ailp-section__heading--center">
      <?php echo esc_html( $incl_heading ); ?>
    </h2>
    <?php if ( $incl_intro ) : ?>
    <p class="ailp-section__intro ailp-section__intro--center"><?php echo esc_html( $incl_intro ); ?></p>
    <?php endif; ?>

    <ul class="ailp-included-list">
      <?php foreach ( $included as $item ) :
        $icon = esc_attr( $item['incl_icon'] ?? 'check' );
        $text = esc_html( $item['incl_text'] ?? '' );
      ?>
      <li class="ailp-included-item">
        <span class="ailp-included-item__icon"><?php echo ailp_icon( $icon ); ?></span>
        <span class="ailp-included-item__text"><?php echo $text; ?></span>
      </li>
      <?php endforeach; ?>
    </ul>

  </div>
</section><!-- /ailp-included -->


<!-- ═══════════════════════════ PRICING ════════════════════════════════════ -->
<section id="booking" class="ailp-section ailp-pricing ailp-section--dark">
  <div class="ailp-container ailp-container--narrow ailp-pricing__inner">

    <p class="ailp-eyebrow ailp-eyebrow--center ailp-eyebrow--on-dark">
      <?php echo esc_html( $price_eyebrow ); ?>
    </p>
    <h2 class="ailp-pricing__heading"><?php echo esc_html( $price_heading ); ?></h2>

    <div class="ailp-pricing__price" aria-label="Price: <?php echo esc_attr( $price_currency . $price_amount ); ?>">
      <sup class="ailp-pricing__currency"><?php echo esc_html( $price_currency ); ?></sup>
      <span class="ailp-pricing__amount"><?php echo esc_html( $price_amount ); ?></span>
    </div>

    <?php if ( $price_value ) : ?>
    <p class="ailp-pricing__value"><?php echo esc_html( $price_value ); ?></p>
    <?php endif; ?>

    <div class="ailp-pricing__urgency-badge">
      <span class="ailp-pricing__urgency-icon" aria-hidden="true">⚠</span>
      <?php echo esc_html( $price_urgency ); ?>
    </div>

    <div class="ailp-pricing__guarantee">
      <span class="ailp-pricing__guarantee-icon"><?php echo ailp_icon( 'shield' ); ?></span>
      <span class="ailp-pricing__guarantee-text">
        <strong>Full refund up to 48 hours before the session.</strong> No questions asked.
      </span>
    </div>

    <a href="<?php echo esc_url( $price_cta_url ); ?>" class="ailp-btn ailp-btn--accent ailp-btn--xl">
      <?php echo esc_html( $price_cta_text ); ?>
    </a>

    <?php if ( $price_reassure ) : ?>
    <p class="ailp-pricing__reassure"><?php echo esc_html( $price_reassure ); ?></p>
    <?php endif; ?>

  </div>
</section><!-- /ailp-pricing -->


<!-- ════════════════════════════ FAQ ═══════════════════════════════════════ -->
<section class="ailp-section ailp-faq">
  <div class="ailp-container ailp-container--narrow">
    <p class="ailp-eyebrow ailp-eyebrow--center"><?php echo esc_html( $faq_eyebrow ); ?></p>
    <h2 class="ailp-section__heading ailp-section__heading--center">
      <?php echo esc_html( $faq_heading ); ?>
    </h2>

    <div class="ailp-faq-list">
      <?php foreach ( $faqs as $i => $faq ) :
        $q  = esc_html( $faq['faq_q'] ?? '' );
        $a  = esc_html( $faq['faq_a'] ?? '' );
        $id = 'ailp-faq-' . $i;
      ?>
      <div class="ailp-faq-item">
        <button class="ailp-faq-question"
                type="button"
                aria-expanded="false"
                aria-controls="<?php echo $id; ?>">
          <?php echo $q; ?>
          <span class="ailp-faq-icon" aria-hidden="true"></span>
        </button>
        <div class="ailp-faq-answer" id="<?php echo $id; ?>" hidden>
          <div class="ailp-faq-answer__inner">
            <p><?php echo $a; ?></p>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>

  </div>
</section><!-- /ailp-faq -->


<!-- ═══════════════════════ FOOTER CTA ═════════════════════════════════════ -->
<section class="ailp-section ailp-footer-cta ailp-section--dark">
  <div class="ailp-container ailp-container--narrow ailp-footer-cta__inner">
    <h2 class="ailp-footer-cta__heading"><?php echo esc_html( $ftrcta_heading ); ?></h2>
    <p class="ailp-footer-cta__sub"><?php echo esc_html( $ftrcta_sub ); ?></p>
    <a href="<?php echo esc_url( $ftrcta_cta_url ); ?>" class="ailp-btn ailp-btn--accent ailp-btn--xl">
      <?php echo esc_html( $ftrcta_cta_text ); ?>
    </a>
    <?php if ( $ftrcta_meta ) : ?>
    <p class="ailp-footer-cta__meta"><?php echo esc_html( $ftrcta_meta ); ?></p>
    <?php endif; ?>
  </div>
</section><!-- /ailp-footer-cta -->


<!-- ═══════════════════════════ FOOTER ═════════════════════════════════════ -->
<footer class="ailp-footer" role="contentinfo">
  <div class="ailp-footer__inner">
    <p class="ailp-footer__copy">
      &copy; <?php echo esc_html( gmdate( 'Y' ) ); ?>
      <?php bloginfo( 'name' ); ?>.
      All rights reserved.
    </p>
    <nav class="ailp-footer__links" aria-label="Footer">
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/terms">Terms &amp; Conditions</a>
      <a href="mailto:<?php echo esc_attr( get_option( 'admin_email' ) ); ?>">Contact</a>
    </nav>
  </div>
</footer><!-- /ailp-footer -->


<!-- ═══════════════════════ FAQ ACCORDION ══════════════════════════════════ -->
<script>
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.ailp-faq-item').forEach(function (item) {
      var btn    = item.querySelector('.ailp-faq-question');
      var answer = item.querySelector('.ailp-faq-answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';

        document.querySelectorAll('.ailp-faq-item').forEach(function (other) {
          other.querySelector('.ailp-faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.ailp-faq-answer').setAttribute('hidden', '');
        });

        if (!open) {
          btn.setAttribute('aria-expanded', 'true');
          answer.removeAttribute('hidden');
        }
      });
    });
  });
}());
</script>

<?php wp_footer(); ?>
</body>
</html>
