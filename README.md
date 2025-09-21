# Qvizz - Exam Preparation Web Application  

**Qvizz** is a multi-user web application designed to help students prepare for exams efficiently.  
Built using **Flask**, **Vue.js**, **SQLite**, **Redis**, and **Celery**, it provides a seamless platform for administrators to create quizzes and for users to attempt them while tracking their performance with analytics.  

---

📽️ **Demo Video:** [Watch on YouTube](https://youtu.be/Opdc3bGqENc?si=UHCgt8Lzy6Fe5V8m)  

---

## 🚀 Features  

- **User Authentication** – Secure login and registration system  
- **Quiz Management** – Admins can create and manage subjects, chapters, and quizzes  
- **Time-Based Tests** – Configurable quiz durations for exam-like practice  
- **Real-Time Scoring** – Instant evaluation of quiz attempts  
- **Performance Analytics** – Users can track progress with detailed reports and charts  
- **Automated Reminders** – Celery tasks handle periodic email reminders  
- **Data Export** – Admins can export reports in CSV format  

---

## 🛠 Tech Stack  

**Backend**  
- Flask, Flask-RESTful  
- SQLAlchemy, SQLite  
- Redis (for caching and async tasks)  
- Celery (for background tasks)  

**Frontend**  
- Vue.js  
- Bootstrap  
- Chart.js (for data visualization)  

**Authentication**  
- Flask-Security  

**Email Service**  
- MailHog (for development email testing)  

---

## 📦 Installation & Setup  

### 1. Create a Virtual Environment  

```sh
python3 -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

### **2. Install Dependencies**

```sh
pip install -r requirement.txt
```

### **3. Start the Services**

#### **Backend & Redis**

```sh
sudo service redis-server start
flask run : python3 app.py
```

#### **Mail Service (MailHog)**

```sh
~/go/bin/MailHog
```

#### **Celery Workers & Scheduler**

```sh
celery -A app.celery_app worker -l INFO  # Start Celery worker
celery -A app.celery_app beat -l INFO    # Start Celery beat scheduler
```

## 📊 Usage

1. **Admin Panel**: Create subjects, chapters, and quizzes.
2. **User Dashboard**: Attempt quizzes and view performance analytics.
3. **Automated Reminders**: Email notifications for scheduled quizzes.
4. **Export Data**: Download reports in CSV format.

---

**Developed by Ali Jawad as part of the Modern Application Development course at IIT Madras.**
