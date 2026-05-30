<?php
/**
 * Home Solution Section — "One Team, Total Growth" unified card
 *
 * @package bluu-interactive
 */

$solution_badge    = ( function_exists( 'get_field' ) ? get_field( 'solution_badge' )    : '' ) ?: 'The Solution';
$solution_headline = ( function_exists( 'get_field' ) ? get_field( 'solution_headline' ) : '' ) ?: 'One Retainer. Everything Running.';
$solution_body     = ( function_exists( 'get_field' ) ? get_field( 'solution_body' )     : '' ) ?: "We've eliminated the gap between research, content, and publishing. One retainer covers your entire content operation — built for SMEs, startups, and agencies who need it done right.";

$solution_sidebar_title = ( function_exists( 'get_field' ) ? get_field( 'solution_sidebar_title' ) : '' ) ?: 'The Full Content Engine';
$solution_sidebar_body  = ( function_exists( 'get_field' ) ? get_field( 'solution_sidebar_body' )  : '' ) ?: 'Instead of briefing three different vendors and chasing deliverables, Bluu runs your research, content, publishing, and reporting in one connected motion — every month, without the management overhead.';
$solution_sidebar_cta   = ( function_exists( 'get_field' ) ? get_field( 'solution_sidebar_cta_text' ) : '' ) ?: 'Explore the Framework';
$solution_sidebar_url   = ( function_exists( 'get_field' ) ? get_field( 'solution_sidebar_cta_url' )  : '' ) ?: home_url( '/pricing' );

$solution_features = [
    [
        'icon'   => 'monitor',
        'title'  => 'Research & Intelligence',
        'items'  => [
            'Weekly competitor monitoring.',
            'Audience & sentiment insights.',
            'Trend radar for your niche.',
        ],
    ],
    [
        'icon'   => 'trending-up',
        'title'  => 'Content That Actually Works',
        'items'  => [
            'AI-assisted, strategist-reviewed.',
            'Blog, LinkedIn, newsletter, social — all formats.',
        ],
    ],
    [
        'icon'   => 'briefcase',
        'title'  => 'Full-Service Publishing',
        'items'  => [
            'We publish to your website, socials & newsletter.',
            'One content piece repurposed across every channel.',
        ],
    ],
    [
        'icon'   => 'users',
        'title'  => 'Measurable Monthly Outcomes',
        'items'  => [
            'Monthly performance reports.',
            'Quarterly case studies & use cases (Growth & Premium).',
        ],
    ],
];

function bluu_solution_feature_icon( $name ) {
    $icons = [
        'monitor'     => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
        'trending-up' => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>',
        'briefcase'   => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
        'users'       => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
    ];
    return isset( $icons[ $name ] ) ? $icons[ $name ] : $icons['briefcase'];
}
?>

<section class="solution-section" id="solution" aria-label="<?php esc_attr_e( 'Our unified solution', 'bluu-interactive' ); ?>">
    <div class="container">

        <!-- Section Header -->
        <div class="solution-section__header animate-on-scroll">
            <div class="solution-section__badge"><?php echo esc_html( $solution_badge ); ?></div>
            <h2 class="solution-section__headline"><?php echo esc_html( $solution_headline ); ?></h2>
            <p class="solution-section__body"><?php echo esc_html( $solution_body ); ?></p>
        </div>

        <!-- Unified Solution Card -->
        <div class="solution-card animate-on-scroll">
            <div class="solution-card__inner">

                <!-- Left sidebar: narrative -->
                <div class="solution-card__sidebar">
                    <h3 class="solution-card__sidebar-title"><?php echo esc_html( $solution_sidebar_title ); ?></h3>
                    <p class="solution-card__sidebar-body"><?php echo esc_html( $solution_sidebar_body ); ?></p>
                    <a href="<?php echo esc_url( $solution_sidebar_url ); ?>" class="solution-card__sidebar-cta">
                        <?php echo esc_html( $solution_sidebar_cta ); ?>
                    </a>
                </div>

                <!-- Right features grid -->
                <div class="solution-card__features">
                    <?php foreach ( $solution_features as $feature ) : ?>
                        <div class="solution-feature">
                            <div class="solution-feature__header">
                                <div class="solution-feature__icon">
                                    <?php echo bluu_solution_feature_icon( $feature['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                                </div>
                                <h4 class="solution-feature__title"><?php echo esc_html( $feature['title'] ); ?></h4>
                            </div>
                            <ul class="solution-feature__list">
                                <?php foreach ( $feature['items'] as $item ) : ?>
                                    <li class="solution-feature__item"><?php echo esc_html( $item ); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endforeach; ?>
                </div>

            </div><!-- /.solution-card__inner -->
        </div><!-- /.solution-card -->

    </div><!-- /.container -->
</section>
