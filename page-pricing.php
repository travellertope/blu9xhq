<?php
/**
 * Template Name: Pricing Page
 *
 * @package bluu-interactive
 */

// ACF fields
$pricing_hero_headline    = function_exists( 'get_field' ) ? get_field( 'pricing_hero_headline' )    : '';
$pricing_hero_subheadline = function_exists( 'get_field' ) ? get_field( 'pricing_hero_subheadline' ) : '';
$pricing_tiers            = function_exists( 'get_field' ) ? get_field( 'pricing_tiers' )            : array();
$pricing_faq              = function_exists( 'get_field' ) ? get_field( 'pricing_faq' )              : array();
$bottom_cta_headline      = function_exists( 'get_field' ) ? get_field( 'pricing_bottom_cta_headline' ) : '';
$bottom_cta_body          = function_exists( 'get_field' ) ? get_field( 'pricing_bottom_cta_body' )     : '';
$bottom_cta_button_text   = function_exists( 'get_field' ) ? get_field( 'pricing_bottom_cta_button_text' ) : '';
$bottom_cta_button_url    = function_exists( 'get_field' ) ? get_field( 'pricing_bottom_cta_button_url' )  : '';

// Defaults
$pricing_hero_headline    = $pricing_hero_headline    ?: 'Transparent, All-Inclusive Pricing';
$pricing_hero_subheadline = $pricing_hero_subheadline ?: 'No retainer games. No surprise invoices. One subscription that covers everything your growth engine needs.';
$bottom_cta_headline      = $bottom_cta_headline      ?: 'Not Sure Which Plan Fits?';
$bottom_cta_body          = $bottom_cta_body          ?: 'Let\'s talk. A 30-minute Discovery Call is free and commitment-free. We\'ll tell you exactly which plan — if any — makes sense for your stage.';
$bottom_cta_button_text   = $bottom_cta_button_text   ?: 'Book a Discovery Call';
$bottom_cta_button_url    = $bottom_cta_button_url    ?: home_url( '/contact' );

// Default pricing tiers
if ( empty( $pricing_tiers ) ) {
    $pricing_tiers = array(
        array(
            'tier_badge'       => 'Starter',
            'tier_name'        => 'Growth Engine',
            'tier_price'       => '$3,000–$4,500',
            'tier_price_suffix' => '/month',
            'tier_tagline'     => 'For companies ready to build a serious digital presence.',
            'tier_features'    => "Managed web infrastructure (The Hub)\nUp to 2 authority articles per month\n1 premium case study per quarter\nTechnical SEO ownership\nMonthly strategy sync",
            'tier_cta_text'    => 'Get Started',
            'tier_cta_url'     => home_url( '/contact' ),
            'tier_is_featured' => false,
            'tier_note'        => 'Onboarding fee waived for 6-month commitment.',
        ),
        array(
            'tier_badge'       => 'Most Popular',
            'tier_name'        => 'Scale Engine',
            'tier_price'       => '$6,000–$8,500',
            'tier_price_suffix' => '/month',
            'tier_tagline'     => 'For companies that need to dominate their category.',
            'tier_features'    => "Everything in Growth Engine\nUp to 4 authority articles per month\n1 premium case study per month\nBattle cards & sales one-pagers\nVIP Slack support channel\nBi-weekly strategy calls\nConversion rate optimization",
            'tier_cta_text'    => 'Book a Call',
            'tier_cta_url'     => home_url( '/contact' ),
            'tier_is_featured' => true,
            'tier_note'        => 'Best value for companies with active sales motions.',
        ),
        array(
            'tier_badge'       => 'Enterprise',
            'tier_name'        => 'Enterprise Engine',
            'tier_price'       => 'Custom',
            'tier_price_suffix' => '',
            'tier_tagline'     => 'For companies with complex, multi-market needs.',
            'tier_features'    => "Everything in Scale Engine\nCustom article & asset volume\nMulti-market & multi-language support\nDedicated account team\nExecutive strategy workshops\nCustom reporting dashboard\nSLA-backed delivery guarantees",
            'tier_cta_text'    => 'Contact Us',
            'tier_cta_url'     => home_url( '/contact' ),
            'tier_is_featured' => false,
            'tier_note'        => 'Pricing based on scope and commitment length.',
        ),
    );
}

// Default FAQs
if ( empty( $pricing_faq ) ) {
    $pricing_faq = array(
        array(
            'question' => 'Do you offer one-off projects?',
            'answer'   => 'No. Bluu Interactive is built on long-term partnership. Our model only works when strategy, content, and infrastructure are fully aligned over time. We do offer a low-risk \'Wedge\' project — a premium Case Study suite at a flat rate — as a first engagement.',
        ),
        array(
            'question' => 'What industries do you specialize in?',
            'answer'   => 'Healthcare & Healthtech, Legal & Finance, B2B SaaS, and Logistics & Supply Chain. Industries where trust, compliance, and technical accuracy are non-negotiable.',
        ),
        array(
            'question' => 'How quickly can we start?',
            'answer'   => 'After a Discovery Call and signed agreement, onboarding begins within 5 business days.',
        ),
        array(
            'question' => 'What\'s included in "Managed Web Infrastructure"?',
            'answer'   => 'Complete ownership of your website\'s technical health: hosting infrastructure, security, performance optimization, Core Web Vitals, technical SEO, and CRO. We treat your site as the revenue engine it should be.',
        ),
        array(
            'question' => 'Are there contracts or lock-in periods?',
            'answer'   => 'We work on monthly subscriptions with a 90-day minimum commitment. After 90 days, you can cancel with 30 days notice. We prefer to earn your continued partnership through results.',
        ),
        array(
            'question' => 'What does "SME-Verified Content" mean?',
            'answer'   => 'Every article goes through a subject-matter expert review process. We interview your team, source external experts where needed, and ensure every claim is accurate and compliant for your industry before publication.',
        ),
    );
}

get_header();
?>

<!-- Pricing Hero -->
<section class="page-hero page-hero--pricing" aria-label="<?php esc_attr_e( 'Pricing hero', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="page-hero__inner page-hero__inner--center">
            <div class="md-chip animate-on-scroll"><?php esc_html_e( 'Transparent Pricing', 'bluu-interactive' ); ?></div>
            <h1 class="page-hero__headline animate-on-scroll"><?php echo esc_html( $pricing_hero_headline ); ?></h1>
            <p class="page-hero__subheadline animate-on-scroll"><?php echo esc_html( $pricing_hero_subheadline ); ?></p>
        </div>
    </div>
</section>

<!-- Pricing Tiers -->
<section class="section pricing-section" id="pricing-tiers" aria-label="<?php esc_attr_e( 'Pricing tiers', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-grid">
            <?php foreach ( $pricing_tiers as $tier ) :
                $is_featured = ! empty( $tier['tier_is_featured'] );
                $features    = ! empty( $tier['tier_features'] ) ? array_filter( array_map( 'trim', explode( "\n", $tier['tier_features'] ) ) ) : array();
            ?>
                <article
                    class="pricing-card<?php echo $is_featured ? ' pricing-card--featured' : ''; ?> animate-on-scroll"
                    aria-label="<?php echo esc_attr( $tier['tier_name'] ); ?> plan"
                >
                    <?php if ( $is_featured ) : ?>
                        <div class="pricing-card__popular-badge" aria-label="<?php esc_attr_e( 'Most Popular plan', 'bluu-interactive' ); ?>">
                            <?php esc_html_e( 'Most Popular', 'bluu-interactive' ); ?>
                        </div>
                    <?php endif; ?>

                    <div class="pricing-card__header">
                        <?php if ( ! empty( $tier['tier_badge'] ) && ! $is_featured ) : ?>
                            <div class="md-chip pricing-card__badge"><?php echo esc_html( $tier['tier_badge'] ); ?></div>
                        <?php endif; ?>
                        <h2 class="pricing-card__name"><?php echo esc_html( $tier['tier_name'] ); ?></h2>
                        <div class="pricing-card__price">
                            <span class="pricing-card__price-amount"><?php echo esc_html( $tier['tier_price'] ); ?></span>
                            <?php if ( ! empty( $tier['tier_price_suffix'] ) ) : ?>
                                <span class="pricing-card__price-suffix"><?php echo esc_html( $tier['tier_price_suffix'] ); ?></span>
                            <?php endif; ?>
                        </div>
                        <?php if ( ! empty( $tier['tier_tagline'] ) ) : ?>
                            <p class="pricing-card__tagline"><?php echo esc_html( $tier['tier_tagline'] ); ?></p>
                        <?php endif; ?>
                    </div><!-- /.pricing-card__header -->

                    <?php if ( ! empty( $features ) ) : ?>
                        <ul class="pricing-card__features" aria-label="<?php esc_attr_e( 'Plan features', 'bluu-interactive' ); ?>">
                            <?php foreach ( $features as $feature ) : ?>
                                <li class="pricing-card__feature">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    <?php echo esc_html( $feature ); ?>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>

                    <div class="pricing-card__footer">
                        <a
                            href="<?php echo esc_url( $tier['tier_cta_url'] ?: home_url( '/contact' ) ); ?>"
                            class="<?php echo $is_featured ? 'btn-primary' : 'btn-secondary'; ?>"
                            style="width:100%;justify-content:center;"
                            aria-label="<?php echo esc_attr( sprintf( __( '%s — %s', 'bluu-interactive' ), $tier['tier_cta_text'], $tier['tier_name'] ) ); ?>"
                        >
                            <?php echo esc_html( $tier['tier_cta_text'] ?: 'Get Started' ); ?>
                        </a>
                        <?php if ( ! empty( $tier['tier_note'] ) ) : ?>
                            <p class="pricing-card__note"><?php echo esc_html( $tier['tier_note'] ); ?></p>
                        <?php endif; ?>
                    </div><!-- /.pricing-card__footer -->

                </article>
            <?php endforeach; ?>
        </div><!-- /.pricing-grid -->

        <!-- Value guarantees row -->
        <div class="pricing-section__guarantees animate-on-scroll">
            <div class="pricing-guarantee">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#137333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span><?php esc_html_e( 'No surprise invoices', 'bluu-interactive' ); ?></span>
            </div>
            <div class="pricing-guarantee">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#137333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span><?php esc_html_e( 'Cancel anytime after 90 days', 'bluu-interactive' ); ?></span>
            </div>
            <div class="pricing-guarantee">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#137333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span><?php esc_html_e( 'Onboarding in 5 business days', 'bluu-interactive' ); ?></span>
            </div>
            <div class="pricing-guarantee">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#137333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span><?php esc_html_e( 'Dedicated account team', 'bluu-interactive' ); ?></span>
            </div>
        </div>
    </div><!-- /.container -->
</section>

<!-- FAQ Section -->
<?php if ( ! empty( $pricing_faq ) ) : ?>
<section class="section faq-section" id="faq" aria-label="<?php esc_attr_e( 'Frequently Asked Questions', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="section__header section__header--center">
            <div class="md-chip animate-on-scroll"><?php esc_html_e( 'FAQ', 'bluu-interactive' ); ?></div>
            <h2 class="section__headline animate-on-scroll"><?php esc_html_e( 'Questions Worth Asking', 'bluu-interactive' ); ?></h2>
            <p class="section__body animate-on-scroll"><?php esc_html_e( 'If you\'re not sure, ask. We\'d rather you understand the model than sign up for something that doesn\'t fit.', 'bluu-interactive' ); ?></p>
        </div>

        <div class="faq-accordion" id="faq-accordion" role="list">
            <?php foreach ( $pricing_faq as $faq_index => $faq_item ) :
                $faq_id = 'faq-item-' . absint( $faq_index );
            ?>
                <div class="faq-item animate-on-scroll" role="listitem">
                    <button
                        class="faq-item__question"
                        id="<?php echo esc_attr( $faq_id . '-btn' ); ?>"
                        aria-expanded="false"
                        aria-controls="<?php echo esc_attr( $faq_id . '-answer' ); ?>"
                    >
                        <span><?php echo esc_html( $faq_item['question'] ); ?></span>
                        <span class="faq-item__icon" aria-hidden="true">
                            <svg class="faq-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            <svg class="faq-minus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </span>
                    </button>
                    <div
                        class="faq-item__answer"
                        id="<?php echo esc_attr( $faq_id . '-answer' ); ?>"
                        role="region"
                        aria-labelledby="<?php echo esc_attr( $faq_id . '-btn' ); ?>"
                        hidden
                    >
                        <p><?php echo esc_html( $faq_item['answer'] ); ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div><!-- /.faq-accordion -->
    </div><!-- /.container -->
</section>
<?php endif; ?>

<!-- Bottom CTA -->
<section class="section section--blue cta-section" aria-label="<?php esc_attr_e( 'Pricing call to action', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="cta-section__inner animate-on-scroll">
            <div class="cta-section__content">
                <h2 class="cta-section__headline"><?php echo esc_html( $bottom_cta_headline ); ?></h2>
                <p class="cta-section__body"><?php echo esc_html( $bottom_cta_body ); ?></p>
            </div>
            <div class="cta-section__action">
                <a href="<?php echo esc_url( $bottom_cta_button_url ); ?>" class="btn-white" aria-label="<?php echo esc_attr( $bottom_cta_button_text ); ?>">
                    <?php echo esc_html( $bottom_cta_button_text ); ?>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </a>
                <p class="cta-section__disclaimer"><?php esc_html_e( 'Free 30-minute call. No commitment required.', 'bluu-interactive' ); ?></p>
            </div>
        </div>
    </div>
</section>

<?php get_footer(); ?>
