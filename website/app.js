
console.log("TRUTHLENS AI APP.JS LOADED");

const API_URL = "https://truthlensai-re6x.onrender.com/predict";

const newsText = document.getElementById("newsText");
const analyzeButton = document.getElementById("analyzeButton");
const characterCount = document.getElementById("characterCount");

const loading = document.getElementById("loading");
const resultCard = document.getElementById("resultCard");
const errorMessage = document.getElementById("errorMessage");

const resultText = document.getElementById("resultText");
const confidenceText = document.getElementById("confidenceText");
const resultIcon = document.getElementById("resultIcon");
const confidenceFill = document.getElementById("confidenceFill");

const resetButton = document.getElementById("resetButton");
const warningMessage = document.getElementById("warningMessage");


newsText.addEventListener("input", function () {
    characterCount.textContent =
        newsText.value.length + " characters";
});


analyzeButton.addEventListener("click", async function () {

    console.log("Analyze button clicked!");

    const text = newsText.value.trim();

    if (text.length === 0) {
        showError("Please paste a news article first.");
        return;
    }

    hideError();

    resultCard.classList.add("hidden");
    loading.classList.remove("hidden");
    analyzeButton.disabled = true;

    try {

        console.log("Sending request to Flask API...");

        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    text: text
                })
            }
        );

        console.log(
            "Flask response status:",
            response.status
        );

        const data = await response.json();

        console.log(
            "Flask response:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data.error || "API request failed."
            );
        }

        showResult(data);

    } catch (error) {

        console.error(
            "TruthLens AI Error:",
            error
        );

        showError(
            "Could not connect to TruthLens AI API. " +
            "Please try again in a moment."
        );

    } finally {

        loading.classList.add("hidden");
        analyzeButton.disabled = false;
    }
});


function showResult(data) {

    resultCard.classList.remove("hidden");

    const confidence = Number(data.confidence);

    resultText.textContent = data.result;

    confidenceText.textContent =
        confidence + "%";

    confidenceFill.style.width =
        confidence + "%";


    if (data.result === "FAKE") {

        resultIcon.textContent = "!";

        resultIcon.style.background =
            "#d64545";

        confidenceFill.style.background =
            "#d64545";

        resultCard.style.background =
            "#fff7f7";

        resultCard.style.borderColor =
            "#ffdcdc";

    } else {

        resultIcon.textContent = "✓";

        resultIcon.style.background =
            "#4056c6";

        confidenceFill.style.background =
            "#4056c6";

        resultCard.style.background =
            "#f7f9ff";

        resultCard.style.borderColor =
            "#e0e5fa";
    }


    if (confidence < 60) {

        warningMessage.textContent =
            "Low-confidence prediction. " +
            "The model is not strongly confident, " +
            "so this result should be interpreted carefully.";

    } else {

        warningMessage.textContent =
            "This is an AI model prediction, " +
            "not a guarantee that the article is true or false.";
    }
}


resetButton.addEventListener("click", function () {

    newsText.value = "";

    characterCount.textContent =
        "0 characters";

    resultCard.classList.add("hidden");

    confidenceFill.style.width =
        "0%";

    hideError();

    newsText.focus();
});


function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove("hidden");
}


function hideError() {

    errorMessage.classList.add("hidden");
}


