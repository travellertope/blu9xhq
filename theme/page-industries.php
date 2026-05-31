<?php
/**
 * Template Name: Industries Page
 *
 * @package bluu-interactive
 */

// ── ACF fields with defaults — Hero ──────────────────────────────────────────
$hero_badge    = ( function_exists( 'get_field' ) ? get_field( 'industries_hero_badge' )    : '' ) ?: 'Our Industries';
$hero_headline = ( function_exists( 'get_field' ) ? get_field( 'industries_hero_headline' ) : '' ) ?: 'Built for Industries Where Trust Is Non-Negotiable';
$hero_body     = ( function_exists( 'get_field' ) ? get_field( 'industries_hero_body' )     : '' ) ?: 'We don\'t work in every industry. We go deep in four — where our expertise creates an unfair competitive advantage for our clients.';

// ── ACF fields with defaults — Bottom CTA ────────────────────────────────────
$cta_headline = ( function_exists( 'get_field' ) ? get_field( 'industries_cta_headline' ) : '' ) ?: 'Your Industry. Your Rules. Our Engine.';
$cta_body     = ( function_exists( 'get_field' ) ? get_field( 'industries_cta_body' )     : '' ) ?: 'We only take on clients we know we can win for. Let\'s find out if we\'re the right fit.';
$cta_url      = ( function_exists( 'get_field' ) ? get_field( 'industries_cta_url' )      : '' ) ?: home_url( '/contact' );

// ── Hardcoded industries array (content is curated — no ACF loop needed) ─────
$industries = array(
	array(
		'sector'      => 'B2B SaaS',
		'headline'    => 'Dominate your category with content that compounds.',
		'challenge'   => 'SaaS companies face a brutal paradox: buyers demand thought leadership and proven ROI, yet most content teams publish generic how-to articles that never rank and never convert. Meanwhile, the sales team is winging it on outdated decks.',
		'approach'    => 'We build the content infrastructure that turns your product expertise into category authority. SME-verified long-form articles capture high-intent traffic. A continuously optimized site converts it. Premium case studies close the deals.',
		'stat'        => '3x',
		'stat_label'  => 'Est. pipeline increase in 12 months',
		'icon_color'  => 'blue',
		'icon_path'   => 'M13 10V3L4 14h7v7l9-11h-7z',
		'reversed'    => false,
	),
	array(
		'sector'      => 'Healthcare & Biotech',
		'headline'    => 'Clinical accuracy meets demand generation.',
		'challenge'   => 'Healthcare buyers are sophisticated and skeptical. Compliance constraints limit what you can say and how you can say it. A single inaccurate claim destroys years of trust. Generic content agencies don\'t understand this world.',
		'approach'    => 'Every piece of content we produce for healthcare clients goes through SME and clinical review. We understand HIPAA standards, FDA communication standards, and what hospital procurement teams and CNOs actually need before signing.',
		'stat'        => '100%',
		'stat_label'  => 'SME-verified content, always',
		'icon_color'  => 'emerald',
		'icon_path'   => 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
		'reversed'    => true,
	),
	array(
		'sector'      => 'Legal & Finance',
		'headline'    => 'Turn compliance constraints into competitive advantages.',
		'challenge'   => 'Legal and financial buyers are the most discerning in B2B. They research deeply, question everything, and discard unproven vendors instantly. Regulatory compliance isn\'t optional — it\'s the baseline.',
		'approach'    => 'We produce deep-research content that demonstrates genuine expertise: regulatory analysis, decision-framework guides, and authoritative whitepapers that GCs and CFOs actually read. Then we build sales assets that reflect what your prospects actually ask in late-stage deals.',
		'stat'        => '48h',
		'stat_label'  => 'Premium case study turnaround',
		'icon_color'  => 'navy',
		'icon_path'   => 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
		'reversed'    => false,
	),
	array(
		'sector'      => 'Logistics & Supply Chain',
		'headline'    => 'Prove operational expertise at every touchpoint.',
		'challenge'   => 'Logistics buyers evaluate vendors on operational credibility and proven results. They\'re not seeking thought leadership fluff — they\'re looking for proof you\'ve solved the specific problem they\'re facing today.',
		'approach'    => 'We build proof-first content strategies: case studies that showcase real operational wins, technical content that communicates system knowledge, and sales assets that speak directly to the objections logistics buyers raise in procurement conversations.',
		'stat'        => '$2M–$50M',
		'stat_label'  => 'ARR sweet spot for our clients',
		'icon_color'  => 'blue',
		'icon_path'   => 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
		'reversed'    => true,
	),
);

get_header();
?>

<!-- ── Industries Hero ──────────────────────────────────────────────────────── -->
<section class="industries-hero" aria-label="<?php esc_attr_e( 'Industries overview', 'bluu-interactive' ); ?>">
	<div class="container">
		<div class="industries-hero__inner animate-on-scroll">
			<div class="industries-hero__badge pricing-hero__badge"><?php echo esc_html( $hero_badge ); ?></div>
			<h1 class="industries-hero__headline"><?php echo esc_html( $hero_headline ); ?></h1>
			<p class="industries-hero__body"><?php echo esc_html( $hero_body ); ?></p>
		</div>
	</div>
</section>

<!-- ── Industry Sections ────────────────────────────────────────────────────── -->
<div class="industry-sections">

	<?php foreach ( $industries as $industry ) :
		$block_class = 'industry-block' . ( $industry['reversed'] ? ' industry-block--reversed' : '' );
		$icon_class  = 'industry-visual__icon industry-visual__icon--' . esc_attr( $industry['icon_color'] );
	?>
	<section class="<?php echo esc_attr( $block_class ); ?>" aria-label="<?php echo esc_attr( $industry['sector'] ); ?>">

		<!-- Visual panel -->
		<div class="industry-block__visual">
			<div class="industry-visual">
				<span class="<?php echo esc_attr( $icon_class ); ?>" aria-hidden="true">
					<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
						<path d="<?php echo esc_attr( $industry['icon_path'] ); ?>"/>
					</svg>
				</span>
				<div class="industry-visual__stat"><?php echo esc_html( $industry['stat'] ); ?></div>
				<div class="industry-visual__label"><?php echo esc_html( $industry['stat_label'] ); ?></div>
			</div>
		</div><!-- /.industry-block__visual -->

		<!-- Content panel -->
		<div class="industry-block__content">
			<div class="industry-content__sector"><?php echo esc_html( $industry['sector'] ); ?></div>

			<h2 class="industry-content__headline"><?php echo esc_html( $industry['headline'] ); ?></h2>

			<div class="industry-content__points">

				<!-- Challenge -->
				<div class="industry-content__point industry-content__point--challenge">
					<div class="industry-content__point-header">
						<span aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
								<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
							</svg>
						</span>
						<span class="industry-content__point-title"><?php esc_html_e( 'The Challenge', 'bluu-interactive' ); ?></span>
					</div>
					<p class="industry-content__point-body"><?php echo esc_html( $industry['challenge'] ); ?></p>
				</div><!-- /.industry-content__point--challenge -->

				<!-- Approach -->
				<div class="industry-content__point industry-content__point--approach">
					<div class="industry-content__point-header">
						<span aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						</span>
						<span class="industry-content__point-title"><?php esc_html_e( 'Our Approach', 'bluu-interactive' ); ?></span>
					</div>
					<p class="industry-content__point-body"><?php echo esc_html( $industry['approach'] ); ?></p>
				</div><!-- /.industry-content__point--approach -->

			</div><!-- /.industry-content__points -->

			<a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary">
				<?php esc_html_e( 'Discuss Your Situation', 'bluu-interactive' ); ?>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
					<path d="M14 5l7 7m0 0l-7 7m7-7H3"/>
				</svg>
			</a>

		</div><!-- /.industry-block__content -->

	</section>
	<?php endforeach; ?>

</div><!-- /.industry-sections -->

<!-- ── Bottom CTA ───────────────────────────────────────────────────────────── -->
<section class="industries-cta" aria-label="<?php esc_attr_e( 'Industries call to action', 'bluu-interactive' ); ?>">
	<div class="container">
		<div class="industries-cta__inner animate-on-scroll">

			<h2 class="industries-cta__headline"><?php echo esc_html( $cta_headline ); ?></h2>
			<p class="industries-cta__body"><?php echo esc_html( $cta_body ); ?></p>

			<a href="<?php echo esc_url( $cta_url ); ?>" class="btn-primary btn-primary--large">
				<?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
					<path d="M14 5l7 7m0 0l-7 7m7-7H3"/>
				</svg>
			</a>

			<p class="industries-cta__note"><?php esc_html_e( 'Free 15-minute call. No commitment required.', 'bluu-interactive' ); ?></p>

		</div>
	</div>
</section>

<?php get_footer(); ?>
