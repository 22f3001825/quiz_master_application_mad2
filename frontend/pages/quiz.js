export default {
  template: `
  <div class="container-fluid py-4">
    <!-- Quiz Header with improved styling -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="mb-0 fw-bold">{{ quiz.name }}</h2>
            <small class="text-muted">Complete all questions before time expires</small>
          </div>
          <div class="text-center">
            <h3 class="mb-0" :class="getTimerClass">{{ formatTimeRemaining }}</h3>
            <small class="text-muted">Time Remaining</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body p-3">
        <div class="progress" style="height: 25px;">
          <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" 
               role="progressbar" 
               :style="{ width: progressPercentage + '%' }" 
               :aria-valuenow="progressPercentage" 
               aria-valuemin="0" 
               aria-valuemax="100">
            {{ progressPercentage }}% Complete
          </div>
        </div>
        <div class="d-flex justify-content-between mt-2">
          <small class="text-muted">{{ answeredCount }} of {{ quiz.questions.length }} questions answered</small>
          <small class="text-muted">{{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }} current</small>
        </div>
      </div>
    </div>

    <!-- Question Display with enhanced styling -->
    <div class="card shadow-sm mb-4" v-if="currentQuestion">
      <div class="card-header bg-light d-flex justify-content-between align-items-center py-3">
        <span class="badge bg-primary p-2">Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}</span>
        <span class="badge" :class="isAnswered(currentQuestion.id) ? 'bg-success' : 'bg-secondary'">
          {{ isAnswered(currentQuestion.id) ? 'Answered' : 'Not Answered' }}
        </span>
      </div>
      
      <div class="card-body">
        <h4 class="question-text mb-4 pb-2 border-bottom">{{ currentQuestion.question_statement }}</h4>
        
        <!-- Options with improved styling -->
        <div class="options-list">
          <div v-for="(option, index) in currentQuestion.options" :key="index" 
               class="form-check mb-3 p-3 border rounded" 
               :class="{'bg-light': userAnswers[currentQuestion.id] === (index + 1)}">
            <input class="form-check-input me-2" type="radio"
                   :name="'question' + currentQuestion.id"
                   :id="'option' + (index + 1)"
                   :value="index + 1"
                   v-model="userAnswers[currentQuestion.id]" 
                   :disabled="isTimeUp">
            <label class="form-check-label w-100" :for="'option' + (index + 1)">
              {{ option }}
            </label>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons with improved layout -->
      <div class="card-footer bg-white py-3">
        <div class="row align-items-center">
          <div class="col-4 text-start">
            <button class="btn btn-outline-primary" 
                   @click="previousQuestion"
                   :disabled="currentQuestionIndex === 0">
              <i class="bi bi-arrow-left me-1"></i> Previous
            </button>
          </div>
          
          <div class="col-4 text-center">
            <!-- Question navigation buttons with horizontal scrolling -->
            <div class="btn-group question-nav-container" role="group" style="overflow-x: auto; white-space: nowrap; display: block; max-width: 100%; padding: 5px 0;">
              <button v-for="(_, index) in quiz.questions" 
                      :key="index"
                      @click="goToQuestion(index)"
                      class="btn btn-sm me-1"
                      :class="getQuestionButtonClass(index)"
                      style="min-width: 35px; margin-bottom: 5px;">
                {{ index + 1 }}
              </button>
            </div>
          </div>
          
          <div class="col-4 text-end">
            <button class="btn btn-primary" 
                   @click="nextQuestion"
                   :disabled="currentQuestionIndex === quiz.questions.length - 1"
                   v-if="currentQuestionIndex < quiz.questions.length - 1">
              Next <i class="bi bi-arrow-right ms-1"></i>
            </button>
            <button class="btn btn-success" 
                   @click="confirmSubmit"
                   v-if="currentQuestionIndex === quiz.questions.length - 1">
              <i class="bi bi-check2-circle me-1"></i> Submit Quiz
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Submit Button -->
    <div class="card shadow-sm mb-4">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <span class="text-muted">You can also submit from here when ready</span>
        </div>
        <button class="btn btn-lg btn-success" 
                @click="confirmSubmit"
                :disabled="!canSubmit">
          <i class="bi bi-check2-circle me-1"></i> Submit Quiz
        </button>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div class="modal fade" id="submitConfirmModal" tabindex="-1" ref="submitModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Submission</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>You are about to submit your quiz. Please review the following:</p>
            <ul class="list-group mb-3">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Total Questions
                <span class="badge bg-primary rounded-pill">{{ quiz.questions.length }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Questions Answered
                <span class="badge bg-success rounded-pill">{{ answeredCount }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Questions Unanswered
                <span class="badge bg-danger rounded-pill">{{ quiz.questions.length - answeredCount }}</span>
              </li>
            </ul>
            <div class="alert alert-warning" v-if="quiz.questions.length - answeredCount > 0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              You have unanswered questions. Are you sure you want to submit?
            </div>
            <div class="alert alert-success" v-else>
              <i class="bi bi-check-circle me-2"></i>
              All questions have been answered. Ready to submit!
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary"  @click="submitModal.hide()">Cancel</button>
            <button type="button" class="btn btn-success" @click="submitQuiz">Confirm Submission</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,

  props: {
    quizId: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      quiz: {
        name: "",
        duration: {
          hours: 0,
          minutes: 0
        },
        questions: []
      },
      timeRemaining: 0,
      timer: null,
      startTime: null,
      endTime: null,
      isTimeUp: false,
      currentQuestionIndex: 0,
      userAnswers: {},
      quizStateKey: `quiz_state_${this.quizId}`, // Unique key for this quiz in localStorage
      submitModal: null
    };
  },

  computed: {
    formatTimeRemaining() {
      const hours = Math.floor(this.timeRemaining / 3600);
      const minutes = Math.floor((this.timeRemaining % 3600) / 60);
      const seconds = this.timeRemaining % 60;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    currentQuestion() {
      return this.quiz.questions[this.currentQuestionIndex] || {};
    },

    canSubmit() {
      return Object.keys(this.userAnswers).length > 0 && !this.isTimeUp;
    },

    // Progress tracking
    answeredCount() {
      return Object.keys(this.userAnswers).length;
    },

    progressPercentage() {
      if (!this.quiz.questions.length) return 0;
      return Math.round((this.answeredCount / this.quiz.questions.length) * 100);
    },

    getTimerClass() {
      if (this.timeRemaining <= 60) return 'text-danger fw-bold';
      if (this.timeRemaining <= 300) return 'text-warning fw-bold';
      return 'text-success';
    }
  },

  watch: {
    // Save state to localStorage whenever these values change
    userAnswers: {
      handler(newVal) {
        this.saveQuizState();
      },
      deep: true
    },
    currentQuestionIndex() {
      this.saveQuizState();
      this.$nextTick(() => {
        // Scroll current question button into view when question changes
        this.scrollToCurrentQuestionButton();
      });
    },
    timeRemaining() {
      this.saveQuizState();
    }
  },

  methods: {
    async fetchQuizData() {
      try {
        const res = await fetch(`${location.origin}/api/quizzes/${this.quizId}`, {
          headers: { "Authentication-Token": this.$store.state.auth_token }
        });
        if (res.ok) {
          const quizData = await res.json();
          this.quiz = quizData || { duration: { hours: 0, minutes: 0 }, questions: [] };
          await this.fetchQuizQuestions();

          // Check for existing quiz state after loading quiz data
          const savedState = this.loadQuizState();
          if (savedState) {
            // Restore saved state
            this.restoreQuizState(savedState);
          } else {
            // Initialize new timer if no saved state
            this.initializeTimer();
          }
        } else {
          console.error("Failed to fetch quiz data:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    },

    async fetchQuizQuestions() {
      try {
        const res = await fetch(`${location.origin}/api/quizzes/${this.quizId}/questions`, {
          headers: { "Authentication-Token": this.$store.state.auth_token }
        });
        if (res.ok) {
          const questions = await res.json();
          this.quiz.questions = questions || [];
          // Add small delay before scrolling to ensure DOM is updated
          this.$nextTick(() => {
            this.scrollToCurrentQuestionButton();
          });
        } else {
          console.error("Failed to fetch quiz questions:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
      }
    },

    initializeTimer() {
      if (!this.quiz.duration) {
        console.error("Quiz duration is undefined");
        return;
      }

      this.startTime = new Date();
      this.endTime = new Date(this.startTime);
      this.endTime.setHours(this.endTime.getHours() + (this.quiz.duration.hours || 0));
      this.endTime.setMinutes(this.endTime.getMinutes() + (this.quiz.duration.minutes || 0));
      this.timeRemaining = Math.floor((this.endTime - this.startTime) / 1000);
      this.startTimer();
    },

    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        } else {
          this.handleTimeUp();
        }
      }, 1000);
    },

    handleTimeUp() {
      clearInterval(this.timer);
      this.isTimeUp = true;
      this.saveQuizState(); // Save final state

      // Alert the user that time is up and then submit
      alert("Time's up! Your quiz will be automatically submitted.");
      this.submitQuiz();
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },

    goToQuestion(index) {
      if (index >= 0 && index < this.quiz.questions.length) {
        this.currentQuestionIndex = index;
      }
    },

    isAnswered(questionId) {
      return this.userAnswers[questionId] !== undefined;
    },

    getQuestionButtonClass(index) {
      // Current question
      if (index === this.currentQuestionIndex) {
        return 'btn-primary';
      }

      // Check if the question at this index is answered
      const questionId = this.quiz.questions[index]?.id;
      if (questionId && this.userAnswers[questionId]) {
        return 'btn-success';
      }

      return 'btn-outline-secondary';
    },

    // New method to scroll the current question button into view
    scrollToCurrentQuestionButton() {
      // Find the question navigation container
      const container = document.querySelector('.question-nav-container');
      if (!container) return;

      // Find the active button
      const activeButton = container.querySelector('.btn-primary');
      if (activeButton) {
        // Scroll the active button into view with some offset
        container.scrollLeft = activeButton.offsetLeft - container.offsetWidth / 2 + activeButton.offsetWidth / 2;
      }
    },

    confirmSubmit() {
      // Show the confirmation modal using Bootstrap
      if (this.submitModal) {
        this.submitModal.show();
      }
    },

    async submitQuiz() {
      // Hide the modal
      if (this.submitModal) {
        this.submitModal.hide();
      }

      // Clear saved state since quiz is being submitted
      localStorage.removeItem(this.quizStateKey);

      try {
        console.log("Submitting quiz with answers:", this.userAnswers);

        const res = await fetch(`${location.origin}/api/quizzes/${this.quizId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token
          },
          body: JSON.stringify({
            answers: this.userAnswers,
            time_taken_seconds: this.quiz.duration.hours * 3600 + this.quiz.duration.minutes * 60 - this.timeRemaining
          })
        });

        if (res.ok) {
          const result = await res.json();
          console.log("Quiz submitted successfully:", result);

          // Redirect to quiz results page
          this.$router.push({
            name: 'quiz_results',
            params: { quizId: this.quiz.id }
          });
        } else {
          console.error("Failed to submit quiz:", res.statusText);
          alert(`Failed to submit quiz: ${res.statusText}`);
        }
      } catch (error) {
        console.error("Error submitting quiz:", error);
        alert(`Error submitting quiz: ${error.message}`);
      }
    },

    saveQuizState() {
      if (this.isTimeUp) return; // Don't save if time is up

      const quizState = {
        userAnswers: this.userAnswers,
        currentQuestionIndex: this.currentQuestionIndex,
        timeRemaining: this.timeRemaining,
        quizId: this.quizId,
        startTime: this.startTime ? this.startTime.toString() : null,
        endTime: this.endTime ? this.endTime.toString() : null,
        savedAt: new Date().toString()
      };

      localStorage.setItem(this.quizStateKey, JSON.stringify(quizState));
      console.log("Quiz state saved to localStorage");
    },

    // Load quiz state from localStorage
    loadQuizState() {
      const savedStateJSON = localStorage.getItem(this.quizStateKey);
      if (!savedStateJSON) return null;

      try {
        const savedState = JSON.parse(savedStateJSON);

        if (savedState.quizId !== this.quizId) {
          console.log("Saved quiz state is for a different quiz");
          return null;
        }

        const savedEndTime = new Date(savedState.endTime);
        const now = new Date();

        if (now > savedEndTime) {
          console.log("Quiz time has already expired");
          localStorage.removeItem(this.quizStateKey);
          return null;
        }

        return savedState;
      } catch (error) {
        console.error("Error parsing saved quiz state:", error);
        localStorage.removeItem(this.quizStateKey);
        return null;
      }
    },

    // Restore quiz state from saved data
    restoreQuizState(savedState) {
      console.log("Restoring quiz state from localStorage");

      this.userAnswers = savedState.userAnswers || {};
      this.currentQuestionIndex = savedState.currentQuestionIndex || 0;
      this.timeRemaining = savedState.timeRemaining || 0;

      if (savedState.endTime) {
        this.startTime = new Date(savedState.startTime);
        this.endTime = new Date(savedState.endTime);
        this.startTimer();
      } else {
        this.initializeTimer();
      }

      // Scroll to current question button after a small delay
      this.$nextTick(() => {
        this.scrollToCurrentQuestionButton();
      });
    }
  },

  async mounted() {
    await this.fetchQuizData();

    // Initialize Bootstrap modal
    if (window.bootstrap) {
      this.submitModal = new bootstrap.Modal(this.$refs.submitModal);
    }

    // Add beforeunload event to save state when user leaves/refreshes page
    window.addEventListener('beforeunload', () => {
      this.saveQuizState();
    });
  },

  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    // Remove event listener
    window.removeEventListener('beforeunload', () => {
      this.saveQuizState();
    });
  }
};