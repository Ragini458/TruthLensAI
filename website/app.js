```javascript
const API_URL =
    "https://truthlensai-re6x.onrender.com/predict";

const HISTORY_KEY =
    "truthlens_analysis_history";

let analysisHistory = [];
let currentAnalysis = null;


/* =========================================
   ELEMENTS
========================================= */

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


/* =========================================
   LOAD HISTORY
========================================= */

try {

    const savedHistory =
        localStorage.getItem(
            HISTORY_KEY
        );

    if (savedHistory) {

        analysisHistory =
            JSON.parse(
                savedHistory
            );

    }

    if (!Array.isArray(analysisHistory)) {

        analysisHistory = [];

    }

} catch (error) {

    console.error(
        "History loading error:",
        error
    );

    analysisHistory = [];

}


/* =========================================
   CHARACTER COUNT
========================================= */

if (newsText) {

    newsText.addEventListener(
        "input",
        function () {

            if (characterCount) {

                characterCount.textContent =
                    newsText.value.length +
                    " characters";

            }

            if (errorMessage) {

                errorMessage.textContent =
                    "";

            }

        }
    );

}


/* =========================================
   ANALYZE BUTTON
========================================= */

if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        analyzeArticle
    );

}


/* =========================================
   ANALYZE ARTICLE
========================================= */

async function analyzeArticle() {

    if (!newsText) {

        return;

    }

    const articleText =
        newsText.value.trim();


    if (!articleText) {

        showError(
            "Please paste a news article first."
        );

        newsText.focus();

        return;

    }


    if (articleText.length < 30) {

        showError(
            "Please enter a longer article for better analysis."
        );

        newsText.focus();

        return;

    }


    clearError();


    if (analyzeButton) {

        analyzeButton.disabled = true;

    }


    if (loading) {

        loading.style.display =
            "block";

    }


    if (resultCard) {

        resultCard.style.display =
            "none";

    }


    if (explanationSection) {

        explanationSection.style.display =
            "none";

    }


    if (claimsSection) {

        claimsSection.style.display =
            "none";

    }


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
                        text:
                            articleText
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "API response:",
            data
        );


        showResult(
            data,
            articleText
        );


    } catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        showError(
            "Unable to connect to the TruthLens AI server. Please try again."
        );


    } finally {

        if (analyzeButton) {

            analyzeButton.disabled =
                false;

        }


        if (loading) {

            loading.style.display =
                "none";

        }

    }

}


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    if (errorMessage) {

        errorMessage.textContent =
            message;

    }

}


/* =========================================
   CLEAR ERROR
========================================= */

function clearError() {

    if (errorMessage) {

        errorMessage.textContent =
            "";

    }

}


/* =========================================
   SHOW RESULT
========================================= */

function showResult(
    data,
    articleText
) {

    if (!resultCard) {

        return;

    }


    resultCard.style.display =
        "block";


    const confidence =
        Number(
            data.confidence
        ) || 0;


    const safeConfidence =
        Math.min(
            Math.max(
                confidence,
                0
            ),
            100
        );


    /* CONFIDENCE */

    if (confidenceText) {

        confidenceText.textContent =
            confidence.toFixed(2) +
            "%";

    }


    if (confidenceFill) {

        confidenceFill.style.width =
            safeConfidence +
            "%";

    }


    /* RESULT */

    const result =
        String(
            data.result || ""
        ).toUpperCase();


    if (result === "FAKE") {

        if (resultIcon) {

            resultIcon.textContent =
                "!";

        }


        if (resultText) {

            resultText.textContent =
                "FAKE";

        }


        if (explanationTitle) {

            explanationTitle.textContent =
                "Why the model flagged this";

        }


        if (explanationText) {

            explanationText.textContent =
                "The machine learning model found language patterns in this article that are associated with articles labeled as fake in its training data.";

        }


        if (verificationText) {

            verificationText.textContent =
                "Check the main claims against official sources, established news organizations, and other independent sources.";

        }

    } else {

        if (resultIcon) {

            resultIcon.textContent =
                "OK";

        }


        if (resultText) {

            resultText.textContent =
                "CREDIBLE";

        }


        if (explanationTitle) {

            explanationTitle.textContent =
                "Why the model classified this";

        }


        if (explanationText) {

            explanationText.textContent =
                "The machine learning model found language patterns in this article that are associated with articles labeled as credible in its training data.";

        }


        if (verificationText) {

            verificationText.textContent =
                "A credible prediction does not prove that every statement in the article is true. Important claims should still be verified using reliable sources.";

        }

    }


    if (explanationSection) {

        explanationSection.style.display =
            "block";

    }


    /* CONFIDENCE WARNING */

    if (warningMessage) {

        if (confidence < 60) {

            warningMessage.textContent =
                "Low-confidence prediction. The model is not strongly confident, so this result should be interpreted carefully.";

        } else if (confidence < 80) {

            warningMessage.textContent =
                "Moderate-confidence prediction. Consider checking the key claims before relying on this result.";

        } else {

            warningMessage.textContent =
                "Higher model confidence, but this prediction is not a guarantee of truth or falsehood.";

        }

    }


    /* SUMMARY */

    generateArticleSummary(
        articleText
    );


    /* RISK */

    generateRiskLevel(
        result,
        confidence
    );


    /* CLAIMS */

    generateKeyClaims(
        articleText
    );


    /* CURRENT ANALYSIS */

    currentAnalysis = {

        result:
            result || "UNKNOWN",

        confidence:
```
