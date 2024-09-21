
document.addEventListener('DOMContentLoaded', function() {
    let caseRandomizationEnabled = false;
    let gifModeEnabled = false;
    let isAnimating = false; // State to track if GIF animation is running
    let animationInterval;
    let captureInterval;
    let gif;

    // Function to generate randomized integers between the mix and max values provided
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

    // Function to choose a random font family out of the ttfs available
    function getRandomFontFamily() {
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
        return fonts[getRandomInt(0, fonts.length - 1)];
    }

    // Function to choose a random font weight for the text
    function getRandomWeight() {
        const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
        return weights[getRandomInt(0, weights.length - 1)];
    }

    // Function to style the text using the above functions and apply them
    function styleText() {
        const input = document.getElementById('userInput').value;
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = '';

        for (let char of input) {
            let span = document.createElement('span');
            span.style.fontFamily = getRandomFontFamily();
            span.style.fontSize = getRandomFontSize();
            span.style.fontWeight = getRandomWeight();
            span.textContent = caseRandomizationEnabled ? getRandomCase(char) : char;

            outputDiv.appendChild(span);
        }
    }

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
            
            // Generate a valid filename from the input text (limit length, replace unsafe characters)
            let fileName = inputText.trim().replace(/[^a-z0-9]/gi, '_').substring(0, 20);
            
            // Ensure there's a fallback in case the input is empty
            fileName = fileName || 'styled-text';
            
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

    function startGifAnimation() {
        console.log("Starting gif animation cycle...");
        
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

        // Start styling text and capturing frames
        animationInterval = setInterval(styleText, 1000); // Change text style every second
        captureInterval = setInterval(captureFrame, 1000); // Capture frame every second
    }

    function captureFrame() {
        const outputDiv = document.getElementById('output');
        html2canvas(outputDiv, {
            backgroundColor: null,
            logging: false, // Set to true if you want to see logs
            useCORS: true, // Enable if cross-origin issues occur
        }).then(canvas => {
            gif.addFrame(canvas, { copy: true, delay: 1000 });
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

    // Waits for user input and then updates the text on screen to reflect input
    document.getElementById('userInput').addEventListener('input', function() {
        styleText(); 
    });

    // Allows for user to regenerate the randomized text
    document.getElementById('regenerateText').addEventListener('click', function() {
        styleText()
    });

    // Event listener for checkbox to toggle case randomization
    document.getElementById('caseRandomizationCheckbox').addEventListener('change', function() {
        caseRandomizationEnabled = this.checked;
        styleText(); // Apply the style with updated setting
    });

    document.getElementById('toggleGifMode').addEventListener('change', function() {
        if (gifModeEnabled) {
            document.getElementById('startGif').style.display = 'none';
            gifModeEnabled = false;
        }
        else {
            document.getElementById('startGif').style.display = 'inline-block';
            gifModeEnabled = true;
        }

    });

     // Allows for PNG downloads using the html2canvas library
     document.getElementById('downloadPNG').addEventListener('click', function() {
        downloadImage('png')
    });

    // Allows for SVG downloads using the html2canvas library
    document.getElementById('downloadSVG').addEventListener('click', function() {
        downloadImage('svg')
    });

    // Toggle output display between inline-block and inline-flex
    document.getElementById('toggleDisplayCheckbox').addEventListener('change', function() {
        const outputDiv = document.getElementById('output');
        if (this.checked) {
            outputDiv.style.display = 'inline-flex';
        } else {
            outputDiv.style.display = 'inline-block';
        }
    });

    // Event listeners for GIF buttons
    document.getElementById('startGif').addEventListener('click', startGifAnimation);
    document.getElementById('stopGif').addEventListener('click', stopGifAnimation);

    window.styleText = styleText;
});