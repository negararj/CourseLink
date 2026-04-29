# CourseLink — Project Overview

**Current scope:** HTML and CSS only (no database or backend). Pages are static.

## Project Title
**CourseLink**

## Brief Description
A student portal that supports students throughout their study journey by connecting classmates, centralizing course materials, and helping them track grades and exam readiness.

## Primary Users
- **Students** — view courses, notes, materials, calendar; enter grades; track margin to maintain a letter grade.
- **Instructors** — upload past papers, create quizzes/exams and their details, manage course content.

## Main Features & Functionality

| Feature | Description |
|--------|-------------|
| **Class connection** | Students from the same class can communicate; not limited to sections. |
| **Course data** | Data for every enrolled course: classmates’ notes, materials for exam prep. |
| **Calendar** | View exams and quizzes with details; see which material is included in each exam. |
| **Instructor tools** | Login, upload past papers, create quizzes/exams and show them to students. |
| **Grade tracking** | Students enter quiz/exam grades; system tracks how much percentage they can afford to lose to maintain a target letter grade. |

This panel helps students study more efficiently and know how much effort they need for their desired letter grade.

---

## (Future) Database — Data to Store
*For when you add a backend; not used in current HTML/CSS version.*

### 1. User data
- User ID  
- Name  
- University email  
- Role (student or instructor)  
- Course enrollments  
- Authentication credentials (hashed passwords)  

### 2. Course data
- Course ID and course name  
- Course syllabus and grading scheme  
- Assigned instructors  
- Enrolled students  

### 3. Academic data
- Task/assignment titles and descriptions  
- Deadlines and important dates (calendar)  
- Past papers  
- Sample quizzes per topic  
- Material documents (e.g. class notes, books)  
- External sources (e.g. YouTube links)  

### 4. Student performance
- Student-entered grades  
- Calculated course averages  
- Target letter grade  
- Remaining grade margins to maintain specific letter grades  

---

## Current Project Structure
- `Home.html` — Landing / main page with navbar  
- `Login.html` — Login (student/instructor)  
- `Evaluate.html` — Grade tracking / “how much can I lose”  
- `Database.html` — Data view (e.g. Class Notes, YouTube links)  
- `Images/` — web-icon.png, web-logo.png  
