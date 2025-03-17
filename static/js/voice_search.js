document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const voiceSearchBtn = document.getElementById("voiceSearchBtn");

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
            searchInput.value = transcript;

            // Auto-submit search form
            document.getElementById("searchForm").submit();
        };

        recognition.onerror = (event) => {
            alert("Voice search error: " + event.error);
        };
    } else {
        alert("Your browser does not support voice search.");
    }
});
