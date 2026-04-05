import { useState } from 'react';
import { useAuth } from '../context/GameContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WithdrawModal({ isOpen, onClose }) {
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!amount || parseFloat(amount) < 50) {
      setError('Minimum withdrawal is 50 KES');
      return;
    }

    if (parseFloat(amount) > (user?.balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/user/withdraw`,
        { amount: parseFloat(amount), phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateBalance((user?.balance || 0) - parseFloat(amount));
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setAmount('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-aviator-card rounded-2xl w-full max-w-md mx-4 border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-400 font-bold text-lg">Withdrawal Successful!</p>
              <p className="text-gray-400 text-sm mt-1">-{parseFloat(amount).toFixed(2)} KES sent to {phoneNumber}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="bg-aviator-darker rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-400">Available Balance</p>
                <p className="text-2xl font-bold text-aviator-green">{(user?.balance || 0).toFixed(2)} KES</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-field text-lg font-bold"
                  min="50"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="py-2 rounded-lg text-sm font-bold bg-aviator-darker text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {val}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+254712345678"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Funds will be sent via M-Pesa</p>
              </div>

              <div className="bg-aviator-darker rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-white">{amount ? parseFloat(amount).toFixed(2) : '0.00'} KES</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-400">Fee</span>
                  <span className="text-white">0.00 KES</span>
                </div>
                <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between">
                  <span className="text-gray-300 font-medium">You receive</span>
                  <span className="text-aviator-green font-bold">{amount ? parseFloat(amount).toFixed(2) : '0.00'} KES</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full btn-primary text-lg"
              >
                {processing ? 'Processing...' : `WITHDRAW ${amount ? parseFloat(amount).toFixed(2) : '0.00'} KES`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
