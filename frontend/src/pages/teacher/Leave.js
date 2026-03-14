import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TeacherLayout from '../../components/layouts/TeacherLayout';
import { getLeaves, applyLeave } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Leave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    reason: '', start_date: '', end_date: '', leave_type: 'casual'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await getLeaves({ user_id: user?.id });
      setLeaves(res.data);
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.start_date || !formData.end_date || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await applyLeave(formData);
      toast.success('Leave application submitted');
      setFormData({ reason: '', start_date: '', end_date: '', leave_type: 'casual' });
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TeacherLayout title="Apply Leave">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="teacher-leave-page">
        {/* Apply Leave Form */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-heading font-semibold mb-6">New Leave Application</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Leave Type</label>
              <select
                value={formData.leave_type}
                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                className="input-field"
                data-testid="leave-type-select"
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="emergency">Emergency Leave</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="input-field"
                  required
                  data-testid="start-date-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="input-field"
                  required
                  data-testid="end-date-input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="input-field"
                rows={4}
                required
                placeholder="Please provide a detailed reason for leave..."
                data-testid="reason-input"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary"
              data-testid="submit-leave-button"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Leave History */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-heading font-semibold mb-6">Your Leave History</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary"></div>
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No leave applications yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {leaves.map((leave) => (
                <div key={leave.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`badge ${
                      leave.status === 'approved' ? 'badge-success' :
                      leave.status === 'rejected' ? 'badge-error' :
                      'badge-warning'
                    } capitalize`}>
                      {leave.status}
                    </span>
                    <span className="badge badge-info capitalize">{leave.leave_type}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{leave.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{leave.start_date} - {leave.end_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Leave;
