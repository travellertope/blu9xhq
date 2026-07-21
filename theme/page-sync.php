<?php
/**
 * Template Name: BluuSync Marketing Page
 * Template Post Type: page
 *
 * Marketing page for BluuSync, assigned to /sync. sync.bluuhq.com itself
 * is the app (register/login/dashboard) — this page is the public pitch,
 * with every CTA pointing back to the app.
 *
 * @package bluu-interactive
 */

$sync_app_url = 'https://sync.bluuhq.com';

// ── ACF fields with defaults ────────────────────────────────────────────────
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'sync_hero_headline' ) : '' ) ?: 'Move massive files server-to-server, without routing them through your machine.';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'sync_hero_body' )     : '' ) ?: 'BluuSync streams files directly between FTP, SFTP, Google Drive, OneDrive, and YouTube — no local download, no size-limit headaches, and credentials that are never stored.';

$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'sync_cta_headline' ) : '' ) ?: 'Ready to stop babysitting file transfers?';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'sync_cta_body' )     : '' ) ?: '';

// ── Features ─────────────────────────────────────────────────────────────────
$features = array(
    array(
        'icon'  => '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
        'title' => 'Server-to-server direct',
        'body'  => 'Data streams directly between FTP and SFTP servers. Your browser just kicks it off — nothing is downloaded to your machine.',
    ),
    array(
        'icon'  => '<line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>',
        'title' => 'Up to 10GB per file',
        'body'  => 'Built for massive files. Backups, databases, media archives — transfer gigabytes without breaking a sweat (800MB on Free, 10GB on Pro).',
    ),
    array(
        'icon'  => '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        'title' => 'Set it & forget it',
        'body'  => 'Start the transfer and walk away. It keeps running on our servers even if you close the tab — check back for a completion confirmation.',
    ),
    array(
        'icon'  => '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
        'title' => 'Credentials never stored',
        'body'  => 'FTP/SFTP credentials are used for the active session only by default. Nothing is written to disk or logged. Ever.',
    ),
    array(
        'icon'  => '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
        'title' => 'Chunked streaming',
        'body'  => 'Data streams straight from source to destination in a continuous pipe instead of being buffered in memory, so file size isn\'t limited by available RAM.',
    ),
    array(
        'icon'  => '<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>',
        'title' => 'Cloud & video destinations',
        'body'  => 'Pro connects Google Drive and OneDrive as a source or destination alongside FTP/SFTP, plus one-click uploads straight to YouTube.',
    ),
);

// ── Pricing ──────────────────────────────────────────────────────────────────
$plans = array(
    array(
        'name'        => 'Free',
        'description' => 'Perfect for one-off migrations',
        'price'       => '$0',
        'period'      => 'forever',
        'featured'    => false,
        'cta_text'    => 'Get Started',
        'highlights'  => array(
            '3 transfers per month',
            'Up to 800MB per file',
            'FTP + SFTP support',
            'Transfer history with one-click retry',
        ),
    ),
    array(
        'name'        => 'Pro',
        'description' => 'For developers & sysadmins',
        'price'       => '$19',
        'period'      => '/month',
        'featured'    => true,
        'cta_text'    => 'Start 14-Day Free Trial',
        'note'        => '14 days free, then $19/mo — cancel anytime',
        'highlights'  => array(
            'Unlimited transfers',
            'Up to 10GB per file',
            'Google Drive & OneDrive as source or destination',
            'Upload straight to YouTube',
            'Email notifications on completion',
            'Webhook notifications',
        ),
    ),
    array(
        'name'        => 'Enterprise',
        'description' => 'For agencies & hosting companies',
        'price'       => '$99',
        'period'      => '/month',
        'featured'    => false,
        'cta_text'    => 'Contact Sales',
        'highlights'  => array(
            'Everything in Pro',
            'Unlimited file size',
            'Concurrent transfers',
            'API access',
            'Team accounts',
            'Dedicated support',
            'Custom integrations',
        ),
    ),
);

// ── FAQ ────────────────────────────────────────────────────────────────────
$faqs = array(
    array(
        'q' => 'Do the files ever touch my computer?',
        'a' => 'No. Your browser only starts the job — BluuSync\'s servers stream the data directly from the source to the destination.',
    ),
    array(
        'q' => 'What happens to my FTP/SFTP credentials?',
        'a' => 'By default they\'re used for the active session only and are never written to disk or logged.',
    ),
    array(
        'q' => 'What\'s the largest file I can transfer?',
        'a' => '800MB on the Free plan, 10GB on Pro, and unlimited file size on Enterprise.',
    ),
    array(
        'q' => 'Can I trigger transfers from my own scripts?',
        'a' => 'Yes — Enterprise includes API access so you can kick off transfers programmatically from your own pipelines.',
    ),
);

get_header();
?>

<!-- ── Sync Hero ────────────────────────────────────────────────────────────── -->
<section class="sync-hero bluu-hero-bg" aria-label="<?php esc_attr_e( 'BluuSync overview', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="product-hero__grid">
            <div class="sync-hero__inner animate-on-scroll">
                <h1 class="sync-hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>
                <p class="sync-hero__body"><?php echo bluu_text( $hero_body ); ?></p>
                <div class="sync-hero__actions">
                    <a href="<?php echo esc_url( $sync_app_url . '/register' ); ?>" class="btn-primary">
                        <?php esc_html_e( 'Create free account', 'bluu-interactive' ); ?>
                    </a>
                    <a href="<?php echo esc_url( $sync_app_url . '/login' ); ?>" class="btn-outline">
                        <?php esc_html_e( 'Log in', 'bluu-interactive' ); ?>
                    </a>
                </div>
                <p class="sync-hero__note"><?php esc_html_e( 'Free forever for occasional transfers. No credit card required.', 'bluu-interactive' ); ?></p>
            </div>

            <div class="product-hero__illustration" aria-hidden="true">
                <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M220 200 Q150 140 110 100" stroke="#0E7C86" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q300 130 348 92" stroke="#0E7C86" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q150 260 96 308" stroke="#0E7C86" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q300 265 352 306" stroke="#0E7C86" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>

                    <circle class="hero-pulse" cx="220" cy="200" r="72" stroke="#0E7C86" stroke-width="1.5" style="transform-origin:220px 200px;"/>
                    <circle class="hero-pulse hero-pulse--delay" cx="220" cy="200" r="96" stroke="#0E7C86" stroke-width="1.5" style="transform-origin:220px 200px;"/>

                    <g transform="translate(220,200)">
                        <path d="M0 -46L40 -23V23L0 46L-40 23V-23L0 -46Z" fill="#0a192f"/>
                        <circle cx="0" cy="0" r="15" fill="#0E7C86"/>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:0s;">
                        <circle cx="110" cy="100" r="30" fill="#E3F3F4"/>
                        <g transform="translate(110,100) scale(0.72) translate(-12,-12)" fill="none" stroke="#0E7C86" stroke-width="2">
                            <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:0.6s;">
                        <circle cx="348" cy="92" r="30" fill="#E3F3F4"/>
                        <g transform="translate(348,92) scale(0.72) translate(-12,-12)" fill="none" stroke="#0E7C86" stroke-width="2">
                            <line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:1.2s;">
                        <circle cx="96" cy="308" r="30" fill="#E3F3F4"/>
                        <g transform="translate(96,308) scale(0.72) translate(-12,-12)" fill="none" stroke="#0E7C86" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:1.8s;">
                        <circle cx="352" cy="306" r="30" fill="#E3F3F4"/>
                        <g transform="translate(352,306) scale(0.72) translate(-12,-12)" fill="none" stroke="#0E7C86" stroke-width="2">
                            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
                        </g>
                    </g>
                </svg>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="pm-frame pm-frame--hero animate-on-scroll">
            <div class="pm-chrome">
                <div class="pm-chrome__dots"><span></span><span></span><span></span></div>
                <div class="pm-chrome__bar">sync.bluuhq.com/transfer/new</div>
            </div>
            <div class="sync-mockup">
                <div class="sync-mockup-endpoints">
                    <div class="sync-mockup-endpoint">
                        <div class="sync-mockup-endpoint__icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/></svg></div>
                        <div><div class="sync-mockup-endpoint__label">Source</div><div class="sync-mockup-endpoint__value">SFTP — media-archive.co</div></div>
                    </div>
                    <div class="sync-mockup-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
                    <div class="sync-mockup-endpoint">
                        <div class="sync-mockup-endpoint__icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg></div>
                        <div><div class="sync-mockup-endpoint__label">Destination</div><div class="sync-mockup-endpoint__value">Google Drive — Backups</div></div>
                    </div>
                </div>
                <div class="sync-mockup-progress-card">
                    <div class="sync-mockup-progress-top">
                        <span class="sync-mockup-progress-name">quarterly-backup-2026-q2.tar.gz</span>
                        <span class="sync-mockup-progress-pct">63%</span>
                    </div>
                    <div class="sync-mockup-progress-track"><div class="sync-mockup-progress-fill"></div></div>
                    <div class="sync-mockup-progress-meta">
                        <span>3.8 GB of 6.1 GB</span>
                        <span>~4 min remaining</span>
                    </div>
                </div>
                <div class="sync-mockup-history">
                    <div class="sync-mockup-history-row">
                        <span class="sync-mockup-history-name">product-photos-master.zip</span>
                        <span class="sync-mockup-history-size">2.1 GB</span>
                        <span class="sync-mockup-badge sync-mockup-badge--done">Done</span>
                    </div>
                    <div class="sync-mockup-history-row">
                        <span class="sync-mockup-history-name">client-videos-raw.mov</span>
                        <span class="sync-mockup-history-size">9.4 GB</span>
                        <span class="sync-mockup-badge sync-mockup-badge--done">Done</span>
                    </div>
                    <div class="sync-mockup-history-row">
                        <span class="sync-mockup-history-name">site-db-export.sql.gz</span>
                        <span class="sync-mockup-history-size">640 MB</span>
                        <span class="sync-mockup-badge sync-mockup-badge--done">Done</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ── Features ─────────────────────────────────────────────────────────────── -->
<section class="sync-features" aria-label="<?php esc_attr_e( 'What\'s inside BluuSync', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="sync-features__header animate-on-scroll">
            <h2 class="sync-features__headline"><?php esc_html_e( 'Built for heavy lifting.', 'bluu-interactive' ); ?></h2>
        </div>
        <div class="sync-features__grid">
            <?php foreach ( $features as $f ) : ?>
                <div class="sync-feature-card animate-on-scroll">
                    <div class="sync-feature-card__icon"><?php echo bluu_mega_icon( $f['icon'], 20 ); // phpcs:ignore ?></div>
                    <h3 class="sync-feature-card__title"><?php echo esc_html( $f['title'] ); ?></h3>
                    <p class="sync-feature-card__body"><?php echo esc_html( $f['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── Pricing ──────────────────────────────────────────────────────────────── -->
<section class="sync-pricing" aria-label="<?php esc_attr_e( 'BluuSync pricing', 'bluu-interactive' ); ?>" id="pricing">
    <div class="container">
        <div class="sync-pricing__header animate-on-scroll">
            <h2 class="sync-pricing__headline"><?php esc_html_e( 'Simple, honest pricing.', 'bluu-interactive' ); ?></h2>
        </div>
        <div class="sync-pricing__grid">
            <?php foreach ( $plans as $plan ) :
                $card_class = 'sync-plan' . ( $plan['featured'] ? ' sync-plan--featured' : '' );
                $is_enterprise = ( 'Enterprise' === $plan['name'] );
                $cta_href = $is_enterprise
                    ? 'mailto:sales@bluuhq.com?subject=BluuSync%20Enterprise'
                    : $sync_app_url . '/register';
            ?>
                <div class="<?php echo esc_attr( $card_class ); ?>">
                    <h3 class="sync-plan__name"><?php echo esc_html( $plan['name'] ); ?></h3>
                    <p class="sync-plan__desc"><?php echo esc_html( $plan['description'] ); ?></p>
                    <div class="sync-plan__price">
                        <span class="sync-plan__price-amount"><?php echo esc_html( $plan['price'] ); ?></span>
                        <span class="sync-plan__price-period"><?php echo esc_html( $plan['period'] ); ?></span>
                    </div>
                    <?php if ( ! empty( $plan['note'] ) ) : ?>
                        <p class="sync-plan__note"><?php echo esc_html( $plan['note'] ); ?></p>
                    <?php endif; ?>
                    <ul class="sync-plan__features">
                        <?php foreach ( $plan['highlights'] as $item ) : ?>
                            <li class="sync-plan__feature">
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                <?php echo esc_html( $item ); ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                    <a href="<?php echo esc_url( $cta_href ); ?>"
                       class="<?php echo $plan['featured'] ? 'btn-primary' : 'btn-outline'; ?> sync-plan__cta">
                        <?php echo esc_html( $plan['cta_text'] ); ?>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── FAQ ──────────────────────────────────────────────────────────────────── -->
<section class="sync-faq" aria-label="<?php esc_attr_e( 'BluuSync frequently asked questions', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <h2 class="sync-faq__headline"><?php esc_html_e( 'Questions worth answering up front.', 'bluu-interactive' ); ?></h2>
        <div class="sync-faq__list">
            <?php foreach ( $faqs as $faq ) : ?>
                <details class="sync-faq__item">
                    <summary class="sync-faq__question">
                        <?php echo esc_html( $faq['q'] ); ?>
                        <span class="sync-faq__plus" aria-hidden="true">+</span>
                    </summary>
                    <p class="sync-faq__answer"><?php echo esc_html( $faq['a'] ); ?></p>
                </details>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── Final CTA ────────────────────────────────────────────────────────────── -->
<section class="sync-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <h2 class="sync-cta__headline"><?php echo esc_html( $cta_headline ); ?></h2>
        <?php if ( $cta_body ) : ?>
            <p class="sync-cta__body"><?php echo bluu_text( $cta_body ); ?></p>
        <?php endif; ?>
        <div class="sync-cta__actions">
            <a href="<?php echo esc_url( $sync_app_url . '/register' ); ?>" class="btn-primary">
                <?php esc_html_e( 'Create free account', 'bluu-interactive' ); ?>
            </a>
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-outline">
                <?php esc_html_e( 'Talk to us', 'bluu-interactive' ); ?>
            </a>
        </div>
    </div>
</section>

<?php get_footer(); ?>
