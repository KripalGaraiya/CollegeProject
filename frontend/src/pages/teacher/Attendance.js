import React, { useState, useEffect } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import { getClasses, getStudents, markBulkAttendance, getAttendance } from '../../services/api';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents({ class_id: selectedClass, limit: 100 });
      setStudents(res.data.students);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const res = await getAttendance({ class_id: selectedClass, date });
      const existingAttendance = {};
      res.data.forEach(a => {
        existingAttendance[a.student_id] = a.status;
      });
      setAttendance(existingAttendance);
    } catch (error) {
      console.error('Failed to fetch existing attendance');
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (Object.keys(attendance).length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id,
        status
      }));

      await markBulkAttendance({
        class_id: selectedClass,
        date,
        attendance_records: records
      });

      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach(s => {
      newAttendance[s.id] = status;
    });
    setAttendance(newAttendance);
  };

  return (
    <TeacherLayout title="Mark Attendance">
      <div className="space-y-6" data-testid="teacher-attendance-page">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input-field"
                data-testid="class-select"
              >
                <option value="">Choose a class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - Year {c.year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                data-testid="date-input"
              />
            </div>
            <div className="flex items-end">
              <div className="flex gap-2">
                <button onClick={() => markAll('present')} className="btn-outline text-sm px-3 py-2" data-testid="mark-all-present">
                  All Present
                </button>
                <button onClick={() => markAll('absent')} className="btn-outline text-sm px-3 py-2" data-testid="mark-all-absent">
                  All Absent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {selectedClass && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No students in this class</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="text-left p-4">Roll No</th>
                        <th className="text-left p-4">Name</th>
                        <th className="text-center p-4">Present</th>
                        <th className="text-center p-4">Absent</th>
                        <th className="text-center p-4">Leave</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="table-row">
                          <td className="p-4 font-mono text-sm">{student.roll_number}</td>
                          <td className="p-4 font-medium">{student.name}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleStatusChange(student.id, 'present')}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                attendance[student.id] === 'present' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-green-100'
                              }`}
                              data-testid={`present-${student.id}`}
                            >
                              <Check size={18} />
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleStatusChange(student.id, 'absent')}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                attendance[student.id] === 'absent' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-red-100'
                              }`}
                              data-testid={`absent-${student.id}`}
                            >
                              <X size={18} />
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleStatusChange(student.id, 'leave')}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                attendance[student.id] === 'leave' 
                                  ? 'bg-amber-500 text-white' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-amber-100'
                              }`}
                              data-testid={`leave-${student.id}`}
                            >
                              <Calendar size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={handleSubmit} 
                    disabled={saving}
                    className="btn-primary"
                    data-testid="save-attendance-button"
                  >
                    {saving ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default Attendance;
