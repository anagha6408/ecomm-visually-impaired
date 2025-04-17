// document.addEventListener("DOMContentLoaded", function() {
//     const searchInput = document.getElementById("searchInput");
//     const voiceSearchBtn = document.getElementById("voiceSearchBtn");

//     // Check if browser supports speech recognition
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (SpeechRecognition) {
//         const recognition = new SpeechRecognition();
//         recognition.continuous = false;
//         recognition.lang = 'en-US';

//         voiceSearchBtn.addEventListener("click", () => {
//             recognition.start();
//         });

//         recognition.onresult = (event) => {
//             const transcript = event.results[0][0].transcript;
//             searchInput.value = transcript;

//             // Auto-submit search form
//             document.getElementById("searchForm").submit();
//         };

//         recognition.onerror = (event) => {
//             alert("Voice search error: " + event.error);
//         };
//     } else {
//         alert("Your browser does not support voice search.");
//     }
// });
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const voiceSearchBtn = document.getElementById("voiceSearchBtn");
    const searchForm = document.getElementById("searchForm");

    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        voiceSearchBtn.addEventListener("click", () => {
            recognition.start();
        });

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            
            // Check if the transcript is a filter command
            if (isFilterCommand(transcript)) {
                // Process the filter command
                processFilterCommand(transcript);
            } else {
                // Regular search - use the existing functionality
                searchInput.value = transcript;
                searchForm.submit();
            }
        };

        recognition.onerror = (event) => {
            console.error("Voice search error:", event.error);
            alert("Voice search error: " + event.error);
        };
    } else {
        console.error("Speech recognition not supported");
        // Don't alert here to avoid disrupting UX if the button isn't visible
    }
    
    // Function to detect if the voice command is a filter request
    function isFilterCommand(text) {
        const filterKeywords = [
            "under", "over", "less than", "more than", "between", 
            "price", "category", "trending"
        ];
        
        text = text.toLowerCase();
        return filterKeywords.some(keyword => text.includes(keyword));
    }
    
    // Function to process filter commands
    function processFilterCommand(command) {
        command = command.toLowerCase();
        console.log("Processing filter command:", command);
        let filters = {};
        
        // Check for price filters (using your selling_price field)
        const maxPriceMatch = command.match(/(?:under|less than|below|cheaper than|maximum|max|not more than)(?: of)? \$?(\d+(?:\.\d+)?)/i);
        if (maxPriceMatch) {
            filters.max_price = parseFloat(maxPriceMatch[1]);
        }
        
        const minPriceMatch = command.match(/(?:over|more than|above|at least|minimum|min)(?: of)? \$?(\d+(?:\.\d+)?)/i);
        if (minPriceMatch) {
            filters.min_price = parseFloat(minPriceMatch[1]);
        }
        
        const betweenMatch = command.match(/between \$?(\d+(?:\.\d+)?) and \$?(\d+(?:\.\d+)?)/i);
        if (betweenMatch) {
            const price1 = parseFloat(betweenMatch[1]);
            const price2 = parseFloat(betweenMatch[2]);
            filters.min_price = Math.min(price1, price2);
            filters.max_price = Math.max(price1, price2);
        }
        
        // Check for trending products
        if (command.includes("trending")) {
            filters.trending = true;
        }
        
        // Add basic search terms
        // Extract main keywords after removing filter commands
        let searchTerms = command;
        if (maxPriceMatch) searchTerms = searchTerms.replace(maxPriceMatch[0], '');
        if (minPriceMatch) searchTerms = searchTerms.replace(minPriceMatch[0], '');
        if (betweenMatch) searchTerms = searchTerms.replace(betweenMatch[0], '');
        
        // Remove common filter words
        searchTerms = searchTerms.replace(/show|filter|find|only|products|items/gi, '').trim();
        
        if (searchTerms) {
            filters.searched = searchTerms;
        }
        
        // Apply the filters
        applyFilters(filters);
    }
    
    // Function to apply the filters
    function applyFilters(filters) {
        // Create URL parameters for the filters
        const params = new URLSearchParams();
        
        // Add all the filters as parameters
        for (const [key, value] of Object.entries(filters)) {
            params.append(key, value);
        }
        
        console.log("Applying filters:", filters);
        console.log("URL params:", params.toString());
        
        // Redirect to the search URL with filter parameters
        window.location.href = "/search/?" + params.toString();
    }
});