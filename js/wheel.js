/**
 * Wheel.js - Core functionality for the UBS Wheel Spinner
 * Handles wheel creation, spinning animation, and winner selection
 */

class Wheel {
    constructor(element, options = {}) {
        this.element = element;
        this.options = Object.assign({
            spinDuration: 10, // seconds
            initialSpeed: 10, // initial rotation speed (minimum 2)
            segments: [],
            colors: [
                '#000000', // UBS Black
                '#7F7F7F', // UBS Gray
                '#333333', // Dark Gray
                '#999999', // Light Gray
            ],
            textSize: 14, // font size in pixels
            textColor: '#FFFFFF', // text color
            lowPerformanceMode: false, // performance optimization for Citrix/remote sessions
            useHardwareAcceleration: true // use hardware acceleration for animations
        }, options);

        this.isSpinning = false;
        this.currentRotation = 0;
        this.segmentAngle = 0;
        this.winningSegment = null;
        this.init();
    }

    /**
     * Initialize the wheel
     */
    init() {
        this.updateSegments(this.options.segments);
    }

    /**
     * Update wheel segments based on provided choices
     * @param {Array} segments - Array of segment labels
     */
    updateSegments(segments) {
        // Clear existing segments
        this.element.innerHTML = '';
        this.options.segments = segments.filter(segment => segment.trim() !== '');
        
        if (this.options.segments.length === 0) {
            // Add placeholder if no segments
            const placeholder = document.createElement('div');
            placeholder.className = 'wheel-placeholder';
            placeholder.textContent = 'Add choices to create wheel segments';
            this.element.appendChild(placeholder);
            return;
        }

        // Calculate angle for each segment
        this.segmentAngle = 360 / this.options.segments.length;
        
        // Create a container for the segments
        const segmentsContainer = document.createElement('div');
        segmentsContainer.className = 'segments-container';
        this.element.appendChild(segmentsContainer);
        
        // Create segments - start from the top (270 degrees in standard SVG coordinates)
        // and go clockwise
        const startOffset = 270; // Start from the top
        
        this.options.segments.forEach((segment, index) => {
            // Create segment
            const segmentElement = document.createElement('div');
            segmentElement.className = 'wheel-segment';
            segmentElement.dataset.value = segment;
            segmentElement.dataset.index = index;
            
            // Calculate the start and end angles for this segment
            // We start from the top (270 degrees) and go clockwise
            const startAngle = startOffset + (index * this.segmentAngle);
            const endAngle = startOffset + ((index + 1) * this.segmentAngle);
            
            const colorIndex = index % this.options.colors.length;
            const color = this.options.colors[colorIndex];
            
            // Create SVG for the pie slice
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            
            // Calculate the coordinates for the pie slice
            const centerX = 50;
            const centerY = 50;
            const radius = 50;
            
            // Calculate the end point of the arc
            const startAngleRad = startAngle * (Math.PI / 180);
            const endAngleRad = endAngle * (Math.PI / 180);
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            
            // Create the path for the pie slice
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Define the path: move to center, line to first point, arc to second point, close path
            const largeArcFlag = this.segmentAngle > 180 ? 1 : 0;
            const pathData = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', color);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '0.5');
            
            svg.appendChild(path);
            segmentElement.appendChild(svg);
            
            // Create and position the text
            const textElement = document.createElement('div');
            textElement.className = 'segment-text';
            textElement.textContent = segment;
            
            // Apply custom text size and color
            textElement.style.fontSize = `${this.options.textSize}px`;
            textElement.style.color = this.options.textColor;
            
            // Position the text in the middle of the segment
            const textAngle = startAngle + (this.segmentAngle / 2);
            const textRadiusPercent = 60; // Position at 60% from center to edge (was 75%)
            const textX = 50 + (textRadiusPercent * Math.cos(textAngle * (Math.PI / 180))) / 2;
            const textY = 50 + (textRadiusPercent * Math.sin(textAngle * (Math.PI / 180))) / 2;
            
            textElement.style.position = 'absolute';
            textElement.style.left = `${textX}%`;
            textElement.style.top = `${textY}%`;
            textElement.style.transform = `translate(-50%, -50%) rotate(${textAngle}deg)`;
            textElement.style.maxWidth = '80%'; // Increase max-width for text
            
            segmentElement.appendChild(textElement);
            segmentsContainer.appendChild(segmentElement);
        });

        // Reset wheel position
        this.resetWheel();
    }

    /**
     * Reset wheel to starting position
     */
    resetWheel() {
        this.isSpinning = false;
        this.currentRotation = 0;
        this.element.style.transform = `rotate(0deg)`;
        
        // Remove winner class from all segments
        const segments = this.element.querySelectorAll('.wheel-segment');
        segments.forEach(segment => {
            segment.classList.remove('winner');
        });
        
        this.winningSegment = null;
    }

    /**
     * Spin the wheel
     * @returns {Promise} Resolves when spinning is complete with the winning segment
     */
    spin() {
        if (this.isSpinning || this.options.segments.length === 0) {
            return Promise.resolve(null);
        }
        
        this.isSpinning = true;
        
        // Remove previous winner
        if (this.winningSegment) {
            this.winningSegment.classList.remove('winner');
            this.winningSegment = null;
        }
        
        // Apply hardware acceleration if enabled
        if (this.options.useHardwareAcceleration) {
            this.element.style.willChange = 'transform';
        }
        
        // Calculate a random final position
        // Use half the initialSpeed as the number of rotations (360 degrees per rotation)
        const rotations = Math.max(2, Math.floor(this.options.initialSpeed / 2)); // Ensure minimum 2 rotations
        const randomRotation = Math.floor(Math.random() * 360);
        const targetRotation = this.currentRotation + (rotations * 360) + randomRotation;
        
        // Start time for animation
        const startTime = performance.now();
        const duration = this.options.spinDuration * 1000; // convert to ms
        
        // Optimize animation for low performance mode
        const isLowPerformanceMode = this.options.lowPerformanceMode;
        const frameSkip = isLowPerformanceMode ? 2 : 1; // Skip frames in low performance mode
        let frameCount = 0;
        
        return new Promise(resolve => {
            const animate = (currentTime) => {
                frameCount++;
                
                // Skip frames in low performance mode
                if (isLowPerformanceMode && frameCount % frameSkip !== 0) {
                    requestAnimationFrame(animate);
                    return;
                }
                
                const elapsed = currentTime - startTime;
                
                if (elapsed >= duration) {
                    // Animation complete
                    this.currentRotation = targetRotation;
                    this.element.style.transform = `rotate(${this.currentRotation}deg)`;
                    this.isSpinning = false;
                    
                    // Reset will-change to free up resources
                    if (this.options.useHardwareAcceleration) {
                        this.element.style.willChange = 'auto';
                    }
                    
                    // Determine winner
                    const winner = this.determineWinner();
                    resolve(winner);
                    return;
                }
                
                // Calculate current position using enhanced easing
                const progress = elapsed / duration;
                const easing = this.easeOutQuintWithExtraSlow(progress);
                
                // Calculate current rotation - start fast and slow down
                const currentRotation = this.currentRotation + 
                    (targetRotation - this.currentRotation) * easing;
                
                // Apply rotation - use translateZ(0) to force GPU acceleration
                this.element.style.transform = this.options.useHardwareAcceleration ?
                    `rotate(${currentRotation}deg) translateZ(0)` :
                    `rotate(${currentRotation}deg)`;
                
                // Continue animation
                requestAnimationFrame(animate);
            };
            
            // Start animation
            requestAnimationFrame(animate);
        });
    }

    /**
     * Easing function for smooth deceleration
     * @param {number} t - Progress from 0 to 1
     * @returns {number} Eased value
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Enhanced easing function for more dramatic slowdown at the end
     * @param {number} t - Progress from 0 to 1
     * @returns {number} Eased value
     */
    easeOutQuintWithExtraSlow(t) {
        // Use a single, smooth curve with a stronger power for more dramatic slowdown
        // This avoids the "jump" that can occur with multi-phase easing
        
        // Combine easeOutQuint (power of 5) with a custom modifier that increases the effect at the end
        const baseEasing = 1 - Math.pow(1 - t, 5);
        
        // Add extra slowdown effect that increases as t approaches 1
        // This creates a smooth, continuous curve that slows down more at the end
        const slowdownFactor = Math.pow(t, 3); // Increases dramatically as t approaches 1
        const extraSlowdown = 0.3 * slowdownFactor * (1 - baseEasing);
        
        return baseEasing - extraSlowdown;
    }

    /**
     * Determine the winning segment after spin
     * @returns {Object} Winning segment information
     */
    determineWinner() {
        if (this.options.segments.length === 0) {
            return null;
        }
        
        // Normalize the rotation to be between 0 and 360
        let normalizedRotation = this.currentRotation % 360;
        
        // Convert to positive value if negative
        if (normalizedRotation < 0) {
            normalizedRotation += 360;
        }
        
        // The winning point is fixed at the top (0 degrees)
        // We need to determine which segment contains this point after rotation
        
        // The wheel segments start at the top (270 degrees) and go clockwise
        // After rotation, we need to determine which segment contains the fixed point at the top
        
        // Calculate which segment contains the fixed point at the top
        // The fixed point is at 0 degrees (top of the circle)
        // After rotation, the segment that was at (360 - rotation) degrees will be at the top
        
        // The segments are numbered 0 to (numSegments - 1)
        // Segment i covers the angle range from (270 + i*segmentAngle) to (270 + (i+1)*segmentAngle)
        
        // After rotation, we need to find which segment contains the 0 degree point (top)
        // This means we need to find i where:
        // (270 + i*segmentAngle - rotation) <= 0 < (270 + (i+1)*segmentAngle - rotation)
        // All angles are modulo 360
        
        // Simplify: we need to find i where:
        // (270 - rotation) + i*segmentAngle <= 0 < (270 - rotation) + (i+1)*segmentAngle
        
        // Further simplify: find i where:
        // i*segmentAngle <= (rotation - 270) < (i+1)*segmentAngle
        
        // Calculate the angle we're looking for
        let targetAngle = (360 - normalizedRotation) % 360;
        
        // Find which segment contains this angle
        const segmentIndex = Math.floor(targetAngle / this.segmentAngle) % this.options.segments.length;
        
        // Log for debugging
        console.log('Final rotation:', normalizedRotation);
        console.log('Target angle:', targetAngle);
        console.log('Segment angle:', this.segmentAngle);
        console.log('Winning segment index:', segmentIndex);
        
        // Get the winning segment element using the data-index attribute
        const segments = this.element.querySelectorAll('.wheel-segment');
        this.winningSegment = Array.from(segments).find(segment => 
            parseInt(segment.dataset.index) === segmentIndex
        );
        
        // Highlight the winning segment
        if (this.winningSegment) {
            // Remove winner class from all segments first
            segments.forEach(segment => segment.classList.remove('winner'));
            
            // Add winner class to the winning segment
            this.winningSegment.classList.add('winner');
            
            // Trigger confetti animation from the center of the wheel
            this.triggerConfetti();
            
            return {
                index: segmentIndex,
                value: this.options.segments[segmentIndex],
                element: this.winningSegment
            };
        }
        
        return null;
    }

    /**
     * Update wheel settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        Object.assign(this.options, settings);
    }

    /**
     * Trigger confetti animation from the center of the wheel
     * Optimized for performance in low-resource environments like Citrix
     */
    triggerConfetti() {
        // Check if we're in a low-performance environment (can be set via settings)
        const isLowPerformanceMode = this.options.lowPerformanceMode || false;
        
        // Get the wheel element's position and dimensions
        const wheelRect = this.element.getBoundingClientRect();
        const centerX = wheelRect.left + (wheelRect.width / 2);
        const centerY = wheelRect.top + (wheelRect.height / 2);
        
        // Calculate the position as a ratio of the window size
        const origin = {
            x: centerX / window.innerWidth,
            y: centerY / window.innerHeight
        };
        
        // Confetti colors matching the application theme
        const colors = ['#EC0016', '#000000', '#333333', '#7F7F7F', '#999999', '#FFFFFF'];
        
        // Adjust particle counts based on performance mode
        const particleCounts = isLowPerformanceMode ? 
            [60, 40, 50, 0, 0] : // Low performance mode (fewer particles, fewer explosions)
            [200, 150, 180, 160, 250]; // Normal mode
        
        // First explosion - initial burst
        confetti({
            particleCount: particleCounts[0],
            spread: 90,
            origin: origin,
            colors: colors,
            zIndex: 1000,
            startVelocity: 40,
            gravity: 1.2,
            shapes: ['circle', 'square'],
            scalar: isLowPerformanceMode ? 1.5 : 2.0,
            disableForReducedMotion: true // Respect reduced motion settings
        });
        
        // Skip additional explosions if in low performance mode
        if (particleCounts[1] > 0) {
            // Second explosion - 600ms later
            setTimeout(() => {
                confetti({
                    particleCount: particleCounts[1],
                    spread: 120,
                    origin: origin,
                    colors: colors,
                    zIndex: 1000,
                    startVelocity: 35,
                    gravity: 0.9,
                    shapes: ['circle'],
                    scalar: isLowPerformanceMode ? 1.3 : 1.8,
                    disableForReducedMotion: true
                });
            }, 600);
        }
        
        if (particleCounts[2] > 0) {
            // Third explosion - 1200ms later
            setTimeout(() => {
                confetti({
                    particleCount: particleCounts[2],
                    spread: 100,
                    origin: origin,
                    colors: ['#EC0016', '#FFFFFF', '#000000'],
                    zIndex: 1000,
                    startVelocity: 45,
                    gravity: 1.0,
                    shapes: ['square'],
                    scalar: isLowPerformanceMode ? 1.7 : 2.2,
                    disableForReducedMotion: true
                });
            }, 1200);
        }
        
        if (particleCounts[3] > 0) {
            // Fourth explosion - 1800ms later
            setTimeout(() => {
                confetti({
                    particleCount: particleCounts[3],
                    spread: 130,
                    origin: origin,
                    colors: colors,
                    zIndex: 1000,
                    startVelocity: 38,
                    gravity: 0.8,
                    shapes: ['circle'],
                    scalar: 2.0,
                    disableForReducedMotion: true
                });
            }, 1800);
        }
        
        if (particleCounts[4] > 0) {
            // Fifth explosion - grand finale at 2400ms
            setTimeout(() => {
                confetti({
                    particleCount: particleCounts[4],
                    spread: 140,
                    origin: origin,
                    colors: colors,
                    zIndex: 1000,
                    startVelocity: 50,
                    gravity: 0.7,
                    shapes: ['star', 'circle', 'square'],
                    scalar: 2.5,
                    disableForReducedMotion: true
                });
            }, 2400);
        }
    }
}
