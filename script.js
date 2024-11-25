document.addEventListener('DOMContentLoaded', function() {
    let caseRandomizationEnabled = false;
    let gifModeEnabled = false;
    let isAnimating = false; // State to track if GIF animation is running
    let animationInterval;
    let captureInterval;
    let gif;
    let animationSpeed = 1; // Default animation speed (seconds per frame)
    let intervalTime = animationSpeed * 1000;
    let trackingValue = 0; // Initial tracking value in pixels
    
    const fonts = [
        'Futura Light', 
        'Futura Light Oblique', 
        'Futura Regular', 
        'Futura Heavy', 
        'Futura Heavy Oblique', 
        'Futura Bold', 
        'Futura Bold Oblique', 
        'Futura Extra Bold', 
        'Futura Extra Bold Oblique', 
        'Futura Book', 
        'Futura Book Oblique' 
    ];

    const fontsExcludingLightAndExtraBold = [
        'Futura Regular', 
        'Futura Heavy', 
        'Futura Heavy Oblique', 
        'Futura Bold', 
        'Futura Bold Oblique', 
        'Futura Book', 
        'Futura Book Oblique' 
    ];

     // Get the modal
     const changelogModal = document.getElementById('changelogModal');

     // Get the button that opens the modal
     const openChangelogBtn = document.getElementById('openChangelog');
 
     // Get the <span> element that closes the modal
     const closeChangelogBtn = document.getElementById('closeChangelog');
 
     // Get the footer version link
     const footerVersionLink = document.getElementById('footerVersion');
 
     // When the user clicks on the button, open the modal
     openChangelogBtn.addEventListener('click', function() {
         changelogModal.style.display = 'block';
     });
 
     // When the user clicks on the footer version, open the modal
     footerVersionLink.addEventListener('click', function(event) {
         event.preventDefault(); // Prevent default anchor behavior
         changelogModal.style.display = 'block';
     });
 
     // When the user clicks on <span> (x), close the modal
     closeChangelogBtn.addEventListener('click', function() {
         changelogModal.style.display = 'none';
     });
 
     // When the user clicks anywhere outside of the modal, close it
     window.addEventListener('click', function(event) {
         if (event.target == changelogModal) {
             changelogModal.style.display = 'none';
         }
     });

    // Toggle Advanced Options
    const advancedOptionsToggle = document.getElementById('advancedOptionsToggle');
    const advancedOptions = document.getElementById('advancedOptions');

    advancedOptionsToggle.addEventListener('click', function() {
        advancedOptions.classList.toggle('visible');
        this.classList.toggle('active');
    });

    const animationSpeedControl = document.getElementById('animationSpeedControl');
    const animationSpeedRange = document.getElementById('animationSpeedRange');
    const animationSpeedValue = document.getElementById('animationSpeedValue');

    // Update animation speed display
    animationSpeedRange.addEventListener('input', function() {
        animationSpeed = parseFloat(this.value);
        animationSpeedValue.textContent = animationSpeed;
        intervalTime = animationSpeed * 1000;

        if (isAnimating) {
            // Clear existing intervals
            clearInterval(animationInterval);
            clearInterval(captureInterval);

            // Restart intervals with new speed
            animationInterval = setInterval(styleText, intervalTime);
            captureInterval = setInterval(captureFrame, intervalTime);
        }
    })

    // Function to generate randomized integers between the min and max values provided
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Function to generate a random font size using the getRandomInt function (min, max)
    function getRandomFontSize() {
        return getRandomInt(48, 62) + 'px';
    }
    
    // Function to randomize text case
    function getRandomCase(char) {
        return Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase();
    }

    // Function to choose a random font family from the available fonts
    function getRandomFontFamily() {
        return fonts[getRandomInt(0, fonts.length - 1)];
    }

    function getRandomFontFamilyUpdated() {
        return fontsExcludingLightAndExtraBold[getRandomInt(0, fontsExcludingLightAndExtraBold.length - 1)];
    }

    // Function to choose a random font weight for the text
    function getRandomWeight(previousWeight) {
        const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
        if (previousWeight === undefined) {
            return weights[getRandomInt(0, weights.length - 1)];
        } else { // Find the index of the previous weight
        const prevIndex = weights.indexOf(previousWeight);

        // Determine the allowable indices within 2 steps
        const minIndex = Math.max(0, prevIndex - 2);
        const maxIndex = Math.min(weights.length - 1, prevIndex + 2);

        // Generate a random index within the allowable range
        const newIndex = getRandomInt(minIndex, maxIndex);

        return weights[newIndex];
        }
    }

    // Function to decrease tracking
    function decreaseTracking() {
        trackingValue -= 1;
        if (trackingValue < -10) trackingValue = -10; // Set minimum limit
        adjustTracking(); // Adjust tracking without changing styles
    }

    // Function to increase tracking
    function increaseTracking() {
        trackingValue += 1; // Increase tracking by 1px
        if (trackingValue > 50) trackingValue = 50; // Set maximum limit
        adjustTracking(); // Adjust tracking without changing styles
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowRight') {
            increaseTracking();
        } else if (event.key === 'ArrowLeft') {
            decreaseTracking();
        }
    });

    function adjustTracking() {
        const outputDiv = document.getElementById('output');
        const spans = outputDiv.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (index < spans.length - 1) {
                span.style.marginRight = trackingValue + 'px';
            } else {
                span.style.marginRight = '0px';
            }
        });
    }    

    // Function to style the text using the above functions and apply them
    function styleText() {
        const input = document.getElementById('userInput').value || 'Sample Text';
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = '';

        let previousWeight;
    
        for (let i = 0; i < input.length; i++) {
            let char = input[i];
            let span = document.createElement('span');
            
            if (i === 0) {
                // For the first character, exclude 'light' and 'extra bold' fonts
                span.style.fontFamily = getRandomFontFamilyUpdated();
            } else {
                // For other characters, use any font
                span.style.fontFamily = getRandomFontFamily();
            }
            
            let weight = getRandomWeight(previousWeight)
            span.style.fontWeight = weight;
            previousWeight = weight;

            span.style.fontSize = getRandomFontSize();
            span.textContent = caseRandomizationEnabled ? getRandomCase(char) : char;

            // Apply tracking value as margin-right, except for the last character
            span.style.display = 'inline-block'; // Ensure margin works
            if (i < input.length - 1) {
                span.style.marginRight = trackingValue + 'px';
            }
        
            outputDiv.appendChild(span);
        }
    }

    // Function to generate SVG (if needed)
    function generateSVG(container) {
        const svgWidth = container.offsetWidth;
        const svgHeight = container.offsetHeight;
        const svgHeader = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 600">\n' +
            '<rect x="0" y="0" width="100%" height="100%" fill="transparent"/>\n'; // Ensure transparent background

        const svgFooter = '</svg>';

        let svgContent = '';
        const children = container.querySelectorAll('span');

        children.forEach(child => {
            const style = getComputedStyle(child);
            const fontFamily = style.fontFamily.replace(/"/g, "'");
            const fontSize = style.fontSize;
            const color = style.color;
            const x = child.getBoundingClientRect().left - container.getBoundingClientRect().left;
            const y = child.getBoundingClientRect().top - container.getBoundingClientRect().top;

            svgContent += `<text x="${x}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}">${child.textContent}</text>\n`;
        });

        return svgHeader + svgContent + svgFooter;
    }

    // Function to download image in PNG or SVG format
    function downloadImage(type) {
        const inputText = document.getElementById('userInput').value;

        if (!inputText) {
            alert('Please enter some text!');
            return;
        }

        const outputDiv = document.getElementById('output');
        html2canvas(outputDiv, {
            scale: 20,
            backgroundColor: 'rgba(0, 0, 0, 0)', 
            removeContainer: true,
        }).then(canvas => {
            const link = document.createElement('a');
            let fileName = inputText.trim().replace(/[^a-z0-9]/gi, '_').substring(0, 20) || 'styled-text';
            
            if (type === 'png') {
                link.href = canvas.toDataURL('image/png');
                link.download = `${fileName}.png`;
            } else if (type === 'svg') {
                const svgData = generateSVG(outputDiv);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                link.href = url;
                link.download = `${fileName}.svg`;
            }
            
            link.click();
        });
    }

    // Function to update text and adjust tracking
    function updateTextAndTracking() {
        styleText();
        adjustTracking();
    }    

    // GIF Animation Functions
    function startGifAnimation() {
        if (isAnimating) return;

        isAnimating = true;
        gif = new GIF({
            workers: 2,
            quality: 10,
            transparent: 0x00000000,
            workerScript: 'scripts/gif.worker.js',
        });

        document.getElementById('startGif').style.display = 'none';
        document.getElementById('stopGif').style.display = 'inline-block';
        
        intervalTime = animationSpeed * 1000;

        updateTextAndTracking(); // Initial styling
        captureFrame(); // Capture initial frame

        // Start styling text and capturing frames
        animationInterval = setInterval(styleText, intervalTime); // Change text style
        captureInterval = setInterval(captureFrame, intervalTime); // Capture frames
    }

    animationSpeedRange.addEventListener('input', function() {
        animationSpeed = parseFloat(this.value);
        animationSpeedValue.textContent = animationSpeed;
        intervalTime = animationSpeed * 1000;
    
        if (isAnimating) {
            // Clear existing intervals
            clearInterval(animationInterval);
            clearInterval(captureInterval);
    
            // Restart intervals with new speed
            animationInterval = setInterval(updateTextAndTracking, intervalTime);
            captureInterval = setInterval(captureFrame, intervalTime);
        }
    });

    function captureFrame() {
        const outputDiv = document.getElementById('output');
        html2canvas(outputDiv, {
            backgroundColor: null,
            logging: false,
            useCORS: true,
        }).then(canvas => {
            gif.addFrame(canvas, { copy: true, delay: intervalTime });
        });
    }

    function stopGifAnimation() {
        clearInterval(animationInterval);
        clearInterval(captureInterval);
        isAnimating = false;

        document.getElementById('stopGif').style.display = 'none';
        document.getElementById('startGif').style.display = 'inline-block';

        gif.on('finished', function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'animated_text.gif';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        gif.render();
    }

    // Event Listeners

    // Update text styling on user input
    document.getElementById('userInput').addEventListener('input', styleText);

    // Regenerate text style on button click
    document.getElementById('regenerateText').addEventListener('click', styleText);

    // Toggle case randomization
    document.getElementById('caseRandomizationCheckbox').addEventListener('change', function() {
        caseRandomizationEnabled = this.checked;
        styleText();
    });

    // Toggle GIF Mode
    document.getElementById('toggleGifMode').addEventListener('change', function() {
        gifModeEnabled = this.checked;
        const startGifButton = document.getElementById('startGif');
        if (gifModeEnabled) {
            startGifButton.style.display = 'inline-block';
            animationSpeedControl.style.display = 'block'
        } else {
            startGifButton.style.display = 'none';
            animationSpeedControl.style.display = 'none';
            // Stop animation if it's running
            if (isAnimating) {
                stopGifAnimation();
            }
        }
    });

    // Download PNG
    document.getElementById('downloadPNG').addEventListener('click', function() {
        downloadImage('png');
    });

    // Download SVG
    document.getElementById('downloadSVG').addEventListener('click', function() {
        downloadImage('svg');
    });

    // Toggle display mode between inline-block and inline-flex
    document.getElementById('toggleDisplayCheckbox').addEventListener('change', function() {
        const outputDiv = document.getElementById('output');
        outputDiv.style.display = this.checked ? 'inline-flex' : 'inline-block';
    });

    // Event listeners for GIF buttons
    document.getElementById('startGif').addEventListener('click', startGifAnimation);
    document.getElementById('stopGif').addEventListener('click', stopGifAnimation);

    // Initialize the text display
    styleText();
});
