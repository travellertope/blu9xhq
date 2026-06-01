<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ─── Register CPT ─────────────────────────────────────────────────────────────

add_action( 'init', 'bluuhq_register_enrollment_cpt' );
function bluuhq_register_enrollment_cpt(): void {
    register_post_type( 'bluu_seq_enrollment', [
        'label'        => 'Sequence Enrollments',
        'public'       => false,
        'show_in_rest' => true,
        'rest_base'    => 'bluu_seq_enrollment',
        'supports'     => [ 'title', 'custom-fields' ],
    ] );

    // Register meta keys so they can be filtered via the REST API
    $int_keys = [ 'enr_sequence_id', 'enr_client_id', 'enr_current_step', 'enr_enrolled_by' ];
    foreach ( [
        'enr_sequence_id', 'enr_client_id', 'enr_client_email', 'enr_client_name',
        'enr_status', 'enr_exit_reason', 'enr_current_step',
        'enr_enrolled_at', 'enr_last_sent_at', 'enr_next_send_at', 'enr_enrolled_by',
        'enr_paused_at',
    ] as $key ) {
        register_post_meta( 'bluu_seq_enrollment', $key, [
            'show_in_rest' => true,
            'single'       => true,
            'type'         => in_array( $key, $int_keys, true ) ? 'integer' : 'string',
        ] );
    }
}

// ─── ACF Field Group ─────────────────────────────────────────────────────────

add_action( 'acf/init', 'bluuhq_acf_enrollment' );
function bluuhq_acf_enrollment(): void {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;
    acf_add_local_field_group( [
        'key'          => 'group_bluuhq_enrollment',
        'title'        => 'Enrollment Details',
        'show_in_rest' => true,
        'location'     => [ [ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_seq_enrollment' ] ] ],
        'fields'   => [
            [ 'key' => 'field_enr_sequence_id',  'name' => 'enr_sequence_id',  'label' => 'Sequence',      'type' => 'number', 'show_in_rest' => true ],
            [ 'key' => 'field_enr_client_id',    'name' => 'enr_client_id',    'label' => 'Client',        'type' => 'number', 'show_in_rest' => true ],
            [ 'key' => 'field_enr_client_email', 'name' => 'enr_client_email', 'label' => 'Client Email',  'type' => 'text',   'show_in_rest' => true ],
            [ 'key' => 'field_enr_client_name',  'name' => 'enr_client_name',  'label' => 'Client Name',   'type' => 'text',   'show_in_rest' => true ],
            [ 'key' => 'field_enr_status',       'name' => 'enr_status',       'label' => 'Status',
              'type' => 'select', 'default_value' => 'active', 'show_in_rest' => true,
              'choices' => [ 'active' => 'Active', 'paused' => 'Paused', 'completed' => 'Completed', 'exited' => 'Exited' ] ],
            [ 'key' => 'field_enr_exit_reason',  'name' => 'enr_exit_reason',  'label' => 'Exit Reason',   'type' => 'text',   'show_in_rest' => true ],
            [ 'key' => 'field_enr_paused_at',    'name' => 'enr_paused_at',    'label' => 'Paused At',     'type' => 'text',   'show_in_rest' => true ],
            [ 'key' => 'field_enr_current_step', 'name' => 'enr_current_step', 'label' => 'Current Step',  'type' => 'number', 'default_value' => 0, 'show_in_rest' => true ],
            [ 'key' => 'field_enr_enrolled_at',  'name' => 'enr_enrolled_at',  'label' => 'Enrolled At',   'type' => 'text',   'show_in_rest' => true ],
            [ 'key' => 'field_enr_last_sent_at', 'name' => 'enr_last_sent_at', 'label' => 'Last Sent At',  'type' => 'text',   'show_in_rest' => true ],
            [ 'key' => 'field_enr_next_send_at', 'name' => 'enr_next_send_at', 'label' => 'Next Send At',  'type' => 'text',   'show_in_rest' => true ],
            [ 'key' => 'field_enr_enrolled_by',  'name' => 'enr_enrolled_by',  'label' => 'Enrolled By',   'type' => 'number', 'show_in_rest' => true ],
        ],
    ] );
}
