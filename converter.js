// ============================================
// GLOBAL VARIABLES AND INITIALIZATION
// ============================================
let totalConversions = parseInt(localStorage.getItem('totalConversions')) || 0;
let isHexToRgbPage = window.location.pathname.includes('hex-to-rgb') || 
                     window.location.pathname === '/hex-to-rgb' ||
                     window.location.pathname === '/hex-to-rgb.html';

// Initialize page based on URL
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    updateConversionCount();
});

// ============================================
// PAGE INITIALIZATION
// ============================================
function initializePage() {
    // Update page title and elements based on current page
    if (isHexToRgbPage) {
        // HEX to RGB page adjustments
        document.getElementById('conversionDirection').textContent = 'HEX → RGB';
        document.title = document.title.replace('RGB to HEX', 'HEX to RGB');
        
        // Update input placeholder
        const colorInput = document.getElementById('colorInput');
        if (colorInput) {
            colorInput.placeholder = 'e.g., #FF0000 or 255, 0, 0';
        }
        
        // Update format tags order
        const formatTags = document.querySelector('.format-tags');
        if (formatTags) {
            const tags = formatTags.querySelectorAll('.tag');
            if (tags.length >= 2) {
                // Move HEX tag first
                formatTags.insertBefore(tags[1], tags[0]);
            }
        }
    } else {
        // RGB to HEX page (default)
        document.getElementById('conversionDirection').textContent = 'RGB → HEX';
    }
    
    // Load previous conversions count
    const savedConversions = localStorage.getItem(isHexToRgbPage ? 'hexConversions' : 'rgbConversions');
    if (savedConversions) {
        updatePageConversionCount(parseInt(savedConversions));
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    // Convert button
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', convertColor);
    }
    
    // Enter key support
    const colorInput = document.getElementById('colorInput');
    if (colorInput) {
        colorInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                convertColor();
            }
        });
        
        // Auto-convert on valid input (optional)
        colorInput.addEventListener('blur', function() {
            if (this.value.trim() && isValidColorFormat(this.value.trim())) {
                convertColor();
            }
        });
    }
    
    // Copy button
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyToClipboard);
    }
    
    // Example buttons
    const exampleButtons = document.querySelectorAll('.example-btn');
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            const colorInput = document.getElementById('colorInput');
            if (colorInput) {
                colorInput.value = color;
                colorInput.focus();
                
                // Auto-convert example colors
                setTimeout(() => {
                    convertColor();
                }, 300);
            }
        });
    });
}

// ============================================
// COLOR VALIDATION FUNCTIONS
// ============================================
function isValidColorFormat(input) {
    input = input.trim();
    
    // Check for HEX format
    if (input.startsWith('#')) {
        const hex = input.slice(1);
        return /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
    }
    
    // Check for RGB format
    if (/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/.test(input)) {
        const [r, g, b] = input.split(',').map(Number);
        return [r, g, b].every(n => n >= 0 && n <= 255);
    }
    
    // Check for HEX without #
    if (/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(input)) {
        return true;
    }
    
    return false;
}

function validateHex(hex) {
    hex = hex.replace('#', '');
    if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
        return { valid: false, error: "Invalid HEX format! Use #RGB or #RRGGBB" };
    }
    return { valid: true, hex: hex };
}

function validateRgb(rgbString) {
    const parts = rgbString.split(',').map(s => parseInt(s.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) {
        return { valid: false, error: "Invalid RGB format! Use r, g, b (e.g., 255, 0, 0)" };
    }
    if (parts.some(n => n < 0 || n > 255)) {
        return { valid: false, error: "RGB values must be between 0-255!" };
    }
    return { valid: true, rgb: parts };
}

// ============================================
// CONVERSION FUNCTIONS
// ============================================
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    
    // Expand shorthand hex (e.g., #FFF -> #FFFFFF)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function detectInputFormat(input) {
    input = input.trim();
    
    if (input.startsWith('#')) {
        return 'hex';
    }
    
    if (/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/.test(input)) {
        return 'rgb';
    }
    
    // Check for hex without #
    if (/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(input)) {
        return 'hex';
    }
    
    return 'unknown';
}

// ============================================
// MAIN CONVERSION FUNCTION
// ============================================
function convertColor() {
    const input = document.getElementById('colorInput').value.trim();
    const result = document.getElementById('result');
    const preview = document.getElementById('colorPreview');
    const formatType = document.getElementById('formatType');
    const conversionStatus = document.getElementById('conversionStatus');
    const conversionDirection = document.getElementById('conversionDirection');
    
    // Clear previous result styling
    result.style.backgroundColor = '';
    result.style.color = '';
    
    // Handle empty input
    if (!input) {
        showError("Please enter a color value", result, preview);
        updateStatus('error', conversionStatus);
        formatType.textContent = '-';
        return;
    }
    
    // Detect input format
    const inputFormat = detectInputFormat(input);
    
    if (inputFormat === 'unknown') {
        showError("Invalid format! Use #RRGGBB, #RGB, or r, g, b", result, preview);
        updateStatus('error', conversionStatus);
        formatType.textContent = 'Invalid';
        return;
    }
    
    // Update format display
    formatType.textContent = inputFormat.toUpperCase();
    
    try {
        let output, outputFormat, colorValue;
        
        if (inputFormat === 'hex') {
            // HEX to RGB conversion
            const validation = validateHex(input);
            if (!validation.valid) {
                showError(validation.error, result, preview);
                updateStatus('error', conversionStatus);
                return;
            }
            
            const rgb = hexToRgb(validation.hex);
            output = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            outputFormat = 'RGB';
            colorValue = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            
            // Update direction display
            if (conversionDirection) {
                conversionDirection.textContent = 'HEX → RGB';
            }
            
        } else {
            // RGB to HEX conversion
            const validation = validateRgb(input);
            if (!validation.valid) {
                showError(validation.error, result, preview);
                updateStatus('error', conversionStatus);
                return;
            }
            
            const [r, g, b] = validation.rgb;
            output = rgbToHex(r, g, b);
            outputFormat = 'HEX';
            colorValue = `rgb(${r}, ${g}, ${b})`;
            
            // Update direction display
            if (conversionDirection) {
                conversionDirection.textContent = 'RGB → HEX';
            }
        }
        
        // Display results
        result.textContent = output;
        result.style.color = '#2c3e50';
        preview.style.background = colorValue;
        preview.innerHTML = ''; // Clear placeholder
        
        // Update status
        updateStatus('success', conversionStatus);
        
        // Update conversion counts
        updateConversionCounts();
        
        // Scroll to result
        scrollToResult();
        
        // Visual feedback
        highlightResult(result);
        
    } catch (error) {
        showError("Conversion error: " + error.message, result, preview);
        updateStatus('error', conversionStatus);
        formatType.textContent = 'Error';
    }
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================
function showError(message, resultElement, previewElement) {
    resultElement.textContent = message;
    resultElement.style.color = '#dc3545';
    previewElement.style.background = 'transparent';
    previewElement.innerHTML = `
        <div class="preview-placeholder">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Invalid input</span>
        </div>
    `;
    
    // Scroll to error
    scrollToResult();
}

function updateStatus(status, statusElement) {
    if (!statusElement) return;
    
    statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    statusElement.className = 'info-value ' + status;
    
    // Remove previous status classes
    statusElement.classList.remove('ready', 'success', 'error');
    statusElement.classList.add(status);
}

function highlightResult(resultElement) {
    resultElement.parentElement.style.backgroundColor = 'rgba(74, 108, 247, 0.1)';
    resultElement.parentElement.style.transition = 'background-color 0.5s ease';
    
    setTimeout(() => {
        resultElement.parentElement.style.backgroundColor = '';
    }, 800);
}

// ============================================
// CONVERSION COUNT MANAGEMENT
// ============================================
function updateConversionCounts() {
    // Update total conversions
    totalConversions++;
    localStorage.setItem('totalConversions', totalConversions);
    
    // Update page-specific conversions
    const pageKey = isHexToRgbPage ? 'hexConversions' : 'rgbConversions';
    let pageConversions = parseInt(localStorage.getItem(pageKey)) || 0;
    pageConversions++;
    localStorage.setItem(pageKey, pageConversions);
    
    // Update display
    updatePageConversionCount(pageConversions);
    
    // Update global conversion count if element exists
    const globalCountElement = document.getElementById('conversionCount');
    if (globalCountElement) {
        globalCountElement.textContent = totalConversions.toLocaleString();
    }
}

function updatePageConversionCount(count) {
    const pageCountElement = document.getElementById('conversionCount');
    if (pageCountElement) {
        pageCountElement.textContent = count.toLocaleString();
    }
}

function updateConversionCount() {
    const pageKey = isHexToRgbPage ? 'hexConversions' : 'rgbConversions';
    const pageConversions = parseInt(localStorage.getItem(pageKey)) || 0;
    updatePageConversionCount(pageConversions);
    
    // Update total count display if exists
    const globalCountElement = document.getElementById('totalConversions');
    if (globalCountElement) {
        globalCountElement.textContent = totalConversions.toLocaleString();
    }
}

// ============================================
// COPY TO CLIPBOARD FUNCTION
// ============================================
async function copyToClipboard() {
    const resultElement = document.getElementById('result');
    const text = resultElement.textContent;
    const copyBtn = document.getElementById('copyBtn');
    const originalHTML = copyBtn.innerHTML;
    
    // Don't copy error messages or placeholders
    const errorKeywords = ['Please', 'Invalid', 'Error', 'Waiting', 'must'];
    if (!text || errorKeywords.some(keyword => text.includes(keyword))) {
        // Visual feedback
        copyBtn.innerHTML = '<i class="fas fa-times"></i>';
        copyBtn.style.color = '#dc3545';
        copyBtn.style.backgroundColor = '#fee2e2';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.color = '';
            copyBtn.style.backgroundColor = '';
        }, 1000);
        return;
    }
    
    try {
        // Modern clipboard API
        await navigator.clipboard.writeText(text);
        
        // Success feedback
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.color = '#28a745';
        copyBtn.style.backgroundColor = '#d1fae5';
        
        // Also update result styling temporarily
        resultElement.style.backgroundColor = '#d1fae5';
        resultElement.style.transition = 'background-color 0.3s ease';
        
    } catch (err) {
        // Fallback for older browsers/HTTP
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Success feedback for fallback
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.color = '#28a745';
            copyBtn.style.backgroundColor = '#d1fae5';
            
            resultElement.style.backgroundColor = '#d1fae5';
            
        } catch (fallbackErr) {
            // Ultimate fallback
            copyBtn.innerHTML = '<i class="fas fa-times"></i>';
            copyBtn.style.color = '#dc3545';
            copyBtn.style.backgroundColor = '#fee2e2';
            
            // Show text for manual copy
            resultElement.style.backgroundColor = '#fff3cd';
            resultElement.style.cursor = 'pointer';
            resultElement.title = 'Click to select text for manual copy';
            
            resultElement.addEventListener('click', function selectText() {
                const range = document.createRange();
                range.selectNodeContents(this);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Remove listener after first click
                this.removeEventListener('click', selectText);
            }, { once: true });
            
            return;
        }
    }
    
    // Reset button and result styling after 1.5 seconds
    setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.color = '';
        copyBtn.style.backgroundColor = '';
        resultElement.style.backgroundColor = '';
    }, 1500);
}

// ============================================
// SCROLL FUNCTION
// ============================================
function scrollToResult() {
    const resultElement = document.getElementById('result');
    if (!resultElement) return;
    
    // Smooth scroll to result
    resultElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    });
    
    // Add visual highlight
    const resultContainer = resultElement.closest('.result-value') || resultElement.parentElement;
    if (resultContainer) {
        const originalBorder = resultContainer.style.borderColor;
        resultContainer.style.borderColor = '#4a6cf7';
        resultContainer.style.boxShadow = '0 0 0 2px rgba(74, 108, 247, 0.2)';
        resultContainer.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            resultContainer.style.borderColor = originalBorder;
            resultContainer.style.boxShadow = '';
        }, 1000);
    }
}

// ============================================
// AUTO-CONVERSION ON PAGE LOAD (Optional)
// ============================================
// Uncomment this if you want to auto-convert example colors from URL parameters
/*
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const colorParam = urlParams.get('color');
    
    if (colorParam) {
        const colorInput = document.getElementById('colorInput');
        if (colorInput) {
            colorInput.value = colorParam;
            setTimeout(() => {
                convertColor();
            }, 500);
        }
    }
});
*/

// ============================================
// KEYBOARD SHORTCUTS (Optional)
// ============================================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        convertColor();
    }
    
    // Ctrl/Cmd + C to copy (when result is focused)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const activeElement = document.activeElement;
        if (activeElement.id === 'result' || activeElement.closest('.result-value')) {
            e.preventDefault();
            copyToClipboard();
        }
    }
});

// ============================================
// EXPORT FUNCTIONS FOR TESTING (Optional)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        hexToRgb,
        rgbToHex,
        validateHex,
        validateRgb,
        detectInputFormat,
        isValidColorFormat
    };
}
