<?php
/**
 * Bluu Interactive — FAQ Content Seeder
 *
 * Clears all existing FAQ ACF data on the FAQ page and replaces it with
 * current content aligned to Bluu's managed content retainer positioning.
 *
 * Run via WP-CLI:
 *   wp eval-file wp-content/themes/bluu-interactive/inc/faq-seeder.php
 *
 * Or trigger from Tools > Bluu Seeder if wired in (see seeder-tool.php).
 *
 * Requires ACF Pro (update_field support for repeaters).
 */

if ( ! defined( 'ABSPATH' ) ) {
    // Standalone WP-CLI execution path
    $wp_load = dirname( __FILE__, 5 ) . '/wp-load.php';
    if ( file_exists( $wp_load ) ) {
        require_once $wp_load;
    } else {
        exit( "Cannot locate wp-load.php. Run via WP-CLI: wp eval-file inc/faq-seeder.php\n" );
    }
}

if ( ! function_exists( 'update_field' ) ) {
    echo "ACF not active or not loaded yet. Aborting FAQ seeder.\n";
    return; // use return not exit — safe for both include and direct run
}

// ── Find the FAQ page ─────────────────────────────────────────────────────────
$faq_pages = get_posts( array(
    'post_type'   => 'page',
    'post_status' => 'publish',
    'meta_query'  => array(
        array(
            'key'   => '_wp_page_template',
            'value' => 'page-faq.php',
        ),
    ),
    'numberposts' => 1,
) );

if ( empty( $faq_pages ) ) {
    // Fallback: find by slug
    $faq_pages = get_posts( array(
        'name'        => 'faqs',
        'post_type'   => 'page',
        'post_status' => 'publish',
        'numberposts' => 1,
    ) );
}

if ( empty( $faq_pages ) ) {
    echo "FAQ page not found. Create a page with template 'page-faq.php' and slug 'faqs' first.\n";
    return;
}

$faq_id = $faq_pages[0]->ID;
echo "Found FAQ page: ID {$faq_id} — \"{$faq_pages[0]->post_title}\"\n";

// ── FAQ content ───────────────────────────────────────────────────────────────
$categories = array(

    // ── 1. Getting Started ────────────────────────────────────────────────────
    array(
        'category_name'        => 'Getting started',
        'category_description' => '',
        'category_icon'        => 'start',
        'faq_items'            => array(
            array(
                'question' => 'What exactly does Bluu Interactive do?',
                'answer'   => 'Bluu runs your entire content operation as a managed retainer. That means research, writing, publishing, reporting — and the strategy holding it together — delivered every month under one flat fee. You brief us on your business. We handle everything from there.',
            ),
            array(
                'question' => 'Who is Bluu for?',
                'answer'   => 'Founders, marketing leads, and growing teams who need a consistent, high-quality content presence but do not have the time or headcount to run it in-house. We work across B2B SaaS, agencies, professional services, and e-commerce brands.',
            ),
            array(
                'question' => 'How is this different from hiring a freelance content writer?',
                'answer'   => 'A freelance writer produces words. Bluu runs a content operation. That includes competitor and audience research, keyword and AI discovery monitoring, editorial strategy, writing, brand voice alignment, publishing, and monthly performance reporting. You get a team, not a contractor.',
            ),
            array(
                'question' => 'How do we get started?',
                'answer'   => 'Book a 15-minute Discovery Call. We will ask about your business, your audience, and what you have tried before. If we are a good fit, we scope the right retainer tier and onboard you within the week. No pitch deck. No sales pressure.',
            ),
            array(
                'question' => 'How long does onboarding take?',
                'answer'   => 'Typically three to five working days. We start with a brand voice and audience intake session, review any existing content, and set up your client portal access. By the end of the first week, your editorial calendar is live.',
            ),
        ),
    ),

    // ── 2. Pricing & Commitment ───────────────────────────────────────────────
    array(
        'category_name'        => 'Pricing & commitment',
        'category_description' => '',
        'category_icon'        => 'pricing',
        'faq_items'            => array(
            array(
                'question' => 'What do the retainer tiers cost?',
                'answer'   => 'Starter is $1,500/mo, Growth is $2,500/mo, and Premium is $3,500/mo. All tiers are billed monthly with no setup fees. A full breakdown of what each tier includes is on the Pricing page.',
            ),
            array(
                'question' => 'Is there a minimum commitment?',
                'answer'   => 'Every plan starts with a 90-day initial period. After that, it is month-to-month. We do not lock clients in because we do not need to — the work keeps clients here.',
            ),
            array(
                'question' => 'Can I pause or cancel my retainer?',
                'answer'   => 'Yes. After the initial 90-day period, you can pause or cancel with 30 days notice. There are no cancellation fees. If you pause, your slot is held for up to 60 days before it opens to the waiting list.',
            ),
            array(
                'question' => 'Do you offer a trial or a sample piece before committing?',
                'answer'   => 'We do not offer free trials — good content requires real research investment and we do not produce spec work. What we do offer is a no-obligation Discovery Call where we walk through our process, show examples relevant to your industry, and answer every question you have before you decide.',
            ),
            array(
                'question' => 'Are there any add-on costs outside the retainer?',
                'answer'   => 'The retainer covers everything in your plan. Add-ons — like standalone case studies, additional long-form pieces, or market pulse reports — are available at fixed per-unit pricing. Nothing is added to your bill without your approval.',
            ),
            array(
                'question' => 'Do you offer a founding client rate?',
                'answer'   => 'Yes. A small number of early-stage clients are onboarded at a reduced rate that is locked in for life as long as the retainer remains active. Ask us about availability on your Discovery Call.',
            ),
        ),
    ),

    // ── 3. Content & Deliverables ─────────────────────────────────────────────
    array(
        'category_name'        => 'Content & deliverables',
        'category_description' => '',
        'category_icon'        => 'content',
        'faq_items'            => array(
            array(
                'question' => 'What types of content do you produce?',
                'answer'   => 'Long-form blog posts and LinkedIn articles, short-form social captions, newsletters, X/Twitter threads, video and audio scripts, use case and scenario pages, case studies, and ad copy. Exactly what is included depends on your retainer tier.',
            ),
            array(
                'question' => 'How do you maintain our brand voice?',
                'answer'   => 'During onboarding we build a brand voice and style guide from your existing materials, tone preferences, and a short briefing session. Every piece is written and reviewed against this guide. The longer we work together, the sharper the voice alignment becomes.',
            ),
            array(
                'question' => 'Do you use AI to write the content?',
                'answer'   => 'We use AI as a research and drafting tool — the same way experienced editors use it. Every piece is written, structured, and reviewed by a human strategist before it goes anywhere near a publish button. You will not receive a raw AI output with a Bluu header on it.',
            ),
            array(
                'question' => 'Is the content optimised for SEO and AI discovery?',
                'answer'   => 'Yes — at every tier, not as a premium add-on. Every piece is structured for discovery in search engines and in the AI tools your audience already uses: Perplexity, Google AI Overviews, ChatGPT. This includes semantic structure, keyword alignment, and entity-level content architecture.',
            ),
            array(
                'question' => 'How many revision rounds do I get?',
                'answer'   => 'Starter clients receive one revision round per piece. Growth clients receive two. Premium clients have unlimited revisions. In practice, revisions are rare because the brief and voice guide are thorough before writing begins.',
            ),
            array(
                'question' => 'Do you publish directly to our channels?',
                'answer'   => 'Yes. Depending on your tier, Bluu publishes to LinkedIn, Instagram, X/Twitter, your website CMS, and your email platform. We work inside your existing accounts — we do not require platform transfers or ownership changes.',
            ),
            array(
                'question' => 'Who owns the content you produce?',
                'answer'   => 'You do, completely. From the moment a piece is delivered, all rights belong to your business. We retain no licence to reuse or republish your content in any form.',
            ),
        ),
    ),

    // ── 4. Research & Strategy ────────────────────────────────────────────────
    array(
        'category_name'        => 'Research & strategy',
        'category_description' => '',
        'category_icon'        => 'info',
        'faq_items'            => array(
            array(
                'question' => 'What does "research-led" actually mean in practice?',
                'answer'   => 'Before a single word is written, we analyse your competitors, track industry trends, monitor keyword and AI discovery signals, and map your audience\'s real questions. Content topics are chosen because the research shows they will perform — not because they look good on an editorial calendar.',
            ),
            array(
                'question' => 'How do you track competitor content?',
                'answer'   => 'We monitor competitor publishing cadence, topic focus, keyword rankings, and content format shifts on an ongoing basis. Starter clients receive monthly competitor digests. Growth clients receive weekly. Premium clients receive continuous monitoring with real-time alerts.',
            ),
            array(
                'question' => 'What is the monthly intelligence session?',
                'answer'   => 'A live call with your Bluu strategist — 60 minutes on Growth, 90 minutes on Premium — where we review what performed, what the research is showing, and what the next month\'s content plan is built around. It is a strategic working session, not a reporting read-out.',
            ),
            array(
                'question' => 'Do you track AI discovery, not just Google?',
                'answer'   => 'Yes. We monitor how your brand, competitors, and target topics appear in Perplexity, Google AI Overviews, and ChatGPT responses. AI discovery is now a significant source of B2B research traffic and we structure content specifically to appear there.',
            ),
        ),
    ),

    // ── 5. Working Together ───────────────────────────────────────────────────
    array(
        'category_name'        => 'Working together',
        'category_description' => '',
        'category_icon'        => 'info',
        'faq_items'            => array(
            array(
                'question' => 'How much of our time does this require?',
                'answer'   => 'Minimal. After onboarding, most clients spend 30–60 minutes per month on a strategy call. We handle everything else. For Growth and Premium clients, the monthly intelligence session replaces the strategy call and is the primary touchpoint.',
            ),
            array(
                'question' => 'How do approvals work?',
                'answer'   => 'All content is delivered via your client portal before publishing. You review and approve, request revisions, or greenlight directly in the portal. Nothing is published without your sign-off.',
            ),
            array(
                'question' => 'What is the client portal?',
                'answer'   => 'Bluu\'s own CRM-integrated portal where you can see your content calendar, review drafts, raise support tickets, track deliverables, and access performance reports — all in one place. No third-party project management tools required on your side.',
            ),
            array(
                'question' => 'What happens if I need something urgently outside my plan?',
                'answer'   => 'Raise a support ticket in your portal. Urgent requests are triaged within two hours on Premium, same business day on Growth. Out-of-scope items are quoted as add-ons at fixed pricing before any work begins.',
            ),
            array(
                'question' => 'Can I upgrade or downgrade my tier?',
                'answer'   => 'Yes. Tier changes take effect at the next billing cycle. Upgrading is immediate if capacity allows. Downgrading requires 30 days notice. There are no penalties for changing tier.',
            ),
            array(
                'question' => 'Do you work with multiple stakeholders on our team?',
                'answer'   => 'Yes. Your portal supports multiple user accounts. Typically we work with one primary contact (marketing lead or founder) but can accommodate input from sales, product, or leadership as needed.',
            ),
        ),
    ),

    // ── 6. Results & Reporting ────────────────────────────────────────────────
    array(
        'category_name'        => 'Results & reporting',
        'category_description' => '',
        'category_icon'        => 'info',
        'faq_items'            => array(
            array(
                'question' => 'How quickly will we see results?',
                'answer'   => 'Content compounds over time. Most clients see measurable improvements in organic reach and engagement within 60–90 days. Search ranking and AI discovery improvements typically show clearly by month three to six, depending on domain authority and publishing cadence.',
            ),
            array(
                'question' => 'What does the monthly performance report include?',
                'answer'   => 'A summary of content published, channel-level engagement metrics, SEO keyword movement, top-performing pieces, and a recommended focus for the next month based on what the data is showing. Premium clients also receive a weekly snapshot.',
            ),
            array(
                'question' => 'Do you guarantee specific results?',
                'answer'   => 'No. Any agency that guarantees specific ranking positions or follower numbers is making claims it cannot back. What we guarantee is consistent, research-led, professionally produced content delivered every month — and a clear feedback loop so you can see exactly what is working.',
            ),
            array(
                'question' => 'How do you measure whether content is performing in AI discovery?',
                'answer'   => 'We run structured test queries across Perplexity, Google AI Overviews, and ChatGPT to check whether your brand and content are being surfaced in response to relevant searches. This is tracked in your performance reports alongside traditional SEO metrics.',
            ),
        ),
    ),

);

// ── Clear existing FAQ ACF data and write new data ────────────────────────────
echo "Clearing existing FAQ data...\n";
delete_field( 'faq_categories', $faq_id );

echo "Writing " . count( $categories ) . " FAQ categories...\n";

update_field( 'faq_categories', $categories, $faq_id );

// Verify
$saved = get_field( 'faq_categories', $faq_id );
$saved_count = is_array( $saved ) ? count( $saved ) : 0;

if ( $saved_count === count( $categories ) ) {
    echo "\nSUCCESS — {$saved_count} categories written to FAQ page (ID: {$faq_id}).\n";
    foreach ( $saved as $i => $cat ) {
        $q_count = is_array( $cat['faq_items'] ) ? count( $cat['faq_items'] ) : 0;
        echo "  [{$i}] {$cat['category_name']} — {$q_count} questions\n";
    }
} else {
    echo "\nWARNING — expected " . count( $categories ) . " categories, got {$saved_count}. Check ACF field keys.\n";
}

echo "\nDone.\n";
