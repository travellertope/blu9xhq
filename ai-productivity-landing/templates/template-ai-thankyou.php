<?php
/**
 * Template Name: AI Thank You Page
 * Template Post Type: page
 *
 * Post-purchase confirmation page for the AI Productivity Accelerator.
 * Assign this template to the page you set as your Stripe success_url.
 */

defined( 'ABSPATH' ) || exit;

// ── Google Meet link — paste it here once confirmed ────────────────────────
define( 'AILP_MEET_LINK', 'https://meet.google.com/fft-xxsf-csq' );

$meet_link = AILP_MEET_LINK;

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <?php wp_head(); ?>
  <script src="https://cdn.jsdelivr.net/npm/add-to-calendar-button@2" defer></script>
</head>
<body <?php body_class( 'ailp-page' ); ?>>
<?php wp_body_open(); ?>


<!-- ═══════════════════════════════ NAV ════════════════════════════════════ -->
<header class="ailp-nav" role="banner">
  <div class="ailp-nav__inner">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>"
       class="ailp-nav__logo"
       aria-label="<?php bloginfo( 'name' ); ?> — home">
      <?php
      $ailp_logo_id  = get_theme_mod( 'custom_logo' );
      $ailp_logo_url = $ailp_logo_id ? wp_get_attachment_image_url( $ailp_logo_id, 'full' ) : '';
      if ( $ailp_logo_url ) : ?>
        <img src="<?php echo esc_url( $ailp_logo_url ); ?>"
             alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"
             class="ailp-logo-img"
             loading="eager">
      <?php else : ?>
        <span class="ailp-nav__wordmark"><?php bloginfo( 'name' ); ?></span>
      <?php endif; ?>
    </a>
  </div>
</header>


<!-- ══════════════════════════ CONFIRMATION HERO ═══════════════════════════ -->
<section class="ailp-section ailp-section--dark ailp-ty-hero">
  <div class="ailp-container ailp-container--narrow ailp-ty-hero__inner">

    <div class="ailp-ty-check" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
    </div>

    <p class="ailp-eyebrow ailp-eyebrow--center ailp-eyebrow--on-dark">Booking Confirmed</p>
    <h1 class="ailp-ty-hero__heading">You&rsquo;re in. See you on the 14th.</h1>
    <p class="ailp-ty-hero__sub">
      A confirmation email is on its way to your inbox now.
      If you don&rsquo;t see it within 5 minutes, check your spam folder.
    </p>

  </div>
</section><!-- /ailp-ty-hero -->


<!-- ════════════════════════════ EVENT DETAILS ════════════════════════════ -->
<section class="ailp-section ailp-ty-details-section">
  <div class="ailp-container ailp-container--narrow">

    <div class="ailp-ty-details-card">
      <p class="ailp-ty-details-card__heading">Your class details</p>
      <ul class="ailp-ty-details-list">

        <li class="ailp-ty-details-item">
          <span class="ailp-ty-details-item__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.89 3 3 3.9 3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
          </span>
          <div>
            <span class="ailp-ty-details-item__label">Date</span>
            <span class="ailp-ty-details-item__value">Tuesday 14 July 2026</span>
          </div>
        </li>

        <li class="ailp-ty-details-item">
          <span class="ailp-ty-details-item__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
          </span>
          <div>
            <span class="ailp-ty-details-item__label">Time</span>
            <span class="ailp-ty-details-item__value">7:00pm &ndash; 9:30pm BST</span>
          </div>
        </li>

        <li class="ailp-ty-details-item">
          <span class="ailp-ty-details-item__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
          </span>
          <div>
            <span class="ailp-ty-details-item__label">Platform</span>
            <?php if ( $meet_link ) : ?>
              <a href="<?php echo esc_url( $meet_link ); ?>"
                 class="ailp-ty-details-item__value ailp-ty-details-item__value--link"
                 target="_blank" rel="noopener">
                Google Meet &mdash; Join here &rarr;
              </a>
            <?php else : ?>
              <span class="ailp-ty-details-item__value">Google Meet &mdash; link in your confirmation email</span>
            <?php endif; ?>
          </div>
        </li>

        <li class="ailp-ty-details-item">
          <span class="ailp-ty-details-item__icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
          </span>
          <div>
            <span class="ailp-ty-details-item__label">Duration</span>
            <span class="ailp-ty-details-item__value">2.5 hours including live Q&amp;A</span>
          </div>
        </li>

      </ul>
    </div><!-- /.ailp-ty-details-card -->


    <!-- ADD TO CALENDAR -->
    <div class="ailp-ty-cal-wrap">
      <p class="ailp-ty-cal-label">Add to your calendar so you don&rsquo;t miss it</p>

      <add-to-calendar-button
        name="AI Productivity Accelerator — Live Class"
        description="2.5-hour live virtual class with Tope Akintayo.[br][br]What you'll cover:[br]· Module 1: Content Engine — a month of content in one session[br]· Module 2: Business Brain — proposals &amp; emails in minutes[br]· Module 3: Ops Autopilot — eliminate repetitive admin[br][br]<?php echo $meet_link ? 'Google Meet link: ' . esc_js( $meet_link ) : 'Your Google Meet link will be in your confirmation email.'; ?>[br][br]Questions? Email hello@bluuhq.com"
        startDate="2026-07-14"
        startTime="19:00"
        endTime="21:30"
        timeZone="Europe/London"
        location="Google Meet<?php echo $meet_link ? ' — ' . esc_attr( $meet_link ) : ''; ?>"
        options="'Google','Apple','iCal','Outlook.com','Microsoft365'"
        trigger="click"
        listStyle="modal"
        buttonStyle="flat"
        size="5"
      ></add-to-calendar-button>
    </div>

  </div>
</section><!-- /ailp-ty-details-section -->


<!-- ═══════════════════════════ BEFORE CLASS ══════════════════════════════ -->
<section class="ailp-section ailp-section--alt ailp-ty-prep">
  <div class="ailp-container ailp-container--narrow">

    <p class="ailp-eyebrow">Before the class</p>
    <h2 class="ailp-section__heading">One thing to do before Tuesday.</h2>

    <div class="ailp-ty-action-box">
      <div class="ailp-ty-action-box__num" aria-hidden="true">1</div>
      <div class="ailp-ty-action-box__content">
        <h3 class="ailp-ty-action-box__title">Create your free Claude account</h3>
        <p class="ailp-ty-action-box__text">
          The class is built around Claude by Anthropic &mdash; it&rsquo;s free to use and takes under 2 minutes to sign up.
          Having an account ready means you can follow along in real time rather than playing catch-up on the night.
        </p>
        <a href="https://claude.ai" class="ailp-btn ailp-btn--accent ailp-btn--lg" target="_blank" rel="noopener">
          Create free account at claude.ai
        </a>
      </div>
    </div>

  </div>
</section><!-- /ailp-ty-prep -->


<!-- ══════════════════════════ WHAT HAPPENS NEXT ══════════════════════════ -->
<section class="ailp-section ailp-ty-timeline">
  <div class="ailp-container ailp-container--narrow">

    <p class="ailp-eyebrow">What happens next</p>
    <h2 class="ailp-section__heading">Here&rsquo;s what to expect.</h2>

    <ol class="ailp-ty-steps">

      <li class="ailp-ty-step">
        <div class="ailp-ty-step__marker">Now</div>
        <div class="ailp-ty-step__body">
          <h3 class="ailp-ty-step__title">Confirmation email</h3>
          <p class="ailp-ty-step__text">Check your inbox. It has your booking reference and everything you need to know. Check spam if it&rsquo;s not there within a few minutes.</p>
        </div>
      </li>

      <li class="ailp-ty-step">
        <div class="ailp-ty-step__marker">Before<br>14 July</div>
        <div class="ailp-ty-step__body">
          <h3 class="ailp-ty-step__title">Google Meet link</h3>
          <p class="ailp-ty-step__text">You&rsquo;ll receive your class link by email ahead of the session. Save the date in your calendar using the button above so you&rsquo;ve got a reminder locked in.</p>
        </div>
      </li>

      <li class="ailp-ty-step">
        <div class="ailp-ty-step__marker">14 July<br>7:00pm</div>
        <div class="ailp-ty-step__body">
          <h3 class="ailp-ty-step__title">The live class</h3>
          <p class="ailp-ty-step__text">Join on Google Meet. 2.5 hours of hands-on training across three practical modules, with a short break and 20 minutes of live Q&amp;A at the end.</p>
        </div>
      </li>

      <li class="ailp-ty-step">
        <div class="ailp-ty-step__marker">Within<br>24 hrs</div>
        <div class="ailp-ty-step__body">
          <h3 class="ailp-ty-step__title">Your full resource pack</h3>
          <p class="ailp-ty-step__text">Full class recording, Prompt Library, and Templates Pack sent to your email within 24 hours of the session ending. Yours to keep and use forever.</p>
        </div>
      </li>

    </ol>

  </div>
</section><!-- /ailp-ty-timeline -->


<!-- ═══════════════════════════ QUESTIONS ═════════════════════════════════ -->
<section class="ailp-section ailp-section--dark ailp-ty-contact">
  <div class="ailp-container ailp-container--narrow ailp-ty-contact__inner">
    <h2 class="ailp-ty-contact__heading">Have a question?</h2>
    <p class="ailp-ty-contact__text">Drop Tope an email and we&rsquo;ll get back to you quickly.</p>
    <a href="mailto:hello@bluuhq.com" class="ailp-btn ailp-btn--accent ailp-btn--lg">
      hello@bluuhq.com
    </a>
  </div>
</section><!-- /ailp-ty-contact -->


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
      <a href="mailto:hello@bluuhq.com">Contact</a>
    </nav>
  </div>
</footer><!-- /ailp-footer -->


<?php wp_footer(); ?>
</body>
</html>
