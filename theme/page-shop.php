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
<section class="shop-hero bluu-hero-bg" aria-label="<?php esc_attr_e( 'BluuShop overview', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="product-hero__grid">
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

            <div class="product-hero__illustration" aria-hidden="true">
                <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M220 200 Q150 140 110 100" stroke="#1F9D55" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q300 130 348 92" stroke="#1F9D55" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q150 260 96 308" stroke="#1F9D55" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q300 265 352 306" stroke="#1F9D55" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>

                    <circle class="hero-pulse" cx="220" cy="200" r="72" stroke="#1F9D55" stroke-width="1.5" style="transform-origin:220px 200px;"/>
                    <circle class="hero-pulse hero-pulse--delay" cx="220" cy="200" r="96" stroke="#1F9D55" stroke-width="1.5" style="transform-origin:220px 200px;"/>

                    <g transform="translate(220,200)">
                        <rect x="-40" y="-40" width="80" height="80" rx="18" fill="#0a192f"/>
                        <g transform="scale(1.5) translate(-12,-12)" fill="none" stroke="#1F9D55" stroke-width="1.8">
                            <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:0s;">
                        <circle cx="110" cy="100" r="30" fill="#E6F4EC"/>
                        <g transform="translate(110,100) scale(0.72) translate(-12,-12)" fill="none" stroke="#1F9D55" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M20.4 14.5L16 10 4 20"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:0.6s;">
                        <circle cx="348" cy="92" r="30" fill="#E6F4EC"/>
                        <g transform="translate(348,92) scale(0.72) translate(-12,-12)" fill="none" stroke="#1F9D55" stroke-width="2">
                            <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:1.2s;">
                        <circle cx="96" cy="308" r="30" fill="#E6F4EC"/>
                        <g transform="translate(96,308) scale(0.72) translate(-12,-12)" fill="none" stroke="#1F9D55" stroke-width="2">
                            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                        </g>
                    </g>

                    <g class="scan-hero__ill-node" style="animation-delay:1.8s;">
                        <circle cx="352" cy="306" r="30" fill="#E6F4EC"/>
                        <g transform="translate(352,306) scale(0.72) translate(-12,-12)" fill="none" stroke="#1F9D55" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
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
                <div class="pm-chrome__bar">shop.bluuhq.com/lumo-retail</div>
            </div>
            <div class="shop-mockup">
                <div class="shop-mockup__cover">
                    <div class="shop-mockup__avatar">LR</div>
                </div>
                <div class="shop-mockup__head">
                    <div>
                        <div class="shop-mockup__name">Lumo Retail</div>
                        <div class="shop-mockup__tagline">Home fragrance &amp; candles, made in Lagos</div>
                    </div>
                    <span class="shop-mockup__cart">🛒 Cart · 3</span>
                </div>
                <div class="shop-mockup__grid">
                    <div class="shop-mockup-product">
                        <div class="shop-mockup-product__img" style="background:#E6F4EC;">🕯️</div>
                        <div class="shop-mockup-product__body"><div class="shop-mockup-product__name">Amber Musk Candle</div><div class="shop-mockup-product__price">₦12,500</div></div>
                    </div>
                    <div class="shop-mockup-product">
                        <div class="shop-mockup-product__img" style="background:#EAF0FF;">🧴</div>
                        <div class="shop-mockup-product__body"><div class="shop-mockup-product__name">Room Mist — Bergamot</div><div class="shop-mockup-product__price">₦7,000</div></div>
                    </div>
                    <div class="shop-mockup-product">
                        <div class="shop-mockup-product__img" style="background:#FBF1DE;">🪔</div>
                        <div class="shop-mockup-product__body"><div class="shop-mockup-product__name">Diffuser Set</div><div class="shop-mockup-product__price">₦18,000</div></div>
                    </div>
                    <div class="shop-mockup-product">
                        <div class="shop-mockup-product__img" style="background:#E3F3F4;">🎁</div>
                        <div class="shop-mockup-product__body"><div class="shop-mockup-product__name">Gift Bundle</div><div class="shop-mockup-product__price">₦25,000</div></div>
                    </div>
                </div>
                <div class="shop-mockup__checkout">
                    <div>
                        <div class="shop-mockup__checkout-text">Checkout on WhatsApp</div>
                        <div class="shop-mockup__checkout-sub">No login. Order opens as a message to Lumo Retail.</div>
                    </div>
                    <span class="shop-mockup__checkout-btn">Send order →</span>
                </div>
            </div>
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
