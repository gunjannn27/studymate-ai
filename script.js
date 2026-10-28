
"use strict";
// STUDYMATE AI - COMPLETE JAVASCRIPT
// Safely get an HTML element by its ID
function $(id) {
    return document.getElementById(id);
}
// Safely read data from browser storage
function getSavedData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data === null ? fallback : JSON.parse(data);
    } catch (error) {
        console.error("Error reading saved data:", key, error);
        return fallback;
    }
}
// Save data in browser storage
function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Error saving data:", key, error);
        alert("Unable to save data. Please check your browser storage.");
        return false;
    }
}
// Display messages safely
function showMessage(id, message, color) {
    const element = $(id);

    if (element) {
        element.textContent = message;
        element.style.color = color || "";
    }
}
// LOGIN AND SIGNUP
function showSignup() {
    $("loginForm").hidden = true;
    $("signupForm").hidden = false;

    showMessage("signupMessage", "");
}

function showLogin() {
    $("signupForm").hidden = true;
    $("loginForm").hidden = false;

    showMessage("loginMessage", "");
}

function openApplication(account) {
    $("authPage").hidden = true;
    $("appContent").hidden = false;

    const heading = document.querySelector("#dashboard h2");

    if (heading) {
        heading.textContent =
            "Welcome, " + account.name + "! 👋";
    }

    updateProgress();
    updatePendingCount();
    updateDashboardStats();
    updateDashboardExamCount();
}

function logout() {
    $("appContent").hidden = true;
    $("authPage").hidden = false;

    $("loginPassword").value = "";

    showMessage("loginMessage", "");
}

// SIGNUP FORM
$("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = $("signupName").value.trim();
    const email = $("signupEmail").value.trim().toLowerCase();
    const password = $("signupPassword").value;
    const confirmPassword = $("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        showMessage(
            "signupMessage",
            "Please fill in all the fields.",
            "red"
        );
        return;
    }

    if (password.length < 8) {
        showMessage(
            "signupMessage",
            "Password must contain at least 8 characters.",
            "red"
        );
        return;
    }

    if (password !== confirmPassword) {
        showMessage(
            "signupMessage",
            "Passwords do not match.",
            "red"
        );
        return;
    }

    const account = {
        name: name,
        email: email,
        password: password
    };

    if (!saveData("demoAccount", account)) {
        return;
    }

    showMessage(
        "signupMessage",
        "Account created successfully! Please log in.",
        "green"
    );

    $("loginEmail").value = email;
    $("loginPassword").value = "";

    $("signupForm").hidden = true;
    $("loginForm").hidden = false;
});

// LOGIN FORM
$("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;

    const account = getSavedData("demoAccount", null);

    if (
        !account ||
        email !== account.email ||
        password !== account.password
    ) {
        showMessage(
            "loginMessage",
            "Incorrect email or password. Please sign up first or check your details.",
            "red"
        );
        return;
    }

    showMessage("loginMessage", "");

    openApplication(account);
});

/* ==========================================
   SUBJECT-WISE ASSIGNMENT PROGRESS
========================================== */

const assignmentTasks = {
    dbms: {
        name: "DBMS Assignment",
        oldId: "status1",
        tasks: [
            "Complete Question 1",
            "Complete Question 2",
            "Draw the ER diagram",
            "Convert ER model to relational schema",
            "Review and submit assignment"
        ]
    },

    dataStructures: {
        name: "Data Structures",
        oldId: "status2",
        tasks: [
            "Complete Question 1",
            "Complete Question 2",
            "Write the algorithms",
            "Test the programs",
            "Review and submit assignment"
        ]
    },

    python: {
        name: "Python Practical",
        oldId: "status3",
        tasks: [
            "Complete Practical 1",
            "Complete Practical 2",
            "Complete Practical 3",
            "Test all programs",
            "Prepare practical record"
        ]
    }
};

// Use a fresh key so the old all-completed data does not
// automatically make every assignment show 100%.
const taskStorageKey = "subjectAssignmentTasksV3";

const defaultTaskProgress = {
    dbms: [true, true, false, false, false],
    dataStructures: [true, false, false, false, false],
    python: [true, true, true, false, false]
};

let subjectTaskProgress = getSavedData(taskStorageKey, null);

if (
    !subjectTaskProgress ||
    typeof subjectTaskProgress !== "object" ||
    Array.isArray(subjectTaskProgress)
) {
    subjectTaskProgress = JSON.parse(
        JSON.stringify(defaultTaskProgress)
    );

    saveData(taskStorageKey, subjectTaskProgress);
}

// Make sure every assignment has exactly five task statuses.
Object.keys(assignmentTasks).forEach(function(subject) {
    const saved = subjectTaskProgress[subject];
    const total = assignmentTasks[subject].tasks.length;

    if (!Array.isArray(saved)) {
        subjectTaskProgress[subject] =
            defaultTaskProgress[subject].slice();
    } else {
        subjectTaskProgress[subject] =
            Array.from({ length: total }, function(_, index) {
                return saved[index] === true;
            });
    }
});

saveData(taskStorageKey, subjectTaskProgress);

// Remember which task lists are expanded.
let expandedAssignments = {};

function getCompletedAssignments() {
    return Object.keys(assignmentTasks)
        .filter(function(subject) {
            return subjectTaskProgress[subject].every(Boolean);
        })
        .map(function(subject) {
            return assignmentTasks[subject].oldId;
        });
}

function saveAssignmentProgress() {
    return saveData(taskStorageKey, subjectTaskProgress);
}

// Keep compatibility with any existing HTML onclick handlers.
function completeAssignment(statusId) {
    const subject = Object.keys(assignmentTasks).find(
        function(key) {
            return assignmentTasks[key].oldId === statusId;
        }
    );

    if (!subject) {
        return;
    }

    const previousProgress = subjectTaskProgress[subject].slice();

    subjectTaskProgress[subject] =
        assignmentTasks[subject].tasks.map(function() {
            return true;
        });

    if (!saveAssignmentProgress()) {
        subjectTaskProgress[subject] = previousProgress;
        return;
    }

    renderAssignments();
}

function restoreCompletedAssignments() {
    renderAssignments();
}

function initializeAssignmentProgress() {
    renderAssignments();
}

function renderAssignments() {
    const container = $("assignmentProgressList");

    if (!container) {
        console.error(
            "Assignment container not found. Check index.html for assignmentProgressList."
        );
        return;
    }

    container.innerHTML = "";

    Object.keys(assignmentTasks).forEach(function(subject) {
        const assignment = assignmentTasks[subject];
        const statuses = subjectTaskProgress[subject];
        const total = assignment.tasks.length;
        const completed = statuses.filter(Boolean).length;
        const percentage = Math.round((completed / total) * 100);

        let statusText;

        if (completed === total) {
            statusText = "Completed ✓";
        } else if (completed === 0) {
            statusText = "Pending";
        } else {
            statusText = "In Progress";
        }

        const card = document.createElement("div");
        card.className = "card assignment-progress-card";

        // Heading and status
        const header = document.createElement("div");
        header.className = "assignment-card-header";

        const heading = document.createElement("h3");
        heading.textContent = assignment.name;

        const status = document.createElement("span");
        status.className = "assignment-status";
        status.textContent = statusText;

        header.appendChild(heading);
        header.appendChild(status);
        card.appendChild(header);

        // Task count and View Tasks button
        const summary = document.createElement("div");
        summary.className = "assignment-card-summary";

        const countText = document.createElement("p");
        countText.textContent =
            completed + "/" + total + " tasks completed";

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.className = "assignment-view-button";
        viewButton.textContent = expandedAssignments[subject]
            ? "Hide Tasks"
            : "View Tasks";

        viewButton.addEventListener("click", function() {
            expandedAssignments[subject] =
                !expandedAssignments[subject];

            renderAssignments();
        });

        summary.appendChild(countText);
        summary.appendChild(viewButton);
        card.appendChild(summary);

        // Assignment progress bar
        const progress = document.createElement("progress");
        progress.className = "assignment-progress-bar";
        progress.max = total;
        progress.value = completed;
        progress.setAttribute(
            "aria-label",
            assignment.name + " progress: " + percentage + "%"
        );

        card.appendChild(progress);

        const percentageText = document.createElement("p");
        percentageText.className = "assignment-percentage";
        percentageText.textContent = percentage + "% complete";
        card.appendChild(percentageText);

        // Display the five checkboxes only when expanded.
        if (expandedAssignments[subject]) {
            const taskList = document.createElement("div");
            taskList.className = "assignment-tasks";

            assignment.tasks.forEach(function(task, index) {
                const row = document.createElement("div");
                row.className = "assignment-task";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = subject + "-task-" + index;
                checkbox.checked = statuses[index];

                const label = document.createElement("label");
                label.htmlFor = checkbox.id;
                label.textContent = task;

                checkbox.addEventListener("change", function() {
                    const previousValue =
                        subjectTaskProgress[subject][index];

                    subjectTaskProgress[subject][index] =
                        checkbox.checked;

                    if (!saveAssignmentProgress()) {
                        subjectTaskProgress[subject][index] =
                            previousValue;

                        renderAssignments();
                        return;
                    }

                    renderAssignments();
                });

                row.appendChild(checkbox);
                row.appendChild(label);
                taskList.appendChild(row);
            });

            card.appendChild(taskList);
        }

        container.appendChild(card);
    });

    updateProgress();
    updatePendingCount();
    updateDashboardStats();
}

function updateProgress() {
    let totalTasks = 0;
    let completedTasks = 0;

    Object.keys(assignmentTasks).forEach(function(subject) {
        totalTasks += assignmentTasks[subject].tasks.length;

        completedTasks += subjectTaskProgress[subject]
            .filter(Boolean).length;
    });

    const completedSubjects = getCompletedAssignments().length;
    const percentage = totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    const completedElement = $("completedCount");
    const progressBar = $("progressBar");
    const progressText = $("progressText");

    if (completedElement) {
        completedElement.textContent = completedSubjects;
    }

    if (progressBar) {
        progressBar.style.width = percentage + "%";
    }

    if (progressText) {
        progressText.textContent =
            completedTasks + " of " + totalTasks +
            " tasks completed (" + percentage + "%)";
    }
}

function updatePendingCount() {
    const pending = Object.keys(assignmentTasks).filter(
        function(subject) {
            return !subjectTaskProgress[subject].every(Boolean);
        }
    ).length;

    const pendingElement = $("pendingCount");

    if (pendingElement) {
        pendingElement.textContent =
            pending + " pending assignment" +
            (pending === 1 ? "" : "s");
    }
}


// ==========================================
// EXAM PLANNER
// ==========================================

const examForm = $("examForm");
const examList = $("examList");

let exams = getSavedData("studyExams", []);

if (!Array.isArray(exams)) {
    exams = [];
}

function updateDashboardExamCount() {
    const countElement = $("dashboardExamCount");
    const reminderElement = $("examReminderSummary");
    const navBadge = $("examNavBadge");

    if (countElement) {
        countElement.textContent =
            exams.length + " exam" +
            (exams.length === 1 ? "" : "s") +
            " scheduled";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingSoon = exams.filter(function(exam) {
        if (!exam || !exam.date) {
            return false;
        }

        const examDay = new Date(exam.date + "T00:00:00");

        const daysLeft = Math.round(
            (examDay.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return daysLeft >= 0 && daysLeft <= 3;
    });

    if (navBadge) {
        navBadge.textContent = upcomingSoon.length;
        navBadge.hidden = upcomingSoon.length === 0;
    }

    if (reminderElement) {
        if (upcomingSoon.length === 0) {
            reminderElement.textContent =
                "No exams within the next 3 days.";
        } else {
            reminderElement.textContent =
                "🔔 Reminder: " + upcomingSoon.length +
                " exam" +
                (upcomingSoon.length === 1 ? "" : "s") +
                " within the next 3 days!";
        }
    }
}

function displayExams() {
    if (!examList) {
        return;
    }

    examList.innerHTML = "";

    exams.sort(function(a, b) {
        return a.date.localeCompare(b.date);
    });

    if (exams.length === 0) {
        examList.textContent = "No exams added yet.";
        updateDashboardExamCount();
        return;
    }

    exams.forEach(function(exam, index) {
        const card = document.createElement("div");
        card.className = "card";

        const title = document.createElement("h3");
        title.textContent = exam.name;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + exam.subject;

        const date = document.createElement("p");
        date.textContent = "Exam Date: " + exam.date;

        const countdown = document.createElement("p");

        const examDay = new Date(exam.date + "T00:00:00");
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const daysLeft = Math.round(
            (examDay.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysLeft > 0 && daysLeft <= 3) {
            countdown.textContent =
                "🔔 Your exam is in " + daysLeft +
                " day" + (daysLeft === 1 ? "" : "s") + "!";

            countdown.style.color = "#d97706";
        } else if (daysLeft > 3) {
            countdown.textContent =
                daysLeft + " days left until exam";
        } else if (daysLeft === 0) {
            countdown.textContent = "🔔 Your exam is today!";
            countdown.style.color = "#dc2626";
        } else {
            countdown.textContent = "⚠️ Exam date has passed";
            countdown.style.color = "#dc2626";
        }

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete Exam";

        deleteButton.addEventListener("click", function() {
            exams.splice(index, 1);

            if (saveData("studyExams", exams)) {
                displayExams();
            }
        });

        card.appendChild(title);
        card.appendChild(subject);
        card.appendChild(date);
        card.appendChild(countdown);
        card.appendChild(deleteButton);

        examList.appendChild(card);
    });

    updateDashboardExamCount();
}

if (examForm) {
    examForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = $("examName").value.trim();
        const subject = $("examSubject").value;
        const date = $("examDate").value;

        if (!name || !subject || !date) {
            alert("Please fill in all exam details.");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(date + "T00:00:00");

        if (selectedDate < today) {
            alert("Please select today or a future exam date.");
            return;
        }

        exams.push({
            name: name,
            subject: subject,
            date: date
        });

        if (!saveData("studyExams", exams)) {
            return;
        }

        examForm.reset();
        displayExams();
    });
}


// ==========================================
// STUDY TIMETABLE
// ==========================================

const timetableForm = $("timetableForm");
const timetableList = $("timetableList");

let studySessions = getSavedData("studySessions", []);

if (!Array.isArray(studySessions)) {
    studySessions = [];
}

function displayStudySessions() {
    if (!timetableList) {
        return;
    }

    timetableList.innerHTML = "";

    studySessions.sort(function(a, b) {
        return a.time.localeCompare(b.time);
    });

    if (studySessions.length === 0) {
        timetableList.textContent =
            "No study sessions added yet.";

        updateDashboardStats();
        return;
    }

    studySessions.forEach(function(session, index) {
        const card = document.createElement("div");
        card.className = "card";

        const heading = document.createElement("h3");
        heading.textContent = session.subject;

        const time = document.createElement("p");
        time.textContent = "Time: " + session.time;

        const duration = document.createElement("p");
        duration.textContent = "Duration: " + session.duration;

        const topic = document.createElement("p");
        topic.textContent = "Topic: " + session.topic;

        const status = document.createElement("p");

        status.textContent = session.completed
            ? "Status: Completed ✅"
            : "Status: Not completed";

        const completeButton = document.createElement("button");

        completeButton.type = "button";
        completeButton.textContent = session.completed
            ? "Mark as Not Completed"
            : "Mark as Completed";

        completeButton.addEventListener("click", function() {
            session.completed = !session.completed;

            if (saveData("studySessions", studySessions)) {
                displayStudySessions();
            }
        });

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete Session";

        deleteButton.addEventListener("click", function() {
            studySessions.splice(index, 1);

            if (saveData("studySessions", studySessions)) {
                displayStudySessions();
            }
        });

        card.appendChild(heading);
        card.appendChild(time);
        card.appendChild(duration);
        card.appendChild(topic);
        card.appendChild(status);
        card.appendChild(completeButton);
        card.appendChild(deleteButton);

        timetableList.appendChild(card);
    });

    updateDashboardStats();
}

if (timetableForm) {
    timetableForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const subject = $("studySubject").value;
        const time = $("studyTime").value;
        const duration = $("studyDuration").value;
        const topic = $("studyTopic").value.trim();

        if (!subject || !time || !duration || !topic) {
            alert("Please fill in all the fields.");
            return;
        }

        studySessions.push({
            subject: subject,
            time: time,
            duration: duration,
            topic: topic,
            completed: false
        });

        if (!saveData("studySessions", studySessions)) {
            studySessions.pop();
            return;
        }

        timetableForm.reset();
        displayStudySessions();
    });
}


// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function updateDashboardStats() {
    const sessionCount = $("dashboardSessionCount");

    if (sessionCount) {
        sessionCount.textContent =
            studySessions.length + " session" +
            (studySessions.length === 1 ? "" : "s");
    }

    const assignmentCount = $("dashboardCompletedAssignments");

    if (assignmentCount) {
        assignmentCount.textContent =
            getCompletedAssignments().length + " completed";
    }

    const completedSessions = studySessions.filter(function(session) {
        return session.completed;
    }).length;

    const completedSessionCount = $("dashboardCompletedSessions");

    if (completedSessionCount) {
        completedSessionCount.textContent =
            completedSessions + " completed";
    }
}


// ==========================================
// STUDY ASSISTANT
// ==========================================

function appendChatMessage(label, message, className) {
    const answerBox = $("studyAnswer");

    if (!answerBox) {
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = "chat-message " + className;

    const labelElement = document.createElement("strong");
    labelElement.textContent = label;

    const textElement = document.createElement("p");
    textElement.textContent = message;

    messageElement.appendChild(labelElement);
    messageElement.appendChild(textElement);

    answerBox.appendChild(messageElement);
    saveChatHistory();

    // Scroll to the latest message.
    answerBox.scrollTop = answerBox.scrollHeight;
    messageElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

function saveChatHistory() {
    const answerBox = document.getElementById("studyAnswer");

    if (!answerBox) {
        return;
    }

    localStorage.setItem(
        "studyMateChatHistory",
        answerBox.innerHTML
    );
}

function loadChatHistory() {
    const answerBox = document.getElementById("studyAnswer");

    if (!answerBox) {
        return;
    }

    const savedHistory = localStorage.getItem("studyMateChatHistory");

    if (savedHistory) {
        answerBox.innerHTML = savedHistory;
    }
}


function getStudyAdvice() {
    const questionInput = document.getElementById("studyQuestion");
    const answerBox = document.getElementById("studyAnswer");

   const originalQuestion = questionInput.value.trim();
   const question = originalQuestion.toLowerCase();

   if (question === "") {
    appendChatMessage(
        "StudyMate AI",
        "Please enter a question first!",
        "assistant-message"
    );
    return;
}
    let answer = "";

    if (/\b(hi|hello|hey)\b/.test(question)) {
        answer = "Hello! 👋 Welcome to StudyMate AI. Ask me about DBMS, Python, Data Structures, exams, or study planning.";
    }
    else if (question.includes("dbms") ||
             question.includes("database") ||
             question.includes("sql") ||
             question.includes("normalization")) {
        answer = "📚 DBMS Study Tips\n\n" +
            "1. Learn the difference between DBMS and RDBMS.\n" +
            "2. Understand primary keys, foreign keys, and relationships.\n" +
            "3. Practise SQL commands: SELECT, INSERT, UPDATE, and DELETE.\n" +
            "4. Study normalization: 1NF, 2NF, and 3NF.\n" +
            "5. Practise ER diagrams and relational schema questions.";
    }
    else if (question.includes("data structure") ||
             question.includes("dsa") ||
             question.includes("stack") ||
             question.includes("queue") ||
             question.includes("linked list") ||
             question.includes("tree") ||
             question.includes("sorting")) {
        answer = "💻 Data Structures Study Tips\n\n" +
            "1. Understand arrays and linked lists.\n" +
            "2. Practise stack and queue operations.\n" +
            "3. Learn searching and sorting algorithms.\n" +
            "4. Study trees and their traversals.\n" +
            "5. Solve small coding problems daily.";
    }
    else if (question.includes("python") ||
             question.includes("programming") ||
             question.includes("code")) {
        answer = "🐍 Python Study Tips\n\n" +
            "1. Practise variables and data types.\n" +
            "2. Learn if-else statements and loops.\n" +
            "3. Understand lists, tuples, sets, and dictionaries.\n" +
            "4. Practise functions and exception handling.\n" +
            "5. Write and run a small program every day.";
    }
    else if (question.includes("exam") ||
             question.includes("revision") ||
             question.includes("prepare")) {
        answer = "📝 Exam Preparation Plan\n\n" +
            "1. List all subjects and important topics.\n" +
            "2. Study difficult topics first.\n" +
            "3. Use your StudyMate AI Exam Planner to track exam dates.\n" +
            "4. Solve previous papers and practise questions.\n" +
            "5. Revise regularly and get enough sleep.";
    }
    else if (question.includes("timetable") ||
             question.includes("schedule") ||
             question.includes("time management") ||
             question.includes("study plan")) {
        answer = "⏰ Smart Study Plan\n\n" +
            "1. Set a clear goal for each session.\n" +
            "2. Study for 25 minutes, then take a 5-minute break.\n" +
            "3. Give extra time to difficult subjects.\n" +
            "4. Add your sessions to the StudyMate AI Timetable.\n" +
            "5. Review your progress at the end of the day.";
    }
    else if (question.includes("motivation") ||
             question.includes("lazy") ||
             question.includes("focus") ||
             question.includes("concentrate")) {
        answer = "🌟 Stay Motivated!\n\n" +
            "1. Start with one small, achievable task.\n" +
            "2. Keep your phone away while studying.\n" +
            "3. Take short breaks between sessions.\n" +
            "4. Track completed assignments to see your progress.\n" +
            "5. Remember: consistency matters more than perfection!";
    }
    else if (question.includes("thank")) {
        answer = "😊 You're welcome! Keep learning with StudyMate AI. Good luck with your studies!";
    }
    else {
        answer = "🤔 I don't have a specific answer for that question yet.\n\n" +
            "Try asking me about:\n" +
            "• DBMS, SQL, or normalization\n" +
            "• Data Structures and algorithms\n" +
            "• Python programming\n" +
            "• Exam preparation\n" +
            "• Study timetables and time management\n\n" +
            "I'm here to help you study!";
    }

   appendChatMessage(
    "You",
    originalQuestion,
    "user-message"
);

appendChatMessage(
    "StudyMate AI",
    answer,
    "assistant-message"
);

questionInput.value = "";
}
const clearChatButton = $("clearChatButton");

if (clearChatButton) {
    clearChatButton.addEventListener("click", function() {
        const answerBox = $("studyAnswer");

        if (answerBox) {
            answerBox.replaceChildren();
        }

        const questionInput = $("studyQuestion");

        if (questionInput) {
            questionInput.value = "";
        }
    });
}

// INITIALISE THE APPLICATION
displayExams();
displayStudySessions();
updateDashboardStats();
updateDashboardExamCount();
loadChatHistory();

// Initialize subject-wise assignment progress
initializeAssignmentProgress();

// Make functions available to HTML onclick handlers.
window.showSignup = showSignup;
window.showLogin = showLogin;
window.logout = logout;
window.completeAssignment = completeAssignment;
window.getStudyAdvice = getStudyAdvice;


const studyQuestionForm = document.getElementById("studyQuestionForm");

if (studyQuestionForm) {
    studyQuestionForm.addEventListener("submit", function(event) {
        event.preventDefault();
        getStudyAdvice();
    });
}

