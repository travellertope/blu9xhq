<?php
/**
 * Template Name: Industry Page
 * Template Post Type: page
 *
 * @package bluu-interactive
 */

$gf = function_exists( 'get_field' );

// SEO & meta
$seo_title  = ( $gf ? get_field( 'ind_seo_title' )        : '' ) ?: get_the_title();
$seo_desc   = ( $gf ? get_field( 'ind_meta_description' ) : '' ) ?: '';

// Hero
$hero_tag  = ( $gf ? get_field( 'ind_hero_tag' )         : '' ) ?: 'Industry — Tech & SaaS startups';
$hero_hl   = ( $gf ? get_field( 'ind_hero_headline' )    : '' ) ?: 'You are building the product. We run the content.';
$hero_sub  = ( $gf ? get_field( 'ind_hero_subheadline' ) : '' ) ?: 'SaaS founders are pulled in every direction. Content is always the thing that gets pushed to next week — and next week never comes. Bluu becomes your content team: research, writing, publishing, and results tracking handled every month without you having to manage it.';
$hero_cta  = ( $gf ? get_field( 'ind_hero_cta_label' )   : '' ) ?: 'Book a Discovery Call';
$hero_url  = ( $gf ? get_field( 'ind_hero_cta_url' )     : '' ) ?: home_url( '/contact' );
$hero_img  = $gf ? get_field( 'ind_hero_image' )          : null;
if ( ! empty( $hero_img ) ) {
    $hero_img_src = is_array( $hero_img ) ? esc_url( $hero_img['url'] ) : esc_url( $hero_img );
    $hero_img_alt = is_array( $hero_img ) ? esc_attr( $hero_img['alt'] ) : '';
} else {
    $hero_img_src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
    $hero_img_alt = 'Team working together';
}

// Pain
$pain_heading = ( $gf ? get_field( 'ind_pain_heading' )       : '' ) ?: 'The content problem every SaaS founder recognises';
$pain_body    = ( $gf ? get_field( 'ind_pain_body' )          : '' ) ?: '';
$pain_points  = array(
    array(
        'title' => ( $gf ? get_field( 'ind_pain_point_1_title' ) : '' ) ?: 'No competitor visibility',
        'body'  => ( $gf ? get_field( 'ind_pain_point_1_body' )  : '' ) ?: 'By the time you notice a competitor\'s new positioning or campaign, they have had weeks of impact. Reactive awareness is not a competitive advantage.',
    ),
    array(
        'title' => ( $gf ? get_field( 'ind_pain_point_2_title' ) : '' ) ?: 'Inconsistent publishing',
        'body'  => ( $gf ? get_field( 'ind_pain_point_2_body' )  : '' ) ?: 'Posts go up when someone has time. Months pass between pieces. The compounding effect of consistent content never kicks in because there is no consistent engine behind it.',
    ),
    array(
        'title' => ( $gf ? get_field( 'ind_pain_point_3_title' ) : '' ) ?: 'Founder brand invisible',
        'body'  => ( $gf ? get_field( 'ind_pain_point_3_body' )  : '' ) ?: 'Your name and perspective should be building trust with your target market every week. Instead they are building product documentation and replying to investor updates.',
    ),
);

// Solution
$sol_heading = ( $gf ? get_field( 'ind_solution_heading' ) : '' ) ?: 'What the retainer covers for SaaS teams';
$sol_body    = ( $gf ? get_field( 'ind_solution_body' )    : '' ) ?: '';
$sol_img     = $gf ? get_field( 'ind_solution_image' ) : null;
if ( ! empty( $sol_img ) ) {
    $sol_img_src = is_array( $sol_img ) ? esc_url( $sol_img['url'] ) : esc_url( $sol_img );
    $sol_img_alt = is_array( $sol_img ) ? esc_attr( $sol_img['alt'] ) : '';
} else {
    $sol_img_src = 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80';
    $sol_img_alt = 'Team collaborating on content strategy';
}
$sol_items = array();
for ( $i = 1; $i <= 5; $i++ ) {
    $t = ( $gf ? get_field( "ind_solution_item_{$i}_title" ) : '' );
    $b = ( $gf ? get_field( "ind_solution_item_{$i}_body" )  : '' );
    if ( $t || $b ) {
        $sol_items[] = array( 'title' => $t, 'body' => $b );
    }
}
if ( empty( $sol_items ) ) {
    $sol_items = array(
        array( 'title' => 'Weekly competitor intelligence',   'body' => 'A structured weekly digest monitoring your top competitors — content output, messaging shifts, new feature announcements, and positioning changes. Delivered every Monday.' ),
        array( 'title' => 'Founder brand content',            'body' => 'Consistent LinkedIn content written in your voice — opinion, market commentary, product perspective, and lessons learned. Published on your schedule without taking hours from your week.' ),
        array( 'title' => 'Long-form content and repurposing','body' => 'Blog posts, LinkedIn articles, and newsletter content — each piece repurposed across every channel so your best thinking reaches the widest possible audience.' ),
        array( 'title' => 'Product launch content packages',  'body' => 'A complete content package for every significant launch or feature release — blog post, email, LinkedIn posts, X thread, and social captions — ready before the launch date.' ),
        array( 'title' => 'Monthly performance reporting',    'body' => 'A clean monthly report covering what content performed, what drove engagement, and what changes in the month ahead. No vanity metrics — just a clear picture of what is working.' ),
    );
}

// Who it's for
$who_heading = ( $gf ? get_field( 'ind_who_heading' ) : '' ) ?: 'Who this is right for';
$who_body    = ( $gf ? get_field( 'ind_who_body' )    : '' ) ?: '';
$who_items   = array();
for ( $i = 1; $i <= 4; $i++ ) {
    $s = ( $gf ? get_field( "ind_who_item_{$i}" ) : '' );
    if ( $s ) $who_items[] = $s;
}
if ( empty( $who_items ) ) {
    $who_items = array(
        'You are a seed to Series B SaaS company with between 2 and 30 people and no dedicated content resource.',
        'You are shipping product in a competitive category where positioning and content visibility genuinely influence purchase decisions.',
        'You want content that is informed by real market intelligence — not just blog posts written in a vacuum.',
        'You have tried to manage content yourself or with a freelancer and it has been inconsistent. You want a system, not another supplier to chase.',
    );
}

// Use cases
$uc_heading  = ( $gf ? get_field( 'ind_usecases_heading' ) : '' ) ?: 'Use cases for Tech & SaaS startups';
$uc_intro    = ( $gf ? get_field( 'ind_usecases_intro' )   : '' ) ?: '';
$use_cases   = ( $gf ? get_field( 'ind_use_cases' )        : array() ) ?: array(
    array( 'ind_uc_title' => 'Competitor intelligence',    'ind_uc_description' => 'Weekly monitoring of competitor content, messaging, and positioning so you are never caught off guard by a move in your market.',    'ind_uc_url' => '/industries/tech-saas/competitor-intelligence', 'ind_uc_cta' => 'See this use case' ),
    array( 'ind_uc_title' => 'Founder brand building',     'ind_uc_description' => 'Consistent LinkedIn and thought leadership content published in your voice — building trust and authority with your target market every week.',      'ind_uc_url' => '/industries/tech-saas/founder-brand',           'ind_uc_cta' => 'See this use case' ),
    array( 'ind_uc_title' => 'Content repurposing engine', 'ind_uc_description' => 'Every long-form piece turned into a full suite of channel-specific assets — so your best thinking reaches your audience on every platform they use.', 'ind_uc_url' => '/industries/tech-saas/content-repurposing',     'ind_uc_cta' => 'See this use case' ),
    array( 'ind_uc_title' => 'Product launch content',     'ind_uc_description' => 'A complete content package for every product launch or feature release — so every update reaches the people who need to hear about it, across every channel.', 'ind_uc_url' => '/industries/tech-saas/product-launch-content', 'ind_uc_cta' => 'See this use case' ),
);

// Pricing
$pricing_heading   = ( $gf ? get_field( 'ind_pricing_heading' )   : '' ) ?: 'One flat monthly retainer. No surprises.';
$pricing_body      = ( $gf ? get_field( 'ind_pricing_body' )      : '' ) ?: 'Bluu retainers for SaaS startups start at $1,500 per month and scale to $3,500 depending on the volume of content, number of platforms, and depth of intelligence coverage you need. No project fees. No hourly billing. Everything in one predictable monthly number.';
$pricing_cta_label = ( $gf ? get_field( 'ind_pricing_cta_label' ) : '' ) ?: 'See full pricing';
$pricing_cta_url   = ( $gf ? get_field( 'ind_pricing_cta_url' )   : '' ) ?: home_url( '/pricing' );

// Closing CTA
$cta_heading   = ( $gf ? get_field( 'ind_cta_heading' )         : '' ) ?: 'Stop putting content off until next sprint.';
$cta_sub       = ( $gf ? get_field( 'ind_cta_subtext' )         : '' ) ?: 'Book a 15-minute Discovery Call. We will tell you honestly whether Bluu makes sense for your stage, your team size, and your goals. No pitch, no pressure.';
$cta_p_label   = ( $gf ? get_field( 'ind_cta_primary_label' )   : '' ) ?: 'Book a Discovery Call';
$cta_p_url     = ( $gf ? get_field( 'ind_cta_primary_url' )     : '' ) ?: home_url( '/contact' );
$cta_s_label   = ( $gf ? get_field( 'ind_cta_secondary_label' ) : '' ) ?: 'See pricing';
$cta_s_url     = ( $gf ? get_field( 'ind_cta_secondary_url' )   : '' ) ?: home_url( '/pricing' );

get_header();
?>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="industry-pg-hero" aria-label="<?php esc_attr_e( 'Industry hero', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-pg-hero__inner">

            <div class="industry-pg-hero__content animate-on-scroll">
                <div class="industry-pg-hero__tag"><?php echo esc_html( $hero_tag ); ?></div>
                <h1 class="industry-pg-hero__headline"><?php echo esc_html( $hero_hl ); ?></h1>
                <p class="industry-pg-hero__sub"><?php echo esc_html( $hero_sub ); ?></p>
                <div class="industry-pg-hero__cta">
                    <a href="<?php echo esc_url( $hero_url ); ?>" class="btn-primary btn-primary--large">
                        <?php echo esc_html( $hero_cta ); ?>
                    </a>
                    <a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="btn-outline btn-outline--large" style="border-color:rgba(255,255,255,0.5);color:#fff;">
                        <?php esc_html_e( 'See pricing', 'bluu-interactive' ); ?>
                    </a>
                </div>
            </div>

            <div class="industry-pg-hero__image">
                <img src="<?php echo $hero_img_src; ?>" alt="<?php echo $hero_img_alt; ?>" loading="eager" decoding="async">
            </div>

        </div>
    </div>
</section>

<!-- ── Pain ──────────────────────────────────────────────────────────────────── -->
<section class="industry-situation" aria-label="<?php esc_attr_e( 'The situation', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="industry-situation__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'The situation', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $pain_heading ); ?></h2>
            <?php if ( $pain_body ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $pain_body ); ?></p>
            <?php endif; ?>
        </div>

        <div class="industry-pain-grid">
            <?php foreach ( $pain_points as $point ) : ?>
                <div class="industry-pain-card animate-on-scroll">
                    <h3 class="industry-pain-card__title"><?php echo esc_html( $point['title'] ); ?></h3>
                    <p class="industry-pain-card__body"><?php echo esc_html( $point['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<!-- ── Solution ──────────────────────────────────────────────────────────────── -->
<section class="industry-approach" aria-label="<?php esc_attr_e( 'What the retainer covers', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-approach__inner">

            <div class="industry-approach__image animate-on-scroll">
                <img src="<?php echo $sol_img_src; ?>" alt="<?php echo $sol_img_alt; ?>" loading="lazy" decoding="async">
            </div>

            <div class="industry-approach__content animate-on-scroll">
                <span class="industry-section-badge"><?php esc_html_e( 'What we do', 'bluu-interactive' ); ?></span>
                <h2 class="industry-section-heading"><?php echo esc_html( $sol_heading ); ?></h2>
                <?php if ( $sol_body ) : ?>
                    <p class="industry-section-body" style="margin-bottom:var(--space-5)"><?php echo esc_html( $sol_body ); ?></p>
                <?php endif; ?>

                <div class="industry-steps">
                    <?php foreach ( $sol_items as $idx => $item ) : ?>
                        <div class="industry-step">
                            <div class="industry-step__num"><?php echo esc_html( $idx + 1 ); ?></div>
                            <div>
                                <div class="industry-step__title"><?php echo esc_html( $item['title'] ); ?></div>
                                <p class="industry-step__body"><?php echo esc_html( $item['body'] ); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

        </div>
    </div>
</section>

<!-- ── Who it's for ──────────────────────────────────────────────────────────── -->
<section class="industry-fit" aria-label="<?php esc_attr_e( 'Who this is for', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="industry-fit__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Right fit', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $who_heading ); ?></h2>
            <?php if ( $who_body ) : ?>
                <p class="industry-section-body" style="color:rgba(255,255,255,0.65)"><?php echo esc_html( $who_body ); ?></p>
            <?php endif; ?>
        </div>

        <div class="industry-fit__grid">
            <?php foreach ( $who_items as $stmt ) : ?>
                <div class="industry-fit-item animate-on-scroll">
                    <svg class="industry-fit-item__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    <p class="industry-fit-item__text"><?php echo esc_html( $stmt ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<!-- ── Use Cases Grid ────────────────────────────────────────────────────────── -->
<section class="industry-related" aria-label="<?php esc_attr_e( 'Use cases', 'bluu-interactive' ); ?>" style="background:#fff;">
    <div class="container">

        <div class="industry-related__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Specific solutions', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $uc_heading ); ?></h2>
            <?php if ( $uc_intro ) : ?>
                <p class="industry-section-body" style="max-width:640px;margin:0 auto"><?php echo esc_html( $uc_intro ); ?></p>
            <?php endif; ?>
        </div>

        <div class="industry-related__grid">
            <?php foreach ( $use_cases as $uc ) :
                $uc_title = isset( $uc['ind_uc_title'] )       ? $uc['ind_uc_title']       : '';
                $uc_desc  = isset( $uc['ind_uc_description'] ) ? $uc['ind_uc_description'] : '';
                $uc_url   = isset( $uc['ind_uc_url'] )         ? $uc['ind_uc_url']         : '#';
                $uc_cta   = isset( $uc['ind_uc_cta'] )         ? $uc['ind_uc_cta']         : 'See this use case';
            ?>
                <a href="<?php echo esc_url( $uc_url ); ?>" class="industry-related-card animate-on-scroll">
                    <div class="industry-related-card__title"><?php echo esc_html( $uc_title ); ?></div>
                    <p class="industry-related-card__desc"><?php echo esc_html( $uc_desc ); ?></p>
                    <span class="industry-related-card__arrow"><?php echo esc_html( $uc_cta ); ?> →</span>
                </a>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<!-- ── Pricing Callout ───────────────────────────────────────────────────────── -->
<section class="industry-deliverables" aria-label="<?php esc_attr_e( 'Pricing', 'bluu-interactive' ); ?>" style="background:var(--md-surface-variant);">
    <div class="container">
        <div style="max-width:680px;margin:0 auto;text-align:center;" class="animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Investment', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $pricing_heading ); ?></h2>
            <p class="industry-section-body" style="margin-bottom:var(--space-6)"><?php echo esc_html( $pricing_body ); ?></p>
            <a href="<?php echo esc_url( $pricing_cta_url ); ?>" class="btn-primary">
                <?php echo esc_html( $pricing_cta_label ); ?>
            </a>
        </div>
    </div>
</section>

<!-- ── Closing CTA ───────────────────────────────────────────────────────────── -->
<section class="industry-pg-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="animate-on-scroll">
            <h2 class="industry-pg-cta__headline"><?php echo esc_html( $cta_heading ); ?></h2>
            <p class="industry-pg-cta__sub"><?php echo esc_html( $cta_sub ); ?></p>
            <div class="industry-pg-cta__buttons">
                <a href="<?php echo esc_url( $cta_p_url ); ?>" class="btn-primary btn-primary--large btn-primary--white">
                    <?php echo esc_html( $cta_p_label ); ?>
                </a>
                <a href="<?php echo esc_url( $cta_s_url ); ?>" class="btn-outline btn-outline--large" style="border-color:rgba(255,255,255,0.6);color:#fff;">
                    <?php echo esc_html( $cta_s_label ); ?>
                </a>
            </div>
            <p style="margin-top:var(--space-5);font-size:var(--font-size-sm);color:rgba(255,255,255,0.6);">
                <?php esc_html_e( 'Free 15-minute call. No commitment required.', 'bluu-interactive' ); ?>
            </p>
        </div>
    </div>
</section>

<?php get_footer(); ?>
