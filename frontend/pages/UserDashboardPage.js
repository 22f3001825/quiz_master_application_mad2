export default {
  template: `
  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col-lg-8">
        <h1 class="display-4 mb-0">Welcome, {{ user.full_name || 'User' }}</h1>
        <p class="text-muted">Track your progress and take quizzes</p>
      </div>
      <div class="col-lg-4 text-end">
        <div class="btn-group">
          <button class="btn btn-outline-primary" @click="refreshData">
            <i class="fas fa-sync-alt me-2"></i> Refresh
          </button>
        </div>
        <button class="btn btn-outline-success" @click="downloadScoresCsv">
            <i class="fas fa-file-csv me-2"></i> Download Quiz Details
          </button>
      </div>
    </div>
    <div v-if="csvTaskStatus === 'processing'" class="alert alert-info mt-2">
  <i class="fas fa-spinner fa-spin me-2"></i> Generating your CSV file. This might take a moment...
</div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <h5 class="card-title">Quizzes Completed</h5>
            <h2 class="display-4">{{ scores.length }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <h5 class="card-title">Average Score</h5>
            <h2 class="display-4">{{ averageScore }}%</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body">
            <h5 class="card-title">Available Quizzes</h5>
            <h2 class="display-4">{{ availableQuizzes.length }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-white h-100">
          <div class="card-body">
            <h5 class="card-title">Subjects</h5>
            <h2 class="display-4">{{ subjects.length }}</h2>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row">
      <!-- Left Column -->
      <div class="col-lg-8">
        <!-- Available Quizzes -->
        <div class="card mb-4">
          <div class="card-header bg-light d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Available Quizzes</h5>
            <div class="input-group" style="max-width: 300px;">
              <input type="text" class="form-control" v-model="searchQuery" placeholder="Search quizzes...">
            </div>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
              <thead>
                <tr>
                <th>Quiz Name</th>
                <th>Subject</th>
                <th>Questions</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Action</th>
                </tr>
              </thead>
              <tbody>
            <tr v-for="quiz in filteredQuizzes" :key="quiz.id">
            <td>{{ quiz.name }}</td>
            <td>{{ getSubjectName(quiz.chapter_id) }}</td>
              <td>{{ quiz.questionCount || 0 }}</td>
            <td>{{ formatDate(quiz.date_of_quiz) }}</td>
            <td>{{ formatDuration(quiz.time_duration_hours, quiz.time_duration_minutes) }}</td>
              <td>
              <button class="btn btn-primary btn-sm" @click="startQuiz(quiz.id)">
              Start Quiz
              </button>
              </td>
              </tr>
              <tr v-if="filteredQuizzes.length === 0">
              <td colspan="6" class="text-center py-4">No quizzes available</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>

        <!-- Performance Chart -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h5 class="mb-0">Performance Over Time</h5>
          </div>
          <div class="card-body">
            <canvas id="performanceChart" height="300"></canvas>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-lg-4">
        <!-- Recent Scores -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h5 class="mb-0">Recent Scores</h5>
          </div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush">
              <li v-for="score in recentScores" :key="score.id" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-0">{{ getQuizName(score.quiz_id) }}</h6>
                    <small class="text-muted">{{ formatDate(score.timestamp) }}</small>
                  </div>
                  <div class="text-end">
                    <h5 class="mb-0">{{ score.percentage.toFixed(1) }}%</h5>
                    <span :class="getScoreBadgeClass(score.percentage)">
                      {{ score.total_scored }} / {{ score.total_questions }}
                    </span>
                  </div>
                </div>
                <div class="progress mt-2" style="height: 5px;">
                  <div class="progress-bar" :class="getProgressBarClass(score.percentage)" role="progressbar" 
                    :style="{ width: score.percentage + '%' }" :aria-valuenow="score.percentage" 
                    aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </li>
              <li v-if="scores.length === 0" class="list-group-item text-center py-4">
                No quiz attempts yet
              </li>
            </ul>
          </div>
          <div class="card-footer bg-light text-center">
            <button class="btn btn-sm btn-outline-primary" @click="showAllScores = !showAllScores">
              {{ showAllScores ? 'Show Recent' : 'View All Scores' }}
            </button>
          </div>
        </div>

        <!-- Subject Performance -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h5 class="mb-0">Subject Performance</h5>
          </div>
          <div class="card-body">
            <canvas id="subjectChart" height="260"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Start Modal -->
    <div class="modal fade" id="quizStartModal" tabindex="-1" aria-labelledby="quizStartModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="quizStartModalLabel">Start Quiz: {{ selectedQuiz?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>Subject:</strong> {{ getSubjectName(selectedQuiz?.chapter_id) }}</p>
            <p><strong>Questions:</strong> {{ selectedQuiz?.questionCount || 0 }}</p>
            <p><strong>Duration:</strong> {{ formatDuration(selectedQuiz?.time_duration_hours, selectedQuiz?.time_duration_minutes) }}</p>
            <p><strong>Instructions:</strong></p>
            <ul>
          <li>The quiz timer will start immediately after you begin.</li>
        <li>You must complete the quiz within the allotted time.</li>
        <li>You can attempt the quiz multiple times.</li>
        </ul>
        </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cancelQuiz">Cancel</button>
            <button type="button" class="btn btn-primary" @click="beginQuiz">Begin Quiz</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  
  data() {
    return {
      user: {},
      quizzes: [],
      availableQuizzes: [],
      subjects: [],
      chapters: [],
      scores: [],
      notifications: [],
      searchQuery: "",
      selectedSubjectId: null,
      selectedQuiz: null,
      showAllScores: false,
      quizStartModal: null,
      charts: {
        performance: null,
        subject: null
      },
      csvTaskId: null,
    csvTaskStatus: null,
    csvPollingInterval: null
    };
  },

  computed: {
    filteredQuizzes() {
      let filtered = this.availableQuizzes;
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(quiz => 
          quiz.name.toLowerCase().includes(query) || 
          quiz.remarks?.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    },
    
    recentScores() {
      const sortedScores = [...this.scores].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      return this.showAllScores ? sortedScores : sortedScores.slice(0, 5);
    },
    
    averageScore() {
      if (this.scores.length === 0) return 0;
      const sum = this.scores.reduce((acc, score) => acc + score.percentage, 0);
      return (sum / this.scores.length).toFixed(1);
    }
  },

  methods: {
    async fetchUserProfile() {
      try {
        console.log('Fetching user profile with ID:', this.$store.state.user_id);  // Debug log
        const res = await fetch(`${location.origin}/api/users/${this.$store.state.user_id}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token 
          }
        });
        if (res.ok) {
          this.user = await res.json();
        } else {
          console.error("Failed to fetch user profile:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    },
   

    async fetchQuizzes() {
      try {
        const res = await fetch(`${location.origin}/api/quizzes`, {
          headers: { "Authentication-Token": this.$store.state.auth_token }
        });
        if (res.ok) {
          this.quizzes = await res.json();
          this.availableQuizzes = this.quizzes.filter(quiz => quiz.is_active);
        } else {
          console.error("Failed to fetch quizzes:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    },

    async fetchSubjects() {
      try {
        const res = await fetch(`${location.origin}/api/subjects`, {
          headers: { "Authentication-Token": this.$store.state.auth_token }
        });
        if (res.ok) {
          this.subjects = await res.json();
        } else {
          console.error("Failed to fetch subjects:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    },

    async fetchChapters() {
      try {
        const res = await fetch(`${location.origin}/api/chapters`, {
          headers: { "Authentication-Token": this.$store.state.auth_token }
        });
        if (res.ok) {
          this.chapters = await res.json();
        } else {
          console.error("Failed to fetch chapters:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    },

    async fetchScores() {
      try {
        // Assuming there's an endpoint to get scores for the current user
        const res = await fetch(`${location.origin}/api/scores`, {
          headers: { "Authentication-Token": this.$store.state.auth_token }
        });
        if (res.ok) {
          const allScores = await res.json();
          // Filter scores for the current user
          this.scores = allScores.filter(score => score.user_id === this.$store.state.user_id);
        } else {
          console.error("Failed to fetch scores:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    },

    // Update startQuiz to use local storage for timer and show number of questions
    startQuiz(quizId) {
      this.selectedQuiz = this.quizzes.find(quiz => quiz.id === quizId);
      if (this.selectedQuiz) {
        // Show modal using Bootstrap
        this.quizStartModal.show();
      }
    },

    // Update beginQuiz to handle timer locally
    async beginQuiz() {
      if (this.selectedQuiz) {
        try {
          // Hide modal
          if (this.quizStartModal) {
            this.quizStartModal.hide();
          }
          
          const now = new Date();
          const endTime = new Date(now);
          
          // Calculate end time based on quiz duration
          endTime.setHours(endTime.getHours() + this.selectedQuiz.time_duration_hours);
          endTime.setMinutes(endTime.getMinutes() + this.selectedQuiz.time_duration_minutes);
          
          // Create local timer state
          const timerState = {
            quizId: this.selectedQuiz.id,
            userId: this.$store.state.user_id,
            startTime: now.toISOString(),
            endTime: endTime.toISOString(),
            isCompleted: false,
            isAbandoned: false,
            answers: {},
            flaggedQuestions: []
          };

          // Save timer state to localStorage
          localStorage.setItem('currentQuizTimer', JSON.stringify(timerState));

          // Navigate to quiz page
          this.$router.push({
            name: 'quiz',
            params: { 
              quizId: this.selectedQuiz.id.toString()
            }
          });
          
        } catch (error) {
          console.error("Error starting quiz:", error);
          alert('Failed to start quiz. Please try again.');
        }
      }
    },

    cancelQuiz() {
      if (this.quizStartModal) {
        this.quizStartModal.hide();
      }
    },
    // Add this method to fetch questions data
async fetchQuestions() {
  try {
    const res = await fetch(`${location.origin}/api/questions`, {
      headers: { "Authentication-Token": this.$store.state.auth_token }
    });
    if (res.ok) {
      const questions = await res.json();
      
      // Calculate number of questions per quiz
      const questionCounts = {};
      questions.forEach(question => {
        if (!questionCounts[question.quiz_id]) {
          questionCounts[question.quiz_id] = 0;
        }
        questionCounts[question.quiz_id]++;
      });
      
      // Attach question count to quiz objects
      this.quizzes.forEach(quiz => {
        quiz.questionCount = questionCounts[quiz.id] || 0;
      });
      
      // Update availableQuizzes with question counts too
      this.availableQuizzes = this.quizzes.filter(quiz => quiz.is_active);
    } else {
      console.error("Failed to fetch questions:", res.statusText);
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
  }
},

async refreshData() {
  this.error = null;
  
  const fetchOperations = [
    { operation: this.fetchUserProfile(), key: 'user' },
    { operation: this.fetchQuizzes(), key: 'quizzes' },
    { operation: this.fetchSubjects(), key: 'subjects' },
    { operation: this.fetchChapters(), key: 'chapters' },
    { operation: this.fetchScores(), key: 'scores' }
  ];

  try {
    await Promise.all(fetchOperations.map(({ operation }) => operation));
    
    await this.fetchQuestions();
    this.initCharts();
  } catch (error) {
    console.error('Error refreshing data:', error);
    this.error = 'Failed to load dashboard data. Please try again.';
  }
},

async downloadScoresCsv() {
  try {
    // Clear any existing polling
    if (this.csvPollingInterval) {
      clearInterval(this.csvPollingInterval);
    }
    
    // Start the CSV creation task
    const res = await fetch(`${location.origin}/create-csv?user_id=${this.$store.state.user_id}`, {
      headers: { "Authentication-Token": this.$store.state.auth_token }
    });
    
    if (res.ok) {
      const data = await res.json();
      this.csvTaskId = data.task_id;
      this.csvTaskStatus = 'processing';
      
      // Show notification to user
      alert('Your CSV is being generated. You will be notified when it is ready to download.');
      
      // Start polling for task completion
      this.pollCsvTaskStatus();
    } else {
      console.error("Failed to start CSV generation:", res.statusText);
      alert('Failed to start CSV generation. Please try again.');
    }
  } catch (error) {
    console.error("Error starting CSV generation:", error);
    alert('Error occurred while trying to generate CSV. Please try again.');
  }
},

pollCsvTaskStatus() {
  this.csvPollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`${location.origin}/get-csv/${this.csvTaskId}`, {
        headers: { "Authentication-Token": this.$store.state.auth_token }
      });
      
      if (res.status === 200) {
        // Task is complete and file is ready
        clearInterval(this.csvPollingInterval);
        this.csvTaskStatus = 'complete';
        
        // Create a download link
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `quiz-scores-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Reset state
        this.csvTaskId = null;
      } else if (res.status === 405) {
        // Task is still processing
        console.log("CSV generation in progress...");
      } else {
        // Error occurred
        clearInterval(this.csvPollingInterval);
        console.error("Error checking CSV task status:", res.statusText);
        alert('Error occurred while checking CSV generation status.');
        this.csvTaskStatus = 'error';
      }
    } catch (error) {
      clearInterval(this.csvPollingInterval);
      console.error("Error polling CSV task status:", error);
      this.csvTaskStatus = 'error';
    }
  }, 3000); // Check every 3 seconds
},
    getSubjectName(chapterId) {
      const chapter = this.chapters.find(c => c.id === chapterId);
      if (!chapter) return 'Unknown';
      
      const subject = this.subjects.find(s => s.id === chapter.subject_id);
      return subject ? subject.name : 'Unknown';
    },
    
    
    getQuizName(quizId) {
      const quiz = this.quizzes.find(q => q.id === quizId);
      return quiz ? quiz.name : 'Unknown Quiz';
    },

    getScoreBadgeClass(percentage) {
      if (percentage >= 90) return 'badge bg-success';
      if (percentage >= 70) return 'badge bg-primary';
      if (percentage >= 50) return 'badge bg-warning text-dark';
      return 'badge bg-danger';
    },

    getProgressBarClass(percentage) {
      if (percentage >= 90) return 'bg-success';
      if (percentage >= 70) return 'bg-primary';
      if (percentage >= 50) return 'bg-warning';
      return 'bg-danger';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatDuration(hours, minutes) {
      let result = '';
      if (hours > 0) {
        result += `${hours} hour${hours !== 1 ? 's' : ''}`;
      }
      if (minutes > 0) {
        if (result) result += ' ';
        result += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
      return result || 'Not specified';
    },

    initCharts() {
      this.initPerformanceChart();
      this.initSubjectChart();
    },

    initPerformanceChart() {
      const ctx = document.getElementById('performanceChart');
      if (!ctx) return;
      
      // Destroy existing chart if exists
      if (this.charts.performance) {
        this.charts.performance.destroy();
      }
      
      // Prepare data
      const sortedScores = [...this.scores].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      const labels = sortedScores.map(score => {
        const date = new Date(score.timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      const data = sortedScores.map(score => score.percentage);
      
      // Create chart
      this.charts.performance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Score Percentage',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Score (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Quiz Date'
              }
            }
          }
        }
      });
    },

    initSubjectChart() {
      const ctx = document.getElementById('subjectChart');
      if (!ctx) return;
      
      // Destroy existing chart if exists
      if (this.charts.subject) {
        this.charts.subject.destroy();
      }
      
      // Group scores by subject
      const subjectScores = {};
      const subjectAttempts = {};
      
      this.scores.forEach(score => {
        const quiz = this.quizzes.find(q => q.id === score.quiz_id);
        if (!quiz) return;
        
        const chapter = this.chapters.find(c => c.id === quiz.chapter_id);
        if (!chapter) return;
        
        const subject = this.subjects.find(s => s.id === chapter.subject_id);
        if (!subject) return;
        
        if (!subjectScores[subject.name]) {
          subjectScores[subject.name] = 0;
          subjectAttempts[subject.name] = 0;
        }
        
        subjectScores[subject.name] += score.percentage;
        subjectAttempts[subject.name]++;
      });
      
      // Calculate average scores
      const labels = Object.keys(subjectScores);
      const data = labels.map(subject => 
        subjectAttempts[subject] > 0 ? subjectScores[subject] / subjectAttempts[subject] : 0
      );
      
      // Create chart
      this.charts.subject = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Average Score',
            data: data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 20
              }
            }
          }
        }
      });
    }
  },

  mounted() {
    // Initialize Bootstrap modal
    this.quizStartModal = new bootstrap.Modal(document.getElementById('quizStartModal'));
    
    // Load all data
    this.refreshData();
    
    // Include Chart.js
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => this.initCharts();
      document.head.appendChild(script);
    } else {
      this.initCharts();
    }
    
    
    if (!document.querySelector('link[href*="fontawesome"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
  },
  
  beforeUnmount() {
    // Destroy charts to prevent memory leaks
    if (this.charts.performance) {
      this.charts.performance.destroy();
    }
    if (this.charts.subject) {
      this.charts.subject.destroy();
    }
      // Clear CSV polling interval
  if (this.csvPollingInterval) {
    clearInterval(this.csvPollingInterval);
  }

  }
};