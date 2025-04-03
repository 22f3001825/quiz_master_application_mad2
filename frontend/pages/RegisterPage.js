export default {
  template: `
    <div class="min-vh-100 bg-light d-flex align-items-center" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card border-0 shadow-lg rounded-lg">
              <div class="card-body p-5">
                <!-- Header with improved styling -->
                <h2 class="card-title text-center mb-3 text-primary fw-bold">Welcome to Our Community!</h2>
                
                <div class="text-center mb-4">
                  <span class="badge bg-primary px-3 py-2 mb-3 rounded-pill">Create Your Account</span>
                  <p class="text-muted">Join us and enjoy the benefits of Qvizz</p>
                  <hr class="my-4">
                </div>
                
                <!-- Alert message with animation -->
                <div v-if="message" :class="'alert alert-' + category + ' alert-dismissible fade show'" role="alert">
                  <i :class="'me-2 fa ' + (category === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle')"></i>
                  {{ message }}
                  <button type="button" class="btn-close" @click="message = null" aria-label="Close"></button>
                </div>
                
                <form @submit.prevent="submitRegister" class="needs-validation" novalidate>
                  <!-- Email field with improved validation -->
                  <div class="form-group mb-3">
                    <label for="email" class="form-label fw-semibold">Email Address</label>
                    <div class="input-group has-validation">
                      <span class="input-group-text bg-light text-primary">
                        <i class="fa fa-envelope"></i>
                      </span>
                      <input 
                        type="email" 
                        class="form-control" 
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
                    <small class="form-text text-muted">We'll never share your email with anyone else</small>
                  </div>
                  
                  <!-- Password field with toggle visibility -->
                  <div class="form-group mb-3">
                    <label for="password" class="form-label fw-semibold">Create Password</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-primary">
                        <i class="fa fa-lock"></i>
                      </span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        class="form-control" 
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
                    <small class="form-text text-muted">For better security, consider using letters, numbers, and symbols</small>
                  </div>
                  
                  <!-- Full Name field -->
                  <div class="form-group mb-3">
                    <label for="full_name" class="form-label fw-semibold">Full Name</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-primary">
                        <i class="fa fa-user"></i>
                      </span>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="full_name" 
                        placeholder="First and last name" 
                        v-model="full_name" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <!-- Date of Birth field -->
                  <div class="form-group mb-3">
                    <label for="dob" class="form-label fw-semibold">Date of Birth</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-primary">
                        <i class="fa fa-calendar"></i>
                      </span>
                      <input 
                        type="date" 
                        class="form-control" 
                        id="dob" 
                        v-model="dob" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <!-- Qualification field as dropdown with matching styles -->
                  <div class="form-group mb-4">
                    <label for="qualification" class="form-label fw-semibold">Education/Qualification</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-primary">
                        <i class="fa fa-graduation-cap"></i>
                      </span>
                      <select 
                        class="form-select form-control" 
                        id="qualification" 
                        v-model="qualification" 
                        required
                        aria-label="Select your qualification"
                      >
                        <option value="" disabled selected>Select your qualification</option>
                        <option value="In School">In School</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Post Graduate">Post Graduate</option>
                        <option value="PhD">PhD</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Terms checkbox -->
                  <div class="form-group form-check mb-4">
                    <input type="checkbox" class="form-check-input" id="termsCheck" v-model="termsAgreed" required>
                    <label class="form-check-label" for="termsCheck">
                      I agree to the <a href="#" class="text-primary">Terms of Service</a> and <a href="#" class="text-primary">Privacy Policy</a>
                    </label>
                  </div>
                  
                  <!-- Submit button with loading state -->
                  <div class="form-group mb-4">
                    <button 
                      type="submit" 
                      class="btn btn-primary btn-lg w-100" 
                      :disabled="isLoading || !termsAgreed"
                      style="background: linear-gradient(to right, #4776E6, #8E54E9); border: none;"
                    >
                      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isLoading ? 'Creating Account...' : 'Create My Account' }}
                    </button>
                  </div>
                  
                  <!-- Login link -->
                  <div class="text-center mt-4">
                    <p class="text-muted mb-3">Already have an account?</p>
                    <router-link to="/login" class="btn btn-outline-primary btn-lg w-100">Sign In to Your Account</router-link>
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
      full_name: '',
      dob: '',
      qualification: '',
      message: null,
      category: null,
      isLoading: false,
      showPassword: false,
      emailError: false,
      termsAgreed: false
    };
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = this.email && !emailRegex.test(this.email);
    },
    async submitRegister() {
      this.validateEmail();
      if (this.emailError) {
        return;
      }

      try {
        this.isLoading = true;
        const res = await fetch(`${location.origin}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            full_name: this.full_name,
            dob: this.dob,
            qualification: this.qualification,
            role: 'user'
          }),
        });

        if (res.ok) {
          const data = await res.json();
          this.message = 'Success! Your account has been created. Redirecting to login...';
          this.category = 'success';

          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else {
          const errorData = await res.json();
          this.message = errorData.message || 'Registration failed. Please check your information and try again.';
          this.category = 'danger';
        }
      } catch (error) {
        this.message = 'An unexpected error occurred. Please try again later or contact support.';
        this.category = 'danger';
      } finally {
        this.isLoading = false;
      }
    },
  },
};