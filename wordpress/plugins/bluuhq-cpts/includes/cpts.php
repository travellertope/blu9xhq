<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', 'bluuhq_register_cpts' );
function bluuhq_register_cpts(): void {

    $shared = [
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

    $types = [
        'bluu_client' => [
            'label'               => 'Clients',
            'menu_icon'           => 'dashicons-groups',
            'graphql_single_name' => 'BluuClient',
            'graphql_plural_name' => 'BluuClients',
            'labels'              => [
                'name'          => 'Clients',
                'singular_name' => 'Client',
                'add_new_item'  => 'Add New Client',
                'edit_item'     => 'Edit Client',
            ],
        ],
        'bluu_service' => [
            'label'               => 'Services',
            'menu_icon'           => 'dashicons-products',
            'graphql_single_name' => 'BluuService',
            'graphql_plural_name' => 'BluuServices',
            'labels'              => [
                'name'          => 'Services',
                'singular_name' => 'Service',
                'add_new_item'  => 'Add New Service',
                'edit_item'     => 'Edit Service',
            ],
        ],
        'bluu_subscription' => [
            'label'               => 'Subscriptions',
            'menu_icon'           => 'dashicons-calendar-alt',
            'graphql_single_name' => 'BluuSubscription',
            'graphql_plural_name' => 'BluuSubscriptions',
            'labels'              => [
                'name'          => 'Subscriptions',
                'singular_name' => 'Subscription',
                'add_new_item'  => 'Add New Subscription',
                'edit_item'     => 'Edit Subscription',
            ],
        ],
        'bluu_invoice' => [
            'label'               => 'Invoices',
            'menu_icon'           => 'dashicons-media-document',
            'graphql_single_name' => 'BluuInvoice',
            'graphql_plural_name' => 'BluuInvoices',
            'labels'              => [
                'name'          => 'Invoices',
                'singular_name' => 'Invoice',
                'add_new_item'  => 'Add New Invoice',
                'edit_item'     => 'Edit Invoice',
            ],
        ],
        'bluu_file' => [
            'label'               => 'Files',
            'menu_icon'           => 'dashicons-portfolio',
            'graphql_single_name' => 'BluuFile',
            'graphql_plural_name' => 'BluuFiles',
            'labels'              => [
                'name'          => 'Files',
                'singular_name' => 'File',
                'add_new_item'  => 'Add New File',
                'edit_item'     => 'Edit File',
            ],
        ],
        'bluu_communication' => [
            'label'               => 'Communications',
            'menu_icon'           => 'dashicons-email-alt',
            'graphql_single_name' => 'BluuCommunication',
            'graphql_plural_name' => 'BluuCommunications',
            'labels'              => [
                'name'          => 'Communications',
                'singular_name' => 'Communication',
                'add_new_item'  => 'Log Communication',
                'edit_item'     => 'Edit Communication',
            ],
        ],
        'bluu_sequence' => [
            'label'               => 'Email Sequences',
            'menu_icon'           => 'dashicons-list-view',
            'graphql_single_name' => 'BluuSequence',
            'graphql_plural_name' => 'BluuSequences',
            'labels'              => [
                'name'          => 'Email Sequences',
                'singular_name' => 'Sequence',
                'add_new_item'  => 'Add New Sequence',
                'edit_item'     => 'Edit Sequence',
            ],
        ],
        'bluu_email_template' => [
            'label'               => 'Email Templates',
            'menu_icon'           => 'dashicons-editor-table',
            'graphql_single_name' => 'BluuEmailTemplate',
            'graphql_plural_name' => 'BluuEmailTemplates',
            'labels'              => [
                'name'          => 'Email Templates',
                'singular_name' => 'Email Template',
                'add_new_item'  => 'Add New Template',
                'edit_item'     => 'Edit Template',
            ],
        ],
    ];

    foreach ( $types as $slug => $args ) {
        register_post_type( $slug, array_merge( $shared, $args ) );
    }
}
