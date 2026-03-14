import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import PrincipalLayout from '../../components/layouts/PrincipalLayout';
import { 
  getStudents, 
  getDepartments, 
  getClasses, 
  createStudent, 
  deleteStudent 
} from '../../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department_id: '', class_id: '', year: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', roll_number: '',
    department_id: '', class_id: '', year: 1
  });

  useEffect(() => {
    fetchDepartments();
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, filters, search]);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch (error) {
      console.error('Failed to fetch departments');
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data);
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        search: search || undefined,
        ...filters
      };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      
      const res = await getStudents(params);
      setStudents(res.data.students);
      setPagination(prev => ({
        ...prev,
        pages: res.data.pages,
        total: res.data.total
      }));
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await createStudent(formData);
      toast.success('Student added successfully');
      setShowModal(false);
      setFormData({
        name: '', email: '', phone: '', roll_number: '',
        department_id: '', class_id: '', year: 1
      });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await deleteStudent(id);
      toast.success('Student deleted');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const getDeptName = (id) => departments.find(d => d.id === id)?.name || '-';
  const getClassName = (id) => classes.find(c => c.id === id)?.name || '-';

  return (
    <PrincipalLayout title="Students">
      <div className="space-y-6" data-testid="students-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, roll number, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
                data-testid="student-search-input"
              />
            </div>
          </form>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
            data-testid="add-student-button"
          >
            <Plus size={20} />
            Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.department_id}
            onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
            className="input-field w-auto"
            data-testid="department-filter"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="input-field w-auto"
            data-testid="year-filter"
          >
            <option value="">All Years</option>
            {[1, 2, 3, 4].map(y => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-4">Roll No</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Department</th>
                  <th className="text-left p-4">Year</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="table-row">
                      <td className="p-4 font-mono text-sm">{student.roll_number}</td>
                      <td className="p-4 font-medium">{student.name}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {getDeptName(student.department_id)}
                      </td>
                      <td className="p-4">
                        <span className="badge badge-info">Year {student.year}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{student.email}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/principal/students/${student.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            data-testid={`view-student-${student.id}`}
                          >
                            <Eye size={18} className="text-gray-600" />
                          </Link>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            data-testid={`delete-student-${student.id}`}
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Showing {students.length} of {pagination.total} students
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold">Add New Student</h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                    data-testid="student-name-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      required
                      data-testid="student-email-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      required
                      data-testid="student-phone-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Roll Number</label>
                  <input
                    type="text"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    className="input-field"
                    required
                    data-testid="student-roll-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Department</label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="input-field"
                      required
                      data-testid="student-dept-select"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="input-field"
                      required
                      data-testid="student-year-select"
                    >
                      {[1, 2, 3, 4].map(y => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Class</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    className="input-field"
                    required
                    data-testid="student-class-select"
                  >
                    <option value="">Select Class</option>
                    {classes.filter(c => !formData.department_id || c.department_id === formData.department_id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary" data-testid="submit-student-button">
                    Add Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  );
};

export default Students;
