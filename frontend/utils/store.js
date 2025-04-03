const store = new Vuex.Store({
  state: {
    auth_token: null,
    role: null,
    loggedIn: false,
    user_id: null,
    user_email: null,
    user_name: null,
    currentUser: 'alienXsupreme',
    lastUpdated: '2025-03-18 00:40:48',
    subjects: [],
    chapters: [],
    quizzes: [],
    questions: []
  },

  mutations: {
    setUser(state, user) {
      if (user) {
        state.auth_token = user.token;
        state.role = user.role;
        state.user_id = user.id;
        state.user_email = user.email;
        state.user_name = user.full_name;
        state.loggedIn = true;
        state.currentUser = 'alienXsupreme';
        state.lastUpdated = new Date().toISOString().slice(0, 19).replace('T', ' ');
        localStorage.setItem('user', JSON.stringify(user));
      }
    },

    logout(state) {
      state.auth_token = null;
      state.role = null;
      state.user_id = null;
      state.user_email = null;
      state.loggedIn = false;
      localStorage.removeItem('user');
    },

    setSubjects(state, subjects) {
      state.subjects = subjects;
    },

    addSubject(state, subject) {
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const subjectWithMeta = {
        ...subject,
        created_by: state.currentUser,
        created_at: currentTime,
        last_modified_by: state.currentUser,
        last_modified_at: currentTime
      };
      state.subjects.push(subjectWithMeta);
    },

    updateSubject(state, updatedSubject) {
      const index = state.subjects.findIndex(s => s.id === updatedSubject.id);
      if (index !== -1) {
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const subjectWithMeta = {
          ...updatedSubject,
          last_modified_by: state.currentUser,
          last_modified_at: currentTime
        };
        state.subjects.splice(index, 1, subjectWithMeta);
      }
    },

    removeSubject(state, subjectId) {
      state.subjects = state.subjects.filter(s => s.id !== subjectId);
    },

    setChapters(state, chapters) {
      state.chapters = chapters;
    },

    addChapter(state, chapter) {
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const chapterWithMeta = {
        ...chapter,
        created_by: state.currentUser,
        created_at: currentTime,
        last_modified_by: state.currentUser,
        last_modified_at: currentTime
      };
      state.chapters.push(chapterWithMeta);
    },

    updateChapter(state, updatedChapter) {
      const index = state.chapters.findIndex(c => c.id === updatedChapter.id);
      if (index !== -1) {
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const chapterWithMeta = {
          ...updatedChapter,
          last_modified_by: state.currentUser,
          last_modified_at: currentTime
        };
        state.chapters.splice(index, 1, chapterWithMeta);
      }
    },

    removeChapter(state, chapterId) {
      state.chapters = state.chapters.filter(c => c.id !== chapterId);
    },

    setQuizzes(state, quizzes) {
      state.quizzes = quizzes;
    },

    addQuiz(state, quiz) {
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const quizWithMeta = {
        ...quiz,
        created_by: state.currentUser,
        created_at: currentTime,
        last_modified_by: state.currentUser,
        last_modified_at: currentTime
      };
      state.quizzes.push(quizWithMeta);
    },

    updateQuiz(state, updatedQuiz) {
      const index = state.quizzes.findIndex(q => q.id === updatedQuiz.id);
      if (index !== -1) {
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const quizWithMeta = {
          ...updatedQuiz,
          last_modified_by: state.currentUser,
          last_modified_at: currentTime
        };
        state.quizzes.splice(index, 1, quizWithMeta);
      }
    },

    removeQuiz(state, quizId) {
      state.quizzes = state.quizzes.filter(q => q.id !== quizId);
    },

    setQuestions(state, questions) {
      state.questions = questions;
    },

    addQuestion(state, question) {
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const questionWithMeta = {
        ...question,
        created_by: state.currentUser,
        created_at: currentTime,
        last_modified_by: state.currentUser,
        last_modified_at: currentTime
      };
      state.questions.push(questionWithMeta);
    },

    updateQuestion(state, updatedQuestion) {
      const index = state.questions.findIndex(q => q.id === updatedQuestion.id);
      if (index !== -1) {
        const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const questionWithMeta = {
          ...updatedQuestion,
          last_modified_by: state.currentUser,
          last_modified_at: currentTime
        };
        state.questions.splice(index, 1, questionWithMeta);
      }
    },

    removeQuestion(state, questionId) {
      state.questions = state.questions.filter(q => q.id !== questionId);
    }
  },

  actions: {
    async fetchSubjects({ commit, state }) {
      try {
        const response = await fetch('/api/subjects', {
          headers: {
            'Authentication-Token': state.auth_token
          }
        });
        if (!response.ok) throw response;
        const subjects = await response.json();
        commit('setSubjects', subjects);
        return subjects;
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        throw error;
      }
    },
    
    async createSubject({ commit, state }, subjectData) {
      try {
        const response = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': state.auth_token
          },
          body: JSON.stringify({
            ...subjectData,
            created_by: state.currentUser,
            created_at: state.lastUpdated
          })
        });
        if (!response.ok) throw response;
        const newSubject = await response.json();
        commit('addSubject', newSubject);
        return newSubject;
      } catch (error) {
        console.error('Failed to create subject:', error);
        throw error;
      }
    },

    async fetchChapters({ commit, state }) {
      try {
        const response = await fetch('/api/chapters', {
          headers: {
            'Authentication-Token': state.auth_token
          }
        });
        if (!response.ok) throw response;
        const chapters = await response.json();
        commit('setChapters', chapters);
        return chapters;
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
        throw error;
      }
    },

    async fetchQuizzes({ commit, state }) {
      try {
        const response = await fetch('/api/quizzes', {
          headers: {
            'Authentication-Token': state.auth_token
          }
        });
        if (!response.ok) throw response;
        const quizzes = await response.json();
        commit('setQuizzes', quizzes);
        return quizzes;
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        throw error;
      }
    },

    async createQuiz({ commit, state }, quizData) {
      try {
        const response = await fetch('/api/quizzes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': state.auth_token
          },
          body: JSON.stringify({
            ...quizData,
            created_by: state.currentUser,
            created_at: state.lastUpdated
          })
        });
        if (!response.ok) throw response;
        const newQuiz = await response.json();
        commit('addQuiz', newQuiz);
        return newQuiz;
      } catch (error) {
        console.error('Failed to create quiz:', error);
        throw error;
      }
    },

    async fetchQuestions({ commit, state }) {
      try {
        const response = await fetch('/api/questions', {
          headers: {
            'Authentication-Token': state.auth_token
          }
        });
        if (!response.ok) throw response;
        const questions = await response.json();
        commit('setQuestions', questions);
        return questions;
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        throw error;
      }
    },

    async createQuestion({ commit, state }, questionData) {
      try {
        const response = await fetch('/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': state.auth_token
          },
          body: JSON.stringify({
            ...questionData,
            created_by: state.currentUser,
            created_at: state.lastUpdated
          })
        });
        if (!response.ok) throw response;
        const newQuestion = await response.json();
        commit('addQuestion', newQuestion);
        return newQuestion;
      } catch (error) {
        console.error('Failed to create question:', error);
        throw error;
      }
    },

    async fetchUserProfile({ commit, state }) {
      try {
        console.log('Fetching user profile with ID:', state.user_id);  // Debug log
        const response = await fetch(`/api/users/${state.user_id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': state.auth_token
          }
        });
        if (!response.ok) throw response;
        const user = await response.json();
        commit('setUser', user);
        return user;
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
      }
    }
  }
});

// Initialize user from localStorage
const savedUser = localStorage.getItem('user');
if (savedUser) {
  store.commit('setUser', JSON.parse(savedUser));
}

export default store;