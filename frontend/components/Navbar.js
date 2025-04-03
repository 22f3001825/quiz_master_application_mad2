export default {
  template: `
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="logo">
        <span class="logo-text">Qvizz</span>
      </router-link>
      <button class="menu-toggle" @click="toggleMobileMenu" aria-label="Toggle navigation menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    
    <div class="navbar-links" :class="{ 'active': mobileMenuOpen }">
      <router-link to="/" class="nav-link" exact-active-class="active">Home</router-link>
      
      <template v-if="!$store.state.loggedIn">
        <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
        <router-link to="/register" class="nav-link" active-class="active">Register</router-link>
      </template>
      
      <template v-else>
        <router-link 
          v-if="$store.state.role === 'admin'" 
          to="/admin/dashboard" 
          class="nav-link" 
          active-class="active">
          Admin Dashboard
        </router-link>
        <router-link 
          v-if="$store.state.role === 'admin'" 
          to="/user/admin" 
          class="nav-link"  
          active-class="active">
          Users
        </router-link>
        <router-link
          v-if="$store.state.role === 'admin'"
          to="/admin/summary"
          class="nav-link"
          active-class="active">
          Summary
        </router-link>
        
        <router-link 
          v-if="$store.state.role === 'user'" 
          to="/user/dashboard" 
          class="nav-link" 
          active-class="active">
          User Dashboard
        </router-link>
        
        <button class="nav-button" @click.prevent="logout">
          <span class="button-text">Logout</span>
        </button>
      </template>
    </div>
  </nav>
  `,
  data() {
    return {
      mobileMenuOpen: false
    };
  },
  methods: {
    logout() {
      
      console.log('Logout clicked');
      this.$store.commit('logout');
      this.$router.push('/');
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    }
  },
  watch: {
    '$route'() {
      // Close mobile menu when route changes
      this.closeMobileMenu();
    }
  },
  // Adding mounted hook to check if router is accessible
  mounted() {
    console.log('Router available:', !!this.$router);
  }
}