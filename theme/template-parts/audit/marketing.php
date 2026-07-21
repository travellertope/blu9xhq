<?php
/**
 * BluuAudit marketing sections — hero through final CTA.
 *
 * Shared by front-page.php (bluuhq.com/) and page-audit.php (bluuhq.com/audit)
 * so the two surfaces can't drift apart. Self-contained like the other
 * template-parts in this theme — no variables expected from the caller.
 *
 * @package bluu-interactive
 */

$scan_url = 'https://audit.bluuhq.com';

// Preserve an incoming affiliate ref code through to the scan submission —
// audit.bluuhq.com's own middleware reads ?ref= from the URL and sets the
// attribution cookie there, so this is all that's needed to keep it intact.
$audit_ref = isset( $_GET['ref'] ) ? sanitize_text_field( wp_unslash( $_GET['ref'] ) ) : '';
?>

<!-- ═════════════════════════════ HERO ═════════════════════════════ -->
<section class="scan-hero bluu-hero-bg" id="top" aria-label="AI visibility scan">
    <div class="container">
        <div class="scan-hero__grid">

            <!-- Left: copy + form -->
            <div class="scan-hero__content">
                <h1 class="scan-hero__headline">
                    Show up <span class="scan-hero__headline--accent">everywhere</span> your customers are already looking.
                </h1>

                <p class="scan-hero__sub">
                    Search, AI tools, social, email — Bluu builds your site, runs your content, and keeps your brand visible across every channel that matters.
                </p>

                <div class="scan-hero__form-intro">
                    <p class="scan-hero__form-kicker">See where you stand.</p>
                    <p class="scan-hero__form-hint">Enter your domain below to see how visible your brand is across search, AI tools, and against your competitors.</p>
                </div>

                <form class="scan-hero__form" action="<?php echo esc_url( $scan_url ); ?>" method="GET">
                    <?php if ( $audit_ref ) : ?>
                        <input type="hidden" name="ref" value="<?php echo esc_attr( $audit_ref ); ?>">
                    <?php endif; ?>
                    <label class="scan-hero__toggle">
                        <input type="checkbox" id="noSiteToggle"> I don't have a website yet
                    </label>
                    <div class="scan-hero__form-row" id="scanFormRow">
                        <input class="scan-hero__input scan-hero__input--domain" type="text" name="domain" placeholder="yourdomain.com" autocomplete="off" id="domainInput">
                        <div class="scan-hero__no-site-fields" id="noSiteFields">
                            <input class="scan-hero__input" type="text" name="brand" placeholder="Business name" autocomplete="off">
                            <input class="scan-hero__input" type="text" name="niche" placeholder="Niche, e.g. SaaS" autocomplete="off">
                        </div>
                        <button type="submit" class="btn-primary">Run free scan</button>
                    </div>
                </form>

                <p class="scan-hero__note">
                    No credit card · or <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>">book a 15-minute call →</a>
                </p>
            </div>

            <!-- Right: brand-reach illustration (amber, matching /crm, /shop, /sync) -->
            <div class="scan-hero__illustration" aria-hidden="true">
                <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <?php $ill_color = is_front_page() ? '#2F5FE0' : '#C68A1E'; ?>
                    <path d="M220 200 Q150 140 110 100" stroke="<?php echo esc_attr( $ill_color ); ?>" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q300 130 348 92" stroke="<?php echo esc_attr( $ill_color ); ?>" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q150 260 96 308" stroke="<?php echo esc_attr( $ill_color ); ?>" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>
                    <path d="M220 200 Q300 265 352 306" stroke="<?php echo esc_attr( $ill_color ); ?>" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.45"/>

                    <?php if ( is_front_page() ) : ?>
                        <circle class="hero-pulse" cx="220" cy="200" r="72" stroke="#2F5FE0" stroke-width="1.5" style="transform-origin:220px 200px;"/>
                        <circle class="hero-pulse hero-pulse--delay" cx="220" cy="200" r="96" stroke="#2F5FE0" stroke-width="1.5" style="transform-origin:220px 200px;"/>

                        <g transform="translate(220,200)">
                            <path d="M0 -46L40 -23V23L0 46L-40 23V-23L0 -46Z" fill="#0a192f"/>
                            <circle cx="0" cy="0" r="15" fill="#2F5FE0"/>
                        </g>

                        <g class="scan-hero__ill-node" style="animation-delay:0s;">
                            <circle cx="110" cy="100" r="30" fill="#EAF0FF"/>
                            <circle cx="103" cy="100" r="8" fill="none" stroke="#2F5FE0" stroke-width="2"/>
                            <line x1="109" y1="106" x2="118" y2="115" stroke="#2F5FE0" stroke-width="2" stroke-linecap="round"/>
                        </g>

                        <g class="scan-hero__ill-node" style="animation-delay:0.6s;">
                            <circle cx="348" cy="92" r="30" fill="#FBF1DE"/>
                            <path d="M348 78l4.5 10.5L363 93l-10.5 4.5L348 108l-4.5-10.5L333 93l10.5-4.5z" fill="#C68A1E"/>
                        </g>

                        <g class="scan-hero__ill-node" style="animation-delay:1.2s;">
                            <circle cx="96" cy="308" r="30" fill="#E6F4EC"/>
                            <path d="M83 297h26a5 5 0 015 5v10a5 5 0 01-5 5H91l-8 6v-6a5 5 0 01-5-5v-10a5 5 0 015-5z" fill="#1F9D55"/>
                        </g>

                        <g class="scan-hero__ill-node" style="animation-delay:1.8s;">
                            <circle cx="352" cy="306" r="30" fill="#E3F3F4"/>
                            <rect x="337" y="294" width="30" height="22" rx="3" fill="none" stroke="#0E7C86" stroke-width="2"/>
                            <path d="M337 296l15 12 15-12" fill="none" stroke="#0E7C86" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                    <?php else : ?>
                        <!-- Radar sweep, not a static pulse: audit is a scan, not a broadcast. -->
                        <defs>
                            <linearGradient id="scanRadarFade" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#C68A1E" stop-opacity="0.4"/>
                                <stop offset="100%" stop-color="#C68A1E" stop-opacity="0"/>
                            </linearGradient>
                        </defs>
                        <circle cx="220" cy="200" r="96" stroke="#C68A1E" stroke-width="1.5" opacity="0.3"/>
                        <path class="scan-hero__ill-radar" d="M220,200 L307,159.4 A96,96 0 0,1 307,240.6 Z" fill="url(#scanRadarFade)" style="transform-origin:220px 200px;"/>

                        <g transform="translate(220,200)">
                            <path d="M0 -46L40 -23V23L0 46L-40 23V-23L0 -46Z" fill="#0a192f"/>
                            <circle cx="0" cy="0" r="15" fill="#C68A1E"/>
                        </g>

                        <!-- Overall score (target) -->
                        <g class="scan-hero__ill-node" style="animation-delay:0s;">
                            <circle cx="110" cy="100" r="30" fill="#FBF1DE"/>
                            <g transform="translate(110,100) scale(0.72) translate(-12,-12)" fill="none" stroke="#C68A1E" stroke-width="2">
                                <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>
                            </g>
                        </g>

                        <!-- AI discoverability (sparkle) -->
                        <g class="scan-hero__ill-node" style="animation-delay:0.6s;">
                            <circle cx="348" cy="92" r="30" fill="#FBF1DE"/>
                            <path d="M348 78l4.5 10.5L363 93l-10.5 4.5L348 108l-4.5-10.5L333 93l10.5-4.5z" fill="#C68A1E"/>
                        </g>

                        <!-- Site & tech health (shield) -->
                        <g class="scan-hero__ill-node" style="animation-delay:1.2s;">
                            <circle cx="96" cy="308" r="30" fill="#FBF1DE"/>
                            <g transform="translate(96,308) scale(0.72) translate(-12,-12)" fill="none" stroke="#C68A1E" stroke-width="2">
                                <path d="M12 2 3 6v6c0 5 3.8 9.4 9 10 5.2-.6 9-5 9-10V6l-9-4z"/>
                            </g>
                        </g>

                        <!-- Competitor intel (chart) -->
                        <g class="scan-hero__ill-node" style="animation-delay:1.8s;">
                            <circle cx="352" cy="306" r="30" fill="#FBF1DE"/>
                            <g transform="translate(352,306) scale(0.72) translate(-12,-12)" fill="none" stroke="#C68A1E" stroke-width="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                            </g>
                        </g>
                    <?php endif; ?>
                </svg>
            </div>

        </div>
    </div>

    <?php if ( ! is_front_page() ) : ?>
    <div class="container">
        <div class="pm-frame pm-frame--hero animate-on-scroll">
            <div class="pm-chrome">
                <div class="pm-chrome__dots"><span></span><span></span><span></span></div>
                <div class="pm-chrome__bar">audit.bluuhq.com/report/8841</div>
            </div>
            <div class="audit-mockup">
                <div class="audit-mockup__top">
                    <span class="audit-mockup__domain">northbridgeco.com</span>
                    <span class="audit-mockup__badge">Sample report</span>
                </div>
                <div class="audit-mockup-score-row">
                    <span class="audit-mockup-score-big">78</span>
                    <span class="audit-mockup-score-tag">/ 100 overall</span>
                </div>
                <div class="audit-mockup-pillars">
                    <div class="audit-mockup-pillar">
                        <span class="audit-mockup-pillar__name">AI discoverability</span>
                        <span class="audit-mockup-pillar__track"><span class="audit-mockup-pillar__fill" style="width:64%; background:#C68A1E;"></span></span>
                        <span class="audit-mockup-pillar__val">64</span>
                    </div>
                    <div class="audit-mockup-pillar">
                        <span class="audit-mockup-pillar__name">Site &amp; tech health</span>
                        <span class="audit-mockup-pillar__track"><span class="audit-mockup-pillar__fill" style="width:91%; background:#1F9D55;"></span></span>
                        <span class="audit-mockup-pillar__val">91</span>
                    </div>
                    <div class="audit-mockup-pillar">
                        <span class="audit-mockup-pillar__name">Competitor intel</span>
                        <span class="audit-mockup-pillar__track"><span class="audit-mockup-pillar__fill" style="width:79%; background:#1F9D55;"></span></span>
                        <span class="audit-mockup-pillar__val">79</span>
                    </div>
                </div>
                <div class="audit-mockup-grid">
                    <div class="audit-mockup-verdict">
                        <b>Biggest opportunity</b>
                        AI discoverability — most AI tools can't find this brand yet. Structured data and clearer product pages would close most of the gap.
                    </div>
                    <div class="audit-mockup-competitors">
                        <div class="audit-mockup-competitors__title">Competitor intel</div>
                        <div class="audit-mockup-competitor-row"><span>You</span><span>64</span></div>
                        <div class="audit-mockup-competitor-row"><span>Competitor A</span><span>82</span></div>
                        <div class="audit-mockup-competitor-row"><span>Competitor B</span><span>58</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php endif; ?>
</section>


<!-- ═════════════════════ WHAT THE SCAN CHECKS ════════════════════ -->
<section class="scan-checks" aria-label="What the scan checks">
    <div class="container">
        <div class="scan-checks__header">
            <h2 class="scan-checks__headline">What the scan checks</h2>
            <p class="scan-checks__sub">Three plain-English answers. Just whether AI and search can actually find you, and what to do if they can't.</p>
        </div>

        <div class="scan-checks__grid scan-checks__grid--4up">
            <div class="scan-checks__card">
                <div class="scan-checks__icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.5 3.5l2 2M14.5 14.5l2 2M16.5 3.5l-2 2M5.5 14.5l-2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </div>
                <h3>AI discoverability</h3>
                <p>Whether ChatGPT, Perplexity, and Google's AI Overviews actually surface your brand when it matters.</p>
            </div>
            <div class="scan-checks__card">
                <div class="scan-checks__icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 18l5-5 4 4 7-9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <h3>Site &amp; technical health</h3>
                <p>Page speed, crawlability, and the technical groundwork AI and search both need to find you at all.</p>
            </div>
            <div class="scan-checks__card">
                <div class="scan-checks__icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="6" stroke="currentColor" stroke-width="1.6"/><path d="M13.2 13.2L18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </div>
                <h3>Competitor intel</h3>
                <p>What's already being published in your space — and what's sitting open for you to take.</p>
            </div>
            <div class="scan-checks__card scan-checks__card--callout">
                <h3>Don't have a website yet?</h3>
                <p>The scan still works. Tick "no website yet" above and tell us your business and niche — we'll show you the landscape you're stepping into, and whether a site needs to come first.</p>
                <a href="#top" class="btn-outline btn-outline--small">Run the scan anyway →</a>
            </div>
        </div>
    </div>
</section>


<?php if ( is_front_page() ) : ?>
<!-- ═══════════════════ ALSO FROM BLUU (homepage-only) ════════════════ -->
<?php
$scan_other_products = array_filter( bluu_softwares_data(), function ( $p ) {
    return 'BluuAudit' !== $p['name'];
} );
?>
<section class="scan-crosssell" aria-label="Also from Bluu">
    <div class="container">
        <div class="scan-checks__header">
            <h2 class="scan-checks__headline">Also from Bluu</h2>
            <p class="scan-checks__sub">Bluu builds more than the scan — here's the rest of the lineup.</p>
        </div>

        <div class="scan-crosssell__grid">
            <?php foreach ( $scan_other_products as $product ) :
                $product_href = ( strpos( $product['url'], 'http' ) === 0 ) ? $product['url'] : home_url( $product['url'] );
            ?>
                <a href="<?php echo esc_url( $product_href ); ?>" class="scan-crosssell__card">
                    <div class="scan-crosssell__icon"><?php echo bluu_mega_icon( $product['icon'], 20 ); // phpcs:ignore ?></div>
                    <h3><?php echo esc_html( $product['name'] ); ?></h3>
                    <p><?php echo esc_html( $product['desc'] ); ?></p>
                    <span class="scan-next__learn">Learn more →</span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>


<?php if ( is_page_template( 'page-audit.php' ) ) : ?>
<!-- ═══════════════════ AFTER YOUR SCAN (audit-only) ═══════════════ -->
<section class="scan-next" id="next" aria-label="How we help after your scan">
    <div class="container">
        <div class="scan-next__header">
            <h2 class="scan-checks__headline">After your scan</h2>
            <p class="scan-checks__sub">Your scan points to exactly one of these. We don't sell you all four — just the one you actually need.</p>
        </div>

        <div class="scan-next__grid">
            <div class="scan-next__card scan-next__card--blue">
                <div class="scan-checks__icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 5h14M2 9h10M2 13h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                </div>
                <h3>Content Ops</h3>
                <p>If your content is the gap, we run research, writing, publishing, and reporting as one monthly retainer.</p>
                <a href="<?php echo esc_url( home_url( '/content-ops' ) ); ?>" class="scan-next__learn">Learn more →</a>
            </div>
            <div class="scan-next__card scan-next__card--coral">
                <div class="scan-checks__icon scan-checks__icon--coral">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.6"/><path d="M6 16h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </div>
                <h3>Web &amp; App Dev</h3>
                <p>If there's no site yet, or it needs rebuilding, we design and build it from scratch.</p>
                <a href="<?php echo esc_url( home_url( '/services/web-mobile-dev' ) ); ?>" class="scan-next__learn">Learn more →</a>
            </div>
            <div class="scan-next__card scan-next__card--coral">
                <div class="scan-checks__icon scan-checks__icon--coral">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l6 3v4c0 4-3 6-6 7-3-1-6-3-6-7V5l6-3z" stroke="currentColor" stroke-width="1.6"/></svg>
                </div>
                <h3>Web Management</h3>
                <p>If your site exists but nobody's keeping it current, we take over updates, fixes, and improvements.</p>
                <a href="<?php echo esc_url( home_url( '/services/web-manage' ) ); ?>" class="scan-next__learn">Learn more →</a>
            </div>
            <div class="scan-next__card scan-next__card--coral">
                <div class="scan-checks__icon scan-checks__icon--coral">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="4.5" rx="1.2" stroke="currentColor" stroke-width="1.6"/><rect x="2" y="10.5" width="14" height="4.5" rx="1.2" stroke="currentColor" stroke-width="1.6"/></svg>
                </div>
                <h3>Hosting</h3>
                <p>If your site is slow or unreliable, we move it to infrastructure that's actually maintained.</p>
                <a href="<?php echo esc_url( home_url( '/services/hosting' ) ); ?>" class="scan-next__learn">Learn more →</a>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>


<!-- ═══════════════════════════ FAQ ═══════════════════════════════ -->
<section class="scan-faq" id="faq" aria-label="Frequently asked questions">
    <div class="container">
        <div class="scan-checks__header">
            <h2 class="scan-checks__headline">FAQ</h2>
        </div>

        <div class="scan-faq__list">
            <?php
            $scan_faqs = [
                [ 'q' => 'What is an AI visibility score?', 'a' => 'It\'s a measure of whether AI tools like ChatGPT, Perplexity, and Google\'s AI Overviews actually surface your brand when someone asks a relevant question — separate from, but related to, traditional search rankings.' ],
                [ 'q' => 'Is this different from a normal SEO audit?', 'a' => 'Yes. A standard SEO audit checks how Google ranks your pages. This also checks whether AI answer engines cite or recommend you at all, which depends on different signals like structured data and content clarity.' ],
                [ 'q' => 'Do I need a website to run the scan?', 'a' => 'No. Tick "no website yet" and tell us your business and niche instead — we\'ll show you what\'s already being published in your space and whether a site needs to exist before anything else.' ],
                [ 'q' => 'Is the scan really free?', 'a' => 'Yes, no card required. You\'ll see your top results immediately; a fuller breakdown is sent to your email.' ],
                [ 'q' => 'What happens after I get my results?', 'a' => 'We point you to whichever of our four services matches what the scan found — content, a new site, ongoing site management, or hosting — and you can book a short call if you want a second opinion.' ],
            ];
            foreach ( $scan_faqs as $i => $faq ) :
            ?>
            <div class="scan-faq__item">
                <button class="scan-faq__question" type="button" aria-expanded="false" aria-controls="scan-faq-<?php echo $i; ?>">
                    <?php echo esc_html( $faq['q'] ); ?>
                    <span class="scan-faq__plus" aria-hidden="true">+</span>
                </button>
                <div class="scan-faq__answer" id="scan-faq-<?php echo $i; ?>">
                    <p><?php echo esc_html( $faq['a'] ); ?></p>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>


<!-- ══════════════════════════ FINAL CTA ══════════════════════════ -->
<section class="home-cta" id="cta" aria-label="Call to action">
    <div class="container container--narrow">
        <h2 class="home-cta__headline">Ready to see where you stand?</h2>
        <p class="home-cta__body">Run the free scan, or skip straight to a conversation.</p>
        <div class="scan-hero__cta-group">
            <a href="#top" class="btn-primary">Run your free scan</a>
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-outline" style="background:#fff">Let's talk</a>
        </div>
        <p class="home-cta__note">Limited monthly capacity</p>
    </div>
</section>

<!-- ═══════════════════ NO-SITE TOGGLE SCRIPT ════════════════════ -->
<script>
(function() {
    'use strict';
    var toggle = document.getElementById('noSiteToggle');
    var domain = document.getElementById('domainInput');
    var noSite = document.getElementById('noSiteFields');
    if (!toggle || !domain || !noSite) return;

    toggle.addEventListener('change', function() {
        if (toggle.checked) {
            domain.style.display = 'none';
            noSite.style.display = 'flex';
        } else {
            domain.style.display = 'block';
            noSite.style.display = 'none';
        }
    });

    // FAQ accordion
    document.querySelectorAll('.scan-faq__item').forEach(function(item) {
        var btn = item.querySelector('.scan-faq__question');
        var answer = item.querySelector('.scan-faq__answer');
        if (!btn || !answer) return;
        btn.addEventListener('click', function() {
            var isOpen = btn.getAttribute('aria-expanded') === 'true';
            document.querySelectorAll('.scan-faq__item').forEach(function(o) {
                o.querySelector('.scan-faq__question').setAttribute('aria-expanded', 'false');
                o.querySelector('.scan-faq__answer').style.maxHeight = null;
            });
            if (!isOpen) {
                btn.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}());
</script>
