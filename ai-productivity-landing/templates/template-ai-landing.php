<?php
/**
 * Template Name: AI Landing Page
 * Template Post Type: page
 *
 * Loaded by the AI Productivity Accelerator Landing Page plugin.
 * All content comes from ACF fields — no block editor involved.
 * Edit every section via the tabbed field groups below the page title.
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'get_field' ) ) {
	wp_die( 'This template requires Advanced Custom Fields. Please install and activate it.' );
}

// ─────────────────────────────────────────────────────────────────────────
// Icon helper — returns an SVG string keyed by the ACF select value.
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

// ─────────────────────────────────────────────────────────────────────────
// Inline SVG checkmark used in the "Who It's For" section.
// ─────────────────────────────────────────────────────────────────────────
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


<!-- ═══════════════════════════════════════════════════════
     NAV — edit CTA label/link in ACF → Hero tab
════════════════════════════════════════════════════════ -->
<header class="landing-nav" role="banner">
  <div class="landing-nav__inner">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>"
       class="landing-nav__logo"
       aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> home">
      <?php if ( has_custom_logo() ) : the_custom_logo();
      else : ?><span class="landing-nav__wordmark"><?php bloginfo( 'name' ); ?></span><?php endif; ?>
    </a>
    <?php
    $nav_url   = get_field( 'hero_cta_url' )   ?: '#booking';
    $nav_label = get_field( 'hero_cta_label' ) ?: 'Reserve My Spot — £79';
    ?>
    <a href="<?php echo esc_url( $nav_url ); ?>" class="btn btn--accent btn--sm">
      <?php echo esc_html( $nav_label ); ?>
    </a>
  </div>
</header>


<?php while ( have_posts() ) : the_post(); ?>

<!-- ═══════════════════════════════════════════════════════
     SECTION 1: HERO
     ACF tab: Hero
════════════════════════════════════════════════════════ -->
<?php
$hero_img     = get_field( 'hero_background_image' );
$hero_img_url = is_array( $hero_img ) ? $hero_img['url'] : '';
$hero_style   = $hero_img_url
	? ' style="background-image:url(' . esc_url( $hero_img_url ) . ');"'
	: '';
?>
<section class="section-hero"<?php echo $hero_style; ?> aria-label="Hero">
  <div class="section-hero__content">

    <h1><?php echo wp_kses( get_field( 'hero_headline' ) ?: 'Stop Drowning in Tasks. Let AI Handle It.', [ 'em' => [], 'strong' => [] ] ); ?></h1>

    <p class="hero-sub"><?php echo esc_html( get_field( 'hero_subheadline' ) ); ?></p>

    <a href="<?php echo esc_url( $nav_url ); ?>" class="btn btn--accent">
      <?php echo esc_html( $nav_label ); ?>
    </a>

    <?php $meta = get_field( 'hero_meta' ); if ( $meta ) : ?>
    <p class="hero-meta"><?php echo esc_html( $meta ); ?></p>
    <?php endif; ?>

  </div>
</section>


<!-- ═══════════════════════════════════════════════════════
     SECTION 2: PROBLEM
     ACF tab: Problem
════════════════════════════════════════════════════════ -->
<section class="section-problem" aria-label="The problem">
  <div class="section-problem__inner">

    <?php $eyebrow = get_field( 'problem_eyebrow' ); if ( $eyebrow ) : ?>
    <span class="section-eyebrow"><?php echo esc_html( $eyebrow ); ?></span>
    <?php endif; ?>

    <h2><?php echo esc_html( get_field( 'problem_headline' ) ?: "You're working harder. Not smarter." ); ?></h2>

    <?php $intro = get_field( 'problem_intro' ); if ( $intro ) : ?>
    <p class="section-intro"><?php echo esc_html( $intro ); ?></p>
    <?php endif; ?>

    <?php if ( have_rows( 'pain_points' ) ) : ?>
    <div class="pain-points-grid">
      <?php while ( have_rows( 'pain_points' ) ) : the_row(); ?>
      <div class="pain-point">
        <?php echo ai_landing_icon( get_sub_field( 'icon' ) ?: 'clock' ); ?>
        <h3 class="pain-point__title"><?php echo esc_html( get_sub_field( 'title' ) ); ?></h3>
        <p class="pain-point__text"><?php echo esc_html( get_sub_field( 'text' ) ); ?></p>
      </div>
      <?php endwhile; ?>
    </div>
    <?php endif; ?>

  </div>
</section>


<!-- ═══════════════════════════════════════════════════════
     SECTION 3: MODULES (What You'll Learn)
     ACF tab: Modules
════════════════════════════════════════════════════════ -->
<section class="section-modules" aria-label="What you'll learn">
  <div class="section-modules__inner">

    <?php $eyebrow = get_field( 'modules_eyebrow' ); if ( $eyebrow ) : ?>
    <span class="section-eyebrow text-center"><?php echo esc_html( $eyebrow ); ?></span>
    <?php endif; ?>

    <h2 class="text-center"><?php echo esc_html( get_field( 'modules_headline' ) ?: "What You'll Learn" ); ?></h2>

    <?php $intro = get_field( 'modules_intro' ); if ( $intro ) : ?>
    <p class="section-intro text-center"><?php echo esc_html( $intro ); ?></p>
    <?php endif; ?>

    <?php if ( have_rows( 'modules' ) ) : ?>
    <div class="modules-grid">
      <?php while ( have_rows( 'modules' ) ) : the_row(); ?>
      <div class="module-card">

        <?php $num = get_sub_field( 'module_number' ); if ( $num ) : ?>
        <span class="module-card__number"><?php echo esc_html( $num ); ?></span>
        <?php endif; ?>

        <h3><?php echo esc_html( get_sub_field( 'module_title' ) ); ?></h3>

        <?php $desc = get_sub_field( 'module_description' ); if ( $desc ) : ?>
        <p><?php echo esc_html( $desc ); ?></p>
        <?php endif; ?>

        <?php
        $raw_outcomes = get_sub_field( 'module_outcomes' );
        if ( $raw_outcomes ) :
          $outcomes = array_filter( array_map( 'trim', explode( "\n", $raw_outcomes ) ) );
          if ( $outcomes ) :
        ?>
        <ul>
          <?php foreach ( $outcomes as $outcome ) : ?>
          <li><?php echo esc_html( $outcome ); ?></li>
          <?php endforeach; ?>
        </ul>
        <?php endif; endif; ?>

      </div>
      <?php endwhile; ?>
    </div>
    <?php endif; ?>

  </div>
</section>


<!-- ═══════════════════════════════════════════════════════
     SECTION 4: WHO IT'S FOR
     ACF tab: Who It's For
════════════════════════════════════════════════════════ -->
<section class="section-for-you" aria-label="Who this is for">
  <div class="section-for-you__inner">

    <h2><?php echo esc_html( get_field( 'for_you_headline' ) ?: 'This Class Is For You If…' ); ?></h2>

    <?php $intro = get_field( 'for_you_intro' ); if ( $intro ) : ?>
    <p class="section-intro"><?php echo esc_html( $intro ); ?></p>
    <?php endif; ?>

    <?php if ( have_rows( 'for_you_items' ) ) : ?>
    <ul class="for-you-list">
      <?php while ( have_rows( 'for_you_items' ) ) : the_row(); ?>
      <li>
        <?php echo ai_landing_checkmark(); ?>
        <span><?php echo esc_html( get_sub_field( 'item' ) ); ?></span>
      </li>
      <?php endwhile; ?>
    </ul>
    <?php endif; ?>

  </div>
</section>


<!-- ═══════════════════════════════════════════════════════
     SECTION 5: MID-PAGE BREAK
     ACF tab: Image Break
════════════════════════════════════════════════════════ -->
<?php $quote = get_field( 'break_quote' ); if ( $quote ) : ?>
<section class="section-break" aria-label="Quote">
  <div class="section-break__inner">
    <blockquote>
      <p><?php echo esc_html( $quote ); ?></p>
      <?php $attr = get_field( 'break_attribution' ); if ( $attr ) : ?>
      <cite><?php echo esc_html( $attr ); ?></cite>
      <?php endif; ?>
    </blockquote>
  </div>
</section>
<?php endif; ?>


<!-- ═══════════════════════════════════════════════════════
     SECTION 6: INSTRUCTOR
     ACF tab: Instructor
════════════════════════════════════════════════════════ -->
<section class="section-instructor" aria-label="About the instructor">
  <div class="section-instructor__inner">

    <?php $photo = get_field( 'instructor_photo' ); ?>
    <div class="section-instructor__image">
      <?php if ( is_array( $photo ) ) : ?>
        <img src="<?php echo esc_url( $photo['url'] ); ?>"
             alt="<?php echo esc_attr( $photo['alt'] ?: get_field( 'instructor_name' ) ); ?>"
             width="<?php echo esc_attr( $photo['width'] ?? '' ); ?>"
             height="<?php echo esc_attr( $photo['height'] ?? '' ); ?>">
      <?php else : ?>
        <div class="instructor-photo-placeholder" aria-hidden="true"></div>
      <?php endif; ?>
    </div>

    <div class="section-instructor__text">
      <?php $eyebrow = get_field( 'instructor_eyebrow' ); if ( $eyebrow ) : ?>
      <span class="section-eyebrow"><?php echo esc_html( $eyebrow ); ?></span>
      <?php endif; ?>

      <h2><?php echo esc_html( get_field( 'instructor_name' ) ?: 'Your Name' ); ?></h2>

      <?php $bio = get_field( 'instructor_bio' ); if ( $bio ) : ?>
      <div class="instructor-bio"><?php echo wp_kses_post( $bio ); ?></div>
      <?php endif; ?>

      <?php
      $link_label = get_field( 'instructor_link_label' );
      $link_url   = get_field( 'instructor_link_url' );
      if ( $link_label && $link_url ) :
      ?>
      <a href="<?php echo esc_url( $link_url ); ?>"
         class="btn btn--outline"
         target="_blank" rel="noopener noreferrer">
        <?php echo esc_html( $link_label ); ?>
      </a>
      <?php endif; ?>
    </div>

  </div>
</section>


<!-- ═══════════════════════════════════════════════════════
     SECTION 7: WHAT'S INCLUDED
     ACF tab: What's Included
════════════════════════════════════════════════════════ -->
<section class="section-included" aria-label="What's included">
  <div class="section-included__inner">

    <?php $eyebrow = get_field( 'included_eyebrow' ); if ( $eyebrow ) : ?>
    <span class="section-eyebrow text-center"><?php echo esc_html( $eyebrow ); ?></span>
    <?php endif; ?>

    <h2 class="text-center"><?php echo esc_html( get_field( 'included_headline' ) ?: "What's Included" ); ?></h2>

    <?php $intro = get_field( 'included_intro' ); if ( $intro ) : ?>
    <p class="section-intro text-center"><?php echo esc_html( $intro ); ?></p>
    <?php endif; ?>

    <?php if ( have_rows( 'included_items' ) ) : ?>
    <ul class="included-list">
      <?php while ( have_rows( 'included_items' ) ) : the_row(); ?>
      <li><?php echo esc_html( get_sub_field( 'item' ) ); ?></li>
      <?php endwhile; ?>
    </ul>
    <?php endif; ?>

  </div>
</section>


<!-- ═══════════════════════════════════════════════════════
     SECTION 8: PRICING & CTA
     ACF tab: Pricing
════════════════════════════════════════════════════════ -->
<?php
$price_url   = get_field( 'pricing_cta_url' )   ?: '#booking';
$price_label = get_field( 'pricing_cta_label' ) ?: 'Reserve My Spot — £79';
?>
<section id="booking" class="section-pricing" aria-label="Pricing">
  <div class="section-pricing__inner">

    <h2><?php echo esc_html( get_field( 'pricing_headline' ) ?: 'One Class. Transformative Results.' ); ?></h2>

    <p class="price-display">
      <sup><?php echo esc_html( get_field( 'pricing_currency' ) ?: '£' ); ?></sup><?php echo esc_html( get_field( 'pricing_amount' ) ?: '79' ); ?>
    </p>

    <?php $urgency = get_field( 'pricing_urgency' ); if ( $urgency ) : ?>
    <p class="urgency"><?php echo esc_html( $urgency ); ?></p>
    <?php endif; ?>

    <?php $body = get_field( 'pricing_body' ); if ( $body ) : ?>
    <p><?php echo esc_html( $body ); ?></p>
    <?php endif; ?>

    <a href="<?php echo esc_url( $price_url ); ?>" class="btn btn--accent">
      <?php echo esc_html( $price_label ); ?>
    </a>

  </div>
</section>


<!-- ═══════════════════════════════════════════════════════
     SECTION 9: FAQ ACCORDION
     ACF tab: FAQ
════════════════════════════════════════════════════════ -->
<?php if ( have_rows( 'faq_items' ) ) : ?>
<section class="section-faq" aria-label="Frequently asked questions">
  <div class="section-faq__inner">

    <?php $eyebrow = get_field( 'faq_eyebrow' ); if ( $eyebrow ) : ?>
    <span class="section-eyebrow text-center"><?php echo esc_html( $eyebrow ); ?></span>
    <?php endif; ?>

    <h2 class="text-center"><?php echo esc_html( get_field( 'faq_headline' ) ?: 'Common Questions' ); ?></h2>

    <div class="faq-list">
      <?php while ( have_rows( 'faq_items' ) ) : the_row(); ?>
      <div class="faq-item">
        <button class="faq-question" type="button">
          <?php echo esc_html( get_sub_field( 'question' ) ); ?>
        </button>
        <div class="faq-answer" aria-hidden="true">
          <div class="faq-answer__inner">
            <p><?php echo esc_html( get_sub_field( 'answer' ) ); ?></p>
          </div>
        </div>
      </div>
      <?php endwhile; ?>
    </div>

  </div>
</section>
<?php endif; ?>


<!-- ═══════════════════════════════════════════════════════
     SECTION 10: FOOTER CTA
     ACF tab: Footer CTA
════════════════════════════════════════════════════════ -->
<section class="section-footer-cta" aria-label="Final call to action">
  <div class="section-footer-cta__inner">

    <h2><?php echo esc_html( get_field( 'footer_cta_headline' ) ?: "Your Seat Won't Wait." ); ?></h2>

    <?php $body = get_field( 'footer_cta_body' ); if ( $body ) : ?>
    <p><?php echo esc_html( $body ); ?></p>
    <?php endif; ?>

    <?php
    $fcta_url   = get_field( 'footer_cta_url' )   ?: '#booking';
    $fcta_label = get_field( 'footer_cta_label' ) ?: 'Reserve My Spot — £79';
    ?>
    <a href="<?php echo esc_url( $fcta_url ); ?>" class="btn">
      <?php echo esc_html( $fcta_label ); ?>
    </a>

  </div>
</section>

<?php endwhile; ?>


<!-- ═══════════════════════════════════════════════════════
     FOOTER
════════════════════════════════════════════════════════ -->
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


<!-- ═══════════════════════════════════════════════════════
     ACCORDION — vanilla JS, no jQuery
════════════════════════════════════════════════════════ -->
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

        /* Close siblings */
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
          }
        });

        /* Toggle this item */
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
