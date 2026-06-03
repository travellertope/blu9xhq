<?php
/**
 * Template Name: AI Landing Page
 * Template Post Type: page
 *
 * AI Productivity Accelerator — standalone sales page template.
 * Loaded by the AI Productivity Accelerator Landing Page plugin.
 * Do NOT move or rename this file — the plugin references it by path.
 *
 * Stylesheet and Google Fonts are enqueued by the plugin main file.
 * This template only handles HTML structure.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * SETUP AFTER PLUGIN ACTIVATION
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Install & activate this plugin (Plugins → Add New → Upload Plugin)
 * 2. Create a new Page (Pages → Add New)
 * 3. Page Attributes panel → Template → select "AI Landing Page"
 * 4. Publish the page
 * 5. Build your sections in the Gutenberg block editor (see guide below)
 *
 * ─────────────────────────────────────────────────────────────────────────
 * GUTENBERG BLOCK STRUCTURE
 * Build page content using Group blocks (Cover block for the hero).
 * Assign CSS classes via Block → Advanced → Additional CSS Class(es).
 * ─────────────────────────────────────────────────────────────────────────
 *
 * [Cover Block]           → class: section-hero
 *   Set the hero image directly in the Cover block settings (no coding).
 *   Inside:
 *     [Heading H1]        "Stop Drowning in Tasks. Let AI Handle It."
 *     [Paragraph]         Subheadline — date, format, platform
 *     [Buttons]           "Reserve My Spot — £79"  href="#booking"
 *
 * [Group Block]           → class: section-problem
 *   [Paragraph]           class: section-eyebrow  → "Sound familiar?"
 *   [Heading H2]          "You're working harder. Not smarter."
 *   [Paragraph]           class: section-intro → brief intro sentence
 *   [Columns — 3 cols]    each column: Custom HTML pain-point card (pattern below)
 *
 * [Group Block]           → class: section-modules
 *   [Paragraph]           class: section-eyebrow → "The Curriculum"
 *   [Heading H2]          "What You'll Learn"
 *   [Paragraph]           class: section-intro → brief intro
 *   [Columns — 3 cols]    each column: class: module-card (pattern below)
 *
 * [Group Block]           → class: section-for-you
 *   [Heading H2]          "This Class Is For You If…"
 *   [Paragraph]           class: section-intro → optional intro
 *   [List]                6–8 bullet items describing the target student
 *
 * [Group Block]           → class: section-break
 *   [Quote Block]         A punchy one-liner about working smarter
 *
 * [Group Block]           → class: section-instructor
 *   [Columns — 2 cols]
 *     Col 1: [Image Block]  headshot — set to tall aspect ratio (~420×500)
 *     Col 2:
 *       [Paragraph]  class: section-eyebrow → "Your Instructor"
 *       [Heading H2] Your Name
 *       [Paragraph]  Bio paragraph(s)
 *       [Buttons]    optional LinkedIn / website link (outline style)
 *
 * [Group Block]           → class: section-included
 *   [Paragraph]           class: section-eyebrow → "Everything You Get"
 *   [Heading H2]          "What's Included"
 *   [Paragraph]           class: section-intro → brief supporting line
 *   [List]                5 items — each becomes an icon card via CSS
 *
 * [Group Block]           → class: section-pricing
 *   [Heading H2]          "One Class. Transformative Results."
 *   [Custom HTML]         <p class="price-display"><sup>£</sup>79</p>
 *   [Custom HTML]         <p class="urgency">Limited to 20 seats</p>
 *   [Paragraph]           Short supporting copy
 *   [Buttons]             "Reserve My Spot — £79"  href="#booking"
 *
 * [Group Block]           → class: section-faq
 *   [Paragraph]           class: section-eyebrow → "FAQs"
 *   [Heading H2]          "Common Questions"
 *   [Paragraph]           class: section-intro → optional intro
 *   [Custom HTML × 5]     faq-item pattern — see below
 *
 * [Group Block]           → class: section-footer-cta
 *   [Heading H2]          Final headline
 *   [Paragraph]           Short urgency line
 *   [Buttons]             "Reserve My Spot — £79"  href="#booking"
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HTML PATTERNS FOR CUSTOM HTML BLOCKS
 * ─────────────────────────────────────────────────────────────────────────
 *
 * PAIN POINT CARD — paste into a Custom HTML block inside each column:
 * ────────────────────────────────────────────────────────────────────────
 * <div class="pain-point">
 *   <svg class="pain-point__icon" xmlns="http://www.w3.org/2000/svg"
 *        viewBox="0 0 24 24" fill="none" stroke="currentColor"
 *        stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
 *     <circle cx="12" cy="12" r="10"/>
 *     <line x1="12" y1="8" x2="12" y2="12"/>
 *     <line x1="12" y1="16" x2="12.01" y2="16"/>
 *   </svg>
 *   <h3 class="pain-point__title">You spend hours on emails</h3>
 *   <p class="pain-point__text">Every client update, proposal, or newsletter
 *   eats time you don't have. And it still doesn't sound quite right.</p>
 * </div>
 * ────────────────────────────────────────────────────────────────────────
 *
 * FAQ ITEM — paste 5× as Custom HTML blocks inside .section-faq:
 * ────────────────────────────────────────────────────────────────────────
 * <div class="faq-item">
 *   <button class="faq-question" type="button">
 *     Do I need any technical experience?
 *   </button>
 *   <div class="faq-answer">
 *     <div class="faq-answer__inner">
 *       <p>Not at all. This class is built for business owners and
 *       professionals who want practical results, not those who want
 *       to become AI engineers. If you can write an email, you can
 *       do this.</p>
 *     </div>
 *   </div>
 * </div>
 * ────────────────────────────────────────────────────────────────────────
 *
 * MODULE CARD (column-level class) — set "module-card" as Additional CSS
 * Class on each Column block. Inside the column use:
 *   [Paragraph]  class: module-card__number → "Module 01"
 *   [Heading H3] Module title
 *   [Paragraph]  Short description
 *   [List]       3–5 bullet outcomes
 */

defined( 'ABSPATH' ) || exit;
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="profile" href="https://gmpg.org/xfn/11">
  <?php wp_head(); /* Outputs plugin-enqueued stylesheet, Google Fonts, preconnect hints */ ?>
</head>
<body <?php body_class( 'landing-page' ); ?>>
<?php wp_body_open(); ?>


<!-- ═══════════════════════════════════════════════════════
     SECTION: Minimal Navigation Header
     Logo → Appearance → Customize → Site Identity
     CTA link → change href="#booking" to your payment URL
════════════════════════════════════════════════════════ -->
<header class="landing-nav" role="banner">
  <div class="landing-nav__inner">

    <a href="<?php echo esc_url( home_url( '/' ) ); ?>"
       class="landing-nav__logo"
       aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?> — home">
      <?php if ( has_custom_logo() ) : ?>
        <?php the_custom_logo(); ?>
      <?php else : ?>
        <span class="landing-nav__wordmark"><?php bloginfo( 'name' ); ?></span>
      <?php endif; ?>
    </a>

    <a href="#booking" class="btn btn--accent btn--sm">
      Reserve My Spot — £79
    </a>

  </div>
</header><!-- /landing-nav -->


<!-- ═══════════════════════════════════════════════════════
     SECTION: Main Content (Gutenberg block editor)
     All page sections are built here. See the block structure
     guide in the PHP docblock above for the full layout.
════════════════════════════════════════════════════════ -->
<main id="main-content" class="landing-main" role="main">
  <?php
  while ( have_posts() ) :
    the_post();
    the_content();
  endwhile;
  ?>
</main><!-- /landing-main -->


<!-- ═══════════════════════════════════════════════════════
     SECTION: Minimal Footer
     Edit year, links, and contact address in the PHP below.
════════════════════════════════════════════════════════ -->
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
      <a href="mailto:<?php echo esc_attr( get_option( 'admin_email' ) ); ?>">Contact</a>
    </nav>
  </div>
</footer><!-- /landing-footer -->


<!-- ═══════════════════════════════════════════════════════
     ACCORDION: Vanilla JS — no jQuery dependency
     Targets .faq-item elements anywhere on the page.
     CSS grid-template-rows trick gives smooth height
     animation without hard-coding a max-height value.
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
      answer.setAttribute('hidden', '');

      trigger.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        /* Close all siblings */
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-answer').setAttribute('hidden', '');
          }
        });

        /* Toggle this item */
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
