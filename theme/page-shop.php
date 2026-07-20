<?php
/**
 * Template Name: BluuShop Marketing Page
 *
 * Marketing page for BluuShop, assigned to /shop. Every CTA points at the
 * app (shop.bluuhq.com) — this page is the pitch, not the product.
 *
 * Scoped to what's actually shipped (Phase 1): free mobile-first
 * storefront + WhatsApp checkout. No pricing table — Starter/Pro tiers
 * and billing aren't built yet (see SHOP-TOOL-PLAN.md Phase 3), so this
 * page doesn't advertise plans nobody can actually sign up for.
 *
 * @package bluu-interactive
 */

$shop_app_url = 'https://shop.bluuhq.com';

// ── ACF fields with defaults ────────────────────────────────────────────────
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'shop_hero_headline' ) : '' ) ?: 'A free online shop, run entirely from your phone.';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'shop_hero_body' )     : '' ) ?: 'Add products with your camera, share one link, and let customers build a cart — checkout happens straight in WhatsApp, no payment processor required.';

$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'shop_cta_headline' ) : '' ) ?: 'Ready to stop selling out of your DMs?';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'shop_cta_body' )     : '' ) ?: '';

// ── How it works ─────────────────────────────────────────────────────────────
$steps = array(
    array(
        'icon' => '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M20.4 14.5L16 10 4 20"/>',
        'title' => 'Add products from your phone',
        'body'  => 'Snap a photo, type a name and price, save. No desktop, no spreadsheets, no waiting on a developer.',
    ),
    array(
        'icon' => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/>',
        'title' => 'Share your shop link',
        'body'  => 'One link for your whole catalog — drop it in your WhatsApp status, Instagram bio, or a QR code on your counter.',
    ),
    array(
        'icon' => '<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>',
        'title' => 'Customers checkout on WhatsApp',
        'body'  => 'They browse and build a cart with no login, then tap checkout — it opens WhatsApp with their order ready to send.',
    ),
);

// ── Features ─────────────────────────────────────────────────────────────────
$features = array(
    array(
        'icon'  => '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
        'title' => 'No login for shoppers',
        'body'  => 'Browsing and adding to cart is completely frictionless — customers never create an account.',
    ),
    array(
        'icon'  => '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>',
        'title' => 'Order tracking',
        'body'  => 'Every checkout logs an order in your dashboard, so you always have a record even though the deal closes on WhatsApp.',
    ),
    array(
        'icon'  => '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>',
        'title' => 'Your branding',
        'body'  => 'Cover photo, logo, tagline, and links to your Instagram, TikTok, Facebook, and X — your shop looks like your shop.',
    ),
    array(
        'icon'  => '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
        'title' => 'Free to start',
        'body'  => 'Up to 20 products, no credit card, free for as long as you need it.',
    ),
);

// ── FAQ ────────────────────────────────────────────────────────────────────
$faqs = array(
    array(
        'q' => 'Is BluuShop really free?',
        'a' => 'Yes — free for up to 20 products, no credit card required to sign up.',
    ),
    array(
        'q' => 'Do I need a website already?',
        'a' => 'No. BluuShop is your storefront — just share your shop link directly.',
    ),
    array(
        'q' => 'How does checkout actually work — do you process payments?',
        'a' => 'No payment processor is involved. Customers build a cart, then checkout opens WhatsApp with their order pre-filled as a message to you. You handle payment and delivery the way you already do — cash, bank transfer, mobile money — directly with your customer.',
    ),
    array(
        'q' => 'Can I really add products from my phone?',
        'a' => 'Yes — the whole dashboard is built mobile-first. Take a photo, type a name and price, and it\'s live.',
    ),
);

get_header();
?>

<!-- ── Shop Hero ────────────────────────────────────────────────────────────── -->
<section class="shop-hero" aria-label="<?php esc_attr_e( 'BluuShop overview', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <div class="shop-hero__inner animate-on-scroll">
            <h1 class="shop-hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>
            <p class="shop-hero__body"><?php echo bluu_text( $hero_body ); ?></p>
            <div class="shop-hero__actions">
                <a href="<?php echo esc_url( $shop_app_url . '/create' ); ?>" class="btn-primary">
                    <?php esc_html_e( 'Create your free shop', 'bluu-interactive' ); ?>
                </a>
                <a href="<?php echo esc_url( $shop_app_url . '/login' ); ?>" class="btn-outline">
                    <?php esc_html_e( 'Log in', 'bluu-interactive' ); ?>
                </a>
            </div>
            <p class="shop-hero__note"><?php esc_html_e( 'Free for your first 20 products. No credit card required.', 'bluu-interactive' ); ?></p>
        </div>
    </div>
</section>

<!-- ── How it works ─────────────────────────────────────────────────────────── -->
<section class="shop-steps" aria-label="<?php esc_attr_e( 'How BluuShop works', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="shop-steps__header animate-on-scroll">
            <h2 class="shop-steps__headline"><?php esc_html_e( 'Three steps, no middleman.', 'bluu-interactive' ); ?></h2>
        </div>
        <div class="shop-steps__grid">
            <?php foreach ( $steps as $i => $step ) : ?>
                <div class="shop-step animate-on-scroll">
                    <div class="shop-step__number"><?php echo esc_html( $i + 1 ); ?></div>
                    <div class="shop-step__icon"><?php echo bluu_mega_icon( $step['icon'], 20 ); // phpcs:ignore ?></div>
                    <h3 class="shop-step__title"><?php echo esc_html( $step['title'] ); ?></h3>
                    <p class="shop-step__body"><?php echo esc_html( $step['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── Features ─────────────────────────────────────────────────────────────── -->
<section class="shop-features" aria-label="<?php esc_attr_e( 'BluuShop features', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="shop-features__grid">
            <?php foreach ( $features as $f ) : ?>
                <div class="shop-feature-card animate-on-scroll">
                    <div class="shop-feature-card__icon"><?php echo bluu_mega_icon( $f['icon'], 20 ); // phpcs:ignore ?></div>
                    <h3 class="shop-feature-card__title"><?php echo esc_html( $f['title'] ); ?></h3>
                    <p class="shop-feature-card__body"><?php echo esc_html( $f['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── FAQ ──────────────────────────────────────────────────────────────────── -->
<section class="shop-faq" aria-label="<?php esc_attr_e( 'BluuShop frequently asked questions', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <h2 class="shop-faq__headline"><?php esc_html_e( 'Questions worth answering up front.', 'bluu-interactive' ); ?></h2>
        <div class="shop-faq__list">
            <?php foreach ( $faqs as $faq ) : ?>
                <details class="shop-faq__item">
                    <summary class="shop-faq__question">
                        <?php echo esc_html( $faq['q'] ); ?>
                        <span class="shop-faq__plus" aria-hidden="true">+</span>
                    </summary>
                    <p class="shop-faq__answer"><?php echo esc_html( $faq['a'] ); ?></p>
                </details>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── Final CTA ────────────────────────────────────────────────────────────── -->
<section class="shop-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <h2 class="shop-cta__headline"><?php echo esc_html( $cta_headline ); ?></h2>
        <?php if ( $cta_body ) : ?>
            <p class="shop-cta__body"><?php echo bluu_text( $cta_body ); ?></p>
        <?php endif; ?>
        <div class="shop-cta__actions">
            <a href="<?php echo esc_url( $shop_app_url . '/create' ); ?>" class="btn-primary">
                <?php esc_html_e( 'Create your free shop', 'bluu-interactive' ); ?>
            </a>
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-outline">
                <?php esc_html_e( 'Talk to us', 'bluu-interactive' ); ?>
            </a>
        </div>
    </div>
</section>

<?php get_footer(); ?>
