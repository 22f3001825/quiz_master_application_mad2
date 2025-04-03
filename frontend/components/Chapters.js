export default {
  template: `
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Chapter Management</h2>
      <button class="btn btn-primary" @click="$emit('openChapterModal', 'create')" :disabled="subjects.length === 0">
        <i class="fas fa-plus"></i> Add Chapter
      </button>
    </div>
    <label for ="subjectFilter">Filter by Subject</label>
    <div class="row mb-3">
      <div class="col-md-6">
        <select class="form-control" v-model="selectedSubjectFilter">
          <option value="">All Subjects</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">{{ subject.name }}</option>
        </select>
      </div>
      <div class="col-md-6">
        <input type="text" class="form-control" placeholder="Search chapters..." v-model="chapterSearch">
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Chapter Name</th>
            <th>Subject</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="chapter in filteredChapters" :key="chapter.id">
            <td>{{ chapter.name }}</td>
            <td>{{ getSubjectName(chapter.subject_id) }}</td>
            <td>{{ truncateText(chapter.description, 50) }}</td>
            <td>
              <span class="badge" :class="chapter.is_active ? 'badge-secondary' : 'badge-success'">
                {{ chapter.is_active ? 'inactive' : 'Active' }}
              </span>
            </td>
            <td>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-secondary" @click="$emit('openChapterModal', 'edit', chapter)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="$emit('deleteChapter', chapter.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
          
          <tr v-if="filteredChapters.length === 0">
            <td colspan="5" class="text-center py-5">
              <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
              <h5 class="text-muted">No chapters found</h5>
              <p class="text-muted" v-if="chapterSearch || selectedSubjectFilter">Try removing filters</p>
              <p class="text-muted" v-else-if="subjects.length === 0">Please create a subject first</p>
              <p class="text-muted" v-else>Add your first chapter to get started</p>
              <button class="btn btn-primary mt-2" @click="$emit('openChapterModal', 'create')" :disabled="subjects.length === 0">
                Add Chapter
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
  props: {
    subjects: Array,
    chapters: Array,
    chapterSearch: String,
    selectedSubjectFilter: String
  },
  computed: {
    filteredChapters() {
      let chapters = this.chapters;
      
      if (this.selectedSubjectFilter) {
        chapters = chapters.filter(chapter => 
          chapter.subject_id === this.selectedSubjectFilter
        );
      }
      
      if (this.chapterSearch) {
        const searchTerm = this.chapterSearch.toLowerCase();
        chapters = chapters.filter(chapter => 
          chapter.name.toLowerCase().includes(searchTerm)
        );
      }
      
      return chapters;
    }
  },
  methods: {
    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getSubjectName(subjectId) {
      const subject = this.subjects.find(subject => subject.id === subjectId);
      return subject ? subject.name : 'Unknown';
    }
  }
};