const API_URL = "https://truthlensai-re6x.onrender.com/predict";


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


/* =================================
   CHARACTER COUNT
================================= */

newsText.addEventListener("input", function () {

    characterCount.textContent =
        `${newsText.value.length} characters`;

    errorMessage.textContent = "";

});


/* =================================
   ANALYZE ARTICLE
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


    errorMessage.textContent = "";

    analyzeButton.disabled = true;

    loading.style.display = "block";

    resultCard.style.display = "none";

    explanationSection.style.display = "none";

    claimsSection.style.display = "none";


    try {

        const response = await fetch(
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


    analyzeButton.disabled = false;

    loading.style.display = "none";

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
        Number(data.confidence);


    confidenceText.textContent =
        `${confidence.toFixed(2)}%`;


    confidenceFill.style.width =
        `${Math.min(confidence, 100)}%`;


    /* ==============================
       RESULT TYPE
    =============================== */

    if (data.result === "FAKE") {

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


    /* ==============================
       CONFIDENCE WARNING
    =============================== */

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


    /* ==============================
       NEW FEATURES
    =============================== */

    generateArticleSummary(articleText);

    generateRiskLevel(
        data.result,
        confidence
    );


    /* ==============================
       KEY CLAIMS
    =============================== */

    generateKeyClaims(
        articleText
    );


    resultCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =================================
   ARTICLE SUMMARY
================================= */

function generateArticleSummary(
    articleText
) {

    const sentences =
        articleText
            .replace(/\s+/g, " ")
            .trim()
            .split(/(?<=[.!?])\s+/)
            .filter(sentence =>
                sentence.length > 20
            );


    if (sentences.length === 0) {
        return;
    }


    let summary = "";


    if (sentences.length <= 2) {

        summary =
            sentences.join(" ");

    } else {

        summary =
            sentences
                .slice(0, 2)
                .join(" ");

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
   DYNAMIC SECTION CREATOR
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


    const headingContainer =
        document.createElement("div");


    const labelElement =
        document.createElement("p");

    labelElement.className =
        "dynamic-section-label";

    labelElement.textContent =
        label;


    const titleElement =
        document.createElement("h4");

    titleElement.className =
        "dynamic-section-title";

    titleElement.textContent =
        title;


    headingContainer.appendChild(
        labelElement
    );

    headingContainer.appendChild(
        titleElement
    );


    header.appendChild(
        iconElement
    );

    header.appendChild(
        headingContainer
    );


    const descriptionElement =
        document.createElement("p");

    descriptionElement.className =
        "dynamic-section-description";

    descriptionElement.textContent =
        description;


    section.appendChild(
        header
    );

    section.appendChild(
        descriptionElement
    );


    resultCard.appendChild(
        section
    );

}


/* =================================
   GENERATE KEY CLAIMS
================================= */

function generateKeyClaims(
    articleText
) {

    claimsList.innerHTML = "";


    const cleanedText =
        articleText
            .replace(/\s+/g, " ")
            .trim();


    const sentences =
        cleanedText
            .split(/(?<=[.!?])\s+/)
            .map(sentence =>
                sentence.trim()
            )
            .filter(sentence =>
                sentence.length > 30
            );


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


    const scoredSentences =
        sentences.map(
            sentence => {

                let score = 0;

                const lowerSentence =
                    sentence.toLowerCase();


                if (sentence.length > 80) {
                    score += 2;
                }


                if (sentence.length > 140) {
                    score += 1;
                }


                claimWords.forEach(
                    word => {

                        if (
                            lowerSentence.includes(word)
                        ) {

                            score += 1;

                        }

                    }
                );


                return {
                    text: sentence,
                    score: score
                };

            }
        );


    const uniqueClaims = [];


    scoredSentences
        .sort(
            (a, b) =>
                b.score - a.score
        )
        .forEach(
            item => {

                const exists =
                    uniqueClaims.some(
                        claim =>
                            claim.toLowerCase() ===
                            item.text.toLowerCase()
                    );


                if (!exists) {

                    uniqueClaims.push(
                        item.text
                    );

                }

            }
        );


    const topClaims =
        uniqueClaims.slice(0, 5);


    if (topClaims.length === 0) {

        claimsList.innerHTML =
            "<p>No clear key claims were detected. Try submitting a longer article.</p>";

        claimsSection.style.display =
            "block";

        return;

    }


    topClaims.forEach(
        (claim, index) => {

            addClaim(
                claim,
                index + 1
            );

        }
    );


    claimsSection.style.display =
        "block";

}


/* =================================
   ADD CLAIM
================================= */

function addClaim(
    claim,
    number
) {

    const claimItem =
        document.createElement("div");

    claimItem.className =
        "claim-item";


    const claimNumber =
        document.createElement("div");

    claimNumber.className =
        "claim-number";

    claimNumber.textContent =
        number;


    const claimContent =
        document.createElement("div");

    claimContent.className =
        "claim-content";


    const claimText =
        document.createElement("p");

    claimText.className =
        "claim-text";

    claimText.textContent =
        claim;


    /* ==============================
       VERIFY BUTTON
    =============================== */

    const verifyButton =
        document.createElement("button");

    verifyButton.className =
        "verify-claim-button";

    verifyButton.type =
        "button";

    verifyButton.textContent =
        "🔎 Verify This Claim";


    verifyButton.addEventListener(
        "click",
        function () {

            verifyClaim(
                claim,
                verifyButton
            );

        }
    );


    claimContent.appendChild(
        claimText
    );

    claimContent.appendChild(
        verifyButton
    );


    claimItem.appendChild(
        claimNumber
    );

    claimItem.appendChild(
        claimContent
    );


    claimsList.appendChild(
        claimItem
    );

}


/* =================================
   VERIFY CLAIM
================================= */

function verifyClaim(
    claim,
    button
) {

    const searchQuery =
        `"${claim}" fact check`;


    const searchUrl =
        "https://www.google.com/search?q=" +
        encodeURIComponent(
            searchQuery
        );


    window.open(
        searchUrl,
        "_blank"
    );


    button.textContent =
        "✓ Search Opened";


    setTimeout(
        () => {

            button.textContent =
                "🔎 Verify This Claim";

        },
        2000
    );

}


/* =================================
   RESET
================================= */

resetButton.addEventListener(
    "click",
    resetAnalyzer
);


function resetAnalyzer() {

    newsText.value = "";

    characterCount.textContent =
        "0 characters";

    errorMessage.textContent =
        "";

    resultCard.style.display =
        "none";

    explanationSection.style.display =
        "none";

    claimsSection.style.display =
        "none";

    claimsList.innerHTML =
        "";

    confidenceFill.style.width =
        "0%";

    warningMessage.textContent =
        "";

    resultText.textContent =
        "";

    confidenceText.textContent =
        "";


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


    newsText.focus();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}