import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building2, X } from 'lucide-react';
import { toast } from 'sonner';
import PrincipalLayout from '../../components/layouts/PrincipalLayout';
import { getDepartments, createDepartment, deleteDepartment } from '../../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createDepartment(formData);
      toast.success('Department added');
      setShowModal(false);
      setFormData({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await deleteDepartment(id);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  return (
    <PrincipalLayout title="Departments">
      <div className="space-y-6" data-testid="departments-page">
        <div className="flex justify-end">
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2" data-testid="add-dept-button">
            <Plus size={20} /> Add Department
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white rounded-xl border border-gray-100 p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <button onClick={() => handleDelete(dept.id)} className="p-2 hover:bg-red-50 rounded-lg" data-testid={`delete-dept-${dept.id}`}>
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
                <h3 className="font-heading font-semibold mb-1">{dept.name}</h3>
                <p className="text-sm text-gray-500 font-mono">{dept.code}</p>
                {dept.description && <p className="text-sm text-gray-600 mt-2">{dept.description}</p>}
              </div>
            ))}
            {departments.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">No departments found</div>
            )}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold">Add Department</h2>
                <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-500" /></button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" required data-testid="dept-name-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Code</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="input-field" required data-testid="dept-code-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} data-testid="dept-desc-input" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary" data-testid="submit-dept-button">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PrincipalLayout>
  );
};

export default Departments;
