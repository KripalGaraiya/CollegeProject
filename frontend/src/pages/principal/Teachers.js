import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  UserCheck, 
  UserX,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import PrincipalLayout from '../../components/layouts/PrincipalLayout';
import { 
  getTeachers, 
  getDepartments, 
  createTeacher, 
  deleteTeacher,
  getTeacherAvailability
} from '../../services/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', employee_id: '',
    department_id: '', designation: '', qualification: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, deptsRes] = await Promise.all([
        getTeacherAvailability(),
        getDepartments()
      ]);
      setTeachers(teachersRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      await createTeacher(formData);
      toast.success('Teacher added successfully');
      setShowModal(false);
      setFormData({
        name: '', email: '', phone: '', employee_id: '',
        department_id: '', designation: '', qualification: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      await deleteTeacher(id);
      toast.success('Teacher deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  const getDeptName = (id) => departments.find(d => d.id === id)?.name || '-';

  return (
    <PrincipalLayout title="Teachers">
      <div className="space-y-6" data-testid="teachers-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Present: {teachers.filter(t => !t.is_on_leave).length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                On Leave: {teachers.filter(t => t.is_on_leave).length}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
            data-testid="add-teacher-button"
          >
            <Plus size={20} />
            Add Teacher
          </button>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => (
              <div 
                key={teacher.id} 
                className="bg-white rounded-xl border border-gray-100 p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      teacher.is_on_leave ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      {teacher.is_on_leave ? (
                        <UserX size={24} className="text-red-600" />
                      ) : (
                        <UserCheck size={24} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{teacher.name}</h3>
                      <p className="text-sm text-gray-500">{teacher.designation}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(teacher.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                    data-testid={`delete-teacher-${teacher.id}`}
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="text-gray-400">ID:</span> {teacher.employee_id}
                  </p>
                  <p className="text-gray-600">
                    <span className="text-gray-400">Dept:</span> {getDeptName(teacher.department_id)}
                  </p>
                  <p className="text-gray-600">
                    <span className="text-gray-400">Email:</span> {teacher.email}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className={`badge ${teacher.is_on_leave ? 'badge-error' : 'badge-success'}`}>
                    {teacher.is_on_leave ? 'On Leave' : 'Available'}
                  </span>
                  {teacher.is_on_leave && teacher.leave_reason && (
                    <p className="text-xs text-gray-500 mt-2">{teacher.leave_reason}</p>
                  )}
                </div>
              </div>
            ))}
            {teachers.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No teachers found
              </div>
            )}
          </div>
        )}

        {/* Add Teacher Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold">Add New Teacher</h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                    data-testid="teacher-name-input"
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
                      data-testid="teacher-email-input"
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
                      data-testid="teacher-phone-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="input-field"
                    required
                    data-testid="teacher-empid-input"
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
                      data-testid="teacher-dept-select"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Professor"
                      required
                      data-testid="teacher-designation-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="input-field"
                    placeholder="e.g., MD Homeopathy"
                    data-testid="teacher-qualification-input"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary" data-testid="submit-teacher-button">
                    Add Teacher
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

export default Teachers;
