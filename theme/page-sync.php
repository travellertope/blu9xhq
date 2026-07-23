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
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'sync_hero_headline' ) : '' ) ?: "Move Massive Files\nBetween Servers";
$hero_subhead  = ( function_exists( 'get_field' ) ? get_field( 'sync_hero_subhead' )  : '' ) ?: 'without routing them through your machine';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'sync_hero_body' )     : '' ) ?: 'Transfer multi-gigabyte files directly between FTP and SFTP servers — or to and from Google Drive, OneDrive, and YouTube. No downloading to your machine. Just a direct stream that keeps running even after you close the tab.';

// Split headline on newline for two-line display (second line gets the accent color)
$headline_parts = array_map( 'trim', explode( "\n", $hero_headline, 2 ) );
$headline_1     = $headline_parts[0];
$headline_2     = isset( $headline_parts[1] ) ? $headline_parts[1] : '';

$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'sync_cta_headline' ) : '' ) ?: 'Ready to stop babysitting file transfers?';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'sync_cta_body' )     : '' ) ?: '';

// ── How It Works ─────────────────────────────────────────────────────────────
$steps = array(
    array(
        'icon'  => '<path d="M12 3v12"/><polyline points="7 8 12 3 17 8"/><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>',
        'title' => 'Pick a source',
        'body'  => 'Enter FTP/SFTP credentials and a file path, or connect Google Drive or OneDrive — for the file you want to copy FROM.',
    ),
    array(
        'icon'  => '<path d="M12 21V9"/><polyline points="7 16 12 21 17 16"/><path d="M21 9V5a2 2 0 00-2-2H5a2 2 0 00-2 2v4"/>',
        'title' => 'Pick a destination',
        'body'  => 'Enter FTP/SFTP credentials and a path, or connect Google Drive, OneDrive, or a YouTube channel — for where the file goes TO.',
    ),
    array(
        'icon'  => '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>',
        'title' => 'We stream directly',
        'body'  => 'Our server opens a read-stream from source and a write-stream to destination. Data flows through our servers — never touches your machine.',
    ),
    array(
        'icon'  => '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
        'title' => 'Done. File transferred.',
        'body'  => 'Get a confirmation with total bytes transferred. It keeps running even if you close the tab, and Pro emails you the moment it\'s done.',
    ),
);

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
        'price'       => '$14',
        'period'      => '/month',
        'featured'    => true,
        'cta_text'    => 'Start 14-Day Free Trial',
        'note'        => '14 days free, then $14/mo — cancel anytime',
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
        'q' => 'How does server-to-server transfer work?',
        'a' => 'We open a read-stream from your source FTP server and a write-stream to your destination server. Data flows directly between them through our relay — it never touches your local machine or browser. Think of it as piping data through a tunnel.',
    ),
    array(
        'q' => 'What\'s the maximum file size?',
        'a' => 'On the Free plan, up to 800MB. Pro supports 10GB, and Enterprise has no limit. The underlying streaming architecture can handle files of any size — it streams data directly from source to destination instead of buffering it in memory, so memory usage stays constant regardless of file size.',
    ),
    array(
        'q' => 'Are my FTP credentials safe?',
        'a' => 'Yes. Credentials are sent over HTTPS and never written to logs. By default they\'re used only for the active transfer and then discarded. If you choose to save a server, or retry a past transfer from your History, those credentials are stored encrypted at rest and only ever decrypted for your own authenticated requests.',
    ),
    array(
        'q' => 'Can I transfer between different hosting providers?',
        'a' => 'Absolutely. That\'s the primary use case. Moving files from GoDaddy to SiteGround, from Bluehost to DigitalOcean, between any two servers with FTP access — it all works the same way.',
    ),
    array(
        'q' => 'What protocols are supported?',
        'a' => 'FTP and SFTP (SSH File Transfer Protocol) are both available on every plan — SFTP isn\'t gated by tier, and we recommend it whenever your servers support it. Pro also unlocks Google Drive and OneDrive as a source or destination alongside FTP/SFTP servers, plus uploading straight to YouTube as a destination.',
    ),
    array(
        'q' => 'What happens if the transfer is interrupted?',
        'a' => 'The transfer runs on our servers independently of your browser, so closing the tab or losing your own connection doesn\'t stop it. If the connection to either server drops mid-transfer, we automatically retry with backoff — resuming from the last byte that landed for FTP/SFTP (Google Drive, OneDrive, and YouTube re-upload from scratch on retry, since none of them support that kind of resume). If every retry fails, you can re-run it with one click from your Transfer History without re-entering credentials.',
    ),
    array(
        'q' => 'How does the YouTube upload work?',
        'a' => 'Connect your YouTube channel in Saved Servers, then pick it as a transfer destination — it\'s upload-only, since there\'s no supported way to pull a video\'s raw file back off YouTube via their API. Your file uploads as a private video titled from its file name; you finish it up (thumbnail, description, visibility) in YouTube Studio. To keep things within YouTube\'s API limits, uploads are capped at 2 per day per account.',
    ),
    array(
        'q' => 'Do I need to keep the browser tab open?',
        'a' => 'No. Once you initiate the transfer, the stream runs on our server independently. You can close the tab and check the destination server later. Pro plans get an email as soon as it finishes, whether it succeeds or fails.',
    ),
);

get_header();
?>

<!-- ── Sync Hero ────────────────────────────────────────────────────────────── -->
<section class="sync-hero bluu-hero-bg" aria-label="<?php esc_attr_e( 'BluuSync overview', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="product-hero__grid">
            <div class="sync-hero__inner animate-on-scroll">
                <h1 class="sync-hero__headline">
                    <?php echo esc_html( $headline_1 ); ?>
                    <?php if ( $headline_2 ) : ?>
                        <span class="sync-hero__headline--accent"><?php echo esc_html( $headline_2 ); ?></span>
                    <?php endif; ?>
                    <?php if ( $hero_subhead ) : ?>
                        <?php echo esc_html( $hero_subhead ); ?>
                    <?php endif; ?>
                </h1>
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

            <!-- Directional source -> hub -> destination pipeline, not radial: BluuSync moves data one way, not outward in every direction. -->
            <div class="product-hero__illustration" aria-hidden="true">
                <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="132" y1="120" x2="192" y2="174" stroke="#0E7C86" stroke-width="2" opacity="0.5"/>
                    <line x1="250" y1="224" x2="329" y2="287" stroke="#0E7C86" stroke-width="2" opacity="0.5"/>
                    <polygon points="192,174 179,169 187,182" fill="#0E7C86" opacity="0.7"/>
                    <polygon points="329,287 314,284 320,298" fill="#0E7C86" opacity="0.7"/>

                    <g transform="translate(220,200)">
                        <rect x="-38" y="-38" width="76" height="76" rx="18" fill="#0a192f"/>
                        <g transform="scale(1.35) translate(-12,-12)" fill="none" stroke="#0E7C86" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:0s;">
                        <circle cx="110" cy="100" r="30" fill="#E3F3F4"/>
                        <g transform="translate(110,100) scale(0.72) translate(-12,-12)" fill="none" stroke="#0E7C86" stroke-width="2">
                            <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:1s;">
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

<!-- ── How It Works ─────────────────────────────────────────────────────────── -->
<section class="sync-steps" aria-label="<?php esc_attr_e( 'How BluuSync works', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="sync-steps__header animate-on-scroll">
            <h2 class="sync-steps__headline"><?php esc_html_e( 'How it works.', 'bluu-interactive' ); ?></h2>
            <p class="sync-steps__subhead"><?php esc_html_e( 'Four steps. No software to install. No files on your local machine.', 'bluu-interactive' ); ?></p>
        </div>
        <div class="sync-steps__grid">
            <?php foreach ( $steps as $i => $step ) : ?>
                <div class="sync-step animate-on-scroll">
                    <div class="sync-step__icon"><?php echo bluu_mega_icon( $step['icon'], 20 ); // phpcs:ignore ?></div>
                    <div class="sync-step__label"><?php echo esc_html( sprintf( /* translators: %d: step number */ __( 'STEP %d', 'bluu-interactive' ), $i + 1 ) ); ?></div>
                    <h3 class="sync-step__title"><?php echo esc_html( $step['title'] ); ?></h3>
                    <p class="sync-step__body"><?php echo esc_html( $step['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
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
