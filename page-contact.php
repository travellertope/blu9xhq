<?php
/**
 * Template Name: Contact Page
 *
 * @package bluu-interactive
 */

// ── ACF fields with defaults ──────────────────────────────────────────────────
$hero_badge       = 'Get In Touch';
$hero_headline    = "Let's Build Your Unified Growth Engine";
$hero_body        = "No pitch decks. No canned proposals. Tell us about your situation and we'll have an honest conversation about what growth actually looks like for you.";
$contact_email    = ( function_exists( 'get_field' ) ? get_field( 'contact_email' )    : '' ) ?: 'hello@bluuhq.com';
$contact_location = ( function_exists( 'get_field' ) ? get_field( 'contact_location' ) : '' ) ?: 'Remote-first, serving North America';

get_header();
?>

<!-- ── Contact Hero ─────────────────────────────────────────────────────────── -->
<section class="contact-hero" aria-label="<?php esc_attr_e( 'Contact page introduction', 'bluu-interactive' ); ?>">
	<div class="container">
		<div class="contact-hero__inner animate-on-scroll">
			<div class="contact-hero__badge"><?php echo esc_html( $hero_badge ); ?></div>
			<h1 class="contact-hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>
			<p class="contact-hero__body"><?php echo esc_html( $hero_body ); ?></p>
		</div>
	</div>
</section>

<!-- ── Contact Layout ──────────────────────────────────────────────────────── -->
<section class="contact-section" aria-label="<?php esc_attr_e( 'Contact information and form', 'bluu-interactive' ); ?>">
	<div class="container">
		<div class="contact-layout">

			<!-- ── Left: Sidebar ─────────────────────────────────────────── -->
			<aside class="contact-sidebar">

				<!-- Contact Information -->
				<div class="contact-info animate-on-scroll">
					<h2 class="contact-info__heading"><?php esc_html_e( 'Contact Information', 'bluu-interactive' ); ?></h2>

					<ul class="contact-info__list">

						<!-- Email -->
						<li class="contact-info__item">
							<span class="contact-info__icon" aria-hidden="true">
								<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
							</span>
							<div>
								<p class="contact-info__label"><?php esc_html_e( 'Email', 'bluu-interactive' ); ?></p>
								<a class="contact-info__value" href="mailto:<?php echo esc_attr( $contact_email ); ?>">
									<?php echo esc_html( $contact_email ); ?>
								</a>
							</div>
						</li>

						<!-- Location -->
						<li class="contact-info__item">
							<span class="contact-info__icon" aria-hidden="true">
								<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
							</span>
							<div>
								<p class="contact-info__label"><?php esc_html_e( 'Location', 'bluu-interactive' ); ?></p>
								<p class="contact-info__value"><?php echo esc_html( $contact_location ); ?></p>
							</div>
						</li>

					</ul>
				</div><!-- /.contact-info -->

				<!-- Our Process -->
				<div class="contact-process animate-on-scroll">
					<h2 class="contact-process__heading"><?php esc_html_e( 'Our Process', 'bluu-interactive' ); ?></h2>

					<ol class="contact-process__steps" aria-label="<?php esc_attr_e( 'Our 3-step engagement process', 'bluu-interactive' ); ?>">

						<li class="contact-process__step">
							<div class="contact-process__step-num" aria-hidden="true">01</div>
							<div class="contact-process__step-content">
								<h3 class="contact-process__step-title"><?php esc_html_e( 'Discovery Call', 'bluu-interactive' ); ?></h3>
								<p class="contact-process__step-body"><?php esc_html_e( 'A 30-minute conversation to understand your current stack, your revenue goals, and whether our model is the right fit. No pitch. Honest assessment only.', 'bluu-interactive' ); ?></p>
							</div>
						</li>

						<li class="contact-process__step">
							<div class="contact-process__step-num" aria-hidden="true">02</div>
							<div class="contact-process__step-content">
								<h3 class="contact-process__step-title"><?php esc_html_e( 'Strategy Audit', 'bluu-interactive' ); ?></h3>
								<p class="contact-process__step-body"><?php esc_html_e( "We conduct a technical, content, and sales-enablement audit of your current digital presence. You'll receive a Gap Analysis document regardless of whether we move forward.", 'bluu-interactive' ); ?></p>
							</div>
						</li>

						<li class="contact-process__step">
							<div class="contact-process__step-num" aria-hidden="true">03</div>
							<div class="contact-process__step-content">
								<h3 class="contact-process__step-title"><?php esc_html_e( 'Engine Launch', 'bluu-interactive' ); ?></h3>
								<p class="contact-process__step-body"><?php esc_html_e( 'Onboarding begins within 5 business days of signing. Your dedicated team is briefed, your strategy is locked, and your growth engine is activated.', 'bluu-interactive' ); ?></p>
							</div>
						</li>

					</ol>
				</div><!-- /.contact-process -->

			</aside><!-- /.contact-sidebar -->

			<!-- ── Right: Form card ──────────────────────────────────────── -->
			<main class="contact-main">
				<div class="contact-form-card animate-on-scroll">

					<h2 class="contact-form-card__heading"><?php esc_html_e( 'Start the Conversation', 'bluu-interactive' ); ?></h2>
					<p class="contact-form-card__subtitle"><?php esc_html_e( 'We respond within 1 business day.', 'bluu-interactive' ); ?></p>

					<!-- Feedback -->
					<div
						id="contact-form-feedback"
						class="contact-form__feedback"
						role="alert"
						aria-live="polite"
						hidden
					></div>

					<form id="contact-form" action="" method="post" novalidate>

						<?php wp_nonce_field( 'bluu_contact_nonce', 'bluu_nonce' ); ?>

						<!-- AJAX action -->
						<input type="hidden" name="action" value="bluu_contact_form_full">

						<!-- reCAPTCHA token -->
						<input type="hidden" name="recaptcha_token" id="recaptcha_token" value="">

						<!-- Honeypot -->
						<input type="text" name="website" id="contact_website" autocomplete="off" tabindex="-1" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;">

						<!-- Row 1: Name + Company -->
						<div class="contact-form__row contact-form__row--half">

							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_name">
									<?php esc_html_e( 'Name', 'bluu-interactive' ); ?>
									<span class="contact-form__required" aria-hidden="true"> *</span>
								</label>
								<input
									class="contact-form__input"
									type="text"
									name="name"
									id="contact_name"
									placeholder="<?php esc_attr_e( 'Jane Smith', 'bluu-interactive' ); ?>"
									required
									autocomplete="name"
									aria-required="true"
								>
							</div>

							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_company">
									<?php esc_html_e( 'Company', 'bluu-interactive' ); ?>
								</label>
								<input
									class="contact-form__input"
									type="text"
									name="company"
									id="contact_company"
									placeholder="<?php esc_attr_e( 'Acme Corp', 'bluu-interactive' ); ?>"
									autocomplete="organization"
								>
							</div>

						</div><!-- /.contact-form__row -->

						<!-- Row 2: Email + Phone -->
						<div class="contact-form__row contact-form__row--half">

							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_email">
									<?php esc_html_e( 'Email', 'bluu-interactive' ); ?>
									<span class="contact-form__required" aria-hidden="true"> *</span>
								</label>
								<input
									class="contact-form__input"
									type="email"
									name="email"
									id="contact_email"
									placeholder="<?php esc_attr_e( 'jane@acme.com', 'bluu-interactive' ); ?>"
									required
									autocomplete="email"
									aria-required="true"
								>
							</div>

							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_phone">
									<?php esc_html_e( 'Phone', 'bluu-interactive' ); ?>
								</label>
								<input
									class="contact-form__input"
									type="tel"
									name="phone"
									id="contact_phone"
									placeholder="<?php esc_attr_e( '+1 (555) 000-0000', 'bluu-interactive' ); ?>"
									autocomplete="tel"
								>
							</div>

						</div><!-- /.contact-form__row -->

						<!-- Row 3: Message -->
						<div class="contact-form__row">
							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_message">
									<?php esc_html_e( 'Tell us about your situation', 'bluu-interactive' ); ?>
									<span class="contact-form__required" aria-hidden="true"> *</span>
								</label>
								<textarea
									class="contact-form__textarea"
									name="message"
									id="contact_message"
									rows="6"
									placeholder="<?php esc_attr_e( "Share what you're working on, where you're stuck, or what growth looks like for you right now\xe2\x80\xa6", 'bluu-interactive' ); ?>"
									required
									aria-required="true"
								></textarea>
							</div>
						</div><!-- /.contact-form__row -->

						<!-- Submit -->
						<button
							id="contact-submit"
							type="submit"
							class="contact-form__submit btn-primary btn-primary--large"
						>
							<span class="contact-form__submit-text"><?php esc_html_e( 'Send Message', 'bluu-interactive' ); ?></span>
							<span class="contact-form__submit-loading" hidden><?php esc_html_e( "Sending\xe2\x80\xa6", 'bluu-interactive' ); ?></span>
						</button>

						<p class="contact-form__disclaimer">
							<?php esc_html_e( 'No pitch decks. No sales pressure. Just an honest conversation.', 'bluu-interactive' ); ?>
						</p>

					</form>

				</div><!-- /.contact-form-card -->
			</main><!-- /.contact-main -->

		</div><!-- /.contact-layout -->
	</div><!-- /.container -->
</section>

<?php get_footer(); ?>
