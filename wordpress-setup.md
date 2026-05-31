# BluuHQ WordPress Setup Guide

This guide covers everything needed to turn your existing WordPress installation at
**bluuhq.com** into the data layer for the headless CRM & client portal at
**portal.bluuhq.com**.

---

## 1. Plugins to Install

Install and activate all of the following from the WP Admin plugins page or via WP-CLI.

| Plugin | Purpose |
|---|---|
| **WPGraphQL** (free, wp.org) | Exposes WordPress data as a GraphQL API |
| **WPGraphQL for ACF** (free add-on) | Makes ACF field groups queryable via WPGraphQL |
| **Advanced Custom Fields PRO** | Rich field groups for all 8 CPTs |
| **WP Offload Media Lite** | Routes media uploads to Cloudflare R2 via S3-compatible API |
| **WP Mail SMTP** | Routes all WP emails through Resend's SMTP |
| **JWT Authentication for WP REST API** | Issues JWTs for the `/wp-json/bluuhq/v1/auth/validate` endpoint |

### WP-CLI one-liner (plugins available on wp.org)

```bash
wp plugin install wp-graphql acf-to-wp-graphql wp-offload-media wp-mail-smtp --activate
```

Install **ACF PRO** and **JWT Auth** manually from their respective download sources.

---

## 2. WPGraphQL Settings

1. Go to **GraphQL → Settings**
2. Enable **GraphQL IDE** (dev only — disable in production)
3. Set **GraphQL Endpoint** to `/graphql`
4. Enable **Public Introspection** → OFF in production

---

## 3. WP Offload Media — Cloudflare R2 Configuration

1. Go to **Media → Offload Media**
2. Choose **Amazon S3 / Compatible** provider
3. Enter your Cloudflare R2 settings:
   - **Access Key ID**: from R2 API Token
   - **Secret Access Key**: from R2 API Token
   - **Bucket**: `bluuhq-files`
   - **Region**: `auto`
   - **Endpoint URL**: `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`
4. Enable **Remove Local Media** once confirmed working
5. Set **Custom Domain** to your R2 public URL or keep private (the Next.js app generates pre-signed URLs directly)

---

## 4. WP Mail SMTP — Resend SMTP Configuration

1. Go to **WP Mail SMTP → Settings**
2. **Mailer**: Other SMTP
3. **SMTP Host**: `smtp.resend.com`
4. **SMTP Port**: 587
5. **Encryption**: TLS
6. **Username**: `resend`
7. **Password**: your Resend API key (`re_...`)
8. **From Email**: `hello@bluuhq.com`
9. **From Name**: `BluuHQ`
10. Send a test email to confirm delivery.

---

## 5. Custom Plugin: bluuhq-cpts.php

Create the file below at:
```
wp-content/plugins/bluuhq-cpts/bluuhq-cpts.php
```

Then activate it in **Plugins → Installed Plugins**.

```php
<?php
/**
 * Plugin Name: BluuHQ Custom Post Types
 * Description: Registers all CPTs and user roles for the BluuHQ CRM & client portal.
 * Version:     1.0.0
 * Author:      BluuHQ
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ─── Register Custom Post Types ───────────────────────────────────────────────

function bluuhq_register_cpts() {

    $shared_args = [
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'show_in_graphql'    => true,
        'supports'           => [ 'title', 'custom-fields' ],
        'has_archive'        => false,
        'rewrite'            => false,
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
    ];

    // bluu_client
    register_post_type( 'bluu_client', array_merge( $shared_args, [
        'label'                 => 'Clients',
        'graphql_single_name'   => 'BuuClient',
        'graphql_plural_name'   => 'BluuClients',
        'menu_icon'             => 'dashicons-groups',
        'labels'                => [
            'name'          => 'Clients',
            'singular_name' => 'Client',
            'add_new_item'  => 'Add New Client',
            'edit_item'     => 'Edit Client',
        ],
    ] ) );

    // bluu_service
    register_post_type( 'bluu_service', array_merge( $shared_args, [
        'label'               => 'Services',
        'graphql_single_name' => 'BluuService',
        'graphql_plural_name' => 'BluuServices',
        'menu_icon'           => 'dashicons-products',
        'labels'              => [
            'name'          => 'Services',
            'singular_name' => 'Service',
            'add_new_item'  => 'Add New Service',
            'edit_item'     => 'Edit Service',
        ],
    ] ) );

    // bluu_subscription
    register_post_type( 'bluu_subscription', array_merge( $shared_args, [
        'label'               => 'Subscriptions',
        'graphql_single_name' => 'BluuSubscription',
        'graphql_plural_name' => 'BluuSubscriptions',
        'menu_icon'           => 'dashicons-calendar-alt',
        'labels'              => [
            'name'          => 'Subscriptions',
            'singular_name' => 'Subscription',
            'add_new_item'  => 'Add New Subscription',
            'edit_item'     => 'Edit Subscription',
        ],
    ] ) );

    // bluu_invoice
    register_post_type( 'bluu_invoice', array_merge( $shared_args, [
        'label'               => 'Invoices',
        'graphql_single_name' => 'BluuInvoice',
        'graphql_plural_name' => 'BluuInvoices',
        'menu_icon'           => 'dashicons-media-document',
        'labels'              => [
            'name'          => 'Invoices',
            'singular_name' => 'Invoice',
            'add_new_item'  => 'Add New Invoice',
            'edit_item'     => 'Edit Invoice',
        ],
    ] ) );

    // bluu_file
    register_post_type( 'bluu_file', array_merge( $shared_args, [
        'label'               => 'Files',
        'graphql_single_name' => 'BluuFile',
        'graphql_plural_name' => 'BluuFiles',
        'menu_icon'           => 'dashicons-portfolio',
        'labels'              => [
            'name'          => 'Files',
            'singular_name' => 'File',
            'add_new_item'  => 'Add New File',
            'edit_item'     => 'Edit File',
        ],
    ] ) );

    // bluu_communication
    register_post_type( 'bluu_communication', array_merge( $shared_args, [
        'label'               => 'Communications',
        'graphql_single_name' => 'BluuCommunication',
        'graphql_plural_name' => 'BluuCommunications',
        'menu_icon'           => 'dashicons-email-alt',
        'labels'              => [
            'name'          => 'Communications',
            'singular_name' => 'Communication',
            'add_new_item'  => 'Log Communication',
            'edit_item'     => 'Edit Communication',
        ],
    ] ) );

    // bluu_sequence
    register_post_type( 'bluu_sequence', array_merge( $shared_args, [
        'label'               => 'Email Sequences',
        'graphql_single_name' => 'BluuSequence',
        'graphql_plural_name' => 'BluuSequences',
        'menu_icon'           => 'dashicons-list-view',
        'labels'              => [
            'name'          => 'Email Sequences',
            'singular_name' => 'Sequence',
            'add_new_item'  => 'Add New Sequence',
            'edit_item'     => 'Edit Sequence',
        ],
    ] ) );

    // bluu_email_template
    register_post_type( 'bluu_email_template', array_merge( $shared_args, [
        'label'               => 'Email Templates',
        'graphql_single_name' => 'BluuEmailTemplate',
        'graphql_plural_name' => 'BluuEmailTemplates',
        'menu_icon'           => 'dashicons-editor-table',
        'labels'              => [
            'name'          => 'Email Templates',
            'singular_name' => 'Email Template',
            'add_new_item'  => 'Add New Template',
            'edit_item'     => 'Edit Template',
        ],
    ] ) );
}
add_action( 'init', 'bluuhq_register_cpts' );


// ─── Register Custom User Roles ───────────────────────────────────────────────

function bluuhq_register_roles() {
    // bluu_admin — full CRM access
    if ( ! get_role( 'bluu_admin' ) ) {
        add_role( 'bluu_admin', 'Bluu Admin', [
            'read'                      => true,
            'edit_posts'                => true,
            'delete_posts'              => false,
            'publish_posts'             => false,
            // CPT caps
            'edit_bluu_client'          => true,
            'edit_bluu_clients'         => true,
            'edit_others_bluu_clients'  => true,
            'publish_bluu_clients'      => true,
            'read_private_bluu_clients' => true,
            'delete_bluu_client'        => true,
            'delete_bluu_clients'       => true,
            'edit_bluu_service'             => true,
            'edit_bluu_services'            => true,
            'edit_others_bluu_services'     => true,
            'publish_bluu_services'         => true,
            'read_private_bluu_services'    => true,
            'delete_bluu_service'           => true,
            'delete_bluu_services'          => true,
            'edit_bluu_subscription'            => true,
            'edit_bluu_subscriptions'           => true,
            'edit_others_bluu_subscriptions'    => true,
            'publish_bluu_subscriptions'        => true,
            'read_private_bluu_subscriptions'   => true,
            'delete_bluu_subscription'          => true,
            'delete_bluu_subscriptions'         => true,
            'edit_bluu_invoice'             => true,
            'edit_bluu_invoices'            => true,
            'edit_others_bluu_invoices'     => true,
            'publish_bluu_invoices'         => true,
            'read_private_bluu_invoices'    => true,
            'delete_bluu_invoice'           => true,
            'delete_bluu_invoices'          => true,
            'edit_bluu_file'                => true,
            'edit_bluu_files'               => true,
            'edit_others_bluu_files'        => true,
            'publish_bluu_files'            => true,
            'read_private_bluu_files'       => true,
            'delete_bluu_file'              => true,
            'delete_bluu_files'             => true,
            'edit_bluu_communication'           => true,
            'edit_bluu_communications'          => true,
            'edit_others_bluu_communications'   => true,
            'publish_bluu_communications'       => true,
            'read_private_bluu_communications'  => true,
            'delete_bluu_communication'         => true,
            'delete_bluu_communications'        => true,
            'edit_bluu_sequence'            => true,
            'edit_bluu_sequences'           => true,
            'edit_others_bluu_sequences'    => true,
            'publish_bluu_sequences'        => true,
            'read_private_bluu_sequences'   => true,
            'delete_bluu_sequence'          => true,
            'delete_bluu_sequences'         => true,
            'edit_bluu_email_template'          => true,
            'edit_bluu_email_templates'         => true,
            'edit_others_bluu_email_templates'  => true,
            'publish_bluu_email_templates'      => true,
            'read_private_bluu_email_templates' => true,
            'delete_bluu_email_template'        => true,
            'delete_bluu_email_templates'       => true,
        ] );
    }

    // bluu_client — read-only WP role (actual data-scoping enforced in Next.js)
    if ( ! get_role( 'bluu_client' ) ) {
        add_role( 'bluu_client', 'Bluu Client', [
            'read' => true,
        ] );
    }
}
add_action( 'init', 'bluuhq_register_roles' );


// ─── REST endpoint: credential validation ─────────────────────────────────────
// Used by NextAuth credentials providers to validate username/password and return
// the user's role and associated client post ID.

add_action( 'rest_api_init', function () {
    register_rest_route( 'bluuhq/v1', '/auth/validate', [
        'methods'             => 'POST',
        'callback'            => 'bluuhq_validate_credentials',
        'permission_callback' => '__return_true',
    ] );
} );

function bluuhq_validate_credentials( WP_REST_Request $request ) {
    $username = sanitize_text_field( $request->get_param( 'username' ) );
    $password = $request->get_param( 'password' );

    if ( empty( $username ) || empty( $password ) ) {
        return new WP_Error( 'missing_fields', 'Username and password are required.', [ 'status' => 400 ] );
    }

    $user = wp_authenticate( $username, $password );

    if ( is_wp_error( $user ) ) {
        return new WP_Error( 'invalid_credentials', 'Invalid credentials.', [ 'status' => 401 ] );
    }

    // Resolve linked bluu_client post (stored as user meta)
    $client_post_id = get_user_meta( $user->ID, 'bluu_client_post_id', true );

    return [
        'id'    => $user->ID,
        'name'  => $user->display_name,
        'email' => $user->user_email,
        'roles' => $user->roles,
        'meta'  => [
            'bluu_client_post_id' => $client_post_id ?: null,
        ],
    ];
}


// ─── WPGraphQL: sensitive field resolvers ─────────────────────────────────────
// Sensitive ACF fields (e.g. contactEmail, contactPhone) are stored AES-256
// encrypted in the database. The GraphQL resolver returns a placeholder for
// any request that is NOT authenticated with the WP Application Password.
// Actual decryption happens in Next.js API routes (lib/encryption.ts).

add_action( 'graphql_register_types', function () {
    // Register a custom field on the BluuClient type that returns the encrypted
    // value only when the request carries a valid WP Application Password header.
    register_graphql_field( 'BluuClient', 'encryptedContactEmail', [
        'type'        => 'String',
        'description' => 'AES-256 encrypted contact email. Only returned with admin auth.',
        'resolve'     => function ( $post ) {
            if ( ! bluuhq_graphql_request_is_admin_authed() ) {
                return '[REDACTED]';
            }
            return get_post_meta( $post->ID, 'contact_email', true ) ?: '';
        },
    ] );

    register_graphql_field( 'BluuClient', 'encryptedContactPhone', [
        'type'        => 'String',
        'description' => 'AES-256 encrypted contact phone. Only returned with admin auth.',
        'resolve'     => function ( $post ) {
            if ( ! bluuhq_graphql_request_is_admin_authed() ) {
                return '[REDACTED]';
            }
            return get_post_meta( $post->ID, 'contact_phone', true ) ?: '';
        },
    ] );
} );

/**
 * Checks that the current HTTP request includes a valid WP Application Password
 * for a user with the bluu_admin role.
 */
function bluuhq_graphql_request_is_admin_authed(): bool {
    // WP REST API / WPGraphQL authenticate Application Passwords via the
    // HTTP Authorization header. If the current user is set and has the
    // bluu_admin role, the request is authorised.
    $user = wp_get_current_user();
    if ( ! $user || 0 === $user->ID ) {
        return false;
    }
    return in_array( 'bluu_admin', (array) $user->roles, true );
}
```

---

## 6. ACF Field Groups

Create field groups via **ACF → Field Groups → Add New** in WP Admin.
Each group must have:
- **Show this field group if**: Post Type = `<cpt_slug>`
- **Show in GraphQL**: enabled (requires WPGraphQL for ACF)
- **GraphQL Field Name**: set explicitly for each field

### 6.1 bluu_client Fields

| Label | Field Name | Type | Notes |
|---|---|---|---|
| Contact Name | `contact_name` | Text | |
| Contact Email | `contact_email` | Text | Store AES-256 encrypted value |
| Contact Phone | `contact_phone` | Text | Store AES-256 encrypted value |
| Company Name | `company_name` | Text | |
| Company Website | `company_website` | URL | |
| Industry | `industry` | Text | |
| Portal Email | `portal_email` | Email | WP user login |
| WP User ID | `wp_user_id` | Number | Linked WP user |
| Status | `status` | Select | active / inactive / churned / onboarding |
| Tags | `tags` | Textarea | Comma-separated |
| Notes | `notes` | Textarea | |
| Last Login At | `last_login_at` | Date Time Picker | |

### 6.2 bluu_service Fields

| Label | Field Name | Type |
|---|---|---|
| Description | `description` | Textarea |
| Category | `category` | Select (branding/web_design/web_development/seo/social_media/content/ads/consulting/other) |
| Base Price | `base_price` | Number |
| Currency | `currency` | Select (USD/GHS/NGN/GBP) |
| Billing Cycle | `billing_cycle` | Select (one_time/monthly/quarterly/annually) |
| Deliverables | `deliverables` | Textarea |
| Is Active | `is_active` | True/False |

### 6.3 bluu_subscription Fields

| Label | Field Name | Type |
|---|---|---|
| Client | `client_id` | Post Object (bluu_client) |
| Service | `service_id` | Post Object (bluu_service) |
| Status | `status` | Select (active/paused/cancelled/past_due/trialing) |
| Amount | `amount` | Number |
| Currency | `currency` | Text |
| Billing Cycle | `billing_cycle` | Select |
| Next Billing Date | `next_billing_date` | Date Picker |
| Start Date | `start_date` | Date Picker |
| End Date | `end_date` | Date Picker |
| Payment Gateway | `payment_gateway` | Select (stripe/paystack/manual) |
| Gateway Subscription ID | `gateway_subscription_id` | Text |
| Notes | `notes` | Textarea |

### 6.4 bluu_invoice Fields

| Label | Field Name | Type |
|---|---|---|
| Invoice Number | `invoice_number` | Text |
| Client | `client_id` | Post Object (bluu_client) |
| Subscription | `subscription_id` | Post Object (bluu_subscription) |
| Line Items | `line_items` | Repeater → description (Text), quantity (Number), unit_price (Number), total (Number) |
| Subtotal | `subtotal` | Number |
| Tax Rate | `tax_rate` | Number |
| Tax Amount | `tax_amount` | Number |
| Total | `total` | Number |
| Currency | `currency` | Text |
| Status | `status` | Select (draft/sent/paid/overdue/void) |
| Issued Date | `issued_date` | Date Picker |
| Due Date | `due_date` | Date Picker |
| Paid Date | `paid_date` | Date Picker |
| Payment Gateway | `payment_gateway` | Select |
| Gateway Payment ID | `gateway_payment_id` | Text |
| Payment Link | `payment_link` | URL |
| Notes | `notes` | Textarea |
| PDF URL | `pdf_url` | URL |

### 6.5 bluu_file Fields

| Label | Field Name | Type |
|---|---|---|
| Client | `client_id` | Post Object (bluu_client) |
| Description | `description` | Textarea |
| Category | `category` | Select (contract/brief/deliverable/invoice_attachment/asset/report/other) |
| R2 Key | `r2_key` | Text |
| R2 Bucket | `r2_bucket` | Text |
| MIME Type | `mime_type` | Text |
| File Size | `file_size` | Number |
| Original Name | `original_name` | Text |
| Visible to Client | `is_visible_to_client` | True/False |
| Uploaded By | `uploaded_by` | Number (WP User ID) |

### 6.6 bluu_communication Fields

| Label | Field Name | Type |
|---|---|---|
| Client | `client_id` | Post Object (bluu_client) |
| Direction | `direction` | Select (inbound/outbound) |
| Channel | `channel` | Select (email/phone/meeting/chat/note) |
| Subject | `subject` | Text |
| Body | `body` | Textarea |
| Occurred At | `occurred_at` | Date Time Picker |
| From Email | `from_email` | Email |
| To Email | `to_email` | Email |
| Mood Sentiment | `mood_sentiment` | Select (positive/neutral/negative/mixed) |
| Mood Score | `mood_score` | Number |
| Churn Risk | `churn_risk` | Select (low/medium/high/critical) |
| Mood Summary | `mood_summary` | Text |
| Logged By | `logged_by` | Number (WP User ID) |

### 6.7 bluu_sequence Fields

| Label | Field Name | Type |
|---|---|---|
| Trigger | `trigger` | Select (client_onboarding/invoice_sent/invoice_overdue/subscription_expiring/manual) |
| Steps | `steps` | Repeater → step_number (Number), delay_days (Number), email_template_id (Post Object: bluu_email_template) |
| Is Active | `is_active` | True/False |

### 6.8 bluu_email_template Fields

| Label | Field Name | Type |
|---|---|---|
| Subject | `subject` | Text |
| Body HTML | `body_html` | Wysiwyg |
| Body Text | `body_text` | Textarea |
| Type | `type` | Select (onboarding/invoice/follow_up/report/general/portal_invite) |
| Merge Tags | `merge_tags` | Textarea |

---

## 7. WP Application Password Setup

1. Go to **Users → Your Profile** (or the admin user's profile)
2. Scroll to **Application Passwords**
3. Enter a name: `BluuHQ Portal`
4. Click **Add New Application Password**
5. Copy the generated password immediately (shown once)
6. Set in `.env.local`:
   ```
   WP_APP_USERNAME=your_wp_username
   WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
   ```
   (spaces in the password are fine — WP generates them that way)

---

## 8. Linking WP Users to Clients

When you create a client and issue portal access:

1. Create a WP user with role `bluu_client`
2. Set their email to the client's portal email
3. In that user's profile, add user meta:
   - Key: `bluu_client_post_id`
   - Value: the `bluu_client` CPT post ID
4. The Next.js auth flow reads this meta to scope all portal queries

---

## 9. Deployment Checklist

- [ ] All 8 CPTs appear in WP Admin sidebar after activating `bluuhq-cpts` plugin
- [ ] ACF field groups created and visible on each CPT edit screen
- [ ] WPGraphQL IDE accessible at `/graphql` and introspection returns all types
- [ ] Test query: `{ bluuClients { nodes { id title } } }`
- [ ] Application Password validated — Next.js can query WPGraphQL with auth header
- [ ] R2 test upload succeeds via WP Offload Media
- [ ] WP Mail SMTP test email delivered via Resend
- [ ] `bluuhq/v1/auth/validate` endpoint returns correct roles
- [ ] Portal login flow works end-to-end (admin and client)
