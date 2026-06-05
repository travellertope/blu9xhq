<?php
/**
 * Template Name: Contact Page
 *
 * @package bluu-interactive
 */

get_header();
?>

<!-- ── Contact — full-bleed 2-column CTA ─────────────────────────────────── -->
<section class="contact-cta" aria-label="<?php esc_attr_e( 'Book a discovery call', 'bluu-interactive' ); ?>">
	<div class="contact-cta__inner">

		<!-- ── Left: dark column ─────────────────────────────────────────── -->
		<div class="contact-cta__left">
			<div class="contact-cta__left-content animate-on-scroll">

				<span class="contact-cta__badge"><?php esc_html_e( '15 minutes. No pitch. No commitment.', 'bluu-interactive' ); ?></span>

				<h1 class="contact-cta__headline"><?php esc_html_e( "Let's talk about your content operation", 'bluu-interactive' ); ?></h1>

				<p class="contact-cta__lead"><?php esc_html_e( 'Tell us where you are. We will tell you honestly whether Bluu is the right fit — and if it is not, we will tell you that too.', 'bluu-interactive' ); ?></p>

				<!-- Process steps -->
				<ol class="contact-cta__steps" aria-label="<?php esc_attr_e( 'What to expect', 'bluu-interactive' ); ?>">

					<li class="contact-cta__step">
						<span class="contact-cta__step-num" aria-hidden="true">01</span>
						<div class="contact-cta__step-body">
							<strong class="contact-cta__step-title"><?php esc_html_e( 'Discovery call', 'bluu-interactive' ); ?></strong>
							<p><?php esc_html_e( 'A 15-minute conversation. No deck. Honest assessment only. If it is not a fit, we say so.', 'bluu-interactive' ); ?></p>
						</div>
					</li>

					<li class="contact-cta__step">
						<span class="contact-cta__step-num" aria-hidden="true">02</span>
						<div class="contact-cta__step-body">
							<strong class="contact-cta__step-title"><?php esc_html_e( 'Content audit', 'bluu-interactive' ); ?></strong>
							<p><?php esc_html_e( 'We review what you publish, where, and against whom. You get a written summary — regardless of whether we move forward.', 'bluu-interactive' ); ?></p>
						</div>
					</li>

					<li class="contact-cta__step">
						<span class="contact-cta__step-num" aria-hidden="true">03</span>
						<div class="contact-cta__step-body">
							<strong class="contact-cta__step-title"><?php esc_html_e( 'Operation launch', 'bluu-interactive' ); ?></strong>
							<p><?php esc_html_e( 'Onboarding within five business days. Content produced from real research from week one.', 'bluu-interactive' ); ?></p>
						</div>
					</li>

				</ol>

				<!-- Who it is for -->
				<div class="contact-cta__fit">
					<p class="contact-cta__fit-label"><?php esc_html_e( 'Most useful for:', 'bluu-interactive' ); ?></p>
					<ul class="contact-cta__fit-list">
						<li><?php esc_html_e( 'Founders who know content matters but have no system behind it', 'bluu-interactive' ); ?></li>
						<li><?php esc_html_e( 'Marketing leads who publish but cannot connect it to pipeline', 'bluu-interactive' ); ?></li>
						<li><?php esc_html_e( 'Agencies who need a reliable content partner for overflow', 'bluu-interactive' ); ?></li>
						<li><?php esc_html_e( 'Teams building content authority in a new market', 'bluu-interactive' ); ?></li>
					</ul>
					<a class="contact-cta__blog-link" href="<?php echo esc_url( home_url( '/blog' ) ); ?>"><?php esc_html_e( 'Not sure yet? Read the Bluu blog →', 'bluu-interactive' ); ?></a>
				</div>

			</div>
		</div><!-- /.contact-cta__left -->

		<!-- ── Right: form column ────────────────────────────────────────── -->
		<div class="contact-cta__right">
			<div class="contact-cta__form-wrap animate-on-scroll">

				<h2 class="contact-cta__form-heading"><?php esc_html_e( 'Start the conversation', 'bluu-interactive' ); ?></h2>
				<p class="contact-cta__form-sub"><?php esc_html_e( 'We read every response before the call. The more specific you are, the more useful the conversation will be.', 'bluu-interactive' ); ?></p>

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
							<input class="contact-form__input" type="text" name="name" id="contact_name" required autocomplete="name" aria-required="true">
						</div>
					</div>

					<!-- Email -->
					<div class="contact-form__row">
						<div class="contact-form__field">
							<label class="contact-form__label" for="contact_email">
								<?php esc_html_e( 'Your email', 'bluu-interactive' ); ?>
								<span class="contact-form__required" aria-hidden="true"> *</span>
							</label>
							<input class="contact-form__input" type="email" name="email" id="contact_email" required autocomplete="email" aria-required="true">
						</div>
					</div>

					<!-- Company or website -->
					<div class="contact-form__row">
						<div class="contact-form__field">
							<label class="contact-form__label" for="contact_company">
								<?php esc_html_e( 'Company or website', 'bluu-interactive' ); ?>
								<span class="contact-form__required" aria-hidden="true"> *</span>
							</label>
							<input class="contact-form__input" type="text" name="company" id="contact_company" required autocomplete="organization" aria-required="true">
						</div>
					</div>

					<!-- Situation dropdown -->
					<div class="contact-form__row">
						<div class="contact-form__field">
							<label class="contact-form__label" for="contact_situation">
								<?php esc_html_e( 'What best describes your situation?', 'bluu-interactive' ); ?>
								<span class="contact-form__required" aria-hidden="true"> *</span>
							</label>
							<select class="contact-form__select" name="situation" id="contact_situation" required aria-required="true">
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
					<button id="contact-submit" type="submit" class="contact-form__submit btn-primary btn-primary--large">
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

			</div>
		</div><!-- /.contact-cta__right -->

	</div><!-- /.contact-cta__inner -->
</section>

<?php get_footer(); ?>
