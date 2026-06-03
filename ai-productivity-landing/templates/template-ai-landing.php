<?php
/**
 * Template Name: AI Landing Page
 * Template Post Type: page
 *
 * Loaded by the AI Productivity Accelerator Landing Page plugin.
 * Content comes from ACF fields. Every section has hardcoded defaults
 * so the page renders fully even before ACF fields are filled in.
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'get_field' ) ) {
	wp_die( 'This template requires Advanced Custom Fields. Please install and activate it.' );
}

// ─────────────────────────────────────────────────────────────────────────
// DEFAULTS — shown when ACF fields are empty.
// Edit these here OR override them via the ACF field group on each page.
// ─────────────────────────────────────────────────────────────────────────
function ai_landing_defaults(): array {
	return [

		'pain_points' => [
			[
				'icon'  => 'email',
				'title' => 'Emails eat your mornings',
				'text'  => 'Client updates, proposals, chaser emails — each one takes 20 minutes you don\'t have. And it still never sounds quite right.',
			],
			[
				'icon'  => 'document',
				'title' => 'Content is a constant grind',
				'text'  => 'LinkedIn posts, newsletters, website copy — staring at a blank page every single week, never ahead, always behind.',
			],
			[
				'icon'  => 'settings',
				'title' => 'Admin kills your momentum',
				'text'  => 'Meeting notes, SOPs, internal reports — the operational grind that keeps you away from the work that actually grows your business.',
			],
		],

		'modules' => [
			[
				'module_number'      => 'Module 01',
				'module_title'       => 'Content Engine',
				'module_description' => 'Write faster than you ever thought possible. Build a system that generates quality content in minutes, not hours.',
				'module_outcomes'    => "Draft a week of LinkedIn posts in 20 minutes\nTurn a voice note into a polished newsletter\nRepurpose any existing content instantly\nBuild a content calendar that runs itself",
			],
			[
				'module_number'      => 'Module 02',
				'module_title'       => 'Business Brain',
				'module_description' => 'Claude as your on-demand business writing partner. Proposals, bios, and emails that actually get replies.',
				'module_outcomes'    => "Write winning proposals in under an hour\nCraft a compelling bio in 10 minutes\nRespond to briefs and RFPs with confidence\nBuild reusable prompt templates for your business",
			],
			[
				'module_number'      => 'Module 03',
				'module_title'       => 'Ops Autopilot',
				'module_description' => 'Reclaim hours every week with AI-assisted operations. From meeting notes to full SOPs in minutes.',
				'module_outcomes'    => "Summarise meetings and extract action points\nWrite and maintain SOPs in minutes\nBuild internal knowledge bases fast\nDelegate research and reporting tasks to Claude",
			],
		],

		'for_you_items' => [
			[ 'item' => 'You run a small business and wear too many hats' ],
			[ 'item' => 'You spend hours on content that never feels good enough' ],
			[ 'item' => 'You\'ve tried AI tools but got generic, useless output' ],
			[ 'item' => 'You know AI is important but don\'t know where to start' ],
			[ 'item' => 'You want real workflows, not theory or hype' ],
			[ 'item' => 'You\'re a consultant, coach, or freelancer drowning in admin' ],
		],

		'included_items' => [
			[ 'item' => 'Live 2.5-hour virtual class via Zoom — second week of July' ],
			[ 'item' => 'Prompt library — 40+ ready-to-use Claude prompts for business' ],
			[ 'item' => 'Templates pack — email, content, proposal, and SOP templates' ],
			[ 'item' => 'Full session recording — yours to keep and rewatch anytime' ],
			[ 'item' => 'Live Q&A — get your specific questions answered in real time' ],
		],

		'faq_items' => [
			[
				'question' => 'Do I need any technical experience?',
				'answer'   => 'Not at all. This class is built for business owners and professionals who want practical results, not those who want to become AI engineers. If you can write an email, you can do this.',
			],
			[
				'question' => 'Which AI tool does the class use?',
				'answer'   => 'We use Claude by Anthropic throughout — it\'s the most capable AI for business writing, communication, and structured thinking. You\'ll need a free Claude.ai account. We\'ll walk you through getting started if you\'re new to it.',
			],
			[
				'question' => 'Will the session be recorded?',
				'answer'   => 'Yes. Every registered attendee gets lifetime access to the full recording, so you can rewatch any section as many times as you need — even if you can\'t attend live.',
			],
			[
				'question' => 'What if I can\'t make the live date?',
				'answer'   => 'Sign up anyway. You\'ll get the recording, the prompt library, and all the templates immediately after the class. The live session is the best experience, but the materials are built to stand completely on their own.',
			],
			[
				'question' => 'Is there a refund policy?',
				'answer'   => 'Yes — full refund available up to 48 hours before the class. After that, your spot and the recording are non-refundable, but everything you receive is yours to keep.',
			],
		],

	];
}

/**
 * Get a repeater field value with fallback to hardcoded defaults.
 * Works whether ACF has saved rows or not.
 */
function ai_landing_rows( string $key ): array {
	$value = get_field( $key );
	if ( ! empty( $value ) && is_array( $value ) ) {
		return $value;
	}
	return ai_landing_defaults()[ $key ] ?? [];
}

/**
 * Get a simple scalar field with a fallback string.
 */
function ai_landing_field( string $key, string $fallback = '' ): string {
	$value = get_field( $key );
	return ( $value !== false && $value !== null && $value !== '' ) ? (string) $value : $fallback;
}

// ─────────────────────────────────────────────────────────────────────────
// Icon helper
// ─────────────────────────────────────────────────────────────────────────
function ai_landing_icon( string $name ): string {
	$base = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" '
		. 'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

	$paths = [
		'clock'     => '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		'email'     => '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
		'document'  => '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
		'chart'     => '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
		'lightning' => '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
		'users'     => '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
		'settings'  => '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
		'star'      => '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
	];

	$inner = $paths[ $name ] ?? $paths['clock'];
	return '<svg class="pain-point__icon" ' . $base . '>' . $inner . '</svg>';
}

function ai_landing_checkmark(): string {
	return '<svg aria-hidden="true" class="check-icon" xmlns="http://www.w3.org/2000/svg" '
		. 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" '
		. 'stroke-linecap="round" stroke-linejoin="round">'
		. '<polyline points="20 6 9 17 4 12"/>'
		. '</svg>';
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class( 'landing-page' ); ?>>
<?php wp_body_open(); ?>


<!-- ════════════════════ NAV ════════════════════ -->
<?php
$hero_cta_url   = ai_landing_field( 'hero_cta_url',   '#booking' );
$hero_cta_label = ai_landing_field( 'hero_cta_label', 'Reserve My Spot — £79' );
?>
<header class="landing-nav" role="banner">
  <div class="landing-nav__inner">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>"
       class="landing-nav__logo"
       aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> home">
      <?php if ( has_custom_logo() ) : the_custom_logo();
      else : ?><span class="landing-nav__wordmark"><?php bloginfo( 'name' ); ?></span><?php endif; ?>
    </a>
    <a href="<?php echo esc_url( $hero_cta_url ); ?>" class="btn btn--accent btn--sm">
      <?php echo esc_html( $hero_cta_label ); ?>
    </a>
  </div>
</header>


<?php while ( have_posts() ) : the_post(); ?>

<!-- ════════════════════ 1. HERO ════════════════════ -->
<?php
$hero_img     = get_field( 'hero_background_image' );
$hero_img_url = is_array( $hero_img ) ? $hero_img['url'] : '';
$hero_style   = $hero_img_url ? ' style="background-image:url(' . esc_url( $hero_img_url ) . ');"' : '';
?>
<section class="section-hero"<?php echo $hero_style; ?> aria-label="Hero">
  <div class="section-hero__content">
    <h1><?php echo wp_kses(
      ai_landing_field( 'hero_headline', 'Stop Drowning in Tasks. Let AI Handle It.' ),
      [ 'em' => [], 'strong' => [], 'br' => [] ]
    ); ?></h1>
    <p class="hero-sub"><?php echo esc_html( ai_landing_field(
      'hero_subheadline',
      'A 2.5-hour live virtual class for UK professionals and small business owners. Learn to use Claude AI for content, writing, and operations — in one afternoon.'
    ) ); ?></p>
    <a href="<?php echo esc_url( $hero_cta_url ); ?>" class="btn btn--accent">
      <?php echo esc_html( $hero_cta_label ); ?>
    </a>
    <p class="hero-meta"><?php echo esc_html( ai_landing_field(
      'hero_meta',
      'Second week of July  ·  Live via Zoom  ·  2.5 hours'
    ) ); ?></p>
  </div>
</section>


<!-- ════════════════════ 2. PROBLEM ════════════════════ -->
<section class="section-problem" aria-label="The problem">
  <div class="section-problem__inner">
    <span class="section-eyebrow"><?php echo esc_html( ai_landing_field( 'problem_eyebrow', 'Sound familiar?' ) ); ?></span>
    <h2><?php echo esc_html( ai_landing_field( 'problem_headline', "You're working harder. Not smarter." ) ); ?></h2>
    <p class="section-intro"><?php echo esc_html( ai_landing_field( 'problem_intro', 'Every day you lose hours to tasks AI could handle in minutes.' ) ); ?></p>

    <div class="pain-points-grid">
      <?php foreach ( ai_landing_rows( 'pain_points' ) as $point ) : ?>
      <div class="pain-point">
        <?php echo ai_landing_icon( $point['icon'] ?? 'clock' ); ?>
        <h3 class="pain-point__title"><?php echo esc_html( $point['title'] ?? '' ); ?></h3>
        <p class="pain-point__text"><?php echo esc_html( $point['text'] ?? '' ); ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>


<!-- ════════════════════ 3. MODULES ════════════════════ -->
<section class="section-modules" aria-label="What you'll learn">
  <div class="section-modules__inner">
    <span class="section-eyebrow text-center"><?php echo esc_html( ai_landing_field( 'modules_eyebrow', 'The Curriculum' ) ); ?></span>
    <h2 class="text-center"><?php echo esc_html( ai_landing_field( 'modules_headline', "What You'll Learn" ) ); ?></h2>
    <p class="section-intro text-center"><?php echo esc_html( ai_landing_field( 'modules_intro', 'Three focused modules. Practical skills you can use the same day.' ) ); ?></p>

    <div class="modules-grid">
      <?php foreach ( ai_landing_rows( 'modules' ) as $module ) :
        $outcomes = array_filter( array_map( 'trim', explode( "\n", $module['module_outcomes'] ?? '' ) ) );
      ?>
      <div class="module-card">
        <?php if ( ! empty( $module['module_number'] ) ) : ?>
        <span class="module-card__number"><?php echo esc_html( $module['module_number'] ); ?></span>
        <?php endif; ?>
        <h3><?php echo esc_html( $module['module_title'] ?? '' ); ?></h3>
        <?php if ( ! empty( $module['module_description'] ) ) : ?>
        <p><?php echo esc_html( $module['module_description'] ); ?></p>
        <?php endif; ?>
        <?php if ( $outcomes ) : ?>
        <ul>
          <?php foreach ( $outcomes as $outcome ) : ?>
          <li><?php echo esc_html( $outcome ); ?></li>
          <?php endforeach; ?>
        </ul>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>


<!-- ════════════════════ 4. WHO IT'S FOR ════════════════════ -->
<section class="section-for-you" aria-label="Who this is for">
  <div class="section-for-you__inner">
    <span class="section-eyebrow"><?php esc_html_e( 'Is This For Me?', 'ai-landing' ); ?></span>
    <h2><?php echo esc_html( ai_landing_field( 'for_you_headline', 'This Class Is For You If…' ) ); ?></h2>
    <?php $fy_intro = ai_landing_field( 'for_you_intro', 'No technical background needed. Just a willingness to work differently.' ); ?>
    <p class="section-intro"><?php echo esc_html( $fy_intro ); ?></p>
    <ul class="for-you-list">
      <?php foreach ( ai_landing_rows( 'for_you_items' ) as $item ) : ?>
      <li>
        <?php echo ai_landing_checkmark(); ?>
        <span><?php echo esc_html( $item['item'] ?? '' ); ?></span>
      </li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>


<!-- ════════════════════ 5. IMAGE BREAK ════════════════════ -->
<?php $quote = ai_landing_field( 'break_quote', "The professionals winning right now aren't working harder. They've just found a smarter way to work." ); ?>
<section class="section-break" aria-label="Quote">
  <div class="section-break__inner">
    <blockquote>
      <p><?php echo esc_html( $quote ); ?></p>
      <?php $attr = ai_landing_field( 'break_attribution' ); if ( $attr ) : ?>
      <cite><?php echo esc_html( $attr ); ?></cite>
      <?php endif; ?>
    </blockquote>
  </div>
</section>


<!-- ════════════════════ 6. INSTRUCTOR ════════════════════ -->
<section class="section-instructor" aria-label="About the instructor">
  <div class="section-instructor__inner">

    <div class="section-instructor__image">
      <?php $photo = get_field( 'instructor_photo' ); ?>
      <?php if ( is_array( $photo ) && ! empty( $photo['url'] ) ) : ?>
        <img src="<?php echo esc_url( $photo['url'] ); ?>"
             alt="<?php echo esc_attr( $photo['alt'] ?: ai_landing_field( 'instructor_name', 'Instructor' ) ); ?>"
             width="<?php echo esc_attr( $photo['width'] ?? '' ); ?>"
             height="<?php echo esc_attr( $photo['height'] ?? '' ); ?>">
      <?php else : ?>
        <div class="instructor-photo-placeholder">
          <span>Upload your photo<br>in ACF → Instructor tab</span>
        </div>
      <?php endif; ?>
    </div>

    <div class="section-instructor__text">
      <span class="section-eyebrow"><?php echo esc_html( ai_landing_field( 'instructor_eyebrow', 'Your Instructor' ) ); ?></span>
      <h2><?php echo esc_html( ai_landing_field( 'instructor_name', 'Your Name' ) ); ?></h2>

      <?php
      $bio = get_field( 'instructor_bio' );
      if ( empty( $bio ) ) {
        $bio = '<p>Add a short, punchy bio here. Focus on your credibility and why you are the right person to teach this. Keep it to 2–3 short paragraphs. Speak directly to the person reading — make them feel this is exactly who they want to learn from.</p>';
      }
      ?>
      <div class="instructor-bio"><?php echo wp_kses_post( $bio ); ?></div>

      <?php
      $link_label = ai_landing_field( 'instructor_link_label' );
      $link_url   = ai_landing_field( 'instructor_link_url' );
      if ( $link_label && $link_url ) :
      ?>
      <a href="<?php echo esc_url( $link_url ); ?>" class="btn btn--outline"
         target="_blank" rel="noopener noreferrer">
        <?php echo esc_html( $link_label ); ?>
      </a>
      <?php endif; ?>
    </div>

  </div>
</section>


<!-- ════════════════════ 7. WHAT'S INCLUDED ════════════════════ -->
<section class="section-included" aria-label="What's included">
  <div class="section-included__inner">
    <span class="section-eyebrow text-center"><?php echo esc_html( ai_landing_field( 'included_eyebrow', 'Everything You Get' ) ); ?></span>
    <h2 class="text-center"><?php echo esc_html( ai_landing_field( 'included_headline', "What's Included" ) ); ?></h2>
    <p class="section-intro text-center"><?php echo esc_html( ai_landing_field( 'included_intro', 'One price. Everything you need to hit the ground running.' ) ); ?></p>
    <ul class="included-list">
      <?php foreach ( ai_landing_rows( 'included_items' ) as $item ) : ?>
      <li><?php echo esc_html( $item['item'] ?? '' ); ?></li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>


<!-- ════════════════════ 8. PRICING ════════════════════ -->
<?php
$price_url      = ai_landing_field( 'pricing_cta_url',   '#booking' );
$price_label    = ai_landing_field( 'pricing_cta_label', 'Reserve My Spot — £79' );
$price_currency = ai_landing_field( 'pricing_currency',  '£' );
$price_amount   = ai_landing_field( 'pricing_amount',    '79' );
?>
<section id="booking" class="section-pricing" aria-label="Pricing">
  <div class="section-pricing__inner">
    <h2><?php echo esc_html( ai_landing_field( 'pricing_headline', 'One Class. Transformative Results.' ) ); ?></h2>
    <p class="price-display"><sup><?php echo esc_html( $price_currency ); ?></sup><?php echo esc_html( $price_amount ); ?></p>
    <p class="urgency"><?php echo esc_html( ai_landing_field( 'pricing_urgency', 'Limited to 20 seats' ) ); ?></p>
    <p><?php echo esc_html( ai_landing_field( 'pricing_body', 'One payment. Lifetime access to the recording and all materials.' ) ); ?></p>
    <a href="<?php echo esc_url( $price_url ); ?>" class="btn btn--accent">
      <?php echo esc_html( $price_label ); ?>
    </a>
  </div>
</section>


<!-- ════════════════════ 9. FAQ ════════════════════ -->
<section class="section-faq" aria-label="Frequently asked questions">
  <div class="section-faq__inner">
    <span class="section-eyebrow text-center"><?php echo esc_html( ai_landing_field( 'faq_eyebrow', 'FAQs' ) ); ?></span>
    <h2 class="text-center"><?php echo esc_html( ai_landing_field( 'faq_headline', 'Common Questions' ) ); ?></h2>
    <div class="faq-list">
      <?php foreach ( ai_landing_rows( 'faq_items' ) as $faq ) : ?>
      <div class="faq-item">
        <button class="faq-question" type="button">
          <?php echo esc_html( $faq['question'] ?? '' ); ?>
        </button>
        <div class="faq-answer" aria-hidden="true">
          <div class="faq-answer__inner">
            <p><?php echo esc_html( $faq['answer'] ?? '' ); ?></p>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>


<!-- ════════════════════ 10. FOOTER CTA ════════════════════ -->
<?php
$fcta_url   = ai_landing_field( 'footer_cta_url',   '#booking' );
$fcta_label = ai_landing_field( 'footer_cta_label', 'Reserve My Spot — £79' );
?>
<section class="section-footer-cta" aria-label="Final call to action">
  <div class="section-footer-cta__inner">
    <h2><?php echo esc_html( ai_landing_field( 'footer_cta_headline', "Your Seat Won't Wait." ) ); ?></h2>
    <p><?php echo esc_html( ai_landing_field( 'footer_cta_body', "20 places. Once they're gone, they're gone. The next cohort has no confirmed date." ) ); ?></p>
    <a href="<?php echo esc_url( $fcta_url ); ?>" class="btn">
      <?php echo esc_html( $fcta_label ); ?>
    </a>
  </div>
</section>

<?php endwhile; ?>


<!-- ════════════════════ FOOTER ════════════════════ -->
<footer class="landing-footer" role="contentinfo">
  <div class="landing-footer__inner">
    <p class="landing-footer__copy">
      &copy; <?php echo esc_html( gmdate( 'Y' ) ); ?>
      <?php bloginfo( 'name' ); ?>. All rights reserved.
    </p>
    <nav class="landing-footer__links" aria-label="Footer navigation">
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/terms">Terms &amp; Conditions</a>
      <a href="mailto:<?php echo esc_attr( get_option( 'admin_email' ) ); ?>">Contact</a>
    </nav>
  </div>
</footer>


<!-- ════════════════════ ACCORDION JS ════════════════════ -->
<script>
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var trigger = item.querySelector('.faq-question');
      var answer  = item.querySelector('.faq-answer');
      if (!trigger || !answer) return;

      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
          }
        });

        item.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
        answer.setAttribute('aria-hidden', String(isOpen));
      });
    });
  });
}());
</script>

<?php wp_footer(); ?>
</body>
</html>
