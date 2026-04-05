import { useState } from 'react';
import { useAuth } from '../context/GameContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DepositModal({ isOpen, onClose }) {
  const { user, updateBalance } = useAuth();
  const [method, setMethod] = useState('mpesa');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [tillNumber, setTillNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!amount || parseFloat(amount) < 10) {
      setError('Minimum deposit is 10 KES');
      return;
    }

    if (method === 'pochi' && !phoneNumber) {
      setError('Phone number is required for Pochi');
      return;
    }

    if (method === 'till' && !tillNumber) {
      setError('Till number is required');
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/user/deposit`,
        { amount: parseFloat(amount), method, phoneNumber, tillNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateBalance((user?.balance || 0) + parseFloat(amount));
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setAmount('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-aviator-card rounded-2xl w-full max-w-md mx-4 border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Deposit Funds</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-2 mb-5">
            <button
              onClick={() => setMethod('mpesa')}
              className={`py-3 rounded-lg text-sm font-bold transition-all ${
                method === 'mpesa' ? 'bg-green-600 text-white' : 'bg-aviator-darker text-gray-400 hover:text-white'
              }`}
            >
              M-Pesa
            </button>
            <button
              onClick={() => setMethod('pochi')}
              className={`py-3 rounded-lg text-sm font-bold transition-all ${
                method === 'pochi' ? 'bg-green-600 text-white' : 'bg-aviator-darker text-gray-400 hover:text-white'
              }`}
            >
              Pochi
            </button>
            <button
              onClick={() => setMethod('till')}
              className={`py-3 rounded-lg text-sm font-bold transition-all ${
                method === 'till' ? 'bg-green-600 text-white' : 'bg-aviator-darker text-gray-400 hover:text-white'
              }`}
            >
              Till No.
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-400 font-bold text-lg">Deposit Successful!</p>
              <p className="text-gray-400 text-sm mt-1">+{parseFloat(amount).toFixed(2)} KES</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-field text-lg font-bold"
                  min="10"
                  required
                />
              </div>

              {method === 'pochi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+254712345678"
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">STK push will be sent to this number</p>
                </div>
              )}

              {method === 'till' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Till Number</label>
                  <input
                    type="text"
                    value={tillNumber}
                    onChange={(e) => setTillNumber(e.target.value)}
                    placeholder="Enter till number"
                    className="input-field"
                    required
                  />
                  <div className="mt-3 bg-aviator-darker rounded-lg p-3">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Till Number:</span> <span className="font-bold text-white">4567890</span>
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      <span className="text-gray-500">Account:</span> <span className="font-bold text-white">{user?.phoneNumber || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Go to M-Pesa → Lipa na M-Pesa → Buy Goods → Enter Till → Enter Amount → Enter PIN</p>
                  </div>
                </div>
              )}

              {method === 'mpesa' && (
                <div className="bg-aviator-darker rounded-lg p-3">
                  <p className="text-sm text-gray-300">
                    <span className="text-gray-500">Paybill:</span> <span className="font-bold text-white">247247</span>
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    <span className="text-gray-500">Account:</span> <span className="font-bold text-white">{user?.phoneNumber || 'N/A'}</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full btn-primary text-lg"
              >
                {processing ? 'Processing...' : `DEPOSIT ${amount ? parseFloat(amount).toFixed(2) : '0.00'} KES`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
