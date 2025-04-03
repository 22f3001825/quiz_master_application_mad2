export default {
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="container">
          <div class="row align-items-center min-vh-75">
            <div class="col-lg-6 py-5 py-lg-0 order-2 order-lg-1">
              <h1 class="display-4 font-weight-bold mb-3 hero-title">
                <span class="d-block">Master Your Knowledge with</span>
                <span class="text-primary">Qvizz</span>
              </h1>
              <p class="lead mb-4 text-muted">
                Your ultimate exam preparation platform. Attempt quizzes, track progress, and excel in your studies with our comprehensive tools.
              </p>
              <div class="d-flex flex-column flex-sm-row">
                <router-link to="/register" class="btn btn-primary btn-lg px-4 mb-3 mb-sm-0 mr-sm-3 get-started-btn">
                  Get Started
                </router-link>
                <router-link to="/login" class="btn btn-outline-secondary btn-lg px-4">
                  Sign In
                </router-link>
              </div>
              <div class="mt-4 stats-container">
                <div class="row text-center">
                  <div class="col-4">
                    <h3 class="counter mb-0 font-weight-bold text-primary">10K+</h3>
                    <p class="text-muted">Users</p>
                  </div>
                  <div class="col-4">
                    <h3 class="counter mb-0 font-weight-bold text-primary">50+</h3>
                    <p class="text-muted">Subjects</p>
                  </div>
                  <div class="col-4">
                    <h3 class="counter mb-0 font-weight-bold text-primary">500+</h3>
                    <p class="text-muted">Quizzes</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6 order-1 order-lg-2 mb-5 mb-lg-0">
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section py-5">
        <div class="container">
          <div class="text-center mb-5">
            <h2 class="font-weight-bold">Why Choose Qvizz?</h2>
            <p class="text-muted">A complete solution for your exam preparation needs</p>
          </div>
          <div class="row">
            <div class="col-md-4 mb-4 feature-card" v-for="(feature, index) in features" :key="index">
              <div class="card h-100 border-0 shadow-sm hover-card">
                <div class="card-body text-center p-4">
                  <div class="feature-icon bg-primary-light text-primary mb-3 mx-auto">
                    <i :class="feature.icon"></i>
                  </div>
                  <h5 class="card-title">{{ feature.title }}</h5>
                  <p class="card-text text-muted">{{ feature.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works Section -->
      <div class="how-it-works-section py-5 bg-light">
        <div class="container">
          <div class="text-center mb-5">
            <h2 class="font-weight-bold">How It Works</h2>
            <p class="text-muted">Simple steps to enhance your learning</p>
          </div>
          <div class="row justify-content-center">
            <div class="col-lg-10">
              <div class="row">
                <div class="col-md-4 text-center mb-4 step-item" v-for="(step, index) in steps" :key="index">
                  <div class="step-number bg-primary text-white">{{ index + 1 }}</div>
                  <h5 class="mt-4">{{ step.title }}</h5>
                  <p class="text-muted">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Testimonials Section -->
      <div class="testimonials-section py-5">
        <div class="container">
          <div class="text-center mb-5">
            <h2 class="font-weight-bold">What Our Users Say</h2>
            <p class="text-muted">Join thousands of satisfied users</p>
          </div>
          <div id="testimonialCarousel" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item" v-for="(testimonial, index) in testimonials" :key="index" :class="{ active: index === 0 }">
                <div class="card border-0 shadow-sm testimonial-card">
                  <div class="card-body p-5 text-center">
                    <p class="lead mb-4">"{{ testimonial.quote }}"</p>
                    <div class="d-flex align-items-center justify-content-center">
                      <div class="text-left">
                        <h5 class="mb-0">{{ testimonial.name }}</h5>
                        <p class="text-muted mb-0">{{ testimonial.role }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <a class="carousel-control-prev" href="#testimonialCarousel" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#testimonialCarousel" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section py-5 bg-primary text-white">
        <div class="container text-center">
          <h2 class="font-weight-bold mb-3">Ready to Ace Your Exams?</h2>
          <p class="lead mb-4">Join Qvizz today and take your academic performance to the next level</p>
          <router-link to="/register" class="btn btn-light btn-lg px-5 cta-button">
            Get Started for Free
          </router-link>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer py-4 bg-dark text-white">
        <div class="container">
          <div class="row">
            <div class="col-md-6 mb-4 mb-md-0">
              <h5 class="text-white mb-3">Qvizz</h5>
              <p class="text-muted mb-0">Your ultimate exam preparation platform.</p>
            </div>
            <div class="col-md-6 text-md-right">
              <div class="d-flex flex-column flex-md-row justify-content-md-end">
                <a href="#" class="text-white mb-2 mb-md-0 mr-md-4">About</a>
                <a href="#" class="text-white mb-2 mb-md-0 mr-md-4">Contact</a>
                <a href="#" class="text-white mb-2 mb-md-0 mr-md-4">Privacy Policy</a>
                <a href="#" class="text-white">Terms of Service</a>
              </div>
              <p class="text-muted mt-3 mb-0">© 2025 Qvizz. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  data() {
    return {
      features: [
        {
          icon: 'fas fa-book',
          title: 'Multiple Subjects',
          description: 'Access quizzes from various subjects and prepare for any exam with our comprehensive collection.'
        },
        {
          icon: 'fas fa-chart-line',
          title: 'Performance Tracking',
          description: 'Track your progress with detailed analytics and insights to improve your performance.'
        },
        {
          icon: 'fas fa-clock',
          title: 'Timed Quizzes',
          description: 'Practice under exam conditions with our timed quiz mode to prepare for the real test.'
        },
        {
          icon: 'fas fa-mobile-alt',
          title: 'Mobile Friendly',
          description: 'Access Qvizz on any device - study whenever and wherever you want.'
        },
        {
          icon: 'fas fa-medal',
          title: 'Achievements',
          description: 'Earn badges and track your achievements as you progress through subjects.'
        },
        {
          icon: 'fas fa-users',
          title: 'Community',
          description: 'Join a community of learners and share your knowledge with others.'
        }
      ],
      steps: [
        {
          title: 'Sign Up',
          description: 'Create your free account and set up your profile with your learning preferences.'
        },
        {
          title: 'Choose Subjects',
          description: 'Browse through our extensive library of subjects and select what you want to learn.'
        },
        {
          title: 'Take Quizzes',
          description: 'Start taking quizzes, track your progress, and improve your knowledge.'
        }
      ],
      testimonials: [
        {
          quote: 'Qvizz helped me organize my study time effectively. I saw significant improvement in my test scores after just a few weeks!',
          name: 'Sarah Johnson',
          role: 'Computer Science Student'
        },
        {
          quote: 'The variety of subjects and the quality of questions are impressive. This platform has become an essential part of my study routine.',
          name: 'Michael Chen',
          role: 'Medical Student'
        },
        {
          quote: 'As a teacher, I find Qvizz invaluable for creating assessments for my students. The interface is intuitive and saves me hours of work.',
          name: 'Dr. Emily Williams',
          role: 'University Professor'
        }
      ]
    };
  },
  mounted() {
    // Add FontAwesome for icons
    if (!document.querySelector('#fontawesome-css')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.id = 'fontawesome-css';
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }

    // Add custom CSS for animations and styling
    if (!document.querySelector('#custom-home-css')) {
      const customStyle = document.createElement('style');
      customStyle.id = 'custom-home-css';
      customStyle.textContent = `
        body {
          overflow-x: hidden;
        }
        
        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
          min-height: 85vh;
          display: flex;
          align-items: center;
        }
        
        .hero-title {
          animation: fadeInUp 0.8s ease;
        }
        
        .hero-image-container {
          position: relative;
          animation: floatUpDown 5s ease-in-out infinite;
        }
        
        .hero-image {
          position: relative;
          z-index: 1;
          transition: transform 0.4s ease;
        }
        
        .hero-image:hover {
          transform: translateY(-10px);
        }
        
        .get-started-btn {
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: all 0.3s ease;
        }
        
        .get-started-btn:after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.4s ease;
          z-index: -1;
        }
        
        .get-started-btn:hover:after {
          left: 0;
        }
        
        .stats-container {
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
          animation-delay: 0.4s;
        }
        
        .counter {
          display: inline-block;
          animation: countUp 2.5s ease forwards;
        }
        
        /* Features Section */
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }
        
        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.2s; }
        .feature-card:nth-child(3) { animation-delay: 0.3s; }
        .feature-card:nth-child(4) { animation-delay: 0.4s; }
        .feature-card:nth-child(5) { animation-delay: 0.5s; }
        .feature-card:nth-child(6) { animation-delay: 0.6s; }
        
        .hover-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
        
        .feature-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }
        
        .hover-card:hover .feature-icon {
          transform: scale(1.1);
        }
        
        .bg-primary-light {
          background-color: rgba(0, 123, 255, 0.1);
        }
        
        /* How It Works Section */
        .step-item {
          position: relative;
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }
        
        .step-item:nth-child(1) { animation-delay: 0.2s; }
        .step-item:nth-child(2) { animation-delay: 0.4s; }
        .step-item:nth-child(3) { animation-delay: 0.6s; }
        
        .step-number {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          transition: transform 0.3s ease;
        }
        
        .step-item:hover .step-number {
          transform: scale(1.1);
        }
        
        /* Testimonials Section */
        .testimonial-card {
          max-width: 800px;
          margin: 0 auto;
          border-radius: 10px;
          transition: transform 0.3s ease;
        }
        
        .testimonial-avatar img {
          width: 60px;
          height: 60px;
          object-fit: cover;
        }
        
        .carousel-control-prev,
        .carousel-control-next {
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.6;
        }
        
        .carousel-control-prev {
          left: -20px;
        }
        
        .carousel-control-next {
          right: -20px;
        }
        
        /* CTA Section */
        .cta-section {
          position: relative;
          overflow: hidden;
        }
        
        .cta-button {
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: all 0.3s ease;
        }
        
        .cta-button:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0;
          background: rgba(0, 0, 0, 0.1);
          transition: all 0.4s ease;
          z-index: -1;
        }
        
        .cta-button:hover:after {
          height: 100%;
        }
        
        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes floatUpDown {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        @keyframes countUp {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .carousel-control-prev,
          .carousel-control-next {
            display: none;
          }
          
          .hero-section {
            min-height: auto;
            padding: 60px 0;
          }
        }
      `;
      document.head.appendChild(customStyle);
    }

    // Initialize animations on scroll
    this.initScrollAnimations();
  },
  methods: {
    initScrollAnimations() {
      // Simple scroll animation function
      const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .step-item');
        elements.forEach(element => {
          const elementPosition = element.getBoundingClientRect().top;
          const windowHeight = window.innerHeight;

          if (elementPosition < windowHeight - 100) {
            element.style.animationPlayState = 'running';
          }
        });
      };

      // Run on load
      animateOnScroll();

      // Add scroll event listener
      window.addEventListener('scroll', animateOnScroll);
    }
  }
};