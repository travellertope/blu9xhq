<?php
/**
 * Template Name: FAQ Page
 *
 * @package bluu-interactive
 */

get_header();

// ── ACF Fields ────────────────────────────────────────────────────────────────
$faq_headline    = ( function_exists( 'get_field' ) ? get_field( 'faq_headline' )    : '' ) ?: 'Everything You Need to Know';
$faq_subheadline = ( function_exists( 'get_field' ) ? get_field( 'faq_subheadline' ) : '' ) ?: 'Straight answers about how Bluu Interactive works, what we cost, and what you can expect.';
$faq_categories  = ( function_exists( 'get_field' ) ? get_field( 'faq_categories' )  : [] ) ?: bluu_default_faq_categories();
$faq_cta_headline = ( function_exists( 'get_field' ) ? get_field( 'faq_cta_headline' ) : '' ) ?: 'Still Have Questions?';
$faq_cta_body     = ( function_exists( 'get_field' ) ? get_field( 'faq_cta_body' )     : '' ) ?: "We'd rather talk than leave you guessing. Book a no-pressure, 30-minute discovery call and we'll answer everything specific to your situation.";
$faq_cta_button   = ( function_exists( 'get_field' ) ? get_field( 'faq_cta_button_text' ) : '' ) ?: 'Book a Discovery Call';
$faq_cta_url      = ( function_exists( 'get_field' ) ? get_field( 'faq_cta_button_url' )  : '' ) ?: home_url( '/contact' );

// ── Build flat list for schema & search ───────────────────────────────────────
$all_faqs = [];
foreach ( $faq_categories as $cat ) {
    if ( ! empty( $cat['faq_items'] ) ) {
        foreach ( $cat['faq_items'] as $item ) {
            $all_faqs[] = [
                'q' => $item['question'],
                'a' => $item['answer'],
            ];
        }
    }
}

// ── FAQ Schema Markup ─────────────────────────────────────────────────────────
if ( ! empty( $all_faqs ) ) :
    $schema_entities = array_map( function( $faq ) {
        return [
            '@type'          => 'Question',
            'name'           => wp_strip_all_tags( $faq['q'] ),
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text'  => wp_strip_all_tags( $faq['a'] ),
            ],
        ];
    }, $all_faqs );

    $schema = [
        '@context'   => 'https://schema.org',
        '@type'      => 'FAQPage',
        'mainEntity' => $schema_entities,
    ];
    echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . '</script>' . "\n";
endif;
?>

<main id="main-content" class="site-main">

    <!-- ── Hero ──────────────────────────────────────────────────────────────── -->
    <section class="page-hero page-hero--navy">
        <div class="container">
            <span class="md-chip md-chip--light" style="margin-bottom: var(--space-4); display: inline-block;">
                <?php esc_html_e( 'FAQ', 'bluu-interactive' ); ?>
            </span>
            <h1 class="page-hero__title"><?php echo esc_html( $faq_headline ); ?></h1>
            <p class="page-hero__subtitle"><?php echo esc_html( $faq_subheadline ); ?></p>
        </div>
    </section>

    <!-- ── Search & Filter ───────────────────────────────────────────────────── -->
    <section class="faq-controls-bar">
        <div class="container">
            <div class="faq-search-wrap">
                <label for="faq-search" class="visually-hidden"><?php esc_html_e( 'Search FAQs', 'bluu-interactive' ); ?></label>
                <div class="faq-search-field">
                    <svg class="faq-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                        type="search"
                        id="faq-search"
                        class="faq-search-input"
                        placeholder="<?php esc_attr_e( 'Search questions…', 'bluu-interactive' ); ?>"
                        autocomplete="off"
                        aria-label="<?php esc_attr_e( 'Search frequently asked questions', 'bluu-interactive' ); ?>"
                    >
                    <button type="button" class="faq-search-clear" aria-label="<?php esc_attr_e( 'Clear search', 'bluu-interactive' ); ?>" hidden>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>

            <?php if ( count( $faq_categories ) > 1 ) : ?>
                <div class="faq-tabs" role="tablist" aria-label="<?php esc_attr_e( 'FAQ Categories', 'bluu-interactive' ); ?>">
                    <button
                        class="faq-tab faq-tab--active"
                        role="tab"
                        aria-selected="true"
                        data-category="all"
                    ><?php esc_html_e( 'All', 'bluu-interactive' ); ?></button>

                    <?php foreach ( $faq_categories as $i => $cat ) :
                        $cat_id = 'cat-' . sanitize_title( $cat['category_name'] );
                    ?>
                        <button
                            class="faq-tab"
                            role="tab"
                            aria-selected="false"
                            data-category="<?php echo esc_attr( $cat_id ); ?>"
                        ><?php echo esc_html( $cat['category_name'] ); ?></button>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- ── FAQ Body ──────────────────────────────────────────────────────────── -->
    <section class="section faq-body">
        <div class="container">

            <!-- No-results state -->
            <div class="faq-no-results" hidden aria-live="polite">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6M11 8v6"/></svg>
                <p><?php esc_html_e( 'No questions match your search. Try a different term or browse all categories.', 'bluu-interactive' ); ?></p>
                <button type="button" class="btn-text btn-text--accent faq-clear-search">
                    <?php esc_html_e( 'Clear search', 'bluu-interactive' ); ?>
                </button>
            </div>

            <!-- FAQ Categories -->
            <?php foreach ( $faq_categories as $cat ) :
                if ( empty( $cat['faq_items'] ) ) continue;
                $cat_id    = 'cat-' . sanitize_title( $cat['category_name'] );
                $cat_icon  = ! empty( $cat['category_icon'] ) ? $cat['category_icon'] : 'default';
            ?>
                <div
                    class="faq-category"
                    data-category="<?php echo esc_attr( $cat_id ); ?>"
                    id="<?php echo esc_attr( $cat_id ); ?>"
                >
                    <div class="faq-category__header">
                        <span class="faq-category__icon" aria-hidden="true">
                            <?php echo bluu_faq_category_icon( $cat_icon ); ?>
                        </span>
                        <h2 class="faq-category__title"><?php echo esc_html( $cat['category_name'] ); ?></h2>
                        <?php if ( ! empty( $cat['category_description'] ) ) : ?>
                            <p class="faq-category__desc"><?php echo esc_html( $cat['category_description'] ); ?></p>
                        <?php endif; ?>
                    </div>

                    <div class="faq-list" role="list">
                        <?php foreach ( $cat['faq_items'] as $idx => $item ) :
                            $item_id = $cat_id . '-item-' . $idx;
                            $q = ! empty( $item['question'] ) ? $item['question'] : '';
                            $a = ! empty( $item['answer'] )   ? $item['answer']   : '';
                            if ( ! $q || ! $a ) continue;
                        ?>
                            <div class="faq-item" role="listitem" data-question="<?php echo esc_attr( strtolower( $q ) ); ?>">
                                <button
                                    class="faq-item__question"
                                    aria-expanded="false"
                                    aria-controls="<?php echo esc_attr( $item_id ); ?>"
                                    id="btn-<?php echo esc_attr( $item_id ); ?>"
                                >
                                    <span class="faq-item__question-text"><?php echo esc_html( $q ); ?></span>
                                    <span class="faq-item__icon" aria-hidden="true">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M6 9l6 6 6-6"/>
                                        </svg>
                                    </span>
                                </button>
                                <div
                                    class="faq-item__answer"
                                    id="<?php echo esc_attr( $item_id ); ?>"
                                    role="region"
                                    aria-labelledby="btn-<?php echo esc_attr( $item_id ); ?>"
                                    hidden
                                >
                                    <div class="faq-item__answer-inner">
                                        <?php echo wp_kses_post( wpautop( $a ) ); ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php endforeach; ?>

        </div>
    </section>

    <!-- ── Bottom CTA ────────────────────────────────────────────────────────── -->
    <section class="section section--blue text-center animate-on-scroll">
        <div class="container container--narrow">
            <h2 class="section__headline" style="color:#fff;"><?php echo esc_html( $faq_cta_headline ); ?></h2>
            <p class="section__subheadline" style="color:rgba(255,255,255,.8); margin-bottom: var(--space-7);">
                <?php echo esc_html( $faq_cta_body ); ?>
            </p>
            <a href="<?php echo esc_url( $faq_cta_url ); ?>" class="btn-primary btn-primary--white">
                <?php echo esc_html( $faq_cta_button ); ?>
            </a>
        </div>
    </section>

</main>

<?php get_footer(); ?>
