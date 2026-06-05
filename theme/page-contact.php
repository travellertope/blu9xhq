<?php
/**
 * Template Name: Contact Page
 *
 * @package bluu-interactive
 */

// ── ACF fields with defaults ──────────────────────────────────────────────────
$contact_email = ( function_exists( 'get_field' ) ? get_field( 'contact_email' ) : '' ) ?: 'hello@bluuhq.com';

get_header();
?>

<!-- ── Contact Hero ─────────────────────────────────────────────────────────── -->
<section class="contact-hero" aria-label="<?php esc_attr_e( 'Contact page introduction', 'bluu-interactive' ); ?>">
	<div class="container">
		<div class="contact-hero__inner animate-on-scroll">
			<div class="contact-hero__badge"><?php esc_html_e( '15 minutes. No pitch. No commitment.', 'bluu-interactive' ); ?></div>
			<h1 class="contact-hero__headline"><?php esc_html_e( "Let's talk about your content operation", 'bluu-interactive' ); ?></h1>
			<p class="contact-hero__body"><?php esc_html_e( 'Tell us where you are. We will tell you honestly whether Bluu is the right fit for what you are trying to build — and if it is not, we will tell you that too.', 'bluu-interactive' ); ?></p>
		</div>
	</div>
</section>

<!-- ── Contact Layout ──────────────────────────────────────────────────────── -->
<section class="contact-section" aria-label="<?php esc_attr_e( 'Contact information and form', 'bluu-interactive' ); ?>">
	<div class="container">
		<div class="contact-layout">

			<!-- ── Left: Context column ──────────────────────────────────── -->
			<aside class="contact-sidebar">

				<!-- Contact Information -->
				<div class="contact-info animate-on-scroll">
					<h2 class="contact-info__heading"><?php esc_html_e( 'Contact information', 'bluu-interactive' ); ?></h2>

					<ul class="contact-info__list">

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

<li class="contact-info__item">
							<span class="contact-info__icon" aria-hidden="true">
								<?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
								<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
							</span>
							<div>
								<p class="contact-info__label"><?php esc_html_e( 'Response time', 'bluu-interactive' ); ?></p>
								<p class="contact-info__value"><?php esc_html_e( 'We respond within 24 hours. A real person reads every message.', 'bluu-interactive' ); ?></p>
							</div>
						</li>

					</ul>
				</div><!-- /.contact-info -->

				<!-- Our Process -->
				<div class="contact-process animate-on-scroll">
					<h2 class="contact-process__heading"><?php esc_html_e( 'What happens when you reach out', 'bluu-interactive' ); ?></h2>

					<ol class="contact-process__steps" aria-label="<?php esc_attr_e( 'What to expect after you get in touch', 'bluu-interactive' ); ?>">

						<li class="contact-process__step">
							<div class="contact-process__step-num" aria-hidden="true">01</div>
							<div class="contact-process__step-content">
								<h3 class="contact-process__step-title"><?php esc_html_e( 'Discovery call', 'bluu-interactive' ); ?></h3>
								<p class="contact-process__step-body"><?php esc_html_e( 'A 15-minute conversation to understand your current content situation, what you are trying to achieve, and whether Bluu is the right fit. No pitch. No deck. Honest assessment only.', 'bluu-interactive' ); ?></p>
								<p class="contact-process__step-body"><?php esc_html_e( 'If it is a clear fit, we talk next steps. If it is not, we tell you that — and what we think you actually need.', 'bluu-interactive' ); ?></p>
							</div>
						</li>

						<li class="contact-process__step">
							<div class="contact-process__step-num" aria-hidden="true">02</div>
							<div class="contact-process__step-content">
								<h3 class="contact-process__step-title"><?php esc_html_e( 'Content audit', 'bluu-interactive' ); ?></h3>
								<p class="contact-process__step-body"><?php esc_html_e( 'Before we propose anything, we look at what you are currently publishing, where you are publishing it, what your competitors are doing, and what the gaps are. You receive a written summary of what we find regardless of whether we move forward.', 'bluu-interactive' ); ?></p>
								<p class="contact-process__step-body"><?php esc_html_e( 'This is not a formality. It is the intelligence that informs everything we produce.', 'bluu-interactive' ); ?></p>
							</div>
						</li>

						<li class="contact-process__step">
							<div class="contact-process__step-num" aria-hidden="true">03</div>
							<div class="contact-process__step-content">
								<h3 class="contact-process__step-title"><?php esc_html_e( 'Operation launch', 'bluu-interactive' ); ?></h3>
								<p class="contact-process__step-body"><?php esc_html_e( 'Onboarding begins within five business days of signing. Your content brief is built from the audit. The first month\'s intelligence is gathered. The operation starts running.', 'bluu-interactive' ); ?></p>
								<p class="contact-process__step-body"><?php esc_html_e( 'From week one, content is being produced from real research — not assumptions about what your audience wants.', 'bluu-interactive' ); ?></p>
							</div>
						</li>

					</ol>
				</div><!-- /.contact-process -->

				<!-- Who this call is for -->
				<div class="contact-fit animate-on-scroll">
					<h2 class="contact-fit__heading"><?php esc_html_e( 'Who this call is for', 'bluu-interactive' ); ?></h2>
					<p class="contact-fit__intro"><?php esc_html_e( 'Not everyone who lands on this page is a fit for Bluu — and that is fine. This conversation is most useful for:', 'bluu-interactive' ); ?></p>
					<ul class="contact-fit__list">
						<li><?php esc_html_e( 'Founders and growth teams who know content matters but do not have a consistent system behind it', 'bluu-interactive' ); ?></li>
						<li><?php esc_html_e( 'Agencies and consultants who produce excellent work for clients but have neglected their own brand', 'bluu-interactive' ); ?></li>
						<li><?php esc_html_e( 'Marketing leads who are producing content but cannot connect it to pipeline', 'bluu-interactive' ); ?></li>
						<li><?php esc_html_e( 'Teams entering a new market or category who need to build content authority from scratch', 'bluu-interactive' ); ?></li>
					</ul>
					<p class="contact-fit__footer">
						<?php esc_html_e( 'If none of those sound like you, the blog is a good place to start — it covers most of what we know and it is free.', 'bluu-interactive' ); ?>
						<a class="contact-fit__link" href="<?php echo esc_url( home_url( '/blog' ) ); ?>"><?php esc_html_e( 'Read the Bluu blog', 'bluu-interactive' ); ?> →</a>
					</p>
				</div><!-- /.contact-fit -->

			</aside><!-- /.contact-sidebar -->

			<!-- ── Right: Form column ────────────────────────────────────── -->
			<main class="contact-main">
				<div class="contact-form-card animate-on-scroll">

					<h2 class="contact-form-card__heading"><?php esc_html_e( 'Start the conversation', 'bluu-interactive' ); ?></h2>
					<p class="contact-form-card__subtitle"><?php esc_html_e( 'We read every response before the call. The more specific you are, the more useful the conversation will be.', 'bluu-interactive' ); ?></p>

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
						<input type="hidden" name="action" value="bluu_contact_form_full">
						<input type="hidden" name="recaptcha_token" id="recaptcha_token" value="">
						<!-- Honeypot -->
						<input type="text" name="website" id="contact_website" autocomplete="off" tabindex="-1" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;">

						<!-- Name -->
						<div class="contact-form__row">
							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_name">
									<?php esc_html_e( 'Your name', 'bluu-interactive' ); ?>
									<span class="contact-form__required" aria-hidden="true"> *</span>
								</label>
								<input
									class="contact-form__input"
									type="text"
									name="name"
									id="contact_name"
									required
									autocomplete="name"
									aria-required="true"
								>
							</div>
						</div>

						<!-- Email -->
						<div class="contact-form__row">
							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_email">
									<?php esc_html_e( 'Your email', 'bluu-interactive' ); ?>
									<span class="contact-form__required" aria-hidden="true"> *</span>
								</label>
								<input
									class="contact-form__input"
									type="email"
									name="email"
									id="contact_email"
									required
									autocomplete="email"
									aria-required="true"
								>
							</div>
						</div>

						<!-- Company or website -->
						<div class="contact-form__row">
							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_company">
									<?php esc_html_e( 'Company or website', 'bluu-interactive' ); ?>
									<span class="contact-form__required" aria-hidden="true"> *</span>
								</label>
								<input
									class="contact-form__input"
									type="text"
									name="company"
									id="contact_company"
									required
									autocomplete="organization"
									aria-required="true"
								>
							</div>
						</div>

						<!-- Situation dropdown -->
						<div class="contact-form__row">
							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_situation">
									<?php esc_html_e( 'What best describes your situation?', 'bluu-interactive' ); ?>
									<span class="contact-form__required" aria-hidden="true"> *</span>
								</label>
								<select
									class="contact-form__select"
									name="situation"
									id="contact_situation"
									required
									aria-required="true"
								>
									<option value="" disabled selected><?php esc_html_e( 'Select an option', 'bluu-interactive' ); ?></option>
									<option value="publish-inconsistently"><?php esc_html_e( 'We publish content but inconsistently — no real system behind it', 'bluu-interactive' ); ?></option>
									<option value="publish-no-traction"><?php esc_html_e( 'We publish regularly but it is not generating traction or pipeline', 'bluu-interactive' ); ?></option>
									<option value="starting-from-scratch"><?php esc_html_e( 'We are starting from scratch and need to build from the ground up', 'bluu-interactive' ); ?></option>
									<option value="scale-across-channels"><?php esc_html_e( 'We have content but want to scale it properly across more channels', 'bluu-interactive' ); ?></option>
									<option value="agency-overflow"><?php esc_html_e( 'We produce content for clients and need a reliable partner for overflow', 'bluu-interactive' ); ?></option>
								</select>
							</div>
						</div>

						<!-- Anything specific -->
						<div class="contact-form__row">
							<div class="contact-form__field">
								<label class="contact-form__label" for="contact_message">
									<?php esc_html_e( 'Anything specific you want to cover on the call?', 'bluu-interactive' ); ?>
								</label>
								<textarea
									class="contact-form__textarea"
									name="message"
									id="contact_message"
									rows="4"
									placeholder="<?php esc_attr_e( 'Optional — leave blank if not sure yet', 'bluu-interactive' ); ?>"
								></textarea>
							</div>
						</div>

						<!-- Submit -->
						<button
							id="contact-submit"
							type="submit"
							class="contact-form__submit btn-primary btn-primary--large"
						>
							<span class="contact-form__submit-text"><?php esc_html_e( 'Send message', 'bluu-interactive' ); ?></span>
							<span class="contact-form__submit-loading" hidden><?php esc_html_e( "Sending\xe2\x80\xa6", 'bluu-interactive' ); ?></span>
						</button>

						<!-- Trust signals -->
						<ul class="contact-form__trust">
							<li><?php esc_html_e( 'We respond within 24 hours', 'bluu-interactive' ); ?></li>
							<li><?php esc_html_e( '15 minutes — no commitment required', 'bluu-interactive' ); ?></li>
							<li><?php esc_html_e( 'Limited monthly capacity — we only take on clients we can serve properly', 'bluu-interactive' ); ?></li>
							<li><?php esc_html_e( 'Every retainer starts with a no-lock-in period', 'bluu-interactive' ); ?></li>
						</ul>

					</form>

				</div><!-- /.contact-form-card -->
			</main><!-- /.contact-main -->

		</div><!-- /.contact-layout -->
	</div><!-- /.container -->
</section>

<?php get_footer(); ?>
