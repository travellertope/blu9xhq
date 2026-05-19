<?php
/**
 * Template Name: Contact Page
 *
 * @package bluu-interactive
 */

$contact_hero_headline    = function_exists( 'get_field' ) ? get_field( 'contact_hero_headline' )    : '';
$contact_hero_subheadline = function_exists( 'get_field' ) ? get_field( 'contact_hero_subheadline' ) : '';
$contact_email            = function_exists( 'get_field' ) ? get_field( 'contact_email' )            : '';
$contact_phone            = function_exists( 'get_field' ) ? get_field( 'contact_phone' )            : '';
$contact_location         = function_exists( 'get_field' ) ? get_field( 'contact_location' )         : '';
$contact_form_headline    = function_exists( 'get_field' ) ? get_field( 'contact_form_headline' )    : '';
$contact_process          = function_exists( 'get_field' ) ? get_field( 'contact_process' )          : array();

// Defaults
$contact_hero_headline    = $contact_hero_headline    ?: 'Let\'s Build Your Unified Growth Engine';
$contact_hero_subheadline = $contact_hero_subheadline ?: 'No pitch decks. No canned proposals. Tell us about your situation and we\'ll have an honest conversation about what growth actually looks like for you.';
$contact_email            = $contact_email            ?: 'hello@bluuhq.com';
$contact_location         = $contact_location         ?: 'Remote-first, serving North America';
$contact_form_headline    = $contact_form_headline    ?: 'Start the Conversation';

if ( empty( $contact_process ) ) {
    $contact_process = array(
        array(
            'step_number'      => '01',
            'step_title'       => 'Discovery Call',
            'step_description' => 'A 30-minute conversation to understand your current stack, your revenue goals, and whether our model is the right fit. No pitch. Honest assessment only.',
        ),
        array(
            'step_number'      => '02',
            'step_title'       => 'Strategy Audit',
            'step_description' => 'We conduct a technical, content, and sales-enablement audit of your current digital presence. You\'ll receive a Gap Analysis document regardless of whether we move forward.',
        ),
        array(
            'step_number'      => '03',
            'step_title'       => 'Engine Launch',
            'step_description' => 'Onboarding begins within 5 business days of signing. Your dedicated team is briefed, your strategy is locked, and your growth engine is activated.',
        ),
    );
}

get_header();
?>

<!-- Contact Hero -->
<section class="page-hero" aria-label="<?php esc_attr_e( 'Contact hero', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="page-hero__inner page-hero__inner--center">
            <div class="md-chip animate-on-scroll"><?php esc_html_e( 'Get In Touch', 'bluu-interactive' ); ?></div>
            <h1 class="page-hero__headline animate-on-scroll"><?php echo esc_html( $contact_hero_headline ); ?></h1>
            <p class="page-hero__subheadline animate-on-scroll"><?php echo esc_html( $contact_hero_subheadline ); ?></p>
        </div>
    </div>
</section>

<!-- Contact Split Layout -->
<section class="section contact-section" id="contact" aria-label="<?php esc_attr_e( 'Contact information and form', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="contact-section__inner">

            <!-- Left Column: Info + Process -->
            <div class="contact-section__info animate-on-scroll">

                <!-- Contact Details -->
                <div class="contact-info">
                    <h2 class="contact-info__title"><?php esc_html_e( 'Contact Information', 'bluu-interactive' ); ?></h2>

                    <ul class="contact-info__list">
                        <?php if ( $contact_email ) : ?>
                            <li class="contact-info__item">
                                <div class="contact-info__icon" aria-hidden="true">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </div>
                                <div class="contact-info__detail">
                                    <span class="contact-info__label"><?php esc_html_e( 'Email', 'bluu-interactive' ); ?></span>
                                    <a href="mailto:<?php echo esc_attr( $contact_email ); ?>" class="contact-info__value">
                                        <?php echo esc_html( $contact_email ); ?>
                                    </a>
                                </div>
                            </li>
                        <?php endif; ?>
                        <?php if ( $contact_phone ) : ?>
                            <li class="contact-info__item">
                                <div class="contact-info__icon" aria-hidden="true">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                </div>
                                <div class="contact-info__detail">
                                    <span class="contact-info__label"><?php esc_html_e( 'Phone', 'bluu-interactive' ); ?></span>
                                    <a href="tel:<?php echo esc_attr( preg_replace( '/[^+\d]/', '', $contact_phone ) ); ?>" class="contact-info__value">
                                        <?php echo esc_html( $contact_phone ); ?>
                                    </a>
                                </div>
                            </li>
                        <?php endif; ?>
                        <?php if ( $contact_location ) : ?>
                            <li class="contact-info__item">
                                <div class="contact-info__icon" aria-hidden="true">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                </div>
                                <div class="contact-info__detail">
                                    <span class="contact-info__label"><?php esc_html_e( 'Location', 'bluu-interactive' ); ?></span>
                                    <span class="contact-info__value"><?php echo esc_html( $contact_location ); ?></span>
                                </div>
                            </li>
                        <?php endif; ?>
                    </ul>
                </div><!-- /.contact-info -->

                <!-- Our Process Timeline -->
                <?php if ( ! empty( $contact_process ) ) : ?>
                <div class="contact-process">
                    <h2 class="contact-process__title"><?php esc_html_e( 'Our Process', 'bluu-interactive' ); ?></h2>

                    <ol class="contact-process__steps" aria-label="<?php esc_attr_e( 'Our 3-step engagement process', 'bluu-interactive' ); ?>">
                        <?php foreach ( $contact_process as $step_index => $step ) : ?>
                            <li class="contact-process__step">
                                <div class="contact-process__step-number" aria-hidden="true">
                                    <?php echo esc_html( $step['step_number'] ); ?>
                                </div>
                                <?php if ( $step_index < count( $contact_process ) - 1 ) : ?>
                                    <div class="contact-process__connector" aria-hidden="true"></div>
                                <?php endif; ?>
                                <div class="contact-process__step-content">
                                    <h3 class="contact-process__step-title"><?php echo esc_html( $step['step_title'] ); ?></h3>
                                    <p class="contact-process__step-description"><?php echo esc_html( $step['step_description'] ); ?></p>
                                </div>
                            </li>
                        <?php endforeach; ?>
                    </ol>
                </div><!-- /.contact-process -->
                <?php endif; ?>

            </div><!-- /.contact-section__info -->

            <!-- Right Column: Contact Form -->
            <div class="contact-section__form-wrap animate-on-scroll">
                <div class="contact-form-card md-card">
                    <h2 class="contact-form-card__title"><?php echo esc_html( $contact_form_headline ); ?></h2>
                    <p class="contact-form-card__subtitle"><?php esc_html_e( 'We respond within 1 business day.', 'bluu-interactive' ); ?></p>

                    <!-- Success / Error Messages -->
                    <div class="contact-form__feedback" id="contact-form-feedback" role="alert" aria-live="polite" hidden></div>

                    <form
                        class="contact-form"
                        id="contact-form"
                        method="post"
                        novalidate
                        aria-label="<?php esc_attr_e( 'Contact inquiry form', 'bluu-interactive' ); ?>"
                    >
                        <?php wp_nonce_field( 'bluu_contact_nonce', 'nonce' ); ?>

                        <!-- Honeypot (hidden from real users) -->
                        <div class="contact-form__honeypot" aria-hidden="true" tabindex="-1" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;">
                            <label for="website"><?php esc_html_e( 'Website (leave blank)', 'bluu-interactive' ); ?></label>
                            <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" value="">
                        </div>

                        <div class="contact-form__row contact-form__row--half">
                            <div class="contact-form__field">
                                <label for="contact_name" class="contact-form__label">
                                    <?php esc_html_e( 'Full Name', 'bluu-interactive' ); ?>
                                    <span class="contact-form__required" aria-label="<?php esc_attr_e( 'required', 'bluu-interactive' ); ?>">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="contact_name"
                                    name="contact_name"
                                    class="contact-form__input"
                                    placeholder="<?php esc_attr_e( 'Alex Johnson', 'bluu-interactive' ); ?>"
                                    required
                                    autocomplete="name"
                                    aria-required="true"
                                >
                            </div>
                            <div class="contact-form__field">
                                <label for="contact_company" class="contact-form__label">
                                    <?php esc_html_e( 'Company', 'bluu-interactive' ); ?>
                                </label>
                                <input
                                    type="text"
                                    id="contact_company"
                                    name="contact_company"
                                    class="contact-form__input"
                                    placeholder="<?php esc_attr_e( 'Acme Corp', 'bluu-interactive' ); ?>"
                                    autocomplete="organization"
                                >
                            </div>
                        </div>

                        <div class="contact-form__row contact-form__row--half">
                            <div class="contact-form__field">
                                <label for="contact_email" class="contact-form__label">
                                    <?php esc_html_e( 'Work Email', 'bluu-interactive' ); ?>
                                    <span class="contact-form__required" aria-label="<?php esc_attr_e( 'required', 'bluu-interactive' ); ?>">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="contact_email"
                                    name="contact_email"
                                    class="contact-form__input"
                                    placeholder="<?php esc_attr_e( 'alex@company.com', 'bluu-interactive' ); ?>"
                                    required
                                    autocomplete="email"
                                    aria-required="true"
                                >
                            </div>
                            <div class="contact-form__field">
                                <label for="contact_phone" class="contact-form__label">
                                    <?php esc_html_e( 'Phone (optional)', 'bluu-interactive' ); ?>
                                </label>
                                <input
                                    type="tel"
                                    id="contact_phone"
                                    name="contact_phone"
                                    class="contact-form__input"
                                    placeholder="<?php esc_attr_e( '+1 (555) 000-0000', 'bluu-interactive' ); ?>"
                                    autocomplete="tel"
                                >
                            </div>
                        </div>

                        <div class="contact-form__field">
                            <label for="contact_situation" class="contact-form__label">
                                <?php esc_html_e( 'Tell us about your situation', 'bluu-interactive' ); ?>
                                <span class="contact-form__required" aria-label="<?php esc_attr_e( 'required', 'bluu-interactive' ); ?>">*</span>
                            </label>
                            <textarea
                                id="contact_situation"
                                name="contact_situation"
                                class="contact-form__textarea"
                                rows="5"
                                placeholder="<?php esc_attr_e( 'What\'s your current marketing stack? What\'s not working? What does winning look like for you in 12 months?', 'bluu-interactive' ); ?>"
                                required
                                aria-required="true"
                            ></textarea>
                        </div>

                        <button type="submit" class="btn-primary contact-form__submit" id="contact-submit" aria-label="<?php esc_attr_e( 'Submit contact form', 'bluu-interactive' ); ?>">
                            <span class="contact-form__submit-text"><?php esc_html_e( 'Send Message', 'bluu-interactive' ); ?></span>
                            <span class="contact-form__submit-loading" hidden aria-live="polite">
                                <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                </svg>
                                <?php esc_html_e( 'Sending…', 'bluu-interactive' ); ?>
                            </span>
                        </button>

                        <p class="contact-form__disclaimer">
                            <?php esc_html_e( 'By submitting, you agree to receive a response from our team. No spam, ever.', 'bluu-interactive' ); ?>
                        </p>

                    </form><!-- /.contact-form -->
                </div><!-- /.contact-form-card -->
            </div><!-- /.contact-section__form-wrap -->

        </div><!-- /.contact-section__inner -->
    </div><!-- /.container -->
</section>

<?php get_footer(); ?>
