export default {
  template: `
  <ul class="nav nav-tabs mb-4">
    <li class="nav-item_subjects">
      <a class="nav-link" :class="{ active: activeTab === 'subjects' }" href="#" @click.prevent="setActiveTab('subjects')">Subjects</a>
    </li>
    <li class="nav-item_chapters">
      <a class="nav-link" :class="{ active: activeTab === 'chapters' }" href="#" @click.prevent="setActiveTab('chapters')">Chapters</a>
    </li>
    <li class="nav-item_quizzes">
      <a class="nav-link" :class="{ active: activeTab === 'quizzes' }" href="#" @click.prevent="setActiveTab('quizzes')">Quizzes</a>
    </li>
    <li class="nav-item_questions">
      <a class="nav-link" :class="{ active: activeTab === 'questions' }" href="#" @click.prevent="setActiveTab('questions')">Questions</a>
    </li>
  </ul>
  `,
  props: ['activeTab'],
  methods: {
    setActiveTab(tab) {
      this.$emit('update:activeTab', tab);
    }
  }
};