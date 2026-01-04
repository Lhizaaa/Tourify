/**
 * Admin Authentication & Data Synchronization System
 * Handles login, session management, and data sync across pages
 */

// ============================================
// AUTHENTICATION SYSTEM
// ============================================

class AdminAuthSystem {
    constructor() {
        this.users = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@tourify.local',
                password: 'admin123', // Demo only - use bcrypt in production
                name: 'Admin Tourify',
                role: 'superadmin',
                avatar: 'https://via.placeholder.com/100?text=Admin'
            },
            {
                id: 2,
                username: 'manager',
                email: 'manager@tourify.local',
                password: 'manager123',
                name: 'Manager Destinasi',
                role: 'manager',
                avatar: 'https://via.placeholder.com/100?text=Manager'
            }
        ];

        this.currentSession = null;
        this.loadSession();
    }

    /**
     * Login user
     */
    login(username, password, rememberMe = false) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                const user = this.users.find(u => 
                    (u.username === username || u.email === username) && 
                    u.password === password
                );

                if (!user) {
                    reject(new Error('Username atau password salah'));
                    return;
                }

                // Create session
                const session = {
                    id: Math.random().toString(36).substr(2, 9),
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    loginTime: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                };

                this.currentSession = session;
                
                // Save session
                sessionStorage.setItem('adminSession', JSON.stringify(session));
                
                if (rememberMe) {
                    localStorage.setItem('adminRemember', JSON.stringify({
                        username: user.username,
                        rememberTime: new Date().toISOString()
                    }));
                }

                // Broadcast login to all tabs/windows
                this.broadcastEvent('admin:login', { username: user.username });

                resolve(session);
            }, 1000); // 1 second delay to simulate network
        });
    }

    /**
     * Logout user
     */
    logout() {
        this.currentSession = null;
        sessionStorage.removeItem('adminSession');
        localStorage.removeItem('adminRemember');
        
        this.broadcastEvent('admin:logout', {});
    }

    /**
     * Load existing session
     */
    loadSession() {
        const sessionData = sessionStorage.getItem('adminSession');
        if (sessionData) {
            try {
                this.currentSession = JSON.parse(sessionData);
                
                // Check if session expired
                if (new Date(this.currentSession.expiresAt) < new Date()) {
                    this.logout();
                    return false;
                }
                
                return true;
            } catch (e) {
                this.logout();
                return false;
            }
        }
        return false;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentSession !== null;
    }

    /**
     * Get current session
     */
    getSession() {
        return this.currentSession;
    }

    /**
     * Broadcast event across tabs
     */
    broadcastEvent(eventName, data) {
        const event = new CustomEvent('adminEvent', {
            detail: { type: eventName, data: data }
        });
        window.dispatchEvent(event);

        // Also store in localStorage for cross-tab communication
        localStorage.setItem(`adminEvent:${Date.now()}`, JSON.stringify({
            type: eventName,
            data: data
        }));
    }
}

// ============================================
// DATA SYNCHRONIZATION SYSTEM
// ============================================

class DataSyncSystem {
    constructor() {
        this.syncKey = 'tourify_data_sync';
        this.version = 1;
        this.initializeDataStore();
    }

    /**
     * Initialize data store
     */
    initializeDataStore() {
        const existingData = localStorage.getItem(this.syncKey);
        if (!existingData) {
            const initialData = {
                version: this.version,
                lastSync: new Date().toISOString(),
                destinations: [],
                guides: [],
                bookings: [],
                reviews: [],
                users: []
            };
            localStorage.setItem(this.syncKey, JSON.stringify(initialData));
        }
    }

    /**
     * Get all data
     */
    getAllData() {
        try {
            const data = localStorage.getItem(this.syncKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error getting data:', e);
            return null;
        }
    }

    /**
     * Sync destinations
     */
    syncDestinations(destinations) {
        const data = this.getAllData();
        if (data) {
            data.destinations = destinations;
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('destinations', destinations);
            return true;
        }
        return false;
    }

    /**
     * Add or update destination
     */
    saveDestination(destination) {
        const data = this.getAllData();
        if (data) {
            const index = data.destinations.findIndex(d => d.id === destination.id);
            if (index >= 0) {
                data.destinations[index] = { ...data.destinations[index], ...destination };
            } else {
                destination.id = destination.id || 'dest_' + Date.now();
                data.destinations.push(destination);
            }
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('destination:updated', destination);
            return destination;
        }
        return null;
    }

    /**
     * Delete destination
     */
    deleteDestination(destinationId) {
        const data = this.getAllData();
        if (data) {
            data.destinations = data.destinations.filter(d => d.id !== destinationId);
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('destination:deleted', { id: destinationId });
            return true;
        }
        return false;
    }

    /**
     * Sync guides
     */
    syncGuides(guides) {
        const data = this.getAllData();
        if (data) {
            data.guides = guides;
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('guides', guides);
            return true;
        }
        return false;
    }

    /**
     * Save guide
     */
    saveGuide(guide) {
        const data = this.getAllData();
        if (data) {
            const index = data.guides.findIndex(g => g.id === guide.id);
            if (index >= 0) {
                data.guides[index] = { ...data.guides[index], ...guide };
            } else {
                guide.id = guide.id || 'guide_' + Date.now();
                data.guides.push(guide);
            }
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('guide:updated', guide);
            return guide;
        }
        return null;
    }

    /**
     * Delete guide
     */
    deleteGuide(guideId) {
        const data = this.getAllData();
        if (data) {
            data.guides = data.guides.filter(g => g.id !== guideId);
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('guide:deleted', { id: guideId });
            return true;
        }
        return false;
    }

    /**
     * Sync reviews
     */
    syncReviews(reviews) {
        const data = this.getAllData();
        if (data) {
            data.reviews = reviews;
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('reviews', reviews);
            return true;
        }
        return false;
    }

    /**
     * Save review (for admin replies)
     */
    saveReview(review) {
        const data = this.getAllData();
        if (data) {
            const index = data.reviews.findIndex(r => r.id === review.id);
            if (index >= 0) {
                data.reviews[index] = { ...data.reviews[index], ...review };
            } else {
                review.id = review.id || 'review_' + Date.now();
                data.reviews.push(review);
            }
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('review:updated', review);
            return review;
        }
        return null;
    }

    /**
     * Delete review
     */
    deleteReview(reviewId) {
        const data = this.getAllData();
        if (data) {
            data.reviews = data.reviews.filter(r => r.id !== reviewId);
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.syncKey, JSON.stringify(data));
            this.broadcastSync('review:deleted', { id: reviewId });
            return true;
        }
        return false;
    }

    /**
     * Broadcast sync event to all pages
     */
    broadcastSync(eventName, data) {
        const event = new CustomEvent('dataSync', {
            detail: { type: eventName, data: data, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);

        // Also notify via localStorage for cross-tab communication
        localStorage.setItem(`syncEvent:${Date.now()}`, JSON.stringify({
            type: eventName,
            data: data,
            timestamp: new Date().toISOString()
        }));
    }

    /**
     * Listen for sync events from other tabs
     */
    listenForSyncEvents(callback) {
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('syncEvent:')) {
                try {
                    const syncData = JSON.parse(event.newValue);
                    callback(syncData.type, syncData.data);
                } catch (e) {
                    console.error('Error parsing sync event:', e);
                }
            }
        });
    }
}

// ============================================
// GLOBAL INSTANCES
// ============================================

const adminAuth = new AdminAuthSystem();
const dataSync = new DataSyncSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { adminAuth, dataSync, AdminAuthSystem, DataSyncSystem };
}
