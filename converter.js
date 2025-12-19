 // Conversion logic (same as before)
document.getElementById("convertBtn").addEventListener("click", convertColor);

function convertColor() {
    const input = document.getElementById("colorInput").value.trim();
    const result = document.getElementById("result");
    const preview = document.getElementById("colorPreview");

    if (!input) {
        result.textContent = "Please enter a color value.";
        preview.style.background = "transparent";
        scrollToResult(); // Scroll for empty input error
        return;
    }

    if (input.startsWith("#")) {
        const hex = input.slice(1);
        if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
            result.textContent = "Invalid HEX value!";
            preview.style.background = "transparent";
            scrollToResult(); // Scroll for HEX format error
            return;
        }
        let r, g, b;
        if (hex.length === 3) {
            r = parseInt(hex[0]+hex[0], 16);
            g = parseInt(hex[1]+hex[1], 16);
            b = parseInt(hex[2]+hex[2], 16);
        } else {
            r = parseInt(hex.substring(0,2),16);
            g = parseInt(hex.substring(2,4),16);
            b = parseInt(hex.substring(4,6),16);
        }
        result.textContent = `RGB(${r}, ${g}, ${b})`;
        preview.style.background = `rgb(${r},${g},${b})`;
        scrollToResult(); // Scroll for successful HEX conversion
        return;
    }

    if (/^\d{1,3},\d{1,3},\d{1,3}$/.test(input)) {
        const [r,g,b] = input.split(",").map(Number);
        if ([r,g,b].some(n => n<0 || n>255)) {
            result.textContent = "RGB values must be 0-255!";
            preview.style.background = "transparent";
            scrollToResult(); // Scroll for RGB range error
            return;
        }
        const hex = "#" + ((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1).toUpperCase();
        result.textContent = hex;
        preview.style.background = `rgb(${r},${g},${b})`;
        scrollToResult(); // Scroll for successful RGB conversion
        return;
    }

    result.textContent = "Invalid input format!";
    preview.style.background = "transparent";
    scrollToResult(); // Scroll for general format error
}

// *** SMOOTH SCROLL FUNCTION ***
function scrollToResult() {
    const resultElement = document.getElementById('result');
    
    if (resultElement) {
        // Smooth scroll to center the result
        resultElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // Optional visual feedback - subtle highlight
        const originalBg = resultElement.parentElement.style.backgroundColor;
        resultElement.parentElement.style.backgroundColor = 'rgba(100, 200, 255, 0.1)';
        resultElement.parentElement.style.transition = 'background-color 0.5s ease';
        
        // Remove highlight after 800ms
        setTimeout(() => {
            resultElement.parentElement.style.backgroundColor = originalBg;
        }, 800);
    }
}

// *** FAILPROOF COPY FUNCTIONALITY ***
document.getElementById("copyBtn").addEventListener("click", async function() {
    const resultElement = document.getElementById("result");
    const text = resultElement.textContent;
    const copyBtn = this;
    const originalHTML = copyBtn.innerHTML;
    
    // Don't copy placeholder or error messages
    if (!text || text.includes("Waiting") || text.includes("Please") || text.includes("Invalid") || text.includes("must")) {
        // Visual feedback that nothing was copied
        copyBtn.innerHTML = '<i class="fas fa-times"></i>';
        copyBtn.style.color = "#ff6b6b";
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.color = "";
        }, 1000);
        return;
    }
    
    try {
        // Try modern clipboard API first
        await navigator.clipboard.writeText(text);
        
        // Success feedback
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.color = "#2ecc71";
        
    } catch (err) {
        // Fallback for older browsers/HTTP
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            
            // Success feedback for fallback
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.color = "#2ecc71";
            
        } catch (fallbackErr) {
            // Ultimate fallback - show text to copy manually
            copyBtn.innerHTML = '<i class="fas fa-times"></i>';
            copyBtn.style.color = "#ff6b6b";
            resultElement.style.backgroundColor = "#fff3cd";
            resultElement.style.padding = "5px";
            resultElement.style.borderRadius = "3px";
            
            setTimeout(() => {
                resultElement.style.backgroundColor = "";
                resultElement.style.padding = "";
                resultElement.style.borderRadius = "";
            }, 2000);
            
            console.log("Manual copy required: " + text);
        }
    }
    
    // Reset button after 1.5 seconds
    setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.style.color = "";
    }, 1500);
});
