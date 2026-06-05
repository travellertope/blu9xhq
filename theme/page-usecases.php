<?php
/**
 * Template Name: Use Cases Archive
 *
 * @package bluu-interactive
 */

// All 16 use cases with industry filter tags
$all_use_cases = array(

    // Tech & SaaS
    array(
        'title'    => 'Competitor Intelligence',
        'industry' => 'tech-saas',
        'ind_label'=> 'Tech & SaaS',
        'desc'     => 'Weekly monitoring of competitor content, messaging, and positioning so you are never caught off guard by a move in your market.',
        'url'      => '/industries/tech-saas/competitor-intelligence',
    ),
    array(
        'title'    => 'Founder Brand Building',
        'industry' => 'tech-saas',
        'ind_label'=> 'Tech & SaaS',
        'desc'     => 'Consistent LinkedIn and thought leadership content published in your voice — building trust and authority with your target market every week.',
        'url'      => '/industries/tech-saas/founder-brand',
    ),
    array(
        'title'    => 'Content Repurposing Engine',
        'industry' => 'tech-saas',
        'ind_label'=> 'Tech & SaaS',
        'desc'     => 'Every long-form piece turned into a full suite of channel-specific assets — so your best thinking reaches your audience on every platform they use.',
        'url'      => '/industries/tech-saas/content-repurposing',
    ),
    array(
        'title'    => 'Product Launch Content',
        'industry' => 'tech-saas',
        'ind_label'=> 'Tech & SaaS',
        'desc'     => 'A complete content package for every product launch or feature release — blog post, email, LinkedIn, X thread, and social captions — ready before the launch date.',
        'url'      => '/industries/tech-saas/product-launch-content',
    ),

    // Agencies & Consultants
    array(
        'title'    => 'Own-Brand Content',
        'industry' => 'agencies-consultants',
        'ind_label'=> 'Agencies & Consultants',
        'desc'     => 'A consistent content presence for your agency or consultancy — so your name is visible in the market even when client work is at full capacity.',
        'url'      => '/industries/agencies-consultants/own-brand-content',
    ),
    array(
        'title'    => 'Thought Leadership Programme',
        'industry' => 'agencies-consultants',
        'ind_label'=> 'Agencies & Consultants',
        'desc'     => 'A consistent stream of opinion, insight, and methodology content that builds category authority and keeps your firm front of mind with ideal buyers.',
        'url'      => '/industries/agencies-consultants/thought-leadership',
    ),
    array(
        'title'    => 'White-Label Production',
        'industry' => 'agencies-consultants',
        'ind_label'=> 'Agencies & Consultants',
        'desc'     => 'High-quality content produced under your agency\'s name — delivered on time, to brief, and ready for your clients without attribution to Bluu.',
        'url'      => '/industries/agencies-consultants/white-label-production',
    ),
    array(
        'title'    => 'Service Launch Content',
        'industry' => 'agencies-consultants',
        'ind_label'=> 'Agencies & Consultants',
        'desc'     => 'Everything you need to announce and market a new service — positioning, email, LinkedIn, and supporting content — delivered before your go-live date.',
        'url'      => '/industries/agencies-consultants/service-launch',
    ),

    // E-commerce & DTC
    array(
        'title'    => 'Brand Storytelling',
        'industry' => 'ecommerce-dtc',
        'ind_label'=> 'E-commerce & DTC',
        'desc'     => 'A consistent brand narrative across every channel — editorial, social, and email — that builds loyalty and gives your brand a voice beyond the product.',
        'url'      => '/industries/ecommerce-dtc/brand-storytelling',
    ),
    array(
        'title'    => 'Product Content',
        'industry' => 'ecommerce-dtc',
        'ind_label'=> 'E-commerce & DTC',
        'desc'     => 'Compelling product descriptions, category copy, and editorial content that informs, persuades, and converts across your store and owned channels.',
        'url'      => '/industries/ecommerce-dtc/product-content',
    ),
    array(
        'title'    => 'Email & Newsletter',
        'industry' => 'ecommerce-dtc',
        'ind_label'=> 'E-commerce & DTC',
        'desc'     => 'Ongoing email content — welcome flows, post-purchase sequences, and newsletters — that keeps your customers engaged and drives repeat purchase.',
        'url'      => '/industries/ecommerce-dtc/email-newsletter',
    ),
    array(
        'title'    => 'Market Intelligence',
        'industry' => 'ecommerce-dtc',
        'ind_label'=> 'E-commerce & DTC',
        'desc'     => 'Regular monitoring of trends, competitor moves, and customer sentiment so your content strategy stays ahead of the market.',
        'url'      => '/industries/ecommerce-dtc/market-intelligence',
    ),

    // Professional Services
    array(
        'title'    => 'Expert Commentary',
        'industry' => 'professional-services',
        'ind_label'=> 'Professional Services',
        'desc'     => 'Timely, authoritative commentary on developments in your field — published consistently so your firm is seen as the go-to voice in your category.',
        'url'      => '/industries/professional-services/expert-commentary',
    ),
    array(
        'title'    => 'Client Education Content',
        'industry' => 'professional-services',
        'ind_label'=> 'Professional Services',
        'desc'     => 'Long-form guides, explainers, and FAQs that answer your buyers\' most important questions and position your firm as the trusted expert before the first call.',
        'url'      => '/industries/professional-services/client-education',
    ),
    array(
        'title'    => 'Referral & Trust Content',
        'industry' => 'professional-services',
        'ind_label'=> 'Professional Services',
        'desc'     => 'Case studies, testimonial frameworks, and proof content that gives your existing clients the language to refer you and gives new prospects confidence to engage.',
        'url'      => '/industries/professional-services/referral-trust-content',
    ),
    array(
        'title'    => 'LinkedIn Authority',
        'industry' => 'professional-services',
        'ind_label'=> 'Professional Services',
        'desc'     => 'Consistent personal brand content for partners and senior advisors — building individual visibility that feeds firm reputation and generates inbound enquiries.',
        'url'      => '/industries/professional-services/linkedin-authority',
    ),
);

$filters = array(
    'all'                    => 'All use cases',
    'tech-saas'              => 'Tech & SaaS',
    'agencies-consultants'   => 'Agencies & Consultants',
    'ecommerce-dtc'          => 'E-commerce & DTC',
    'professional-services'  => 'Professional Services',
);

get_header();
?>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="uca-hero" aria-label="Use cases overview">
    <div class="container">
        <div class="uca-hero__inner animate-on-scroll">
            <div class="uca-hero__tag">What we do</div>
            <h1 class="uca-hero__headline">Every use case. Every industry.</h1>
            <p class="uca-hero__sub">Bluu runs content operations across a focused range of industries. Browse all 16 use cases below — or filter by your industry to see what we do for businesses like yours.</p>
        </div>
    </div>
</section>

<!-- ── Filter + Grid ──────────────────────────────────────────────────────────── -->
<section class="uca-archive" aria-label="Use case archive">
    <div class="container">

        <!-- Filter bar -->
        <div class="uca-filters" role="tablist" aria-label="Filter use cases by industry">
            <?php foreach ( $filters as $key => $label ) : ?>
                <button
                    class="uca-filter-btn<?php echo $key === 'all' ? ' is-active' : ''; ?>"
                    data-filter="<?php echo esc_attr( $key ); ?>"
                    role="tab"
                    aria-selected="<?php echo $key === 'all' ? 'true' : 'false'; ?>"
                >
                    <?php echo esc_html( $label ); ?>
                </button>
            <?php endforeach; ?>
        </div>

        <!-- Cards grid -->
        <div class="uca-grid" id="uca-grid">
            <?php foreach ( $all_use_cases as $uc ) : ?>
                <a
                    href="<?php echo esc_url( home_url( $uc['url'] ) ); ?>"
                    class="uca-card animate-on-scroll"
                    data-industry="<?php echo esc_attr( $uc['industry'] ); ?>"
                >
                    <div class="uca-card__tag"><?php echo esc_html( $uc['ind_label'] ); ?></div>
                    <h2 class="uca-card__title"><?php echo esc_html( $uc['title'] ); ?></h2>
                    <p class="uca-card__desc"><?php echo esc_html( $uc['desc'] ); ?></p>
                    <span class="uca-card__cta">See this use case →</span>
                </a>
            <?php endforeach; ?>
        </div>

        <!-- Empty state (shown via JS when filter has no results) -->
        <div class="uca-empty" id="uca-empty" hidden>
            <p>No use cases found for this filter.</p>
        </div>

    </div>
</section>

<!-- ── CTA ───────────────────────────────────────────────────────────────────── -->
<section class="industry-pg-cta" aria-label="Call to action">
    <div class="container">
        <div class="animate-on-scroll">
            <h2 class="industry-pg-cta__headline">Not sure which use case fits?</h2>
            <p class="industry-pg-cta__sub">— we will map your situation to the right use case and tell you honestly whether Bluu is the right fit.</p>
            <div class="industry-pg-cta__buttons">
                <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary btn-primary--large btn-primary--white">Let\'s talk</a>
                <a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="industry-btn-outline--cta">See pricing</a>
            </div>
        </div>
    </div>
</section>

<script>
(function () {
    var btns  = document.querySelectorAll('.uca-filter-btn');
    var cards = document.querySelectorAll('.uca-card');
    var empty = document.getElementById('uca-empty');

    btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var filter = btn.dataset.filter;

            btns.forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
                b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
            });

            var visible = 0;
            cards.forEach(function (card) {
                var show = filter === 'all' || card.dataset.industry === filter;
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });

            empty.hidden = visible > 0;
        });
    });
}());
</script>

<?php get_footer(); ?>
