// ====================================
// GESTURE RECOGNITION
// ====================================

class GestureHandler {
    constructor(element, callbacks) {
        this.element = element;
        this.callbacks = callbacks;
        this.startX = 0;
        this.startY = 0;
        this.isDragging = false;
        
        this.init();
    }
    
    init() {
        // Touch events
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Mouse events (for desktop)
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
    
    handleTouchStart(e) {
        // Check if touch started on tab navigation buttons or mobile card buttons
        const target = e.target;
        
        // Only disable swipe gestures on tab buttons and mobile action buttons
        const noSwipeElements = [
            '.tab-btn',
            '.card-mobile-buttons',
            '.card-btn'
        ];
        
        // If touch started on a tab button or mobile button, don't start dragging
        const isNoSwipeArea = noSwipeElements.some(selector => 
            target.closest(selector) !== null
        );
        
        if (isNoSwipeArea) {
            this.isDragging = false;
            return;
        }
        
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.isDragging = true;
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - this.startX;
        const diffY = currentY - this.startY;
        
        // Visual feedback
        this.element.style.transform = `translate(${diffX}px, ${diffY}px) rotate(${diffX * 0.1}deg)`;
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - this.startX;
        const diffY = endY - this.startY;
        
        this.handleSwipe(diffX, diffY);
        this.isDragging = false;
    }
    
    handleMouseDown(e) {
        // Only allow dragging with Ctrl or Cmd key
        if (!e.ctrlKey && !e.metaKey) return;
        
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.isDragging = true;
        e.preventDefault();
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const diffX = e.clientX - this.startX;
        const diffY = e.clientY - this.startY;
        
        this.element.style.transform = `translate(${diffX}px, ${diffY}px) rotate(${diffX * 0.1}deg)`;
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        const diffX = e.clientX - this.startX;
        const diffY = e.clientY - this.startY;
        
        this.handleSwipe(diffX, diffY);
        this.isDragging = false;
    }
    
    handleSwipe(diffX, diffY) {
        const threshold = 100;
        
        // Reset transform
        this.element.style.transform = '';
        
        // Horizontal swipes
        if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                // Right swipe - Buy
                this.callbacks.onSwipeRight && this.callbacks.onSwipeRight();
            } else {
                // Left swipe - Pass
                this.callbacks.onSwipeLeft && this.callbacks.onSwipeLeft();
            }
        }
        // Up swipe
        else if (diffY < -threshold && Math.abs(diffY) > Math.abs(diffX)) {
            // Up swipe - Stake
            this.callbacks.onSwipeUp && this.callbacks.onSwipeUp();
        }
        // Down swipe (optional)
        else if (diffY > threshold && Math.abs(diffY) > Math.abs(diffX)) {
            this.callbacks.onSwipeDown && this.callbacks.onSwipeDown();
        }
        else {
            // Not enough movement, reset
            this.element.style.transition = 'transform 0.3s';
            this.element.style.transform = '';
            setTimeout(() => {
                this.element.style.transition = '';
            }, 300);
        }
    }
}

