<?php
/**
 * Template Name: Pricing Page
 *
 * @package bluu-interactive
 */

// ── ACF fields with defaults ──────────────────────────────────────────────────
$hero_badge    = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_badge' )    : '' ) ?: 'Transparent Pricing';
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_headline' ) : '' ) ?: 'Transparent, All-Inclusive Pricing';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_body' )     : '' ) ?: 'No retainer games. No surprise invoices. One subscription that covers everything your growth engine needs.';

$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_headline' ) : '' ) ?: 'Not Sure Which Plan Fits?';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_body' )     : '' ) ?: 'Let\'s talk. A 15-minute Discovery Call is free and commitment-free. We\'ll tell you exactly which plan — if any — makes sense for your stage.';
$cta_url      = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_url' )      : '' ) ?: home_url( '/contact' );

// ── Pricing tiers ─────────────────────────────────────────────────────────────
$tiers = array(
    array(
        'tier_badge'  => 'Starter',
        'name'        => 'Growth Engine',
        'price'       => '$3,000–$4,500',
        'period'      => '/month',
        'description' => 'For companies ready to build a serious digital presence.',
        'note'        => 'Onboarding fee waived for 6-month commitment.',
        'cta_text'    => 'Get Started',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'outline-blue',
        'featured'    => false,
        'features'    => array(
            array( 'text' => 'Managed web infrastructure (The Hub)', 'bold' => false ),
            array( 'text' => 'Up to 2 authority articles per month',  'bold' => false ),
            array( 'text' => '1 premium case study per quarter',       'bold' => false ),
            array( 'text' => 'Technical SEO ownership',                'bold' => false ),
            array( 'text' => 'Monthly strategy sync · all content SEO and AI crawl ready', 'bold' => false ),
        ),
    ),
    array(
        'tier_badge'  => '',
        'name'        => 'Scale Engine',
        'price'       => '$6,000–$8,500',
        'period'      => '/month',
        'description' => 'For companies that need to dominate their category.',
        'note'        => 'Best value for companies with active sales motions.',
        'cta_text'    => 'Book a Call',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'solid-blue',
        'featured'    => true,
        'features'    => array(
            array( 'text' => 'Everything in Growth Engine',      'bold' => true ),
            array( 'text' => 'Up to 4 authority articles per month', 'bold' => false ),
            array( 'text' => '1 premium case study per month',       'bold' => false ),
            array( 'text' => 'Battle cards & sales one-pagers',      'bold' => false ),
            array( 'text' => 'VIP Slack support channel',            'bold' => false ),
            array( 'text' => 'Bi-weekly strategy calls',             'bold' => false ),
            array( 'text' => 'Conversion rate optimization',         'bold' => false ),
        ),
    ),
    array(
        'tier_badge'  => 'Enterprise',
        'name'        => 'Enterprise Engine',
        'price'       => 'Custom',
        'period'      => '',
        'description' => 'For companies with complex, multi-market needs.',
        'note'        => 'Pricing based on scope and commitment length.',
        'cta_text'    => 'Contact Us',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'outline-navy',
        'featured'    => false,
        'features'    => array(
            array( 'text' => 'Everything in Scale Engine',             'bold' => true ),
            array( 'text' => 'Custom article & asset volume',          'bold' => false ),
            array( 'text' => 'Multi-market & multi-language support',  'bold' => false ),
            array( 'text' => 'Dedicated account team',                 'bold' => false ),
            array( 'text' => 'Executive strategy workshops',           'bold' => false ),
            array( 'text' => 'Custom reporting dashboard',             'bold' => false ),
            array( 'text' => 'SLA-backed delivery guarantees',         'bold' => false ),
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
        'text' => 'Cancel anytime after 90 days',
    ),
    array(
        'icon' => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        'text' => 'Onboarding in 5 business days',
    ),
    array(
        'icon' => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
        'text' => 'Dedicated account team',
    ),
);

// ── FAQ ───────────────────────────────────────────────────────────────────────
$faq_items = array(
    array(
        'question' => 'Do you offer one-off projects?',
        'answer'   => 'We don\'t. Bluu Interactive is built for ongoing growth partnerships, not isolated deliverables. One-off projects produce outputs that don\'t talk to each other — which is exactly the fragmentation we eliminate. Our retainer model means everything we build compounds over time.',
    ),
    array(
        'question' => 'What industries do you specialize in?',
        'answer'   => 'We focus on B2B brands in high-consideration verticals: SaaS, professional services, legal tech, healthtech, logistics, and enterprise software. The common thread is a longer sales cycle where content authority and digital infrastructure actually move deals.',
    ),
    array(
        'question' => 'How quickly can we start?',
        'answer'   => 'Onboarding takes 5 business days from contract signature. We spend that time doing a full audit of your existing infrastructure, content, and sales assets — so day one of production work is informed, not exploratory.',
    ),
    array(
        'question' => 'What\'s included in "Managed Web Infrastructure"?',
        'answer'   => 'Everything your site needs to perform without you managing it: hosting, uptime monitoring, security patches, plugin/core updates, performance optimization, and conversion-focused landing page builds. You focus on the business. We own the digital foundation.',
    ),
    array(
        'question' => 'Are there contracts or lock-in periods?',
        'answer'   => 'We ask for a 90-day initial commitment — enough time to see meaningful momentum. After that, it\'s month-to-month. We earn retention by delivering results, not by trapping you in paperwork.',
    ),
    array(
        'question' => 'What does "SME-Verified Content" mean?',
        'answer'   => 'Every article we publish is reviewed by a subject matter expert in your industry before it goes live. This isn\'t AI-generated filler. It\'s researched, expert-reviewed authority content that ranks for intent-rich queries and converts the traffic it earns.',
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
