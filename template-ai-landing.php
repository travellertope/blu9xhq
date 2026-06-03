<?php
/**
 * Template Name: AI Landing Page
 * Template Post Type: page
 *
 * AI Productivity Accelerator — standalone sales page template.
 * Bypasses the default WordPress header/sidebar/footer entirely.
 * All page content is built in the Gutenberg block editor via the_content().
 *
 * ─────────────────────────────────────────────────────────────────────────
 * INSTALLATION
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Copy template-ai-landing.php  → your child theme root
 * 2. Copy landing-page.css         → your child theme root
 * 3. Add functions-snippet.php     → paste into your child theme functions.php
 * 4. In the WordPress editor, open your page → Page Attributes → Template
 *    → select "AI Landing Page"
 * 5. Publish and build the block structure below in the editor.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * GUTENBERG BLOCK STRUCTURE
 * Build your page content using Group blocks (or Cover for the hero).
 * Set custom CSS classes in Block → Advanced → Additional CSS Class(es).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * [Cover Block]           → class: section-hero
 *   Set your hero image directly in the Cover block settings.
 *   Inside:
 *     [Heading H1]        "Stop Drowning in Tasks. Let AI Handle It."
 *     [Paragraph]         Subheadline text
 *     [Buttons]           "Reserve My Spot — £79"  href="#booking"
 *
 * [Group Block]           → class: section-problem
 *   [Paragraph]           class: section-eyebrow  → "Sound familiar?"
 *   [Heading H2]          "You're working harder. Not smarter."
 *   [Paragraph]           class: section-intro → intro line
 *   [Columns — 3 cols]    (each column contains a Custom HTML pain-point card)
 *     See pain-point HTML pattern in the PHP comments below.
 *
 * [Group Block]           → class: section-modules
 *   [Paragraph]           class: section-eyebrow → "The Curriculum"
 *   [Heading H2]          "What You'll Learn"
 *   [Paragraph]           class: section-intro → intro line
 *   [Columns — 3 cols]    (each column is a module card — see pattern below)
 *
 * [Group Block]           → class: section-for-you
 *   [Heading H2]          "This Class Is For You If…"
 *   [List]                6–8 bullet items
 *
 * [Group Block]           → class: section-break
 *   [Quote Block]         A punchy one-liner about AI productivity
 *
 * [Group Block]           → class: section-instructor
 *   [Columns — 2 cols]
 *     Col 1: [Image Block]  your headshot (set aspect ratio tall, ~420×480)
 *     Col 2:
 *       [Paragraph]  class: section-eyebrow → "Your Instructor"
 *       [Heading H2] Your Name
 *       [Paragraph]  Bio paragraph(s)
 *       [Buttons]    optional social/contact link
 *
 * [Group Block]           → class: section-included
 *   [Paragraph]           class: section-eyebrow → "Everything You Get"
 *   [Heading H2]          "What's Included"
 *   [Paragraph]           class: section-intro → short line
 *   [List]                5 deliverables (styled as icon-cards via CSS)
 *
 * [Group Block]           → class: section-pricing
 *   [Heading H2]          "One Class. Transformative Results."
 *   [Custom HTML]         <p class="price-display"><sup>£</sup>79</p>
 *   [Custom HTML]         <p class="urgency">Limited to 20 seats</p>
 *   [Paragraph]           Supporting copy line
 *   [Buttons]             "Reserve My Spot — £79"  href="#booking"
 *
 * [Group Block]           → class: section-faq
 *   [Paragraph]           class: section-eyebrow → "FAQs"
 *   [Heading H2]          "Common Questions"
 *   [Paragraph]           class: section-intro section-faq-list
 *   [Custom HTML × 5]     Use the faq-item pattern (see below)
 *
 * [Group Block]           → class: section-footer-cta
 *   [Heading H2]          "Your Last Chance to Grab a Seat"
 *   [Paragraph]           Short urgency line
 *   [Buttons]             "Reserve My Spot — £79"  href="#booking"
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HTML PATTERNS FOR CUSTOM HTML BLOCKS
 * ─────────────────────────────────────────────────────────────────────────
 *
 * PAIN POINT CARD (paste into a Custom HTML block inside each column):
 * ─────────────────────────────────────────────
 * <div class="pain-point">
 *   <svg class="pain-point__icon" xmlns="http://www.w3.org/2000/svg"
 *        viewBox="0 0 24 24" fill="none" stroke="currentColor"
 *        stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
 *     <!-- swap any Lucide icon path here -->
 *     <circle cx="12" cy="12" r="10"/>
 *     <line x1="12" y1="8" x2="12" y2="12"/>
 *     <line x1="12" y1="16" x2="12.01" y2="16"/>
 *   </svg>
 *   <h3 class="pain-point__title">You spend hours on emails</h3>
 *   <p class="pain-point__text">Every client update, proposal, or newsletter
 *   eats time you don't have. And it still doesn't sound quite right.</p>
 * </div>
 *
 * FAQ ITEM (paste 5× into Custom HTML blocks inside .section-faq):
 * ─────────────────────────────────────────────
 * <div class="faq-item">
 *   <button class="faq-question" type="button">
 *     Do I need any technical experience?
 *   </button>
 *   <div class="faq-answer">
 *     <div class="faq-answer__inner">
 *       <p>Not at all. This class is built for business owners and
 *       professionals who want practical results, not those who want to
 *       become AI engineers. If you can write an email, you can do this.</p>
 *     </div>
 *   </div>
 * </div>
 */

defined( 'ABSPATH' ) || exit;
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="profile" href="https://gmpg.org/xfn/11">
  <?php wp_head(); ?>
</head>
<body <?php body_class( 'landing-page' ); ?>>
<?php wp_body_open(); ?>

<!-- ═══════════════════════════════════════════════
     SECTION: Minimal Navigation Header
     To change the CTA text/link, edit this PHP directly.
     The logo is pulled from Appearance → Customize → Site Identity.
═══════════════════════════════════════════════ -->
<header class="landing-nav" role="banner">
  <div class="landing-nav__inner">

    <!-- Logo: set in Appearance → Customize → Site Identity -->
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>"
       class="landing-nav__logo"
       aria-label="<?php bloginfo( 'name' ); ?> — home">
      <?php if ( has_custom_logo() ) : ?>
        <?php the_custom_logo(); ?>
      <?php else : ?>
        <span class="landing-nav__wordmark"><?php bloginfo( 'name' ); ?></span>
      <?php endif; ?>
    </a>

    <!-- Nav CTA — edit href once your booking URL is ready -->
    <a href="#booking" class="btn btn--accent btn--sm">
      Reserve My Spot — £79
    </a>

  </div>
</header><!-- /landing-nav -->


<!-- ═══════════════════════════════════════════════
     SECTION: Main Content (Gutenberg)
     Everything below is driven by the block editor.
     See the block structure guide at the top of this file.
═══════════════════════════════════════════════ -->
<main id="main-content" class="landing-main" role="main">
  <?php
  /* Standard WordPress loop — the_content() outputs all Gutenberg blocks */
  while ( have_posts() ) :
    the_post();
    the_content();
  endwhile;
  ?>
</main><!-- /landing-main -->


<!-- ═══════════════════════════════════════════════
     SECTION: Minimal Footer
     Edit copyright, links, and email directly in PHP.
═══════════════════════════════════════════════ -->
<footer class="landing-footer" role="contentinfo">
  <div class="landing-footer__inner">
    <p class="landing-footer__copy">
      &copy; <?php echo esc_html( gmdate( 'Y' ) ); ?>
      <?php bloginfo( 'name' ); ?>.
      All rights reserved.
    </p>
    <nav class="landing-footer__links" aria-label="Footer navigation">
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/terms">Terms &amp; Conditions</a>
      <a href="mailto:<?php echo esc_attr( get_option( 'admin_email' ) ); ?>">
        Contact
      </a>
    </nav>
  </div>
</footer><!-- /landing-footer -->


<!-- ═══════════════════════════════════════════════
     ACCORDION: Vanilla JS (no jQuery)
     Targets .faq-item elements inside .section-faq.
     Uses CSS grid-template-rows transition for smooth
     height animation without knowing content height.
═══════════════════════════════════════════════ -->
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

      /* Initial ARIA state */
      trigger.setAttribute('aria-expanded', 'false');
      answer.setAttribute('hidden', '');

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        /* Close every item first */
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-answer').setAttribute('hidden', '');
          }
        });

        /* Toggle the clicked item */
        item.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));

        if (isOpen) {
          answer.setAttribute('hidden', '');
        } else {
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
