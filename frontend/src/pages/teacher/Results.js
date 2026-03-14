import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import { getClasses, getStudents, addResult, getResults } from '../../services/api';

const Results = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '', subject: '', exam_type: 'midterm', marks_obtained: '', total_marks: 100
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchResults();
    }
  }, [selectedClass]);

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

  const fetchResults = async () => {
    try {
      const res = await getResults({ class_id: selectedClass });
      setResults(res.data);
    } catch (error) {
      console.error('Failed to fetch results');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addResult({
        ...formData,
        class_id: selectedClass,
        marks_obtained: parseFloat(formData.marks_obtained),
        total_marks: parseFloat(formData.total_marks)
      });
      toast.success('Result added');
      setShowModal(false);
      setFormData({ student_id: '', subject: '', exam_type: 'midterm', marks_obtained: '', total_marks: 100 });
      fetchResults();
    } catch (error) {
      toast.error('Failed to add result');
    }
  };

  const getStudentName = (id) => students.find(s => s.id === id)?.name || '-';

  return (
    <TeacherLayout title="Upload Results">
      <div className="space-y-6" data-testid="teacher-results-page">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="w-full max-w-xs">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
              data-testid="class-select"
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} - Year {c.year}</option>
              ))}
            </select>
          </div>
          {selectedClass && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2" data-testid="add-result-button">
              <Plus size={20} /> Add Result
            </button>
          )}
        </div>

        {selectedClass && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No results uploaded yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="text-left p-4">Student</th>
                      <th className="text-left p-4">Subject</th>
                      <th className="text-left p-4">Exam Type</th>
                      <th className="text-center p-4">Marks</th>
                      <th className="text-center p-4">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id} className="table-row">
                        <td className="p-4 font-medium">{getStudentName(result.student_id)}</td>
                        <td className="p-4">{result.subject}</td>
                        <td className="p-4 capitalize">{result.exam_type}</td>
                        <td className="p-4 text-center">{result.marks_obtained}/{result.total_marks}</td>
                        <td className="p-4 text-center">
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
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold">Add Result</h2>
                <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student</label>
                  <select value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} className="input-field" required data-testid="student-select">
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input-field" required data-testid="subject-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Type</label>
                  <select value={formData.exam_type} onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })} className="input-field" data-testid="exam-type-select">
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="internal">Internal</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Marks Obtained</label>
                    <input type="number" value={formData.marks_obtained} onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })} className="input-field" required data-testid="marks-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Marks</label>
                    <input type="number" value={formData.total_marks} onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })} className="input-field" required data-testid="total-marks-input" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary" data-testid="submit-result-button">Add Result</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default Results;
