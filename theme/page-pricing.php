<?php
/**
 * Template Name: Pricing Page
 *
 * @package bluu-interactive
 */

// ── ACF fields with defaults ──────────────────────────────────────────────────
$hero_badge    = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_badge' )    : '' ) ?: 'Straightforward Retainer Pricing';
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_headline' ) : '' ) ?: 'One retainer. No surprises.';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_body' )     : '' ) ?: 'Everything your content operation needs — research, writing, publishing, and reporting — in a single flat monthly number. No project fees. No hourly billing. No scope creep conversations.';

$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_headline' ) : '' ) ?: 'Not sure which retainer fits?';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_body' )     : '' ) ?: 'Book a 15-minute Discovery Call. We\'ll tell you honestly which tier makes sense for your business right now — and if the timing isn\'t right, we\'ll say so. No pitch, no pressure.';
$cta_url      = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_url' )      : '' ) ?: home_url( '/contact' );

// ── Pricing tiers ─────────────────────────────────────────────────────────────
$tiers = array(
    array(
        'tier_badge'  => '',
        'name'        => 'Growth Engine',
        'price'       => '$3,000–$4,500',
        'period'      => '/month',
        'description' => 'For teams ready to run a consistent content operation for the first time.',
        'note'        => '90-day initial commitment. Month-to-month after that.',
        'cta_text'    => 'Get Started',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'outline-blue',
        'featured'    => false,
        'features'    => array(
            array( 'text' => 'Competitor and audience intelligence (weekly)', 'bold' => false ),
            array( 'text' => 'Up to 2 authority articles per month',          'bold' => false ),
            array( 'text' => '1 case study per quarter',                      'bold' => false ),
            array( 'text' => 'Published to website, LinkedIn, and newsletter', 'bold' => false ),
            array( 'text' => 'Monthly performance report',                    'bold' => false ),
            array( 'text' => 'Monthly strategy call · all content SEO and AI crawl ready', 'bold' => false ),
        ),
    ),
    array(
        'tier_badge'  => '',
        'name'        => 'Scale Engine',
        'price'       => '$6,000–$8,500',
        'period'      => '/month',
        'description' => 'For teams who need more volume and a closer strategic partnership.',
        'note'        => 'Best for teams with an active sales motion.',
        'cta_text'    => 'Book a Call',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'solid-blue',
        'featured'    => true,
        'features'    => array(
            array( 'text' => 'Everything in Growth Engine',                   'bold' => true ),
            array( 'text' => 'Up to 4 authority articles per month',          'bold' => false ),
            array( 'text' => '1 case study per month',                        'bold' => false ),
            array( 'text' => 'Founder / principal LinkedIn content programme', 'bold' => false ),
            array( 'text' => 'Bi-weekly strategy calls',                      'bold' => false ),
            array( 'text' => 'Dedicated Slack channel',                       'bold' => false ),
            array( 'text' => 'Priority turnaround on all deliverables',       'bold' => false ),
        ),
    ),
    array(
        'tier_badge'  => 'Enterprise',
        'name'        => 'Enterprise Engine',
        'price'       => 'Custom',
        'period'      => '',
        'description' => 'For teams with complex needs, multiple markets, or high-volume requirements.',
        'note'        => 'Scoped to your requirements. Talk to us.',
        'cta_text'    => 'Contact Us',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'outline-navy',
        'featured'    => false,
        'features'    => array(
            array( 'text' => 'Everything in Scale Engine',            'bold' => true ),
            array( 'text' => 'Custom article and asset volume',       'bold' => false ),
            array( 'text' => 'Multi-market and multi-language support', 'bold' => false ),
            array( 'text' => 'Dedicated account team',                'bold' => false ),
            array( 'text' => 'Executive strategy workshops',          'bold' => false ),
            array( 'text' => 'Custom reporting dashboard',            'bold' => false ),
            array( 'text' => 'SLA-backed delivery guarantees',        'bold' => false ),
        ),
    ),
);

// ── Trust signals ─────────────────────────────────────────────────────────────
$trust_items = array(
    array(
        'icon' => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        'text' => 'No surprise invoices',
    ),
    array(
        'icon' => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        'text' => 'Month-to-month after 90 days',
    ),
    array(
        'icon' => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        'text' => 'Onboarding in 5 business days',
    ),
    array(
        'icon' => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        'text' => 'All content SEO and AI crawl ready',
    ),
);

$check_svg = '<svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';

get_header();
?>

<!-- ── Pricing Hero ─────────────────────────────────────────────────────────── -->
<section class="pricing-hero" aria-label="<?php esc_attr_e( 'Pricing overview', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-hero__inner animate-on-scroll">
            <div class="pricing-hero__badge"><?php echo esc_html( $hero_badge ); ?></div>
            <h1 class="pricing-hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>
            <p class="pricing-hero__body"><?php echo bluu_text( $hero_body ); ?></p>
        </div>
    </div>
</section>

<!-- ── Pricing Cards ───────────────────────────────────────────────────────── -->
<section class="pricing-section" aria-label="<?php esc_attr_e( 'Pricing plans', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-grid">

            <?php foreach ( $tiers as $tier ) :
                $is_featured = ! empty( $tier['featured'] );
                $card_class  = 'pricing-card' . ( $is_featured ? ' pricing-card--featured' : ' pricing-card--offset' );
            ?>
            <div class="<?php echo esc_attr( $card_class ); ?>">

                <?php if ( $is_featured ) : ?>
                    <div class="pricing-card__popular-label">
                        <?php esc_html_e( 'Most Popular', 'bluu-interactive' ); ?>
                    </div>
                <?php elseif ( $tier['tier_badge'] ) : ?>
                    <div class="pricing-card__tier-badge"><?php echo esc_html( $tier['tier_badge'] ); ?></div>
                <?php endif; ?>

                <h3 class="pricing-card__name"><?php echo esc_html( $tier['name'] ); ?></h3>

                <div class="pricing-card__price-wrap">
                    <span class="pricing-card__price-amount<?php echo $is_featured ? ' pricing-card__price-amount--navy' : ''; ?>">
                        <?php echo esc_html( $tier['price'] ); ?>
                    </span>
                    <?php if ( $tier['period'] ) : ?>
                        <span class="pricing-card__price-period"><?php echo esc_html( $tier['period'] ); ?></span>
                    <?php endif; ?>
                </div>

                <p class="pricing-card__description"><?php echo bluu_text( $tier['description'] ); ?></p>

                <div class="pricing-card__divider" aria-hidden="true"></div>

                <ul class="pricing-card__features" aria-label="<?php esc_attr_e( 'Plan features', 'bluu-interactive' ); ?>">
                    <?php foreach ( $tier['features'] as $feature ) : ?>
                        <li class="pricing-card__feature">
                            <span class="pricing-card__check" aria-hidden="true"><?php echo $check_svg; // phpcs:ignore ?></span>
                            <span class="<?php echo ! empty( $feature['bold'] ) ? 'pricing-card__feature-text--bold' : 'pricing-card__feature-text'; ?>">
                                <?php echo esc_html( $feature['text'] ); ?>
                            </span>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <a href="<?php echo esc_url( $tier['cta_url'] ); ?>"
                   class="pricing-card__cta pricing-card__cta--<?php echo esc_attr( $tier['cta_style'] ); ?>">
                    <?php echo esc_html( $tier['cta_text'] ); ?>
                </a>

                <p class="pricing-card__note"><?php echo esc_html( $tier['note'] ); ?></p>

            </div>
            <?php endforeach; ?>

        </div>
    </div>
</section>

<!-- ── SEO Standard Note ─────────────────────────────────────────────────────── -->
<div class="pricing-seo-note">
    <div class="container">
        <p class="pricing-seo-note__text"><?php esc_html_e( 'All content produced at every tier is built to SEO and AI crawl standard — included, not charged as an extra.', 'bluu-interactive' ); ?></p>
    </div>
</div>

<!-- ── Trust Signals ──────────────────────────────────────────────────────── -->
<section class="pricing-trust" aria-label="<?php esc_attr_e( 'Trust signals', 'bluu-interactive' ); ?>">
    <div class="container">
        <ul class="pricing-trust__list">
            <?php foreach ( $trust_items as $item ) : ?>
                <li class="pricing-trust__item">
                    <span class="pricing-trust__icon" aria-hidden="true"><?php echo $item['icon']; // phpcs:ignore ?></span>
                    <?php echo esc_html( $item['text'] ); ?>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
</section>

<!-- ── Pricing footer note ────────────────────────────────────────────────────── -->
<div class="pricing-footer-note">
    <div class="container">
        <p class="pricing-footer-note__text"><?php esc_html_e( 'All plans billed monthly · No lock-in contracts for the first 3 months · Founding client rate available — ask us · SEO and AI crawl standard built into every deliverable', 'bluu-interactive' ); ?></p>
    </div>
</div>

<!-- ── Bottom CTA ─────────────────────────────────────────────────────────── -->
<section class="pricing-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-cta__inner">

            <div class="pricing-cta__text">
                <h2 class="pricing-cta__headline"><?php echo esc_html( $cta_headline ); ?></h2>
                <p class="pricing-cta__body"><?php echo bluu_text( $cta_body ); ?></p>
            </div>

            <div class="pricing-cta__actions">
                <a href="<?php echo esc_url( $cta_url ); ?>" class="btn-primary btn-primary--large">
                    <?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                </a>
                <p class="pricing-cta__disclaimer"><?php esc_html_e( 'No Pitch Deck. No Sales Pressure.', 'bluu-interactive' ); ?></p>
            </div>

        </div>
    </div>
</section>

<?php get_footer(); ?>
