// Conversion logic (same as before)
document.getElementById("convertBtn").addEventListener("click", convertColor);

function convertColor() {
    const input = document.getElementById("colorInput").value.trim();
    const result = document.getElementById("result");
    const preview = document.getElementById("colorPreview");

    if (!input) {
        result.textContent = "Please enter a color value.";
        preview.style.background = "transparent";
        return;
    }

    if (input.startsWith("#")) {
        const hex = input.slice(1);
        if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
            result.textContent = "Invalid HEX value!";
            preview.style.background = "transparent";
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
        return;
    }

    if (/^\d{1,3},\d{1,3},\d{1,3}$/.test(input)) {
        const [r,g,b] = input.split(",").map(Number);
        if ([r,g,b].some(n => n<0 || n>255)) {
            result.textContent = "RGB values must be 0-255!";
            preview.style.background = "transparent";
            return;
        }
        const hex = "#" + ((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1).toUpperCase();
        result.textContent = hex;
        preview.style.background = `rgb(${r},${g},${b})`;
        return;
    }

    result.textContent = "Invalid input format!";
    preview.style.background = "transparent";
}

// Copy button functionality
document.getElementById("copyBtn").addEventListener("click", function() {
    const text = document.getElementById("result").textContent;
    if (text) navigator.clipboard.writeText(text);
});
