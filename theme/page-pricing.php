<?php
/**
 * Template Name: Pricing Page
 *
 * @package bluu-interactive
 */

// ── ACF fields with defaults ──────────────────────────────────────────────────
$hero_badge    = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_badge' )    : '' ) ?: 'Straightforward Retainer Pricing';
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_headline' ) : '' ) ?: 'One retainer. No surprises.';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'pricing_hero_body' )     : '' ) ?: 'Everything your content operation needs — research, writing, publishing, and reporting — in a single flat monthly number. No project fees. No hourly billing. No scope creep conversations.';

$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_headline' ) : '' ) ?: 'Not sure which retainer fits?';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_body' )     : '' ) ?: 'Let's talk. We\'ll tell you honestly which tier makes sense for your business right now — and if the timing isn\'t right, we\'ll say so. No pitch, no pressure.';
$cta_url      = ( function_exists( 'get_field' ) ? get_field( 'pricing_cta_url' )      : '' ) ?: home_url( '/contact' );

// ── Pricing tiers ─────────────────────────────────────────────────────────────
$tiers = array(
    array(
        'name'        => 'Starter',
        'price'       => '$1,500',
        'period'      => '/mo',
        'description' => 'For founders and SMEs who need a consistent content presence without building an in-house team.',
        'note'        => '90-day initial commitment. Month-to-month after that.',
        'cta_text'    => 'Get Started',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'outline-blue',
        'featured'    => false,
        'highlights'  => array(
            '4 long-form pieces / mo',
            '8 social captions / mo',
            'LinkedIn + Instagram publishing',
            'Monthly strategy call (45 min)',
            'Monthly performance report',
        ),
    ),
    array(
        'name'        => 'Growth',
        'price'       => '$2,500',
        'period'      => '/mo',
        'description' => 'For growing teams who want the full content engine — research, content, publishing, and reporting across every channel.',
        'note'        => 'Best for teams with an active sales motion.',
        'cta_text'    => 'Let's talk',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'solid-blue',
        'featured'    => true,
        'highlights'  => array(
            '8 long-form pieces / mo',
            '20 social captions / mo',
            'Full publishing suite (all channels)',
            '60-min monthly intelligence session',
            'Quarterly strategy review',
            'Use case pages (1/quarter)',
        ),
    ),
    array(
        'name'        => 'Premium',
        'price'       => '$3,500',
        'period'      => '/mo',
        'description' => 'For brands that want their entire content operation run end-to-end with maximum output and deep intelligence.',
        'note'        => 'Scoped to your requirements. Talk to us.',
        'cta_text'    => 'Contact Us',
        'cta_url'     => home_url( '/contact' ),
        'cta_style'   => 'outline-navy',
        'featured'    => false,
        'highlights'  => array(
            '12+ long-form pieces / mo',
            '40+ social captions / mo',
            'Daily publishing cadence',
            '90-min monthly intelligence session',
            'Case studies (1/quarter)',
            'Market pulse reports on-demand',
            'Weekly performance snapshot',
        ),
    ),
);

// ── Comparison table ──────────────────────────────────────────────────────────
$comparison = array(
    array(
        'category' => 'Research & intelligence',
        'rows' => array(
            array( 'feature' => 'Competitor monitoring',                              'starter' => '2 competitors', 'growth' => '5 competitors', 'premium' => 'Unlimited' ),
            array( 'feature' => 'Competitor digest frequency',                        'starter' => 'Monthly',       'growth' => 'Weekly',        'premium' => 'Weekly' ),
            array( 'feature' => 'Audience insight report',                            'starter' => 'Monthly',       'growth' => 'Monthly',       'premium' => 'Weekly' ),
            array( 'feature' => 'Trend radar (industry niche)',                       'starter' => 'Monthly',       'growth' => 'Weekly',        'premium' => 'Daily' ),
            array( 'feature' => 'Brand sentiment tracking',                           'starter' => false,           'growth' => 'Monthly',       'premium' => 'Weekly' ),
            array( 'feature' => 'SEO keyword monitoring',                             'starter' => false,           'growth' => true,            'premium' => true ),
            array( 'feature' => 'Market pulse reports (on-demand)',                   'starter' => false,           'growth' => false,           'premium' => true ),
            array( 'feature' => 'AI discovery monitoring (Perplexity, Google AI Overviews)', 'starter' => false,           'growth' => true,            'premium' => true ),
        ),
    ),
    array(
        'category' => 'Content creation',
        'rows' => array(
            array( 'feature' => 'Long-form pieces / mo (blog posts, LinkedIn articles)', 'starter' => '4 pieces',  'growth' => '8 pieces',  'premium' => '12+ pieces' ),
            array( 'feature' => 'Short-form social captions / mo',                       'starter' => '8/mo',      'growth' => '20/mo',     'premium' => '40+/mo' ),
            array( 'feature' => 'Newsletter written & formatted',                         'starter' => false,       'growth' => '1/mo',      'premium' => 'Weekly' ),
            array( 'feature' => 'X / Twitter threads',                                    'starter' => false,       'growth' => '2/mo',      'premium' => '4/mo' ),
            array( 'feature' => 'Video / audio scripts',                                  'starter' => false,       'growth' => '2/mo',      'premium' => '4/mo' ),
            array( 'feature' => 'Ad copy & campaign content',                             'starter' => false,       'growth' => false,       'premium' => true ),
            array( 'feature' => 'Content repurposing (all pieces → all formats)',         'starter' => 'Partial',   'growth' => 'Full',      'premium' => 'Full' ),
            array( 'feature' => 'Brand voice alignment & style guide',                    'starter' => true,        'growth' => true,        'premium' => true ),
            array( 'feature' => 'Human review before anything publishes',                 'starter' => true,        'growth' => true,        'premium' => true ),
            array( 'feature' => 'Structured for discovery (SEO + AI-discoverable)',       'starter' => true,        'growth' => true,        'premium' => true ),
        ),
    ),
    array(
        'category' => 'Publishing & management',
        'rows' => array(
            array( 'feature' => 'LinkedIn publishing',                               'starter' => true,    'growth' => true,    'premium' => true ),
            array( 'feature' => 'Instagram publishing',                              'starter' => true,    'growth' => true,    'premium' => true ),
            array( 'feature' => 'X / Twitter publishing',                            'starter' => false,   'growth' => true,    'premium' => true ),
            array( 'feature' => 'Website / blog CMS publishing',                     'starter' => false,   'growth' => true,    'premium' => true ),
            array( 'feature' => 'Newsletter send (via client\'s email platform)',     'starter' => false,   'growth' => true,    'premium' => true ),
            array( 'feature' => 'Editorial calendar management',                     'starter' => true,    'growth' => true,    'premium' => true ),
            array( 'feature' => 'Publishing cadence',                                'starter' => 'Weekly','growth' => 'Weekly','premium' => 'Daily' ),
            array( 'feature' => 'Social channel monitoring & engagement alerts',     'starter' => false,   'growth' => true,    'premium' => true ),
        ),
    ),
    array(
        'category' => 'Case studies & use cases',
        'rows' => array(
            array( 'feature' => 'Full case study (interview → write-up → 6 assets)', 'starter' => false, 'growth' => false,       'premium' => '1/quarter' ),
            array( 'feature' => 'Use case / scenario page',                           'starter' => false, 'growth' => '1/quarter', 'premium' => '2/quarter' ),
            array( 'feature' => 'Customer spotlight / success story',                 'starter' => false, 'growth' => '1/quarter', 'premium' => '2/quarter' ),
            array( 'feature' => 'Case study repurposing (LinkedIn, email, sales)',    'starter' => false, 'growth' => false,       'premium' => true ),
        ),
    ),
    array(
        'category' => 'Reporting & strategy',
        'rows' => array(
            array( 'feature' => 'Monthly performance report',                                   'starter' => true,      'growth' => true,              'premium' => true ),
            array( 'feature' => 'Weekly performance snapshot',                                  'starter' => false,     'growth' => false,             'premium' => true ),
            array( 'feature' => 'Monthly intelligence session (live call)',                     'starter' => false,     'growth' => '60 min',          'premium' => '90 min' ),
            array( 'feature' => 'Monthly strategy call',                                        'starter' => '45 min',  'growth' => 'Incl. in session', 'premium' => 'Incl. in session' ),
            array( 'feature' => 'Content performance feedback loop (what worked → next month)', 'starter' => true,      'growth' => true,              'premium' => true ),
            array( 'feature' => 'Quarterly content strategy review',                            'starter' => false,     'growth' => true,              'premium' => true ),
        ),
    ),
    array(
        'category' => 'Support & client portal',
        'rows' => array(
            array( 'feature' => 'Client portal access',    'starter' => true,      'growth' => true,     'premium' => true ),
            array( 'feature' => 'Support ticket system',   'starter' => true,      'growth' => true,     'premium' => true ),
            array( 'feature' => 'Email support',           'starter' => true,      'growth' => true,     'premium' => true ),
            array( 'feature' => 'Response time',           'starter' => '48 hrs',  'growth' => '24 hrs', 'premium' => 'Priority' ),
            array( 'feature' => 'Revision rounds per piece','starter' => '1 round','growth' => '2 rounds','premium' => 'Unlimited' ),
        ),
    ),
    array(
        'category' => 'Terms & commitment',
        'rows' => array(
            array( 'feature' => 'No lock-in (first 3 months)', 'starter' => true,      'growth' => true,      'premium' => true ),
            array( 'feature' => 'Billing',                      'starter' => 'Monthly', 'growth' => 'Monthly', 'premium' => 'Monthly' ),
            array( 'feature' => 'Limited monthly capacity',     'starter' => true,      'growth' => true,      'premium' => true ),
        ),
    ),
);

// ── Add-ons ───────────────────────────────────────────────────────────────────
$addons = array(
    array(
        'name'        => 'Full case study',
        'description' => 'Client interview, narrative write-up, PDF format, 6 repurposed assets.',
        'price'       => '$800 per study',
    ),
    array(
        'name'        => 'Use case page',
        'description' => 'Targeted scenario write-up for a specific audience or industry vertical.',
        'price'       => '$350 per page',
    ),
    array(
        'name'        => 'Market pulse report',
        'description' => 'Deep research report on any market, topic, or competitor landscape.',
        'price'       => '$250 per report',
    ),
    array(
        'name'        => 'Extra long-form piece',
        'description' => 'Blog post, LinkedIn article, or newsletter outside your plan allowance.',
        'price'       => '$150 per piece',
    ),
    array(
        'name'        => 'Blog template build (WordPress)',
        'description' => 'Archive page + single post template built into your existing theme.',
        'price'       => 'Quoted on request',
    ),
    array(
        'name'        => 'White-label content production',
        'description' => 'Overflow content for agency clients, written under your name.',
        'price'       => 'Scoped on request',
    ),
);

// ── What every client should know ────────────────────────────────────────────
$client_knows = array(
    array(
        'title' => 'Structured for discovery',
        'body'  => 'Every piece Bluu produces is structured for discovery — in search and in the AI tools your audience already uses. This is not a premium feature. It is the baseline standard for every deliverable at every tier.',
    ),
    array(
        'title' => 'No lock-in for the first three months',
        'body'  => 'Every plan starts with a three-month no-commitment period. We are confident enough in the work that we do not need to lock you in. If it is not working, you can leave. It will be working.',
    ),
    array(
        'title' => 'Human review on everything',
        'body'  => 'Every piece of content is reviewed by a human strategist before it goes anywhere. Research-informed, editorially sound, and on-brand — not a raw AI output with your logo on it.',
    ),
    array(
        'title' => 'Client portal and support ticket system',
        'body'  => 'All clients access Bluu\'s own CRM and client portal. Submit requests, track deliverables, raise support tickets, and see your content calendar — all in one place. No third-party tools required.',
    ),
    array(
        'title' => 'Research-led, not template-driven',
        'body'  => 'Every content plan starts with real intelligence — competitor monitoring, audience research, keyword and trend analysis. Content built on research outperforms content built on assumption. Every time.',
    ),
    array(
        'title' => 'Limited monthly capacity',
        'body'  => 'Bluu keeps its client roster intentionally small so every client gets the full attention their retainer is paying for. When capacity is full, a waiting list opens. This is not a sales tactic.',
    ),
);

$check_svg = '<svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
$dash      = '<span class="pricing-table__dash" aria-label="Not included">—</span>';

get_header();
?>

<!-- ── Pricing Hero ─────────────────────────────────────────────────────────── -->
<section class="pricing-hero" aria-label="<?php esc_attr_e( 'Pricing overview', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-hero__inner animate-on-scroll">
            <div class="pricing-hero__badge"><?php echo esc_html( $hero_badge ); ?></div>
            <h1 class="pricing-hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>
            <p class="pricing-hero__body"><?php echo bluu_text( $hero_body ); ?></p>
        </div>
    </div>
</section>

<!-- ── Baseline banner ────────────────────────────────────────────────────────── -->
<div class="pricing-baseline">
    <div class="container">
        <p class="pricing-baseline__label"><?php esc_html_e( 'What every plan includes', 'bluu-interactive' ); ?></p>
        <ul class="pricing-baseline__list">
            <li><?php esc_html_e( 'Content structured for SEO and AI discovery', 'bluu-interactive' ); ?></li>
            <li><?php esc_html_e( 'Human review before anything publishes', 'bluu-interactive' ); ?></li>
            <li><?php esc_html_e( 'Brand voice alignment', 'bluu-interactive' ); ?></li>
            <li><?php esc_html_e( 'Monthly performance report', 'bluu-interactive' ); ?></li>
            <li><?php esc_html_e( 'Email support', 'bluu-interactive' ); ?></li>
            <li><?php esc_html_e( 'Client portal & support ticket system', 'bluu-interactive' ); ?></li>
        </ul>
    </div>
</div>

<!-- ── Pricing Cards ───────────────────────────────────────────────────────── -->
<section class="pricing-section" aria-label="<?php esc_attr_e( 'Pricing plans', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-grid">

            <?php foreach ( $tiers as $tier ) :
                $is_featured = ! empty( $tier['featured'] );
                $card_class  = 'pricing-card' . ( $is_featured ? ' pricing-card--featured' : ' pricing-card--offset' );
            ?>
            <div class="<?php echo esc_attr( $card_class ); ?>">

                <?php if ( $is_featured ) : ?>
                    <div class="pricing-card__popular-label"><?php esc_html_e( 'Most Popular', 'bluu-interactive' ); ?></div>
                <?php endif; ?>

                <h3 class="pricing-card__name"><?php echo esc_html( $tier['name'] ); ?></h3>

                <div class="pricing-card__price-wrap">
                    <span class="pricing-card__price-amount<?php echo $is_featured ? ' pricing-card__price-amount--navy' : ''; ?>">
                        <?php echo esc_html( $tier['price'] ); ?>
                    </span>
                    <span class="pricing-card__price-period"><?php echo esc_html( $tier['period'] ); ?></span>
                </div>

                <p class="pricing-card__description"><?php echo bluu_text( $tier['description'] ); ?></p>

                <div class="pricing-card__divider" aria-hidden="true"></div>

                <ul class="pricing-card__features" aria-label="<?php esc_attr_e( 'Plan highlights', 'bluu-interactive' ); ?>">
                    <?php foreach ( $tier['highlights'] as $item ) : ?>
                        <li class="pricing-card__feature">
                            <span class="pricing-card__check" aria-hidden="true"><?php echo $check_svg; // phpcs:ignore ?></span>
                            <span class="pricing-card__feature-text"><?php echo esc_html( $item ); ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <a href="<?php echo esc_url( $tier['cta_url'] ); ?>"
                   class="pricing-card__cta pricing-card__cta--<?php echo esc_attr( $tier['cta_style'] ); ?>">
                    <?php echo esc_html( $tier['cta_text'] ); ?>
                </a>

                <p class="pricing-card__note"><?php echo esc_html( $tier['note'] ); ?></p>

            </div>
            <?php endforeach; ?>

        </div>
    </div>
</section>

<!-- ── SEO Standard Note ─────────────────────────────────────────────────────── -->
<div class="pricing-seo-note">
    <div class="container">
        <p class="pricing-seo-note__text"><?php esc_html_e( 'All content produced at every tier is built to SEO and AI crawl standard — included, not charged as an extra.', 'bluu-interactive' ); ?></p>
    </div>
</div>

<!-- ── Full comparison table ─────────────────────────────────────────────────── -->
<section class="pricing-comparison" aria-label="<?php esc_attr_e( 'Full feature comparison', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="pricing-comparison__header animate-on-scroll">
            <h2 class="pricing-comparison__headline"><?php esc_html_e( 'Full feature breakdown', 'bluu-interactive' ); ?></h2>
            <p class="pricing-comparison__sub"><?php esc_html_e( 'Every deliverable, every channel, every tier — laid out clearly.', 'bluu-interactive' ); ?></p>
        </div>

        <div class="pricing-table-wrap">
            <table class="pricing-table" role="table">
                <thead>
                    <tr>
                        <th class="pricing-table__feature-col" scope="col"></th>
                        <th scope="col">
                            <span class="pricing-table__tier-name">Starter</span>
                            <span class="pricing-table__tier-price">$1,500<span>/mo</span></span>
                        </th>
                        <th scope="col" class="pricing-table__featured-col">
                            <span class="pricing-table__popular-badge"><?php esc_html_e( 'Most Popular', 'bluu-interactive' ); ?></span>
                            <span class="pricing-table__tier-name">Growth</span>
                            <span class="pricing-table__tier-price">$2,500<span>/mo</span></span>
                        </th>
                        <th scope="col">
                            <span class="pricing-table__tier-name">Premium</span>
                            <span class="pricing-table__tier-price">$3,500<span>/mo</span></span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $comparison as $section ) : ?>
                        <tr class="pricing-table__category-row">
                            <td colspan="4" class="pricing-table__category"><?php echo esc_html( $section['category'] ); ?></td>
                        </tr>
                        <?php foreach ( $section['rows'] as $row ) : ?>
                            <tr class="pricing-table__row">
                                <td class="pricing-table__feature"><?php echo esc_html( $row['feature'] ); ?></td>
                                <?php foreach ( array( 'starter', 'growth', 'premium' ) as $col ) :
                                    $val     = $row[ $col ];
                                    $is_feat = ( $col === 'growth' );
                                ?>
                                <td class="pricing-table__cell<?php echo $is_feat ? ' pricing-table__cell--featured' : ''; ?>">
                                    <?php if ( $val === true ) : ?>
                                        <span class="pricing-table__check" aria-label="<?php esc_attr_e( 'Included', 'bluu-interactive' ); ?>"><?php echo $check_svg; // phpcs:ignore ?></span>
                                    <?php elseif ( $val === false ) : ?>
                                        <?php echo $dash; // phpcs:ignore ?>
                                    <?php else : ?>
                                        <span class="pricing-table__value"><?php echo esc_html( $val ); ?></span>
                                    <?php endif; ?>
                                </td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    <?php endforeach; ?>

                    <!-- CTA row -->
                    <tr class="pricing-table__cta-row">
                        <td class="pricing-table__feature"></td>
                        <td><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="pricing-table__cta pricing-table__cta--outline"><?php esc_html_e( 'Get Started', 'bluu-interactive' ); ?></a></td>
                        <td class="pricing-table__cell--featured"><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="pricing-table__cta pricing-table__cta--solid"><?php esc_html_e( 'Let's talk', 'bluu-interactive' ); ?></a></td>
                        <td><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="pricing-table__cta pricing-table__cta--outline"><?php esc_html_e( 'Contact Us', 'bluu-interactive' ); ?></a></td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</section>

<!-- ── Add-ons ────────────────────────────────────────────────────────────────── -->
<section class="pricing-addons" aria-label="<?php esc_attr_e( 'Available add-ons', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-addons__header animate-on-scroll">
            <h2 class="pricing-addons__headline"><?php esc_html_e( 'Available add-ons', 'bluu-interactive' ); ?></h2>
            <p class="pricing-addons__sub"><?php esc_html_e( 'Add to any plan as needed. Priced per engagement — no commitment required.', 'bluu-interactive' ); ?></p>
        </div>
        <div class="pricing-addons__grid">
            <?php foreach ( $addons as $addon ) : ?>
                <div class="pricing-addon-card">
                    <div class="pricing-addon-card__body">
                        <p class="pricing-addon-card__name"><?php echo esc_html( $addon['name'] ); ?></p>
                        <p class="pricing-addon-card__desc"><?php echo esc_html( $addon['description'] ); ?></p>
                    </div>
                    <p class="pricing-addon-card__price"><?php echo esc_html( $addon['price'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── What every client should know ─────────────────────────────────────────── -->
<section class="pricing-know" aria-label="<?php esc_attr_e( 'What every client should know', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-know__header animate-on-scroll">
            <h2 class="pricing-know__headline"><?php esc_html_e( 'What every client should know', 'bluu-interactive' ); ?></h2>
            <p class="pricing-know__sub"><?php esc_html_e( 'All plans billed monthly · No lock-in for the first 3 months · Founding client rate available — ask us · SEO and AI crawl standard built into every deliverable', 'bluu-interactive' ); ?></p>
        </div>
        <div class="pricing-know__grid">
            <?php foreach ( $client_knows as $item ) : ?>
                <div class="pricing-know-card animate-on-scroll">
                    <h3 class="pricing-know-card__title"><?php echo esc_html( $item['title'] ); ?></h3>
                    <p class="pricing-know-card__body"><?php echo bluu_text( $item['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── Bottom CTA ─────────────────────────────────────────────────────────── -->
<section class="pricing-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pricing-cta__inner">

            <div class="pricing-cta__text">
                <h2 class="pricing-cta__headline"><?php echo esc_html( $cta_headline ); ?></h2>
                <p class="pricing-cta__body"><?php echo bluu_text( $cta_body ); ?></p>
            </div>

            <div class="pricing-cta__actions">
                <a href="<?php echo esc_url( $cta_url ); ?>" class="btn-primary btn-primary--large">
                    <?php esc_html_e( 'Let's talk', 'bluu-interactive' ); ?>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                </a>
                <p class="pricing-cta__disclaimer"><?php esc_html_e( 'No Pitch Deck. No Sales Pressure.', 'bluu-interactive' ); ?></p>
            </div>

        </div>
    </div>
</section>

<?php get_footer(); ?>
