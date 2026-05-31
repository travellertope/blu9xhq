<?php
/**
 * Support Ticket CPTs and ACF field groups.
 * Registers: bluu_ticket, bluu_ticket_reply, bluu_ticket_status_log, bluu_ticket_attachment
 * Does NOT modify any existing CPTs.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', 'bluuhq_register_ticket_cpts' );

function bluuhq_register_ticket_cpts(): void {
    $defaults = [
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => false,
        'show_in_rest'       => true,
        'show_in_graphql'    => true,
        'supports'           => [ 'title', 'custom-fields' ],
        'has_archive'        => false,
        'rewrite'            => false,
    ];

    register_post_type( 'bluu_ticket', array_merge( $defaults, [
        'label'              => 'Support Ticket',
        'rest_base'          => 'bluu_ticket',
        'graphql_single_name' => 'ticket',
        'graphql_plural_name' => 'tickets',
    ]));

    register_post_type( 'bluu_ticket_reply', array_merge( $defaults, [
        'label'              => 'Ticket Reply',
        'rest_base'          => 'bluu_ticket_reply',
        'graphql_single_name' => 'ticketReply',
        'graphql_plural_name' => 'ticketReplies',
    ]));

    register_post_type( 'bluu_ticket_status_log', array_merge( $defaults, [
        'label'              => 'Ticket Status Log',
        'rest_base'          => 'bluu_ticket_status_log',
        'show_in_graphql'    => false,
    ]));

    register_post_type( 'bluu_ticket_attachment', array_merge( $defaults, [
        'label'              => 'Ticket Attachment',
        'rest_base'          => 'bluu_ticket_attachment',
        'show_in_graphql'    => false,
    ]));
}

// ── Register ACF field groups programmatically ────────────────────────────────

add_action( 'acf/init', 'bluuhq_register_ticket_field_groups' );

function bluuhq_register_ticket_field_groups(): void {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    // ── bluu_ticket fields ──
    acf_add_local_field_group([
        'key'      => 'group_bluu_ticket',
        'title'    => 'Ticket Fields',
        'location' => [[ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_ticket' ] ]],
        'fields'   => [
            bluuhq_acf_text( 'tkt_number',            'Ticket Number' ),
            bluuhq_acf_num(  'tkt_client',            'Client Post ID' ),
            bluuhq_acf_num(  'tkt_submitted_by',      'Submitted By (WP User ID)' ),
            bluuhq_acf_num(  'tkt_assigned_to',       'Assigned To (WP User ID)' ),
            bluuhq_acf_text( 'tkt_category',          'Category' ),
            bluuhq_acf_text( 'tkt_priority',          'Priority',  'normal' ),
            bluuhq_acf_text( 'tkt_status',            'Status',    'open' ),
            bluuhq_acf_num(  'tkt_retainer_id',       'Retainer/Subscription ID' ),
            bluuhq_acf_text( 'tkt_sla_response_target', 'SLA Response Target' ),
            bluuhq_acf_text( 'tkt_sla_resolve_target',  'SLA Resolve Target' ),
            bluuhq_acf_text( 'tkt_sla_alerted_at',    'SLA Last Alerted At' ),
            bluuhq_acf_text( 'tkt_first_response_at', 'First Response At' ),
            bluuhq_acf_text( 'tkt_resolved_at',       'Resolved At' ),
            bluuhq_acf_text( 'tkt_closed_at',         'Closed At' ),
        ],
    ]);

    // ── bluu_ticket_reply fields ──
    acf_add_local_field_group([
        'key'      => 'group_bluu_ticket_reply',
        'title'    => 'Ticket Reply Fields',
        'location' => [[ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_ticket_reply' ] ]],
        'fields'   => [
            bluuhq_acf_num(  'reply_ticket_id',   'Ticket Post ID' ),
            bluuhq_acf_num(  'reply_author_id',   'Author WP User ID' ),
            bluuhq_acf_text( 'reply_body',        'Body' ),
            bluuhq_acf_text( 'reply_type',        'Reply Type', 'reply' ),
        ],
    ]);

    // ── bluu_ticket_status_log fields ──
    acf_add_local_field_group([
        'key'      => 'group_bluu_ticket_status_log',
        'title'    => 'Ticket Status Log Fields',
        'location' => [[ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_ticket_status_log' ] ]],
        'fields'   => [
            bluuhq_acf_num(  'log_ticket_id',   'Ticket Post ID' ),
            bluuhq_acf_num(  'log_changed_by',  'Changed By (WP User ID)' ),
            bluuhq_acf_text( 'log_from_status', 'From Status' ),
            bluuhq_acf_text( 'log_to_status',   'To Status' ),
            bluuhq_acf_text( 'log_note',        'Note' ),
            bluuhq_acf_text( 'log_changed_at',  'Changed At' ),
        ],
    ]);

    // ── bluu_ticket_attachment fields ──
    acf_add_local_field_group([
        'key'      => 'group_bluu_ticket_attachment',
        'title'    => 'Ticket Attachment Fields',
        'location' => [[ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_ticket_attachment' ] ]],
        'fields'   => [
            bluuhq_acf_num(  'att_ticket_id',    'Ticket Post ID' ),
            bluuhq_acf_num(  'att_reply_id',     'Reply Post ID' ),
            bluuhq_acf_num(  'att_uploaded_by',  'Uploaded By (WP User ID)' ),
            bluuhq_acf_text( 'att_file_name',    'File Name' ),
            bluuhq_acf_text( 'att_file_url',     'File URL / R2 Key' ),
            bluuhq_acf_text( 'att_file_type',    'MIME Type' ),
            bluuhq_acf_num(  'att_file_size_kb', 'File Size (KB)' ),
        ],
    ]);
}

// ── ACF field builder helpers ─────────────────────────────────────────────────

function bluuhq_acf_text( string $name, string $label, string $default = '' ): array {
    return [
        'key'           => 'field_' . $name,
        'name'          => $name,
        'label'         => $label,
        'type'          => 'text',
        'default_value' => $default,
        'show_in_rest'  => true,
    ];
}

function bluuhq_acf_num( string $name, string $label ): array {
    return [
        'key'          => 'field_' . $name,
        'name'         => $name,
        'label'        => $label,
        'type'         => 'number',
        'show_in_rest' => true,
    ];
}
