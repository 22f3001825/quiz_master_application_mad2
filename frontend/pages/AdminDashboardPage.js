import Tabs from '../components/Tabs.js';
import Subjects from '../components/Subjects.js';
import Chapters from '../components/Chapters.js';
import Quizzes from '../components/Quizzes.js';
import Questions from '../components/Questions.js';
import Toast from '../components/Toast.js';

export default {
  components: {
    Tabs,
    Subjects,
    Chapters,
    Quizzes,
    Questions,
    Toast
  },
  template: `
<div class="container">
  <h1>Admin Dashboard</h1>
  <tabs :active-tab="activeTab" @update:activeTab="setActiveTab"></tabs>
  
  <!-- Subjects Tab -->
  <div v-show="activeTab === 'subjects'">
    <subjects
      :subjects="subjects"
      :subject-search="subjectSearch"
      @openSubjectModal="openSubjectModal"
      @deleteSubject="deleteSubject"
    ></subjects>
  </div>
  
  <!-- Chapters Tab -->
  <div v-show="activeTab === 'chapters'">
    <chapters
      :subjects="subjects"
      :chapters="chapters"
      :chapter-search="chapterSearch"
      :selected-subject-filter="selectedSubjectFilter"
      @openChapterModal="openChapterModal"
      @deleteChapter="deleteChapter"
    ></chapters>
  </div>
  
  <!-- Quizzes Tab -->
  <div v-show="activeTab === 'quizzes'">
    <quizzes
      :chapters="chapters"
      :quizzes="quizzes"
      :questions="questions"
      :quiz-search="quizSearch"
      :selected-chapter-filter="selectedChapterFilter"
      @openQuizModal="openQuizModal"
      @deleteQuiz="deleteQuiz"
      @update:selectedChapterFilter="selectedChapterFilter = $event"
    ></quizzes>
  </div>
  
  <!-- Questions Tab -->
  <div v-show="activeTab === 'questions'">
    <questions
      :quizzes="quizzes"
      :questions="questions"
      :chapters="chapters"    
      :subjects="subjects"    
      :question-search="questionSearch"
      :selected-quiz-filter="selectedQuizFilter"
      @openQuestionModal="openQuestionModal"
      @deleteQuestion="deleteQuestion"
      @update:selectedQuizFilter="selectedQuizFilter = $event"
    ></questions>
  </div>
  
  <!-- Subject Modal -->
  <div class="modal fade" id="subjectModal" tabindex="-1" role="dialog" aria-labelledby="subjectModalLabel" ref="subjectModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="subjectModalLabel">
            {{ modalMode === 'create' ? 'Add New Subject' : 'Edit Subject' }}
          </h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSubject">
            <div class="form-group">
              <label for="subjectName">Subject Name</label>
              <input 
                type="text" 
                class="form-control" 
                id="subjectName" 
                v-model="subjectForm.name" 
                required
              >
              <div class="invalid-feedback" v-if="errors.subjectName">
                {{ errors.subjectName }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="subjectDescription">Description</label>
              <textarea 
                class="form-control" 
                id="subjectDescription" 
                rows="4" 
                v-model="subjectForm.description"
              ></textarea>
            </div>
            
            <div class="form-group">
              <div class="custom-control custom-switch">
                <input 
                  type="checkbox" 
                  class="custom-control-input" 
                  id="subjectActive" 
                  v-model="subjectForm.is_active"
                >
                <label class="custom-control-label" for="subjectActive">Active</label>
              </div>
            </div>
            
            <div class="text-right">
              <button type="button" class="btn btn-secondary mr-2" data-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                {{ modalMode === 'create' ? 'Create Subject' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Chapter Modal -->
  <div class="modal fade" id="chapterModal" tabindex="-1" role="dialog" aria-labelledby="chapterModalLabel" ref="chapterModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="chapterModalLabel">
            {{ modalMode === 'create' ? 'Add New Chapter' : 'Edit Chapter' }}
          </h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveChapter">
            <div class="form-group">
              <label for="chapterSubject">Subject</label>
              <select 
                class="form-control" 
                id="chapterSubject" 
                v-model="chapterForm.subject_id" 
                required
              >
                <option value="" disabled>Select a subject</option>
                <option v-for="subject in activeSubjects" :key="subject.id" :value="subject.id">
                  {{ subject.name }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.chapterSubject">
                {{ errors.chapterSubject }}
              </div>
              <small class="form-text text-muted" v-if="subjects.length > 0 && activeSubjects.length === 0">
                No active subjects available. Please activate a subject first.
              </small>
              <small class="form-text text-muted" v-if="subjects.length === 0">
                No subjects available. Please create a subject first.
              </small>
            </div>
            
            <div class="form-group">
              <label for="chapterName">Chapter Name</label>
              <input 
                type="text" 
                class="form-control" 
                id="chapterName" 
                v-model="chapterForm.name" 
                required
              >
              <div class="invalid-feedback" v-if="errors.chapterName">
                {{ errors.chapterName }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="chapterDescription">Description</label>
              <textarea 
                class="form-control" 
                id="chapterDescription" 
                rows="4" 
                v-model="chapterForm.description"
              ></textarea>
            </div>
            
            <div class="form-group">
              <div class="custom-control custom-switch">
                <input 
                  type="checkbox" 
                  class="custom-control-input" 
                  id="chapterActive" 
                  v-model="chapterForm.is_active"
                >
                <label class="custom-control-label" for="chapterActive">Active</label>
              </div>
            </div>
            
            <div class="text-right">
              <button type="button" class="btn btn-secondary mr-2" data-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                {{ modalMode === 'create' ? 'Create Chapter' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Quiz Modal -->
  <div class="modal fade" id="quizModal" tabindex="-1" role="dialog" aria-labelledby="quizModalLabel" ref="quizModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="quizModalLabel">
            {{ modalMode === 'create' ? 'Add New Quiz' : 'Edit Quiz' }}
          </h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveQuiz">
            <div class="form-group">
              <label for="quizChapter">Chapter</label>
              <select 
                class="form-control" 
                id="quizChapter" 
                v-model="quizForm.chapter_id" 
                required
              >
                <option value="" disabled>Select a chapter</option>
                <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
                  {{ chapter.name }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.quizChapter">
                {{ errors.quizChapter }}
              </div>
            </div>

            <div class="form-group">
              <label for="quizName">Quiz Name</label>
              <input 
                type="text" 
                class="form-control" 
                id="quizName" 
                v-model="quizForm.name" 
                required
              >
              <div class="invalid-feedback" v-if="errors.quizName">
                {{ errors.quizName }}
              </div>
            </div>

            <div class="form-group">
              <label for="quizDate">Date of Quiz</label>
              <input 
                type="date" 
                class="form-control" 
                id="quizDate" 
                v-model="quizForm.date_of_quiz" 
                required
              >
              <div class="invalid-feedback" v-if="errors.quizDate">
                {{ errors.quizDate }}
              </div>
            </div>

            <div class="form-group">
              <label for="quizDuration">Duration</label>
              <div class="d-flex">
                <input 
                  type="number" 
                  class="form-control mr-2" 
                  id="quizDurationHours" 
                  v-model="quizForm.time_duration_hours" 
                  placeholder="Hours" 
                  required
                >
                <input 
                  type="number" 
                  class="form-control" 
                  id="quizDurationMinutes" 
                  v-model="quizForm.time_duration_minutes" 
                  placeholder="Minutes" 
                  required
                >
              </div>
              <div class="invalid-feedback" v-if="errors.quizDuration">
                {{ errors.quizDuration }}
              </div>
            </div>

            <div class="form-group">
              <div class="custom-control custom-switch">
                <input 
                  type="checkbox" 
                  class="custom-control-input" 
                  id="quizActive" 
                  v-model="quizForm.is_active"
                >
                <label class="custom-control-label" for="quizActive">Active</label>
              </div>
            </div>

            <div class="text-right">
              <button type="button" class="btn btn-secondary mr-2" data-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                {{ modalMode === 'create' ? 'Create Quiz' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Question Modal -->
  <div class="modal fade" id="questionModal" tabindex="-1" role="dialog" aria-labelledby="questionModalLabel" ref="questionModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="questionModalLabel">
            {{ modalMode === 'create' ? 'Add New Question' : 'Edit Question' }}
          </h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveQuestion">
            <div class="form-group">
              <label for="questionQuiz">Quiz</label>
              <select 
                class="form-control" 
                id="questionQuiz" 
                v-model="questionForm.quiz_id" 
                required
              >
                <option value="" disabled>Select a quiz</option>
                <option v-for="quiz in quizzes" :key="quiz.id" :value="quiz.id">
                  {{ quiz.name }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.questionQuiz">
                {{ errors.questionQuiz }}
              </div>
            </div>

            <div class="form-group">
              <label for="questionStatement">Question Statement</label>
              <textarea 
                class="form-control" 
                id="questionStatement" 
                rows="4" 
                v-model="questionForm.question_statement"
                required
              ></textarea>
              <div class="invalid-feedback" v-if="errors.questionStatement">
                {{ errors.questionStatement }}
              </div>
            </div>

            <div class="form-group">
              <label for="option1">Option 1</label>
              <input 
                type="text" 
                class="form-control" 
                id="option1" 
                v-model="questionForm.option1" 
                required
              >
              <div class="invalid-feedback" v-if="errors.option1">
                {{ errors.option1 }}
              </div>
            </div>

            <div class="form-group">
              <label for="option2">Option 2</label>
              <input 
                type="text" 
                class="form-control" 
                id="option2" 
                v-model="questionForm.option2" 
                required
              >
              <div class="invalid-feedback" v-if="errors.option2">
                {{ errors.option2 }}
              </div>
            </div>

            <div class="form-group">
              <label for="option3">Option 3</label>
              <input 
                type="text" 
                class="form-control" 
                id="option3" 
                v-model="questionForm.option3" 
                required
              >
              <div class="invalid-feedback" v-if="errors.option3">
                {{ errors.option3 }}
              </div>
            </div>

            <div class="form-group">
              <label for="option4">Option 4</label>
              <input 
                type="text" 
                class="form-control" 
                id="option4" 
                v-model="questionForm.option4" 
                required
              >
              <div class="invalid-feedback" v-if="errors.option4">
                {{ errors.option4 }}
              </div>
            </div>

            <div class="form-group">
              <label for="correctOption">Correct Option</label>
              <select 
                class="form-control" 
                id="correctOption" 
                v-model="questionForm.correct_option" 
                required
              >
                <option value="" disabled>Select the correct option</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
                <option value="4">Option 4</option>
              </select>
              <div class="invalid-feedback" v-if="errors.correctOption">
                {{ errors.correctOption }}
              </div>
            </div>

            <div class="form-group">
              <label for="explanation">Explanation</label>
              <textarea 
                class="form-control" 
                id="explanation" 
                rows="4" 
                v-model="questionForm.explanation"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="difficultyLevel">Difficulty Level</label>
              <select 
                class="form-control" 
                id="difficultyLevel" 
                v-model="questionForm.difficulty_level" 
                required
              >
                <option value="" disabled>Select difficulty level</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <div class="invalid-feedback" v-if="errors.difficultyLevel">
                {{ errors.difficultyLevel }}
              </div>
            </div>

            <div class="text-right">
              <button type="button" class="btn btn-secondary mr-2" data-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                {{ modalMode === 'create' ? 'Create Question' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notifications -->
  <toast 
    v-if="showToast" 
    :show-toast="showToast" 
    :toast-title="toastTitle" 
    :toast-message="toastMessage" 
    :toast-class="toastClass" 
    @hide-toast="hideToast"
  ></toast>
</div>
  `,
  data() {
    return {
      // System Info
      currentUser: 'alienXsupreme',
      currentTimestamp: '2025-03-18 12:09:58',

      // Tab Management
      activeTab: localStorage.getItem('activeTab') || 'subjects',

      // Modal Management
      modalMode: 'create',
      isSubmitting: false,

      // Toast Notifications
      showToast: false,
      toastTitle: '',
      toastMessage: '',
      toastClass: '',

      // Form Validation
      errors: {},

      // Subject Management
      subjects: [],
      subjectSearch: '',
      subjectForm: {
        id: null,
        name: '',
        description: '',
        is_active: true,
        created_by: 'alienXsupreme',
        created_at: '2025-03-18 12:09:58',
        updated_by: 'alienXsupreme',
        updated_at: '2025-03-18 12:09:58'
      },

      // Chapter Management
      chapters: [],
      chapterSearch: '',
      selectedSubjectFilter: '',
      chapterForm: {
        id: null,
        subject_id: '',
        name: '',
        description: '',
        is_active: true,
        created_by: 'alienXsupreme',
        created_at: '2025-03-18 12:09:58',
        updated_by: 'alienXsupreme',
        updated_at: '2025-03-18 12:09:58'
      },

      // Quiz Management
      quizzes: [],
      quizSearch: '',
      selectedChapterFilter: '',
      quizForm: {
        id: null,
        chapter_id: '',
        name: '',
        date_of_quiz: '',
        time_duration_hours: 0,
        time_duration_minutes: 0,
        remarks: '',
        is_active: true,
        created_by: 'alienXsupreme',
        created_at: '2025-03-18 12:09:58',
        updated_by: 'alienXsupreme',
        updated_at: '2025-03-18 12:09:58'
      },

      // Question Management
      questions: [],
      questionSearch: '',
      selectedQuizFilter: '',
      questionForm: {
        id: null,
        quiz_id: '',
        question_statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: '',
        explanation: '',
        difficulty_level: 'Medium',
        marks: 1,
        created_by: 'alienXsupreme',
        created_at: '2025-03-18 12:09:58',
        updated_by: 'alienXsupreme',
        updated_at: '2025-03-18 12:09:58'
      }
    };
  },
  computed: {
    activeSubjects() {
      return this.subjects.filter(subject => subject.is_active);
    },
    activeChapters() {
      return this.chapters.filter(chapter => chapter.is_active);
    },
    activeQuizzes() {
      return this.quizzes.filter(quiz => quiz.is_active);
    }
  },
  methods: {
    setActiveTab(tab) {
      console.log('Setting activeTab to:', tab); // Add console log
      this.activeTab = tab;
      localStorage.setItem('activeTab', tab);
    },
    // Subject Modal Methods
    openSubjectModal(mode, subject = null) {
      this.modalMode = mode;
      this.errors = {};
      if (mode === 'edit' && subject) {
        this.subjectForm = {
          ...subject,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        };
      } else {
        this.subjectForm = {
          id: null,
          name: '',
          description: '',
          is_active: true,
          created_by: this.currentUser,
          created_at: this.currentTimestamp,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        };
      }
      $(this.$refs.subjectModal).modal('show');
    },
    // Chapter Modal Methods
    openChapterModal(mode, chapter = null) {
      this.modalMode = mode;
      this.errors = {};
      if (this.subjects.length === 0) {
        this.showToastNotification('Error', 'Please create subjects first', 'danger');
        return;
      }
      if (mode === 'edit' && chapter) {
        this.chapterForm = {
          ...chapter,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        };
      } else {
        const firstActiveSubject = this.activeSubjects[0];
        this.chapterForm = {
          id: null,
          subject_id: firstActiveSubject ? firstActiveSubject.id : '',
          name: '',
          description: '',
          is_active: true,
          created_by: this.currentUser,
          created_at: this.currentTimestamp,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        };
      }
      $(this.$refs.chapterModal).modal('show');
    },
    // Quiz Modal Methods
    openQuizModal(mode, quiz = null) {
      this.modalMode = mode;
      this.errors = {};
      if (mode === 'edit' && quiz) {
        this.quizForm = {
          ...quiz,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        };
      } else {
        this.quizForm = {
          id: null,
          chapter_id: this.chapters.length > 0 ? this.chapters[0].id : '',
          name: '',
          date_of_quiz: '',
          time_duration_hours: 0,
          time_duration_minutes: 0,
          remarks: '',
          is_active: true,
          created_by: this.currentUser,
          created_at: this.currentTimestamp,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        };
      }
      $(this.$refs.quizModal).modal('show');
    },
    // Question Modal Methods
    openQuestionModal(mode, question = null) {
      this.modalMode = mode;
      this.errors = {};
      if (mode === 'edit' && question) {
        this.questionForm = {
          ...question,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        };
      } else {
        this.questionForm = {
          id: null,
          quiz_id: this.quizzes.length > 0 ? this.quizzes[0].id : '',
          question_statement: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correct_option: '',
          explanation: '',
          difficulty_level: 'Medium',
          marks: 1,
          created_by: this.currentUser,
          created_at: this.currentTimestamp,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        };
      }
      $(this.$refs.questionModal).modal('show');
    },
    // Subject CRUD Methods
    async saveSubject() {
      this.isSubmitting = true;
      try {
        const response = await (this.modalMode === 'create'
          ? this.createSubject()
          : this.updateSubject(this.subjectForm.id)
        );
        this.showToastNotification('Success', response.message, 'success');
        $(this.$refs.subjectModal).modal('hide');
        await this.fetchSubjects();
      } catch (error) {
        this.errors = await error.json();
        this.showToastNotification('Error', this.errors.message, 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },
    async createSubject() {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.$store.state.auth_token
        },
        body: JSON.stringify({
          ...this.subjectForm,
          is_active: true
        })
      });
      if (!response.ok) throw response;
      return response.json();
    },
    async updateSubject(subjectId) {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.$store.state.auth_token
        },
        body: JSON.stringify({
          ...this.subjectForm,
          is_active: true,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        })
      });
      if (!response.ok) throw response;
      return response.json();
    },
    async deleteSubject(subjectId) {
      if (!confirm('Are you sure you want to delete this subject?')) return;
      try {
        const response = await fetch(`/api/subjects/${subjectId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.$store.state.auth_token
          }
        });
        if (!response.ok) throw response;
        const data = await response.json();
        this.showToastNotification('Success', data.message, 'success');
        await this.fetchSubjects();
      } catch (error) {
        const data = await error.json();
        this.showToastNotification('Error', data.message, 'danger');
      }
    },
    // Chapter CRUD Methods
    async saveChapter() {
      this.isSubmitting = true;
      try {
        const response = await (this.modalMode === 'create'
          ? this.createChapter()
          : this.updateChapter(this.chapterForm.id)
        );
        this.showToastNotification('Success', response.message, 'success');
        $(this.$refs.chapterModal).modal('hide');
        await this.fetchChapters();
      } catch (error) {
        this.errors = await error.json();
        console.error('Error creating/updating chapter:', this.errors);
        this.showToastNotification('Error', this.errors.message, 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },
    async createChapter() {
      if (!this.chapterForm.subject_id) {
        this.errors = { chapterSubject: 'Please select a subject' };
        throw new Error('Subject selection required');
      }
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.$store.state.auth_token
        },
        body: JSON.stringify({
          ...this.chapterForm,
          is_active: true,
          subject_id: Number(this.chapterForm.subject_id)
        })
      });
      if (!response.ok) throw response;
      const result = await response.json();
      console.log('Created chapter:', result);
      return result;
    },
    async updateChapter(chapterId) {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.$store.state.auth_token
        },
        body: JSON.stringify({
          ...this.chapterForm,
          is_active: true,
          subject_id: Number(this.chapterForm.subject_id),
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        })
      });
      if (!response.ok) throw response;
      const result = await response.json();
      console.log('Updated chapter:', result);
      return result;
    },
    async deleteChapter(chapterId) {
      if (!confirm('Are you sure you want to delete this chapter?')) return;
      try {
        const response = await fetch(`/api/chapters/${chapterId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.$store.state.auth_token
          }
        });
        if (!response.ok) throw response;
        const data = await response.json();
        this.showToastNotification('Success', data.message, 'success');
        await this.fetchChapters();
      } catch (error) {
        const data = await error.json();
        this.showToastNotification('Error', data.message, 'danger');
      }
    },
    // Quiz CRUD Methods
    async saveQuiz() {
      this.isSubmitting = true;
      try {
        const response = await (this.modalMode === 'create'
          ? this.createQuiz()
          : this.updateQuiz(this.quizForm.id)
        );
        this.showToastNotification('Success', response.message, 'success');
        $(this.$refs.quizModal).modal('hide');
        await this.fetchQuizzes();
      } catch (error) {
        this.errors = await error.json();
        this.showToastNotification('Error', this.errors.message, 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },
    async createQuiz() {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.$store.state.auth_token
        },
        body: JSON.stringify({
          ...this.quizForm,
          is_active: true
        })
      });
      if (!response.ok) throw response;
      return response.json();
    },
    async updateQuiz(quizId) {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.$store.state.auth_token
        },
        body: JSON.stringify({
          ...this.quizForm,
          is_active: true,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        })
      });
      if (!response.ok) throw response;
      return response.json();
    },
    async deleteQuiz(quizId) {
      if (!confirm('Are you sure you want to delete this quiz?')) return;
      try {
        const response = await fetch(`/api/quizzes/${quizId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.$store.state.auth_token
          }
        });
        if (!response.ok) throw response;
        const data = await response.json();
        this.showToastNotification('Success', data.message, 'success');
        await this.fetchQuizzes();
      } catch (error) {
        const data = await error.json();
        this.showToastNotification('Error', data.message, 'danger');
      }
    },
    // Question CRUD Methods
    async saveQuestion() {
      this.isSubmitting = true;
      try {
        const response = await (this.modalMode === 'create'
          ? this.createQuestion()
          : this.updateQuestion(this.questionForm.id)
        );
        this.showToastNotification('Success', response.message, 'success');
        $(this.$refs.questionModal).modal('hide');
        await this.fetchQuestions();
      } catch (error) {
        this.errors = await error.json();
        this.showToastNotification('Error', this.errors.message, 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },
    async createQuestion() {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.$store.state.auth_token
        },
        body: JSON.stringify({
          ...this.questionForm,
          is_active: true
        })
      });
      if (!response.ok) throw response;
      return response.json();
    },
    async updateQuestion(questionId) {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': this.$store.state.auth_token
        },
        body: JSON.stringify({
          ...this.questionForm,
          is_active: true,
          updated_by: this.currentUser,
          updated_at: this.currentTimestamp
        })
      });
      if (!response.ok) throw response;
      return response.json();
    },
    async deleteQuestion(questionId) {
      if (!confirm('Are you sure you want to delete this question?')) return;
      try {
        const response = await fetch(`/api/questions/${questionId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.$store.state.auth_token
          }
        });
        if (!response.ok) throw response;
        const data = await response.json();
        this.showToastNotification('Success', data.message, 'success');
        await this.fetchQuestions();
      } catch (error) {
        const data = await error.json();
        this.showToastNotification('Error', data.message, 'danger');
      }
    },
    // Data Fetching Methods
    async fetchSubjects() {
      try {
        const response = await fetch('/api/subjects', {
          headers: {
            'Authentication-Token': this.$store.state.auth_token
          }
        });
        if (!response.ok) throw response;
        const subjects = await response.json();
        this.subjects = subjects.map(subject => ({
          ...subject,
          is_active: subject.is_active === true || subject.is_active === 1 || true
        }));
        console.log('Fetched subjects:', this.subjects);
      } catch (error) {
        this.showToastNotification('Error', 'Failed to fetch subjects', 'danger');
      }
    },
    async fetchChapters() {
      try {
        const response = await fetch('/api/chapters', {
          headers: {
            'Authentication-Token': this.$store.state.auth_token
          }
        });
        if (!response.ok) throw response;
        const chapters = await response.json();
        this.chapters = chapters.map(chapter => ({
          ...chapter,
          is_active: chapter.is_active === true || chapter.is_active === 1
        }));
        console.log('Fetched chapters:', this.chapters);
      } catch (error) {
        this.showToastNotification('Error', 'Failed to fetch chapters', 'danger');
      }
    },
    async fetchQuizzes() {
      try {
        const response = await fetch('/api/quizzes', {
          headers: {
            'Authentication-Token': this.$store.state.auth_token
          }
        });
        if (!response.ok) throw response;
        const quizzes = await response.json();
        this.quizzes = quizzes.map(quiz => ({
          ...quiz,
          is_active: quiz.is_active === true || quiz.is_active === 1
        }));
        console.log('Fetched quizzes:', this.quizzes);
      } catch (error) {
        this.showToastNotification('Error', 'Failed to fetch quizzes', 'danger');
      }
    },
    async fetchQuestions() {
      try {
        const response = await fetch('/api/questions', {
          headers: {
            'Authentication-Token': this.$store.state.auth_token
          }
        });
        if (!response.ok) throw response;
        const questions = await response.json();
        this.questions = questions.map(question => ({
          ...question,
        }));
        console.log('Fetched questions:', this.questions);
      } catch (error) {
        this.showToastNotification('Error', 'Failed to fetch questions', 'danger');
      }
    },
    // Utility Methods
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getSubjectName(subjectId) {
      const subject = this.subjects.find(subject => subject.id === subjectId);
      return subject ? subject.name : 'Unknown';
    },
    getChapterName(chapterId) {
      const chapter = this.chapters.find(chapter => chapter.id === chapterId);
      return chapter ? chapter.name : 'Unknown';
    },
    getQuizName(quizId) {
      const quiz = this.quizzes.find(quiz => quiz.id === quizId);
      return quiz ? quiz.name : 'Unknown';
    },
    // Toast Methods
    showToastNotification(title, message, type) {
      this.toastTitle = title;
      this.toastMessage = message;
      this.toastClass = `bg-${type}`;
      this.showToast = true;
      setTimeout(() => this.hideToast(), 3000);
    },
    hideToast() {
      this.showToast = false;
    }
  },
  async mounted() {
    await this.fetchSubjects();
    await this.fetchChapters();
    await this.fetchQuizzes();
    await this.fetchQuestions();
  }
};


