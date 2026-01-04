<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'appdb' );

/** Database username */
define( 'DB_USER', 'appuser' );

/** Database password */
define( 'DB_PASSWORD', 'secret123' );

/** Database hostname */
define( 'DB_HOST', 'dbserver' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '5V=uiB7On_DI# k4{Z7[2/s0]M%&[AjX)c8p*QC3eTR*|7XDE{*QqJ?`#xN!Taij' );
define( 'SECURE_AUTH_KEY',  'b*7}}![NyeH-6bf[dad+HOwz%?o_fGz?!p%Xtd}%Q$)rn9p!,h[y(?.P3.AP+.YZ' );
define( 'LOGGED_IN_KEY',    '^v;;HPJz}G]dyGn-hodpgKJM6_q%L9`]lMU+nvN2aXSPv./oa 6m$_~_htSd!ua)' );
define( 'NONCE_KEY',        'dr?CclVx0t0bEIJFeb|-Yc+Zne0z@pDnnR4m(c }Naf6|:!-z;elFUf5V,L}oq>B' );
define( 'AUTH_SALT',        'PZ/y]=vn/cVk=p4<zV~&6IsYL%iGX&Q0uB2AP0eFrj7*KyAHWX&VlwPtj`TWR=pq' );
define( 'SECURE_AUTH_SALT', 'D.!;w06C?QQfxmD. %,a)U25oc)=<gKy7jW[}3W89CnTphdp}OU`-rBp#kkt91z,' );
define( 'LOGGED_IN_SALT',   'Xc{x%$+%nh<2X<KygXTX#T;&fCgF.eJX8bzo;Q@eT^Urr*4gr6KPtTPUtAXZ]7io' );
define( 'NONCE_SALT',       'JaXz+ks7s0jM4ficp/&gP,](wrw/Eq;0i<@:=.OK23p/K 0EYwI0oU{tv.ui@KnS' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
