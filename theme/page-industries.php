<?php
/**
 * Template Name: Industries Page
 *
 * @package bluu-interactive
 */

get_header();
?>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="hub-hero" aria-label="Industries overview">
    <div class="container">
        <div class="hub-hero__inner animate-on-scroll">
            <div class="hub-hero__tag">Who we work with</div>
            <h1 class="hub-hero__headline">Content that works is content built for the right audience.</h1>
            <p class="hub-hero__sub">Generic content operations produce generic results. Bluu works with a focused range of industries where we understand the specific pain, the specific audience, and what consistent content actually does for a business like yours. Find your industry below. Every piece of content we produce is built to SEO and AI crawl standard — so it gets found, not just published.</p>
        </div>
    </div>
</section>

<!-- ── Primary Industries ─────────────────────────────────────────────────────── -->
<section class="hub-industries hub-industries--primary" aria-label="Primary industries">
    <div class="container">

        <div class="hub-section-header animate-on-scroll">
            <span class="hub-section-label">Where we start</span>
            <p class="hub-section-intro">These are the two industries we are most deeply focused on at this stage — where our knowledge is strongest and where we can make the biggest difference fastest.</p>
        </div>

        <div class="hub-industry-grid">

            <a href="<?php echo esc_url( home_url( '/industries/tech-saas' ) ); ?>" class="hub-industry-card hub-industry-card--primary animate-on-scroll">
                <h2 class="hub-industry-card__name">Tech &amp; SaaS startups</h2>
                <p class="hub-industry-card__desc">Founders and growth teams who need a complete content operation — research, writing, publishing, and reporting — without the overhead of building one in-house.</p>
                <span class="hub-industry-card__cta">Learn more →</span>
            </a>

            <a href="<?php echo esc_url( home_url( '/industries/agencies-consultants' ) ); ?>" class="hub-industry-card hub-industry-card--primary animate-on-scroll">
                <h2 class="hub-industry-card__name">Agencies &amp; consultants</h2>
                <p class="hub-industry-card__desc">Agency principals and independent consultants who know their own content should be generating inbound — but client work always wins. We run it for them.</p>
                <span class="hub-industry-card__cta">Learn more →</span>
            </a>

        </div>

    </div>
</section>

<!-- ── Secondary Industries ──────────────────────────────────────────────────── -->
<section class="hub-industries hub-industries--secondary" aria-label="Secondary industries">
    <div class="container">

        <div class="hub-section-header animate-on-scroll">
            <span class="hub-section-label">Also available</span>
            <p class="hub-section-intro">We also work with e-commerce brands and professional services firms. These engagements work best once we have established case studies to share — reach out and we will be honest about whether the timing is right.</p>
        </div>

        <div class="hub-industry-grid hub-industry-grid--secondary">

            <a href="<?php echo esc_url( home_url( '/industries/ecommerce-dtc' ) ); ?>" class="hub-industry-card animate-on-scroll">
                <h2 class="hub-industry-card__name">E-commerce &amp; DTC brands</h2>
                <p class="hub-industry-card__desc">DTC and e-commerce brands that need a consistent content presence across channels — brand storytelling, product launch content, email, and market intelligence.</p>
                <span class="hub-industry-card__cta">Learn more →</span>
            </a>

            <a href="<?php echo esc_url( home_url( '/industries/professional-services' ) ); ?>" class="hub-industry-card animate-on-scroll">
                <h2 class="hub-industry-card__name">Professional services</h2>
                <p class="hub-industry-card__desc">Partners, principals, and senior advisors in law, finance, and consulting who want to build authority, nurture client relationships, and stop being a well-kept secret.</p>
                <span class="hub-industry-card__cta">Learn more →</span>
            </a>

        </div>

    </div>
</section>

<!-- ── Not sure panel ─────────────────────────────────────────────────────────── -->
<section class="hub-notsure" aria-label="Not sure if we are the right fit">
    <div class="container">
        <div class="hub-notsure__inner animate-on-scroll">
            <h2 class="hub-notsure__heading">Not sure if we are the right fit?</h2>
            <p class="hub-notsure__body">Let's talk. We will tell you honestly whether Bluu makes sense for your business right now — and if the timing is not right, we will say so. No pitch, no pressure.</p>
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary btn-primary--large">Let's talk</a>
        </div>
    </div>
</section>

<!-- ── Closing CTA ───────────────────────────────────────────────────────────── -->
<section class="industry-pg-cta" aria-label="Call to action">
    <div class="container">
        <div class="animate-on-scroll">
            <h2 class="industry-pg-cta__headline">Ready to hand off your content operation?</h2>
            <p class="industry-pg-cta__sub">Let's talk — honest, no pressure, and specific to your industry and situation.</p>
            <div class="industry-pg-cta__buttons">
                <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary btn-primary--large btn-primary--white">Let's talk</a>
                <a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="industry-btn-outline--cta">See pricing</a>
            </div>
        </div>
    </div>
</section>

<?php get_footer(); ?>
