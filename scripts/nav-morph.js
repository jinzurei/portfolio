/**
 * Navigation Morph Animation - Jinzurei
 * Created: February 2026
 *
 * Features:
 * - Morphs navigation from centered hero pill to top bar on scroll
 * - Smooth transitions with cubic-bezier easing
 * - Responsive to scroll position over 400-600px range
 */

'use strict';

class NavMorph {
    constructor() {
        this.nav = document.querySelector('.main-nav');
        this.hero = document.querySelector('.hero');
        this.morphThreshold = 500; // pixels of scroll to complete morph
        this.isMorphed = false;
        this.init();
    }

    init() {
        if (!this.nav || !this.hero) return;

        // Set initial state
        this.updateNavState(0);

        // Listen for scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

        // Initial check
        this.handleScroll();
    }

    handleScroll() {
        const scrollY = window.scrollY || window.pageYOffset;
        const progress = Math.min(scrollY / this.morphThreshold, 1);

        this.updateNavState(progress);
    }

    updateNavState(progress) {
        if (progress >= 1 && !this.isMorphed) {
            this.nav.classList.add('morphed');
            this.isMorphed = true;
            
            // Listen for transition end to swap text after morph completes
            this.nav.addEventListener('transitionend', this.handleMorphComplete.bind(this), { once: true });
        } else if (progress < 1 && this.isMorphed) {
            this.nav.classList.remove('morphed');
            this.nav.classList.remove('text-swapped');
            this.isMorphed = false;
        }
    }

    handleMorphComplete(event) {
        // Only trigger on the main nav element's transition
        if (event.target === this.nav) {
            this.nav.classList.add('text-swapped');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NavMorph();
});