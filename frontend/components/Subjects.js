export default {
  template: `
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>Subject Management</h2>
      <button class="btn btn-primary" @click="$emit('openSubjectModal', 'create')">
        <i class="fas fa-plus"></i> Add Subject
      </button>
    </div>
    
    <div class="mb-3">
      <input type="text" class="form-control" placeholder="Search subjects..." v-model="subjectSearch">
    </div>
    
    <div class="row">
      <div class="col-md-4 mb-4" v-for="subject in filteredSubjects" :key="subject.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title">{{ subject.name }}</h5>
            <p class="card-text text-muted small">Last updated: {{ formatDate(subject.updated_at) }}</p>
            <p class="card-text">{{ subject.description }}</p>
          </div>
          <div class="card-footer bg-white border-top-0">
            <div class="btn-group w-100">
              <button class="btn btn-sm btn-outline-secondary" @click="$emit('openSubjectModal', 'edit', subject)">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="$emit('deleteSubject', subject.id)">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-12 text-center py-5" v-if="filteredSubjects.length === 0">
        <div class="py-5">
          <i class="fas fa-book fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No subjects found</h5>
          <p class="text-muted" v-if="subjectSearch">Try a different search term</p>
          <p class="text-muted" v-else>Add your first subject to get started</p>
          <button class="btn btn-primary mt-2" @click="$emit('openSubjectModal', 'create')">Add Subject</button>
        </div>
      </div>
    </div>
  </div>
  `,
  props: {
    subjects: Array,
    subjectSearch: String
  },
  computed: {
    filteredSubjects() {
      if (!this.subjectSearch) return this.subjects;
      
      const searchTerm = this.subjectSearch.toLowerCase();
      return this.subjects.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm)
      );
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }
  }
};