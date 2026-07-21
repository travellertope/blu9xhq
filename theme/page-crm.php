<?php
/**
 * Template Name: BluuCRM Marketing Page
 *
 * Marketing page for BluuCRM, assigned to /crm. crm.bluuhq.com itself is
 * the app (login/portal/dashboard) — this page is the public pitch, with
 * every CTA pointing back to the app.
 *
 * @package bluu-interactive
 */

$crm_app_url = 'https://crm.bluuhq.com';

// ── ACF fields with defaults ────────────────────────────────────────────────
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'crm_hero_headline' ) : '' ) ?: 'Run your agency\'s clients, projects, and portal — all in one place.';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'crm_hero_body' )     : '' ) ?: 'BluuCRM unifies client relationships, project management, invoicing, and a branded client portal so freelancers and agencies stop stitching tools together.';

$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'crm_cta_headline' ) : '' ) ?: 'Ready to get your client work out of spreadsheets?';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'crm_cta_body' )     : '' ) ?: '';

// ── Features ─────────────────────────────────────────────────────────────────
$features = array(
    array(
        'icon'  => '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
        'title' => 'Clients & services',
        'body'  => 'Track every client, service, and project in one CRM built for agency work.',
    ),
    array(
        'icon'  => '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
        'title' => 'Client portal',
        'body'  => 'Give clients their own branded portal for invoices, files, and support — no separate login system to manage.',
    ),
    array(
        'icon'  => '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/><path d="M9 7h6M9 11h6"/>',
        'title' => 'Invoicing & billing',
        'body'  => 'Send invoices and collect payments without leaving the CRM.',
    ),
    array(
        'icon'  => '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>',
        'title' => 'File sharing',
        'body'  => 'Share and organize client files in the same place you manage the relationship.',
    ),
    array(
        'icon'  => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
        'title' => 'Sequences & follow-ups',
        'body'  => 'Automate onboarding, reminders, and check-ins so nothing falls through the cracks.',
    ),
    array(
        'icon'  => '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M5.3 5.3l3.1 3.1M15.6 15.6l3.1 3.1M18.7 5.3l-3.1 3.1M8.4 15.6l-3.1 3.1"/>',
        'title' => 'Support tickets',
        'body'  => 'Handle client requests through a shared ticket queue instead of a scattered inbox.',
    ),
    array(
        'icon'  => '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"/>',
        'title' => 'White-label domain',
        'body'  => 'Put your own domain on the portal your clients see — not ours.',
    ),
    array(
        'icon'  => '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.7l7.6-4.4M8.2 13.3l7.6 4.4"/>',
        'title' => 'Affiliate program',
        'body'  => 'Turn clients and partners into referral partners with built-in tracking and payouts.',
    ),
);

// ── Pricing ──────────────────────────────────────────────────────────────────
$plans = array(
    array(
        'name'        => 'Free',
        'description' => 'Try BluuCRM with up to 5 clients',
        'monthly'     => 0,
        'annual'      => 0,
        'featured'    => false,
        'cta_text'    => 'Create free account',
        'highlights'  => array(
            'Up to 5 clients',
            '1 team member',
            '100 MB file storage',
            'Branded client portal',
            'Community support',
        ),
    ),
    array(
        'name'        => 'Starter',
        'description' => 'For freelancers and small agencies',
        'monthly'     => 29,
        'annual'      => 290,
        'featured'    => false,
        'cta_text'    => 'Get started',
        'highlights'  => array(
            'Up to 25 clients',
            '5 team members',
            '1 GB file storage',
            'Email sequences & automated follow-ups',
            'White-label custom domain',
        ),
    ),
    array(
        'name'        => 'Pro',
        'description' => 'AI insights + more team members',
        'monthly'     => 79,
        'annual'      => 790,
        'featured'    => false,
        'cta_text'    => 'Get started',
        'highlights'  => array(
            'Up to 100 clients',
            '15 team members',
            '10 GB file storage',
            'Everything in Starter',
            'AI-powered client health insights',
        ),
    ),
    array(
        'name'        => 'Agency',
        'description' => 'Unlimited clients, team, and storage',
        'monthly'     => 199,
        'annual'      => 1990,
        'featured'    => true,
        'cta_text'    => 'Get started',
        'highlights'  => array(
            'Unlimited clients & team members',
            'Unlimited file storage',
            'Everything in Pro',
            'Built-in affiliate / referral program',
            'Priority support',
        ),
    ),
);

// ── FAQ ────────────────────────────────────────────────────────────────────
$faqs = array(
    array(
        'q' => 'Is BluuCRM really free forever?',
        'a' => 'Yes — the Free plan stays free for up to 5 clients, 1 team member, and the full client portal. No credit card required to sign up.',
    ),
    array(
        'q' => 'Can my clients log in without setting up their own account?',
        'a' => 'Yes. Clients get a magic-link sign-in to their own portal — they never have to create or manage a password.',
    ),
    array(
        'q' => 'What does white-label mean here?',
        'a' => 'On Starter and above, you can point your own custom domain at your client portal, so your clients see your brand, not BluuHQ\'s.',
    ),
    array(
        'q' => 'How does the affiliate program work?',
        'a' => 'Affiliates earn recurring commission for referring customers to BluuCRM, BluuAudit, and other BluuHQ services — tracked automatically through a referral link.',
    ),
);

get_header();
?>

<!-- ── CRM Hero ─────────────────────────────────────────────────────────────── -->
<section class="crm-hero bluu-hero-bg" aria-label="<?php esc_attr_e( 'BluuCRM overview', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <div class="crm-hero__inner animate-on-scroll">
            <h1 class="crm-hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>
            <p class="crm-hero__body"><?php echo bluu_text( $hero_body ); ?></p>
            <div class="crm-hero__actions">
                <a href="<?php echo esc_url( $crm_app_url . '/signup' ); ?>" class="btn-primary">
                    <?php esc_html_e( 'Create free account', 'bluu-interactive' ); ?>
                </a>
                <a href="<?php echo esc_url( $crm_app_url . '/admin-login' ); ?>" class="btn-outline">
                    <?php esc_html_e( 'Log in', 'bluu-interactive' ); ?>
                </a>
            </div>
            <p class="crm-hero__note"><?php esc_html_e( 'Free forever for your first 5 clients. No credit card required.', 'bluu-interactive' ); ?></p>
        </div>
    </div>
</section>

<!-- ── Product mockup ───────────────────────────────────────────────────────── -->
<section class="pm-section" aria-label="<?php esc_attr_e( 'BluuCRM dashboard preview', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="pm-head animate-on-scroll">
            <div class="pm-head__left">
                <span class="pm-tag" style="background:var(--md-accent-container); color:var(--md-accent-dark);"><span class="pm-dot" style="background:var(--md-accent);"></span>BluuCRM</span>
                <h2><?php esc_html_e( "The dashboard your agency actually opens every morning.", 'bluu-interactive' ); ?></h2>
                <p><?php esc_html_e( 'Outstanding balances, renewals, overdue invoices, and at-risk clients — one view instead of five tabs.', 'bluu-interactive' ); ?></p>
            </div>
            <span class="pm-url">crm.bluuhq.com/admin</span>
        </div>
        <div class="pm-frame animate-on-scroll">
            <div class="pm-chrome">
                <div class="pm-chrome__dots"><span></span><span></span><span></span></div>
                <div class="pm-chrome__bar">crm.bluuhq.com/admin</div>
            </div>
            <div class="crm-mockup">
                <div class="crm-mockup__sidebar">
                    <div class="crm-mockup__logo">Bluu<b>CRM</b></div>
                    <div class="crm-mockup__nav">
                        <span class="is-active">Dashboard</span>
                        <span>Clients</span>
                        <span>Subscriptions</span>
                        <span>Invoices</span>
                        <span>Files</span>
                        <span>Tickets</span>
                        <span>Follow-ups</span>
                        <span>Affiliates</span>
                        <span>Settings</span>
                    </div>
                </div>
                <div class="crm-mockup__main">
                    <div class="crm-mockup__title">Dashboard</div>
                    <div class="crm-mockup__sub">Welcome back, Adaeze</div>
                    <div class="crm-mockup-stats">
                        <div class="crm-mockup-stat">
                            <div class="crm-mockup-stat__label">Outstanding</div>
                            <div class="crm-mockup-stat__value">$4,280</div>
                            <div class="crm-mockup-stat__sub">6 invoices</div>
                        </div>
                        <div class="crm-mockup-stat">
                            <div class="crm-mockup-stat__label">Overdue</div>
                            <div class="crm-mockup-stat__value">$860</div>
                            <div class="crm-mockup-stat__sub">2 invoices</div>
                        </div>
                        <div class="crm-mockup-stat">
                            <div class="crm-mockup-stat__label">Active clients</div>
                            <div class="crm-mockup-stat__value">37</div>
                            <div class="crm-mockup-stat__sub">+3 this month</div>
                        </div>
                        <div class="crm-mockup-stat">
                            <div class="crm-mockup-stat__label">Est. MRR</div>
                            <div class="crm-mockup-stat__value">$9,140</div>
                            <div class="crm-mockup-stat__sub">across all plans</div>
                        </div>
                    </div>
                    <div class="crm-mockup-cards">
                        <div class="crm-mockup-card">
                            <div class="crm-mockup-card__title">Upcoming renewals</div>
                            <div class="crm-mockup-card__row"><span>Kaine Digital — Pro plan</span><span class="crm-mockup-card__row-sub">in 3 days</span></div>
                            <div class="crm-mockup-card__row"><span>Verve Studio — Starter</span><span class="crm-mockup-card__row-sub">in 5 days</span></div>
                            <div class="crm-mockup-card__row"><span>Lumo Retail — Agency</span><span class="crm-mockup-card__row-sub">in 6 days</span></div>
                        </div>
                        <div class="crm-mockup-card">
                            <div class="crm-mockup-card__title">Overdue invoices</div>
                            <div class="crm-mockup-card__row"><span>Northbridge Co.</span><span class="crm-mockup-pill crm-mockup-pill--red">4 days</span></div>
                            <div class="crm-mockup-card__row"><span>Fenwick &amp; Ade</span><span class="crm-mockup-pill crm-mockup-pill--red">9 days</span></div>
                        </div>
                        <div class="crm-mockup-card">
                            <div class="crm-mockup-card__title">At-risk clients</div>
                            <div class="crm-mockup-card__row"><span>Orin Consulting</span><span class="crm-mockup-pill crm-mockup-pill--amber">Low usage</span></div>
                            <div class="crm-mockup-card__row"><span>Baxter Media</span><span class="crm-mockup-pill crm-mockup-pill--amber">No login 21d</span></div>
                        </div>
                        <div class="crm-mockup-card">
                            <div class="crm-mockup-card__title">Recent activity</div>
                            <div class="crm-mockup-card__row"><span>Invoice #204 paid</span><span class="crm-mockup-card__row-sub">2h ago</span></div>
                            <div class="crm-mockup-card__row"><span>New client: Halden Labs</span><span class="crm-mockup-card__row-sub">Yesterday</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ── Features ─────────────────────────────────────────────────────────────── -->
<section class="crm-features" aria-label="<?php esc_attr_e( 'What\'s inside BluuCRM', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="crm-features__header animate-on-scroll">
            <h2 class="crm-features__headline"><?php esc_html_e( 'Everything client work needs, none of the sprawl.', 'bluu-interactive' ); ?></h2>
        </div>
        <div class="crm-features__grid">
            <?php foreach ( $features as $f ) : ?>
                <div class="crm-feature-card animate-on-scroll">
                    <div class="crm-feature-card__icon"><?php echo bluu_mega_icon( $f['icon'], 20 ); // phpcs:ignore ?></div>
                    <h3 class="crm-feature-card__title"><?php echo esc_html( $f['title'] ); ?></h3>
                    <p class="crm-feature-card__body"><?php echo esc_html( $f['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── Pricing ──────────────────────────────────────────────────────────────── -->
<section class="crm-pricing" aria-label="<?php esc_attr_e( 'BluuCRM pricing', 'bluu-interactive' ); ?>" id="pricing">
    <div class="container">
        <div class="crm-pricing__header animate-on-scroll">
            <h2 class="crm-pricing__headline"><?php esc_html_e( 'Start free. Upgrade when your client list grows.', 'bluu-interactive' ); ?></h2>
        </div>
        <div class="crm-pricing__grid">
            <?php foreach ( $plans as $plan ) :
                $card_class = 'crm-plan' . ( $plan['featured'] ? ' crm-plan--featured' : '' );
            ?>
                <div class="<?php echo esc_attr( $card_class ); ?>">
                    <h3 class="crm-plan__name"><?php echo esc_html( $plan['name'] ); ?></h3>
                    <p class="crm-plan__desc"><?php echo esc_html( $plan['description'] ); ?></p>
                    <div class="crm-plan__price">
                        <span class="crm-plan__price-amount">$<?php echo esc_html( $plan['monthly'] ); ?></span>
                        <?php if ( $plan['monthly'] > 0 ) : ?>
                            <span class="crm-plan__price-period">/mo</span>
                        <?php endif; ?>
                    </div>
                    <?php if ( $plan['annual'] > 0 ) : ?>
                        <p class="crm-plan__annual">or $<?php echo esc_html( $plan['annual'] ); ?>/yr — save ~17%</p>
                    <?php endif; ?>
                    <ul class="crm-plan__features">
                        <?php foreach ( $plan['highlights'] as $item ) : ?>
                            <li class="crm-plan__feature">
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                                <?php echo esc_html( $item ); ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                    <a href="<?php echo esc_url( $crm_app_url . '/signup' ); ?>"
                       class="<?php echo $plan['featured'] ? 'btn-primary' : 'btn-outline'; ?> crm-plan__cta">
                        <?php echo esc_html( $plan['cta_text'] ); ?>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── FAQ ──────────────────────────────────────────────────────────────────── -->
<section class="crm-faq" aria-label="<?php esc_attr_e( 'BluuCRM frequently asked questions', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <h2 class="crm-faq__headline"><?php esc_html_e( 'Questions worth answering up front.', 'bluu-interactive' ); ?></h2>
        <div class="crm-faq__list">
            <?php foreach ( $faqs as $faq ) : ?>
                <details class="crm-faq__item">
                    <summary class="crm-faq__question">
                        <?php echo esc_html( $faq['q'] ); ?>
                        <span class="crm-faq__plus" aria-hidden="true">+</span>
                    </summary>
                    <p class="crm-faq__answer"><?php echo esc_html( $faq['a'] ); ?></p>
                </details>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── Final CTA ────────────────────────────────────────────────────────────── -->
<section class="crm-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <h2 class="crm-cta__headline"><?php echo esc_html( $cta_headline ); ?></h2>
        <?php if ( $cta_body ) : ?>
            <p class="crm-cta__body"><?php echo bluu_text( $cta_body ); ?></p>
        <?php endif; ?>
        <div class="crm-cta__actions">
            <a href="<?php echo esc_url( $crm_app_url . '/signup' ); ?>" class="btn-primary">
                <?php esc_html_e( 'Create free account', 'bluu-interactive' ); ?>
            </a>
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-outline">
                <?php esc_html_e( 'Talk to us', 'bluu-interactive' ); ?>
            </a>
        </div>
    </div>
</section>

<?php get_footer(); ?>
