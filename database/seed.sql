-- PlacementPortal Seed Data

USE placement_portal;

-- Seed Users (Passwords are 'password123' hashed with BCrypt - for demo purposes, assume backend handles hashing)
-- $2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C
INSERT INTO users (name, email, password_hash, role, phone) VALUES
('Admin TPO', 'admin@placement.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'ADMIN', '9876543210'),
('Google HR', 'hr@google.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'COMPANY', '9876543211'),
('Microsoft HR', 'hr@microsoft.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'COMPANY', '9876543212'),
('Amazon HR', 'hr@amazon.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'COMPANY', '9876543213'),
('Alice Smith', 'alice@student.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'STUDENT', '9876543214'),
('Bob Johnson', 'bob@student.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'STUDENT', '9876543215'),
('Charlie Brown', 'charlie@student.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'STUDENT', '9876543216'),
('David Wilson', 'david@student.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'STUDENT', '9876543217'),
('Eve Davis', 'eve@student.com', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5QLjLp7LpZ/v.nI0L8W1.zYhI2zG1C', 'STUDENT', '9876543218');

-- Seed Company Profiles
INSERT INTO company_profiles (user_id, company_name, industry, website, hr_name, verified) VALUES
(2, 'Google', 'Technology', 'https://google.com', 'Larry Page', TRUE),
(3, 'Microsoft', 'Software', 'https://microsoft.com', 'Satya Nadella', TRUE),
(4, 'Amazon', 'E-commerce', 'https://amazon.com', 'Jeff Bezos', TRUE);

-- Seed Student Profiles
INSERT INTO student_profiles (user_id, roll_number, department, batch_year, cgpa, skills, resume_url, placed) VALUES
(5, 'CS2021001', 'Computer Science', 2025, 8.5, 'Java, React, SQL', 'http://localhost:8080/uploads/resumes/alice_resume.pdf', FALSE),
(6, 'CS2021002', 'Computer Science', 2025, 7.8, 'Python, Django, AWS', 'http://localhost:8080/uploads/resumes/bob_resume.pdf', FALSE),
(7, 'EC2021003', 'Electronics', 2025, 9.2, 'C++, Embedded Systems', 'http://localhost:8080/uploads/resumes/charlie_resume.pdf', FALSE),
(8, 'IT2021004', 'Information Technology', 2025, 8.0, 'JavaScript, Node.js', 'http://localhost:8080/uploads/resumes/david_resume.pdf', FALSE),
(9, 'ME2021005', 'Mechanical', 2025, 8.9, 'CAD, MATLAB', 'http://localhost:8080/uploads/resumes/eve_resume.pdf', FALSE);

-- Seed Job Postings
INSERT INTO job_postings (company_id, title, description, eligibility_cgpa, eligible_departments, package_lpa, job_type, location, last_date, status) VALUES
(1, 'Software Engineer', 'Develop scalable web applications using Java and React.', 8.0, 'Computer Science, IT', 25.5, 'FULL_TIME', 'Mountain View, CA', '2026-05-01', 'OPEN'),
(1, 'Data Scientist', 'Analyze large datasets and build ML models.', 8.5, 'Computer Science, Mathematics', 30.0, 'FULL_TIME', 'New York, NY', '2026-05-15', 'OPEN'),
(2, 'SDE I', 'Cloud platform development for Azure.', 7.5, 'Computer Science, IT, Electronics', 18.0, 'FULL_TIME', 'Redmond, WA', '2026-04-30', 'OPEN'),
(2, 'Cloud Intern', '3-month internship on cloud services.', 7.0, 'Computer Science, IT', 5.0, 'INTERNSHIP', 'Remote', '2026-05-10', 'OPEN'),
(3, 'Full Stack Developer', 'End-to-end development for AWS services.', 8.0, 'Computer Science, IT', 22.0, 'FULL_TIME', 'Seattle, WA', '2026-05-20', 'OPEN'),
(3, 'Frontend Engineer', 'UI development for Amazon.com.', 7.5, 'Any', 15.0, 'FULL_TIME', 'Bangalore, India', '2026-05-05', 'OPEN'),
(1, 'Product Manager', 'Oversee product lifecycle.', 8.0, 'Any', 20.0, 'FULL_TIME', 'San Francisco, CA', '2026-04-25', 'OPEN'),
(2, 'Support Engineer', 'Technical support for enterprise customers.', 6.5, 'Any', 10.0, 'FULL_TIME', 'Hyderabad, India', '2026-05-30', 'OPEN');

-- Seed Applications
INSERT INTO applications (student_id, job_id, status) VALUES
(1, 1, 'SHORTLISTED'),
(1, 2, 'APPLIED'),
(2, 1, 'APPLIED'),
(2, 3, 'SHORTLISTED'),
(3, 3, 'SELECTED'),
(4, 5, 'APPLIED'),
(5, 6, 'REJECTED'),
(1, 3, 'INTERVIEW_SCHEDULED'),
(2, 5, 'APPLIED'),
(3, 1, 'SELECTED');

-- Seed Interviews
INSERT INTO interviews (application_id, scheduled_at, mode, venue_or_link, round, result) VALUES
(8, '2026-05-02 10:00:00', 'ONLINE', 'https://meet.google.com/abc-defg-hij', 1, 'PENDING');

-- Seed Notifications
INSERT INTO notifications (user_id, message) VALUES
(5, 'Your application for Software Engineer has been shortlisted!'),
(2, 'New application received for Software Engineer from Alice Smith.');
