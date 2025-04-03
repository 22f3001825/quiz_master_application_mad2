export default {
  template: `
  <div class="container-fluid py-4">
    <!-- Loading Spinner -->
    <div v-if="!dataLoaded" class="text-center py-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden"></span>
      </div>
      <p class="mt-3 text-muted">Loading your results...</p>
    </div>

    <!-- Results Display -->
    <div v-else class="quiz-results">
      <!-- Header Card -->
      <div class="card mb-4" style="border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div class="card-body text-center p-4">
          <h2 class="mb-3">{{ quiz.name }} Results</h2>
          
          <!-- Score Badge -->
          <div class="mb-4">
            <span class="badge rounded-pill px-4 py-2" 
                  :style="{
                    backgroundColor: getScoreColor(score.percentage),
                    color: '#fff',
                    fontSize: '1.2rem'
                  }">
              {{ score.percentage.toFixed(1) }}% Score
            </span>
            <span class="badge ms-2 rounded-pill px-3 py-2" 
                  :style="{
                    backgroundColor: score.passed ? '#28a745' : '#dc3545',
                    color: '#fff',
                    fontSize: '1.2rem'
                  }">
              {{ score.passed ? 'PASSED' : 'FAILED' }}
            </span>
          </div>
          
          <!-- Score Summary -->
          <div class="row justify-content-center mb-4">
            <div class="col-md-10">
              <div class="progress" style="height: 30px; border-radius: 15px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);">
                <div class="progress-bar" 
                  :style="{ 
                    width: score.percentage + '%', 
                    backgroundColor: getScoreColor(score.percentage),
                    transition: 'width 1s ease-in-out'
                  }"
                  role="progressbar">
                  <span style="font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">{{ score.percentage.toFixed(1) }}%</span>
                </div>
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small class="text-muted">0%</small>
                <small class="text-muted">Passing: {{ quiz.passing_percentage }}%</small>
                <small class="text-muted">100%</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="card h-100" style="border-radius: 10px; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 4px solid #28a745;">
            <div class="card-body text-center p-4">
              <div style="font-size: 2.5rem; color: #28a745; margin-bottom: 10px;">
                <i class="bi bi-check-circle"></i>
              </div>
              <h5 class="card-title" style="font-weight: 600; color: #343a40;">Correct Answers</h5>
              <div class="d-flex align-items-baseline justify-content-center">
                <span style="font-size: 2.5rem; font-weight: 700; color: #28a745;">{{ score.total_scored }}</span>
                <span class="text-muted ms-2">/ {{ score.total_questions }}</span>
              </div>
              <p class="text-muted mb-0">questions</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card h-100" style="border-radius: 10px; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 4px solid #007bff;">
            <div class="card-body text-center p-4">
              <div style="font-size: 2.5rem; color: #007bff; margin-bottom: 10px;">
                <i class="bi bi-clock-history"></i>
              </div>
              <h5 class="card-title" style="font-weight: 600; color: #343a40;">Time Taken</h5>
              <div style="font-size: 2.5rem; font-weight: 700; color: #007bff;">
                {{ formatTime(score.time_taken_seconds) }}
              </div>
              <p class="text-muted mb-0">minutes:seconds</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-4">
          <div class="card h-100" style="border-radius: 10px; border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 4px solid #6f42c1;">
            <div class="card-body text-center p-4">
              <div style="font-size: 2.5rem; color: #6f42c1; margin-bottom: 10px;">
                <i class="bi bi-graph-up"></i>
              </div>
              <h5 class="card-title" style="font-weight: 600; color: #343a40;">Performance</h5>
              <div style="font-size: 2.5rem; font-weight: 700; color: #6f42c1;">
                {{ getPerformanceLabel(score.percentage) }}
              </div>
              <p class="text-muted mb-0">{{ getPerformanceDescription(score.percentage) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="card mb-4" style="border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div class="card-header" style="background-color: #f8f9fa; border-radius: 10px 10px 0 0; border-bottom: 1px solid #eaecef; padding: 15px 20px;">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="mb-0" style="font-weight: 600; color: #343a40;">Question Summary</h4>
            <div>
              <button class="btn btn-sm" 
                      @click="setFilterType('correct')" 
                      :style="{
                        backgroundColor: filterType === 'correct' ? '#28a745' : '#6c757d',
                        color: '#fff',
                        borderRadius: '20px'
                      }">
                <i class="bi bi-check-circle me-1"></i> Correct Only
              </button>
              <button class="btn btn-sm ms-2" 
                      @click="setFilterType('incorrect')" 
                      :style="{
                        backgroundColor: filterType === 'incorrect' ? '#dc3545' : '#6c757d',
                        color: '#fff',
                        borderRadius: '20px'
                      }">
                <i class="bi bi-x-circle me-1"></i> Incorrect Only
              </button>
            </div>
          </div>
        </div>
        <div class="card-body p-4">
          <!-- Question Filters -->
          <div class="mb-4 text-center">
            <div class="btn-group" role="group">
              <button type="button" 
                      class="btn"
                      @click="setFilterType(null)"
                      :style="{
                        backgroundColor: filterType === null ? '#007bff' : '#f8f9fa',
                        color: filterType === null ? '#fff' : '#212529',
                        borderRadius: '20px 0 0 20px'
                      }">
                All ({{ questionResults.length }})
              </button>
              <button type="button" 
                      class="btn"
                      @click="setFilterType('correct')"
                      :style="{
                        backgroundColor: filterType === 'correct' ? '#28a745' : '#f8f9fa',
                        color: filterType === 'correct' ? '#fff' : '#212529',
                      }">
                Correct ({{ correctCount }})
              </button>
              <button type="button" 
                      class="btn"
                      @click="setFilterType('incorrect')"
                      :style="{
                        backgroundColor: filterType === 'incorrect' ? '#dc3545' : '#f8f9fa',
                        color: filterType === 'incorrect' ? '#fff' : '#212529',
                        borderRadius: '0 20px 20px 0'
                      }">
                Incorrect ({{ incorrectCount }})
              </button>
            </div>
          </div>

          <!-- Question Results Accordion -->
          <div class="accordion" id="questionAccordion">
            <div v-for="(question, index) in filteredQuestions" :key="question.question_id" 
                 class="accordion-item mb-3" 
                 style="border-radius: 8px; overflow: hidden; border: 1px solid #dee2e6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              
              <h2 class="accordion-header" :id="'heading' + index">
                <button class="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        :data-bs-target="'#collapse' + index" 
                        :aria-expanded="false" 
                        :aria-controls="'collapse' + index"
                        :style="{
                          backgroundColor: question.submitted_answer == question.correct_answer ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                          borderLeft: question.submitted_answer == question.correct_answer ? '4px solid #28a745' : '4px solid #dc3545',
                          padding: '15px',
                        }">
                  <div class="d-flex w-100 justify-content-between align-items-center">
                    <div style="font-weight: 500; color: #212529;">
                      <span class="badge me-2" 
                            :style="{
                              backgroundColor: question.submitted_answer == question.correct_answer ? '#28a745' : '#dc3545',
                              color: '#fff',
                              minWidth: '30px'
                            }">
                        {{ index + 1 }}
                      </span>
                      {{ truncateQuestion(question.question_statement) }}
                    </div>
                    <span class="badge rounded-pill" 
                          :style="{
                            backgroundColor: question.submitted_answer == question.correct_answer ? '#28a745' : '#dc3545',
                            color: '#fff',
                            fontSize: '0.8rem'
                          }">
                      {{ question.submitted_answer == question.correct_answer ? 'Correct' : 'Incorrect' }}
                    </span>
                  </div>
                </button>
              </h2>
              
              <div :id="'collapse' + index" class="accordion-collapse collapse" :aria-labelledby="'heading' + index" data-bs-parent="#questionAccordion">
                <div class="accordion-body p-4">
                  <h5 class="mb-3">{{ question.question_statement }}</h5>
                  
                  <div class="options-list">
                    <div v-for="(option, optIndex) in question.options" :key="optIndex"
                         class="p-3 mb-2"
                         :style="{
                           backgroundColor: getOptionBackground(question, optIndex + 1),
                           borderRadius: '8px',
                           border: '1px solid ' + getOptionBorder(question, optIndex + 1)
                         }">
                      <div class="d-flex align-items-center">
                        <div class="me-3"
                             :style="{
                               backgroundColor: getOptionIconBg(question, optIndex + 1),
                               color: '#fff',
                               width: '30px',
                               height: '30px',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               borderRadius: '50%',
                               fontWeight: 'bold'
                             }">
                          {{ String.fromCharCode(65 + optIndex) }}
                        </div>
                        <div>{{ option }}</div>
                        <div v-if="isOptionSelected(question, optIndex + 1)" class="ms-auto">
                          <i class="bi" 
                             :class="question.submitted_answer == question.correct_answer ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"
                             :style="{
                               color: question.submitted_answer == question.correct_answer ? '#28a745' : '#dc3545',
                               fontSize: '1.2rem'
                             }"></i>
                        </div>
                        <div v-else-if="isCorrectOption(question, optIndex + 1)" class="ms-auto">
                          <i class="bi bi-check-circle-fill" style="color: #28a745; fontSize: '1.2rem'"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="submitted-vs-correct mt-4">
                    <h6>Submitted Answer:</h6>
                    <p class="text-muted">{{ getOptionText(question, question.submitted_answer) || 'No answer submitted.' }}</p>
                    <h6>Correct Answer:</h6>
                    <p class="text-muted">{{ getOptionText(question, question.correct_answer) }}</p>
                  </div>

                  <div class="explanation mt-4 p-3" style="background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #17a2b8;">
                    <h6 style="color: #17a2b8;">Explanation:</h6>
                    <p class="mb-0">{{ question.explanation || 'No explanation provided.' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredQuestions.length === 0" class="text-center py-5">
            <div style="font-size: 3rem; color: #6c757d; opacity: 0.5;">
              <i class="bi bi-search"></i>
            </div>
            <h5 class="mt-3 text-muted">No questions match your filter</h5>
            <button @click="resetFilters" class="btn btn-outline-primary mt-3">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Question Results -->
      
           <h1 style="text-align: center; color: #333; margin-bottom: 30px; padding-bottom: 10px; border-bottom: 2px solid #ddd;">Response Sheet</h1>
    
          <div class="row g-3 justify-content-center mb-4" v-for="question in questionResults" :key="question.question_id">
            <div class="col-md-8">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">{{ question.question_statement }}</h5>
                  <ul class="list-group">
                    <li class="list-group-item" :class="{'list-group-item-success': question.submitted_answer == question.correct_answer, 'list-group-item-danger': question.submitted_answer != question.correct_answer}">
                      <strong>Your Answer:</strong> {{ getOptionText(question, question.submitted_answer) }}
                    </li>
                    <li class="list-group-item list-group-item-info">
                      <strong>Correct Answer:</strong> {{ getOptionText(question, question.correct_answer) }}
                    </li>
                    <li class="list-group-item">
                      <strong>Explanation:</strong> {{ question.explanation }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

      <!-- Navigation Buttons -->
      <div class="d-flex justify-content-center mt-4">
        <button @click="returnToDashboard" class="btn btn-lg" style="background-color: #007bff; color: #fff; border-radius: 25px; padding: 12px 30px; font-weight: 500; box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);">
          <i class="bi bi-house-door me-2"></i> Return to Dashboard
        </button>
        <button @click="printResults" class="btn btn-lg ms-3" style="background-color: #6c757d; color: #fff; border-radius: 25px; padding: 12px 30px; font-weight: 500; box-shadow: 0 4px 6px rgba(108, 117, 125, 0.2);">
          <i class="bi bi-printer me-2"></i> Print Results
        </button>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      dataLoaded: false,
      quiz: {
        name: '',
        passing_percentage: 0,
      },
      score: null,
      questionResults: [],
      selectedSection: null,
      filterType: null, // 'correct', 'incorrect', or null
    };
  },

  computed: {
    correctCount() {
      return this.questionResults.filter(q => q.submitted_answer === q.correct_answer).length;
    },

    incorrectCount() {
      return this.questionResults.filter(q => q.submitted_answer !== q.correct_answer).length;
    },

    filteredQuestions() {
      let filtered = [...this.questionResults];

      // Apply section filter
      if (this.selectedSection === 'correct') {
        filtered = filtered.filter(q => q.submitted_answer === q.correct_answer);
      } else if (this.selectedSection === 'incorrect') {
        filtered = filtered.filter(q => q.submitted_answer !== q.correct_answer);
      }

      // Apply filter type
      if (this.filterType === 'correct') {
        filtered = filtered.filter(q => q.submitted_answer === q.correct_answer);
      } else if (this.filterType === 'incorrect') {
        filtered = filtered.filter(q => q.submitted_answer !== q.correct_answer);
      }

      return filtered;
    }
  },

  methods: {
    async fetchResults() {
      try {
        const quizId = this.$route.params.quizId;

        // Fetch all required data in parallel
        const [quizRes, resultsRes] = await Promise.all([
          fetch(`${location.origin}/api/quizzes/${quizId}`, {
            headers: { 'Authentication-Token': this.$store.state.auth_token }
          }),
          fetch(`${location.origin}/api/quizzes/${quizId}/results`, {
            headers: { 'Authentication-Token': this.$store.state.auth_token }
          })
        ]);

        // Handle quiz data
        if (quizRes.ok) {
          this.quiz = await quizRes.json();
        }

        // Handle results data
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          this.score = resultsData.score;
          this.questionResults = resultsData.question_results;
        }

        this.dataLoaded = true;
      } catch (error) {
        console.error('Error fetching results:', error);
        alert('Failed to load quiz results. Please try again later.');
      }
    },

    getScoreColor(percentage) {
      if (percentage >= 90) return '#28a745'; // green
      if (percentage >= 75) return '#17a2b8'; // cyan
      if (percentage >= 60) return '#007bff'; // blue
      if (percentage >= this.quiz.passing_percentage) return '#fd7e14'; // orange
      return '#dc3545'; // red
    },

    getPerformanceLabel(percentage) {
      if (percentage >= 90) return 'Excellent';
      if (percentage >= 80) return 'Very Good';
      if (percentage >= 70) return 'Good';
      if (percentage >= this.quiz.passing_percentage) return 'Satisfactory';
      return 'Needs Work';
    },

    getPerformanceDescription(percentage) {
      if (percentage >= 90) return 'Outstanding performance!';
      if (percentage >= 80) return 'Great job!';
      if (percentage >= 70) return 'Well done!';
      if (percentage >= this.quiz.passing_percentage) return 'You passed!';
      return 'Try again for better results';
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    getOptionText(question, optionIndex) {
      return question.options[optionIndex - 1];
    },

    getOptionBackground(question, optionIndex) {
      if (optionIndex === question.correct_answer) {
        return 'rgba(40, 167, 69, 0.1)'; // light green
      }
      if (optionIndex === question.submitted_answer && optionIndex !== question.correct_answer) {
        return 'rgba(220, 53, 69, 0.1)'; // light red
      }
      return '#ffffff';
    },

    getOptionBorder(question, optionIndex) {
      if (optionIndex === question.correct_answer) {
        return '#28a745'; // green
      }
      if (optionIndex === question.submitted_answer && optionIndex !== question.correct_answer) {
        return '#dc3545'; // red
      }
      return '#dee2e6'; // default border
    },

    getOptionIconBg(question, optionIndex) {
      if (optionIndex === question.correct_answer) {
        return '#28a745'; // green
      }
      if (optionIndex === question.submitted_answer && optionIndex !== question.correct_answer) {
        return '#dc3545'; // red
      }
      return '#6c757d'; // gray
    },

    isOptionSelected(question, optionIndex) {
      return optionIndex === question.submitted_answer;
    },

    isCorrectOption(question, optionIndex) {
      return optionIndex === question.correct_answer;
    },

    truncateQuestion(text, maxLength = 100) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },

    setFilterType(type) {
      this.filterType = type;
    },

    resetFilters() {
      this.setFilterType(null);
      this.selectedSection = null;
    },

    returnToDashboard() {
      this.$router.push({ name: 'UserDashboardPage' });
    },

    printResults() {
      window.print();
    }
  },

  mounted() {
    this.fetchResults();
  }
};