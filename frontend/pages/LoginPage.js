export default {
  template: `
    <div class="min-vh-100 bg-light d-flex align-items-center" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card border-0 shadow-lg rounded-lg">
              <div class="card-body p-5">
                <!-- Header with improved styling -->
                <div class="text-center mb-4">
                  <h2 class="card-title fw-bold text-primary mb-2">Welcome Back!</h2>
                  <p class="text-muted">Sign in to access your account</p>
                  <hr class="my-4">
                </div>
                
                <!-- Alert message with animation -->
                <div v-if="message" :class="'alert alert-' + category + ' alert-dismissible fade show'" role="alert">
                  <i :class="'me-2 fa ' + (category === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle')"></i>
                  {{ message }}
                  <button type="button" class="btn-close" @click="message = null" aria-label="Close"></button>
                </div>
                
                <form @submit.prevent="submitLogin" class="needs-validation" novalidate>
                  <!-- Email field with improved validation -->
                  <div class="form-group mb-4">
                    <label for="email" class="form-label fw-semibold">Email Address</label>
                    <div class="input-group has-validation">
                      <span class="input-group-text bg-light text-primary">
                        <i class="fa fa-envelope"></i>
                      </span>
                      <input 
                        type="email" 
                        class="form-control form-control-lg" 
                        id="email" 
                        placeholder="yourname@example.com" 
                        v-model="email" 
                        :class="{'is-invalid': emailError}"
                        @input="validateEmail"
                        required 
                      />
                      <div class="invalid-feedback">
                        Please enter a valid email address.
                      </div>
                    </div>
                  </div>
                  
                  <!-- Password field with toggle visibility -->
                  <div class="form-group mb-4">
                    <div class="d-flex justify-content-between align-items-center">
                      <label for="password" class="form-label fw-semibold">Password</label>
                      
                    </div>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-primary">
                        <i class="fa fa-lock"></i>
                      </span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        class="form-control form-control-lg" 
                        id="password" 
                        placeholder="Enter your password" 
                        v-model="password" 
                        required 
                      />
                      <button 
                        class="btn btn-outline-secondary" 
                        type="button" 
                        @click="showPassword = !showPassword"
                        title="Toggle password visibility"
                      >
                        <i :class="'fa ' + (showPassword ? 'fa-eye-slash' : 'fa-eye')"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Remember me checkbox with improved styling -->
                  <div class="form-group mb-4">
                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
                      <label class="form-check-label" for="rememberMe">Remember me for 30 days</label>
                    </div>
                  </div>
                  
                  <!-- Submit button with loading state -->
                  <div class="form-group mb-4">
                    <button 
                      type="submit" 
                      class="btn btn-primary btn-lg w-100" 
                      :disabled="isLoading"
                      style="background: linear-gradient(to right, #4776E6, #8E54E9); border: none;"
                    >
                      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isLoading ? 'Signing in...' : 'Sign In' }}
                    </button>
                  </div>
                  
                  <!-- Registration link -->
                  <div class="text-center mt-4">
                    <p class="text-muted mb-3">Don't have an account yet?</p>
                    <router-link to="/register" class="btn btn-outline-primary btn-lg w-100">Create New Account</router-link>
                  </div>
                </form>
              </div>
            </div>
            
            <!-- Security note -->
            <div class="text-center mt-3">
              <small class="text-white">
               <!-- <i class="fa fa-lock me-1"></i> Your information is secured with SSL encryption
              </small> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      message: null,
      category: null,
      rememberMe: false,
      isLoading: false,
      showPassword: false,
      emailError: false
    };
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = this.email && !emailRegex.test(this.email);
    },

    async submitLogin() {
      this.validateEmail();
      if (this.emailError) {
        return;
      }

      try {
        this.isLoading = true;
        const payload = {
          email: this.email,
          password: this.password,
          rememberMe: this.rememberMe
        };
        console.log('Sending login request:', payload);
        const res = await fetch(`${location.origin}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.log('Response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Login successful:', data);
          localStorage.setItem('user', JSON.stringify(data));
          this.$store.commit('setUser', data);

          this.message = "Login successful! Redirecting to your dashboard...";
          this.category = 'success';

          setTimeout(() => {
            if (this.$store.state.role === 'user') {
              this.$router.push('/user/dashboard');
            } else if (this.$store.state.role === 'admin') {
              this.$router.push('/admin/dashboard');
            }
          }, 1500);
        } else {
          try {
            const errorData = await res.json();
            console.log('Login failed:', errorData);
            this.message = errorData.message || "Invalid email or password. Please try again.";
          } catch {
            this.message = "Login failed. Please check your credentials and try again.";
          }
          this.category = 'danger';
        }
      } catch (error) {
        console.error('Error during login:', error);
        this.message = 'A connection error occurred. Please check your internet connection and try again.';
        this.category = 'danger';
      } finally {
        this.isLoading = false;
      }
    }
  },
};