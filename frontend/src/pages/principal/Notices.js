import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Bell, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PrincipalLayout from '../../components/layouts/PrincipalLayout';
import { getNotices, createNotice, deleteNotice, getDepartments } from '../../services/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', department_id: '', target_roles: ['student', 'teacher']
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [noticesRes, deptsRes] = await Promise.all([getNotices(), getDepartments()]);
      setNotices(noticesRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createNotice({
        ...formData,
        department_id: formData.department_id || null
      });
      toast.success('Notice published');
      setShowModal(false);
      setFormData({ title: '', description: '', department_id: '', target_roles: ['student', 'teacher'] });
      fetchData();
    } catch (error) {
      toast.error('Failed to create notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await deleteNotice(id);
      toast.success('Notice deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  return (
    <PrincipalLayout title="Notices">
      <div className="space-y-6" data-testid="notices-page">
        <div className="flex justify-end">
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2" data-testid="add-notice-button">
            <Plus size={20} /> Create Notice
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Bell size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">{notice.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notice.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {notice.target_roles?.map(role => (
                          <span key={role} className="badge badge-info capitalize">{role}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {notice.created_at && format(new Date(notice.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(notice.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
            {notices.length === 0 && (
              <div className="text-center py-12 text-gray-500">No notices found</div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold">Create Notice</h2>
                <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-500" /></button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required data-testid="notice-title-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={4} required data-testid="notice-desc-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Department (Optional)</label>
                  <select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} className="input-field" data-testid="notice-dept-select">
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.target_roles.includes('student')} onChange={() => toggleRole('student')} className="w-4 h-4" />
                      <span className="text-sm">Students</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.target_roles.includes('teacher')} onChange={() => toggleRole('teacher')} className="w-4 h-4" />
                      <span className="text-sm">Teachers</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary" data-testid="submit-notice-button">Publish</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  );
};

export default Notices;
