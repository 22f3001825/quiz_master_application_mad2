export default {
  template: `
    <div class="container-fluid">
      <h2 class="my-4">Analytics Dashboard</h2>
      
      <!-- Stats Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <div class="row">
                <div class="col-3">
                  <i class="fas fa-users fa-3x"></i>
                </div>
                <div class="col-9 text-right">
                  <h3>{{ stats.totalUsers }}</h3>
                  <p class="mb-0">Total Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <div class="row">
                <div class="col-3">
                  <i class="fas fa-clipboard-list fa-3x"></i>
                </div>
                <div class="col-9 text-right">
                  <h3>{{ stats.totalQuizzes }}</h3>
                  <p class="mb-0">Total Quizzes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-warning">
            <div class="card-body">
              <div class="row">
                <div class="col-3">
                  <i class="fas fa-pen fa-3x"></i>
                </div>
                <div class="col-9 text-right">
                  <h3>{{ stats.totalAttempts }}</h3>
                  <p class="mb-0">Quiz Attempts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-info">
            <div class="card-body">
              <div class="row">
                <div class="col-3">
                  <i class="fas fa-percent fa-3x"></i>
                </div>
                <div class="col-9 text-right">
                  <h3>{{ stats.avgScore }}%</h3>
                  <p class="mb-0">Avg. Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Charts Row -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Quiz Attempts by Day</h5>
            </div>
            <div class="card-body" style="height: 300px;">
              <canvas id="quizAttemptsChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">Average Quiz Scores by Subject</h5>
            </div>
            <div class="card-body" style="height: 300px;">
              <canvas id="subjectScoresChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <!-- More Charts Row -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-info text-white">
              <h5 class="mb-0">Pass/Fail Distribution</h5>
            </div>
            <div class="card-body" style="height: 300px;">
              <canvas id="passFailChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-warning text-white">
              <h5 class="mb-0">User Activity Trends</h5>
            </div>
            <div class="card-body" style="height: 300px;">
              <canvas id="userActivityChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Quiz Attempts -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Recent Quiz Attempts</h5>
          <button class="btn btn-sm btn-light" @click="exportAttempts">
            <i class="fas fa-download mr-1"></i> Export CSV
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Time Taken</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attempt in paginatedAttempts" :key="attempt.id">
                  <td>{{ attempt.user_name }}</td>
                  <td>{{ attempt.quiz_name }}</td>
                  <td>{{ attempt.percentage.toFixed(1) }}% ({{ attempt.total_marks_scored }}/{{ attempt.total_possible_marks }})</td>
                  <td>{{ formatDate(attempt.timestamp) }}</td>
                  <td>{{ formatTime(attempt.time_taken_seconds) }}</td>
                  <td>
                    <span :class="attempt.passed ? 'badge badge-success' : 'badge badge-danger'">
                      {{ attempt.passed ? 'Passed' : 'Failed' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="paginatedAttempts.length === 0">
                  <td colspan="6" class="text-center">No quiz attempts found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer">
          <nav>
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
              </li>
              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      stats: {
        totalUsers: 0,
        totalQuizzes: 0,
        totalAttempts: 0,
        avgScore: 0,
        passRate: 0
      },
      quizAttempts: [],
      currentPage: 1,
      perPage: 10,
      chartData: {
        attemptsByDay: {},
        scoresBySubject: {},
        passFailData: {},
        userActivity: {}
      },
      charts: {
        quizAttemptsChart: null,
        subjectScoresChart: null,
        passFailChart: null,
        userActivityChart: null
      },
      loading: false
    };
  },
  
  computed: {
    paginatedAttempts() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.quizAttempts.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.quizAttempts.length / this.perPage);
    }
  },
  
  methods: {
    fetchSummaryStats() {
      this.loading = true;
      fetch('/api/analytics/summary', {
        headers: {
          'Authentication-Token': this.$store.state.auth_token
        }
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch summary stats');
        return response.json();
      })
      .then(data => {
        this.stats = data;
        this.loading = false;
      })
      .catch(error => {
        console.error('Error fetching summary stats:', error);
        this.loading = false;
      });
    },
    
    fetchQuizAttempts() {
      fetch('/api/analytics/quiz-attempts', {
        headers: {
          'Authentication-Token': this.$store.state.auth_token }
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch quiz attempts');
        return response.json();
      })
      .then(data => {
        this.quizAttempts = data;
      })
      .catch(error => {
        console.error('Error fetching quiz attempts:', error);
      });
    },
    
    fetchChartData() {
      fetch('/api/analytics/chart-data', {
        headers: {
          'Authentication-Token': this.$store.state.auth_token }
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch chart data');
        return response.json();
      })
      .then(data => {
        this.chartData = data;
        this.initializeCharts();
      })
      .catch(error => {
        console.error('Error fetching chart data:', error);
      });
    },
    
    initializeCharts() {
      const ctx1 = document.getElementById('quizAttemptsChart').getContext('2d');
      if (this.charts.quizAttemptsChart) this.charts.quizAttemptsChart.destroy();
      this.charts.quizAttemptsChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: this.chartData.attemptsByDay.labels,
          datasets: [{
            label: 'Quiz Attempts',
            data: this.chartData.attemptsByDay.data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      const ctx2 = document.getElementById('subjectScoresChart').getContext('2d');
      if (this.charts.subjectScoresChart) this.charts.subjectScoresChart.destroy();
      this.charts.subjectScoresChart = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: this.chartData.scoresBySubject.labels,
          datasets: [{
            label: 'Average Score',
            data: this.chartData.scoresBySubject.data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      const ctx3 = document.getElementById('passFailChart').getContext('2d');
      if (this.charts.passFailChart) this.charts.passFailChart.destroy();
      this.charts.passFailChart = new Chart(ctx3, {
        type: 'pie',
        data: {
          labels: ['Passed', 'Failed'],
          datasets: [{
            label: 'Pass/Fail Distribution',
            data: this.chartData.passFailData.data,
            backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
      
      const ctx4 = document.getElementById('userActivityChart').getContext('2d');
      if (this.charts.userActivityChart) this.charts.userActivityChart.destroy();
      this.charts.userActivityChart = new Chart(ctx4, {
        type: 'line',
        data: {
          labels: this.chartData.userActivity.labels,
          datasets: [{
            label: 'User Activity',
            data: this.chartData.userActivity.data,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    },
    
    formatTime(seconds) {
      if (!seconds) return 'N/A';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    },
    
    exportAttempts() {
      const csvContent = [
        ['User', 'Quiz', 'Score', 'Date', 'Time Taken', 'Status'],
        ...this.quizAttempts.map(attempt => [
          attempt.user_name,
          attempt.quiz_name,
          `${attempt.percentage.toFixed(1)}% (${attempt.total_marks_scored}/${attempt.total_possible_marks})`,
          this.formatDate(attempt.timestamp),
          this.formatTime(attempt.time_taken_seconds),
          attempt.passed ? 'Passed' : 'Failed'
        ])
      ].map(e => e.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz_attempts.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  },
  
  mounted() {
    this.fetchSummaryStats();
    this.fetchQuizAttempts();
    this.fetchChartData();
  }
};