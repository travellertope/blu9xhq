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
        'key'      => 'group_bluuhq_user_meta',
        'title'    => 'BluuHQ Team Settings',
        'fields'   => [
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
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'clientDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_client' ] ] ],
        'fields'           => [

            // ── Contact info ──────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_contact_name',  'name' => 'contact_name',  'label' => 'Contact Name',  'type' => 'text',  'required' => 1, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_client_contact_email', 'name' => 'contact_email', 'label' => 'Contact Email (encrypted)', 'type' => 'text', 'show_in_graphql' => 1,
              'instructions' => 'Stored AES-256 encrypted. Do not enter plaintext — use the portal to set this.' ],
            [ 'key' => 'field_bluuhq_client_contact_phone', 'name' => 'contact_phone', 'label' => 'Contact Phone (encrypted)', 'type' => 'text', 'show_in_graphql' => 1,
              'instructions' => 'Stored AES-256 encrypted. Do not enter plaintext — use the portal to set this.' ],

            // ── Company info ──────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_company_name',    'name' => 'company_name',    'label' => 'Company Name',    'type' => 'text', 'required' => 1, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_client_company_website', 'name' => 'company_website', 'label' => 'Company Website', 'type' => 'url',  'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_client_industry',        'name' => 'industry',        'label' => 'Industry',        'type' => 'text', 'show_in_graphql' => 1 ],

            // ── Portal access ─────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_portal_email', 'name' => 'portal_email', 'label' => 'Portal Email', 'type' => 'email', 'show_in_graphql' => 1,
              'instructions' => 'Email used to log into the client portal (WP user login).' ],
            [ 'key' => 'field_bluuhq_client_wp_user_id',   'name' => 'wp_user_id',   'label' => 'WP User ID',   'type' => 'number', 'show_in_graphql' => 1 ],

            // ── Status & health ───────────────────────────────────────────
            [
                'key' => 'field_bluuhq_client_status', 'name' => 'status', 'label' => 'Status',
                'type' => 'select', 'required' => 1, 'show_in_graphql' => 1,
                'choices' => [ 'active' => 'Active', 'onboarding' => 'Onboarding', 'inactive' => 'Inactive', 'churned' => 'Churned' ],
                'default_value' => 'active', 'return_format' => 'value',
            ],
            [
                'key' => 'field_bluuhq_client_health_status', 'name' => 'health_status', 'label' => 'Health Status',
                'type' => 'select', 'show_in_graphql' => 1,
                'choices' => [ 'healthy' => 'Healthy', 'needs_attention' => 'Needs Attention', 'at_risk' => 'At Risk' ],
                'default_value' => 'healthy', 'return_format' => 'value',
            ],
            [ 'key' => 'field_bluuhq_client_health_note',          'name' => 'health_note',          'label' => 'Health Note (manual override)', 'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_client_health_overridden_at', 'name' => 'health_overridden_at', 'label' => 'Health Overridden At',           'type' => 'date_time_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],
            [ 'key' => 'field_bluuhq_client_health_auto_score',    'name' => 'health_auto_score',    'label' => 'Auto Health Score (internal)',   'type' => 'text', 'show_in_graphql' => 1,
              'instructions' => 'Auto-calculated by the portal. Do not edit manually.' ],

            // ── Activity timestamps ───────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_last_login_at',     'name' => 'last_login_at',     'label' => 'Last Portal Login',   'type' => 'date_time_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],
            [ 'key' => 'field_bluuhq_client_last_contacted_at', 'name' => 'last_contacted_at', 'label' => 'Last Contacted',      'type' => 'date_time_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],
            [ 'key' => 'field_bluuhq_client_portal_invited_at', 'name' => 'portal_invited_at', 'label' => 'Portal Invited At',   'type' => 'date_time_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],

            // ── Misc ──────────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_client_tags',                       'name' => 'tags',                       'label' => 'Tags (comma-separated)',      'type' => 'text',    'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_client_notes',                      'name' => 'notes',                      'label' => 'Internal Notes',              'type' => 'textarea', 'rows' => 4, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_client_active_subscription_count',  'name' => 'active_subscription_count',  'label' => 'Active Subscription Count',   'type' => 'number', 'default_value' => 0, 'show_in_graphql' => 1 ],
        ],
    ] );
}


// ─── 2. bluu_service ─────────────────────────────────────────────────────────

function bluuhq_acf_service(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_service',
        'title'            => 'Service Details',
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'serviceDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_service' ] ] ],
        'fields'           => [
            [ 'key' => 'field_bluuhq_service_description', 'name' => 'description', 'label' => 'Description', 'type' => 'textarea', 'rows' => 4, 'show_in_graphql' => 1 ],
            [
                'key' => 'field_bluuhq_service_category', 'name' => 'category', 'label' => 'Category',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value',
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
            [ 'key' => 'field_bluuhq_service_base_price',  'name' => 'base_price',  'label' => 'Base Price',  'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1 ],
            [
                'key' => 'field_bluuhq_service_currency', 'name' => 'currency', 'label' => 'Currency',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value', 'default_value' => 'USD',
                'choices' => [ 'USD' => 'USD', 'GHS' => 'GHS', 'NGN' => 'NGN', 'GBP' => 'GBP', 'EUR' => 'EUR' ],
            ],
            [
                'key' => 'field_bluuhq_service_billing_cycle', 'name' => 'billing_cycle', 'label' => 'Billing Cycle',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value', 'default_value' => 'monthly',
                'choices' => [ 'one_time' => 'One-time', 'monthly' => 'Monthly', 'quarterly' => 'Quarterly', 'annually' => 'Annually' ],
            ],
            [ 'key' => 'field_bluuhq_service_deliverables', 'name' => 'deliverables', 'label' => 'Deliverables', 'type' => 'textarea', 'rows' => 4, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_service_is_active',    'name' => 'is_active',    'label' => 'Is Active',    'type' => 'true_false', 'default_value' => 1, 'show_in_graphql' => 1 ],
        ],
    ] );
}


// ─── 3. bluu_subscription ────────────────────────────────────────────────────

function bluuhq_acf_subscription(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_subscription',
        'title'            => 'Subscription Details',
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'subscriptionDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_subscription' ] ] ],
        'fields'           => [
            [ 'key' => 'field_bluuhq_sub_client_id',  'name' => 'client_id',  'label' => 'Client',  'type' => 'number', 'required' => 1, 'show_in_graphql' => 1,
              'instructions' => 'Enter the bluu_client post ID.' ],
            [ 'key' => 'field_bluuhq_sub_service_id', 'name' => 'service_id', 'label' => 'Service', 'type' => 'number', 'show_in_graphql' => 1,
              'instructions' => 'Enter the bluu_service post ID.' ],
            [
                'key' => 'field_bluuhq_sub_status', 'name' => 'status', 'label' => 'Status',
                'type' => 'select', 'required' => 1, 'show_in_graphql' => 1, 'return_format' => 'value', 'default_value' => 'active',
                'choices' => [ 'active' => 'Active', 'trialing' => 'Trialing', 'paused' => 'Paused', 'past_due' => 'Past Due', 'cancelled' => 'Cancelled' ],
            ],
            [ 'key' => 'field_bluuhq_sub_amount',   'name' => 'amount',   'label' => 'Amount',   'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_sub_currency',  'name' => 'currency', 'label' => 'Currency', 'type' => 'text', 'default_value' => 'USD', 'show_in_graphql' => 1 ],
            [
                'key' => 'field_bluuhq_sub_billing_cycle', 'name' => 'billing_cycle', 'label' => 'Billing Cycle',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value', 'default_value' => 'monthly',
                'choices' => [ 'monthly' => 'Monthly', 'quarterly' => 'Quarterly', 'annually' => 'Annually' ],
            ],
            [ 'key' => 'field_bluuhq_sub_next_billing_date',      'name' => 'next_billing_date',      'label' => 'Next Billing Date',      'type' => 'date_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [ 'key' => 'field_bluuhq_sub_start_date',             'name' => 'start_date',             'label' => 'Start Date',             'type' => 'date_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [ 'key' => 'field_bluuhq_sub_end_date',               'name' => 'end_date',               'label' => 'End Date',               'type' => 'date_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [
                'key' => 'field_bluuhq_sub_payment_gateway', 'name' => 'payment_gateway', 'label' => 'Payment Gateway',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value',
                'choices' => [ 'stripe' => 'Stripe', 'paystack' => 'Paystack', 'manual' => 'Manual' ],
            ],
            [ 'key' => 'field_bluuhq_sub_gateway_subscription_id', 'name' => 'gateway_subscription_id', 'label' => 'Gateway Subscription ID', 'type' => 'text', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_sub_notes',                    'name' => 'notes',                    'label' => 'Notes',                    'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1 ],
        ],
    ] );
}


// ─── 4. bluu_invoice ─────────────────────────────────────────────────────────

function bluuhq_acf_invoice(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_invoice',
        'title'            => 'Invoice Details',
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'invoiceDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_invoice' ] ] ],
        'fields'           => [
            [ 'key' => 'field_bluuhq_inv_invoice_number',  'name' => 'invoice_number',  'label' => 'Invoice Number', 'type' => 'text',   'required' => 1, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_client_id',       'name' => 'client_id',       'label' => 'Client ID',      'type' => 'number', 'required' => 1, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_subscription_id', 'name' => 'subscription_id', 'label' => 'Subscription ID', 'type' => 'number', 'show_in_graphql' => 1 ],

            // Line items repeater
            [
                'key'   => 'field_bluuhq_inv_line_items',
                'name'  => 'line_items',
                'label' => 'Line Items',
                'type'  => 'repeater',
                'show_in_graphql' => 1,
                'layout'          => 'table',
                'button_label'    => 'Add Line Item',
                'sub_fields'      => [
                    [ 'key' => 'field_bluuhq_inv_li_description', 'name' => 'description', 'label' => 'Description', 'type' => 'text',   'required' => 1, 'show_in_graphql' => 1 ],
                    [ 'key' => 'field_bluuhq_inv_li_quantity',    'name' => 'quantity',    'label' => 'Qty',         'type' => 'number', 'required' => 1, 'min' => 1, 'default_value' => 1, 'show_in_graphql' => 1 ],
                    [ 'key' => 'field_bluuhq_inv_li_unit_price',  'name' => 'unit_price',  'label' => 'Unit Price',  'type' => 'number', 'required' => 1, 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1 ],
                    [ 'key' => 'field_bluuhq_inv_li_total',       'name' => 'total',       'label' => 'Total',       'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1 ],
                ],
            ],

            [ 'key' => 'field_bluuhq_inv_subtotal',           'name' => 'subtotal',           'label' => 'Subtotal',           'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_tax_rate',           'name' => 'tax_rate',           'label' => 'Tax Rate (%)',        'type' => 'number', 'min' => 0, 'step' => '0.01', 'default_value' => 0, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_tax_amount',         'name' => 'tax_amount',         'label' => 'Tax Amount',         'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_total',              'name' => 'total',              'label' => 'Total',              'type' => 'number', 'min' => 0, 'step' => '0.01', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_currency',           'name' => 'currency',           'label' => 'Currency',           'type' => 'text',   'default_value' => 'USD', 'show_in_graphql' => 1 ],
            [
                'key' => 'field_bluuhq_inv_status', 'name' => 'status', 'label' => 'Status',
                'type' => 'select', 'required' => 1, 'show_in_graphql' => 1, 'return_format' => 'value', 'default_value' => 'draft',
                'choices' => [ 'draft' => 'Draft', 'sent' => 'Sent', 'paid' => 'Paid', 'overdue' => 'Overdue', 'void' => 'Void' ],
            ],
            [ 'key' => 'field_bluuhq_inv_issued_date',        'name' => 'issued_date',        'label' => 'Issued Date',        'type' => 'date_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [ 'key' => 'field_bluuhq_inv_due_date',           'name' => 'due_date',           'label' => 'Due Date',           'type' => 'date_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [ 'key' => 'field_bluuhq_inv_paid_date',          'name' => 'paid_date',          'label' => 'Paid Date',          'type' => 'date_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y' ],
            [
                'key' => 'field_bluuhq_inv_payment_gateway', 'name' => 'payment_gateway', 'label' => 'Payment Gateway',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value',
                'choices' => [ 'stripe' => 'Stripe', 'paystack' => 'Paystack', 'manual' => 'Manual' ],
            ],
            [ 'key' => 'field_bluuhq_inv_gateway_payment_id', 'name' => 'gateway_payment_id', 'label' => 'Gateway Payment ID', 'type' => 'text', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_payment_link',       'name' => 'payment_link',       'label' => 'Payment Link',       'type' => 'url',  'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_notes',              'name' => 'notes',              'label' => 'Notes',              'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_inv_pdf_url',            'name' => 'pdf_url',            'label' => 'PDF URL',            'type' => 'url',  'show_in_graphql' => 1 ],
        ],
    ] );
}


// ─── 5. bluu_file ─────────────────────────────────────────────────────────────

function bluuhq_acf_file(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_file',
        'title'            => 'File Details',
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'fileDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_file' ] ] ],
        'fields'           => [
            [ 'key' => 'field_bluuhq_file_client_id',          'name' => 'client_id',          'label' => 'Client ID',           'type' => 'number', 'required' => 1, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_file_description',        'name' => 'description',        'label' => 'Description',         'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1 ],
            [
                'key' => 'field_bluuhq_file_category', 'name' => 'category', 'label' => 'Category',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value',
                'choices' => [
                    'contract'           => 'Contract',
                    'brief'              => 'Brief',
                    'deliverable'        => 'Deliverable',
                    'invoice_attachment' => 'Invoice Attachment',
                    'asset'              => 'Asset',
                    'report'             => 'Report',
                    'other'              => 'Other',
                ],
            ],
            [ 'key' => 'field_bluuhq_file_r2_key',             'name' => 'r2_key',             'label' => 'R2 Object Key',       'type' => 'text', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_file_r2_bucket',          'name' => 'r2_bucket',          'label' => 'R2 Bucket',           'type' => 'text', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_file_mime_type',          'name' => 'mime_type',          'label' => 'MIME Type',           'type' => 'text', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_file_file_size',          'name' => 'file_size',          'label' => 'File Size (bytes)',   'type' => 'number', 'min' => 0, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_file_original_name',      'name' => 'original_name',      'label' => 'Original Filename',   'type' => 'text', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_file_is_visible_client',  'name' => 'is_visible_to_client', 'label' => 'Visible to Client', 'type' => 'true_false', 'default_value' => 0, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_file_uploaded_by',        'name' => 'uploaded_by',        'label' => 'Uploaded By (User ID)', 'type' => 'number', 'show_in_graphql' => 1 ],
        ],
    ] );
}


// ─── 6. bluu_communication ───────────────────────────────────────────────────

function bluuhq_acf_communication(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_communication',
        'title'            => 'Communication Log',
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'communicationLog',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_communication' ] ] ],
        'fields'           => [

            // ── Core fields ───────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_comm_client',      'name' => 'comm_client',      'label' => 'Client (Post ID)',   'type' => 'number', 'required' => 1, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_comm_logged_by',   'name' => 'comm_logged_by',   'label' => 'Logged By (User ID)', 'type' => 'number', 'required' => 1, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_comm_occurred_at', 'name' => 'comm_occurred_at', 'label' => 'Occurred At',        'type' => 'date_time_picker', 'required' => 1, 'show_in_graphql' => 1, 'return_format' => 'Y-m-d H:i:s', 'display_format' => 'd/m/Y H:i' ],
            [
                'key' => 'field_bluuhq_comm_direction', 'name' => 'comm_direction', 'label' => 'Direction',
                'type' => 'select', 'required' => 1, 'show_in_graphql' => 1, 'return_format' => 'value',
                'choices' => [ 'inbound' => 'Inbound', 'outbound' => 'Outbound' ],
            ],
            [
                'key' => 'field_bluuhq_comm_channel', 'name' => 'comm_channel', 'label' => 'Channel',
                'type' => 'select', 'required' => 1, 'show_in_graphql' => 1, 'return_format' => 'value',
                'choices' => [ 'email' => 'Email', 'phone' => 'Phone', 'meeting' => 'Meeting', 'chat' => 'Chat', 'note' => 'Internal Note' ],
            ],
            [ 'key' => 'field_bluuhq_comm_type',    'name' => 'comm_type',    'label' => 'Type',    'type' => 'text', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_comm_subject', 'name' => 'comm_subject', 'label' => 'Subject', 'type' => 'text', 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_comm_content', 'name' => 'comm_content', 'label' => 'Content', 'type' => 'textarea', 'rows' => 6, 'show_in_graphql' => 1 ],

            // ── AI mood analysis ──────────────────────────────────────────
            [
                'key' => 'field_bluuhq_comm_mood', 'name' => 'comm_mood', 'label' => 'Mood Sentiment',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value', 'allow_null' => 1,
                'choices' => [ 'positive' => 'Positive', 'neutral' => 'Neutral', 'mixed' => 'Mixed', 'concerned' => 'Concerned', 'at_risk' => 'At Risk' ],
            ],
            [
                'key' => 'field_bluuhq_comm_mood_source', 'name' => 'comm_mood_source', 'label' => 'Mood Source',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value', 'allow_null' => 1,
                'choices' => [ 'ai' => 'AI', 'manual' => 'Manual' ],
            ],
            [ 'key' => 'field_bluuhq_comm_mood_reasoning', 'name' => 'comm_mood_reasoning', 'label' => 'Mood Reasoning',  'type' => 'textarea', 'rows' => 3, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_comm_red_flags',      'name' => 'comm_red_flags',      'label' => 'Red Flags (JSON)', 'type' => 'textarea', 'rows' => 2, 'show_in_graphql' => 1,
              'instructions' => 'JSON-encoded string array, e.g. ["Mentioned competitor", "Delayed payment"]' ],

            // ── Email status (for automated sends) ────────────────────────
            [
                'key' => 'field_bluuhq_comm_email_status', 'name' => 'comm_email_status', 'label' => 'Email Status',
                'type' => 'select', 'show_in_graphql' => 1, 'return_format' => 'value', 'allow_null' => 1,
                'choices' => [ 'queued' => 'Queued', 'sent' => 'Sent', 'delivered' => 'Delivered', 'opened' => 'Opened', 'bounced' => 'Bounced', 'failed' => 'Failed' ],
            ],

            // ── Follow-up ─────────────────────────────────────────────────
            [ 'key' => 'field_bluuhq_comm_follow_up_needed',    'name' => 'comm_follow_up_needed',    'label' => 'Follow-up Needed',    'type' => 'true_false', 'default_value' => 0, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_comm_follow_up_due',       'name' => 'comm_follow_up_due',       'label' => 'Follow-up Due Date',  'type' => 'date_picker', 'show_in_graphql' => 1, 'return_format' => 'Y-m-d', 'display_format' => 'd/m/Y',
              'conditional_logic' => [ [ [ 'field' => 'field_bluuhq_comm_follow_up_needed', 'operator' => '==', 'value' => '1' ] ] ] ],
            [ 'key' => 'field_bluuhq_comm_follow_up_completed', 'name' => 'comm_follow_up_completed', 'label' => 'Follow-up Completed', 'type' => 'true_false', 'default_value' => 0, 'show_in_graphql' => 1,
              'conditional_logic' => [ [ [ 'field' => 'field_bluuhq_comm_follow_up_needed', 'operator' => '==', 'value' => '1' ] ] ] ],
        ],
    ] );
}


// ─── 7. bluu_sequence ────────────────────────────────────────────────────────

function bluuhq_acf_sequence(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_sequence',
        'title'            => 'Sequence Details',
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'sequenceDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_sequence' ] ] ],
        'fields'           => [
            [
                'key' => 'field_bluuhq_seq_trigger', 'name' => 'trigger', 'label' => 'Trigger',
                'type' => 'select', 'required' => 1, 'show_in_graphql' => 1, 'return_format' => 'value',
                'choices' => [
                    'client_onboarding'      => 'Client Onboarding',
                    'invoice_sent'           => 'Invoice Sent',
                    'invoice_overdue'        => 'Invoice Overdue',
                    'subscription_expiring'  => 'Subscription Expiring',
                    'manual'                 => 'Manual',
                ],
            ],
            [
                'key'          => 'field_bluuhq_seq_steps',
                'name'         => 'steps',
                'label'        => 'Steps',
                'type'         => 'repeater',
                'show_in_graphql' => 1,
                'layout'       => 'table',
                'button_label' => 'Add Step',
                'sub_fields'   => [
                    [ 'key' => 'field_bluuhq_seq_step_number',    'name' => 'step_number',       'label' => '#',          'type' => 'number', 'min' => 1, 'show_in_graphql' => 1 ],
                    [ 'key' => 'field_bluuhq_seq_delay_days',     'name' => 'delay_days',        'label' => 'Delay (days)', 'type' => 'number', 'min' => 0, 'default_value' => 0, 'show_in_graphql' => 1 ],
                    [ 'key' => 'field_bluuhq_seq_template_id',    'name' => 'email_template_id', 'label' => 'Email Template', 'type' => 'number', 'show_in_graphql' => 1,
                      'instructions' => 'Enter the bluu_email_template post ID.' ],
                ],
            ],
            [ 'key' => 'field_bluuhq_seq_is_active', 'name' => 'is_active', 'label' => 'Is Active', 'type' => 'true_false', 'default_value' => 0, 'show_in_graphql' => 1 ],
        ],
    ] );
}


// ─── 8. bluu_email_template ──────────────────────────────────────────────────

function bluuhq_acf_email_template(): void {
    acf_add_local_field_group( [
        'key'              => 'group_bluuhq_email_template',
        'title'            => 'Email Template Details',
        'show_in_graphql'  => 1,
        'graphql_field_name' => 'emailTemplateDetails',
        'location'         => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_email_template' ] ] ],
        'fields'           => [
            [ 'key' => 'field_bluuhq_et_subject',    'name' => 'subject',    'label' => 'Subject Line', 'type' => 'text', 'required' => 1, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_et_body_html',  'name' => 'body_html',  'label' => 'Body (HTML)',  'type' => 'wysiwyg', 'tabs' => 'all', 'toolbar' => 'full', 'media_upload' => 0, 'show_in_graphql' => 1 ],
            [ 'key' => 'field_bluuhq_et_body_text',  'name' => 'body_text',  'label' => 'Body (Plain Text fallback)', 'type' => 'textarea', 'rows' => 8, 'show_in_graphql' => 1 ],
            [
                'key' => 'field_bluuhq_et_type', 'name' => 'type', 'label' => 'Template Type',
                'type' => 'select', 'required' => 1, 'show_in_graphql' => 1, 'return_format' => 'value',
                'choices' => [
                    'onboarding'   => 'Onboarding',
                    'invoice'      => 'Invoice',
                    'follow_up'    => 'Follow-up',
                    'report'       => 'Report',
                    'general'      => 'General',
                    'portal_invite' => 'Portal Invite',
                ],
            ],
            [ 'key' => 'field_bluuhq_et_merge_tags', 'name' => 'merge_tags', 'label' => 'Available Merge Tags', 'type' => 'textarea', 'rows' => 4, 'show_in_graphql' => 1,
              'instructions' => 'Document the merge tags this template uses, e.g. {{client_name}}, {{invoice_number}}.' ],
        ],
    ] );
}
