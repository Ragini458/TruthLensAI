const API_URL =
    "https://truthlensai-re6x.onrender.com/predict";


/* =================================
   ELEMENTS
================================= */

const newsText =
    document.getElementById("newsText");

const characterCount =
    document.getElementById("characterCount");

const errorMessage =
    document.getElementById("errorMessage");

const analyzeButton =
    document.getElementById("analyzeButton");

const loading =
    document.getElementById("loading");


const resultCard =
    document.getElementById("resultCard");

const resultIcon =
    document.getElementById("resultIcon");

const resultText =
    document.getElementById("resultText");

const confidenceText =
    document.getElementById("confidenceText");

const confidenceFill =
    document.getElementById("confidenceFill");

const warningMessage =
    document.getElementById("warningMessage");


const resetButton =
    document.getElementById("resetButton");

const downloadReportButton =
    document.getElementById(
        "downloadReportButton"
    );


const explanationSection =
    document.getElementById(
        "explanationSection"
    );

const explanationTitle =
    document.getElementById(
        "explanationTitle"
    );

const explanationText =
    document.getElementById(
        "explanationText"
    );

const verificationText =
    document.getElementById(
        "verificationText"
    );


const claimsSection =
    document.getElementById(
        "claimsSection"
    );

const claimsList =
    document.getElementById(
        "claimsList"
    );


const historyList =
    document.getElementById(
        "historyList"
    );

const clearHistoryButton =
    document.getElementById(
        "clearHistoryButton"
    );


/* =================================
   HISTORY
================================= */

const HISTORY_KEY =
    "truthlens_analysis_history";


let analysisHistory =
    JSON.parse(
        localStorage.getItem(
            HISTORY_KEY
        )
    ) || [];


/* =================================
   CURRENT ANALYSIS
================================= */

let currentAnalysis =
    null;


/* =================================
   CHARACTER COUNT
================================= */

newsText.addEventListener(
    "input",
    function () {

        characterCount.textContent =
            `${newsText.value.length} characters`;

        errorMessage.textContent =
            "";

    }
);


/* =================================
   ANALYZE
================================= */

analyzeButton.addEventListener(
    "click",
    analyzeArticle
);


async function analyzeArticle() {

    const articleText =
        newsText.value.trim();


    if (!articleText) {

        errorMessage.textContent =
            "Please paste a news article first.";

        newsText.focus();

        return;

    }


    if (articleText.length < 30) {

        errorMessage.textContent =
            "Please enter a longer article for better analysis.";

        newsText.focus();

        return;

    }


    errorMessage.textContent =
        "";

    analyzeButton.disabled =
        true;

    loading.style.display =
        "block";

    resultCard.style.display =
        "none";

    explanationSection.style.display =
        "none";

    claimsSection.style.display =
        "none";


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        text: articleText
                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Server error"
            );

        }


        const data =
            await response.json();


        showResult(
            data,
            articleText
        );


    } catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        errorMessage.textContent =
            "Unable to connect to the TruthLens AI server. Please try again.";

    }


    analyzeButton.disabled =
        false;

    loading.style.display =
        "none";

}


/* =================================
   SHOW RESULT
================================= */

function showResult(
    data,
    articleText
) {

    resultCard.style.display =
        "block";


    const confidence =
        Number(
            data.confidence
        );


    confidenceText.textContent =
        `${confidence.toFixed(2)}%`;


    confidenceFill.style.width =
        `${Math.min(
            confidence,
            100
        )}%`;


    /* RESULT */

    if (
        data.result === "FAKE"
    ) {

        resultIcon.textContent =
            "!";

        resultText.textContent =
            "FAKE";


        explanationSection.style.display =
            "block";


        explanationTitle.textContent =
            "Why the model flagged this";


        explanationText.textContent =
            "The machine learning model found language patterns in this article that are associated with articles labeled as fake in its training data.";


        verificationText.textContent =
            "Check the main claims against official sources, established news organizations, and other independent sources before treating the information as reliable.";

    } else {

        resultIcon.textContent =
            "✓";

        resultText.textContent =
            "CREDIBLE";


        explanationSection.style.display =
            "block";


        explanationTitle.textContent =
            "Why the model classified this";


        explanationText.textContent =
            "The machine learning model found language patterns in this article that are associated with articles labeled as credible in its training data.";


        verificationText.textContent =
            "A credible prediction does not prove that every statement in the article is true. Important claims should still be verified using reliable sources.";

    }


    /* CONFIDENCE */

    if (
        confidence < 60
    ) {

        warningMessage.textContent =
            "⚠️ Low-confidence prediction. The model is not strongly confident, so this result should be interpreted carefully.";

    } else if (
        confidence < 80
    ) {

        warningMessage.textContent =
            "⚠️ Moderate-confidence prediction. Consider checking the key claims before relying on this result.";

    } else {

        warningMessage.textContent =
            "ℹ️ Higher model confidence, but this prediction is not a guarantee of truth or falsehood.";

    }


    /* SUMMARY */

    generateArticleSummary(
        articleText
    );


    /* RISK */

    generateRiskLevel(
        data.result,
        confidence
    );


    /* CLAIMS */

    generateKeyClaims(
        articleText
    );


    /* CURRENT ANALYSIS */

    currentAnalysis = {

        result:
            data.result,

        confidence: