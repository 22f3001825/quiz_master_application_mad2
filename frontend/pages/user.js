export default {
  template: `
    <div class="container-fluid py-4">
      <!-- Integrated Header with Search, Filters and User Count -->
      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <h1 class="h3 mb-0 text-gray-800 mr-3">User Management</h1>
              <div class="badge badge-primary p-2">
                <i class="fas fa-users mr-1"></i>
                <span class="font-weight-bold">{{ filteredUsers.length }} Users</span>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <!-- Search bar -->
              <div class="form-group mb-0 mr-3">
                <div class="input-group" style="width: 300px;">
                  <div class="input-group-prepend">
                    <span class="input-group-text bg-primary text-white">
                      <i class="fas fa-search"></i>
                    </span>
                  </div>
                  <input type="text" class="form-control" id="search" v-model="filters.search" 
                    placeholder="Search by name or email" @input="applyFilters">
                </div>
              </div>
              
              <!-- Per page dropdown -->
              <div class="form-group mb-0 mr-3">
                <select class="custom-select mr-2" style="width: auto;" v-model="perPage">
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
              </div>
              
              <!-- Reset button -->
              <button class="btn btn-outline-secondary" @click="resetFilters">
                <i class="fas fa-redo-alt mr-1"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Users Table -->
      <div class="card shadow mb-4">
        <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
          <h6 class="m-0 font-weight-bold text-primary">Users</h6>
          <div class="dropdown no-arrow">
            <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
                <div class="dropdown-header">Export Options:</div>
                  <a class="dropdown-item" href="#" @click.prevent="exportCSV">
                      <i class="fas fa-file-csv mr-2 text-gray-400"></i>Export CSV
                         </a>
                          
                      <div class="dropdown-divider"></div>
                      <a class="dropdown-item" href="#" @click.prevent="printTable">
                            <i class="fas fa-print mr-2 text-gray-400"></i>Print
                      </a>
                  </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="py-3 px-4" @click="sortBy('id')">
                    ID 
                    <i class="fas ml-1" :class="sortIcon('id')"></i>
                  </th>
                  <th class="py-3 px-4" @click="sortBy('full_name')">
                    Full Name 
                    <i class="fas ml-1" :class="sortIcon('full_name')"></i>
                  </th>
                  <th class="py-3 px-4" @click="sortBy('email')">
                    Email 
                    <i class="fas ml-1" :class="sortIcon('email')"></i>
                  </th>
                  <th class="py-3 px-4" @click="sortBy('created_at')">
                    Joined 
                    <i class="fas ml-1" :class="sortIcon('created_at')"></i>
                  </th>
                  <th class="py-3 px-4" @click="sortBy('last_active')">
                    Last Active 
                    <i class="fas ml-1" :class="sortIcon('last_active')"></i>
                  </th>
                  <th class="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="sr-only"></span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="paginatedUsers.length === 0">
                  <td colspan="6" class="text-center py-4">
                    <div class="text-gray-500">
                      <i class="fas fa-search fa-2x mb-3 d-block"></i>
                      <p>No users found matching your criteria</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="user in paginatedUsers" :key="user.id" class="cursor-pointer" @click="viewUserDetails(user)">
                  <td class="py-3 px-4">{{ user.id }}</td>
                  <td class="py-3 px-4">
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle bg-primary text-white mr-2">
                        {{ getInitials(user.full_name) }}
                      </div>
                      <span>{{ user.full_name }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4">{{ user.email }}</td>
                  <td class="py-3 px-4">{{ formatDate(user.created_at, true) }}</td>
                  <td class="py-3 px-4">{{ formatDate(user.last_active, true) }}</td>
                  <td class="py-3 px-4 text-center">
                    <button class="btn btn-sm btn-outline-primary mr-1" @click.stop="viewUserDetails(user)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click.stop="confirmDeleteUser(user)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer">
          <div class="row align-items-center">
            <div class="col-md-6 small">
              Showing {{ paginationInfo }}
            </div>
            <div class="col-md-6">
              <nav>
                <ul class="pagination justify-content-end mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePage(1)" aria-label="First">
                      <i class="fas fa-angle-double-left"></i>
                    </a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                      <i class="fas fa-angle-left"></i>
                    </a>
                  </li>
                  <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                      <i class="fas fa-angle-right"></i>
                    </a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="changePage(totalPages)" aria-label="Last">
                      <i class="fas fa-angle-double-right"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      <!-- User Details Modal -->
      <div class="modal fade" id="userDetailsModal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="fas fa-user-circle mr-2"></i>User Details
              </h5>
              <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body" v-if="selectedUser">
              <div class="row">
                <div class="col-md-6">
                  <div class="card shadow-sm mb-4">
                    <div class="card-body">
                      <div class="text-center mb-4">
                        <div class="avatar-large bg-primary text-white mx-auto mb-3">
                          {{ getInitials(selectedUser.full_name) }}
                        </div>
                        <h5 class="font-weight-bold">{{ selectedUser.full_name }}</h5>
                        <p class="text-muted mb-0">{{ selectedUser.email }}</p>
                      </div>
                      
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span class="text-muted">Qualification</span>
                          <span class="font-weight-bold">{{ selectedUser.qualification || 'N/A' }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span class="text-muted">Date of Birth</span>
                          <span class="font-weight-bold">{{ formatDate(selectedUser.dob) }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span class="text-muted">Joined</span>
                          <span class="font-weight-bold">{{ formatDate(selectedUser.created_at) }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                          <span class="text-muted">Last Active</span>
                          <span class="font-weight-bold">{{ formatDate(selectedUser.last_active) }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card shadow-sm mb-4">
                    <div class="card-header bg-light">
                      <h6 class="font-weight-bold text-primary mb-0">Activity Summary</h6>
                    </div>
                    <div class="card-body">
                      <div class="row text-center">
                        <div class="col-4">
                          <div class="circle-stat bg-light">
                            <i class="fas fa-clipboard-list text-primary"></i>
                          </div>
                          <h4 class="mt-2">{{ userStats.totalQuizzes }}</h4>
                          <small class="text-muted">Quizzes Taken</small>
                        </div>
                        <div class="col-4">
                          <div class="circle-stat bg-light">
                            <i class="fas fa-chart-line text-success"></i>
                          </div>
                          <h4 class="mt-2">{{ userStats.avgScore }}%</h4>
                          <small class="text-muted">Avg. Score</small>
                        </div>
                        <div class="col-4">
                          <div class="circle-stat bg-light">
                            <i class="fas fa-check-circle text-info"></i>
                          </div>
                          <h4 class="mt-2">{{ userStats.passRate }}%</h4>
                          <small class="text-muted">Pass Rate</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- User Quiz Results -->
              <div class="card shadow-sm">
                <div class="card-header bg-light">
                  <h6 class="font-weight-bold text-primary mb-0">Quiz Results</h6>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead class="thead-light">
                        <tr>
                          <th>Quiz Name</th>
                          <th>Date</th>
                          <th>Score</th>
                          <th>Time Taken</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="userScores.length === 0">
                          <td colspan="4" class="text-center py-3">
                            <i class="fas fa-clipboard fa-2x text-gray-300 mb-2 d-block"></i>
                            No quiz attempts found
                          </td>
                        </tr>
                        <tr v-for="score in userScores" :key="score.id">
                          <td>{{ score.quiz_name }}</td>
                          <td>{{ formatDate(score.timestamp) }}</td>
                          <td>
                            <div class="d-flex align-items-center">
                              <div class="progress mr-2" style="width: 60px; height: 5px;">
                                <div class="progress-bar" role="progressbar" 
                                  :class="score.passed ? 'bg-success' : 'bg-danger'" 
                                  :style="{ width: score.percentage + '%' }"
                                  :aria-valuenow="score.percentage" aria-valuemin="0" aria-valuemax="100">
                                </div>
                              </div>
                              <span>{{ score.percentage.toFixed(1) }}%</span>
                            </div>
                          </td>
                          <td>{{ formatTime(score.time_taken_seconds) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delete User Modal -->
      <div class="modal fade" id="deleteUserModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="fas fa-exclamation-triangle mr-2"></i>Confirm Delete
              </h5>
              <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body" v-if="selectedUser">
              <div class="text-center mb-4">
                <div class="avatar-large bg-light text-danger mx-auto mb-3">
                  <i class="fas fa-user-times"></i>
                </div>
              </div>
              <p class="text-center">Are you sure you want to delete the user:</p>
              <p class="text-center font-weight-bold">{{ selectedUser.full_name }}</p>
              <div class="alert alert-warning">
                <i class="fas fa-exclamation-circle mr-2"></i>
                This action cannot be undone. All associated data will be permanently deleted.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" @click="deleteUser">
                <i class="fas fa-trash mr-1"></i> Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      users: [],
      selectedUser: null,
      userScores: [],
      userStats: {
        totalQuizzes: 0,
        avgScore: 0,
        passRate: 0
      },
      filters: {
        search: ''
      },
      currentPage: 1,
      perPage: 10,
      sortKey: 'id',
      sortOrder: 'asc',
      loading: false
    };
  },

  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchSearch = !this.filters.search ||
          (user.full_name && user.full_name.toLowerCase().includes(this.filters.search.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(this.filters.search.toLowerCase()));

        return matchSearch;
      });
    },

    sortedUsers() {
      return [...this.filteredUsers].sort((a, b) => {
        let aValue = a[this.sortKey];
        let bValue = b[this.sortKey];

        if (aValue === bValue) return 0;

        if (this.sortOrder === 'asc') {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
    },

    paginatedUsers() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.sortedUsers.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.perPage);
    },

    displayedPages() {
      const delta = 2; // Pages to show before and after current page
      const range = [];
      const rangeWithDots = [];
      let l;

      for (let i = 1; i <= this.totalPages; i++) {
        if (i === 1 || i === this.totalPages || (i >= this.currentPage - delta && i <= this.currentPage + delta)) {
          range.push(i);
        }
      }

      for (let i of range) {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      }

      return rangeWithDots;
    },

    paginationInfo() {
      const start = (this.currentPage - 1) * this.perPage + 1;
      const end = Math.min(start + this.perPage - 1, this.filteredUsers.length);
      return `${start}-${end} of ${this.filteredUsers.length} users`;
    }
  },

  methods: {
    fetchUsers() {
      this.loading = true;
      fetch('/api/users', {
        headers: {
          'Authentication-Token': this.$store.state.auth_token
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch users');
          return response.json();
        })
        .then(data => {
          this.users = data.map(user => ({
            ...user,
            active: Boolean(user.active)
          }));
          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching users:', error);
          this.loading = false;
        });
    },

    getInitials(name) {
      if (!name) return '?';
      return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },

    viewUserDetails(user) {
      this.selectedUser = user;
      this.fetchUserScores(user.id);
      this.fetchUserStats(user.id);
      $('#userDetailsModal').modal('show');
    },

    fetchUserScores(userId) {
      fetch(`/api/users/${userId}/scores`, {
        headers: {
          'Authentication-Token': this.$store.state.auth_token
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch user scores');
          return response.json();
        })
        .then(data => {
          this.userScores = data;
        })
        .catch(error => {
          console.error('Error fetching user scores:', error);
          this.userScores = [];
        });
    },

    fetchUserStats(userId) {
      fetch(`/api/users/${userId}/stats`, {
        headers: {
          'Authentication-Token': this.$store.state.auth_token
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch user stats');
          return response.json();
        })
        .then(data => {
          this.userStats = data;
        })
        .catch(error => {
          console.error('Error fetching user stats:', error);
          this.userStats = {
            totalQuizzes: 0,
            avgScore: 0,
            passRate: 0
          };
        });
    },

    confirmDeleteUser(user) {
      this.selectedUser = user;
      $('#deleteUserModal').modal('show');
    },

    deleteUser() {
      if (!this.selectedUser) return;

      fetch(`/api/users/${this.selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authentication-Token': this.$store.state.auth_token
        }
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to delete user');
          return response.json();
        })
        .then(() => {
          this.users = this.users.filter(u => u.id !== this.selectedUser.id);
          $('#deleteUserModal').modal('hide');
          this.selectedUser = null;
        })
        .catch(error => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        });
    },

    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },

    sortIcon(key) {
      if (this.sortKey !== key) return '';
      return this.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    },

    applyFilters() {
      this.currentPage = 1;
    },

    resetFilters() {
      this.filters = {
        search: ''
      };
      this.currentPage = 1;
    },

    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },

    formatDate(dateString, includeTime = false) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      return new Date(dateString).toLocaleString(undefined, options);
    },

    formatTime(seconds) {
      if (!seconds) return 'N/A';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    },

    exportCSV() {
      const csvContent = this.generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    generateCSV() {
      const headers = ['ID', 'Full Name', 'Email', 'Joined Date', 'Last Active'];
      const rows = this.sortedUsers.map(user => [
        user.id,
        `"${user.full_name}"`, // Wrap in quotes to handle commas in names
        user.email,
        new Date(user.created_at).toISOString(),
        user.last_active ? new Date(user.last_active).toISOString() : 'N/A',
      ]);

      return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    },

    printTable() {
      const printWindow = window.open('', '_blank');
      const tableContent = `
          <html>
            <head>
              <title>User List</title>
              <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <h2>User List - ${new Date().toLocaleDateString()}</h2>
              ${document.querySelector('.table-responsive').outerHTML}
            </body>
          </html>
        `;

      printWindow.document.write(tableContent);
      printWindow.document.close();
      printWindow.print();
    }
  },

  mounted() {
    this.fetchUsers();
  }
};