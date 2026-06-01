<?php
/**
 * Registers all BluuHQ ACF field groups programmatically.
 * Requires: Advanced Custom Fields PRO + WPGraphQL for ACF.
 *
 * Field key convention: field_bluuhq_{cpt}_{field_name}
 * Group key convention: group_bluuhq_{cpt}
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'acf/init', 'bluuhq_register_acf_fields' );
function bluuhq_register_acf_fields(): void {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    bluuhq_acf_client();
    bluuhq_acf_service();
    bluuhq_acf_subscription();
    bluuhq_acf_invoice();
    bluuhq_acf_file();
    bluuhq_acf_communication();
    bluuhq_acf_sequence();
    bluuhq_acf_email_template();
    bluuhq_acf_user_meta();
}


// ─── 9. User meta (shown on WP Admin → Users → Edit User) ────────────────────

function bluuhq_acf_user_meta(): void {
    acf_add_local_field_group( [
        'key'          => 'group_bluuhq_user_meta',
        'title'        => 'BluuHQ Team Settings',
        'show_in_rest' => true,
        'fields'       => [
            [
                'key'           => 'field_bluuhq_user_role',
                'label'         => 'BluuHQ Role',
                'name'          => 'bluuhq_role',
                'type'          => 'select',
                'instructions'  => 'Controls what this team member can do inside the CRM portal.',
                'choices'       => [
                    'super_admin'     => 'Super Admin',
                    'account_manager' => 'Account Manager',
                    'billing_manager' => 'Billing Manager',
                    'support_staff'   => 'Support Staff',
                    'viewer'          => 'Viewer',
                ],
                'default_value' => 'viewer',
                'allow_null'    => 0,
                'ui'            => 1,
            ],
            [
                'key'           => 'field_bluuhq_user_status',
                'label'         => 'Status',
                'name'          => 'bluuhq_status',
                'type'          => 'select',
                'instructions'  => 'Deactivated users cannot log in to the portal.',
                'choices'       => [
                    'active'      => 'Active',
                    'deactivated' => 'Deactivated',
                ],
                'default_value' => 'active',
                'allow_null'    => 0,
                'ui'            => 1,
            ],
        ],
        'location' => [ [
            [ 'param' => 'user_form', 'operator' => '==', 'value' => 'all' ],
        ] ],
        'active'   => true,
    ] );
}


// ─── 1. bluu_client ───────────────────────────────────────────────────────────

function bluuhq_acf_client(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_client',
        'title'            => 'Client Details',
        'show_in_rest'     => true,
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'clientDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_client' ] ] ],
        'fields'           => [

            // ── Contact info ──────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_contact_name',  'name' => 'contact_name',  'label' => 'Contact Name',  'type' => 'text',  'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_client_contact_email', 'name' => 'contact_email', 'label' => 'Contact Email (encrypted)', 'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Stored AES-256 encrypted. Do not enter plaintext — use the portal to set this.' ],
            [ 'key' => 'field_bluuhq_client_contact_phone', 'name' => 'contact_phone', 'label' => 'Contact Phone (encrypted)', 'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Stored AES-256 encrypted. Do not enter plaintext — use the portal to set this.' ],

            // ── Company info ──────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_company_name',    'name' => 'company_name',    'label' => 'Company Name',    'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_client_company_website', 'name' => 'company_website', 'label' => 'Company Website', 'type' => 'url',  'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_client_industry',        'name' => 'industry',        'label' => 'Industry',        'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],

            // ── Portal access ─────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_portal_email', 'name' => 'portal_email', 'label' => 'Portal Email', 'type' => 'email', 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Email used to log into the client portal (WP user login).' ],
            [ 'key' => 'field_bluuhq_client_wp_user_id',   'name' => 'wp_user_id',   'label' => 'WP User ID',   'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true ],

            // ── Status & health ───────────────────────────────────────────
            [
                'key' => 'field_bluuhq_client_status', 'name' => 'status', 'label' => 'Status',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true,
                'choices' => [ 'active' => 'Active', 'onboarding' => 'Onboarding', 'inactive' => 'Inactive', 'churned' => 'Churned' ],
                'default_value' => 'active', 'return_format' => 'value',
            ],
            [
                'key' => 'field_bluuhq_client_health_status', 'name' => 'health_status', 'label' => 'Health Status',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true,
                'choices' => [ 'healthy' => 'Healthy', 'needs_attention' => 'Needs Attention', 'at_risk' => 'At Risk' ],
                'default_value' => 'healthy', 'return_format' => 'value',
            ],
            [ 'key' => 'field_bluuhq_client_health_note',          'name' => 'health_note',          'label' => 'Health Note (manual override)', 'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_client_health_overridden_at', 'name' => 'health_overridden_at', 'label' => 'Health Overridden At',           'type' => 'date_time_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],
            [ 'key' => 'field_bluuhq_client_health_auto_score',    'name' => 'health_auto_score',    'label' => 'Auto Health Score (internal)',   'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Auto-calculated by the portal. Do not edit manually.' ],

            // ── Activity timestamps ───────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_last_login_at',     'name' => 'last_login_at',     'label' => 'Last Portal Login',   'type' => 'date_time_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],
            [ 'key' => 'field_bluuhq_client_last_contacted_at', 'name' => 'last_contacted_at', 'label' => 'Last Contacted',      'type' => 'date_time_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],
            [ 'key' => 'field_bluuhq_client_portal_invited_at', 'name' => 'portal_invited_at', 'label' => 'Portal Invited At',   'type' => 'date_time_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],

            // ── Misc ──────────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_tags',                       'name' => 'tags',                       'label' => 'Tags (comma-separated)',      'type' => 'text',    'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_client_notes',                      'name' => 'notes',                      'label' => 'Internal Notes',              'type' => 'textarea', 'rows' => 4, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_client_active_subscription_count',  'name' => 'active_subscription_count',  'label' => 'Active Subscription Count',   'type' => 'number', 'default_value' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true ],
        ],
    ] );
}


// ─── 2. bluu_service ─────────────────────────────────────────────────────────

function bluuhq_acf_service(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_service',
        'title'            => 'Service Details',
        'show_in_rest'     => true,
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'serviceDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_service' ] ] ],
        'fields'           => [
            [ 'key' => 'field_bluuhq_service_description', 'name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'rows' => 4, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [
                'key' => 'field_bluuhq_service_category', 'name' => 'category', 'label' => 'Category',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value',
                'choices' => [
                    'branding'        => 'Branding',
                    'web_design'      => 'Web Design',
                    'web_development' => 'Web Development',
                    'seo'             => 'SEO',
                    'social_media'    => 'Social Media',
                    'content'         => 'Content',
                    'ads'             => 'Ads / Paid Media',
                    'consulting'      => 'Consulting',
                    'other'           => 'Other',
                ],
            ],
            [ 'key' => 'field_bluuhq_service_base_price',  'name' => 'base_price',  'label' => 'Base Price',  'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [
                'key' => 'field_bluuhq_service_currency', 'name' => 'currency', 'label' => 'Currency',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'default_value' => 'USD',
                'choices' => [ 'USD' => 'USD', 'GHS' => 'GHS', 'NGN' => 'NGN', 'GBP' => 'GBP', 'EUR' => 'EUR' ],
            ],
            [
                'key' => 'field_bluuhq_service_billing_cycle', 'name' => 'billing_cycle', 'label' => 'Billing Cycle',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'default_value' => 'monthly',
                'choices' => [ 'one_time' => 'One-time', 'monthly' => 'Monthly', 'quarterly' => 'Quarterly', 'annually' => 'Annually' ],
            ],
            [ 'key' => 'field_bluuhq_service_deliverables', 'name' => 'deliverables', 'label' => 'Deliverables', 'type' => 'textarea', 'rows' => 4, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_service_is_active',    'name' => 'is_active',    'label' => 'Is Active',    'type' => 'true_false', 'default_value' => 1, 'show_in_graphql' => 1, 'show_in_rest' => true ],
        ],
    ] );
}


// ─── 3. bluu_subscription ────────────────────────────────────────────────────

function bluuhq_acf_subscription(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_subscription',
        'title'            => 'Subscription Details',
        'show_in_rest'     => true,
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'subscriptionDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_subscription' ] ] ],
        'fields'           => [
            [ 'key' => 'field_bluuhq_sub_client_id',  'name' => 'client_id',  'label' => 'Client',  'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Enter the bluu_client post ID.' ],
            [ 'key' => 'field_bluuhq_sub_service_id', 'name' => 'service_id', 'label' => 'Service', 'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Enter the bluu_service post ID.' ],
            [
                'key' => 'field_bluuhq_sub_status', 'name' => 'status', 'label' => 'Status',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'default_value' => 'active',
                'choices' => [ 'active' => 'Active', 'trialing' => 'Trialing', 'paused' => 'Paused', 'past_due' => 'Past Due', 'cancelled' => 'Cancelled' ],
            ],
            [ 'key' => 'field_bluuhq_sub_amount',   'name' => 'amount',   'label' => 'Amount',   'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_sub_currency',  'name' => 'currency', 'label' => 'Currency', 'type' => 'text', 'default_value' => 'USD', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [
                'key' => 'field_bluuhq_sub_billing_cycle', 'name' => 'billing_cycle', 'label' => 'Billing Cycle',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'default_value' => 'monthly',
                'choices' => [ 'monthly' => 'Monthly', 'quarterly' => 'Quarterly', 'annually' => 'Annually' ],
            ],
            [ 'key' => 'field_bluuhq_sub_next_billing_date',      'name' => 'next_billing_date',      'label' => 'Next Billing Date',      'type' => 'date_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [ 'key' => 'field_bluuhq_sub_start_date',             'name' => 'start_date',             'label' => 'Start Date',             'type' => 'date_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [ 'key' => 'field_bluuhq_sub_end_date',               'name' => 'end_date',               'label' => 'End Date',               'type' => 'date_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [
                'key' => 'field_bluuhq_sub_payment_gateway', 'name' => 'payment_gateway', 'label' => 'Payment Gateway',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value',
                'choices' => [ 'stripe' => 'Stripe', 'paystack' => 'Paystack', 'manual' => 'Manual' ],
            ],
            [ 'key' => 'field_bluuhq_sub_gateway_subscription_id', 'name' => 'gateway_subscription_id', 'label' => 'Gateway Subscription ID', 'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_sub_notes',                    'name' => 'notes',                    'label' => 'Notes',                    'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            // ── Client Portal fields ──────────────────────────────────────
            [ 'key' => 'field_bluuhq_sub_action_button_labels', 'name' => 'sub_action_button_labels', 'label' => 'Action Button Labels',
              'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'JSON array of button labels shown in the client portal, e.g. ["View Dashboard","Contact Support"]' ],
            [ 'key' => 'field_bluuhq_sub_action_button_urls', 'name' => 'sub_action_button_urls', 'label' => 'Action Button URLs',
              'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'JSON array of URLs matching the button labels above.' ],
            [ 'key' => 'field_bluuhq_sub_sensitive_field_labels', 'name' => 'sub_sensitive_field_labels', 'label' => 'Credential Field Labels',
              'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'JSON array of credential field names shown in the portal vault, e.g. ["Client ID","API Key"]' ],
            [ 'key' => 'field_bluuhq_sub_sensitive_field_values', 'name' => 'sub_sensitive_field_values', 'label' => 'Credential Field Values (Encrypted)',
              'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'JSON array of AES-256-CBC encrypted values matching the labels. Use the portal encryption tool to generate.' ],
            [ 'key' => 'field_bluuhq_sub_cancellation_requested_at', 'name' => 'sub_cancellation_requested_at', 'label' => 'Cancellation Requested At',
              'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true, 'instructions' => 'ISO 8601 datetime set automatically when client requests cancellation.' ],
            [ 'key' => 'field_bluuhq_sub_cancellation_reason', 'name' => 'sub_cancellation_reason', 'label' => 'Cancellation Reason',
              'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_sub_cancellation_note', 'name' => 'sub_cancellation_note', 'label' => 'Cancellation Note',
              'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'show_in_rest' => true ],
        ],
    ] );
}


// ─── 4. bluu_invoice ─────────────────────────────────────────────────────────
// Field names use the inv_ prefix to match the WPInvoiceACF TypeScript interface
// and the meta_key queries in the Next.js REST layer.

function bluuhq_acf_invoice(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_invoice',
        'title'            => 'Invoice Details',
        'show_in_rest'     => true,
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'invoiceDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_invoice' ] ] ],
        'fields'           => [
            // ── Identifiers ───────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_inv_number',       'name' => 'inv_number',       'label' => 'Invoice Number',  'type' => 'text',   'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Auto-generated by the portal (e.g. BLU-2024-0001). Do not edit.' ],
            [ 'key' => 'field_bluuhq_inv_client',       'name' => 'inv_client',       'label' => 'Client (Post ID)', 'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_inv_subscription', 'name' => 'inv_subscription', 'label' => 'Subscription ID', 'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true ],

            // ── Line items stored as JSON ─────────────────────────────────
            [ 'key' => 'field_bluuhq_inv_line_items', 'name' => 'inv_line_items', 'label' => 'Line Items (JSON)',
              'type' => 'textarea', 'rows' => 5, 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Managed by the portal. JSON array: [{"description":"…","amount":100}]' ],

            // ── Amounts ───────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_inv_total',    'name' => 'inv_total',    'label' => 'Total',    'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_inv_currency', 'name' => 'inv_currency', 'label' => 'Currency', 'type' => 'text',   'default_value' => 'USD', 'show_in_graphql' => 1, 'show_in_rest' => true ],

            // ── Status ────────────────────────────────────────────────────
            [
                'key' => 'field_bluuhq_inv_status', 'name' => 'inv_status', 'label' => 'Status',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'default_value' => 'draft',
                'choices' => [ 'draft' => 'Draft', 'sent' => 'Sent', 'paid' => 'Paid', 'overdue' => 'Overdue', 'void' => 'Void' ],
            ],

            // ── Dates ─────────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_inv_issued_date', 'name' => 'inv_issued_date', 'label' => 'Issued Date', 'type' => 'date_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [ 'key' => 'field_bluuhq_inv_due_date',    'name' => 'inv_due_date',    'label' => 'Due Date',    'type' => 'date_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [ 'key' => 'field_bluuhq_inv_paid_at',     'name' => 'inv_paid_at',     'label' => 'Paid At',     'type' => 'date_time_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],

            // ── Payment ───────────────────────────────────────────────────
            [
                'key' => 'field_bluuhq_inv_payment_method', 'name' => 'inv_payment_method', 'label' => 'Payment Method',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'allow_null' => 1,
                'choices' => [ 'stripe' => 'Stripe', 'paystack' => 'Paystack', 'bank_transfer' => 'Bank Transfer', 'cash' => 'Cash' ],
            ],
            [ 'key' => 'field_bluuhq_inv_payment_gateway_ref', 'name' => 'inv_payment_gateway_ref', 'label' => 'Gateway Reference / Transaction ID', 'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_inv_last_reminder_sent',  'name' => 'inv_last_reminder_sent',  'label' => 'Last Reminder Sent',
              'type' => 'date_time_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i',
              'instructions' => 'Set automatically by the overdue-check cron.' ],

            // ── Misc ──────────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_inv_notes',   'name' => 'inv_notes',   'label' => 'Notes',   'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_inv_pdf_url', 'name' => 'inv_pdf_url', 'label' => 'PDF URL', 'type' => 'url', 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Auto-populated when a PDF is generated from the portal.' ],
        ],
    ] );
}


// ─── 5. bluu_file ─────────────────────────────────────────────────────────────
// Field names use the file_ prefix to match the WPFileACF TypeScript interface.
// Visibility is a string select ("internal" | "shared") rather than a boolean
// so the portal can filter by exact value via meta_query.

function bluuhq_acf_file(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_file',
        'title'            => 'File Details',
        'show_in_rest'     => true,
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'fileDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_file' ] ] ],
        'fields'           => [
            // ── Ownership ─────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_file_client',          'name' => 'file_client',          'label' => 'Client (Post ID)',     'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_file_subscription_id', 'name' => 'file_subscription_id', 'label' => 'Subscription (Post ID)', 'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_file_uploaded_by',     'name' => 'file_uploaded_by',     'label' => 'Uploaded By (WP User ID)', 'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true ],

            // ── Metadata ──────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_file_original_name', 'name' => 'file_original_name', 'label' => 'Original Filename', 'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_file_description',   'name' => 'file_description',   'label' => 'Description',       'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [
                'key' => 'field_bluuhq_file_category', 'name' => 'file_category', 'label' => 'Category',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'default_value' => 'general',
                'choices' => [
                    'general'  => 'General',
                    'contract' => 'Contract',
                    'invoice'  => 'Invoice',
                    'report'   => 'Report',
                    'media'    => 'Media',
                    'other'    => 'Other',
                ],
            ],
            [
                'key' => 'field_bluuhq_file_visibility', 'name' => 'file_visibility', 'label' => 'Visibility',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'default_value' => 'internal',
                'instructions' => '"internal" = team only; "shared" = visible to client in portal.',
                'choices' => [ 'internal' => 'Internal only', 'shared' => 'Shared with client' ],
            ],

            // ── Storage ───────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_file_r2_key',      'name' => 'file_r2_key',      'label' => 'R2 Object Key',     'type' => 'text',   'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Auto-set by the portal on upload. Do not edit.' ],
            [ 'key' => 'field_bluuhq_file_public_url',  'name' => 'file_public_url',  'label' => 'Public URL',        'type' => 'url',    'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_file_mime_type',   'name' => 'file_mime_type',   'label' => 'MIME Type',         'type' => 'text',   'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_file_size',        'name' => 'file_size',        'label' => 'File Size (bytes)', 'type' => 'number', 'min' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true ],
        ],
    ] );
}


// ─── 6. bluu_communication ───────────────────────────────────────────────────

function bluuhq_acf_communication(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_communication',
        'title'            => 'Communication Log',
        'show_in_rest'     => true,
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'communicationLog',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_communication' ] ] ],
        'fields'           => [

            // ── Core fields ───────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_comm_client',      'name' => 'comm_client',      'label' => 'Client (Post ID)',   'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_comm_logged_by',   'name' => 'comm_logged_by',   'label' => 'Logged By (User ID)', 'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_comm_occurred_at', 'name' => 'comm_occurred_at', 'label' => 'Occurred At',        'type' => 'date_time_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],
            [
                'key' => 'field_bluuhq_comm_direction', 'name' => 'comm_direction', 'label' => 'Direction',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value',
                'choices' => [ 'inbound' => 'Inbound', 'outbound' => 'Outbound', 'internal' => 'Internal (System)' ],
            ],
            [
                'key' => 'field_bluuhq_comm_channel', 'name' => 'comm_channel', 'label' => 'Channel',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value',
                'choices' => [ 'email' => 'Email', 'phone' => 'Phone', 'meeting' => 'Meeting', 'chat' => 'Chat', 'note' => 'Internal Note', 'system' => 'System / Audit' ],
            ],
            [ 'key' => 'field_bluuhq_comm_type',    'name' => 'comm_type',    'label' => 'Type',    'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_comm_subject', 'name' => 'comm_subject', 'label' => 'Subject', 'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_comm_content', 'name' => 'comm_content', 'label' => 'Content', 'type' => 'textarea', 'rows' => 6, 'show_in_graphql' => 1, 'show_in_rest' => true ],

            // ── AI mood analysis ──────────────────────────────────────────
            [
                'key' => 'field_bluuhq_comm_mood', 'name' => 'comm_mood', 'label' => 'Mood Sentiment',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'allow_null' => 1,
                'choices' => [ 'positive' => 'Positive', 'neutral' => 'Neutral', 'mixed' => 'Mixed', 'concerned' => 'Concerned', 'at_risk' => 'At Risk' ],
            ],
            [
                'key' => 'field_bluuhq_comm_mood_source', 'name' => 'comm_mood_source', 'label' => 'Mood Source',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'allow_null' => 1,
                'choices' => [ 'ai' => 'AI', 'manual' => 'Manual' ],
            ],
            [ 'key' => 'field_bluuhq_comm_mood_reasoning', 'name' => 'comm_mood_reasoning', 'label' => 'Mood Reasoning',  'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_comm_red_flags',      'name' => 'comm_red_flags',      'label' => 'Red Flags (JSON)', 'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'JSON-encoded string array, e.g. ["Mentioned competitor", "Delayed payment"]' ],

            // ── Email status (for automated sends) ────────────────────────
            [
                'key' => 'field_bluuhq_comm_email_status', 'name' => 'comm_email_status', 'label' => 'Email Status',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value', 'allow_null' => 1,
                'choices' => [ 'queued' => 'Queued', 'sent' => 'Sent', 'delivered' => 'Delivered', 'opened' => 'Opened', 'bounced' => 'Bounced', 'failed' => 'Failed' ],
            ],

            // ── Follow-up ─────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_comm_follow_up_needed',    'name' => 'comm_follow_up_needed',    'label' => 'Follow-up Needed',    'type' => 'true_false', 'default_value' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_comm_follow_up_due',       'name' => 'comm_follow_up_due',       'label' => 'Follow-up Due Date',  'type' => 'date_picker', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y',
              'conditional_logic' => [ [ [ 'field' => 'field_bluuhq_comm_follow_up_needed', 'operator' => '==', 'value' => '1' ] ] ] ],
            [ 'key' => 'field_bluuhq_comm_follow_up_completed', 'name' => 'comm_follow_up_completed', 'label' => 'Follow-up Completed', 'type' => 'true_false', 'default_value' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true,
              'conditional_logic' => [ [ [ 'field' => 'field_bluuhq_comm_follow_up_needed', 'operator' => '==', 'value' => '1' ] ] ] ],
        ],
    ] );
}


// ─── 7. bluu_sequence ────────────────────────────────────────────────────────

function bluuhq_acf_sequence(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_sequence',
        'title'            => 'Sequence Details',
        'show_in_rest'     => true,
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'sequenceDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_sequence' ] ] ],
        'fields'           => [
            [
                'key' => 'field_bluuhq_seq_trigger', 'name' => 'trigger', 'label' => 'Trigger',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value',
                'choices' => [
                    'client_onboarding'      => 'Client Onboarding',
                    'invoice_sent'           => 'Invoice Sent',
                    'invoice_overdue'        => 'Invoice Overdue',
                    'subscription_expiring'  => 'Subscription Expiring',
                    'manual'                 => 'Manual',
                ],
            ],
            [ 'key' => 'field_bluuhq_seq_description',      'name' => 'description',        'label' => 'Description',          'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_seq_trigger_delay',    'name' => 'trigger_delay_days', 'label' => 'Trigger Delay (days)', 'type' => 'number', 'min' => 0, 'default_value' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_seq_exit_conditions',  'name' => 'exit_conditions',    'label' => 'Exit Conditions',      'type' => 'text', 'default_value' => 'reply', 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Comma-separated: reply, manual' ],
            [
                'key'          => 'field_bluuhq_seq_steps',
                'name'         => 'steps',
                'label'        => 'Steps',
                'type'         => 'repeater',
                'show_in_graphql' => 1,
                'show_in_rest' => true,
                'layout'       => 'table',
                'button_label' => 'Add Step',
                'sub_fields'   => [
                    [ 'key' => 'field_bluuhq_seq_step_number',    'name' => 'step_number',       'label' => '#',               'type' => 'number', 'min' => 1, 'show_in_graphql' => 1, 'show_in_rest' => true ],
                    [ 'key' => 'field_bluuhq_seq_delay_days',     'name' => 'delay_days',        'label' => 'Delay (days)',    'type' => 'number', 'min' => 0, 'default_value' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true ],
                    [ 'key' => 'field_bluuhq_seq_step_subject',   'name' => 'subject',           'label' => 'Subject',         'type' => 'text',   'show_in_graphql' => 1, 'show_in_rest' => true ],
                    [ 'key' => 'field_bluuhq_seq_step_body_html', 'name' => 'body_html',         'label' => 'Body (HTML)',     'type' => 'wysiwyg', 'tabs' => 'all', 'toolbar' => 'full', 'media_upload' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true ],
                    [ 'key' => 'field_bluuhq_seq_template_id',    'name' => 'email_template_id', 'label' => 'Email Template (legacy)', 'type' => 'number', 'show_in_graphql' => 1, 'show_in_rest' => true,
                      'instructions' => 'Legacy: use subject + body_html above instead.' ],
                ],
            ],
            [ 'key' => 'field_bluuhq_seq_is_active', 'name' => 'is_active', 'label' => 'Is Active', 'type' => 'true_false', 'default_value' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true ],
        ],
    ] );
}


// ─── 8. bluu_email_template ──────────────────────────────────────────────────

function bluuhq_acf_email_template(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_email_template',
        'title'            => 'Email Template Details',
        'show_in_rest'     => true,
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'emailTemplateDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_email_template' ] ] ],
        'fields'           => [
            [ 'key' => 'field_bluuhq_et_subject',    'name' => 'subject',    'label' => 'Subject Line', 'type' => 'text', 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_et_body_html',  'name' => 'body_html',  'label' => 'Body (HTML)',  'type' => 'wysiwyg', 'tabs' => 'all', 'toolbar' => 'full', 'media_upload' => 0, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [ 'key' => 'field_bluuhq_et_body_text',  'name' => 'body_text',  'label' => 'Body (Plain Text fallback)', 'type' => 'textarea', 'rows' => 8, 'show_in_graphql' => 1, 'show_in_rest' => true ],
            [
                'key' => 'field_bluuhq_et_type', 'name' => 'type', 'label' => 'Template Type',
                'type' => 'select', 'show_in_graphql' => 1, 'show_in_rest' => true, 'return_format' => 'value',
                'choices' => [
                    'onboarding'   => 'Onboarding',
                    'invoice'      => 'Invoice',
                    'follow_up'    => 'Follow-up',
                    'report'       => 'Report',
                    'general'      => 'General',
                    'portal_invite' => 'Portal Invite',
                ],
            ],
            [ 'key' => 'field_bluuhq_et_merge_tags', 'name' => 'merge_tags', 'label' => 'Available Merge Tags', 'type' => 'textarea', 'rows' => 4, 'show_in_graphql' => 1, 'show_in_rest' => true,
              'instructions' => 'Document the merge tags this template uses, e.g. {{client_name}}, {{invoice_number}}.' ],
        ],
    ] );
}
