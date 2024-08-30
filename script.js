
document.addEventListener('DOMContentLoaded', function() {

    // Function to generate randomized integers between the mix and max values provided
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generates a random font size using the getRandomInt function (min, max)
    function getRandomFontSize() {
        return getRandomInt(48, 62) + 'px';
    }

    // Chooses a random font family out of the ttfs available
    function getRandomFontFamily() {
        const fonts = ['Futura Light', 'Futura Regular', 'Futura Bold', 'Futura Round', 'Futura Std Book'];
        return fonts[getRandomInt(0, fonts.length - 1)];
    }

    // Function to choose a random font weight for the text
    function getRandomWeight() {
        const weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
        return weights[getRandomInt(0, weights.length - 1)];
    }

    // Applies random diacritic to the font(experimental)
    function getRandomDiacritic() {
        const diacritics = [
            '\u0300', // grave accent
            '\u0301', // acute accent
            '\u0302', // circumflex accent
            '\u0303', // tilde
            '\u0304', // macron
            '\u0305', // overline
            '\u0306', // breve
            '\u0307', // dot above
            '\u0308', // diaeresis
            '\u0309', // hook above
            '\u030A', // ring above
            '\u030B', // double acute accent
            '\u030C', // caron
            '\u030D', // vertical line above
            '\u030E', // double vertical line above
            '\u030F', // inverted breve
            '\u0310', // double grave accent
            '\u0311', // inverted double grave accent
            '\u0312', // candrabindu
            '\u0313', // inverted breve
            '\u0314', // tilde overlay
            '\u0315', // double tilde
            '\u0316', // combining short stroke overlay
            '\u0317', // combining long stroke overlay
            '\u0318', // combining right half ring
            '\u0319', // combining inverted bridge
            '\u031A', // combining left half ring
            '\u031B', // combining palatalized hook
            '\u031C', // combining retroflex hook
            '\u031D', // combining dot below
            '\u031E', // combining diaeresis below
            '\u031F', // combining ring below
            '\u0320', // combining palatalized hook below
            '\u0321', // combining retroflex hook below
            '\u0322', // combining dot above
            '\u0323', // combining dot below
            '\u0324', // combining circumflex accent below
            '\u0325', // combining breve below
            '\u0326', // combining ring below
            '\u0327', // combining cedilla
            '\u0328', // combining ogonek
            '\u0329', // combining vertical line below
            '\u032A', // combining bridge above
            '\u032B', // combining comma below
            '\u032C', // combining cedilla
            '\u032D', // combining ogonek
            '\u032E', // combining vertical line below
            '\u032F', // combining comma above
        ];
        return diacritics[getRandomInt(0, diacritics.length - 1)];
    }

    function styleText() {
        const input = document.getElementById('userInput').value;
        const outputDiv = document.getElementById('output');
        outputDiv.innerHTML = '';

        const diacriticChance = 30; // 30% chance of a letter having a diacritic

        for (let char of input) {
            let span = document.createElement('span');
            const shouldAddDiacritic = getRandomInt(1, 100) <= diacriticChance;
                if (shouldAddDiacritic) {
                    span.textContent = char + getRandomDiacritic();
                } else {
                    span.textContent = char;
                }
            span.style.fontFamily = getRandomFontFamily();
            span.style.fontSize = getRandomFontSize();
            span.style.fontWeight = getRandomWeight();
            outputDiv.appendChild(span);
        }
    }
    window.styleText = styleText;
});