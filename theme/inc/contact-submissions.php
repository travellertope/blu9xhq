<?php
/**
 * Contact Form Submissions — CPT, admin management, reCAPTCHA, email
 *
 * @package bluu-interactive
 */

defined( 'ABSPATH' ) || exit;

/* ══════════════════════════════════════════════════════════════════════════════
   1. CUSTOM POST TYPE
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_register_submission_cpt() {
    $labels = array(
        'name'               => _x( 'Submissions', 'post type general name', 'bluu-interactive' ),
        'singular_name'      => _x( 'Submission', 'post type singular name', 'bluu-interactive' ),
        'menu_name'          => _x( 'Submissions', 'admin menu', 'bluu-interactive' ),
        'name_admin_bar'     => _x( 'Submission', 'add new on admin bar', 'bluu-interactive' ),
        'all_items'          => __( 'All Submissions', 'bluu-interactive' ),
        'view_item'          => __( 'View Submission', 'bluu-interactive' ),
        'search_items'       => __( 'Search Submissions', 'bluu-interactive' ),
        'not_found'          => __( 'No submissions found.', 'bluu-interactive' ),
        'not_found_in_trash' => __( 'No submissions found in Trash.', 'bluu-interactive' ),
    );

    $args = array(
        'labels'              => $labels,
        'public'              => false,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_icon'           => 'dashicons-email-alt',
        'menu_position'       => 25,
        'supports'            => array( 'title' ),
        'capability_type'     => 'post',
        'capabilities'        => array(
            'create_posts' => 'do_not_allow', // disable Add New button
        ),
        'map_meta_cap'        => true,
        'has_archive'         => false,
        'rewrite'             => false,
        'query_var'           => false,
        'show_in_rest'        => false,
    );

    register_post_type( 'bluu_submission', $args );
}
add_action( 'init', 'bluu_register_submission_cpt' );

/* ══════════════════════════════════════════════════════════════════════════════
   2. ADMIN COLUMNS
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_submission_columns( $columns ) {
    return array(
        'cb'             => $columns['cb'],
        'sub_status'     => __( 'Status', 'bluu-interactive' ),
        'sub_name'       => __( 'Name', 'bluu-interactive' ),
        'sub_email'      => __( 'Email', 'bluu-interactive' ),
        'sub_company'    => __( 'Company', 'bluu-interactive' ),
        'sub_excerpt'    => __( 'Message', 'bluu-interactive' ),
        'date'           => __( 'Received', 'bluu-interactive' ),
    );
}
add_filter( 'manage_bluu_submission_posts_columns', 'bluu_submission_columns' );

function bluu_submission_column_data( $column, $post_id ) {
    switch ( $column ) {
        case 'sub_status':
            $status = get_post_meta( $post_id, '_bluu_status', true ) ?: 'new';
            $labels = array(
                'new'     => array( 'label' => __( 'New', 'bluu-interactive' ),     'color' => '#1A73E8' ),
                'read'    => array( 'label' => __( 'Read', 'bluu-interactive' ),    'color' => '#137333' ),
                'replied' => array( 'label' => __( 'Replied', 'bluu-interactive' ), 'color' => '#5f6368' ),
            );
            $s = isset( $labels[ $status ] ) ? $labels[ $status ] : $labels['new'];
            printf(
                '<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:%s22;color:%s;border:1px solid %s55">%s</span>',
                esc_attr( $s['color'] ),
                esc_attr( $s['color'] ),
                esc_attr( $s['color'] ),
                esc_html( $s['label'] )
            );
            break;

        case 'sub_name':
            $name = get_post_meta( $post_id, '_bluu_name', true );
            echo esc_html( $name );
            break;

        case 'sub_email':
            $email = get_post_meta( $post_id, '_bluu_email', true );
            printf( '<a href="mailto:%s">%s</a>', esc_attr( $email ), esc_html( $email ) );
            break;

        case 'sub_company':
            echo esc_html( get_post_meta( $post_id, '_bluu_company', true ) );
            break;

        case 'sub_excerpt':
            $msg = get_post_meta( $post_id, '_bluu_message', true );
            echo esc_html( wp_trim_words( $msg, 12, '…' ) );
            break;
    }
}
add_action( 'manage_bluu_submission_posts_custom_column', 'bluu_submission_column_data', 10, 2 );

function bluu_submission_sortable_columns( $columns ) {
    $columns['sub_status'] = 'sub_status';
    $columns['sub_name']   = 'sub_name';
    return $columns;
}
add_filter( 'manage_edit-bluu_submission_sortable_columns', 'bluu_submission_sortable_columns' );

/* ── Highlight unread rows ─────────────────────────────────────────────────── */
function bluu_submission_row_style() {
    global $post;
    if ( ! isset( $post ) || 'bluu_submission' !== $post->post_type ) {
        return;
    }
    $status = get_post_meta( $post->ID, '_bluu_status', true ) ?: 'new';
    if ( 'new' === $status ) {
        echo ' style="font-weight:600;"';
    }
}
add_action( 'post_class', function( $classes ) use ( &$post ) {
    if ( isset( $post ) && 'bluu_submission' === $post->post_type ) {
        $status = get_post_meta( $post->ID, '_bluu_status', true ) ?: 'new';
        if ( 'new' === $status ) {
            $classes[] = 'bluu-sub-new';
        }
    }
    return $classes;
} );

/* ══════════════════════════════════════════════════════════════════════════════
   3. CUSTOM META BOX — Submission Details
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_submission_meta_boxes() {
    add_meta_box(
        'bluu_submission_details',
        __( 'Submission Details', 'bluu-interactive' ),
        'bluu_submission_details_cb',
        'bluu_submission',
        'normal',
        'high'
    );

    add_meta_box(
        'bluu_submission_status_box',
        __( 'Status', 'bluu-interactive' ),
        'bluu_submission_status_cb',
        'bluu_submission',
        'side',
        'high'
    );
}
add_action( 'add_meta_boxes', 'bluu_submission_meta_boxes' );

function bluu_submission_details_cb( $post ) {
    $name    = get_post_meta( $post->ID, '_bluu_name',    true );
    $company = get_post_meta( $post->ID, '_bluu_company', true );
    $email   = get_post_meta( $post->ID, '_bluu_email',   true );
    $phone   = get_post_meta( $post->ID, '_bluu_phone',   true );
    $message = get_post_meta( $post->ID, '_bluu_message', true );
    $score   = get_post_meta( $post->ID, '_bluu_recaptcha_score', true );
    $ip      = get_post_meta( $post->ID, '_bluu_ip',      true );

    $fields = array(
        __( 'Full Name', 'bluu-interactive' )    => esc_html( $name ),
        __( 'Company', 'bluu-interactive' )       => esc_html( $company ),
        __( 'Email', 'bluu-interactive' )         => sprintf( '<a href="mailto:%s">%s</a>', esc_attr( $email ), esc_html( $email ) ),
        __( 'Phone', 'bluu-interactive' )         => esc_html( $phone ) ?: '—',
        __( 'reCAPTCHA Score', 'bluu-interactive' ) => esc_html( $score ) ?: 'n/a',
        __( 'IP Address', 'bluu-interactive' )    => esc_html( $ip ) ?: '—',
    );

    echo '<table class="form-table" style="margin-top:0">';
    foreach ( $fields as $label => $value ) {
        printf( '<tr><th style="width:160px;padding:8px 12px;">%s</th><td style="padding:8px 12px;">%s</td></tr>', esc_html( $label ), $value ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
    echo '</table>';

    echo '<div style="margin-top:16px">';
    echo '<strong style="display:block;margin-bottom:8px;">' . esc_html__( 'Message', 'bluu-interactive' ) . '</strong>';
    echo '<div style="background:#f8f9fa;border:1px solid #dadce0;border-radius:4px;padding:12px 16px;white-space:pre-wrap;font-size:14px;line-height:1.6">';
    echo esc_html( $message );
    echo '</div></div>';

    // Quick reply link
    if ( $email ) {
        $subject = rawurlencode( 'Re: Your inquiry to Bluu Interactive' );
        $mailto  = 'mailto:' . rawurlencode( $email ) . '?subject=' . $subject;
        printf(
            '<p style="margin-top:16px"><a href="%s" class="button button-primary">%s</a></p>',
            esc_url( $mailto ),
            esc_html__( 'Reply via Email Client', 'bluu-interactive' )
        );
    }
}

function bluu_submission_status_cb( $post ) {
    wp_nonce_field( 'bluu_submission_status', '_bluu_status_nonce' );
    $status = get_post_meta( $post->ID, '_bluu_status', true ) ?: 'new';
    $options = array(
        'new'     => __( 'New (unread)', 'bluu-interactive' ),
        'read'    => __( 'Read', 'bluu-interactive' ),
        'replied' => __( 'Replied', 'bluu-interactive' ),
    );
    echo '<select name="_bluu_status" style="width:100%">';
    foreach ( $options as $val => $label ) {
        printf( '<option value="%s"%s>%s</option>', esc_attr( $val ), selected( $status, $val, false ), esc_html( $label ) );
    }
    echo '</select>';
}

function bluu_save_submission_status( $post_id ) {
    if (
        ! isset( $_POST['_bluu_status_nonce'] ) ||
        ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_bluu_status_nonce'] ) ), 'bluu_submission_status' ) ||
        defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ||
        ! current_user_can( 'edit_post', $post_id )
    ) {
        return;
    }
    if ( isset( $_POST['_bluu_status'] ) ) {
        $allowed = array( 'new', 'read', 'replied' );
        $new_status = sanitize_text_field( wp_unslash( $_POST['_bluu_status'] ) );
        if ( in_array( $new_status, $allowed, true ) ) {
            update_post_meta( $post_id, '_bluu_status', $new_status );
        }
    }
}
add_action( 'save_post_bluu_submission', 'bluu_save_submission_status' );

/* ══════════════════════════════════════════════════════════════════════════════
   4. BULK ACTIONS — Mark as Read / Replied
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_submission_bulk_actions( $actions ) {
    $actions['mark_read']    = __( 'Mark as Read', 'bluu-interactive' );
    $actions['mark_replied'] = __( 'Mark as Replied', 'bluu-interactive' );
    return $actions;
}
add_filter( 'bulk_actions-edit-bluu_submission', 'bluu_submission_bulk_actions' );

function bluu_submission_bulk_action_handler( $redirect_to, $action, $post_ids ) {
    if ( ! in_array( $action, array( 'mark_read', 'mark_replied' ), true ) ) {
        return $redirect_to;
    }
    $new_status = ( 'mark_replied' === $action ) ? 'replied' : 'read';
    foreach ( $post_ids as $post_id ) {
        update_post_meta( $post_id, '_bluu_status', $new_status );
    }
    return add_query_arg( 'bluu_bulk_done', count( $post_ids ), $redirect_to );
}
add_filter( 'handle_bulk_actions-edit-bluu_submission', 'bluu_submission_bulk_action_handler', 10, 3 );

function bluu_submission_bulk_admin_notice() {
    if ( ! empty( $_REQUEST['bluu_bulk_done'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
        $count = absint( $_REQUEST['bluu_bulk_done'] ); // phpcs:ignore WordPress.Security.NonceVerification
        printf(
            '<div class="notice notice-success is-dismissible"><p>%s</p></div>',
            esc_html( sprintf( _n( 'Updated %d submission.', 'Updated %d submissions.', $count, 'bluu-interactive' ), $count ) )
        );
    }
}
add_action( 'admin_notices', 'bluu_submission_bulk_admin_notice' );

/* ══════════════════════════════════════════════════════════════════════════════
   5. ADMIN BADGE — unread count on menu
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_submission_menu_badge() {
    global $menu;
    $count = (int) ( new WP_Query( array(
        'post_type'      => 'bluu_submission',
        'posts_per_page' => -1,
        'meta_query'     => array( array( 'key' => '_bluu_status', 'value' => 'new' ) ),
        'fields'         => 'ids',
        'no_found_rows'  => true,
    ) ) )->post_count;

    if ( $count < 1 ) {
        return;
    }

    foreach ( $menu as $key => $item ) {
        if ( isset( $item[2] ) && 'edit.php?post_type=bluu_submission' === $item[2] ) {
            $menu[ $key ][0] .= ' <span class="awaiting-mod">' . $count . '</span>'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
            break;
        }
    }
}
add_action( 'admin_menu', 'bluu_submission_menu_badge' );

/* ══════════════════════════════════════════════════════════════════════════════
   6. SETTINGS PAGE — Contact Form Settings
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_contact_settings_menu() {
    add_submenu_page(
        'edit.php?post_type=bluu_submission',
        __( 'Contact Form Settings', 'bluu-interactive' ),
        __( 'Settings', 'bluu-interactive' ),
        'manage_options',
        'bluu-contact-settings',
        'bluu_contact_settings_page'
    );
}
add_action( 'admin_menu', 'bluu_contact_settings_menu' );

function bluu_contact_settings_page() {
    if ( isset( $_POST['bluu_settings_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bluu_settings_nonce'] ) ), 'bluu_save_contact_settings' ) ) {
        $keys = array(
            'bluu_recaptcha_site_key',
            'bluu_recaptcha_secret_key',
            'bluu_notification_email',
            'bluu_notification_subject',
            'bluu_notification_body',
            'bluu_autoreply_subject',
            'bluu_autoreply_body',
            'bluu_recaptcha_score',
        );
        foreach ( $keys as $key ) {
            if ( isset( $_POST[ $key ] ) ) {
                update_option( $key, sanitize_textarea_field( wp_unslash( $_POST[ $key ] ) ) );
            }
        }
        echo '<div class="notice notice-success"><p>' . esc_html__( 'Settings saved.', 'bluu-interactive' ) . '</p></div>';
    }

    $site_key        = get_option( 'bluu_recaptcha_site_key', '' );
    $secret_key      = get_option( 'bluu_recaptcha_secret_key', '' );
    $notify_email    = get_option( 'bluu_notification_email', get_option( 'admin_email' ) );
    $notify_subj     = get_option( 'bluu_notification_subject', '[{site_name}] New Inquiry from {name} ({company})' );
    $notify_body     = get_option( 'bluu_notification_body', bluu_default_admin_email_template() );
    $reply_subj      = get_option( 'bluu_autoreply_subject', "We received your message, {name}" );
    $reply_body      = get_option( 'bluu_autoreply_body', bluu_default_autoreply_template() );
    $min_score       = get_option( 'bluu_recaptcha_score', '0.5' );
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Contact Form Settings', 'bluu-interactive' ); ?></h1>
        <p><?php esc_html_e( 'Configure reCAPTCHA, notification recipients, and email templates.', 'bluu-interactive' ); ?></p>

        <form method="post" action="">
            <?php wp_nonce_field( 'bluu_save_contact_settings', 'bluu_settings_nonce' ); ?>

            <h2><?php esc_html_e( 'reCAPTCHA v3', 'bluu-interactive' ); ?></h2>
            <p><?php
                printf(
                    /* translators: %s is an anchor tag */
                    esc_html__( 'Get your keys from %s. Use v3 keys only.', 'bluu-interactive' ),
                    '<a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener">google.com/recaptcha</a>'
                );
            ?></p>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="bluu_recaptcha_site_key"><?php esc_html_e( 'Site Key (public)', 'bluu-interactive' ); ?></label></th>
                    <td><input type="text" id="bluu_recaptcha_site_key" name="bluu_recaptcha_site_key" value="<?php echo esc_attr( $site_key ); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bluu_recaptcha_secret_key"><?php esc_html_e( 'Secret Key (private)', 'bluu-interactive' ); ?></label></th>
                    <td><input type="password" id="bluu_recaptcha_secret_key" name="bluu_recaptcha_secret_key" value="<?php echo esc_attr( $secret_key ); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bluu_recaptcha_score"><?php esc_html_e( 'Minimum Score (0–1)', 'bluu-interactive' ); ?></label></th>
                    <td>
                        <input type="number" id="bluu_recaptcha_score" name="bluu_recaptcha_score" value="<?php echo esc_attr( $min_score ); ?>" step="0.1" min="0" max="1" class="small-text">
                        <p class="description"><?php esc_html_e( '0.5 recommended. Higher = stricter. Submissions below this score are rejected.', 'bluu-interactive' ); ?></p>
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e( 'Notification Recipient', 'bluu-interactive' ); ?></h2>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="bluu_notification_email"><?php esc_html_e( 'Notification Email(s)', 'bluu-interactive' ); ?></label></th>
                    <td>
                        <input type="text" id="bluu_notification_email" name="bluu_notification_email" value="<?php echo esc_attr( $notify_email ); ?>" class="regular-text">
                        <p class="description"><?php esc_html_e( 'Comma-separated for multiple recipients. e.g. hello@bluuhq.com, sales@bluuhq.com', 'bluu-interactive' ); ?></p>
                    </td>
                </tr>
            </table>

            <h2><?php esc_html_e( 'Admin Notification Email', 'bluu-interactive' ); ?></h2>
            <p class="description"><?php esc_html_e( 'Sent to you when a new form is submitted. Available variables: {name}, {company}, {email}, {phone}, {message}, {date}, {admin_url}, {site_name}, {site_url}', 'bluu-interactive' ); ?></p>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="bluu_notification_subject"><?php esc_html_e( 'Subject', 'bluu-interactive' ); ?></label></th>
                    <td><input type="text" id="bluu_notification_subject" name="bluu_notification_subject" value="<?php echo esc_attr( $notify_subj ); ?>" class="large-text"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bluu_notification_body"><?php esc_html_e( 'Body (HTML)', 'bluu-interactive' ); ?></label></th>
                    <td><textarea id="bluu_notification_body" name="bluu_notification_body" rows="16" class="large-text code"><?php echo esc_textarea( $notify_body ); ?></textarea></td>
                </tr>
            </table>

            <h2><?php esc_html_e( 'Auto-Reply Email', 'bluu-interactive' ); ?></h2>
            <p class="description"><?php esc_html_e( 'Sent automatically to the person who submitted the form. Same variables available.', 'bluu-interactive' ); ?></p>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="bluu_autoreply_subject"><?php esc_html_e( 'Subject', 'bluu-interactive' ); ?></label></th>
                    <td><input type="text" id="bluu_autoreply_subject" name="bluu_autoreply_subject" value="<?php echo esc_attr( $reply_subj ); ?>" class="large-text"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bluu_autoreply_body"><?php esc_html_e( 'Body (HTML)', 'bluu-interactive' ); ?></label></th>
                    <td><textarea id="bluu_autoreply_body" name="bluu_autoreply_body" rows="16" class="large-text code"><?php echo esc_textarea( $reply_body ); ?></textarea></td>
                </tr>
            </table>

            <?php submit_button( __( 'Save Settings', 'bluu-interactive' ) ); ?>
        </form>
    </div>
    <?php
}

/* ══════════════════════════════════════════════════════════════════════════════
   7. DEFAULT EMAIL TEMPLATES
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_default_admin_email_template() {
    return '<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

      <!-- Header -->
      <tr><td style="background:#1A73E8;padding:24px 32px">
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">{site_name}</p>
        <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8)">New Contact Form Submission</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px">
        <p style="margin:0 0 24px;font-size:15px;color:#3c4043">You have received a new inquiry on <strong>{date}</strong>.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8eaed;border-radius:6px;overflow:hidden;margin-bottom:24px">
          <tr style="background:#f8f9fa">
            <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e8eaed">Field</td>
            <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e8eaed">Value</td>
          </tr>
          <tr><td style="padding:10px 16px;font-size:14px;color:#5f6368;border-bottom:1px solid #f1f3f4;white-space:nowrap">Full Name</td><td style="padding:10px 16px;font-size:14px;color:#202124;border-bottom:1px solid #f1f3f4"><strong>{name}</strong></td></tr>
          <tr><td style="padding:10px 16px;font-size:14px;color:#5f6368;border-bottom:1px solid #f1f3f4;white-space:nowrap">Company</td><td style="padding:10px 16px;font-size:14px;color:#202124;border-bottom:1px solid #f1f3f4">{company}</td></tr>
          <tr><td style="padding:10px 16px;font-size:14px;color:#5f6368;border-bottom:1px solid #f1f3f4;white-space:nowrap">Email</td><td style="padding:10px 16px;font-size:14px;border-bottom:1px solid #f1f3f4"><a href="mailto:{email}" style="color:#1A73E8">{email}</a></td></tr>
          <tr><td style="padding:10px 16px;font-size:14px;color:#5f6368;white-space:nowrap">Phone</td><td style="padding:10px 16px;font-size:14px;color:#202124">{phone}</td></tr>
        </table>

        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.05em">Message</p>
        <div style="background:#f8f9fa;border-left:4px solid #1A73E8;padding:16px 20px;border-radius:0 6px 6px 0;font-size:15px;color:#202124;line-height:1.65;white-space:pre-wrap">{message}</div>

        <div style="margin-top:28px;text-align:center">
          <a href="{admin_url}" style="display:inline-block;background:#1A73E8;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:24px;font-size:14px;font-weight:600">View in Dashboard</a>
        </div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e8eaed;text-align:center">
        <p style="margin:0;font-size:12px;color:#9aa0a6">This notification was sent from <a href="{site_url}" style="color:#1A73E8">{site_url}</a></p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>';
}

function bluu_default_autoreply_template() {
    return '<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

      <!-- Header -->
      <tr><td style="background:#1A73E8;padding:32px;text-align:center">
        <p style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px">bluu<span style="opacity:0.8">.</span>interactive</p>
        <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8)">The Anti-Fragmentation Agency</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px 40px">
        <h2 style="margin:0 0 16px;font-size:22px;color:#202124;font-weight:700">Hi {name},</h2>
        <p style="margin:0 0 16px;font-size:15px;color:#3c4043;line-height:1.65">Thank you for reaching out to Bluu Interactive. We received your message and a member of our team will review it and get back to you <strong>within 1 business day</strong>.</p>
        <p style="margin:0 0 24px;font-size:15px;color:#3c4043;line-height:1.65">In the meantime, feel free to explore how we work:</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
          <tr>
            <td style="padding:0 8px 0 0">
              <a href="{site_url}/pricing" style="display:block;background:#f8f9fa;border:1px solid #e8eaed;border-radius:8px;padding:16px;text-decoration:none;text-align:center">
                <p style="margin:0;font-size:13px;font-weight:600;color:#1A73E8">View Pricing →</p>
              </a>
            </td>
            <td style="padding:0 0 0 8px">
              <a href="{site_url}/industries" style="display:block;background:#f8f9fa;border:1px solid #e8eaed;border-radius:8px;padding:16px;text-decoration:none;text-align:center">
                <p style="margin:0;font-size:13px;font-weight:600;color:#1A73E8">Industries We Serve →</p>
              </a>
            </td>
          </tr>
        </table>

        <div style="background:#f8f9fa;border:1px solid #e8eaed;border-radius:8px;padding:20px 24px;margin-bottom:28px">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#5f6368;text-transform:uppercase;letter-spacing:0.05em">Your Message</p>
          <p style="margin:0;font-size:14px;color:#3c4043;line-height:1.6;white-space:pre-wrap">{message}</p>
        </div>

        <p style="margin:0;font-size:14px;color:#5f6368;line-height:1.65">If you have any urgent questions, you can reach us directly at <a href="mailto:hello@bluuhq.com" style="color:#1A73E8">hello@bluuhq.com</a>.</p>
      </td></tr>

      <!-- Signature -->
      <tr><td style="padding:0 40px 32px">
        <p style="margin:0;font-size:14px;color:#3c4043">Warm regards,<br><strong>The Bluu Interactive Team</strong></p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e8eaed;text-align:center">
        <p style="margin:0;font-size:12px;color:#9aa0a6">© {site_name} · <a href="{site_url}" style="color:#1A73E8">{site_url}</a></p>
        <p style="margin:4px 0 0;font-size:11px;color:#bdc1c6">You received this because you contacted us at {site_url}/contact</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>';
}

/* ══════════════════════════════════════════════════════════════════════════════
   8. EMAIL HELPER — Replace template variables
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_render_email_template( $template, $vars ) {
    foreach ( $vars as $key => $value ) {
        $template = str_replace( '{' . $key . '}', $value, $template );
    }
    return $template;
}

function bluu_send_html_email( $to, $subject, $body ) {
    add_filter( 'wp_mail_content_type', function() { return 'text/html'; } );
    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . get_bloginfo( 'name' ) . ' <' . get_option( 'admin_email' ) . '>',
    );
    $result = wp_mail( $to, $subject, $body, $headers );
    remove_filter( 'wp_mail_content_type', function() { return 'text/html'; } );
    return $result;
}

/* ══════════════════════════════════════════════════════════════════════════════
   9. RECAPTCHA v3 VERIFICATION
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_verify_recaptcha( $token ) {
    $secret = get_option( 'bluu_recaptcha_secret_key', '' );
    if ( empty( $secret ) || empty( $token ) ) {
        return array( 'success' => true, 'score' => null ); // bypass if not configured
    }

    $response = wp_remote_post( 'https://www.google.com/recaptcha/api/siteverify', array(
        'body' => array(
            'secret'   => $secret,
            'response' => $token,
            'remoteip' => isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
        ),
        'timeout' => 10,
    ) );

    if ( is_wp_error( $response ) ) {
        return array( 'success' => false, 'score' => 0, 'error' => 'network_error' );
    }

    $data = json_decode( wp_remote_retrieve_body( $response ), true );
    return array(
        'success' => ! empty( $data['success'] ),
        'score'   => isset( $data['score'] ) ? floatval( $data['score'] ) : 0,
        'action'  => $data['action'] ?? '',
    );
}

/* ══════════════════════════════════════════════════════════════════════════════
   10. AJAX HANDLER — Full-featured
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_handle_contact_form_full() {
    // 1. Nonce
    if ( ! check_ajax_referer( 'bluu_contact_nonce', 'nonce', false ) ) {
        wp_send_json_error( array( 'message' => esc_html__( 'Security check failed. Please refresh the page.', 'bluu-interactive' ) ), 403 );
    }

    // 2. Honeypot
    if ( ! empty( $_POST['website'] ) ) {
        wp_send_json_success( array( 'message' => esc_html__( 'Message sent!', 'bluu-interactive' ) ) );
    }

    // 3. reCAPTCHA
    $captcha_token = isset( $_POST['recaptcha_token'] ) ? sanitize_text_field( wp_unslash( $_POST['recaptcha_token'] ) ) : '';
    $captcha       = bluu_verify_recaptcha( $captcha_token );
    $min_score     = floatval( get_option( 'bluu_recaptcha_score', '0.5' ) );

    if ( $captcha['success'] && isset( $captcha['score'] ) && $captcha['score'] < $min_score ) {
        wp_send_json_error( array( 'message' => esc_html__( 'Your request was flagged as suspicious. Please try again.', 'bluu-interactive' ) ), 403 );
    }

    // 4. Sanitize inputs
    $name      = sanitize_text_field( wp_unslash( $_POST['contact_name']      ?? '' ) );
    $company   = sanitize_text_field( wp_unslash( $_POST['contact_company']   ?? '' ) );
    $email     = sanitize_email(      wp_unslash( $_POST['contact_email']     ?? '' ) );
    $phone     = sanitize_text_field( wp_unslash( $_POST['contact_phone']     ?? '' ) );
    $message   = sanitize_textarea_field( wp_unslash( $_POST['contact_situation'] ?? '' ) );

    // 5. Validate
    if ( empty( $name ) || empty( $email ) || empty( $message ) ) {
        wp_send_json_error( array( 'message' => esc_html__( 'Please fill in all required fields.', 'bluu-interactive' ) ), 400 );
    }
    if ( ! is_email( $email ) ) {
        wp_send_json_error( array( 'message' => esc_html__( 'Please enter a valid email address.', 'bluu-interactive' ) ), 400 );
    }

    // 6. Save submission as CPT
    $post_title = sprintf( 'Inquiry from %s%s', $name, $company ? " ({$company})" : '' );
    $post_id    = wp_insert_post( array(
        'post_title'  => $post_title,
        'post_type'   => 'bluu_submission',
        'post_status' => 'publish',
    ) );

    if ( $post_id && ! is_wp_error( $post_id ) ) {
        update_post_meta( $post_id, '_bluu_name',              $name );
        update_post_meta( $post_id, '_bluu_company',           $company );
        update_post_meta( $post_id, '_bluu_email',             $email );
        update_post_meta( $post_id, '_bluu_phone',             $phone );
        update_post_meta( $post_id, '_bluu_message',           $message );
        update_post_meta( $post_id, '_bluu_status',            'new' );
        update_post_meta( $post_id, '_bluu_recaptcha_score',   $captcha['score'] ?? 'n/a' );
        update_post_meta( $post_id, '_bluu_ip',                isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '' );
    }

    // 7. Template variables
    $vars = array(
        'name'      => $name,
        'company'   => $company ?: 'N/A',
        'email'     => $email,
        'phone'     => $phone ?: 'N/A',
        'message'   => $message,
        'date'      => wp_date( 'F j, Y \a\t g:i A T' ),
        'admin_url' => $post_id ? admin_url( 'post.php?post=' . $post_id . '&action=edit' ) : admin_url( 'edit.php?post_type=bluu_submission' ),
        'site_name' => get_bloginfo( 'name' ),
        'site_url'  => home_url(),
    );

    // 8. Send admin notification
    $notify_to      = get_option( 'bluu_notification_email', get_option( 'admin_email' ) );
    $notify_subject = bluu_render_email_template(
        get_option( 'bluu_notification_subject', '[{site_name}] New Inquiry from {name} ({company})' ),
        $vars
    );
    $notify_body = bluu_render_email_template(
        get_option( 'bluu_notification_body', bluu_default_admin_email_template() ),
        $vars
    );
    bluu_send_html_email( $notify_to, $notify_subject, $notify_body );

    // 9. Send auto-reply to submitter
    $reply_subject = bluu_render_email_template(
        get_option( 'bluu_autoreply_subject', 'We received your message, {name}' ),
        $vars
    );
    $reply_body = bluu_render_email_template(
        get_option( 'bluu_autoreply_body', bluu_default_autoreply_template() ),
        $vars
    );
    bluu_send_html_email( $email, $reply_subject, $reply_body );

    wp_send_json_success( array(
        'message' => esc_html__( "Message sent! We'll be in touch within 1 business day.", 'bluu-interactive' ),
    ) );
}
// Remove old handler, register new one
remove_action( 'wp_ajax_bluu_contact',        'bluu_handle_contact_form' );
remove_action( 'wp_ajax_nopriv_bluu_contact', 'bluu_handle_contact_form' );
add_action( 'wp_ajax_bluu_contact',           'bluu_handle_contact_form_full' );
add_action( 'wp_ajax_nopriv_bluu_contact',    'bluu_handle_contact_form_full' );

/* ══════════════════════════════════════════════════════════════════════════════
   11. FRONTEND — Enqueue reCAPTCHA script when site key is set
   ══════════════════════════════════════════════════════════════════════════════ */

function bluu_enqueue_recaptcha() {
    $site_key = get_option( 'bluu_recaptcha_site_key', '' );
    if ( empty( $site_key ) ) {
        return;
    }
    wp_enqueue_script(
        'google-recaptcha',
        'https://www.google.com/recaptcha/api.js?render=' . rawurlencode( $site_key ),
        array(),
        null,
        false
    );
    wp_localize_script( 'bluu-main-js', 'bluuRecaptcha', array(
        'siteKey' => $site_key,
        'action'  => 'contact_form',
    ) );
}
add_action( 'wp_enqueue_scripts', 'bluu_enqueue_recaptcha', 20 );
