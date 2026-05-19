<?php
/**
 * Template Name: Industries Page
 *
 * @package bluu-interactive
 */

$industries_hero_headline    = function_exists( 'get_field' ) ? get_field( 'industries_hero_headline' )    : '';
$industries_hero_subheadline = function_exists( 'get_field' ) ? get_field( 'industries_hero_subheadline' ) : '';
$industries                  = function_exists( 'get_field' ) ? get_field( 'industries' )                  : array();
$bottom_cta_headline         = function_exists( 'get_field' ) ? get_field( 'industries_bottom_cta_headline' ) : '';
$bottom_cta_body             = function_exists( 'get_field' ) ? get_field( 'industries_bottom_cta_body' )     : '';
$bottom_cta_button_text      = function_exists( 'get_field' ) ? get_field( 'industries_bottom_cta_button_text' ) : '';
$bottom_cta_button_url       = function_exists( 'get_field' ) ? get_field( 'industries_bottom_cta_button_url' )  : '';

// Defaults
$industries_hero_headline    = $industries_hero_headline    ?: 'Built for Industries Where Trust Is Non-Negotiable';
$industries_hero_subheadline = $industries_hero_subheadline ?: 'We don\'t work in every industry. We go deep in four — where our expertise creates an unfair competitive advantage for our clients.';
$bottom_cta_headline         = $bottom_cta_headline         ?: 'Your Industry. Your Rules. Our Engine.';
$bottom_cta_body             = $bottom_cta_body             ?: 'We only take on clients we know we can win for. Let\'s find out if we\'re the right fit.';
$bottom_cta_button_text      = $bottom_cta_button_text      ?: 'Book a Discovery Call';
$bottom_cta_button_url       = $bottom_cta_button_url       ?: home_url( '/contact' );

if ( empty( $industries ) ) {
    $industries = array(
        array(
            'industry_icon'        => 'zap',
            'industry_name'        => 'B2B SaaS',
            'industry_tagline'     => 'Dominate your category with content that compounds.',
            'industry_challenge'   => 'SaaS companies face a brutal paradox: buyers demand thought leadership and proven ROI, yet most content teams publish generic how-to articles that never rank and never convert. Meanwhile, the sales team is winging it on outdated decks.',
            'industry_solution'    => 'We build the content infrastructure that turns your product expertise into category authority. SME-verified long-form articles capture high-intent traffic. A continuously optimized site converts it. Premium case studies close the deals.',
            'industry_stat_number' => '3×',
            'industry_stat_label'  => 'avg. pipeline increase in 12 months',
        ),
        array(
            'industry_icon'        => 'heart',
            'industry_name'        => 'Healthcare & Healthtech',
            'industry_tagline'     => 'Clinical accuracy meets demand generation.',
            'industry_challenge'   => 'Healthcare buyers are sophisticated and skeptical. Compliance constraints limit what you can say and how you can say it. A single inaccurate claim destroys years of trust. Generic content agencies don\'t understand this world.',
            'industry_solution'    => 'Every piece of content we produce for healthcare clients goes through SME and clinical review. We understand HIPAA guardrails, FDA communication standards, and what hospital procurement teams and CMOs actually read before signing.',
            'industry_stat_number' => '100%',
            'industry_stat_label'  => 'SME-verified content, always',
        ),
        array(
            'industry_icon'        => 'scale',
            'industry_name'        => 'Legal & Finance',
            'industry_tagline'     => 'Turn compliance constraints into competitive advantages.',
            'industry_challenge'   => 'Legal and financial buyers are the most discerning in B2B. They research deeply, question everything, and dismiss mediocre content instantly. Regulatory compliance isn\'t optional — it\'s the baseline.',
            'industry_solution'    => 'We produce deep-research content that demonstrates genuine expertise: regulatory analysis, decision-framework guides, and authoritative whitepapers that GCs and CFOs actually read. Then we build sales assets that reflect what your prospects actually ask in late-stage deals.',
            'industry_stat_number' => '48h',
            'industry_stat_label'  => 'premium case study turnaround',
        ),
        array(
            'industry_icon'        => 'truck',
            'industry_name'        => 'Logistics & Supply Chain',
            'industry_tagline'     => 'Prove operational expertise at every touchpoint.',
            'industry_challenge'   => 'Logistics buyers evaluate vendors on operational credibility and proven results. They\'re not reading thought leadership fluff — they\'re looking for proof you\'ve solved the specific problem they\'re facing today.',
            'industry_solution'    => 'We build proof-first content strategies: case studies that showcase real operational wins, technical content that demonstrates system knowledge, and sales assets that speak directly to the objections logistics buyers raise in procurement conversations.',
            'industry_stat_number' => '$2M–$50M',
            'industry_stat_label'  => 'ARR sweet spot for our clients',
        ),
    );
}

/**
 * Returns inline SVG for an industry icon.
 */
function bluu_get_industry_icon( $icon_name, $size = 40 ) {
    switch ( $icon_name ) {
        case 'zap':
            return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
        case 'heart':
            return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        case 'scale':
            return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 6l9-3 9 3"/><path d="M3 10l0 2a4 4 0 0 0 8 0l0-2"/><path d="M13 10l0 2a4 4 0 0 0 8 0l0-2"/></svg>';
        case 'truck':
        default:
            return '<svg width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
    }
}

// Accent colors for alternating rows
$industry_colors = array( '#1A73E8', '#137333', '#0D47A1', '#1557B0' );

get_header();
?>

<!-- Industries Hero -->
<section class="page-hero" aria-label="<?php esc_attr_e( 'Industries hero', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="page-hero__inner page-hero__inner--center">
            <div class="md-chip animate-on-scroll"><?php esc_html_e( 'Our Industries', 'bluu-interactive' ); ?></div>
            <h1 class="page-hero__headline animate-on-scroll"><?php echo esc_html( $industries_hero_headline ); ?></h1>
            <p class="page-hero__subheadline animate-on-scroll"><?php echo esc_html( $industries_hero_subheadline ); ?></p>
        </div>
    </div>
</section>

<!-- Industries Sections (alternating layout) -->
<?php foreach ( $industries as $index => $industry ) :
    $is_even      = ( $index % 2 === 0 );
    $accent_color = $industry_colors[ $index % count( $industry_colors ) ];
    $section_id   = 'industry-' . sanitize_title( $industry['industry_name'] );
?>
<section
    class="section industry-section<?php echo $is_even ? '' : ' industry-section--reversed'; ?>"
    id="<?php echo esc_attr( $section_id ); ?>"
    aria-label="<?php echo esc_attr( $industry['industry_name'] ); ?>"
    style="--industry-accent: <?php echo esc_attr( $accent_color ); ?>;"
>
    <div class="container">
        <div class="industry-section__inner">

            <!-- Visual Column -->
            <div class="industry-section__visual animate-on-scroll">
                <div class="industry-section__visual-card" style="border-color: <?php echo esc_attr( $accent_color ); ?>20; background: linear-gradient(135deg, <?php echo esc_attr( $accent_color ); ?>08 0%, <?php echo esc_attr( $accent_color ); ?>02 100%);">
                    <div class="industry-section__icon" style="color: <?php echo esc_attr( $accent_color ); ?>;" aria-hidden="true">
                        <?php echo bluu_get_industry_icon( $industry['industry_icon'], 64 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <?php if ( ! empty( $industry['industry_stat_number'] ) ) : ?>
                        <div class="industry-section__stat">
                            <span class="industry-section__stat-number" style="color: <?php echo esc_attr( $accent_color ); ?>;">
                                <?php echo esc_html( $industry['industry_stat_number'] ); ?>
                            </span>
                            <span class="industry-section__stat-label">
                                <?php echo esc_html( $industry['industry_stat_label'] ); ?>
                            </span>
                        </div>
                    <?php endif; ?>
                </div>
            </div><!-- /.industry-section__visual -->

            <!-- Content Column -->
            <div class="industry-section__content animate-on-scroll">
                <div class="md-chip md-chip--colored" style="background-color: <?php echo esc_attr( $accent_color ); ?>15; color: <?php echo esc_attr( $accent_color ); ?>;">
                    <?php echo esc_html( $industry['industry_name'] ); ?>
                </div>
                <h2 class="industry-section__tagline"><?php echo esc_html( $industry['industry_tagline'] ); ?></h2>

                <?php if ( ! empty( $industry['industry_challenge'] ) ) : ?>
                    <div class="industry-section__block">
                        <h3 class="industry-section__block-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D93025" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <?php esc_html_e( 'The Challenge', 'bluu-interactive' ); ?>
                        </h3>
                        <p class="industry-section__block-body"><?php echo esc_html( $industry['industry_challenge'] ); ?></p>
                    </div>
                <?php endif; ?>

                <?php if ( ! empty( $industry['industry_solution'] ) ) : ?>
                    <div class="industry-section__block">
                        <h3 class="industry-section__block-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="<?php echo esc_attr( $accent_color ); ?>" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <?php esc_html_e( 'The Bluu Approach', 'bluu-interactive' ); ?>
                        </h3>
                        <p class="industry-section__block-body"><?php echo esc_html( $industry['industry_solution'] ); ?></p>
                    </div>
                <?php endif; ?>

                <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary" aria-label="<?php echo esc_attr( sprintf( __( 'Discuss your %s project', 'bluu-interactive' ), $industry['industry_name'] ) ); ?>">
                    <?php esc_html_e( 'Discuss Your Situation', 'bluu-interactive' ); ?>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </a>
            </div><!-- /.industry-section__content -->

        </div><!-- /.industry-section__inner -->
    </div><!-- /.container -->
</section>
<?php endforeach; ?>

<!-- Bottom CTA -->
<section class="section section--blue cta-section" aria-label="<?php esc_attr_e( 'Industries call to action', 'bluu-interactive' ); ?>">
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
