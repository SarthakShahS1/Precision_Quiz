// ============================================
// 🎯 Precision Quiz - Main Application
// ============================================

console.log("🎯 Precision Quiz App Loading...");

const API_URL = "http://localhost:3001/api";

// Sample data for demo mode
const APP_DATA = {
    documents: [
        { id: "ml", name: "Machine Learning.pdf", type: "PDF", topic: "machine_learning", size: "2.4MB", icon: "🤖" },
        { id: "web", name: "Web Development.docx", type: "DOCX", topic: "web_development", size: "1.8MB", icon: "🌐" },
        { id: "data", name: "Data Science.pdf", type: "PDF", topic: "data_science", size: "3.1MB", icon: "📊" }
    ],
    questions: {
        machine_learning: [
            { question: "What is supervised learning?", options: ["Unlabeled", "Learn from labeled data", "Reduce complexity", "Visualize"], correct: 1, explanation: "Supervised learning uses labeled training data." },
            { question: "Best classification?", options: ["K-means", "PCA", "Random Forest", "Linear"], correct: 2, explanation: "Random Forest combines decision trees." },
            { question: "What is overfitting?", options: ["Too data", "Good train, bad new", "Resources", "Features"], correct: 1, explanation: "Model memorizes training data." },
            { question: "Cross-validation?", options: ["Size", "Evaluate unseen", "Speed", "Memory"], correct: 1, explanation: "Evaluates on unseen data." },
            { question: "Imbalanced metric?", options: ["Accuracy", "F1-score", "MSE", "R2"], correct: 1, explanation: "F1-score balances precision/recall." },
            { question: "Ensemble?", options: ["Single", "Multiple", "Sequential", "Deep"], correct: 1, explanation: "Combines multiple models." },
            { question: "Bias-variance?", options: ["Speed", "Underfit/overfit", "Train/test", "Supervised"], correct: 1, explanation: "Balances model complexity." },
            { question: "Prevent overfit?", options: ["Add", "Complex", "Regularization", "Data"], correct: 2, explanation: "Regularization constrains model." },
            { question: "Supervised vs unsupervised?", options: ["Labeled/unlabeled", "Faster", "More data", "None"], correct: 0, explanation: "Supervised uses labeled data." },
            { question: "ReLU activation?", options: ["Sigmoid", "Linear", "ReLU", "Step"], correct: 2, explanation: "ReLU prevents vanishing gradients." }
        ],
        web_development: [
            { question: "HTML means?", options: ["High Tech", "HyperText Markup", "Home Tool", "Hyperlink"], correct: 1, explanation: "Standard markup language." },
            { question: "CSS color?", options: ["font-color", "text-color", "color", "background"], correct: 2, explanation: "color property sets text." },
            { question: "JavaScript?", options: ["Style", "Structure", "Interactivity", "Databases"], correct: 2, explanation: "Client-side scripting." },
            { question: "HTTP retrieve?", options: ["POST", "GET", "PUT", "DELETE"], correct: 1, explanation: "GET retrieves data." },
            { question: "CSS stands?", options: ["Computer", "Creative", "Cascading Style Sheets", "Colorful"], correct: 2, explanation: "Styling markup language." }
        ],
        data_science: [
            { question: "Preprocessing?", options: ["Size", "Clean data", "Visualize", "Deploy"], correct: 1, explanation: "Cleans raw data." },
            { question: "Python?", options: ["NumPy", "Pandas", "Matplotlib", "Scikit"], correct: 1, explanation: "Data manipulation." },
            { question: "EDA?", options: ["Electronic", "Exploratory Data Analysis", "Extended", "Experimental"], correct: 1, explanation: "Analyzes datasets." },
            { question: "Correlation?", options: ["Bar", "Pie", "Scatter", "Histogram"], correct: 2, explanation: "Shows relationships." },
            { question: "Feature eng?", options: ["Reduce", "Improve", "Visualize", "Clean"], correct: 1, explanation: "Creates better features." }
        ]
    }
};

// Application state
const state = {
    currentStep: "upload",
    selectedDocument: null,
    questionCount: 5,
    difficulty: "medium",
    quizQuestions: [],
    currentQuestionIndex: 0,
    answers: [],
    startTime: null,
    timerInterval: null,
    score: null
};

// ============================================
// 📄 Document Upload & Selection
// ============================================

function renderSamples() {
    console.log("📄 Rendering sample documents...");
    const html = APP_DATA.documents.map(d => `
        <div class="sample-card" data-doc-id="${d.id}">
            <div class="icon">${d.icon}</div>
            <h3>${d.name}</h3>
            <p>${d.type} • ${d.size}</p>
        </div>
    `).join("");
    const samplesEl = document.getElementById("samples");
    if (samplesEl) {
        samplesEl.innerHTML = html;
        console.log("✅ Sample cards rendered:", APP_DATA.documents.length);
        
        // Add click event listeners to all sample cards
        samplesEl.querySelectorAll(".sample-card").forEach(card => {
            card.addEventListener("click", function() {
                const docId = this.getAttribute("data-doc-id");
                console.log("🖱️ Card clicked:", docId);
                selectDocument(docId);
            });
        });
        console.log("✅ Click listeners attached to sample cards");
    } else {
        console.error("❌ Samples element not found!");
    }
}

function setupFileUpload() {
    const drop = document.getElementById("upload-area");
    const input = document.getElementById("file-input");
    
    if (!drop || !input) {
        console.error("Upload area or file input not found!");
        return;
    }
    
    console.log("✅ File upload setup initialized");
    
    const onFiles = files => {
        if (!files?.length) return;
        const file = files[0];
        
        console.log("📁 File selected:", file.name);
        
        // Validate file type
        if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type) && 
            !/\.(pdf|docx)$/i.test(file.name)) {
            alert("Only PDF/DOCX files are allowed!");
            return;
        }
        
        // Validate file size (50MB max)
        if (file.size > 50000000) {
            alert("File size must be less than 50MB!");
            return;
        }
        
        // Store document info
        state.selectedDocument = {
            id: "uploaded",
            name: file.name,
            type: file.type.includes("pdf") ? "PDF" : "DOCX",
            topic: detectTopic(file.name),
            size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
            icon: "📄"
        };
        
        document.getElementById("doc-info").innerHTML = `
            <h4>✅ Uploaded</h4>
            <p>${state.selectedDocument.name}</p>
        `;
        
        showSection("configure-section");
        updateStep("configure");
    };
    
    // Click anywhere on upload area to trigger file browser
    drop.addEventListener("click", function(e) {
        console.log("🖱️ Upload area clicked!");
        e.preventDefault();
        e.stopPropagation();
        
        // Temporarily enable pointer events before clicking
        input.style.pointerEvents = 'auto';
        input.click();
        
        // Reset pointer events after a short delay
        setTimeout(() => {
            input.style.pointerEvents = 'none';
        }, 100);
    });
    
    // File input change event
    input.addEventListener("change", function(e) {
        console.log("📂 File input changed");
        onFiles(e.target.files);
        // Reset the input value so the same file can be selected again
        this.value = '';
    });
    
    // Drag & drop events
    ["dragenter", "dragover"].forEach(evt => {
        drop.addEventListener(evt, function(e) {
            e.preventDefault();
            e.stopPropagation();
            drop.classList.add("drag-over");
        });
    });
    
    ["dragleave", "drop"].forEach(evt => {
        drop.addEventListener(evt, function(e) {
            e.preventDefault();
            e.stopPropagation();
            drop.classList.remove("drag-over");
        });
    });
    
    drop.addEventListener("drop", function(e) {
        console.log("📥 File dropped");
        onFiles(e.dataTransfer.files);
    });
}

function detectTopic(name) {
    const s = name.toLowerCase();
    return /ml|machine|learning/.test(s) ? "machine_learning" :
           /web|html|css/.test(s) ? "web_development" :
           /data|science/.test(s) ? "data_science" : "machine_learning";
}

function selectDocument(id) {
    console.log("🖱️ selectDocument called with id:", id);
    const doc = APP_DATA.documents.find(d => d.id === id);
    if (!doc) {
        console.error("❌ Document not found:", id);
        return;
    }
    
    console.log("✅ Document selected:", doc.name);
    state.selectedDocument = doc;
    document.getElementById("doc-info").innerHTML = `
        <h4>✅ Selected</h4>
        <p>${doc.name}</p>
    `;
    
    showSection("configure-section");
    updateStep("configure");
}

// ============================================
// ⚙️ Configuration & Event Listeners
// ============================================

function setupEventListeners() {
    // Question count buttons
    document.querySelectorAll("#count-buttons .btn-opt").forEach(btn => 
        btn.addEventListener("click", () => {
            document.querySelectorAll("#count-buttons .btn-opt").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.questionCount = parseInt(btn.dataset.count);
        })
    );
    
    // Difficulty buttons
    document.querySelectorAll("#difficulty-buttons .btn-opt").forEach(btn => 
        btn.addEventListener("click", () => {
            document.querySelectorAll("#difficulty-buttons .btn-opt").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.difficulty = btn.dataset.difficulty;
        })
    );
    
    // Action buttons
    document.getElementById("generate-btn").addEventListener("click", generateQuiz);
    document.getElementById("prev-btn").addEventListener("click", prevQuestion);
    document.getElementById("next-btn").addEventListener("click", nextQuestion);
    document.getElementById("finish-btn").addEventListener("click", finishQuiz);
    document.getElementById("download-btn").addEventListener("click", downloadResults);
    document.getElementById("certificate-btn").addEventListener("click", downloadCertificate);
    document.getElementById("new-quiz-btn").addEventListener("click", resetQuiz);
}

// ============================================
// 🎯 Quiz Generation & Management
// ============================================

function generateQuiz() {
    if (!state.selectedDocument) return;
    
    let questions = APP_DATA.questions[state.selectedDocument.topic] || APP_DATA.questions.machine_learning;
    
    state.quizQuestions = questions.slice(0, state.questionCount);
    state.answers = new Array(state.quizQuestions.length).fill(null);
    state.currentQuestionIndex = 0;
    state.startTime = Date.now();
    
    startTimer();
    showSection("quiz-section");
    updateStep("quiz");
    renderQuestion();
    updateProgress();
}

function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    
    state.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        document.getElementById("timer").textContent = `⏱️ ${m}:${s.toString().padStart(2, "0")}`;
    }, 1000);
}

function renderQuestion() {
    const q = state.quizQuestions[state.currentQuestionIndex];
    const saved = state.answers[state.currentQuestionIndex];
    
    document.getElementById("quiz-content").innerHTML = `
        <div class="quiz-question">
            <h3>Q${state.currentQuestionIndex + 1}: ${q.question}</h3>
            <div class="quiz-options" id="quiz-options-container">
                ${q.options.map((opt, idx) => `
                    <div class="quiz-option ${saved === idx ? "selected" : ""}" 
                         data-option-index="${idx}">
                        ${String.fromCharCode(65 + idx)}. ${opt}
                    </div>
                `).join("")}
            </div>
        </div>
    `;
    
    // Add click listeners to quiz options
    const optionsContainer = document.getElementById("quiz-options-container");
    if (optionsContainer) {
        optionsContainer.querySelectorAll(".quiz-option").forEach(option => {
            option.addEventListener("click", function() {
                const idx = parseInt(this.getAttribute("data-option-index"));
                selectAnswer(idx);
            });
        });
    }
    
    updateNav();
}

function selectAnswer(idx) {
    state.answers[state.currentQuestionIndex] = idx;
    
    document.querySelectorAll(".quiz-option").forEach((el, i) => {
        if (i === idx) {
            el.classList.add("selected");
        } else {
            el.classList.remove("selected");
        }
    });
}

function updateNav() {
    const isFirst = state.currentQuestionIndex === 0;
    const isLast = state.currentQuestionIndex === state.quizQuestions.length - 1;
    
    if (isFirst) {
        document.getElementById("prev-btn").classList.add("hidden");
    } else {
        document.getElementById("prev-btn").classList.remove("hidden");
    }
    
    if (isLast) {
        document.getElementById("next-btn").classList.add("hidden");
        document.getElementById("finish-btn").classList.remove("hidden");
    } else {
        document.getElementById("next-btn").classList.remove("hidden");
        document.getElementById("finish-btn").classList.add("hidden");
    }
}

function updateProgress() {
    const curr = state.currentQuestionIndex + 1;
    const total = state.quizQuestions.length;
    const pct = Math.round((curr / total) * 100);
    
    document.getElementById("question-num").textContent = `Q ${curr} of ${total}`;
    document.getElementById("progress-pct").textContent = `${pct}%`;
    document.getElementById("progress-fill").style.width = `${pct}%`;
}

function prevQuestion() {
    if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
        renderQuestion();
        updateProgress();
    }
}

function nextQuestion() {
    if (state.currentQuestionIndex < state.quizQuestions.length - 1) {
        state.currentQuestionIndex++;
        renderQuestion();
        updateProgress();
    }
}

// ============================================
// 📊 Results & Scoring
// ============================================

function finishQuiz() {
    clearInterval(state.timerInterval);
    
    let correct = 0;
    const results = [];
    
    state.quizQuestions.forEach((q, i) => {
        const ans = state.answers[i];
        const ok = ans === q.correct;
        
        if (ok) correct++;
        
        results.push({
            question: q.question,
            options: q.options,
            userAnswer: ans,
            correct: q.correct,
            isCorrect: ok,
            explanation: q.explanation
        });
    });
    
    const total = state.quizQuestions.length;
    const pct = Math.round((correct / total) * 100);
    
    state.score = { correct, total, pct, results };
    
    // Render score summary
    document.getElementById("score-summary").innerHTML = `
        <div class="score-display">${correct}/${total}</div>
        <div class="score-percent">${pct}%</div>
        <div class="performance-msg">${getMsg(pct)}</div>
    `;
    
    // Render detailed results
    document.getElementById("results-details").innerHTML = results.map((r, i) => `
        <div class="result-item ${r.isCorrect ? "correct" : "incorrect"}">
            <h4>${r.isCorrect ? "✅" : "❌"} Q${i + 1}</h4>
            <p>Q: ${r.question}</p>
            <p>You: ${r.userAnswer !== null ? r.options[r.userAnswer] : "N/A"}</p>
            <p>✓: ${r.options[r.correct]}</p>
            <p>Exp: ${r.explanation}</p>
        </div>
    `).join("");
    
    document.getElementById("certificate-btn").disabled = pct < 70;
    
    showSection("results-section");
    updateStep("results");
}

function getMsg(pct) {
    return pct >= 90 ? "🏆 Exceptional!" :
           pct >= 80 ? "🎉 Excellent!" :
           pct >= 70 ? "✅ Good!" :
           pct >= 60 ? "👍 Satisfactory" : "📚 Study!";
}

// ============================================
// 📥 Download Functions
// ============================================

function downloadResults() {
    if (!state.score) return;
    
    const { correct: c, total: t, pct: p, results: r } = state.score;
    
    let txt = `RESULTS\n${"=".repeat(40)}\nScore: ${c}/${t} (${p}%)\n\n`;
    txt += r.map((x, i) => `Q${i + 1}: ${x.question}\nYou: ${x.userAnswer !== null ? x.options[x.userAnswer] : "N/A"}\nCorrect: ${x.options[x.correct]}\nExp: ${x.explanation}`).join("\n\n");
    
    download(txt, "quiz-results.txt");
}

function downloadCertificate() {
    if (!state.score || state.score.pct < 70) {
        return void alert("Need 70%+");
    }
    
    let cert = `\n🏆 ACHIEVEMENT\n${"=".repeat(40)}\n\n`;
    cert += `Score: ${state.score.correct}/${state.score.total} (${state.score.pct}%)\n`;
    cert += `Date: ${new Date().toLocaleDateString()}\n\n🎉 Congratulations!`;
    
    download(cert, "certificate.txt");
}

function download(content, name) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================
// 🔄 Navigation & State Management
// ============================================

function resetQuiz() {
    clearInterval(state.timerInterval);
    state.currentStep = "upload";
    state.selectedDocument = null;
    state.questionCount = 5;
    state.difficulty = "medium";
    state.quizQuestions = [];
    state.currentQuestionIndex = 0;
    state.answers = [];
    state.startTime = null;
    showSection("upload-section");
    updateStep("upload");
}

function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function updateStep(step) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.querySelector(`[data-step="${step}"]`)?.classList.add("active");
    state.currentStep = step;
}

// ============================================
// 🎨 Theme Management
// ============================================

function setupTheme() {
    const btn = document.getElementById("theme-toggle");
    
    try {
        const saved = localStorage.getItem("theme") || "light";
        document.body.className = `theme-${saved}`;
        btn.textContent = saved === "dark" ? "☀️" : "🌙";
        
        btn.addEventListener("click", () => {
            const dark = document.body.classList.contains("theme-dark");
            const theme = dark ? "light" : "dark";
            document.body.className = `theme-${theme}`;
            btn.textContent = theme === "dark" ? "☀️" : "🌙";
            localStorage.setItem("theme", theme);
        });
    } catch (e) {
        console.log("localStorage unavailable");
    }
}

// ============================================
// 🚀 Initialize Application
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM Content Loaded - Initializing app...");
    renderSamples();
    setupFileUpload();
    setupEventListeners();
    setupTheme();
    console.log("✅ App fully initialized!");
});

// Global functions for inline event handlers
window.selectDocument = selectDocument;
window.selectAnswer = selectAnswer;
window.prevQuestion = prevQuestion;
window.nextQuestion = nextQuestion;

console.log("✅ Global functions exposed:", {
    selectDocument: typeof window.selectDocument,
    selectAnswer: typeof window.selectAnswer
});
