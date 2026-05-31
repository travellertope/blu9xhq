</main><!-- /#main-content -->

<?php
$linkedin_url   = get_theme_mod( 'bluu_linkedin_url', 'https://linkedin.com/company/bluuinteractive' );
$twitter_url    = get_theme_mod( 'bluu_twitter_url',  'https://twitter.com/bluuinteractive' );
$copyright_text = get_theme_mod( 'bluu_copyright_text', '' );
?>

<footer class="site-footer" role="contentinfo">

    <!-- ── Social bar ──────────────────────────────────────────────────────── -->
    <div class="site-footer__social-bar">
        <div class="container">
            <div class="site-footer__social-inner">
                <span class="site-footer__follow-label"><?php esc_html_e( 'Follow us', 'bluu-interactive' ); ?></span>
                <div class="site-footer__social-icons">
                    <?php if ( $linkedin_url ) : ?>
                        <a href="<?php echo esc_url( $linkedin_url ); ?>" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Follow Bluu Interactive on LinkedIn', 'bluu-interactive' ); ?>">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                    <?php endif; ?>
                    <?php if ( $twitter_url ) : ?>
                        <a href="<?php echo esc_url( $twitter_url ); ?>" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Follow Bluu Interactive on X', 'bluu-interactive' ); ?>">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- ── Main link grid ──────────────────────────────────────────────────── -->
    <div class="site-footer__main">
        <div class="container">
            <div class="site-footer__grid">

                <!-- Column 1: Services -->
                <div class="site-footer__col">
                    <h3 class="site-footer__col-title"><?php esc_html_e( 'Services', 'bluu-interactive' ); ?></h3>
                    <ul class="site-footer__menu">
                        <li><a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>"><?php esc_html_e( 'Managed Hub', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>"><?php esc_html_e( 'Authority Content', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>"><?php esc_html_e( 'Case Studies', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>"><?php esc_html_e( 'Growth Reporting', 'bluu-interactive' ); ?></a></li>
                    </ul>
                </div>

                <!-- Column 2: Industries -->
                <div class="site-footer__col">
                    <h3 class="site-footer__col-title"><?php esc_html_e( 'Industries', 'bluu-interactive' ); ?></h3>
                    <ul class="site-footer__menu">
                        <li><a href="<?php echo esc_url( home_url( '/industries/tech-saas' ) ); ?>"><?php esc_html_e( 'Tech & SaaS', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/industries/agencies-consultants' ) ); ?>"><?php esc_html_e( 'Agencies & Consultants', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/industries/ecommerce-dtc' ) ); ?>"><?php esc_html_e( 'E-commerce & DTC', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/industries/professional-services' ) ); ?>"><?php esc_html_e( 'Professional Services', 'bluu-interactive' ); ?></a></li>
                    </ul>
                </div>

                <!-- Column 3: Resources -->
                <div class="site-footer__col">
                    <h3 class="site-footer__col-title"><?php esc_html_e( 'Resources', 'bluu-interactive' ); ?></h3>
                    <ul class="site-footer__menu">
                        <li><a href="<?php echo esc_url( home_url( '/blog' ) ); ?>"><?php esc_html_e( 'Bluu Insights', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/industries' ) ); ?>"><?php esc_html_e( 'Industries Hub', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/use-cases' ) ); ?>"><?php esc_html_e( 'Use Cases', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/faq' ) ); ?>"><?php esc_html_e( 'FAQs', 'bluu-interactive' ); ?></a></li>
                    </ul>
                </div>

                <!-- Column 4: Company -->
                <div class="site-footer__col">
                    <h3 class="site-footer__col-title"><?php esc_html_e( 'Company', 'bluu-interactive' ); ?></h3>
                    <ul class="site-footer__menu">
                        <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>"><?php esc_html_e( 'Pricing', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>"><?php esc_html_e( 'Contact', 'bluu-interactive' ); ?></a></li>
                        <li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="site-footer__cta-link"><?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?></a></li>
                    </ul>
                </div>

            </div>
        </div>
    </div>

    <!-- ── Bottom bar ──────────────────────────────────────────────────────── -->
    <div class="site-footer__bottom">
        <div class="container">
            <div class="site-footer__bottom-inner">

                <!-- Logo — div wrapper avoids nesting <a> inside <a> when custom logo is active -->
                <div class="site-footer__logo">
                    <?php if ( has_custom_logo() ) : ?>
                        <?php the_custom_logo(); ?>
                    <?php else : ?>
                        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php bloginfo( 'name' ); ?> – <?php esc_attr_e( 'Home', 'bluu-interactive' ); ?>">
                            <span class="site-footer__logo-text">
                                <span class="site-footer__logo-name">Bluu</span><span class="site-footer__logo-name site-footer__logo-name--accent"> Interactive</span>
                            </span>
                        </a>
                    <?php endif; ?>
                </div>

                <!-- Copyright -->
                <p class="site-footer__copyright">
                    <?php if ( $copyright_text ) : ?>
                        <?php echo esc_html( $copyright_text ); ?>
                    <?php else : ?>
                        &copy; <?php echo esc_html( date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. <?php esc_html_e( 'All rights reserved.', 'bluu-interactive' ); ?>
                    <?php endif; ?>
                </p>

                <!-- SEO tagline -->
                <p class="site-footer__seo-tagline"><?php esc_html_e( 'All content produced to SEO and AI crawl standard.', 'bluu-interactive' ); ?></p>

                <!-- Legal nav -->
                <nav class="site-footer__legal-nav" aria-label="<?php esc_attr_e( 'Legal navigation', 'bluu-interactive' ); ?>">
                    <a href="<?php echo esc_url( home_url( '/privacy-policy' ) ); ?>"><?php esc_html_e( 'Privacy', 'bluu-interactive' ); ?></a>
                    <span aria-hidden="true">&middot;</span>
                    <a href="<?php echo esc_url( home_url( '/terms' ) ); ?>"><?php esc_html_e( 'Terms', 'bluu-interactive' ); ?></a>
                </nav>

            </div>
        </div>
    </div>

</footer><!-- /.site-footer -->

<?php wp_footer(); ?>
</body>
</html>

<?php
/**
 * Fallback footer navigation (kept for compatibility).
 */
function bluu_fallback_footer_nav() {
    echo '<ul class="site-footer__menu">';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/pricing' ) ) . '">' . esc_html__( 'Pricing', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/industries' ) ) . '">' . esc_html__( 'Industries', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/contact' ) ) . '">' . esc_html__( 'Contact', 'bluu-interactive' ) . '</a></li>';
    echo '</ul>';
}
