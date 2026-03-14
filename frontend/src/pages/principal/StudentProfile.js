import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Building2, 
  Calendar,
  CreditCard,
  ClipboardCheck,
  FileText,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import PrincipalLayout from '../../components/layouts/PrincipalLayout';
import { 
  getStudent, 
  getDepartments,
  getClasses,
  getAttendanceStats,
  getStudentFeeSummary,
  getStudentResultSummary
} from '../../services/api';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [studentRes, deptsRes, classesRes] = await Promise.all([
        getStudent(id),
        getDepartments(),
        getClasses()
      ]);
      
      setStudent(studentRes.data);
      setDepartments(deptsRes.data);
      setClasses(classesRes.data);

      // Fetch additional data
      const [attRes, feesRes, resultsRes] = await Promise.all([
        getAttendanceStats(id).catch(() => ({ data: null })),
        getStudentFeeSummary(id).catch(() => ({ data: null })),
        getStudentResultSummary(id).catch(() => ({ data: null }))
      ]);

      setAttendance(attRes.data);
      setFees(feesRes.data);
      setResults(resultsRes.data);
    } catch (error) {
      toast.error('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const getDeptName = (id) => departments.find(d => d.id === id)?.name || '-';
  const getClassName = (id) => classes.find(c => c.id === id)?.name || '-';

  if (loading) {
    return (
      <PrincipalLayout title="Student Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PrincipalLayout>
    );
  }

  if (!student) {
    return (
      <PrincipalLayout title="Student Profile">
        <div className="text-center py-12">
          <p className="text-gray-500">Student not found</p>
          <Link to="/principal/students" className="text-primary hover:underline mt-2 inline-block">
            Back to Students
          </Link>
        </div>
      </PrincipalLayout>
    );
  }

  return (
    <PrincipalLayout title="Student Profile">
      <div className="space-y-6" data-testid="student-profile">
        {/* Back Button */}
        <Link 
          to="/principal/students" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary"
        >
          <ArrowLeft size={20} />
          Back to Students
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center">
              <User size={48} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-heading font-bold text-gray-900">{student.name}</h2>
              <p className="text-gray-500 font-mono">{student.roll_number}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="badge badge-info">Year {student.year}</span>
                <span className="badge badge-success">{getClassName(student.class_id)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-heading font-semibold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm">{student.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm">{student.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-gray-400" />
                <span className="text-sm">{getDeptName(student.department_id)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm">Admitted: {student.admission_date || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck size={20} className="text-primary" />
              <h3 className="font-heading font-semibold">Attendance</h3>
            </div>
            {attendance ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-heading font-bold text-primary">
                    {attendance.percentage}%
                  </p>
                  <p className="text-sm text-gray-500">Overall Attendance</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="font-bold text-green-600">{attendance.present}</p>
                    <p className="text-xs text-gray-500">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="font-bold text-red-600">{attendance.absent}</p>
                    <p className="text-xs text-gray-500">Absent</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2">
                    <p className="font-bold text-yellow-600">{attendance.leave}</p>
                    <p className="text-xs text-gray-500">Leave</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No attendance data</p>
            )}
          </div>

          {/* Fees */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={20} className="text-primary" />
              <h3 className="font-heading font-semibold">Fee Status</h3>
            </div>
            {fees ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Fees</span>
                  <span className="font-semibold">₹{fees.total_fees?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Paid</span>
                  <span className="font-semibold text-green-600">₹{fees.total_paid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-semibold text-red-600">₹{fees.pending?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${fees.total_fees ? (fees.total_paid / fees.total_fees * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No fee records</p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText size={20} className="text-primary" />
            <h3 className="font-heading font-semibold">Academic Results</h3>
          </div>
          {results && results.results?.length > 0 ? (
            <>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-500" />
                  <span className="text-lg font-semibold">
                    Overall: {results.overall_percentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left p-3">Subject</th>
                      <th className="text-left p-3">Exam Type</th>
                      <th className="text-center p-3">Marks</th>
                      <th className="text-center p-3">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((result, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="p-3 font-medium">{result.subject}</td>
                        <td className="p-3 text-gray-600 capitalize">{result.exam_type}</td>
                        <td className="p-3 text-center">
                          {result.marks_obtained}/{result.total_marks}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`badge ${
                            result.grade === 'A+' || result.grade === 'A' ? 'badge-success' :
                            result.grade === 'B+' || result.grade === 'B' ? 'badge-info' :
                            result.grade === 'C' || result.grade === 'D' ? 'badge-warning' :
                            'badge-error'
                          }`}>
                            {result.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">No results available</p>
          )}
        </div>
      </div>
    </PrincipalLayout>
  );
};

export default StudentProfile;
