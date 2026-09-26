const API_URL = "https://truthlensai-re6x.onrender.com/predict";

const HISTORY_KEY = "truthlens_analysis_history";

let analysisHistory = [];
let currentAnalysis = null;


/* =================================
   ELEMENTS
================================= */

const newsText = document.getElementById("newsText");
const characterCount = document.getElementById("characterCount");
const errorMessage = document.getElementById("errorMessage");
const analyzeButton = document.getElementById("analyzeButton");
const loading = document.getElementById("loading");

const resultCard = document.getElementById("resultCard");
const resultIcon = document.getElementById("resultIcon");
const resultText = document.getElementById("resultText");
const confidenceText = document.getElementById("confidenceText");
const confidenceFill = document.getElementById("confidenceFill");
const warningMessage = document.getElementById("warningMessage");

const resetButton = document.getElementById("resetButton");
const downloadReportButton =
    document.getElementById("downloadReportButton");

const explanationSection =
    document.getElementById("explanationSection");

const explanationTitle =
    document.getElementById("explanationTitle");

const explanationText =
    document.getElementById("explanationText");

const verificationText =
    document.getElementById("verificationText");

const claimsSection =
    document.getElementById("claimsSection");

const claimsList =
    document.getElementById("claimsList");

const historyList =
    document.getElementById("historyList");

const clearHistoryButton =
    document.getElementById("clearHistoryButton");


/* =================================
   LOAD HISTORY
================================= */

try {
    const savedHistory =
        localStorage.getItem(HISTORY_KEY);

    if (savedHistory) {
        analysisHistory =
            JSON.parse(savedHistory);
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


/* =================================
   CHARACTER COUNT
================================= */

if (newsText && characterCount) {

    newsText.addEventListener(
        "input",
        function () {

            characterCount.textContent =
                `${newsText.value.length} characters`;

            if (errorMessage) {
                errorMessage.textContent = "";
            }

        }
    );

}


/* =================================
   ANALYZE BUTTON
================================= */

if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        analyzeArticle
    );

}


/* =================================
   ANALYZE ARTICLE
================================= */

async function analyzeArticle() {

    if (!newsText) {
        return;
    }

    const articleText =
        newsText.value.trim();


    if (!articleText) {

        if (errorMessage) {
            errorMessage.textContent =
                "Please paste a news article first.";
        }

        newsText.focus();

        return;
    }


    if (articleText.length < 30) {

        if (errorMessage) {
            errorMessage.textContent =
                "Please enter a longer article for better analysis.";
        }

        newsText.focus();

        return;
    }


    if (errorMessage) {
        errorMessage.textContent = "";
    }


    if (analyzeButton) {
        analyzeButton.disabled = true;
    }


    if (loading) {
        loading.style.display = "block";
    }


    if (resultCard) {
        resultCard.style.display = "none";
    }


    if (explanationSection) {
        explanationSection.style.display = "none";
    }


    if (claimsSection) {
        claimsSection.style.display = "none";
    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        text: articleText
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
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


        if (errorMessage) {

            errorMessage.textContent =
                "Unable to connect to the TruthLens AI server. Please try again.";

        }


    } finally {

        if (analyzeButton) {
            analyzeButton.disabled = false;
        }

        if (loading) {
            loading.style.display = "none";
        }

    }

}


/* =================================
   SHOW RESULT
================================= */

function showResult(
    data,
    articleText
) {

    if (resultCard) {
        resultCard.style.display = "block";
    }


    const confidence =
        Number(data.confidence) || 0;


    if (confidenceText) {

        confidenceText.textContent =
            `${confidence.toFixed(2)}%`;

    }


    if (confidenceFill) {

        const safeConfidence =
            Math.min(
                Math.max(confidence, 0),
                100
            );

        confidenceFill.style.width =
            `${safeConfidence}%`;

    }


    /* RESULT */

    if (data.result === "FAKE") {

        if (resultIcon) {
            resultIcon.textContent = "!";
        }

        if (resultText) {
            resultText.textContent = "FAKE";
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
                "Check the main claims against official sources, established news organizations, and other independent sources before treating the information as reliable.";
        }

    } else {

        if (resultIcon) {
            resultIcon.textContent = "✓";
        }

        if (resultText) {
            resultText.textContent = "CREDIBLE";
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
        explanationSection.style.display = "block";
    }


    /* CONFIDENCE WARNING */

    if (warningMessage) {

        if (confidence < 60) {

            warningMessage.textContent =
                "⚠️ Low-confidence prediction. The model is not strongly confident, so this result should be interpreted carefully.";

        } else if (confidence < 80) {

            warningMessage.textContent =
                "⚠️ Moderate-confidence prediction. Consider checking the key claims before relying on this result.";

        } else {

            warningMessage.textContent =
                "ℹ️ Higher model confidence, but this prediction is not a guarantee of truth or falsehood.";

        }

    }


    /* SUMMARY */

    generateArticleSummary(articleText);


    /* RISK */

    generateRiskLevel(
        data.result,
        confidence
    );


    /* CLAIMS */

    generateKeyClaims(articleText);


    /* CURRENT ANALYSIS */

    currentAnalysis = {

        result:
            data.result || "UNKNOWN",

        confidence:
            confidence,

        article:
            articleText,

        summary:
            getArticleSummary(articleText),

        risk:
            getRiskLevel(confidence),

        claims:
            getKeyClaims(articleText),

        date:
            new Date().toLocaleString()

    };


    /* HISTORY */

    saveAnalysisToHistory(
        data,
        articleText,
        confidence
    );


    if (resultCard) {

        resultCard.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =================================
   ARTICLE SUMMARY
================================= */

function getArticleSummary(articleText) {

    const sentences =
        articleText
            .replace(/\s+/g, " ")
            .trim()
            .split(/(?<=[.!?])\s+/)
            .filter(
                sentence =>
                    sentence.length > 20
            );


    if (sentences.length === 0) {
        return articleText.substring(0, 250);
    }


    return sentences
        .slice(0, 2)
        .join(" ");

}


function generateArticleSummary(articleText) {

    const summary =
        getArticleSummary(articleText);


    if (!summary) {
        return;
    }


    createDynamicSection(
        "articleSummarySection",
        "📝",
        "ARTICLE SUMMARY",
        "Quick overview",
        summary,
        "summary"
    );

}


/* =================================
   RISK LEVEL
================================= */

function getRiskLevel(confidence) {

    if (confidence < 60) {
        return "HIGH UNCERTAINTY";
    }


    if (confidence < 80) {
        return "MEDIUM UNCERTAINTY";
    }


    return "LOWER UNCERTAINTY";

}


function generateRiskLevel(
    result,
    confidence
) {

    let level = "";
    let description = "";


    if (confidence < 60) {

        level = "HIGH UNCERTAINTY";

        description =
            "The model has limited confidence in this prediction. The article should be verified carefully before relying on it.";

    } else if (confidence < 80) {

        level = "MEDIUM UNCERTAINTY";

        description =
            "The model shows moderate confidence. Checking the important claims is recommended.";

    } else {

        level = "LOWER UNCERTAINTY";

        description =
            "The model shows higher confidence, but the prediction is still not proof that the article is completely true or false.";

    }


    if (result === "FAKE") {

        description =
            "The model classified this article as potentially fake. " +
            description;

    } else {

        description =
            "The model classified this article as potentially credible. " +
            description;

    }


    createDynamicSection(
        "riskLevelSection",
        "🚦",
        "RISK LEVEL",
        level,
        description,
        "risk"
    );

}


/* =================================
   DYNAMIC SECTION
================================= */

function createDynamicSection(
    id,
    icon,
    label,
    title,
    description,
    type
) {

    const existingSection =
        document.getElementById(id);


    if (existingSection) {
        existingSection.remove();
    }


    const section =
        document.createElement("div");

    section.id = id;

    section.className =
        `dynamic-section ${type}-section`;


    const header =
        document.createElement("div");

    header.className =
        "dynamic-section-header";


    const iconElement =
        document.createElement("span");

    iconElement.className =
        "dynamic-section-icon";

    iconElement.textContent =
        icon;


    const labelElement =
        document.createElement("span");

    labelElement.className =
        "dynamic-section-label";

    labelElement.textContent =
        label;


    header.appendChild(
        iconElement
    );

    header.appendChild(
        labelElement
    );


    const titleElement =
        document.createElement("h3");

    titleElement.textContent =
        title;


    const descriptionElement =
        document.createElement("p");

    descriptionElement.textContent =
        description;


    section.appendChild(
        header
    );

    section.appendChild(
        titleElement
    );

    section.appendChild(
        descriptionElement
    );


    if (resultCard) {

        resultCard.appendChild(
            section
        );

    }

}


/* =================================
   KEY CLAIMS
================================= */

function getKeyClaims(articleText) {

    const sentences =
        articleText
            .replace(/\s+/g, " ")
            .trim()
            .split(/(?<=[.!?])\s+/)
            .filter(
                sentence =>
                    sentence.length > 30
            );


    return sentences.slice(0, 5);

}


function generateKeyClaims(articleText) {

    if (!claimsSection || !claimsList) {
        return;
    }


    const claims =
        getKeyClaims(articleText);


    claimsList.innerHTML = "";


    if (claims.length === 0) {

        claimsSection.style.display =
            "none";

        return;
    }


    claims.forEach(
        function (claim, index) {

            const item =
                document.createElement("li");

            item.className =
                "claim-item";


            const claimText =
                document.createElement("span");

            claimText.className =
                "claim-text";

            claimText.textContent =
                claim;


            const verifyButton =
                document.createElement("button");

            verifyButton.type =
                "button";

            verifyButton.className =
                "verify-claim-button";

            verifyButton.textContent =
                "🔎 Verify";


            verifyButton.addEventListener(
                "click",
                function () {

                    verifyClaim(claim);

                }
            );


            item.appendChild(
                claimText
            );

            item.appendChild(
                verifyButton
            );


            claimsList.appendChild(
                item
            );

        }
    );


    claimsSection.style.display =
        "block";

}


/* =================================
   VERIFY CLAIM
================================= */

function verifyClaim(claim) {

    const searchQuery =
        encodeURIComponent(
            claim
        );


    const googleURL =
        `https://www.google.com/search?q=${searchQuery}`;


    window.open(
        googleURL,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =================================
   SAVE HISTORY
================================= */

function saveAnalysisToHistory(
    data,
    articleText,
    confidence
) {

    const historyItem = {

        result:
            data.result || "UNKNOWN",

        confidence:
            confidence,

        article:
            articleText,

        summary:
            getArticleSummary(articleText),

        risk:
            getRiskLevel(confidence),

        date:
            new Date().toLocaleString()

    };


    analysisHistory.unshift(
        historyItem
    );


    analysisHistory =
        analysisHistory.slice(0, 10);


    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(
                analysisHistory
            )
        );

    } catch (error) {

        console.error(
            "History save error:",
            error
        );

    }


    renderHistory();

}


/* =================================
   RENDER HISTORY
================================= */

function renderHistory() {

    if (!historyList) {
        return;
    }


    historyList.innerHTML = "";


    if (analysisHistory.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No analysis history yet.";

        historyList.appendChild(
            emptyMessage
        );

        return;
    }


    analysisHistory.forEach(
        function (item, index) {

            const historyItem =
                document.createElement("div");

            historyItem.className =
                "history-item";


            const title =
                document.createElement("h4");

            title.textContent =
                `${index + 1}. ${item.result}`;


            const date =
                document.createElement("p");

            date.textContent =
                item.date || "";


            const confidence =
                document.createElement("p");

            confidence.textContent =
                `Confidence: ${Number(
                    item.confidence || 0
                ).toFixed(2)}%`;


            const article =
                document.createElement("p");

            article.textContent =
                truncateText(
                    item.article || "",
                    180
                );


            historyItem.appendChild(
                title
            );

            historyItem.appendChild(
                date
            );

            historyItem.appendChild(
                confidence
            );

            historyItem.appendChild(
                article
            );


            historyList.appendChild(
                historyItem
            );

        }
    );

}


/* =================================
   CLEAR HISTORY
================================= */

if (clearHistoryButton) {

    clearHistoryButton.addEventListener(
        "click",
        function () {

            analysisHistory = [];

            localStorage.removeItem(
                HISTORY_KEY
            );

            renderHistory();

        }
    );

}


/* =================================
   DOWNLOAD REPORT
================================= */

if (downloadReportButton) {

    downloadReportButton.addEventListener(
        "click",
        downloadAnalysisReport
    );

}


function downloadAnalysisReport() {

    if (!currentAnalysis) {

        alert(
            "Please analyze an article first."
        );

        return;
    }


    const report =
`
TRUTHLENS AI
ANALYSIS REPORT
==============================

Date:
${currentAnalysis.date}

RESULT:
${currentAnalysis.result}

MODEL CONFIDENCE:
${Number(
    currentAnalysis.confidence
).toFixed(2)}%

RISK LEVEL:
${currentAnalysis.risk}

ARTICLE SUMMARY:
${currentAnalysis.summary}

KEY CLAIMS:
${currentAnalysis.claims
    .map(
        (claim, index) =>
            `${index + 1}. ${claim}`
    )
    .join("\n")}

ORIGINAL ARTICLE:
${currentAnalysis.article}

==============================

This report was generated by TruthLens AI.

AI predictions can be incorrect.
Always verify important information
using reliable sources.
`;


    const blob =
        new Blob(
            [report],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "TruthLens_AI_Analysis_Report.txt";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =================================
   RESET
================================= */

if (resetButton) {

    resetButton.addEventListener(
        "click",
        resetAnalyzer
    );

}


function resetAnalyzer() {

    if (newsText) {
        newsText.value = "";
    }


    if (characterCount) {

        characterCount.textContent =
            "0 characters";

    }


    if (errorMessage) {
        errorMessage.textContent = "";
    }


    if (resultCard) {
        resultCard.style.display = "none";
    }


    if (explanationSection) {
        explanationSection.style.display = "none";
    }


    if (claimsSection) {
        claimsSection.style.display = "none";
    }


    const summarySection =
        document.getElementById(
            "articleSummarySection"
        );

    if (summarySection) {
        summarySection.remove();
    }


    const riskSection =
        document.getElementById(
            "riskLevelSection"
        );

    if (riskSection) {
        riskSection.remove();
    }


    currentAnalysis = null;


    if (newsText) {
        newsText.focus();
    }

}


/* =================================
   TEXT TRUNCATION
================================= */

function truncateText(
    text,
    maxLength
) {

    if (!text) {
        return "";
    }


    if (text.length <= maxLength) {
        return text;
    }


    return (
        text.substring(
            0,
            maxLength
        ) + "..."
    );

}


/* =================================
   INITIALIZE
================================= */

renderHistory();