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

/** Return a scalar ACF field, or $default if empty / ACF not active. */
function ailp_f( string $key, string $default ): string {
	if ( function_exists( 'get_field' ) ) {
		$v = get_field( $key );
		if ( $v !== null && $v !== '' && $v !== false ) {
			return (string) $v;
		}
	}
	return $default;
}

/** Return a repeater ACF field, or $default if empty / ACF not active. */
function ailp_rows( string $key, array $default ): array {
	if ( function_exists( 'get_field' ) ) {
		$rows = get_field( $key );
		if ( is_array( $rows ) && count( $rows ) > 0 ) {
			return $rows;
		}
	}
	return $default;
}

// ─── Default content ──────────────────────────────────────────────────────

$pain_points_default = [
	[ 'pp_icon' => 'clock',    'pp_title' => 'You spend hours on emails',    'pp_text' => 'Every client update, proposal, or newsletter eats time you don\'t have — and it still doesn\'t sound quite right.' ],
	[ 'pp_icon' => 'document', 'pp_title' => 'Writing takes forever',         'pp_text' => 'Blank-page paralysis, endless edits, second-guessing your tone. Content that should take 20 minutes takes two hours.' ],
	[ 'pp_icon' => 'chart',    'pp_title' => 'Admin never ends',              'pp_text' => 'Meeting summaries, follow-ups, reports, SOPs — operational work that doesn\'t earn money but can\'t be ignored.' ],
];

$modules_default = [
	[
		'mod_num'      => '01',
		'mod_title'    => 'The Content Engine',
		'mod_desc'     => 'Build a repeatable system for creating professional content in a fraction of the usual time.',
		'mod_outcomes' => "Write emails, proposals and newsletters in minutes\nGenerate a month of social content in one session\nDevelop your unique AI writing voice",
	],
	[
		'mod_num'      => '02',
		'mod_title'    => 'The Business Brain',
		'mod_desc'     => 'Use Claude as a thinking partner for strategy, decisions, and problem-solving.',
		'mod_outcomes' => "Structure ideas and build business cases fast\nPrepare for difficult conversations and negotiations\nSummarise research and competitor intel instantly",
	],
	[
		'mod_num'      => '03',
		'mod_title'    => 'The Ops Autopilot',
		'mod_desc'     => 'Systematise the repetitive operational work that eats your week.',
		'mod_outcomes' => "Create SOPs and process docs in minutes\nBuild a custom prompt library for your business\nAutomate your weekly admin routine",
	],
];

$for_you_default = [
	[ 'fy_item' => 'You run a small business or work as a consultant or freelancer' ],
	[ 'fy_item' => 'You\'re time-poor and tired of spending hours on tasks AI could handle' ],
	[ 'fy_item' => 'You\'ve heard about AI tools but don\'t know where to start practically' ],
	[ 'fy_item' => 'You want to produce better written work in significantly less time' ],
	[ 'fy_item' => 'You deal with a lot of operational and administrative work each week' ],
	[ 'fy_item' => 'You\'re UK-based and want practical, business-focused guidance' ],
	[ 'fy_item' => 'You\'d rather invest 2.5 hours learning this properly than waste weeks fumbling through it alone' ],
];

$included_default = [
	[ 'incl_icon' => 'video',     'incl_text' => '2.5-hour live virtual class via Zoom — interactive, not a webinar' ],
	[ 'incl_icon' => 'document',  'incl_text' => '50+ prompt library tailored to UK business owners' ],
	[ 'incl_icon' => 'template',  'incl_text' => 'Ready-to-use templates for emails, proposals, SOPs, and social' ],
	[ 'incl_icon' => 'recording', 'incl_text' => 'Full recording with lifetime access — rewatch any time' ],
	[ 'incl_icon' => 'qa',        'incl_text' => 'Live Q&A session — get your specific questions answered' ],
];

$faq_default = [
	[ 'faq_q' => 'Do I need any technical experience?',
	  'faq_a' => 'Not at all. This class is built for business owners and professionals who want practical results, not those who want to become AI engineers. If you can write an email, you can do this.' ],
	[ 'faq_q' => 'Which AI tool do you use in the class?',
	  'faq_a' => 'We focus on Claude by Anthropic, which consistently produces the best results for business writing and complex tasks. A free account works fine — you don\'t need a paid subscription to follow along.' ],
	[ 'faq_q' => 'Will this work for my industry?',
	  'faq_a' => 'Yes. The frameworks apply across professional services, retail, hospitality, healthcare administration, creative businesses, and more. Bring your specific challenges — the live Q&A is there for exactly this.' ],
	[ 'faq_q' => 'What if I can\'t attend the live session?',
	  'faq_a' => 'You\'ll get lifetime access to the full recording. Attending live is better because of the Q&A, but you won\'t miss out if something comes up.' ],
	[ 'faq_q' => 'When exactly is the class?',
	  'faq_a' => 'The class runs in the second week of July via Zoom. The exact date and time will be confirmed by email after booking. We\'ll schedule around the most popular slots for UK-based attendees.' ],
];

// ─── Pull field values (ACF if set, defaults otherwise) ───────────────────

$hero_headline  = ailp_f( 'hero_headline', "Stop Drowning in Tasks.\nLet AI Handle It." );
$hero_sub       = ailp_f( 'hero_sub',      'A 2.5-hour live class teaching UK professionals to harness Claude AI for content, writing, and operations — so you can reclaim your week.' );
$hero_cta_text  = ailp_f( 'hero_cta_text', 'Reserve My Spot — £79' );
$hero_cta_url   = ailp_f( 'hero_cta_url',  '#booking' );

$prob_eyebrow   = ailp_f( 'prob_eyebrow', 'Sound familiar?' );
$prob_heading   = ailp_f( 'prob_heading', "You're working harder.\nNot smarter." );
$prob_intro     = ailp_f( 'prob_intro',   "The tools are everywhere. The time isn't. Here's what's eating your week:" );

$mod_eyebrow    = ailp_f( 'mod_eyebrow', 'The Curriculum' );
$mod_heading    = ailp_f( 'mod_heading', "What You'll Learn" );
$mod_intro      = ailp_f( 'mod_intro',   'Three focused modules, one transformative afternoon.' );

$foryou_heading = ailp_f( 'foryou_heading', 'This Class Is For You If…' );

$break_quote    = ailp_f( 'break_quote', '"The professionals winning in the next five years won\'t be the ones who work the hardest — they\'ll be the ones who learn to think alongside AI."' );

$instr_eyebrow  = ailp_f( 'instr_eyebrow', 'Your Instructor' );
$instr_name     = ailp_f( 'instr_name',    'Your Name Here' );
$instr_bio      = ailp_f( 'instr_bio',     "I've spent the past two years deep in the AI productivity space — testing every tool, breaking every workflow, and finding what actually saves time for real business owners.\n\nThis class is the distillation of everything I wish I'd known on day one. I teach it live, in plain English, with no fluff." );

$incl_eyebrow   = ailp_f( 'incl_eyebrow', 'Everything You Get' );
$incl_heading   = ailp_f( 'incl_heading', "What's Included" );
$incl_intro     = ailp_f( 'incl_intro',   'One fee. Everything you need to hit the ground running.' );

$price_heading  = ailp_f( 'price_heading',  'One Class. Transformative Results.' );
$price_amount   = ailp_f( 'price_amount',   '79' );
$price_currency = ailp_f( 'price_currency', '£' );
$price_urgency  = ailp_f( 'price_urgency',  'Limited to 20 seats — next cohort fills fast.' );
$price_support  = ailp_f( 'price_support',  'One-time payment. Lifetime access to the recording and materials.' );
$price_cta_text = ailp_f( 'price_cta_text', 'Reserve My Spot — £79' );
$price_cta_url  = ailp_f( 'price_cta_url',  '#booking' );

$faq_eyebrow    = ailp_f( 'faq_eyebrow', 'FAQs' );
$faq_heading    = ailp_f( 'faq_heading', 'Common Questions' );

$ftrcta_heading  = ailp_f( 'ftrcta_heading',  'Ready to Reclaim Your Week?' );
$ftrcta_sub      = ailp_f( 'ftrcta_sub',      'Join 20 professionals who are about to change how they work — permanently.' );
$ftrcta_cta_text = ailp_f( 'ftrcta_cta_text', 'Reserve My Spot — £79' );
$ftrcta_cta_url  = ailp_f( 'ftrcta_cta_url',  '#booking' );

$pain_points = ailp_rows( 'pain_points',    $pain_points_default );
$modules     = ailp_rows( 'modules',        $modules_default );
$for_you     = ailp_rows( 'for_you_items',  $for_you_default );
$included    = ailp_rows( 'included_items', $included_default );
$faqs        = ailp_rows( 'faq_items',      $faq_default );

// Instructor photo
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
			'document2' => '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>',
			'template'  => '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-2h7v2zm5-4H5v-2h12v2zm0-4H5V7h12v2z"/>',
			'recording' => '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>',
			'qa'        => '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>',
			'email'     => '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
			'lightning' => '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
			'users'     => '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
			'settings'  => '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
			'star'      => '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
			'check'     => '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>',
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

    <a href="<?php echo esc_url( $hero_cta_url ); ?>" class="ailp-btn ailp-btn--accent ailp-btn--sm">
      <?php echo esc_html( $hero_cta_text ); ?>
    </a>

  </div>
</header><!-- /ailp-nav -->


<!-- ═══════════════════════════════ HERO ═══════════════════════════════════ -->
<section class="ailp-hero" aria-labelledby="hero-headline">
  <div class="ailp-hero__overlay"></div>
  <div class="ailp-hero__content">
    <h1 id="hero-headline" class="ailp-hero__headline">
      <?php echo wp_kses( nl2br( esc_html( $hero_headline ) ), [ 'br' => [] ] ); ?>
    </h1>
    <p class="ailp-hero__sub"><?php echo esc_html( $hero_sub ); ?></p>
    <a href="<?php echo esc_url( $hero_cta_url ); ?>" class="ailp-btn ailp-btn--accent ailp-btn--lg">
      <?php echo esc_html( $hero_cta_text ); ?>
    </a>
  </div>
</section><!-- /ailp-hero -->


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

    <div class="ailp-cards ailp-cards--3">
      <?php foreach ( $modules as $mod ) :
        $num      = esc_html( $mod['mod_num']   ?? '' );
        $title    = esc_html( $mod['mod_title'] ?? '' );
        $desc     = esc_html( $mod['mod_desc']  ?? '' );
        $outcomes = isset( $mod['mod_outcomes'] ) ? array_filter( array_map( 'trim', explode( "\n", $mod['mod_outcomes'] ) ) ) : [];
      ?>
      <div class="ailp-card ailp-module-card">
        <span class="ailp-module-card__num"><?php echo $num; ?></span>
        <h3 class="ailp-module-card__title"><?php echo $title; ?></h3>
        <p class="ailp-module-card__desc"><?php echo $desc; ?></p>
        <?php if ( $outcomes ) : ?>
        <ul class="ailp-module-card__outcomes">
          <?php foreach ( $outcomes as $outcome ) : ?>
          <li><?php echo esc_html( $outcome ); ?></li>
          <?php endforeach; ?>
        </ul>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>

  </div>
</section><!-- /ailp-modules -->


<!-- ═══════════════════════════ FOR YOU ════════════════════════════════════ -->
<section class="ailp-section ailp-foryou">
  <div class="ailp-container ailp-container--narrow">
    <h2 class="ailp-section__heading ailp-section__heading--center">
      <?php echo esc_html( $foryou_heading ); ?>
    </h2>
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
  </div>
</section><!-- /ailp-foryou -->


<!-- ═══════════════════════════ BREAK ══════════════════════════════════════ -->
<section class="ailp-break" aria-label="Pull quote">
  <div class="ailp-break__overlay"></div>
  <div class="ailp-container">
    <blockquote class="ailp-break__quote">
      <?php echo esc_html( $break_quote ); ?>
    </blockquote>
  </div>
</section><!-- /ailp-break -->


<!-- ═══════════════════════════ INSTRUCTOR ═════════════════════════════════ -->
<section class="ailp-section ailp-instructor ailp-section--alt">
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
        <h2 class="ailp-instructor__name"><?php echo esc_html( $instr_name ); ?></h2>
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
<section class="ailp-section ailp-included">
  <div class="ailp-container ailp-container--narrow">
    <p class="ailp-eyebrow ailp-eyebrow--center"><?php echo esc_html( $incl_eyebrow ); ?></p>
    <h2 class="ailp-section__heading ailp-section__heading--center">
      <?php echo esc_html( $incl_heading ); ?>
    </h2>
    <p class="ailp-section__intro ailp-section__intro--center"><?php echo esc_html( $incl_intro ); ?></p>

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
    <h2 class="ailp-pricing__heading"><?php echo esc_html( $price_heading ); ?></h2>
    <div class="ailp-pricing__price" aria-label="Price: <?php echo esc_attr( $price_currency . $price_amount ); ?>">
      <sup class="ailp-pricing__currency"><?php echo esc_html( $price_currency ); ?></sup>
      <span class="ailp-pricing__amount"><?php echo esc_html( $price_amount ); ?></span>
    </div>
    <p class="ailp-pricing__urgency"><?php echo esc_html( $price_urgency ); ?></p>
    <p class="ailp-pricing__support"><?php echo esc_html( $price_support ); ?></p>
    <a href="<?php echo esc_url( $price_cta_url ); ?>" class="ailp-btn ailp-btn--accent ailp-btn--xl">
      <?php echo esc_html( $price_cta_text ); ?>
    </a>
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
        $q = esc_html( $faq['faq_q'] ?? '' );
        $a = esc_html( $faq['faq_a'] ?? '' );
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

        // Close all items
        document.querySelectorAll('.ailp-faq-item').forEach(function (other) {
          other.querySelector('.ailp-faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.ailp-faq-answer').setAttribute('hidden', '');
        });

        // Open clicked item if it was closed
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
