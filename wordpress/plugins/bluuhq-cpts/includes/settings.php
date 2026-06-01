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

    // ── User meta stored on WP users ─────────────────────────────────────────

    $string_user_meta = [
        'client_stripe_customer_id'    => 'Stripe customer ID for this portal client',
        'client_paystack_customer_id'  => 'Paystack customer code for this portal client',
        'first_name'                   => 'Contact first name',
        'last_name'                    => 'Contact last name',
        'portal_phone'                 => 'Client phone number shown in portal',
        'billing_address'              => 'JSON-encoded billing address for the client',
        'portal_setup_complete'        => 'Whether the client has completed portal setup (1 or empty)',
        'portal_setup_completed_at'    => 'ISO timestamp of portal setup completion',
        'portal_last_login'            => 'ISO timestamp of most recent portal login',
    ];

    foreach ( $string_user_meta as $key => $description ) {
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

    // notification_preferences is stored as a serialised PHP array
    register_meta(
        'user',
        'notification_preferences',
        [
            'type'         => 'array',
            'description'  => 'Enabled notification types for this portal client',
            'single'       => true,
            'default'      => [ 'invoice_reminders', 'new_files', 'service_updates' ],
            'show_in_rest' => [
                'schema' => [
                    'type'  => 'array',
                    'items' => [ 'type' => 'string' ],
                ],
            ],
        ]
    );
}
