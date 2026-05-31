<?php
/**
 * WPGraphQL custom resolvers.
 * Sensitive ACF fields (contact_email, contact_phone) are stored AES-256
 * encrypted. These resolvers return the raw encrypted value only when the
 * request is authenticated with a bluu_admin Application Password.
 * Decryption happens in Next.js (lib/encryption.ts).
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'graphql_register_types', function (): void {
    if ( ! function_exists( 'register_graphql_field' ) ) return;

    register_graphql_field( 'BluuClient', 'encryptedContactEmail', [
        'type'        => 'String',
        'description' => 'AES-256 encrypted contact email. Returned only with bluu_admin auth.',
        'resolve'     => function ( $post ): string {
            if ( ! bluuhq_graphql_is_admin() ) return '[REDACTED]';
            return (string) get_post_meta( $post->ID, 'contact_email', true );
        },
    ] );

    register_graphql_field( 'BluuClient', 'encryptedContactPhone', [
        'type'        => 'String',
        'description' => 'AES-256 encrypted contact phone. Returned only with bluu_admin auth.',
        'resolve'     => function ( $post ): string {
            if ( ! bluuhq_graphql_is_admin() ) return '[REDACTED]';
            return (string) get_post_meta( $post->ID, 'contact_phone', true );
        },
    ] );
} );

function bluuhq_graphql_is_admin(): bool {
    $user = wp_get_current_user();
    return $user && $user->ID > 0 && in_array( 'bluu_admin', (array) $user->roles, true );
}
