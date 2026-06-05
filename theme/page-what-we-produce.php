<?php
/**
 * Template Name: What We Produce
 *
 * @package bluu-interactive
 */

// ── ACF fields with defaults ──────────────────────────────────────────────────
$hero_badge    = ( function_exists( 'get_field' ) ? get_field( 'wwp_hero_badge' )    : '' ) ?: 'Every deliverable. Every format.';
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'wwp_hero_headline' ) : '' ) ?: 'One retainer. Everything your content operation needs.';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'wwp_hero_body' )     : '' ) ?: 'Bluu produces content across every channel your audience uses — written, structured for discovery, and repurposed into every format that earns attention. Here is the complete list of what we build for clients.';

$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'wwp_cta_headline' ) : '' ) ?: 'Not sure which content types your operation needs?';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'wwp_cta_body' )     : '' ) ?: "Most clients start with two or three deliverable types and expand as the operation matures. Book a 15-minute Discovery Call and we will tell you exactly which content types would have the most impact for your specific audience, stage, and channels.";
$cta_url      = ( function_exists( 'get_field' ) ? get_field( 'wwp_cta_url' )      : '' ) ?: home_url( '/contact' );

// ── Hero image — ACF image field (returns array); fallback to Unsplash ────────
$hero_image = function_exists( 'get_field' ) ? get_field( 'wwp_hero_image' ) : null;
if ( ! empty( $hero_image ) ) {
    $hero_img_src = is_array( $hero_image ) ? esc_url( $hero_image['url'] ) : esc_url( $hero_image );
    $hero_img_alt = is_array( $hero_image ) ? esc_attr( $hero_image['alt'] ) : '';
} else {
    $hero_img_src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80';
    $hero_img_alt = 'Content strategist working at a desk with notebook and laptop';
}

// ── Content sections 01–07 ────────────────────────────────────────────────────
$sections = array(
    array(
        'number' => '01',
        'title'  => 'Research and intelligence',
        'intro'  => 'The foundation of everything Bluu produces. Before a word is written, the intelligence is gathered.',
        'rows'   => array(
            array( 'deliverable' => 'Competitor content digest',          'what' => 'Weekly or monthly summary of what competitors are publishing, what is performing, and what gaps they are leaving' ),
            array( 'deliverable' => 'Leading signal report',              'what' => 'Job posting analysis, review pattern monitoring, pricing page changes, and LinkedIn engagement anomalies — the signals that reveal where competitors are going before they announce it' ),
            array( 'deliverable' => 'Audience pain research',             'what' => 'Real language and real frustrations pulled from Reddit, LinkedIn, Quora, and community forums — the intelligence that makes content feel written for a specific reader' ),
            array( 'deliverable' => 'Keyword and trend intelligence brief','what' => 'Keyword clusters by search intent stage, People Also Ask questions, AI discovery patterns, and trending topics in your category' ),
            array( 'deliverable' => 'Market pulse report',                'what' => 'Deep research into any market, topic, or competitor landscape — on-demand category intelligence' ),
            array( 'deliverable' => 'Monthly performance report',         'what' => 'Traffic, engagement, inbound signals, keyword movement, and content-attributed conversations — structured to inform next month\'s decisions' ),
        ),
    ),
    array(
        'number' => '02',
        'title'  => 'Long-form written content',
        'intro'  => 'The core of the content operation. Every long-form piece is research-led, audience-specific, and built to rank in both traditional search and AI-powered discovery tools.',
        'rows'   => array(
            array( 'deliverable' => 'Blog posts',                       'what' => 'Research-led, structured for discovery, 800–2,500 words depending on topic and intent stage' ),
            array( 'deliverable' => 'LinkedIn articles',                'what' => 'Long-form argument written natively for LinkedIn\'s feed behaviour — shorter and more direct than a blog post, structured for the platform' ),
            array( 'deliverable' => 'Cornerstone / pillar content',     'what' => 'The definitive piece in a content territory — 1,500–2,500+ words, built to be the reference point every other piece links back to' ),
            array( 'deliverable' => 'Thought leadership pieces',        'what' => 'Founder or leadership voice — opinion grounded in evidence, structured to earn authority rather than assert it' ),
            array( 'deliverable' => 'White papers and research reports', 'what' => 'Long-form category intelligence documents — original synthesis of market data, audience research, and competitive landscape' ),
            array( 'deliverable' => 'Case studies',                     'what' => 'Client interview, narrative write-up, PDF format, and six repurposed assets — the full case study production cycle' ),
            array( 'deliverable' => 'Customer spotlights',              'what' => 'Success story written from the customer\'s perspective — designed for sales use and social proof' ),
        ),
    ),
    array(
        'number' => '03',
        'title'  => 'Short-form and social content',
        'intro'  => 'Every long-form piece produces a set of short-form assets. These are not summaries — they are adaptations written for the mindset of each specific channel.',
        'rows'   => array(
            array( 'deliverable' => 'LinkedIn Post A — Sharp observation',    'what' => 'The core tension or counterintuitive insight from the post, written to stop the scroll in the first sentence' ),
            array( 'deliverable' => 'LinkedIn Post B — Practical breakdown',  'what' => 'The framework, how-to, or numbered list from the post — written to earn saves' ),
            array( 'deliverable' => 'LinkedIn Post C — Standalone provocation','what' => 'A complete argument that works without the link — designed to earn shares from people who have never visited the blog' ),
            array( 'deliverable' => 'X / Twitter thread',                     'what' => 'The post\'s argument broken into 6–8 sequential posts, each a complete thought, the final post linking to the full piece' ),
            array( 'deliverable' => 'X / Twitter single post',                'what' => 'A single sharp observation or data point adapted for X\'s conversational, opinion-forward culture' ),
            array( 'deliverable' => 'Instagram caption',                      'what' => 'Short, single-idea caption designed to work against an image and draw the audience toward the thinking behind it' ),
            array( 'deliverable' => 'Video / audio script',                   'what' => 'Talking points that extract the key argument from a long-form piece in a format suitable for a 2–3 minute video or podcast segment' ),
        ),
    ),
    array(
        'number' => '04',
        'title'  => 'Email and newsletter content',
        'intro'  => 'The highest-quality attention channel available to a B2B brand. Bluu writes, formats, and sends newsletters via the client\'s existing email platform.',
        'rows'   => array(
            array( 'deliverable' => 'Email newsletter',       'what' => 'Written, formatted, and scheduled — a curated editorial product that earns the subscriber\'s attention rather than broadcasting to them' ),
            array( 'deliverable' => 'Newsletter section',     'what' => 'A stand-alone curated section for clients who manage their own newsletter but want Bluu to contribute a regular editorial slot' ),
            array( 'deliverable' => 'Email sequences',        'what' => 'Onboarding, nurture, and re-engagement sequences — written in the brand\'s voice, structured to move the reader toward a specific decision' ),
            array( 'deliverable' => 'Promotional email copy', 'what' => 'Campaign-specific email copy for product launches, event invitations, or time-sensitive offers' ),
        ),
    ),
    array(
        'number' => '05',
        'title'  => 'Website and page content',
        'intro'  => 'Every page Bluu produces is structured for discovery — written to rank, written to convert, and built with the right metadata from the first draft.',
        'rows'   => array(
            array( 'deliverable' => 'Homepage copy',             'what' => 'Full homepage narrative — hero headline, sub-headline, problem section, solution section, social proof, and CTA' ),
            array( 'deliverable' => 'Industry hub pages',        'what' => 'Category-level pages targeting a broad industry audience — the top of the industry content architecture' ),
            array( 'deliverable' => 'Sub-industry pages',        'what' => 'Specific pages targeting a defined sub-audience within a broader industry — the depth layer of the content architecture' ),
            array( 'deliverable' => 'Use case / scenario pages', 'what' => 'Targeted pages written for a specific buyer in a specific situation — the highest-converting page type in most B2B content architectures' ),
            array( 'deliverable' => 'About page copy',           'what' => 'Brand story and mission — written to build trust with the specific audience the business serves' ),
            array( 'deliverable' => 'Landing page copy',         'what' => 'Campaign-specific pages built for a single conversion action' ),
            array( 'deliverable' => 'FAQ sections',              'what' => 'Questions the audience is already asking, answered directly — built to rank for People Also Ask queries and to be cited by AI' ),
            array( 'deliverable' => 'SEO titles and meta descriptions', 'what' => 'Written for every page — under character limits, keyword-inclusive, outcome-led' ),
        ),
    ),
    array(
        'number' => '06',
        'title'  => 'Visual and repurposed assets',
        'intro'  => 'Content that travels beyond the blog and the feed — shareable, visual, and built to earn attention in formats beyond text.',
        'rows'   => array(
            array( 'deliverable' => 'Instagram infographics', 'what' => '4:5 format, branded, structured for the feed — data, frameworks, or comparison content visualised in Bluu\'s design system' ),
            array( 'deliverable' => 'Pull quote cards',       'what' => 'The sharpest sentence from each long-form piece, formatted as a shareable image asset' ),
            array( 'deliverable' => 'Presentation decks',    'what' => 'Narrative structure and copy for pitch decks, investor presentations, or client-facing slide decks' ),
            array( 'deliverable' => 'Podcast show notes',    'what' => 'Structured summaries of podcast episodes — formatted for search discovery and listener reference' ),
        ),
    ),
    array(
        'number' => '07',
        'title'  => 'Sales and commercial content',
        'intro'  => 'Content that directly supports the sales process — from awareness through to conversion.',
        'rows'   => array(
            array( 'deliverable' => 'Ad copy and campaign content', 'what' => 'Copy for paid social, display, and search campaigns — written to convert the specific audience segment targeted' ),
            array( 'deliverable' => 'Sales deck narrative',         'what' => 'The story and copy behind a sales presentation — structured to move a prospect from interest to decision' ),
            array( 'deliverable' => 'Cold outreach copy',           'what' => 'LinkedIn and email outreach sequences — written in a voice that earns a response rather than triggering a delete' ),
            array( 'deliverable' => 'Product one-pagers',           'what' => 'Single-page commercial documents — the full product or service story in a format designed for sales conversations' ),
        ),
    ),
);

// ── Repurposed assets list ─────────────────────────────────────────────────────
$repurposed_assets = array(
    'LinkedIn Post A — sharp observation',
    'LinkedIn Post B — practical breakdown',
    'LinkedIn Post C — standalone provocation',
    'Email newsletter section',
    'X / Twitter thread (6–8 posts)',
    'Instagram caption',
    'Pull quote card',
    'Video / audio script excerpt',
    'FAQ entry or knowledge base addition',
);

// ── Standards grid ────────────────────────────────────────────────────────────
$standards = array(
    array(
        'icon'  => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6M11 8v6"/></svg>',
        'title' => 'Structured for discovery',
        'body'  => 'Every deliverable is built to be found in both traditional search and AI-powered discovery tools — Perplexity, ChatGPT, Google AI Overviews. Direct answers. Named sources. Clean structure. No padding.',
    ),
    array(
        'icon'  => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        'title' => 'Human review before anything publishes',
        'body'  => 'Every piece is reviewed by a human strategist before it goes anywhere. Research-informed, editorially sound, and on-brand — not a raw AI output with your logo on it.',
    ),
    array(
        'icon'  => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
        'title' => 'Brand voice alignment',
        'body'  => 'Every piece is written in your brand\'s voice — not Bluu\'s voice, not a generic agency voice. The brief captures the voice. Every deliverable reflects it.',
    ),
    array(
        'icon'  => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        'title' => 'Built from real intelligence',
        'body'  => 'Nothing Bluu produces is based on internal assumption. Every piece is informed by real audience research, real competitor intelligence, and real keyword and trend data gathered before a word is written.',
    ),
);

get_header();
?>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="wwp-hero" aria-label="<?php esc_attr_e( 'What we produce overview', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="wwp-hero__inner">

            <!-- Left: text -->
            <div class="wwp-hero__content animate-on-scroll">
                <div class="wwp-hero__badge"><?php echo esc_html( $hero_badge ); ?></div>
                <h1 class="wwp-hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>
                <p class="wwp-hero__body"><?php echo bluu_text( $hero_body ); ?></p>
            </div>

            <!-- Right: image -->
            <div class="wwp-hero__visual animate-on-scroll">
                <div class="wwp-hero__image-wrap">
                    <img
                        src="<?php echo $hero_img_src; // phpcs:ignore ?>"
                        alt="<?php echo $hero_img_alt; // phpcs:ignore ?>"
                        loading="eager"
                        decoding="async"
                    >
                </div>
            </div>

        </div>
    </div>
</section>

<!-- ── Intro ─────────────────────────────────────────────────────────────────── -->
<section class="wwp-intro">
    <div class="container">
        <div class="wwp-intro__inner">
            <p class="wwp-intro__p">Most content agencies produce blog posts and call it a content operation. Bluu produces the full stack — from the intelligence that informs every piece, to the long-form content that builds authority, to the repurposed assets that distribute it across every channel your audience is actually on.</p>
            <p class="wwp-intro__p">Every deliverable is research-led. Every piece is structured for discovery in both search and AI tools. Nothing is produced without a brief grounded in real audience intelligence and real competitive context.</p>
        </div>
    </div>
</section>

<!-- ── Service cards grid ────────────────────────────────────────────────────── -->
<section class="wwp-cards" aria-label="<?php esc_attr_e( 'Content categories', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="wwp-cards__header animate-on-scroll">
            <h2 class="wwp-cards__headline"><?php esc_html_e( 'Every content type, in one place', 'bluu-interactive' ); ?></h2>
            <p class="wwp-cards__sub"><?php esc_html_e( 'Seven categories covering every channel, every format, and every stage of the funnel. Select any category to see the full deliverable breakdown.', 'bluu-interactive' ); ?></p>
        </div>

        <div class="wwp-cards__grid">
            <?php foreach ( $sections as $index => $section ) :
                $summary = wp_trim_words( $section['intro'], 18, '…' );
                $count   = count( $section['rows'] );
            ?>
            <div class="wwp-card animate-on-scroll">
                <div class="wwp-card__inner">
                    <div class="wwp-card__top">
                        <span class="wwp-card__number" aria-hidden="true"><?php echo esc_html( $section['number'] ); ?></span>
                        <h3 class="wwp-card__title"><?php echo esc_html( $section['title'] ); ?></h3>
                        <p class="wwp-card__summary"><?php echo esc_html( $summary ); ?></p>
                    </div>
                    <div class="wwp-card__foot">
                        <span class="wwp-card__count">
                            <?php echo esc_html( $count ); ?> content type<?php echo $count !== 1 ? 's' : ''; ?>
                        </span>
                        <button
                            class="wwp-card__btn"
                            data-wwp-open="<?php echo esc_attr( $index ); ?>"
                            aria-haspopup="dialog"
                        >
                            <?php esc_html_e( 'See full breakdown', 'bluu-interactive' ); ?>
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>

            <!-- 8th card: How repurposing works — distinct dark treatment -->
            <div class="wwp-card wwp-card--repurpose animate-on-scroll">
            <div class="wwp-card__inner">
                <div class="wwp-card__top">
                    <span class="wwp-card__number">How it works</span>
                    <h3 class="wwp-card__title">Content repurposing</h3>
                    <p class="wwp-card__summary">Every long-form piece becomes nine assets — each adapted for the mindset of a specific channel, not copy-pasted.</p>
                </div>
                <div class="wwp-card__foot">
                    <span class="wwp-card__count">9 assets per piece</span>
                    <button
                        class="wwp-card__btn wwp-card__btn--repurpose"
                        data-wwp-open="repurpose"
                        aria-haspopup="dialog"
                    >
                        <?php esc_html_e( 'See how it works', 'bluu-interactive' ); ?>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        </div><!-- /.wwp-cards__grid -->

    </div><!-- /.container -->
</section>

<!-- ── Off-canvas modals ──────────────────────────────────────────────────────── -->
<div class="wwp-overlay" id="wwp-overlay" aria-hidden="true"></div>

<?php foreach ( $sections as $index => $section ) : ?>
<div
    class="wwp-panel"
    id="wwp-panel-<?php echo esc_attr( $index ); ?>"
    role="dialog"
    aria-modal="true"
    aria-label="<?php echo esc_attr( $section['title'] ); ?>"
    aria-hidden="true"
>
    <div class="wwp-panel__header">
        <div class="wwp-panel__meta">
            <span class="wwp-panel__number" aria-hidden="true"><?php echo esc_html( $section['number'] ); ?></span>
            <h2 class="wwp-panel__title"><?php echo esc_html( $section['title'] ); ?></h2>
        </div>
        <button class="wwp-panel__close" data-wwp-close aria-label="<?php esc_attr_e( 'Close panel', 'bluu-interactive' ); ?>">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    </div>

    <div class="wwp-panel__body">
        <p class="wwp-panel__intro"><?php echo esc_html( $section['intro'] ); ?></p>

        <div class="wwp-panel__table-wrap">
            <table class="wwp-panel__table">
                <thead>
                    <tr>
                        <th scope="col"><?php esc_html_e( 'Deliverable', 'bluu-interactive' ); ?></th>
                        <th scope="col"><?php esc_html_e( 'What it is', 'bluu-interactive' ); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $section['rows'] as $i => $row ) : ?>
                    <tr class="<?php echo ( $i % 2 !== 0 ) ? 'wwp-panel__row--alt' : ''; ?>">
                        <td class="wwp-panel__cell--deliverable"><?php echo esc_html( $row['deliverable'] ); ?></td>
                        <td class="wwp-panel__cell--what"><?php echo esc_html( $row['what'] ); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="wwp-panel__footer">
        <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary">
            <?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?>
        </a>
        <button class="btn-text" data-wwp-close><?php esc_html_e( 'Close', 'bluu-interactive' ); ?></button>
    </div>
</div>
<?php endforeach; ?>

<!-- Repurposing panel -->
<div
    class="wwp-panel"
    id="wwp-panel-repurpose"
    role="dialog"
    aria-modal="true"
    aria-label="<?php esc_attr_e( 'How content repurposing works', 'bluu-interactive' ); ?>"
    aria-hidden="true"
>
    <div class="wwp-panel__header">
        <div class="wwp-panel__meta">
            <span class="wwp-panel__number"><?php esc_html_e( 'How it works', 'bluu-interactive' ); ?></span>
            <h2 class="wwp-panel__title"><?php esc_html_e( 'Content repurposing', 'bluu-interactive' ); ?></h2>
        </div>
        <button class="wwp-panel__close" data-wwp-close aria-label="<?php esc_attr_e( 'Close panel', 'bluu-interactive' ); ?>">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    </div>

    <div class="wwp-panel__body">
        <p class="wwp-panel__intro"><?php esc_html_e( 'Every long-form piece Bluu produces comes with a full set of repurposed assets. The thinking happens once. The content works across every channel.', 'bluu-interactive' ); ?></p>

        <div class="wwp-panel__repurpose-wrap">
            <p class="wwp-panel__repurpose-label"><?php esc_html_e( 'One blog post becomes:', 'bluu-interactive' ); ?></p>
            <ol class="wwp-panel__repurpose-list">
                <?php foreach ( $repurposed_assets as $i => $asset ) : ?>
                <li class="wwp-panel__repurpose-item">
                    <span class="wwp-panel__repurpose-num"><?php echo esc_html( $i + 1 ); ?></span>
                    <span class="wwp-panel__repurpose-text"><?php echo esc_html( $asset ); ?></span>
                </li>
                <?php endforeach; ?>
            </ol>
            <p class="wwp-panel__repurpose-note"><?php esc_html_e( 'Nine assets from one piece of research. Not copy-pasted — adapted for the mindset of each channel\'s audience, in the format that earns attention on that specific platform.', 'bluu-interactive' ); ?></p>
        </div>
    </div>

    <div class="wwp-panel__footer">
        <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary">
            <?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?>
        </a>
        <button class="btn-text" data-wwp-close><?php esc_html_e( 'Close', 'bluu-interactive' ); ?></button>
    </div>
</div>

<!-- ── What every deliverable includes ──────────────────────────────────────── -->
<section class="wwp-standards" aria-label="<?php esc_attr_e( 'What every deliverable includes', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="wwp-standards__header animate-on-scroll">
            <h2 class="wwp-standards__headline"><?php esc_html_e( 'What every deliverable includes as standard', 'bluu-interactive' ); ?></h2>
            <p class="wwp-standards__sub"><?php esc_html_e( 'Regardless of format or channel, every piece of content Bluu produces includes the following.', 'bluu-interactive' ); ?></p>
        </div>

        <div class="wwp-standards__grid">
            <?php foreach ( $standards as $item ) : ?>
            <div class="wwp-standard-card animate-on-scroll">
                <div class="wwp-standard-card__icon"><?php echo $item['icon']; // phpcs:ignore ?></div>
                <h3 class="wwp-standard-card__title"><?php echo esc_html( $item['title'] ); ?></h3>
                <p class="wwp-standard-card__body"><?php echo bluu_text( $item['body'] ); ?></p>
            </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<!-- ── CTA ───────────────────────────────────────────────────────────────────── -->
<section class="wwp-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="wwp-cta__inner">
            <div class="wwp-cta__text">
                <h2 class="wwp-cta__headline"><?php echo esc_html( $cta_headline ); ?></h2>
                <p class="wwp-cta__body"><?php echo bluu_text( $cta_body ); ?></p>
            </div>
            <div class="wwp-cta__actions">
                <a href="<?php echo esc_url( $cta_url ); ?>" class="btn-primary btn-primary--large">
                    <?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                </a>
                <p class="wwp-cta__note"><?php esc_html_e( 'No pitch. No pressure.', 'bluu-interactive' ); ?></p>
            </div>
        </div>
    </div>
</section>

<!-- Mobile sticky CTA — hidden on desktop via CSS ─────────────────────────────-->
<div class="wwp-mobile-cta" aria-hidden="true">
    <a href="<?php echo esc_url( $cta_url ); ?>" class="wwp-mobile-cta__btn btn-primary" tabindex="-1">
        <?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?>
    </a>
</div>

<?php get_footer(); ?>
