(function () {
  "use strict";

  const MAX_WORDS = JAPANESE_WORDS.length;

  let quizState = {
    words: [],
    count: 0,
    currentIndex: 0,
    correctCount: 0,
    type: "multiple",
    results: [],
  };

  let flashcardIndex = 0;

  const $ = (id) => document.getElementById(id);
  const pages = {
    home: $("page-home"),
    quiz: $("page-quiz"),
    flashcard: $("page-flashcard"),
    words: $("page-words"),
  };
  const screens = {
    quiz: $("quiz-screen"),
    result: $("result-screen"),
  };
  const wordCountInput = $("word-count");
  const wordCountValue = $("word-count-value");
  const quizTypeBtns = document.querySelectorAll(".quiz-type-btn");
  const startBtn = $("start-btn");
  const progressText = $("progress-text");
  const progressFill = $("progress-fill");
  const multipleQuiz = $("multiple-quiz");
  const subjectiveQuiz = $("subjective-quiz");
  const multipleQuestion = $("multiple-question");
  const multipleReading = $("multiple-reading");
  const multipleChoices = $("multiple-choices");
  const subjectiveQuestion = $("subjective-question");
  const subjectiveReading = $("subjective-reading");
  const subjectiveAnswer = $("subjective-answer");
  const subjectiveSubmit = $("subjective-submit");
  const feedback = $("feedback");
  const feedbackMessage = $("feedback-message");
  const nextBtn = $("next-btn");
  const scoreCount = $("score-count");
  const totalCount = $("total-count");
  const scorePercent = $("score-percent");
  const resultDetails = $("result-details");
  const retryBtn = $("retry-btn");
  const quizBackBtn = $("quiz-back-btn");
  const MAIL_API = "/api/send-contact";
  const mailBtn = $("mail-btn");
  const mailModal = $("mail-modal");
  const mailModalClose = $("mail-modal-close");
  const mailModalBackdrop = mailModal ? mailModal.querySelector(".modal-backdrop") : null;
  const mailForm = $("mail-form");
  const mailFormMessage = $("mail-form-message");
  const mailSubmit = $("mail-submit");

  function getPageFromHash() {
    const hash = (window.location.hash || "#home").slice(1);
    return pages[hash] ? hash : "home";
  }

  function showPage(pageId) {
    Object.keys(pages).forEach((key) => {
      if (pages[key]) pages[key].classList.toggle("active", key === pageId);
    });
    document.querySelectorAll(".nav-link").forEach((a) => {
      a.classList.toggle("active", (a.dataset.page || "") === pageId);
    });
    if (screens.quiz) screens.quiz.classList.remove("active");
    if (screens.result) screens.result.classList.remove("active");
  }

  function showQuizScreen() {
    Object.keys(pages).forEach((key) => {
      if (pages[key]) pages[key].classList.remove("active");
    });
    if (screens.quiz) screens.quiz.classList.add("active");
    if (screens.result) screens.result.classList.remove("active");
  }

  function showResultScreen() {
    if (screens.quiz) screens.quiz.classList.remove("active");
    if (screens.result) screens.result.classList.add("active");
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandomWords(count) {
    const n = Math.min(count, MAX_WORDS);
    return shuffle(JAPANESE_WORDS).slice(0, n);
  }

  function getWrongChoices(correctMeaning, count) {
    const others = JAPANESE_WORDS.filter((w) => w.meaning !== correctMeaning);
    const shuffled = shuffle(others);
    return shuffled.slice(0, count).map((w) => w.meaning);
  }

  function normalizeAnswer(s) {
    return String(s)
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function isAnswerCorrect(user, correct) {
    const u = normalizeAnswer(user);
    const c = normalizeAnswer(correct);
    if (u === c) return true;
    if (c.includes(",")) {
      return c.split(",").some((part) => normalizeAnswer(part) === u);
    }
    return false;
  }

  function startQuiz() {
    const count = parseInt(wordCountInput.value, 10);
    const type = document.querySelector(".quiz-type-btn.active").dataset.type;

    quizState.words = pickRandomWords(count);
    quizState.count = quizState.words.length;
    quizState.currentIndex = 0;
    quizState.correctCount = 0;
    quizState.type = type;
    quizState.results = [];

    showQuizScreen();
    subjectiveAnswer.value = "";
    feedback.classList.add("hidden");
    renderQuestion();
  }

  function renderQuestion() {
    const { words, currentIndex, count, type } = quizState;
    const current = words[currentIndex];

    progressText.textContent = `${currentIndex + 1} / ${count}`;
    progressFill.style.width = `${((currentIndex + 1) / count) * 100}%`;

    if (type === "multiple") {
      multipleQuiz.classList.remove("hidden");
      subjectiveQuiz.classList.add("hidden");
      multipleQuestion.textContent = current.ja;
      multipleReading.textContent = current.reading;

      const choices = getWrongChoices(current.meaning, 3);
      choices.push(current.meaning);
      const shuffledChoices = shuffle(choices);

      multipleChoices.innerHTML = shuffledChoices
        .map(
          (meaning) =>
            `<button type="button" class="choice-btn" data-meaning="${meaning.replace(/"/g, "&quot;")}">${meaning}</button>`
        )
        .join("");

      multipleChoices.querySelectorAll(".choice-btn").forEach((btn) => {
        btn.addEventListener("click", onMultipleChoice);
      });
    } else {
      multipleQuiz.classList.add("hidden");
      subjectiveQuiz.classList.remove("hidden");
      subjectiveQuestion.textContent = current.ja;
      subjectiveReading.textContent = current.reading;
      subjectiveAnswer.value = "";
      subjectiveAnswer.focus();
    }
  }

  function onMultipleChoice(e) {
    const btn = e.currentTarget;
    const meaning = btn.dataset.meaning;
    const current = quizState.words[quizState.currentIndex];
    const correct = meaning === current.meaning;

    quizState.results.push({
      word: current,
      correct,
      userAnswer: meaning,
    });
    if (correct) quizState.correctCount++;

    multipleChoices.querySelectorAll(".choice-btn").forEach((b) => {
      b.classList.add("disabled");
      if (b.dataset.meaning === current.meaning) b.classList.add("correct");
      if (b === btn && !correct) b.classList.add("wrong");
    });

    feedback.classList.remove("hidden");
    feedback.classList.remove("correct", "wrong");
    feedback.classList.add(correct ? "correct" : "wrong");
    feedbackMessage.textContent = correct ? "정답입니다!" : `틀렸습니다. 정답: ${current.meaning}`;
    nextBtn.focus();
  }

  function onSubmitSubjective() {
    const userAnswer = subjectiveAnswer.value.trim();
    if (!userAnswer) return;

    const current = quizState.words[quizState.currentIndex];
    const correct = isAnswerCorrect(userAnswer, current.meaning);

    quizState.results.push({
      word: current,
      correct,
      userAnswer: userAnswer,
    });
    if (correct) quizState.correctCount++;

    feedback.classList.remove("hidden");
    feedback.classList.remove("correct", "wrong");
    feedback.classList.add(correct ? "correct" : "wrong");
    feedbackMessage.textContent = correct
      ? "정답입니다!"
      : `틀렸습니다. 정답: ${current.meaning}`;
    subjectiveSubmit.disabled = true;
    subjectiveAnswer.disabled = true;
    nextBtn.focus();
  }

  function goNext() {
    quizState.currentIndex++;
    subjectiveSubmit.disabled = false;
    subjectiveAnswer.disabled = false;

    if (quizState.currentIndex >= quizState.count) {
      showResult();
      return;
    }

    feedback.classList.add("hidden");
    renderQuestion();
  }

  function showResult() {
    const { correctCount, count, results } = quizState;
    const percent = count ? Math.round((correctCount / count) * 100) : 0;

    scoreCount.textContent = correctCount;
    totalCount.textContent = count;
    scorePercent.textContent = percent + "%";

    resultDetails.innerHTML = results
      .map(
        (r) =>
          `<div class="result-item ${r.correct ? "correct" : "wrong"}">
            <span class="word">${r.word.ja}（${r.word.reading}）</span>
            <span class="meaning">${r.correct ? r.word.meaning : r.userAnswer + " → " + r.word.meaning}</span>
          </div>`
      )
      .join("");

    showResultScreen();
  }

  function goBackToQuizSetup() {
    showPage("quiz");
  }

  function renderFlashcard() {
    const w = JAPANESE_WORDS[flashcardIndex];
    if (!w) return;
    const fcEl = $("flashcard");
    const fcWord = $("fc-word");
    const fcReading = $("fc-reading");
    const fcMeaning = $("fc-meaning");
    const fcCounter = $("fc-counter");
    if (fcWord) fcWord.textContent = w.ja;
    if (fcReading) fcReading.textContent = w.reading;
    if (fcMeaning) fcMeaning.textContent = w.meaning;
    if (fcCounter) fcCounter.textContent = `${flashcardIndex + 1} / ${MAX_WORDS}`;
    if (fcEl) fcEl.classList.remove("flipped");
  }

  function initFlashcard() {
    flashcardIndex = 0;
    renderFlashcard();
  }

  function renderWordsList(filter) {
    const listEl = $("words-list");
    if (!listEl) return;
    const f = (filter || "").trim().toLowerCase();
    const items = f
      ? JAPANESE_WORDS.filter(
          (w) =>
            w.ja.toLowerCase().includes(f) ||
            w.reading.toLowerCase().includes(f) ||
            w.meaning.toLowerCase().includes(f)
        )
      : JAPANESE_WORDS;
    listEl.innerHTML = items
      .map(
        (w) =>
          `<div class="word-item">
            <span class="word-item-ja">${w.ja}</span>
            <span class="word-item-reading">${w.reading}</span>
            <span class="word-item-meaning">${w.meaning}</span>
          </div>`
      )
      .join("");
  }

  function openMailModal() {
    if (!mailModal) return;
    mailModal.classList.add("active");
    mailFormMessage.classList.add("hidden");
    mailFormMessage.textContent = "";
    const nameInput = $("contact-name");
    if (nameInput) nameInput.focus();
  }

  function closeMailModal() {
    if (mailModal) mailModal.classList.remove("active");
  }

  function showFormMessage(text, isError) {
    if (!mailFormMessage) return;
    mailFormMessage.textContent = text;
    mailFormMessage.classList.remove("hidden", "success", "error");
    mailFormMessage.classList.add(isError ? "error" : "success");
  }

  function onSubmitMail(e) {
    e.preventDefault();
    if (!mailForm) return;

    const name = (mailForm.querySelector('[name="name"]')?.value ?? "").trim();
    const phone = (mailForm.querySelector('[name="phone"]')?.value ?? "").trim();
    const age = (mailForm.querySelector('[name="age"]')?.value ?? "").trim();
    const email = (mailForm.querySelector('[name="email"]')?.value ?? "").trim();

    if (!name || !phone || !age || !email) {
      showFormMessage("모든 항목을 입력해 주세요.", true);
      return;
    }

    mailSubmit.disabled = true;
    showFormMessage("전송 중...", false);

    const apiUrl = (window.API_BASE_URL || "") + MAIL_API;
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, age, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showFormMessage("메일이 전송되었습니다.", false);
          mailForm.reset();
          setTimeout(closeMailModal, 1500);
        } else {
          showFormMessage(data.error || "전송에 실패했습니다.", true);
        }
      })
      .catch(() => {
        showFormMessage("서버에 연결할 수 없습니다.", true);
      })
      .finally(() => {
        mailSubmit.disabled = false;
      });
  }

  function bindEvents() {
    wordCountInput.addEventListener("input", () => {
      wordCountValue.textContent = wordCountInput.value;
    });

    quizTypeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        quizTypeBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    startBtn.addEventListener("click", startQuiz);

    nextBtn.addEventListener("click", goNext);

    subjectiveSubmit.addEventListener("click", onSubmitSubjective);
    subjectiveAnswer.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onSubmitSubjective();
    });

    retryBtn.addEventListener("click", () => {
      showPage("quiz");
    });

    if (quizBackBtn) quizBackBtn.addEventListener("click", goBackToQuizSetup);

    const fcEl = $("flashcard");
    const fcPrev = $("fc-prev");
    const fcNext = $("fc-next");
    if (fcEl) {
      fcEl.addEventListener("click", () => {
        fcEl.classList.toggle("flipped");
      });
    }
    if (fcPrev) {
      fcPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        flashcardIndex = flashcardIndex <= 0 ? MAX_WORDS - 1 : flashcardIndex - 1;
        renderFlashcard();
      });
    }
    if (fcNext) {
      fcNext.addEventListener("click", (e) => {
        e.stopPropagation();
        flashcardIndex = flashcardIndex >= MAX_WORDS - 1 ? 0 : flashcardIndex + 1;
        renderFlashcard();
      });
    }

    const wordsSearch = $("words-search");
    if (wordsSearch) {
      wordsSearch.addEventListener("input", () => renderWordsList(wordsSearch.value));
    }

    window.addEventListener("hashchange", onHashChange);

    if (mailBtn) mailBtn.addEventListener("click", openMailModal);
    if (mailModalClose) mailModalClose.addEventListener("click", closeMailModal);
    if (mailModalBackdrop) mailModalBackdrop.addEventListener("click", closeMailModal);
    if (mailForm) mailForm.addEventListener("submit", onSubmitMail);
  }

  function onHashChange() {
    const pageId = getPageFromHash();
    showPage(pageId);
    if (pageId === "flashcard") initFlashcard();
    if (pageId === "words") renderWordsList($("words-search")?.value || "");
  }

  function init() {
    wordCountValue.textContent = wordCountInput.value;
    bindEvents();
    const pageId = getPageFromHash();
    showPage(pageId);
    if (pageId === "flashcard") initFlashcard();
    if (pageId === "words") renderWordsList("");
  }

  init();
})();
