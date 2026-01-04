/**
 * Admin Dashboard Configuration
 * Customize colors, texts, and settings here
 */

const ADMIN_CONFIG = {
    // Branding
    appName: 'Tourify Admin',
    companyName: 'Tourify E-Tourism Banjarnegara',
    
    // Colors (match with main style.css)
    colors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        light: '#DBEAFE',
        dark: '#1E3A8A',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        textDark: '#1F2937',
        textLight: '#6B7280',
        white: '#FFFFFF',
        gray50: '#F9FAFB',
        gray100: '#F3F4F6',
        gray200: '#E5E7EB',
    },

    // Dashboard Statistics (Initial Values)
    dashboard: {
        totalUsers: 1245,
        todayBookings: 42,
        activeDestinations: 18,
        availableGuides: 12,
    },

    // Payment Statuses
    paymentStatus: {
        PENDING: 'pending',
        PAID: 'paid',
        CANCELLED: 'cancelled',
    },

    // User Status
    userStatus: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
    },

    // Destination Categories
    categories: [
        { value: 'pegunungan', label: 'Pegunungan' },
        { value: 'danau', label: 'Danau' },
        { value: 'air-terjun', label: 'Air Terjun' },
        { value: 'pantai', label: 'Pantai' },
        { value: 'budaya', label: 'Budaya' },
    ],

    // Guide Schedule Types
    schedules: [
        { value: 'weekdays', label: 'Senin - Jumat' },
        { value: 'weekends', label: 'Sabtu - Minggu' },
        { value: 'daily', label: 'Setiap Hari' },
    ],

    // Notification Types
    notificationTypes: {
        BOOKING: 'booking',
        REVIEW: 'review',
        USER: 'user',
        GUIDE: 'guide',
    },

    // Date Format
    dateFormat: 'DD MMM YYYY',
    timeFormat: 'HH:mm',

    // Pagination
    itemsPerPage: 10,

    // File Upload
    upload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
        certificateFormats: ['pdf', 'jpg', 'jpeg', 'png'],
    },

    // API Endpoints (for future backend integration)
    api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
        endpoints: {
            bookings: '/bookings',
            destinations: '/destinations',
            users: '/users',
            guides: '/guides',
            reviews: '/reviews',
        },
    },

    // Module Configuration
    modules: {
        dashboard: {
            enabled: true,
            title: 'Dashboard',
            icon: 'chart-line',
        },
        bookings: {
            enabled: true,
            title: 'Kelola Pemesanan Tiket',
            icon: 'ticket-alt',
        },
        destinations: {
            enabled: true,
            title: 'Kelola Destinasi Wisata',
            icon: 'map-marker-alt',
        },
        users: {
            enabled: true,
            title: 'Kelola User',
            icon: 'users',
        },
        guides: {
            enabled: true,
            title: 'Kelola Tour Guide',
            icon: 'person-hiking',
        },
        reviews: {
            enabled: true,
            title: 'Kelola Rating & Ulasan',
            icon: 'star',
        },
    },

    // Feature Flags
    features: {
        exportData: true,
        realtimeNotifications: true,
        chartAnalytics: true,
        userDeactivation: true,
        guideVerification: true,
        reviewModeration: true,
    },

    // Messages
    messages: {
        success: {
            save: 'Data berhasil disimpan!',
            delete: 'Data berhasil dihapus!',
            update: 'Data berhasil diperbarui!',
            export: 'Data berhasil diexport!',
        },
        error: {
            save: 'Gagal menyimpan data. Silakan coba lagi.',
            delete: 'Gagal menghapus data. Silakan coba lagi.',
            update: 'Gagal memperbarui data. Silakan coba lagi.',
            required: 'Field ini wajib diisi.',
            invalid: 'Input tidak valid.',
        },
        confirm: {
            delete: 'Apakah Anda yakin ingin menghapus data ini?',
            deactivate: 'Apakah Anda yakin ingin menonaktifkan user ini?',
            logout: 'Apakah Anda yakin ingin keluar dari dashboard admin?',
        },
    },

    // Local Storage Keys
    storage: {
        adminName: 'adminName',
        adminEmail: 'adminEmail',
        adminToken: 'adminToken',
        preferences: 'adminPreferences',
    },

    // Logging
    logging: {
        enabled: true,
        level: 'info', // 'debug', 'info', 'warn', 'error'
    },
};

// Export untuk Node.js/Module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ADMIN_CONFIG;
}

/**
 * Configuration Helper Functions
 */

const ConfigHelper = {
    /**
     * Get a config value by path
     * @param {string} path - Path to value (e.g., 'colors.primary')
     * @param {*} defaultValue - Default value if not found
     */
    get: function(path, defaultValue = null) {
        return path.split('.').reduce((obj, key) => 
            (obj && obj[key] !== undefined) ? obj[key] : defaultValue, ADMIN_CONFIG);
    },

    /**
     * Set a config value
     * @param {string} path - Path to value
     * @param {*} value - Value to set
     */
    set: function(path, value) {
        const keys = path.split('.');
        let obj = ADMIN_CONFIG;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
    },

    /**
     * Get color by name
     */
    getColor: function(colorName) {
        return ADMIN_CONFIG.colors[colorName] || '#000000';
    },

    /**
     * Get message by type and key
     */
    getMessage: function(type, key) {
        return ADMIN_CONFIG.messages[type]?.[key] || 'Operation completed.';
    },

    /**
     * Check if feature is enabled
     */
    isFeatureEnabled: function(featureName) {
        return ADMIN_CONFIG.features[featureName] === true;
    },

    /**
     * Log message if logging is enabled
     */
    log: function(level, message, data = null) {
        if (!ADMIN_CONFIG.logging.enabled) return;
        
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        const logLevel = levels[ADMIN_CONFIG.logging.level] || 1;
        const currentLevel = levels[level] || 1;

        if (currentLevel >= logLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            if (data) {
                console.log(`${prefix} ${message}`, data);
            } else {
                console.log(`${prefix} ${message}`);
            }
        }
    },
};

// Expose helper functions globally
window.ADMIN_CONFIG = ADMIN_CONFIG;
window.ConfigHelper = ConfigHelper;

console.log('✓ Admin Configuration loaded successfully!');
