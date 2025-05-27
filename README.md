#  Wheel Spinner

A modern, interactive wheel spinner application styled with UBS branding. This web application allows users to create a customizable spinning wheel with their own choices.

## Features

- **Modern UI**: Clean, responsive design using UBS brand colors and styling
- **Customizable Choices**: Add choices via text input or upload a text file
- **Dynamic Choice Management**: Enable/disable choices with checkboxes
- **Fair Spinning Algorithm**: Ensures random and fair selection
- **Adjustable Settings**: Control spin duration and initial speed
- **Winner Indication**: Winning segment blinks and is highlighted in the choices list
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. **Add Choices**:
   - Type choices in the textarea (one per line)
   - Or upload a text file with choices (one per line)
   - Click "Update Wheel" to apply changes

2. **Manage Choices**:
   - Use checkboxes to enable/disable specific choices
   - Disabled choices won't appear on the wheel

3. **Adjust Settings**:
   - Click the "Settings" button to open settings panel
   - Adjust spin duration (how long the wheel spins)
   - Adjust initial speed (how fast the wheel starts spinning)

4. **Spin the Wheel**:
   - Click "Spin the Wheel" button
   - The wheel will spin with gradually decreasing speed
   - The winning segment will blink when the wheel stops

## Technical Details

The application is built with vanilla JavaScript, HTML, and CSS. No external libraries or frameworks are required.

### Files Structure

- `index.html` - Main HTML structure
- `css/styles.css` - Styling and animations
- `js/wheel.js` - Core wheel functionality
- `js/app.js` - Application logic and user interactions
- `img/ubs-logo.svg` - UBS logo

## Browser Compatibility

The application works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your browser
3. Start adding choices and spinning the wheel!

## License

This project is for demonstration purposes only and uses UBS branding elements.
