<?php
/**
 * Template Name: Bluu Affiliate Landing Page
 * Template Post Type: page
 *
 * Full-page affiliate program landing. Hardcoded defaults work out of the box;
 * set BAFF_USE_ACF true after saving content in WP Admin.
 */

defined( 'ABSPATH' ) || exit;

define( 'BAFF_USE_ACF', false );

// ─── Helpers ──────────────────────────────────────────────────────────────────

function baff_f( string $key, string $default ): string {
	if ( BAFF_USE_ACF && function_exists( 'get_field' ) ) {
		$v = get_field( $key );
		if ( $v !== null && $v !== '' && $v !== false ) return (string) $v;
	}
	return $default;
}

function baff_rows( string $key, array $default ): array {
	if ( BAFF_USE_ACF && function_exists( 'get_field' ) ) {
		$rows = get_field( $key );
		if ( is_array( $rows ) && count( $rows ) > 0 ) return $rows;
	}
	return $default;
}

// ─── Portal URL ───────────────────────────────────────────────────────────────

$portal_register_url = baff_f( 'portal_register_url', 'https://portal.bluuhq.com/affiliate-register' );

// ─── Content defaults ─────────────────────────────────────────────────────────

$hero_eyebrow  = baff_f( 'hero_eyebrow', 'Open Enrollment · Free to Join' );
$hero_headline = baff_f( 'hero_headline', 'Earn 30% recurring commissions promoting Bluu' );
$hero_sub      = baff_f( 'hero_sub', 'Share Bluu with your audience. Earn every month your referrals stay — no cap, no expiry.' );
$hero_cta      = baff_f( 'hero_cta_text', 'Join the Affiliate Program — Free' );
$hero_meta     = baff_f( 'hero_meta', 'Open to everyone · Takes 60 seconds · No approval required' );

$commissions = [
	[ 'product' => 'Scan Tool',              'type' => 'SaaS',     'rate' => '30% recurring',   'when' => 'Every month the customer is active' ],
	[ 'product' => 'Client Portal',          'type' => 'SaaS',     'rate' => '30% recurring',   'when' => 'Every month the customer is active' ],
	[ 'product' => 'Hosting & Management',   'type' => 'Retainer', 'rate' => '30% recurring',   'when' => 'Every month the contract is active' ],
	[ 'product' => 'Content Operations',     'type' => 'Retainer', 'rate' => '15% recurring',   'when' => 'Every month the retainer is active' ],
	[ 'product' => 'Web / Mobile Dev',       'type' => 'Project',  'rate' => '10% of contract', 'when' => 'On first invoice paid after sign' ],
	[ 'product' => 'AI Systems Integration', 'type' => 'Project',  'rate' => '10% of contract', 'when' => 'On first invoice paid; per retainer invoice' ],
];

$steps = [
	[ 'num' => '01', 'title' => 'Sign up free',          'body' => 'Create your affiliate account in 60 seconds. No approval, no waiting.' ],
	[ 'num' => '02', 'title' => 'Share your link',        'body' => 'Use your unique referral link anywhere — email, social, your website, or directly to clients.' ],
	[ 'num' => '03', 'title' => 'Earn every month',       'body' => 'Get paid every month your referrals stay with Bluu. Recurring commissions, forever.' ],
];

$who = [
	[ 'icon' => '🎨', 'title' => 'Freelance designers & developers',   'body' => 'Refer clients you can\'t fully serve to Bluu\'s dev and hosting teams.' ],
	[ 'icon' => '📣', 'title' => 'Marketing consultants',              'body' => 'Your clients need the Scan Tool and content ops. Now you earn when you recommend them.' ],
	[ 'icon' => '🏢', 'title' => 'Agency owners',                      'body' => 'Refer overflow work and earn on every project and retainer.' ],
	[ 'icon' => '🎓', 'title' => 'Business coaches & advisors',        'body' => 'Your clients are always looking for trusted tools and services. Bluu gives you a recurring income stream.' ],
	[ 'icon' => '✍️', 'title' => 'Newsletter writers & creators',      'body' => 'A Bluu referral link in your newsletter earns every time a reader subscribes.' ],
	[ 'icon' => '🚀', 'title' => 'Startup advisors & accelerators',    'body' => 'Guide portfolio companies to Bluu\'s full stack — and earn on each engagement.' ],
];

$toolkit = [
	'Unique referral links & promo codes',
	'Pre-written email & social copy packs',
	'Real-time dashboard: clicks, conversions, earnings',
	'Payout history and one-click payout requests',
	'Marketing banners and landing page assets',
];

$faqs = [
	[ 'q' => 'How does tracking work?',
	  'a' => 'When someone clicks your referral link we set a 60-day cookie. If they sign up or purchase within 60 days, you get credited — even across different Bluu products.' ],
	[ 'q' => 'When and how do I get paid?',
	  'a' => 'Commissions are paid monthly. Once your balance reaches $50, you can request a payout via Stripe, PayPal, or bank transfer. Commissions have a 30-day cooling period to account for refunds.' ],
	[ 'q' => 'Is there a limit on how long I earn recurring commissions?',
	  'a' => 'No. There is no cap and no expiry. You earn every month your referred customer stays with Bluu — for life.' ],
	[ 'q' => 'Can I promote Bluu to my existing clients?',
	  'a' => 'Yes — with one exception. You cannot earn a commission on clients you are already personally managing through Bluu.' ],
	[ 'q' => 'What counts as a qualified lead for service products?',
	  'a' => 'For Content Ops, Web Dev, and AI Integration, you earn a $75 discovery call bonus when your referred lead books and completes a call with the Bluu team. The full project commission is paid once a contract is signed.' ],
	[ 'q' => 'Do I need to be a Bluu customer to join?',
	  'a' => 'No. Anyone can join the affiliate program — you do not need to be a Bluu customer or have any prior relationship with us.' ],
];

get_header();
?>

<div class="baff-wrap">

	<!-- ── HERO ───────────────────────────────────────────────────────────── -->
	<section class="baff-hero">
		<div class="baff-hero__inner">
			<span class="baff-eyebrow"><?php echo esc_html( $hero_eyebrow ); ?></span>
			<h1 class="baff-hero__headline"><?php echo nl2br( esc_html( $hero_headline ) ); ?></h1>
			<p class="baff-hero__sub"><?php echo esc_html( $hero_sub ); ?></p>
			<div class="baff-hero__cta-wrap">
				<a href="<?php echo esc_url( $portal_register_url ); ?>" class="baff-btn baff-btn--primary baff-btn--lg">
					<?php echo esc_html( $hero_cta ); ?>
				</a>
				<p class="baff-hero__meta"><?php echo esc_html( $hero_meta ); ?></p>
			</div>
			<div class="baff-hero__stats">
				<div class="baff-stat">
					<span class="baff-stat__value">30%</span>
					<span class="baff-stat__label">Recurring commission</span>
				</div>
				<div class="baff-stat">
					<span class="baff-stat__value">60 days</span>
					<span class="baff-stat__label">Cookie window</span>
				</div>
				<div class="baff-stat">
					<span class="baff-stat__value">Forever</span>
					<span class="baff-stat__label">No earnings cap</span>
				</div>
			</div>
		</div>
	</section>

	<!-- ── HOW IT WORKS ───────────────────────────────────────────────────── -->
	<section class="baff-section baff-steps">
		<div class="baff-container">
			<h2 class="baff-section__title">How it works</h2>
			<div class="baff-steps__grid">
				<?php foreach ( $steps as $step ) : ?>
				<div class="baff-step">
					<span class="baff-step__num"><?php echo esc_html( $step['num'] ); ?></span>
					<h3 class="baff-step__title"><?php echo esc_html( $step['title'] ); ?></h3>
					<p class="baff-step__body"><?php echo esc_html( $step['body'] ); ?></p>
				</div>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<!-- ── COMMISSION TABLE ───────────────────────────────────────────────── -->
	<section class="baff-section baff-commissions">
		<div class="baff-container">
			<h2 class="baff-section__title">What you earn</h2>
			<p class="baff-section__sub">Every Bluu product and service has a commission. Refer one client through the full Bluu lifecycle and earn at every stage.</p>
			<div class="baff-table-wrap">
				<table class="baff-table">
					<thead>
						<tr>
							<th>Product / Service</th>
							<th>Type</th>
							<th>Commission</th>
							<th>When you earn</th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $commissions as $row ) : ?>
						<tr>
							<td class="baff-table__product"><?php echo esc_html( $row['product'] ); ?></td>
							<td><span class="baff-badge baff-badge--<?php echo esc_attr( strtolower( $row['type'] ) ); ?>"><?php echo esc_html( $row['type'] ); ?></span></td>
							<td class="baff-table__rate"><?php echo esc_html( $row['rate'] ); ?></td>
							<td class="baff-table__when"><?php echo esc_html( $row['when'] ); ?></td>
						</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>
			<p class="baff-commissions__bonus">
				<strong>Service bonus:</strong> Earn an extra <strong>$75</strong> when a referred lead books and completes a discovery call.
			</p>
		</div>
	</section>

	<!-- ── EARNINGS CALCULATOR ────────────────────────────────────────────── -->
	<section class="baff-section baff-calc">
		<div class="baff-container">
			<h2 class="baff-section__title">How much could you earn?</h2>
			<p class="baff-section__sub">Move the sliders to estimate your monthly affiliate income.</p>
			<div class="baff-calc__card">
				<div class="baff-calc__controls">

					<div class="baff-calc__row">
						<div class="baff-calc__label-row">
							<label for="calc-saas">SaaS referrals (Scan Tool / Portal / Hosting)</label>
							<span class="baff-calc__val" id="calc-saas-val">5</span>
						</div>
						<input type="range" id="calc-saas" min="0" max="50" value="5" step="1">
						<div class="baff-calc__hint">Avg plan: ~$79/mo × 30% = $23.70/mo per referral</div>
					</div>

					<div class="baff-calc__row">
						<div class="baff-calc__label-row">
							<label for="calc-retainer">Service retainer referrals (Content Ops / AI retainer)</label>
							<span class="baff-calc__val" id="calc-retainer-val">2</span>
						</div>
						<input type="range" id="calc-retainer" min="0" max="20" value="2" step="1">
						<div class="baff-calc__hint">Avg retainer: ~$1,500/mo × 15% = $225/mo per referral</div>
					</div>

					<div class="baff-calc__row">
						<div class="baff-calc__label-row">
							<label for="calc-projects">Projects referred per year (Web Dev / AI Integration)</label>
							<span class="baff-calc__val" id="calc-projects-val">1</span>
						</div>
						<input type="range" id="calc-projects" min="0" max="12" value="1" step="1">
						<div class="baff-calc__hint">Avg project: ~$15,000 × 10% = $1,500 per project</div>
					</div>
				</div>

				<div class="baff-calc__result">
					<div class="baff-calc__result-inner">
						<span class="baff-calc__result-label">Estimated monthly earnings</span>
						<span class="baff-calc__result-value" id="calc-total">$568</span>
						<span class="baff-calc__result-note">+ project bonuses paid on sign</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ── WHO IT'S FOR ───────────────────────────────────────────────────── -->
	<section class="baff-section baff-who">
		<div class="baff-container">
			<h2 class="baff-section__title">Who it's for</h2>
			<div class="baff-who__grid">
				<?php foreach ( $who as $card ) : ?>
				<div class="baff-who__card">
					<span class="baff-who__icon"><?php echo $card['icon']; ?></span>
					<h3 class="baff-who__title"><?php echo esc_html( $card['title'] ); ?></h3>
					<p class="baff-who__body"><?php echo esc_html( $card['body'] ); ?></p>
				</div>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<!-- ── TOOLKIT ────────────────────────────────────────────────────────── -->
	<section class="baff-section baff-toolkit">
		<div class="baff-container baff-toolkit__inner">
			<div class="baff-toolkit__text">
				<h2 class="baff-section__title">Everything you need to promote</h2>
				<p class="baff-section__sub">Your affiliate dashboard gives you all the tools to start earning immediately.</p>
				<ul class="baff-toolkit__list">
					<?php foreach ( $toolkit as $item ) : ?>
					<li><?php echo esc_html( $item ); ?></li>
					<?php endforeach; ?>
				</ul>
				<a href="<?php echo esc_url( $portal_register_url ); ?>" class="baff-btn baff-btn--primary">
					Get your affiliate link
				</a>
			</div>
			<div class="baff-toolkit__preview">
				<div class="baff-dashboard-mock">
					<div class="baff-mock__topbar">
						<span class="baff-mock__dot"></span><span class="baff-mock__dot"></span><span class="baff-mock__dot"></span>
					</div>
					<div class="baff-mock__stats">
						<div class="baff-mock__stat"><span class="baff-mock__stat-v">142</span><span class="baff-mock__stat-l">Clicks</span></div>
						<div class="baff-mock__stat"><span class="baff-mock__stat-v">18</span><span class="baff-mock__stat-l">Conversions</span></div>
						<div class="baff-mock__stat"><span class="baff-mock__stat-v">$847</span><span class="baff-mock__stat-l">This month</span></div>
					</div>
					<div class="baff-mock__bar-wrap">
						<div class="baff-mock__bar" style="height:40%"></div>
						<div class="baff-mock__bar" style="height:65%"></div>
						<div class="baff-mock__bar" style="height:55%"></div>
						<div class="baff-mock__bar" style="height:80%"></div>
						<div class="baff-mock__bar" style="height:70%"></div>
						<div class="baff-mock__bar" style="height:95%"></div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ── FAQ ────────────────────────────────────────────────────────────── -->
	<section class="baff-section baff-faq">
		<div class="baff-container baff-faq__inner">
			<h2 class="baff-section__title">Frequently asked questions</h2>
			<div class="baff-faq__list">
				<?php foreach ( $faqs as $i => $faq ) : ?>
				<details class="baff-faq__item" <?php if ( $i === 0 ) echo 'open'; ?>>
					<summary class="baff-faq__q"><?php echo esc_html( $faq['q'] ); ?></summary>
					<p class="baff-faq__a"><?php echo esc_html( $faq['a'] ); ?></p>
				</details>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<!-- ── FINAL CTA ──────────────────────────────────────────────────────── -->
	<section class="baff-section baff-final-cta">
		<div class="baff-container">
			<h2 class="baff-final-cta__headline">Start earning today — it's free to join</h2>
			<p class="baff-final-cta__sub">Open enrollment. No approval process. Referral links ready the moment you sign up.</p>
			<a href="<?php echo esc_url( $portal_register_url ); ?>" class="baff-btn baff-btn--primary baff-btn--lg">
				Create your affiliate account
			</a>
			<p class="baff-final-cta__meta">Takes 60 seconds · No credit card required</p>
		</div>
	</section>

</div><!-- .baff-wrap -->

<!-- ── CALCULATOR SCRIPT ──────────────────────────────────────────────────── -->
<script>
(function () {
	var saasInput     = document.getElementById('calc-saas');
	var retainerInput = document.getElementById('calc-retainer');
	var projectInput  = document.getElementById('calc-projects');
	var saasVal       = document.getElementById('calc-saas-val');
	var retainerVal   = document.getElementById('calc-retainer-val');
	var projectsVal   = document.getElementById('calc-projects-val');
	var totalEl       = document.getElementById('calc-total');

	var SAAS_AVG     = 79;
	var SAAS_RATE    = 0.30;
	var RET_AVG      = 1500;
	var RET_RATE     = 0.15;
	var PROJ_AVG     = 15000;
	var PROJ_RATE    = 0.10;

	function calc() {
		var saas     = parseInt( saasInput.value, 10 );
		var ret      = parseInt( retainerInput.value, 10 );
		var proj     = parseInt( projectInput.value, 10 );

		saasVal.textContent     = saas;
		retainerVal.textContent = ret;
		projectsVal.textContent = proj;

		var monthly = ( saas * SAAS_AVG * SAAS_RATE )
		            + ( ret  * RET_AVG  * RET_RATE  )
		            + ( proj * PROJ_AVG * PROJ_RATE / 12 );

		totalEl.textContent = '$' + Math.round( monthly ).toLocaleString();
	}

	saasInput.addEventListener( 'input', calc );
	retainerInput.addEventListener( 'input', calc );
	projectInput.addEventListener( 'input', calc );
	calc();
}());
</script>

<?php get_footer(); ?>
