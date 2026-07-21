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
<section class="sync-hero" aria-label="<?php esc_attr_e( 'BluuSync overview', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
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
