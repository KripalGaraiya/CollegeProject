import React, { useState, useEffect } from 'react';
import { CreditCard, Check, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import StudentLayout from '../../components/layouts/StudentLayout';
import { getStudentByUser, getStudentFeeSummary } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Fees = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const studentRes = await getStudentByUser(user.id);
      const feesRes = await getStudentFeeSummary(studentRes.data.id);
      setFees(feesRes.data);
    } catch (error) {
      toast.error('Failed to load fee details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout title="Fees">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Fee Status">
      <div className="space-y-6" data-testid="student-fees-page">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold">₹{(fees?.total_fees || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Fees</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Check size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-green-600">₹{(fees?.total_paid || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Amount Paid</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-red-600">₹{(fees?.pending || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Pending Amount</p>
          </div>
        </div>

        {/* Fee Details */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-heading font-semibold">Fee Breakdown</h3>
          </div>
          {(!fees?.fees || fees.fees.length === 0) ? (
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No fee records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left p-4">Fee Type</th>
                    <th className="text-left p-4">Academic Year</th>
                    <th className="text-right p-4">Amount</th>
                    <th className="text-right p-4">Paid</th>
                    <th className="text-center p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.fees.map((fee, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="p-4 capitalize font-medium">{fee.fee_type}</td>
                      <td className="p-4 text-gray-600">{fee.academic_year}</td>
                      <td className="p-4 text-right">₹{fee.amount.toLocaleString()}</td>
                      <td className="p-4 text-right text-green-600">₹{(fee.amount_paid || 0).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`badge ${
                          fee.status === 'paid' ? 'badge-success' :
                          fee.status === 'partial' ? 'badge-warning' :
                          'badge-error'
                        } capitalize`}>
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Progress */}
        {fees?.total_fees > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-heading font-semibold mb-4">Payment Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${(fees.total_paid / fees.total_fees * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{Math.round(fees.total_paid / fees.total_fees * 100)}% Paid</span>
              <span>₹{fees.pending.toLocaleString()} remaining</span>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default Fees;
