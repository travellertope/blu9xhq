</main><!-- /#main-content -->

<?php
$footer_tagline = get_theme_mod( 'bluu_footer_tagline', 'One Team. One Strategy. Total Growth.' );
$linkedin_url   = get_theme_mod( 'bluu_linkedin_url',   'https://linkedin.com/company/bluuinteractive' );
$twitter_url    = get_theme_mod( 'bluu_twitter_url',    'https://twitter.com/bluuinteractive' );
$copyright_text = get_theme_mod( 'bluu_copyright_text', '' );
$contact_email  = function_exists( 'get_field' ) ? ( get_field( 'contact_email', get_page_by_path( 'contact' ) ) ?: 'hello@bluuhq.com' ) : 'hello@bluuhq.com';
$contact_location = function_exists( 'get_field' ) ? ( get_field( 'contact_location', get_page_by_path( 'contact' ) ) ?: 'Remote-first, serving North America' ) : 'Remote-first, serving North America';
?>

<footer class="site-footer" role="contentinfo">
    <div class="site-footer__main">
        <div class="container">
            <div class="site-footer__grid">

                <!-- Column 1: Brand -->
                <div class="site-footer__col site-footer__col--brand">
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-footer__logo" aria-label="<?php bloginfo( 'name' ); ?> – <?php esc_attr_e( 'Home', 'bluu-interactive' ); ?>">
                        <?php if ( has_custom_logo() ) : ?>
                            <?php the_custom_logo(); ?>
                        <?php else : ?>
                            <span class="site-footer__logo-text">
                                <span class="site-footer__logo-name">Bluu</span> <span class="site-footer__logo-name site-footer__logo-name--accent">Interactive</span>
                            </span>
                        <?php endif; ?>
                    </a>
                    <p class="footer__tagline"><?php echo esc_html( $footer_tagline ); ?></p>
                    <p class="site-footer__descriptor"><?php esc_html_e( 'The Premium Anti-Fragmentation Agency for High-Growth B2B Brands.', 'bluu-interactive' ); ?></p>

                    <!-- Social Icons -->
                    <div class="site-footer__social" aria-label="<?php esc_attr_e( 'Social media links', 'bluu-interactive' ); ?>">
                        <?php if ( $linkedin_url ) : ?>
                            <a href="<?php echo esc_url( $linkedin_url ); ?>" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Follow Bluu Interactive on LinkedIn', 'bluu-interactive' ); ?>">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                            </a>
                        <?php endif; ?>
                        <?php if ( $twitter_url ) : ?>
                            <a href="<?php echo esc_url( $twitter_url ); ?>" class="site-footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Follow Bluu Interactive on Twitter / X', 'bluu-interactive' ); ?>">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Column 2: Quick Links -->
                <div class="site-footer__col site-footer__col--links">
                    <h3 class="site-footer__col-title"><?php esc_html_e( 'Quick Links', 'bluu-interactive' ); ?></h3>
                    <?php
                    wp_nav_menu( array(
                        'theme_location' => 'footer',
                        'menu_class'     => 'site-footer__menu',
                        'container'      => false,
                        'depth'          => 1,
                        'fallback_cb'    => 'bluu_fallback_footer_nav',
                    ) );
                    ?>
                </div>

                <!-- Column 3: Contact -->
                <div class="site-footer__col site-footer__col--contact">
                    <h3 class="site-footer__col-title"><?php esc_html_e( 'Get In Touch', 'bluu-interactive' ); ?></h3>
                    <ul class="site-footer__contact-list">
                        <li class="site-footer__contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <a href="mailto:<?php echo esc_attr( $contact_email ); ?>" class="site-footer__contact-link">
                                <?php echo esc_html( $contact_email ); ?>
                            </a>
                        </li>
                        <li class="site-footer__contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span><?php echo esc_html( $contact_location ); ?></span>
                        </li>
                        <li class="site-footer__contact-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-footer__contact-link">bluuhq.com</a>
                        </li>
                    </ul>
                    <div class="site-footer__cta-mini">
                        <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="btn-primary btn-primary--small">
                            <?php esc_html_e( 'Book a Discovery Call', 'bluu-interactive' ); ?>
                        </a>
                    </div>
                </div>

            </div><!-- /.site-footer__grid -->
        </div><!-- /.container -->
    </div><!-- /.site-footer__main -->

    <!-- Bottom Bar -->
    <div class="site-footer__bottom">
        <div class="container">
            <div class="site-footer__bottom-inner">
                <p class="site-footer__copyright">
                    <?php if ( $copyright_text ) : ?>
                        <?php echo esc_html( $copyright_text ); ?>
                    <?php else : ?>
                        &copy; <?php echo esc_html( date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. <?php esc_html_e( 'All rights reserved.', 'bluu-interactive' ); ?>
                    <?php endif; ?>
                </p>
                <p class="site-footer__built-by">
                    <?php esc_html_e( 'Built by', 'bluu-interactive' ); ?>
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="site-footer__built-by-link">Bluu Interactive</a>
                </p>
                <nav class="site-footer__legal-nav" aria-label="<?php esc_attr_e( 'Legal navigation', 'bluu-interactive' ); ?>">
                    <a href="<?php echo esc_url( home_url( '/privacy-policy' ) ); ?>"><?php esc_html_e( 'Privacy Policy', 'bluu-interactive' ); ?></a>
                    <span aria-hidden="true">·</span>
                    <a href="<?php echo esc_url( home_url( '/terms' ) ); ?>"><?php esc_html_e( 'Terms', 'bluu-interactive' ); ?></a>
                </nav>
            </div>
        </div>
    </div><!-- /.site-footer__bottom -->

</footer><!-- /.site-footer -->

<?php wp_footer(); ?>
</body>
</html>

<?php
/**
 * Fallback footer navigation.
 */
function bluu_fallback_footer_nav() {
    echo '<ul class="site-footer__menu">';
    echo '<li><a href="' . esc_url( home_url( '/' ) ) . '">' . esc_html__( 'Home', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/pricing' ) ) . '">' . esc_html__( 'Pricing', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/industries' ) ) . '">' . esc_html__( 'Industries', 'bluu-interactive' ) . '</a></li>';
    echo '<li><a href="' . esc_url( home_url( '/contact' ) ) . '">' . esc_html__( 'Contact', 'bluu-interactive' ) . '</a></li>';
    echo '</ul>';
}
