/* ============================
   presets.js  –  Pre-defined categories with inline images
   ============================ */

/**
 * HOW TO ADD YOUR OWN PRESET CATEGORIES
 * ======================================
 * 1. Add a new object to the PRESETS array below.
 * 2. Each object needs: { name: "Category Name", images: [...] }
 * 3. Images can be:
 *    - Inline SVG data URIs (like the examples below — tiny, no files needed)
 *    - Base64 data URIs  (e.g. "data:image/jpeg;base64,/9j/4AAQ...")
 *    - Relative paths to image files in the repo (e.g. "data/images/flags/usa.png")
 *      → These will be fetched and converted to base64 at load time.
 *        Only works when served over HTTP (GitHub Pages), not file://
 *
 * Tip: Keep images under 600px and use JPEG for photos.
 * Minimum 3 images per category, recommended 8-15.
 */

const Presets = (() => {

    // ─── Helper: Generate an SVG data URI with a colored background and text ───
    function svgCard(bgColor, text, textColor = '#fff', fontSize = 72) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
            <rect width="400" height="400" fill="${bgColor}" rx="20"/>
            <text x="200" y="220" text-anchor="middle" font-family="Arial,sans-serif"
                  font-size="${fontSize}" font-weight="bold" fill="${textColor}">${text}</text>
        </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    // ─── Helper: Generate flag-like SVG (3 horizontal stripes) ───
    function flagStripes(c1, c2, c3, label) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
            <rect width="400" height="400" fill="#222" rx="20"/>
            <rect x="50" y="60" width="300" height="80" fill="${c1}" rx="4"/>
            <rect x="50" y="140" width="300" height="80" fill="${c2}" rx="4"/>
            <rect x="50" y="220" width="300" height="80" fill="${c3}" rx="4"/>
            <text x="200" y="360" text-anchor="middle" font-family="Arial,sans-serif"
                  font-size="28" fill="#888">?</text>
        </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    // ─── Helper: Generate vertical stripe flag SVG ───
    function flagVertical(c1, c2, c3) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
            <rect width="400" height="400" fill="#222" rx="20"/>
            <rect x="50" y="80" width="100" height="240" fill="${c1}" rx="4"/>
            <rect x="150" y="80" width="100" height="240" fill="${c2}" rx="4"/>
            <rect x="250" y="80" width="100" height="240" fill="${c3}" rx="4"/>
            <text x="200" y="370" text-anchor="middle" font-family="Arial,sans-serif"
                  font-size="28" fill="#888">?</text>
        </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    // ─── Define Categories ───

    const PRESETS = [
        {
            name: "World Capitals",
            images: [
                svgCard('#1a5276', 'Paris'),
                svgCard('#1a5276', 'Tokyo'),
                svgCard('#1a5276', 'London'),
                svgCard('#1a5276', 'Berlin'),
                svgCard('#1a5276', 'Madrid'),
                svgCard('#1a5276', 'Rome'),
                svgCard('#1a5276', 'Ottawa'),
                svgCard('#1a5276', 'Canberra'),
                svgCard('#1a5276', 'Brasília'),
                svgCard('#1a5276', 'Cairo'),
            ]
        },
        {
            name: "Colors",
            images: [
                svgCard('#e74c3c', '?', '#fff'),
                svgCard('#3498db', '?', '#fff'),
                svgCard('#2ecc71', '?', '#fff'),
                svgCard('#f1c40f', '?', '#333'),
                svgCard('#9b59b6', '?', '#fff'),
                svgCard('#e67e22', '?', '#fff'),
                svgCard('#1abc9c', '?', '#fff'),
                svgCard('#e91e63', '?', '#fff'),
                svgCard('#00bcd4', '?', '#fff'),
                svgCard('#795548', '?', '#fff'),
            ]
        },
        {
            name: "Numbers (Math)",
            images: [
                svgCard('#2c3e50', '7 × 8'),
                svgCard('#2c3e50', '12 × 12'),
                svgCard('#2c3e50', '9 × 6'),
                svgCard('#2c3e50', '15 × 4'),
                svgCard('#2c3e50', '11 × 7'),
                svgCard('#2c3e50', '8 × 13'),
                svgCard('#2c3e50', '6 × 14'),
                svgCard('#2c3e50', '17 × 3'),
                svgCard('#2c3e50', '9 × 9'),
                svgCard('#2c3e50', '25 × 4'),
            ]
        },
        {
            name: "Flags (Stripes)",
            images: [
                flagStripes('#000', '#DD0000', '#FFCE00'),   // Germany
                flagStripes('#EF4135', '#fff', '#EF4135'),   // Austria
                flagStripes('#fff', '#0055A4', '#EF4135'),   // Netherlands-ish
                flagStripes('#009246', '#fff', '#CE2B37'),    // Hungary-ish
                flagStripes('#003893', '#fff', '#ED2939'),    // Luxembourg-ish
                flagStripes('#002395', '#fff', '#ED2939'),    // France-rotated
                flagVertical('#009246', '#fff', '#CE2B37'),   // Italy
                flagVertical('#002395', '#fff', '#ED2939'),   // France
                flagVertical('#002654', '#fff', '#CE1126'),   // Romania-ish
                flagStripes('#EF4135', '#fff', '#0055A4'),    // Thailand-ish
            ]
        },
        {
            name: "Animals",
            images: [
                svgCard('#27ae60', '🐶', '#fff', 120),
                svgCard('#27ae60', '🐱', '#fff', 120),
                svgCard('#27ae60', '🐘', '#fff', 120),
                svgCard('#27ae60', '🦁', '#fff', 120),
                svgCard('#27ae60', '🐧', '#fff', 120),
                svgCard('#27ae60', '🦊', '#fff', 120),
                svgCard('#27ae60', '🐻', '#fff', 120),
                svgCard('#27ae60', '🦅', '#fff', 120),
                svgCard('#27ae60', '🐬', '#fff', 120),
                svgCard('#27ae60', '🦋', '#fff', 120),
            ]
        },
        {
            name: "Music Notes",
            images: [
                svgCard('#8e44ad', '♩', '#fff', 120),
                svgCard('#8e44ad', '♪', '#fff', 120),
                svgCard('#8e44ad', '♫', '#fff', 120),
                svgCard('#8e44ad', '♬', '#fff', 120),
                svgCard('#8e44ad', 'C Major'),
                svgCard('#8e44ad', 'G Minor'),
                svgCard('#8e44ad', 'D Major'),
                svgCard('#8e44ad', 'A Minor'),
                svgCard('#8e44ad', 'E Major'),
                svgCard('#8e44ad', 'B♭ Major'),
            ]
        },
        {
            name: "Food & Drinks",
            images: [
                svgCard('#d35400', '🍕', '#fff', 120),
                svgCard('#d35400', '🍔', '#fff', 120),
                svgCard('#d35400', '🍣', '#fff', 120),
                svgCard('#d35400', '🌮', '#fff', 120),
                svgCard('#d35400', '🍜', '#fff', 120),
                svgCard('#d35400', '🥗', '#fff', 120),
                svgCard('#d35400', '🍰', '#fff', 120),
                svgCard('#d35400', '☕', '#fff', 120),
                svgCard('#d35400', '🍺', '#fff', 120),
                svgCard('#d35400', '🧃', '#fff', 120),
            ]
        },
        {
            name: "Sports",
            images: [
                svgCard('#c0392b', '⚽', '#fff', 120),
                svgCard('#c0392b', '🏀', '#fff', 120),
                svgCard('#c0392b', '🎾', '#fff', 120),
                svgCard('#c0392b', '🏈', '#fff', 120),
                svgCard('#c0392b', '⚾', '#fff', 120),
                svgCard('#c0392b', '🏐', '#fff', 120),
                svgCard('#c0392b', '🏓', '#fff', 120),
                svgCard('#c0392b', '🥊', '#fff', 120),
                svgCard('#c0392b', '🏊', '#fff', 120),
                svgCard('#c0392b', '⛷️', '#fff', 120),
            ]
        },
        {
            name: "Science Symbols",
            images: [
                svgCard('#16a085', 'H₂O'),
                svgCard('#16a085', 'E=mc²'),
                svgCard('#16a085', 'CO₂'),
                svgCard('#16a085', 'NaCl'),
                svgCard('#16a085', 'Fe'),
                svgCard('#16a085', 'Au'),
                svgCard('#16a085', 'O₂'),
                svgCard('#16a085', 'π'),
                svgCard('#16a085', 'DNA'),
                svgCard('#16a085', 'pH'),
            ]
        },
        {
            name: "Landmarks",
            images: [
                svgCard('#34495e', '🗼', '#fff', 100),
                svgCard('#34495e', '🗽', '#fff', 100),
                svgCard('#34495e', '🏛️', '#fff', 100),
                svgCard('#34495e', '⛩️', '#fff', 100),
                svgCard('#34495e', '🕌', '#fff', 100),
                svgCard('#34495e', '🏰', '#fff', 100),
                svgCard('#34495e', '🗿', '#fff', 100),
                svgCard('#34495e', '⛪', '#fff', 100),
                svgCard('#34495e', '🎡', '#fff', 100),
                svgCard('#34495e', '🌉', '#fff', 100),
            ]
        }
    ];

    /** Get list of preset names */
    function getNames() {
        return PRESETS.map(p => p.name);
    }

    /** Get a preset by name */
    function getByName(name) {
        return PRESETS.find(p => p.name === name) || null;
    }

    /** Get a preset by index */
    function getByIndex(idx) {
        return PRESETS[idx] || null;
    }

    /** Total number of presets */
    function count() {
        return PRESETS.length;
    }

    return { getNames, getByName, getByIndex, count };
})();
