import React, { useState, useEffect } from 'react';
import { Bell, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import StudentLayout from '../../components/layouts/StudentLayout';
import { getNotices } from '../../services/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await getNotices();
      setNotices(res.data);
    } catch (error) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Notices">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Notices">
      <div className="space-y-6" data-testid="student-notices-page">
        {notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No notices available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-xl border border-gray-100 p-6 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell size={24} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-lg">{notice.title}</h3>
                    <p className="text-gray-600 mt-2 leading-relaxed">{notice.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {notice.created_at && format(new Date(notice.created_at), 'MMM dd, yyyy')}
                      </span>
                      {notice.target_roles?.map(role => (
                        <span key={role} className="badge badge-info capitalize">{role}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Notices;
