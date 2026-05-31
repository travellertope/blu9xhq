<?php
/**
 * Registers BluuHQ settings as WP options (exposed via /wp/v2/settings REST API)
 * and registers client_stripe_customer_id / client_paystack_customer_id user meta.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', 'bluuhq_register_settings' );

function bluuhq_register_settings(): void {
    $string_settings = [
        'bluuhq_bank_name'           => 'Bank name for client bank-transfer payments',
        'bluuhq_bank_account_name'   => 'Bank account holder name',
        'bluuhq_bank_account_number' => 'Bank account number',
        'bluuhq_bank_sort_code'      => 'Sort code or routing number',
        'bluuhq_address'             => 'Business address shown on invoice PDFs',
        'bluuhq_from_email_name'     => 'Sender name used in outgoing client emails',
    ];

    foreach ( $string_settings as $key => $description ) {
        register_setting(
            'bluuhq',
            $key,
            [
                'type'              => 'string',
                'description'       => $description,
                'sanitize_callback' => 'sanitize_text_field',
                'show_in_rest'      => true,
                'default'           => '',
            ]
        );
    }

    // ── Payment gateway customer IDs stored on WP users ──────────────────────

    $user_meta_keys = [
        'client_stripe_customer_id'   => 'Stripe customer ID for this portal client',
        'client_paystack_customer_id' => 'Paystack customer code for this portal client',
    ];

    foreach ( $user_meta_keys as $key => $description ) {
        register_meta(
            'user',
            $key,
            [
                'type'         => 'string',
                'description'  => $description,
                'single'       => true,
                'default'      => '',
                'show_in_rest' => true,
            ]
        );
    }
}
