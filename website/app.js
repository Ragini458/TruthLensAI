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

const explanationTitle =
    document.getElementById("explanationTitle");

const explanationText =
    document.getElementById("explanationText");

const verificationText =
    document.getElementById("verificationText");

const claimsList =
    document.getElementById("claimsList");


/* =========================
   CHARACTER COUNT
========================= */

newsText.addEventListener("input", function () {

    characterCount.textContent =
        newsText.value.length + " characters";

});


/* =========================
   ANALYZE ARTICLE
========================= */

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


        showResult(data, text);


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


/* =========================
   SHOW RESULT
========================= */

function showResult(data, articleText) {

    resultCard.classList.remove("hidden");


    const confidence =
        Number(data.confidence);


    resultText.textContent =
        data.result;


    confidenceText.textContent =
        confidence + "%";


    confidenceFill.style.width =
        confidence + "%";


    /*
     * FAKE RESULT
     */

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


        explanationTitle.textContent =
            "Why the model flagged this";


        explanationText.textContent =
            "The machine learning model found " +
            "language patterns in this article that " +
            "are associated with articles labeled as " +
            "fake in its training data.";


        verificationText.textContent =
            "Check the main claims against official " +
            "sources, established news organizations, " +
            "and other independent sources before " +
            "treating the information as reliable.";

    }


    /*
     * CREDIBLE RESULT
     */

    else {

        resultIcon.textContent = "✓";

        resultIcon.style.background =
            "#4056c6";

        confidenceFill.style.background =
            "#4056c6";

        resultCard.style.background =
            "#f7f9ff";

        resultCard.style.borderColor =
            "#e0e5fa";


        explanationTitle.textContent =
            "Why the model gave this result";


        explanationText.textContent =
            "The machine learning model found " +
            "language patterns that are more similar " +
            "to articles labeled as credible in its " +
            "training data.";


        verificationText.textContent =
            "A credible prediction does not prove that " +
            "every claim is correct. For important news, " +
            "compare the information with reliable " +
            "independent sources.";

    }


    /*
     * CONFIDENCE WARNING
     */

    if (confidence < 60) {

        warningMessage.textContent =
            "⚠️ Low-confidence prediction. " +
            "The model is not strongly confident, " +
            "so this result should be interpreted carefully.";

    }

    else if (confidence < 80) {

        warningMessage.textContent =
            "⚠️ Moderate-confidence prediction. " +
            "Use the result as an indicator and " +
            "verify important claims independently.";

    }

    else {

        warningMessage.textContent =
            "ℹ️ Higher model confidence, but this is " +
            "still an AI prediction and not a guarantee " +
            "that the article is true or false.";

    }


    /*
     * GENERATE KEY CLAIMS
     */

    generateKeyClaims(articleText);

}


/* =========================
   KEY CLAIM EXTRACTION
========================= */

function generateKeyClaims(articleText) {

    claimsList.innerHTML = "";


    /*
     * Split article into sentences.
     */

    const sentences =
        articleText
            .replace(/\s+/g, " ")
            .split(/(?<=[.!?])\s+/)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 30);


    /*
     * Remove duplicate sentences.
     */

    const uniqueSentences =
        [...new Set(sentences)];


    /*
     * Give each sentence a simple importance score.
     */

    const scoredSentences =
        uniqueSentences.map(sentence => {

            let score = 0;

            const lower =
                sentence.toLowerCase();


            /*
             * Longer statements often contain
             * more information.
             */

            if (sentence.length > 80) {
                score += 2;
            }

            if (sentence.length > 140) {
                score += 1;
            }


            /*
             * Look for claim-related words.
             */

            const claimWords = [
                "announced",
                "said",
                "according",
                "reported",
                "officials",
                "government",
                "research",
                "study",
                "found",
                "will",
                "plans",
                "confirmed",
                "new",
                "increase",
                "decrease",
                "expected",
                "revealed"
            ];


            claimWords.forEach(word => {

                if (lower.includes(word)) {
                    score += 1;
                }

            });


            return {
                sentence: sentence,
                score: score
            };

        });


    /*
     * Sort by importance.
     */

    scoredSentences.sort(
        (a, b) => b.score - a.score
    );


    /*
     * Show maximum 5 claims.
     */

    const claims =
        scoredSentences
            .slice(0, 5)
            .map(item => item.sentence);


    /*
     * If no suitable claims were found.
     */

    if (claims.length === 0) {

        const fallback =
            articleText.length > 180
                ? articleText.substring(0, 180) + "..."
                : articleText;


        addClaim(fallback);

        return;
    }


    /*
     * Display claims.
     */

    claims.forEach(
        (claim, index) => {

            addClaim(
                claim,
                index + 1
            );

        }
    );

}


/* =========================
   ADD CLAIM TO UI
========================= */

function addClaim(claim, number) {

    const claimItem =
        document.createElement("div");


    claimItem.className =
        "claim-item";


    const claimNumber =
        document.createElement("span");


    claimNumber.className =
        "claim-number";


    claimNumber.textContent =
        number || "•";


    const claimText =
        document.createElement("p");


    claimText.className =
        "claim-text";


    claimText.textContent =
        claim;


    claimItem.appendChild(
        claimNumber
    );


    claimItem.appendChild(
        claimText
    );


    claimsList.appendChild(
        claimItem
    );

}


/* =========================
   RESET
========================= */

resetButton.addEventListener("click", function () {

    newsText.value = "";

    characterCount.textContent =
        "0 characters";

    resultCard.classList.add("hidden");

    confidenceFill.style.width =
        "0%";

    claimsList.innerHTML = "";

    hideError();

    newsText.focus();

});


/* =========================
   ERROR FUNCTIONS
========================= */

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove("hidden");

}


function hideError() {

    errorMessage.classList.add("hidden");

}