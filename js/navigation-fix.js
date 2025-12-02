// Fix browser back button navigation issues
(function() {
    'use strict';

    // Handle browser back button to redirect to dashboard properly
    window.addEventListener('pageshow', function(event) {
        // If page was loaded from cache (back button), ensure proper navigation
        if (event.persisted) {
            console.log('Page loaded from cache');
        }
    });

    // Ensure proper referrer handling
    if (document.referrer) {
        // Clean up referrer URL if it has hash fragments that might cause issues
        const referrerUrl = new URL(document.referrer, window.location.origin);

        // If coming from dashboard with a hash, clean it up
        if (referrerUrl.pathname.includes('dashboard.php') && referrerUrl.hash) {
            console.log('Referrer from dashboard with hash:', referrerUrl.hash);
        }
    }

    // Override history state if needed
    if (window.location.pathname.includes('editor-')) {
        // Ensure the history state is set properly
        if (!history.state) {
            history.replaceState({ page: 'editor' }, '', window.location.href);
        }
    }

    // Handle popstate event (browser back/forward buttons)
    window.addEventListener('popstate', function(event) {
        // If we're on an editor page and user clicks back, go to dashboard
        if (window.location.pathname.includes('editor-')) {
            // Check if there's a valid previous page
            if (document.referrer && !document.referrer.includes('editor-')) {
                // Let natural navigation happen
                return;
            } else {
                // Fallback to dashboard if no valid referrer
                event.preventDefault();
                window.location.href = '/ATS/dashboard.php';
            }
        }
    });
})();
