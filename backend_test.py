#!/usr/bin/env python3
"""
College Management System Backend API Tests
Test all endpoints for Principal, Teacher, and Student roles
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class CollegeAPITester:
    def __init__(self, base_url="https://student-portal-app-10.preview.emergentagent.com"):
        self.base_url = base_url
        self.tokens = {}
        self.users = {}
        self.tests_run = 0
        self.tests_passed = 0
        
        # Test credentials
        self.credentials = {
            "principal": {"email": "principal@bggaraiya.edu", "password": "principal123"},
            "teacher": {"email": "teacher@bggaraiya.edu", "password": "teacher123"},
            "student": {"email": "student@bggaraiya.edu", "password": "student123"}
        }

    def log(self, message, level="INFO"):
        """Log test results"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, role=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if role and role in self.tokens:
            test_headers['Authorization'] = f'Bearer {self.tokens[role]}'
        elif headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            response = None
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ PASSED - {name} - Status: {response.status_code}", "PASS")
            else:
                self.log(f"❌ FAILED - {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                if response.text:
                    self.log(f"Response: {response.text[:200]}", "ERROR")

            return success, response.json() if response.content else {}

        except requests.exceptions.Timeout:
            self.log(f"❌ TIMEOUT - {name} - Request timed out", "FAIL")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log(f"❌ CONNECTION ERROR - {name} - Could not connect to server", "FAIL")
            return False, {}
        except Exception as e:
            self.log(f"❌ ERROR - {name} - {str(e)}", "FAIL")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_seed_data(self):
        """Test seed data endpoint"""
        return self.run_test("Seed Data", "POST", "seed", 200)

    def test_login(self, role):
        """Test login for a specific role"""
        creds = self.credentials[role]
        success, response = self.run_test(
            f"{role.title()} Login",
            "POST",
            "auth/login",
            200,
            data=creds
        )
        
        if success and 'access_token' in response:
            self.tokens[role] = response['access_token']
            self.users[role] = response['user']
            self.log(f"✅ {role.title()} login successful, token stored", "SUCCESS")
            return True
        else:
            self.log(f"❌ {role.title()} login failed", "FAIL")
            return False

    def test_auth_me(self, role):
        """Test /auth/me endpoint"""
        return self.run_test(f"{role.title()} Auth Me", "GET", "auth/me", 200, role=role)

    def test_principal_dashboard(self):
        """Test principal dashboard"""
        return self.run_test("Principal Dashboard", "GET", "dashboard/principal", 200, role="principal")

    def test_teacher_dashboard(self):
        """Test teacher dashboard"""
        return self.run_test("Teacher Dashboard", "GET", "dashboard/teacher", 200, role="teacher")

    def test_student_dashboard(self):
        """Test student dashboard"""
        return self.run_test("Student Dashboard", "GET", "dashboard/student", 200, role="student")

    def test_departments(self):
        """Test departments endpoints"""
        # Get departments
        success1, _ = self.run_test("Get Departments", "GET", "departments", 200, role="principal")
        
        # Create department (principal only)
        dept_data = {
            "name": "Test Department",
            "code": "TD001",
            "description": "Test Department Description"
        }
        success2, dept_response = self.run_test("Create Department", "POST", "departments", 200, 
                                               data=dept_data, role="principal")
        
        return success1 and success2

    def test_students_crud(self):
        """Test student CRUD operations"""
        # Get students
        success1, _ = self.run_test("Get Students", "GET", "students", 200, role="principal")
        
        # Test student endpoints that should work
        success2, _ = self.run_test("Get Students with Pagination", "GET", "students?page=1&limit=10", 200, role="principal")
        
        return success1 and success2

    def test_teachers_crud(self):
        """Test teacher CRUD operations"""
        # Get teachers
        success1, _ = self.run_test("Get Teachers", "GET", "teachers", 200, role="principal")
        
        # Get teacher availability
        success2, _ = self.run_test("Get Teacher Availability", "GET", "teachers/availability/status", 200, role="principal")
        
        return success1 and success2

    def test_notices(self):
        """Test notices endpoints"""
        # Get notices (all roles should be able to see notices)
        success1, _ = self.run_test("Get Notices (Principal)", "GET", "notices", 200, role="principal")
        success2, _ = self.run_test("Get Notices (Teacher)", "GET", "notices", 200, role="teacher")
        success3, _ = self.run_test("Get Notices (Student)", "GET", "notices", 200, role="student")
        
        return success1 and success2 and success3

    def test_leaves(self):
        """Test leave management endpoints"""
        # Get leaves
        success1, _ = self.run_test("Get Leaves (Principal)", "GET", "leaves", 200, role="principal")
        success2, _ = self.run_test("Get Leaves (Teacher)", "GET", "leaves", 200, role="teacher")
        
        return success1 and success2

    def test_attendance(self):
        """Test attendance endpoints"""
        # Get attendance
        success1, _ = self.run_test("Get Attendance (Principal)", "GET", "attendance", 200, role="principal")
        success2, _ = self.run_test("Get Attendance (Teacher)", "GET", "attendance", 200, role="teacher")
        
        return success1 and success2

    def test_results(self):
        """Test results endpoints"""
        success1, _ = self.run_test("Get Results (Principal)", "GET", "results", 200, role="principal")
        success2, _ = self.run_test("Get Results (Teacher)", "GET", "results", 200, role="teacher")
        success3, _ = self.run_test("Get Results (Student)", "GET", "results", 200, role="student")
        
        return success1 and success2 and success3

    def test_fees(self):
        """Test fees endpoints"""
        success1, _ = self.run_test("Get Fees (Principal)", "GET", "fees", 200, role="principal")
        success2, _ = self.run_test("Get Fees (Student)", "GET", "fees", 200, role="student")
        
        return success1 and success2

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Test access without token
        success1, _ = self.run_test("Unauthorized Dashboard Access", "GET", "dashboard/principal", 401)
        
        # Test student accessing principal endpoints
        success2, _ = self.run_test("Student Access to Principal Dashboard", "GET", "dashboard/principal", 403, role="student")
        
        return success1 and success2

    def run_comprehensive_tests(self):
        """Run all API tests"""
        self.log("="*60, "INFO")
        self.log("STARTING COLLEGE MANAGEMENT SYSTEM API TESTS", "INFO")
        self.log("="*60, "INFO")
        
        # Basic connectivity
        self.log("\n1. Testing Basic Connectivity", "INFO")
        self.log("-" * 30, "INFO")
        self.test_health_check()
        
        # Seed data
        self.log("\n2. Creating Demo Data", "INFO")
        self.log("-" * 30, "INFO")
        self.test_seed_data()
        
        # Authentication tests
        self.log("\n3. Testing Authentication", "INFO")
        self.log("-" * 30, "INFO")
        auth_results = {}
        for role in ["principal", "teacher", "student"]:
            auth_results[role] = self.test_login(role)
            if auth_results[role]:
                self.test_auth_me(role)
        
        # Dashboard tests
        self.log("\n4. Testing Dashboards", "INFO")
        self.log("-" * 30, "INFO")
        if auth_results.get("principal"):
            self.test_principal_dashboard()
        if auth_results.get("teacher"):
            self.test_teacher_dashboard()
        if auth_results.get("student"):
            self.test_student_dashboard()
        
        # CRUD operations tests
        self.log("\n5. Testing CRUD Operations", "INFO")
        self.log("-" * 30, "INFO")
        if auth_results.get("principal"):
            self.test_departments()
            self.test_students_crud()
            self.test_teachers_crud()
        
        # Feature tests
        self.log("\n6. Testing Application Features", "INFO")
        self.log("-" * 30, "INFO")
        self.test_notices()
        self.test_leaves()
        self.test_attendance()
        self.test_results()
        self.test_fees()
        
        # Security tests
        self.log("\n7. Testing Security & Authorization", "INFO")
        self.log("-" * 30, "INFO")
        self.test_unauthorized_access()
        
        # Final results
        self.log("\n" + "="*60, "INFO")
        self.log("TEST RESULTS SUMMARY", "INFO")
        self.log("="*60, "INFO")
        self.log(f"Total Tests: {self.tests_run}", "INFO")
        self.log(f"Passed: {self.tests_passed}", "INFO")
        self.log(f"Failed: {self.tests_run - self.tests_passed}", "INFO")
        self.log(f"Success Rate: {round((self.tests_passed / self.tests_run * 100), 1)}%", "INFO")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 ALL TESTS PASSED!", "SUCCESS")
            return 0
        else:
            self.log("❌ SOME TESTS FAILED", "FAIL")
            return 1

def main():
    """Main test function"""
    tester = CollegeAPITester()
    return tester.run_comprehensive_tests()

if __name__ == "__main__":
    sys.exit(main())