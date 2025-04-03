export default {
  template: `
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Question Management</h2>
      <button class="btn btn-primary" @click="$emit('openQuestionModal', 'create')">
        <i class="fas fa-plus"></i> Add Question
      </button>
    </div>
    
    <div class="mb-3">
      <input type="text" class="form-control" placeholder="Search questions..." v-model="questionSearch">
    </div>
    
    <div class="form-group">
      <label for="quizFilter">Filter by Quiz</label>
      <select 
        class="form-control" 
        id="quizFilter" 
        v-model="selectedQuizFilter"
        @change="$emit('update:selectedQuizFilter', selectedQuizFilter)"
      >
        <option value="">All Quizzes</option>
        <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
          {{ quiz.name }}
        </option>
      </select>
    </div>
    
    <div class="row">
      <div class="col-md-4 mb-4" v-for="question in filteredQuestions" :key="question.id">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-light">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="badge bg-primary me-2">{{ getQuizName(question.quiz_id) }}</span>
                <!--<span class="badge bg-info">{{ getQuizChapter(question.quiz_id)?.name }}</span>-->
                <span class="badge bg-info">{{ getSubjectName(getQuizChapter(question.quiz_id)?.subject_id) }}</span>
              </div>
              <span class="badge" :class="getDifficultyBadgeClass(question.difficulty_level)">
                {{ question.difficulty_level }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title mb-3">{{ question.question_statement }}</h5>
            <div class="options-list">
              <div class="mb-2" v-for="(option, index) in [question.option1, question.option2, question.option3, question.option4]" :key="index">
                <div class="d-flex align-items-center">
                  <span class="badge rounded-pill" 
                    :class="isCorrectOption(index + 1, question.correct_option) ? 'bg-success' : 'bg-secondary'">
                    {{ index + 1 }}
                  </span>
                  <span class="ms-2">{{ option }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer bg-white border-top-0">
            <div class="btn-group w-100">
              <button class="btn btn-sm btn-outline-secondary" @click="$emit('openQuestionModal', 'edit', question)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="$emit('deleteQuestion', question.id)">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-12 text-center py-5" v-if="filteredQuestions.length === 0">
        <div class="py-5">
          <i class="fas fa-question-circle fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No questions found</h5>
          <p class="text-muted" v-if="questionSearch">Try a different search term</p>
          <p class="text-muted" v-else>Add your first question to get started</p>
          <button class="btn btn-primary mt-2" @click="$emit('openQuestionModal', 'create')">Add Question</button>
        </div>
      </div>
    </div>
  </div>
  `,
  props: {
    quizzes: {
      type: Array,
      required: true
    },
    questions: {
      type: Array,
      required: true
    },
    questionSearch: {
      type: String,
      default: ''
    },
    selectedQuizFilter: {
      type: String,
      default: ''
    },
    chapters: {  // Add chapters prop
      type: Array,
      required: true
    },
    subjects: {  // Add subjects prop
      type: Array,
      required: true
    }
  },
  computed: {
    filteredQuestions() {
      let questions = this.questions;

      if (this.selectedQuizFilter) {
        questions = questions.filter(question => question.quiz_id === this.selectedQuizFilter);
      }

      if (this.questionSearch) {
        const search = this.questionSearch.toLowerCase();
        questions = questions.filter(question => 
          question.question_statement.toLowerCase().includes(search) ||
          question.option1.toLowerCase().includes(search) ||
          question.option2.toLowerCase().includes(search) ||
          question.option3.toLowerCase().includes(search) ||
          question.option4.toLowerCase().includes(search)
        );
      }

      return questions;
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    getQuizName(quizId) {
      const quiz = this.quizzes.find(q => q.id === quizId);
      return quiz ? quiz.name : 'Unknown Quiz';
    },
    getQuizChapter(quizId) {
      const quiz = this.quizzes.find(q => q.id === quizId);
      if (!quiz) return null;
      return this.chapters.find(c => c.id === quiz.chapter_id);
    },
    getSubjectName(subjectId) {
      if (!subjectId) return 'Unknown Subject';
      const subject = this.subjects.find(s => s.id === subjectId);
      return subject ? subject.name : 'Unknown Subject';
    },
    isCorrectOption(optionNumber, correctOption) {
      return optionNumber === correctOption;
    },
    getDifficultyBadgeClass(difficulty) {
      switch (difficulty) {
        case 'Easy': return 'bg-success';
        case 'Medium': return 'bg-warning text-dark';
        case 'Hard': return 'bg-danger';
        default: return 'bg-secondary';
      }
    }
  }
};