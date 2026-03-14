import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';
import StudentLayout from '../../components/layouts/StudentLayout';
import { getStudentByUser, getStudentResultSummary } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Results = () => {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const studentRes = await getStudentByUser(user.id);
      const resultsRes = await getStudentResultSummary(studentRes.data.id);
      setResults(resultsRes.data);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Results">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="My Results">
      <div className="space-y-6" data-testid="student-results-page">
        {/* Overall Performance */}
        {results?.results?.length > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium opacity-90">Overall Performance</h3>
                <p className="text-4xl font-heading font-bold mt-2">{results.overall_percentage}%</p>
                <p className="text-sm opacity-80 mt-1">
                  {results.total_obtained} / {results.total_marks} marks
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Award size={40} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-heading font-semibold">Subject-wise Results</h3>
          </div>
          {(!results?.results || results.results.length === 0) ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No results available yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left p-4">Subject</th>
                    <th className="text-left p-4">Exam Type</th>
                    <th className="text-center p-4">Marks</th>
                    <th className="text-center p-4">Percentage</th>
                    <th className="text-center p-4">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((result, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="p-4 font-medium">{result.subject}</td>
                      <td className="p-4 capitalize text-gray-600">{result.exam_type}</td>
                      <td className="p-4 text-center">
                        {result.marks_obtained} / {result.total_marks}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${
                          result.percentage >= 60 ? 'text-green-600' :
                          result.percentage >= 40 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {result.percentage}%
                        </span>
                      </td>
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

        {/* Grade Legend */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-heading font-semibold mb-4">Grading Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { grade: 'A+', range: '90-100%', color: 'bg-green-100 text-green-700' },
              { grade: 'A', range: '80-89%', color: 'bg-green-100 text-green-700' },
              { grade: 'B+', range: '70-79%', color: 'bg-blue-100 text-blue-700' },
              { grade: 'B', range: '60-69%', color: 'bg-blue-100 text-blue-700' },
              { grade: 'C', range: '50-59%', color: 'bg-amber-100 text-amber-700' },
              { grade: 'D', range: '40-49%', color: 'bg-amber-100 text-amber-700' },
              { grade: 'F', range: '<40%', color: 'bg-red-100 text-red-700' },
            ].map((item) => (
              <div key={item.grade} className={`p-3 rounded-lg text-center ${item.color}`}>
                <p className="font-bold text-lg">{item.grade}</p>
                <p className="text-xs">{item.range}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Results;
