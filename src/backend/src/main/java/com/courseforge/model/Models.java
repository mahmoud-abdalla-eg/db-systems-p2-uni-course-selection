package com.courseforge.model;

import java.util.ArrayList;
import java.util.List;

public class Models {

    public static class User {
        public int id;
        public String userNo;
        public String name;
        public String email;
        public String major;
        public String role; // "STUDENT" or "ADMIN"
        public String token;

        public User() {}
        public User(int id, String userNo, String name, String email, String major, String role) {
            this.id = id;
            this.userNo = userNo;
            this.name = name;
            this.email = email;
            this.major = major;
            this.role = role;
        }
    }

    public static class Schedule {
        public int id;
        public int courseId;
        public int dayOfWeek; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
        public int startPeriod;
        public int endPeriod;
        public String classroom;

        public Schedule() {}
        public Schedule(int id, int courseId, int dayOfWeek, int startPeriod, int endPeriod, String classroom) {
            this.id = id;
            this.courseId = courseId;
            this.dayOfWeek = dayOfWeek;
            this.startPeriod = startPeriod;
            this.endPeriod = endPeriod;
            this.classroom = classroom;
        }

        public boolean overlaps(Schedule other) {
            if (this.dayOfWeek != other.dayOfWeek) {
                return false;
            }
            return !(this.endPeriod < other.startPeriod || this.startPeriod > other.endPeriod);
        }

        public String dayName() {
            return switch (dayOfWeek) {
                case 1 -> "Monday";
                case 2 -> "Tuesday";
                case 3 -> "Wednesday";
                case 4 -> "Thursday";
                case 5 -> "Friday";
                case 6 -> "Saturday";
                case 7 -> "Sunday";
                default -> "Day " + dayOfWeek;
            };
        }

        public String formatted() {
            return String.format("%s Period %d-%d (%s)", dayName(), startPeriod, endPeriod, classroom);
        }
    }

    public static class Prerequisite {
        public int courseId;
        public int prerequisiteCourseId;
        public String prerequisiteCode;
        public String prerequisiteTitle;

        public Prerequisite() {}
        public Prerequisite(int courseId, int prerequisiteCourseId, String prerequisiteCode, String prerequisiteTitle) {
            this.courseId = courseId;
            this.prerequisiteCourseId = prerequisiteCourseId;
            this.prerequisiteCode = prerequisiteCode;
            this.prerequisiteTitle = prerequisiteTitle;
        }
    }

    public static class Course {
        public int id;
        public String courseCode;
        public String title;
        public String department;
        public int credits;
        public int capacity;
        public int enrolledCount;
        public String instructor;
        public String semester;
        public String description;

        public List<Schedule> schedules = new ArrayList<>();
        public List<Prerequisite> prerequisites = new ArrayList<>();

        // Contextual fields for logged-in student
        public boolean isEnrolled = false;
        public boolean isSelectable = true;
        public String unselectableReason = null;
    }

    public static class HistoryRecord {
        public int id;
        public int userId;
        public int courseId;
        public String courseCode;
        public String title;
        public int credits;
        public String semester;
        public String grade;
        public String status; // "PASSED", "FAILED"
    }

    public static class Enrollment {
        public int id;
        public int userId;
        public int courseId;
        public String courseCode;
        public String title;
        public int credits;
        public String instructor;
        public String semester;
        public String status; // "ENROLLED", "DROPPED"
        public String enrolledAt;
        public List<Schedule> schedules = new ArrayList<>();
    }

    public static class StudentDashboard {
        public User user;
        public int currentCredits;
        public int maxCredits = 21;
        public List<Enrollment> enrolledCourses = new ArrayList<>();
        public List<Course> selectableCourses = new ArrayList<>();
        public List<HistoryRecord> academicHistory = new ArrayList<>();
    }

    public static class CourseEnrollRequest {
        public int courseId;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    public static class RegisterRequest {
        public String userNo;
        public String name;
        public String email;
        public String password;
        public String major;
    }
}
