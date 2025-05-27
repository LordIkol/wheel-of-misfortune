/**
 * App.js - Main application logic for the Wheel of Misfortune
 * Handles user interactions, file loading, and connects all components
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const wheelElement = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-btn');
    const choicesTextarea = document.getElementById('choices-textarea');
    const fileInput = document.getElementById('file-input');
    const updateWheelButton = document.getElementById('update-wheel-btn');
    const clearButton = document.getElementById('clear-btn');
    const choicesList = document.getElementById('choices-list');
    const toggleOptionsButton = document.getElementById('toggle-options-btn');
    const optionsPanel = document.querySelector('.options-panel');
    const settingsButton = document.getElementById('settings-btn');
    const settingsPanel = document.querySelector('.settings-panel');
    const spinDurationInput = document.getElementById('spin-duration');
    const spinDurationValue = document.getElementById('spin-duration-value');
    const initialSpeedInput = document.getElementById('initial-speed');
    const initialSpeedValue = document.getElementById('initial-speed-value');
    
    // New settings elements
    const textSizeInput = document.getElementById('text-size');
    const textSizeValue = document.getElementById('text-size-value');
    const textColorInput = document.getElementById('text-color');
    const segmentColor1Input = document.getElementById('segment-color-1');
    const segmentColor2Input = document.getElementById('segment-color-2');
    const segmentColor3Input = document.getElementById('segment-color-3');
    const segmentColor4Input = document.getElementById('segment-color-4');

    // Default settings
    const defaultSettings = {
        spinDuration: 10,
        initialSpeed: 10,
        textSize: 14,
        textColor: '#FFFFFF',
        colors: [
            '#000000',
            '#7F7F7F',
            '#333333',
            '#999999'
        ]
    };
    
    // Load settings from session storage or use defaults
    let savedSettings = loadSettings();
    
    // Initialize wheel
    const wheel = new Wheel(wheelElement, {
        spinDuration: savedSettings.spinDuration,
        initialSpeed: savedSettings.initialSpeed,
        textSize: savedSettings.textSize,
        textColor: savedSettings.textColor,
        colors: savedSettings.colors,
        segments: []
    });

    // Active choices tracking
    let activeChoices = [];
    
    // Track the previous winner
    let previousWinner = null;

    // Initialize with saved choices or default examples
    const savedChoices = loadChoices();
    const exampleChoices = [
        'Spider-Man',
        'Iron Man',
        'Captain America',
        'Black Widow',
        'Hulk',
        'Scarlet Witch',
        'Doctor Strange',
        'Black Panther',
        'Captain Marvel',
        'Ant-Man',
        'Hawkeye',
        'Falcon',
        'Shuri',
        'Winter Soldier',
        'Vision',
        'Gamora',
        'Groot',
        'Rocket',
        'Drax',
        'Loki',
        'Nick Fury',
        'Agent Carter',
        'Phoenix',
        'Storm'
    ];
    
    // Use saved choices if available, otherwise use example choices
    const initialChoices = savedChoices.length > 0 ? savedChoices : exampleChoices;
    choicesTextarea.value = initialChoices.join('\n');
    updateWheel();

    // Event Listeners
    spinButton.addEventListener('click', spinWheel);
    updateWheelButton.addEventListener('click', updateWheel);
    clearButton.addEventListener('click', clearChoices);
    fileInput.addEventListener('change', handleFileUpload);
    toggleOptionsButton.addEventListener('click', toggleOptionsPanel);
    settingsButton.addEventListener('click', toggleSettingsPanel);
    
    // Settings sliders
    spinDurationInput.addEventListener('input', updateSpinDurationDisplay);
    spinDurationInput.addEventListener('change', updateSettings);
    initialSpeedInput.addEventListener('input', updateInitialSpeedDisplay);
    initialSpeedInput.addEventListener('change', updateSettings);
    
    // New settings event listeners
    textSizeInput.addEventListener('input', updateTextSizeDisplay);
    textSizeInput.addEventListener('change', updateSettings);
    textColorInput.addEventListener('change', updateSettings);
    segmentColor1Input.addEventListener('change', updateSettings);
    segmentColor2Input.addEventListener('change', updateSettings);
    segmentColor3Input.addEventListener('change', updateSettings);
    segmentColor4Input.addEventListener('change', updateSettings);

    // Set initial toggle button text since options and settings are hidden by default
    toggleOptionsButton.innerHTML = '<i class="fas fa-sliders-h"></i> Show Options';
    settingsButton.innerHTML = '<i class="fas fa-cog"></i> Show Settings';
    
    // Initialize settings display values and inputs based on saved settings
    spinDurationInput.value = savedSettings.spinDuration;
    initialSpeedInput.value = savedSettings.initialSpeed;
    textSizeInput.value = savedSettings.textSize;
    textColorInput.value = savedSettings.textColor;
    segmentColor1Input.value = savedSettings.colors[0];
    segmentColor2Input.value = savedSettings.colors[1];
    segmentColor3Input.value = savedSettings.colors[2];
    segmentColor4Input.value = savedSettings.colors[3];
    
    // Update display values
    updateSpinDurationDisplay();
    updateInitialSpeedDisplay();
    updateTextSizeDisplay();
    
    // Set initial color input values to match the wheel colors
    textColorInput.value = wheel.options.textColor;
    segmentColor1Input.value = wheel.options.colors[0];
    segmentColor2Input.value = wheel.options.colors[1];
    segmentColor3Input.value = wheel.options.colors[2];
    segmentColor4Input.value = wheel.options.colors[3];

    /**
     * Spin the wheel
     */
    function spinWheel() {
        if (activeChoices.length === 0) {
            alert('Please add some choices to the wheel first!');
            return;
        }

        // Disable spin button during spin
        spinButton.disabled = true;
        spinButton.textContent = 'Spinning...';
        
        // Clear previous winner before spinning again
        if (previousWinner !== null) {
            const prevWinnerItems = choicesList.querySelectorAll('.winner');
            prevWinnerItems.forEach(item => {
                item.classList.remove('winner');
            });
        }
        
        // Spin the wheel
        wheel.spin().then(winner => {
            if (winner) {
                console.log(`Winner: ${winner.value}`);
                
                // Store the current winner as the previous winner for next spin
                previousWinner = winner.value;
                
                // Highlight the winning choice in the list
                highlightWinningChoice(winner.value);
            }
            
            // Re-enable spin button
            spinButton.disabled = false;
            spinButton.textContent = 'SPIN!';
        });
    }

    /**
     * Update the wheel with choices from textarea
     */
    function updateWheel() {
        // Get choices from textarea
        const choices = choicesTextarea.value
            .split('\n')
            .map(choice => choice.trim())
            .filter(choice => choice !== '');
        
        // Update active choices
        activeChoices = choices.map(choice => ({
            value: choice,
            active: true
        }));
        
        // Save choices to session storage
        saveChoices(choices);
        
        // Reset previous winner when updating wheel
        previousWinner = null;
        
        // Update wheel segments
        updateWheelSegments();
        
        // Update choices list
        renderChoicesList();
    }

    /**
     * Clear all choices
     */
    function clearChoices() {
        choicesTextarea.value = '';
        activeChoices = [];
        
        // Save empty choices to session storage
        saveChoices([]);
        
        updateWheelSegments();
        renderChoicesList();
    }

    /**
     * Handle file upload for choices
     */
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if it's a text file
        if (file.type !== 'text/plain') {
            alert('Please upload a text file (.txt)');
            fileInput.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            choicesTextarea.value = content;
            updateWheel();
            
            // Reset file input
            fileInput.value = '';
        };
        
        reader.onerror = function() {
            alert('Error reading file');
            fileInput.value = '';
        };
        
        reader.readAsText(file);
    }

    /**
     * Toggle options panel visibility
     */
    function toggleOptionsPanel() {
        optionsPanel.classList.toggle('hidden');
        document.querySelector('main').classList.toggle('options-hidden');
        
        // Update button text based on panel visibility
        if (optionsPanel.classList.contains('hidden')) {
            toggleOptionsButton.innerHTML = '<i class="fas fa-sliders-h"></i> Show Options';
            settingsButton.innerHTML = '<i class="fas fa-cog"></i> Show Settings';
        } else {
            toggleOptionsButton.innerHTML = '<i class="fas fa-sliders-h"></i> Hide Options';
        }
        
        // Trigger resize event to ensure wheel adjusts properly
        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Toggle settings panel visibility
     */
    function toggleSettingsPanel() {
        settingsPanel.classList.toggle('hidden');
        document.querySelector('main').classList.toggle('settings-hidden');
        
        // Update button text based on panel visibility
        if (settingsPanel.classList.contains('hidden')) {
            settingsButton.innerHTML = '<i class="fas fa-cog"></i> Show Settings';
        } else {
            settingsButton.innerHTML = '<i class="fas fa-cog"></i> Hide Settings';
        }
        
        // Trigger resize event to ensure wheel adjusts properly
        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Update spin duration display
     */
    function updateSpinDurationDisplay() {
        spinDurationValue.textContent = spinDurationInput.value;
    }

    /**
     * Update initial speed display
     */
    function updateInitialSpeedDisplay() {
        initialSpeedValue.textContent = initialSpeedInput.value;
    }

    /**
     * Update text size display
     */
    function updateTextSizeDisplay() {
        textSizeValue.textContent = textSizeInput.value;
    }

    /**
     * Update wheel settings
     */
    function updateSettings() {
        const newSettings = {
            spinDuration: parseFloat(spinDurationInput.value),
            initialSpeed: parseFloat(initialSpeedInput.value),
            textSize: parseFloat(textSizeInput.value),
            textColor: textColorInput.value,
            colors: [
                segmentColor1Input.value,
                segmentColor2Input.value,
                segmentColor3Input.value,
                segmentColor4Input.value
            ]
        };
        
        // Update wheel with new settings
        wheel.updateSettings(newSettings);
        
        // Save settings to session storage
        saveSettings(newSettings);
        
        // Update the wheel to apply the new settings
        updateWheelSegments();
    }
    
    /**
     * Save settings to session storage
     */
    function saveSettings(settings) {
        sessionStorage.setItem('wheelSettings', JSON.stringify(settings));
    }
    
    /**
     * Load settings from session storage
     */
    function loadSettings() {
        const savedSettings = sessionStorage.getItem('wheelSettings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }

    /**
     * Save choices to session storage
     */
    function saveChoices(choices) {
        sessionStorage.setItem('wheelChoices', JSON.stringify(choices));
    }
    
    /**
     * Load choices from session storage
     */
    function loadChoices() {
        const savedChoices = sessionStorage.getItem('wheelChoices');
        return savedChoices ? JSON.parse(savedChoices) : [];
    }

    /**
     * Update wheel segments based on active choices
     */
    function updateWheelSegments() {
        const activeSegments = activeChoices
            .filter(choice => choice.active)
            .map(choice => choice.value);
        
        wheel.updateSegments(activeSegments);
    }

    /**
     * Render choices list with checkboxes
     */
    function renderChoicesList() {
        choicesList.innerHTML = '';
        
        if (activeChoices.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No choices added yet. Add some choices in the options panel.';
            choicesList.appendChild(emptyMessage);
            return;
        }
        
        activeChoices.forEach((choice, index) => {
            const choiceItem = document.createElement('div');
            choiceItem.className = 'choice-item';
            choiceItem.dataset.index = index;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `choice-${index}`;
            checkbox.checked = choice.active;
            checkbox.addEventListener('change', () => toggleChoice(index));
            
            const label = document.createElement('label');
            label.htmlFor = `choice-${index}`;
            label.textContent = choice.value;
            
            choiceItem.appendChild(checkbox);
            choiceItem.appendChild(label);
            choicesList.appendChild(choiceItem);
        });
    }

    /**
     * Toggle a choice's active state
     * @param {number} index - Index of the choice to toggle
     */
    function toggleChoice(index) {
        if (index >= 0 && index < activeChoices.length) {
            activeChoices[index].active = !activeChoices[index].active;
            
            // Update wheel segments
            updateWheelSegments();
            
            // Update choice item appearance
            const choiceItem = choicesList.querySelector(`[data-index="${index}"]`);
            if (choiceItem) {
                choiceItem.classList.toggle('selected', activeChoices[index].active);
            }
        }
    }

    /**
     * Highlight the winning choice in the list
     * @param {string} winningValue - Value of the winning choice
     */
    function highlightWinningChoice(winningValue) {
        // Remove previous highlights
        const choiceItems = choicesList.querySelectorAll('.choice-item');
        choiceItems.forEach(item => {
            item.classList.remove('winner');
        });
        
        // Find the winning choice and highlight it
        const winningIndex = activeChoices.findIndex(
            choice => choice.active && choice.value === winningValue
        );
        
        if (winningIndex !== -1) {
            const winningItem = choicesList.querySelector(`[data-index="${winningIndex}"]`);
            if (winningItem) {
                winningItem.classList.add('winner');
                
                // Scroll to the winning item if needed
                winningItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }
});
