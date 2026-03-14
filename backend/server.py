"""
College Management System - Backend Server
Shri B. G. Garaiya Homoeopathic Medical College & Hospital, Rajkot
"""
import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from pymongo import MongoClient
from pydantic import BaseModel, Field, EmailStr
import base64

load_dotenv()

# Configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "college_management")
JWT_SECRET = os.environ.get("JWT_SECRET", "default_secret_key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# MongoDB connection
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
students_collection = db["students"]
teachers_collection = db["teachers"]
departments_collection = db["departments"]
classes_collection = db["classes"]
attendance_collection = db["attendance"]
results_collection = db["results"]
fees_collection = db["fees"]
notices_collection = db["notices"]
leaves_collection = db["leaves"]

# Create indexes
users_collection.create_index("email", unique=True)
students_collection.create_index("roll_number", unique=True)
teachers_collection.create_index("employee_id", unique=True)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="College Management System API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

def serialize_docs(docs):
    """Convert list of MongoDB documents"""
    return [serialize_doc(doc) for doc in docs]

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return serialize_doc(user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Pydantic Models
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str  # principal, teacher, student
    phone: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    head_teacher_id: Optional[str] = None

class ClassCreate(BaseModel):
    name: str
    year: int  # 1, 2, 3, 4 for BHMS
    department_id: str
    section: Optional[str] = "A"

class StudentCreate(BaseModel):
    user_id: Optional[str] = None
    name: str
    email: str
    phone: str
    roll_number: str
    department_id: str
    class_id: str
    year: int
    admission_date: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    photo_url: Optional[str] = None

class TeacherCreate(BaseModel):
    user_id: Optional[str] = None
    name: str
    email: str
    phone: str
    employee_id: str
    department_id: str
    designation: str
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    joining_date: Optional[str] = None
    photo_url: Optional[str] = None

class AttendanceCreate(BaseModel):
    student_id: str
    class_id: str
    date: str
    status: str  # present, absent, leave
    marked_by: Optional[str] = None

class BulkAttendanceCreate(BaseModel):
    class_id: str
    date: str
    attendance_records: List[dict]  # [{student_id, status}]

class ResultCreate(BaseModel):
    student_id: str
    class_id: str
    subject: str
    exam_type: str  # midterm, final, internal
    marks_obtained: float
    total_marks: float
    grade: Optional[str] = None

class FeeCreate(BaseModel):
    student_id: str
    fee_type: str  # tuition, exam, library, hostel
    amount: float
    due_date: str
    academic_year: str

class FeePayment(BaseModel):
    fee_id: str
    amount_paid: float
    payment_date: str
    payment_method: str

class NoticeCreate(BaseModel):
    title: str
    description: str
    department_id: Optional[str] = None
    class_id: Optional[str] = None
    target_roles: List[str]  # [teacher, student]
    attachment_url: Optional[str] = None
    publish_date: Optional[str] = None

class LeaveCreate(BaseModel):
    reason: str
    start_date: str
    end_date: str
    leave_type: str  # sick, casual, emergency

# Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "college": "Shri B. G. Garaiya Homoeopathic Medical College"}

# Auth Routes
@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user: UserCreate):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "email": user.email,
        "password": hash_password(user.password),
        "name": user.name,
        "role": user.role,
        "phone": user.phone,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = users_collection.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    del user_doc["_id"]
    del user_doc["password"]
    
    token = create_access_token({"sub": str(result.inserted_id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user_doc}

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    user_data = serialize_doc(user)
    del user_data["password"]
    return {"access_token": token, "token_type": "bearer", "user": user_data}

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_data = {k: v for k, v in current_user.items() if k != "password"}
    return user_data

# Department Routes
@app.get("/api/departments")
async def get_departments(current_user: dict = Depends(get_current_user)):
    departments = list(departments_collection.find())
    return serialize_docs(departments)

@app.post("/api/departments")
async def create_department(dept: DepartmentCreate, current_user: dict = Depends(require_role(["principal"]))):
    dept_doc = {
        **dept.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = departments_collection.insert_one(dept_doc)
    dept_doc["id"] = str(result.inserted_id)
    del dept_doc["_id"]
    return dept_doc

@app.get("/api/departments/{dept_id}")
async def get_department(dept_id: str, current_user: dict = Depends(get_current_user)):
    dept = departments_collection.find_one({"_id": ObjectId(dept_id)})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return serialize_doc(dept)

@app.put("/api/departments/{dept_id}")
async def update_department(dept_id: str, dept: DepartmentCreate, current_user: dict = Depends(require_role(["principal"]))):
    result = departments_collection.update_one(
        {"_id": ObjectId(dept_id)},
        {"$set": dept.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department updated"}

@app.delete("/api/departments/{dept_id}")
async def delete_department(dept_id: str, current_user: dict = Depends(require_role(["principal"]))):
    result = departments_collection.delete_one({"_id": ObjectId(dept_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department deleted"}

# Class Routes
@app.get("/api/classes")
async def get_classes(
    department_id: Optional[str] = None,
    year: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if department_id:
        query["department_id"] = department_id
    if year:
        query["year"] = year
    classes = list(classes_collection.find(query))
    return serialize_docs(classes)

@app.post("/api/classes")
async def create_class(cls: ClassCreate, current_user: dict = Depends(require_role(["principal"]))):
    cls_doc = {
        **cls.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = classes_collection.insert_one(cls_doc)
    cls_doc["id"] = str(result.inserted_id)
    del cls_doc["_id"]
    return cls_doc

@app.get("/api/classes/{class_id}")
async def get_class(class_id: str, current_user: dict = Depends(get_current_user)):
    cls = classes_collection.find_one({"_id": ObjectId(class_id)})
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    return serialize_doc(cls)

@app.delete("/api/classes/{class_id}")
async def delete_class(class_id: str, current_user: dict = Depends(require_role(["principal"]))):
    result = classes_collection.delete_one({"_id": ObjectId(class_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class deleted"}

# Student Routes
@app.get("/api/students")
async def get_students(
    department_id: Optional[str] = None,
    class_id: Optional[str] = None,
    year: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if department_id:
        query["department_id"] = department_id
    if class_id:
        query["class_id"] = class_id
    if year:
        query["year"] = year
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"roll_number": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    skip = (page - 1) * limit
    total = students_collection.count_documents(query)
    students = list(students_collection.find(query).skip(skip).limit(limit))
    
    return {
        "students": serialize_docs(students),
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@app.post("/api/students")
async def create_student(student: StudentCreate, current_user: dict = Depends(require_role(["principal"]))):
    # Create user account for student
    existing_user = users_collection.find_one({"email": student.email})
    if existing_user:
        user_id = str(existing_user["_id"])
    else:
        user_doc = {
            "email": student.email,
            "password": hash_password(student.roll_number),  # Default password is roll number
            "name": student.name,
            "role": "student",
            "phone": student.phone,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
    
    student_doc = {
        **student.model_dump(),
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = students_collection.insert_one(student_doc)
    student_doc["id"] = str(result.inserted_id)
    del student_doc["_id"]
    return student_doc

@app.get("/api/students/{student_id}")
async def get_student(student_id: str, current_user: dict = Depends(get_current_user)):
    student = students_collection.find_one({"_id": ObjectId(student_id)})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return serialize_doc(student)

@app.get("/api/students/by-user/{user_id}")
async def get_student_by_user(user_id: str, current_user: dict = Depends(get_current_user)):
    student = students_collection.find_one({"user_id": user_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return serialize_doc(student)

@app.put("/api/students/{student_id}")
async def update_student(student_id: str, student: StudentCreate, current_user: dict = Depends(require_role(["principal"]))):
    result = students_collection.update_one(
        {"_id": ObjectId(student_id)},
        {"$set": student.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student updated"}

@app.delete("/api/students/{student_id}")
async def delete_student(student_id: str, current_user: dict = Depends(require_role(["principal"]))):
    student = students_collection.find_one({"_id": ObjectId(student_id)})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Delete user account
    if student.get("user_id"):
        users_collection.delete_one({"_id": ObjectId(student["user_id"])})
    
    students_collection.delete_one({"_id": ObjectId(student_id)})
    return {"message": "Student deleted"}

# Teacher Routes
@app.get("/api/teachers")
async def get_teachers(
    department_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if department_id:
        query["department_id"] = department_id
    teachers = list(teachers_collection.find(query))
    return serialize_docs(teachers)

@app.post("/api/teachers")
async def create_teacher(teacher: TeacherCreate, current_user: dict = Depends(require_role(["principal"]))):
    # Create user account for teacher
    existing_user = users_collection.find_one({"email": teacher.email})
    if existing_user:
        user_id = str(existing_user["_id"])
    else:
        user_doc = {
            "email": teacher.email,
            "password": hash_password(teacher.employee_id),  # Default password is employee ID
            "name": teacher.name,
            "role": "teacher",
            "phone": teacher.phone,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
    
    teacher_doc = {
        **teacher.model_dump(),
        "user_id": user_id,
        "is_available": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = teachers_collection.insert_one(teacher_doc)
    teacher_doc["id"] = str(result.inserted_id)
    del teacher_doc["_id"]
    return teacher_doc

@app.get("/api/teachers/{teacher_id}")
async def get_teacher(teacher_id: str, current_user: dict = Depends(get_current_user)):
    teacher = teachers_collection.find_one({"_id": ObjectId(teacher_id)})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return serialize_doc(teacher)

@app.get("/api/teachers/by-user/{user_id}")
async def get_teacher_by_user(user_id: str, current_user: dict = Depends(get_current_user)):
    teacher = teachers_collection.find_one({"user_id": user_id})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return serialize_doc(teacher)

@app.put("/api/teachers/{teacher_id}")
async def update_teacher(teacher_id: str, teacher: TeacherCreate, current_user: dict = Depends(require_role(["principal"]))):
    result = teachers_collection.update_one(
        {"_id": ObjectId(teacher_id)},
        {"$set": teacher.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return {"message": "Teacher updated"}

@app.delete("/api/teachers/{teacher_id}")
async def delete_teacher(teacher_id: str, current_user: dict = Depends(require_role(["principal"]))):
    teacher = teachers_collection.find_one({"_id": ObjectId(teacher_id)})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if teacher.get("user_id"):
        users_collection.delete_one({"_id": ObjectId(teacher["user_id"])})
    
    teachers_collection.delete_one({"_id": ObjectId(teacher_id)})
    return {"message": "Teacher deleted"}

@app.get("/api/teachers/availability/status")
async def get_teacher_availability(current_user: dict = Depends(get_current_user)):
    """Get all teachers with their availability status"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    teachers = list(teachers_collection.find())
    result = []
    
    for teacher in teachers:
        # Check if teacher has approved leave today
        leave = leaves_collection.find_one({
            "user_id": teacher.get("user_id"),
            "start_date": {"$lte": today},
            "end_date": {"$gte": today},
            "status": "approved"
        })
        
        teacher_data = serialize_doc(teacher)
        teacher_data["is_on_leave"] = leave is not None
        teacher_data["leave_reason"] = leave.get("reason") if leave else None
        result.append(teacher_data)
    
    return result

# Attendance Routes
@app.get("/api/attendance")
async def get_attendance(
    class_id: Optional[str] = None,
    student_id: Optional[str] = None,
    date: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if class_id:
        query["class_id"] = class_id
    if student_id:
        query["student_id"] = student_id
    if date:
        query["date"] = date
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    attendance = list(attendance_collection.find(query))
    return serialize_docs(attendance)

@app.post("/api/attendance")
async def mark_attendance(attendance: AttendanceCreate, current_user: dict = Depends(require_role(["teacher", "principal"]))):
    # Check if attendance already exists
    existing = attendance_collection.find_one({
        "student_id": attendance.student_id,
        "class_id": attendance.class_id,
        "date": attendance.date
    })
    
    if existing:
        attendance_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": attendance.status, "marked_by": current_user["id"]}}
        )
        return {"message": "Attendance updated"}
    
    att_doc = {
        **attendance.model_dump(),
        "marked_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = attendance_collection.insert_one(att_doc)
    att_doc["id"] = str(result.inserted_id)
    del att_doc["_id"]
    return att_doc

@app.post("/api/attendance/bulk")
async def mark_bulk_attendance(data: BulkAttendanceCreate, current_user: dict = Depends(require_role(["teacher", "principal"]))):
    """Mark attendance for multiple students at once"""
    results = []
    for record in data.attendance_records:
        existing = attendance_collection.find_one({
            "student_id": record["student_id"],
            "class_id": data.class_id,
            "date": data.date
        })
        
        if existing:
            attendance_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"status": record["status"], "marked_by": current_user["id"]}}
            )
        else:
            att_doc = {
                "student_id": record["student_id"],
                "class_id": data.class_id,
                "date": data.date,
                "status": record["status"],
                "marked_by": current_user["id"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            attendance_collection.insert_one(att_doc)
        results.append({"student_id": record["student_id"], "status": record["status"]})
    
    return {"message": "Bulk attendance marked", "records": len(results)}

@app.get("/api/attendance/stats/{student_id}")
async def get_attendance_stats(student_id: str, current_user: dict = Depends(get_current_user)):
    """Get attendance statistics for a student"""
    attendance = list(attendance_collection.find({"student_id": student_id}))
    total = len(attendance)
    present = sum(1 for a in attendance if a["status"] == "present")
    absent = sum(1 for a in attendance if a["status"] == "absent")
    leave = sum(1 for a in attendance if a["status"] == "leave")
    
    return {
        "total_days": total,
        "present": present,
        "absent": absent,
        "leave": leave,
        "percentage": round((present / total * 100), 2) if total > 0 else 0
    }

# Results Routes
@app.get("/api/results")
async def get_results(
    student_id: Optional[str] = None,
    class_id: Optional[str] = None,
    exam_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if student_id:
        query["student_id"] = student_id
    if class_id:
        query["class_id"] = class_id
    if exam_type:
        query["exam_type"] = exam_type
    
    results = list(results_collection.find(query))
    return serialize_docs(results)

@app.post("/api/results")
async def add_result(result: ResultCreate, current_user: dict = Depends(require_role(["teacher", "principal"]))):
    # Calculate grade
    percentage = (result.marks_obtained / result.total_marks) * 100
    grade = "F"
    if percentage >= 90:
        grade = "A+"
    elif percentage >= 80:
        grade = "A"
    elif percentage >= 70:
        grade = "B+"
    elif percentage >= 60:
        grade = "B"
    elif percentage >= 50:
        grade = "C"
    elif percentage >= 40:
        grade = "D"
    
    result_doc = {
        **result.model_dump(),
        "grade": grade,
        "percentage": round(percentage, 2),
        "added_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = results_collection.insert_one(result_doc)
    result_doc["id"] = str(res.inserted_id)
    del result_doc["_id"]
    return result_doc

@app.get("/api/results/student/{student_id}/summary")
async def get_student_result_summary(student_id: str, current_user: dict = Depends(get_current_user)):
    """Get result summary for a student"""
    results = list(results_collection.find({"student_id": student_id}))
    
    if not results:
        return {"message": "No results found", "results": [], "overall_percentage": 0}
    
    total_obtained = sum(r["marks_obtained"] for r in results)
    total_marks = sum(r["total_marks"] for r in results)
    overall_percentage = round((total_obtained / total_marks * 100), 2) if total_marks > 0 else 0
    
    return {
        "results": serialize_docs(results),
        "total_obtained": total_obtained,
        "total_marks": total_marks,
        "overall_percentage": overall_percentage
    }

# Fees Routes
@app.get("/api/fees")
async def get_fees(
    student_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if student_id:
        query["student_id"] = student_id
    if status:
        query["status"] = status
    
    fees = list(fees_collection.find(query))
    return serialize_docs(fees)

@app.post("/api/fees")
async def create_fee(fee: FeeCreate, current_user: dict = Depends(require_role(["principal"]))):
    fee_doc = {
        **fee.model_dump(),
        "status": "pending",
        "amount_paid": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = fees_collection.insert_one(fee_doc)
    fee_doc["id"] = str(result.inserted_id)
    del fee_doc["_id"]
    return fee_doc

@app.post("/api/fees/payment")
async def record_payment(payment: FeePayment, current_user: dict = Depends(require_role(["principal"]))):
    fee = fees_collection.find_one({"_id": ObjectId(payment.fee_id)})
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")
    
    new_paid = fee.get("amount_paid", 0) + payment.amount_paid
    status = "paid" if new_paid >= fee["amount"] else "partial"
    
    fees_collection.update_one(
        {"_id": ObjectId(payment.fee_id)},
        {"$set": {
            "amount_paid": new_paid,
            "status": status,
            "last_payment_date": payment.payment_date,
            "payment_method": payment.payment_method
        }}
    )
    return {"message": "Payment recorded", "new_status": status}

@app.get("/api/fees/student/{student_id}/summary")
async def get_student_fee_summary(student_id: str, current_user: dict = Depends(get_current_user)):
    """Get fee summary for a student"""
    fees = list(fees_collection.find({"student_id": student_id}))
    
    total_fees = sum(f["amount"] for f in fees)
    total_paid = sum(f.get("amount_paid", 0) for f in fees)
    pending = total_fees - total_paid
    
    return {
        "fees": serialize_docs(fees),
        "total_fees": total_fees,
        "total_paid": total_paid,
        "pending": pending
    }

# Notice Routes
@app.get("/api/notices")
async def get_notices(
    department_id: Optional[str] = None,
    class_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    # Filter based on role
    if current_user["role"] == "student":
        query["target_roles"] = {"$in": ["student"]}
    elif current_user["role"] == "teacher":
        query["target_roles"] = {"$in": ["teacher"]}
    
    if department_id:
        query["$or"] = [{"department_id": department_id}, {"department_id": None}]
    if class_id:
        query["$or"] = [{"class_id": class_id}, {"class_id": None}]
    
    notices = list(notices_collection.find(query).sort("created_at", -1))
    return serialize_docs(notices)

@app.post("/api/notices")
async def create_notice(notice: NoticeCreate, current_user: dict = Depends(require_role(["principal"]))):
    notice_doc = {
        **notice.model_dump(),
        "created_by": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = notices_collection.insert_one(notice_doc)
    notice_doc["id"] = str(result.inserted_id)
    del notice_doc["_id"]
    return notice_doc

@app.get("/api/notices/{notice_id}")
async def get_notice(notice_id: str, current_user: dict = Depends(get_current_user)):
    notice = notices_collection.find_one({"_id": ObjectId(notice_id)})
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    return serialize_doc(notice)

@app.delete("/api/notices/{notice_id}")
async def delete_notice(notice_id: str, current_user: dict = Depends(require_role(["principal"]))):
    result = notices_collection.delete_one({"_id": ObjectId(notice_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notice not found")
    return {"message": "Notice deleted"}

# Leave Routes
@app.get("/api/leaves")
async def get_leaves(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if user_id:
        query["user_id"] = user_id
    if status:
        query["status"] = status
    
    # Teachers can only see their own leaves
    if current_user["role"] == "teacher":
        query["user_id"] = current_user["id"]
    
    leaves = list(leaves_collection.find(query).sort("created_at", -1))
    return serialize_docs(leaves)

@app.post("/api/leaves")
async def apply_leave(leave: LeaveCreate, current_user: dict = Depends(require_role(["teacher"]))):
    leave_doc = {
        **leave.model_dump(),
        "user_id": current_user["id"],
        "user_name": current_user["name"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = leaves_collection.insert_one(leave_doc)
    leave_doc["id"] = str(result.inserted_id)
    del leave_doc["_id"]
    return leave_doc

@app.put("/api/leaves/{leave_id}/approve")
async def approve_leave(leave_id: str, current_user: dict = Depends(require_role(["principal"]))):
    result = leaves_collection.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {"status": "approved", "approved_by": current_user["id"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leave not found")
    
    # Update teacher availability
    leave = leaves_collection.find_one({"_id": ObjectId(leave_id)})
    if leave:
        teachers_collection.update_one(
            {"user_id": leave["user_id"]},
            {"$set": {"is_available": False}}
        )
    
    return {"message": "Leave approved"}

@app.put("/api/leaves/{leave_id}/reject")
async def reject_leave(leave_id: str, current_user: dict = Depends(require_role(["principal"]))):
    result = leaves_collection.update_one(
        {"_id": ObjectId(leave_id)},
        {"$set": {"status": "rejected", "rejected_by": current_user["id"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leave not found")
    return {"message": "Leave rejected"}

# Dashboard Stats Routes
@app.get("/api/dashboard/principal")
async def get_principal_dashboard(current_user: dict = Depends(require_role(["principal"]))):
    """Get principal dashboard statistics"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    total_students = students_collection.count_documents({})
    total_teachers = teachers_collection.count_documents({})
    total_departments = departments_collection.count_documents({})
    
    # Teachers on leave today
    teachers_on_leave = leaves_collection.count_documents({
        "start_date": {"$lte": today},
        "end_date": {"$gte": today},
        "status": "approved"
    })
    
    # Students present today
    students_present = attendance_collection.count_documents({
        "date": today,
        "status": "present"
    })
    
    # Pending fees
    pending_fees_cursor = fees_collection.aggregate([
        {"$match": {"status": {"$ne": "paid"}}},
        {"$group": {"_id": None, "total": {"$sum": {"$subtract": ["$amount", "$amount_paid"]}}}}
    ])
    pending_fees = list(pending_fees_cursor)
    pending_fees_amount = pending_fees[0]["total"] if pending_fees else 0
    
    # Pending leave requests
    pending_leaves = leaves_collection.count_documents({"status": "pending"})
    
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_departments": total_departments,
        "teachers_present": total_teachers - teachers_on_leave,
        "teachers_on_leave": teachers_on_leave,
        "students_present_today": students_present,
        "pending_fees_amount": pending_fees_amount,
        "pending_leave_requests": pending_leaves
    }

@app.get("/api/dashboard/teacher")
async def get_teacher_dashboard(current_user: dict = Depends(require_role(["teacher"]))):
    """Get teacher dashboard data"""
    teacher = teachers_collection.find_one({"user_id": current_user["id"]})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    
    # Get assigned classes (for now, get all classes in teacher's department)
    classes = list(classes_collection.find({"department_id": teacher["department_id"]}))
    
    # Get pending leaves
    pending_leaves = list(leaves_collection.find({
        "user_id": current_user["id"],
        "status": "pending"
    }))
    
    # Get recent notices
    notices = list(notices_collection.find({
        "target_roles": {"$in": ["teacher"]}
    }).sort("created_at", -1).limit(5))
    
    return {
        "teacher": serialize_doc(teacher),
        "assigned_classes": serialize_docs(classes),
        "pending_leaves": serialize_docs(pending_leaves),
        "recent_notices": serialize_docs(notices)
    }

@app.get("/api/dashboard/student")
async def get_student_dashboard(current_user: dict = Depends(require_role(["student"]))):
    """Get student dashboard data"""
    student = students_collection.find_one({"user_id": current_user["id"]})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    student_id = str(student["_id"])
    
    # Get attendance stats
    attendance = list(attendance_collection.find({"student_id": student_id}))
    total_days = len(attendance)
    present_days = sum(1 for a in attendance if a["status"] == "present")
    attendance_percentage = round((present_days / total_days * 100), 2) if total_days > 0 else 0
    
    # Get fee summary
    fees = list(fees_collection.find({"student_id": student_id}))
    total_fees = sum(f["amount"] for f in fees)
    total_paid = sum(f.get("amount_paid", 0) for f in fees)
    
    # Get recent results
    results = list(results_collection.find({"student_id": student_id}).sort("created_at", -1).limit(5))
    
    # Get recent notices
    notices = list(notices_collection.find({
        "target_roles": {"$in": ["student"]}
    }).sort("created_at", -1).limit(5))
    
    return {
        "student": serialize_doc(student),
        "attendance": {
            "total_days": total_days,
            "present_days": present_days,
            "percentage": attendance_percentage
        },
        "fees": {
            "total": total_fees,
            "paid": total_paid,
            "pending": total_fees - total_paid
        },
        "recent_results": serialize_docs(results),
        "recent_notices": serialize_docs(notices)
    }

# Reports
@app.get("/api/reports/attendance")
async def get_attendance_report(
    class_id: Optional[str] = None,
    department_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(require_role(["principal"]))
):
    """Generate attendance report"""
    query = {}
    if class_id:
        query["class_id"] = class_id
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    
    attendance = list(attendance_collection.find(query))
    
    # Group by student
    student_attendance = {}
    for a in attendance:
        sid = a["student_id"]
        if sid not in student_attendance:
            student_attendance[sid] = {"present": 0, "absent": 0, "leave": 0}
        student_attendance[sid][a["status"]] += 1
    
    return {
        "total_records": len(attendance),
        "student_wise": student_attendance
    }

@app.get("/api/reports/fees")
async def get_fees_report(
    department_id: Optional[str] = None,
    current_user: dict = Depends(require_role(["principal"]))
):
    """Generate fees report"""
    pipeline = [
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_amount": {"$sum": "$amount"},
            "total_paid": {"$sum": "$amount_paid"}
        }}
    ]
    
    report = list(fees_collection.aggregate(pipeline))
    
    total_fees = sum(r["total_amount"] for r in report)
    total_collected = sum(r["total_paid"] for r in report)
    
    return {
        "status_wise": report,
        "total_fees": total_fees,
        "total_collected": total_collected,
        "pending": total_fees - total_collected
    }

# Seed Data Endpoint (for development)
@app.post("/api/seed")
async def seed_data():
    """Seed initial data for development"""
    # Create Principal
    principal_exists = users_collection.find_one({"email": "principal@bggaraiya.edu"})
    if not principal_exists:
        users_collection.insert_one({
            "email": "principal@bggaraiya.edu",
            "password": hash_password("principal123"),
            "name": "Dr. Rajesh Sharma",
            "role": "principal",
            "phone": "9876543210",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Create Departments
    departments = [
        {"name": "Forensic Medicine and Toxicology", "code": "FMT"},
        {"name": "Gynecology & Obstetrics", "code": "GO"},
        {"name": "Homeopathy Materia Medica", "code": "HMM"},
        {"name": "Homeopathy Pharmacy", "code": "HP"},
        {"name": "Organon of Medicine", "code": "OM"},
        {"name": "Pathology & Microbiology", "code": "PM"}
    ]
    
    for dept in departments:
        existing = departments_collection.find_one({"code": dept["code"]})
        if not existing:
            dept["created_at"] = datetime.now(timezone.utc).isoformat()
            departments_collection.insert_one(dept)
    
    # Get first department for creating classes
    first_dept = departments_collection.find_one({"code": "FMT"})
    
    # Create Classes
    if first_dept:
        for year in range(1, 5):
            existing = classes_collection.find_one({"year": year, "department_id": str(first_dept["_id"])})
            if not existing:
                classes_collection.insert_one({
                    "name": f"BHMS Year {year}",
                    "year": year,
                    "department_id": str(first_dept["_id"]),
                    "section": "A",
                    "created_at": datetime.now(timezone.utc).isoformat()
                })
    
    # Create sample teacher
    teacher_exists = users_collection.find_one({"email": "teacher@bggaraiya.edu"})
    if not teacher_exists and first_dept:
        teacher_user = users_collection.insert_one({
            "email": "teacher@bggaraiya.edu",
            "password": hash_password("teacher123"),
            "name": "Dr. Priya Patel",
            "role": "teacher",
            "phone": "9876543211",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        teachers_collection.insert_one({
            "user_id": str(teacher_user.inserted_id),
            "name": "Dr. Priya Patel",
            "email": "teacher@bggaraiya.edu",
            "phone": "9876543211",
            "employee_id": "TCH001",
            "department_id": str(first_dept["_id"]),
            "designation": "Associate Professor",
            "qualification": "MD Homeopathy",
            "is_available": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Create sample student
    student_exists = users_collection.find_one({"email": "student@bggaraiya.edu"})
    first_class = classes_collection.find_one({"year": 1})
    
    if not student_exists and first_dept and first_class:
        student_user = users_collection.insert_one({
            "email": "student@bggaraiya.edu",
            "password": hash_password("student123"),
            "name": "Rahul Kumar",
            "role": "student",
            "phone": "9876543212",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        students_collection.insert_one({
            "user_id": str(student_user.inserted_id),
            "name": "Rahul Kumar",
            "email": "student@bggaraiya.edu",
            "phone": "9876543212",
            "roll_number": "BHMS2024001",
            "department_id": str(first_dept["_id"]),
            "class_id": str(first_class["_id"]),
            "year": 1,
            "admission_date": "2024-07-01",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return {"message": "Seed data created successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
