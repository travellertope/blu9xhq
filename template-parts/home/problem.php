<?php
/**
 * Home Problem Section — Redesigned
 *
 * @package bluu-interactive
 */

$problem_badge    = ( function_exists( 'get_field' ) ? get_field( 'problem_badge' )    : '' ) ?: 'The Problem';
$problem_headline = ( function_exists( 'get_field' ) ? get_field( 'problem_headline' ) : '' ) ?: 'Inconsistency Is Costing You Clients';
$problem_body     = ( function_exists( 'get_field' ) ? get_field( 'problem_body' )     : '' ) ?: 'Most SMEs and startups are paying for content that never connects — no strategy behind it, no consistency across channels, and no one accountable for the results.';
$problem_items    = ( function_exists( 'get_field' ) ? get_field( 'problem_items' )    : [] );

if ( empty( $problem_items ) ) {
    $problem_items = [
        [
            'icon'        => 'alert',
            'title'       => 'No Strategic Intelligence',
            'description' => "You're producing content with no real insight into what your competitors are doing, what your audience actually wants, or what's shifting in your market.",
        ],
        [
            'icon'        => 'trend-down',
            'title'       => 'Generic Content That Goes Nowhere',
            'description' => 'Posts go out, nothing comes back. No engagement, no leads, no compounding value — because content without strategy is just noise.',
        ],
        [
            'icon'        => 'lock',
            'title'       => 'No One Owns the Publishing',
            'description' => 'Content gets written but never published consistently. It sits in Notion, Google Docs, or someone\'s inbox while your channels go quiet.',
        ],
    ];
}

$icons = [
    'alert'      => '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
    'trend-down' => '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>',
    'lock'       => '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>',
];
?>

<section class="problem-section" id="problem" aria-label="<?php esc_attr_e( 'The problem we solve', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="problem-section__header animate-on-scroll">
            <div class="problem-section__badge"><?php echo esc_html( $problem_badge ); ?></div>
            <h2 class="problem-section__headline"><?php echo esc_html( $problem_headline ); ?></h2>
            <p class="problem-section__body"><?php echo esc_html( $problem_body ); ?></p>
        </div>

        <div class="problem-section__grid">
            <?php foreach ( $problem_items as $item ) :
                $icon_key = $item['icon'] ?? 'alert';
                $icon_svg = $icons[ $icon_key ] ?? $icons['alert'];
            ?>
                <div class="problem-card animate-on-scroll">
                    <div class="problem-card__icon" aria-hidden="true">
                        <?php echo $icon_svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <h3 class="problem-card__title"><?php echo esc_html( $item['title'] ); ?></h3>
                    <p class="problem-card__description"><?php echo esc_html( $item['description'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>
