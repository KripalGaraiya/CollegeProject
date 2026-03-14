import React, { useState, useEffect } from 'react';
import { Check, X, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PrincipalLayout from '../../components/layouts/PrincipalLayout';
import { getLeaves, approveLeave, rejectLeave } from '../../services/api';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await getLeaves(params);
      setLeaves(res.data);
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveLeave(id);
      toast.success('Leave approved');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLeave(id);
      toast.success('Leave rejected');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  return (
    <PrincipalLayout title="Leave Requests">
      <div className="space-y-6" data-testid="leaves-page">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              data-testid={`filter-${status}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {leaves.map((leave) => (
              <div key={leave.id} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-semibold">{leave.user_name}</h3>
                    <p className="text-gray-600 mt-1">{leave.reason}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {leave.start_date} - {leave.end_date}
                      </span>
                      <span className="badge badge-info capitalize">{leave.leave_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {leave.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          data-testid={`approve-${leave.id}`}
                        >
                          <Check size={18} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          data-testid={`reject-${leave.id}`}
                        >
                          <X size={18} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className={`badge ${
                        leave.status === 'approved' ? 'badge-success' : 'badge-error'
                      } capitalize`}>
                        {leave.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {leaves.length === 0 && (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No {filter !== 'all' ? filter : ''} leave requests</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PrincipalLayout>
  );
};

export default Leaves;
