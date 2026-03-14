"""
College Management System - Backend API Tests
Tests all endpoints that the mobile app consumes
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

# Use environment variable for base URL
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
PRINCIPAL_EMAIL = "principal@bggaraiya.edu"
PRINCIPAL_PASSWORD = "principal123"
TEACHER_EMAIL = "teacher@bggaraiya.edu"
TEACHER_PASSWORD = "teacher123"
STUDENT_EMAIL = "student@bggaraiya.edu"
STUDENT_PASSWORD = "student123"


# ============ Fixtures ============

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def seed_data(api_client):
    """Ensure seed data exists"""
    response = api_client.post(f"{BASE_URL}/api/seed")
    assert response.status_code == 200
    return response.json()


@pytest.fixture(scope="module")
def principal_token(api_client, seed_data):
    """Get principal authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": PRINCIPAL_EMAIL,
        "password": PRINCIPAL_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Principal authentication failed")


@pytest.fixture(scope="module")
def teacher_token(api_client, seed_data):
    """Get teacher authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEACHER_EMAIL,
        "password": TEACHER_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Teacher authentication failed")


@pytest.fixture(scope="module")
def student_token(api_client, seed_data):
    """Get student authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": STUDENT_EMAIL,
        "password": STUDENT_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return {
            "token": data.get("access_token"),
            "user": data.get("user")
        }
    pytest.skip("Student authentication failed")


@pytest.fixture(scope="module")
def principal_client(api_client, principal_token):
    """Session with principal auth header"""
    api_client.headers.update({"Authorization": f"Bearer {principal_token}"})
    return api_client


# ============ Health Check Tests ============

class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self, api_client):
        """Test /api/health returns healthy status"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "college" in data


# ============ Authentication Tests ============

class TestAuthentication:
    """Authentication endpoint tests - /api/auth/*"""
    
    def test_principal_login_success(self, api_client, seed_data):
        """POST /api/auth/login - Principal login with valid credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": PRINCIPAL_EMAIL,
            "password": PRINCIPAL_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "principal"
        assert data["user"]["email"] == PRINCIPAL_EMAIL
    
    def test_teacher_login_success(self, api_client, seed_data):
        """POST /api/auth/login - Teacher login with valid credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "teacher"
        assert data["user"]["email"] == TEACHER_EMAIL
    
    def test_student_login_success(self, api_client, seed_data):
        """POST /api/auth/login - Student login with valid credentials"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "student"
        assert data["user"]["email"] == STUDENT_EMAIL
    
    def test_login_invalid_credentials(self, api_client):
        """POST /api/auth/login - Invalid credentials returns 401"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_get_me_authenticated(self, api_client, principal_token):
        """GET /api/auth/me - Returns user info with valid token"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "role" in data
        assert "password" not in data  # Ensure password is not exposed
    
    def test_get_me_unauthorized(self, api_client):
        """GET /api/auth/me - Returns 401/403 without token"""
        response = api_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403]


# ============ Dashboard Tests ============

class TestDashboards:
    """Dashboard endpoint tests - /api/dashboard/*"""
    
    def test_principal_dashboard(self, api_client, principal_token):
        """GET /api/dashboard/principal - Returns principal stats"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/dashboard/principal", headers=headers)
        assert response.status_code == 200
        data = response.json()
        # Verify all expected fields
        assert "total_students" in data
        assert "total_teachers" in data
        assert "total_departments" in data
        assert "teachers_present" in data
        assert "teachers_on_leave" in data
        assert "students_present_today" in data
        assert "pending_fees_amount" in data
        assert "pending_leave_requests" in data
        # Verify data types
        assert isinstance(data["total_students"], int)
        assert isinstance(data["total_teachers"], int)
    
    def test_teacher_dashboard(self, api_client, teacher_token):
        """GET /api/dashboard/teacher - Returns teacher dashboard with classes and notices"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        response = api_client.get(f"{BASE_URL}/api/dashboard/teacher", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "teacher" in data
        assert "assigned_classes" in data
        assert "pending_leaves" in data
        assert "recent_notices" in data
        # Verify teacher info
        assert data["teacher"]["email"] == TEACHER_EMAIL
    
    def test_student_dashboard(self, api_client, student_token):
        """GET /api/dashboard/student - Returns student dashboard with attendance, fees, results"""
        headers = {"Authorization": f"Bearer {student_token['token']}"}
        response = api_client.get(f"{BASE_URL}/api/dashboard/student", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "student" in data
        assert "attendance" in data
        assert "fees" in data
        assert "recent_results" in data
        assert "recent_notices" in data
        # Verify attendance structure
        assert "total_days" in data["attendance"]
        assert "present_days" in data["attendance"]
        assert "percentage" in data["attendance"]
        # Verify fees structure
        assert "total" in data["fees"]
        assert "paid" in data["fees"]
        assert "pending" in data["fees"]
    
    def test_principal_dashboard_unauthorized(self, api_client, teacher_token):
        """GET /api/dashboard/principal - Teacher should get 403"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        response = api_client.get(f"{BASE_URL}/api/dashboard/principal", headers=headers)
        assert response.status_code == 403


# ============ Department Tests ============

class TestDepartments:
    """Department endpoint tests - /api/departments"""
    
    def test_get_all_departments(self, api_client, principal_token):
        """GET /api/departments - Returns list of all departments"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/departments", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify department structure
        dept = data[0]
        assert "id" in dept
        assert "name" in dept
        assert "code" in dept


# ============ Class Tests ============

class TestClasses:
    """Class endpoint tests - /api/classes"""
    
    def test_get_all_classes(self, api_client, principal_token):
        """GET /api/classes - Returns list of all classes"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/classes", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify class structure
        cls = data[0]
        assert "id" in cls
        assert "name" in cls
        assert "year" in cls
        assert "department_id" in cls


# ============ Student Tests ============

class TestStudents:
    """Student endpoint tests - /api/students"""
    
    def test_get_students_paginated(self, api_client, principal_token):
        """GET /api/students - Returns paginated student list"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/students", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "students" in data
        assert "total" in data
        assert "page" in data
        assert "pages" in data
        # Verify pagination structure
        assert isinstance(data["students"], list)
        assert isinstance(data["total"], int)
    
    def test_get_students_with_pagination_params(self, api_client, principal_token):
        """GET /api/students with page and limit params"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(
            f"{BASE_URL}/api/students?page=1&limit=10", 
            headers=headers
        )
        assert response.status_code == 200


# ============ Teacher Tests ============

class TestTeachers:
    """Teacher endpoint tests - /api/teachers"""
    
    def test_get_all_teachers(self, api_client, principal_token):
        """GET /api/teachers - Returns list of all teachers"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/teachers", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify teacher structure
        teacher = data[0]
        assert "id" in teacher
        assert "name" in teacher
        assert "email" in teacher
        assert "employee_id" in teacher
    
    def test_get_teacher_availability_status(self, api_client, principal_token):
        """GET /api/teachers/availability/status - Returns teachers with availability"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(
            f"{BASE_URL}/api/teachers/availability/status", 
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify availability structure
        if len(data) > 0:
            teacher = data[0]
            assert "is_on_leave" in teacher


# ============ Attendance Tests ============

class TestAttendance:
    """Attendance endpoint tests - /api/attendance"""
    
    def test_get_attendance(self, api_client, teacher_token):
        """GET /api/attendance - Returns attendance records"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        response = api_client.get(f"{BASE_URL}/api/attendance", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_bulk_attendance_teacher(self, api_client, teacher_token, principal_token):
        """POST /api/attendance/bulk - Teacher marks bulk attendance"""
        # First get a class and student
        headers_principal = {"Authorization": f"Bearer {principal_token}"}
        classes_resp = api_client.get(f"{BASE_URL}/api/classes", headers=headers_principal)
        classes = classes_resp.json()
        
        students_resp = api_client.get(f"{BASE_URL}/api/students", headers=headers_principal)
        students = students_resp.json().get("students", [])
        
        if len(classes) > 0 and len(students) > 0:
            class_id = classes[0]["id"]
            student_id = students[0]["id"]
            today = datetime.now().strftime("%Y-%m-%d")
            
            headers = {"Authorization": f"Bearer {teacher_token}"}
            response = api_client.post(
                f"{BASE_URL}/api/attendance/bulk",
                headers=headers,
                json={
                    "class_id": class_id,
                    "date": today,
                    "attendance_records": [
                        {"student_id": student_id, "status": "present"}
                    ]
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert "message" in data
            assert "records" in data
        else:
            pytest.skip("No classes or students available for testing")
    
    def test_attendance_stats(self, api_client, principal_token):
        """GET /api/attendance/stats/{student_id} - Returns student attendance stats"""
        # First get a student
        headers = {"Authorization": f"Bearer {principal_token}"}
        students_resp = api_client.get(f"{BASE_URL}/api/students", headers=headers)
        students = students_resp.json().get("students", [])
        
        if len(students) > 0:
            student_id = students[0]["id"]
            response = api_client.get(
                f"{BASE_URL}/api/attendance/stats/{student_id}",
                headers=headers
            )
            assert response.status_code == 200
            data = response.json()
            assert "total_days" in data
            assert "present" in data
            assert "absent" in data
            assert "leave" in data
            assert "percentage" in data
        else:
            pytest.skip("No students available for testing")


# ============ Results Tests ============

class TestResults:
    """Results endpoint tests - /api/results"""
    
    def test_get_results(self, api_client, principal_token):
        """GET /api/results - Returns results list"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/results", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_add_result_teacher(self, api_client, teacher_token, principal_token):
        """POST /api/results - Teacher adds a result"""
        # Get student and class
        headers_principal = {"Authorization": f"Bearer {principal_token}"}
        students_resp = api_client.get(f"{BASE_URL}/api/students", headers=headers_principal)
        students = students_resp.json().get("students", [])
        
        classes_resp = api_client.get(f"{BASE_URL}/api/classes", headers=headers_principal)
        classes = classes_resp.json()
        
        if len(students) > 0 and len(classes) > 0:
            headers = {"Authorization": f"Bearer {teacher_token}"}
            response = api_client.post(
                f"{BASE_URL}/api/results",
                headers=headers,
                json={
                    "student_id": students[0]["id"],
                    "class_id": classes[0]["id"],
                    "subject": "Materia Medica",
                    "exam_type": "midterm",
                    "marks_obtained": 85,
                    "total_marks": 100
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert "grade" in data
            assert data["marks_obtained"] == 85
            assert data["total_marks"] == 100
        else:
            pytest.skip("No students or classes available for testing")


# ============ Fees Tests ============

class TestFees:
    """Fees endpoint tests - /api/fees"""
    
    def test_get_fees(self, api_client, principal_token):
        """GET /api/fees - Returns fees list"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/fees", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ============ Notice Tests ============

class TestNotices:
    """Notice endpoint tests - /api/notices"""
    
    def test_get_notices_teacher(self, api_client, teacher_token):
        """GET /api/notices - Teacher gets notices (role-based filtering)"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        response = api_client.get(f"{BASE_URL}/api/notices", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_notices_student(self, api_client, student_token):
        """GET /api/notices - Student gets notices (role-based filtering)"""
        headers = {"Authorization": f"Bearer {student_token['token']}"}
        response = api_client.get(f"{BASE_URL}/api/notices", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_notice_principal(self, api_client, principal_token):
        """POST /api/notices - Principal creates a notice"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.post(
            f"{BASE_URL}/api/notices",
            headers=headers,
            json={
                "title": "TEST_Notice: Exam Schedule",
                "description": "This is a test notice for exam schedule",
                "target_roles": ["teacher", "student"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["title"] == "TEST_Notice: Exam Schedule"
        assert "teacher" in data["target_roles"]
        assert "student" in data["target_roles"]
    
    def test_create_notice_teacher_forbidden(self, api_client, teacher_token):
        """POST /api/notices - Teacher should get 403"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        response = api_client.post(
            f"{BASE_URL}/api/notices",
            headers=headers,
            json={
                "title": "Unauthorized Notice",
                "description": "This should fail",
                "target_roles": ["student"]
            }
        )
        assert response.status_code == 403


# ============ Leave Tests ============

class TestLeaves:
    """Leave endpoint tests - /api/leaves"""
    
    def test_get_leaves(self, api_client, principal_token):
        """GET /api/leaves - Returns leave requests"""
        headers = {"Authorization": f"Bearer {principal_token}"}
        response = api_client.get(f"{BASE_URL}/api/leaves", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_apply_leave_teacher(self, api_client, teacher_token):
        """POST /api/leaves - Teacher applies for leave"""
        headers = {"Authorization": f"Bearer {teacher_token}"}
        start_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")
        
        response = api_client.post(
            f"{BASE_URL}/api/leaves",
            headers=headers,
            json={
                "reason": "TEST_Personal Work",
                "start_date": start_date,
                "end_date": end_date,
                "leave_type": "casual"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "pending"
        assert data["leave_type"] == "casual"
        return data["id"]
    
    def test_approve_leave_principal(self, api_client, principal_token, teacher_token):
        """PUT /api/leaves/{id}/approve - Principal approves leave"""
        # First create a leave request
        teacher_headers = {"Authorization": f"Bearer {teacher_token}"}
        start_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=11)).strftime("%Y-%m-%d")
        
        create_resp = api_client.post(
            f"{BASE_URL}/api/leaves",
            headers=teacher_headers,
            json={
                "reason": "TEST_Family Event",
                "start_date": start_date,
                "end_date": end_date,
                "leave_type": "casual"
            }
        )
        
        if create_resp.status_code == 200:
            leave_id = create_resp.json()["id"]
            
            # Principal approves
            principal_headers = {"Authorization": f"Bearer {principal_token}"}
            response = api_client.put(
                f"{BASE_URL}/api/leaves/{leave_id}/approve",
                headers=principal_headers
            )
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Leave approved"
        else:
            pytest.skip("Could not create leave for approval test")


# ============ Role-based Authorization Tests ============

class TestRoleBasedAuthorization:
    """Verify role-based access control"""
    
    def test_student_cannot_access_principal_dashboard(self, api_client, student_token):
        """Student should not access principal dashboard"""
        headers = {"Authorization": f"Bearer {student_token['token']}"}
        response = api_client.get(f"{BASE_URL}/api/dashboard/principal", headers=headers)
        assert response.status_code == 403
    
    def test_student_cannot_create_notice(self, api_client, student_token):
        """Student should not create notices"""
        headers = {"Authorization": f"Bearer {student_token['token']}"}
        response = api_client.post(
            f"{BASE_URL}/api/notices",
            headers=headers,
            json={
                "title": "Unauthorized",
                "description": "Should fail",
                "target_roles": ["student"]
            }
        )
        assert response.status_code == 403
    
    def test_student_cannot_apply_leave(self, api_client, student_token):
        """Student cannot apply for leave (only teachers can)"""
        headers = {"Authorization": f"Bearer {student_token['token']}"}
        response = api_client.post(
            f"{BASE_URL}/api/leaves",
            headers=headers,
            json={
                "reason": "Test",
                "start_date": "2026-02-01",
                "end_date": "2026-02-02",
                "leave_type": "casual"
            }
        )
        assert response.status_code == 403


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
