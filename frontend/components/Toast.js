export default {
  template: `
  <div v-if="showToast" class="toast show" role="alert" aria-live="assertive" aria-atomic="true" :class="toastClass">
    <div class="toast-header">
      <strong class="mr-auto">{{ toastTitle }}</strong>
      <button type="button" class="ml-2 mb-1 close" aria-label="Close" @click="hideToast">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body">
      {{ toastMessage }}
    </div>
  </div>
  `,
  props: {
    showToast: Boolean,
    toastTitle: String,
    toastMessage: String,
    toastClass: String
  },
  methods: {
    hideToast() {
      this.$emit('hide-toast');
    }
  }
};