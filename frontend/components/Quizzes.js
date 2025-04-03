export default {
  props: {
    chapters: Array,
    quizzes: Array,
    quizSearch: String,
    selectedChapterFilter: String // This is the prop causing the warning
  },
  data() {
    return {
      internalSelectedChapterFilter: this.selectedChapterFilter // Internal data property
    };
  },
  watch: {
    selectedChapterFilter(newVal) {
      this.internalSelectedChapterFilter = newVal; // Watch for prop changes
    }
  },
  methods: {
    updateSelectedChapterFilter(value) {
      this.internalSelectedChapterFilter = value;
      this.$emit('update:selectedChapterFilter', value); // Emit event to update parent
    }
  },
  template: `
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Quiz Management</h2>
      <button class="btn btn-primary" @click="$emit('openQuizModal', 'create')" :disabled="chapters.length === 0">
        <i class="fas fa-plus"></i> Add Quiz
      </button>
    </div>
    <label for ="chapterFilter">Filter by Chapter</label>
    <div class="row mb-3">
      <div class="col-md-6">
        <select class="form-control" v-model="selectedChapterFilter">
          <option value="">All Chapters</option>
          <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">{{ chapter.name }}</option>
        </select>
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control" placeholder="Search quizzes..." v-model="quizSearch">
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Quiz Name</th>
            <th>Chapter</th>
            <th>Date of Quiz</th>
            <th>Duration</th>
            <th>Questions</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quiz in filteredQuizzes" :key="quiz.id">
            <td>{{ quiz.name }}</td>
            <td>{{ getChapterName(quiz.chapter_id) }}</td>
            <td>{{ formatDate(quiz.date_of_quiz) }}</td>
            <td>{{ quiz.time_duration_hours }}h {{ quiz.time_duration_minutes }}m</td>
            <td>{{ getQuestionCount(quiz.id) }}</td>
            <td>
              <span class="badge" :class="quiz.is_active ? 'badge-success' : 'badge-secondary'">
                {{ quiz.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary" @click="$emit('openQuizModal', 'edit', quiz)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="$emit('deleteQuiz', quiz.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredQuizzes.length === 0">
            <td colspan="7" class="text-center py-5">
              <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
              <h5 class="text-muted">No quizzes found</h5>
              <p class="text-muted" v-if="quizSearch || selectedChapterFilter">Try removing filters</p>
              <p class="text-muted" v-else-if="chapters.length === 0">Please create a chapter first</p>
              <p class="text-muted" v-else>Add your first quiz to get started</p>
              <button class="btn btn-primary mt-2" @click="$emit('openQuizModal', 'create')" :disabled="chapters.length === 0">
                Add Quiz
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
  props: {
    chapters: Array,
    quizzes: Array,
    questions: Array,
    quizSearch: String,
    selectedChapterFilter: String

  },
  computed: {
    filteredQuizzes() {
      let quizzes = this.quizzes;

      if (this.selectedChapterFilter) {
        quizzes = quizzes.filter(quiz => 
          quiz.chapter_id === this.selectedChapterFilter
        );
      }

      if (this.quizSearch) {
        const searchTerm = this.quizSearch.toLowerCase();
        quizzes = quizzes.filter(quiz => 
          quiz.name.toLowerCase().includes(searchTerm)
        );
      }

      return quizzes;
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    getChapterName(chapterId) {
      const chapter = this.chapters.find(chapter => chapter.id === chapterId);
      return chapter ? chapter.name : 'Unknown';
    },
    getQuestionCount(quizId) {
      return this.questions.filter(q => q.quiz_id === quizId).length;
    }
  }
};