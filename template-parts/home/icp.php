<?php
/**
 * Home Industries Section — Redesigned 2×2 grid
 *
 * @package bluu-interactive
 */

$icp_badge    = ( function_exists( 'get_field' ) ? get_field( 'icp_badge' )    : '' ) ?: 'Who We Serve';
$icp_headline = ( function_exists( 'get_field' ) ? get_field( 'icp_headline' ) : '' ) ?: 'Built for teams who have outgrown doing content themselves.';
$icp_body     = ( function_exists( 'get_field' ) ? get_field( 'icp_body' )     : '' ) ?: '';

$icp_verticals = ( function_exists( 'get_field' ) ? get_field( 'icp_verticals' ) : [] );

if ( empty( $icp_verticals ) ) {
    $icp_verticals = [
        [
            'icon'        => 'saas',
            'title'       => 'Tech & SaaS startups',
            'description' => 'You are building the product, managing the team, and closing deals. Content keeps getting pushed to next week. We become your content team — research, writing, publishing, and reporting — so your brand keeps moving even when you cannot give it attention.',
            'link'        => home_url( '/industries' ),
        ],
        [
            'icon'        => 'health',
            'title'       => 'Agencies & consultants',
            'description' => 'You know content drives inbound. You tell your clients that every week. But your own publishing is inconsistent and your pipeline reflects it. We run your content operation so you can focus on client work — and stop being the professional who neglects their own brand.',
            'link'        => home_url( '/industries' ),
        ],
        [
            'icon'        => 'legal',
            'title'       => 'E-commerce & DTC brands',
            'description' => 'Building a brand from scratch means managing content, social, email, and ads with one person\'s bandwidth. We give you a structured content operation so every channel is covered, every week, without the chaos.',
            'link'        => home_url( '/industries' ),
        ],
        [
            'icon'        => 'logistics',
            'title'       => 'Professional services firms',
            'description' => 'Your expertise wins clients. But if that expertise is not being published consistently, the people who need it most will never find it. We turn your knowledge into a steady stream of content that builds trust before the first conversation.',
            'link'        => home_url( '/industries' ),
        ],
    ];
}

function bluu_icp_icon_hp( $name ) {
    $icons = [
        'saas'      => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>',
        'health'    => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
        'legal'     => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
        'logistics' => '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"/></svg>',
    ];
    return isset( $icons[ $name ] ) ? $icons[ $name ] : $icons['saas'];
}
?>

<section class="industries-hp" id="who-we-serve" aria-label="<?php esc_attr_e( 'Who we serve', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="industries-hp__header animate-on-scroll">
            <div class="industries-hp__badge"><?php echo esc_html( $icp_badge ); ?></div>
            <h2 class="industries-hp__headline"><?php echo esc_html( $icp_headline ); ?></h2>
            <?php if ( $icp_body ) : ?>
                <p class="industries-hp__body"><?php echo esc_html( $icp_body ); ?></p>
            <?php endif; ?>
        </div>

        <div class="industries-hp__grid">
            <?php foreach ( $icp_verticals as $vertical ) : ?>
                <article class="industry-hp-card animate-on-scroll" aria-label="<?php echo esc_attr( $vertical['title'] ); ?>">
                    <div class="industry-hp-card__icon" aria-hidden="true">
                        <?php echo bluu_icp_icon_hp( $vertical['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <h3 class="industry-hp-card__title"><?php echo esc_html( $vertical['title'] ); ?></h3>
                    <p class="industry-hp-card__description"><?php echo esc_html( $vertical['description'] ); ?></p>
                    <a
                        href="<?php echo esc_url( $vertical['link'] ?? home_url( '/industries' ) ); ?>"
                        class="industry-hp-card__link"
                        aria-label="<?php echo esc_attr( sprintf( __( 'Learn more about %s', 'bluu-interactive' ), $vertical['title'] ) ); ?>"
                    >
                        <?php esc_html_e( 'Learn more', 'bluu-interactive' ); ?> &rarr;
                    </a>
                </article>
            <?php endforeach; ?>
        </div>

    </div>
</section>
