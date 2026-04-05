import { useState } from 'react';
import { useAuth } from '../context/GameContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Header() {
  const { user, logout, updateBalance } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || depositAmount <= 0) return;
    setDepositing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/user/deposit`,
        { amount: parseFloat(depositAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateBalance(res.data.balance);
      setShowDeposit(false);
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setDepositing(false);
    }
  };

  return (
    <header className="bg-aviator-card border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-aviator-accent">AVIATOR</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-aviator-darker rounded-lg px-4 py-2">
            <span className="text-gray-400 text-sm">Balance:</span>
            <span className="text-aviator-green font-bold">
              {user?.balance?.toFixed(2) || '0.00'} KES
            </span>
          </div>

          <button
            onClick={() => setShowDeposit(!showDeposit)}
            className="btn-orange text-sm py-2 px-4"
          >
            DEPOSIT
          </button>

          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm hidden sm:inline">{user?.username}</span>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {showDeposit && (
        <div className="max-w-7xl mx-auto mt-4">
          <div className="card">
            <h3 className="text-lg font-bold mb-3">Deposit via M-Pesa</h3>
            <form onSubmit={handleDeposit} className="flex gap-3">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount (KES)"
                className="input-field flex-1"
                min="10"
                required
              />
              <button type="submit" disabled={depositing} className="btn-orange">
                {depositing ? 'Processing...' : 'DEPOSIT'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeposit(false)}
                className="px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Mock deposit - In production, M-Pesa STK Push will be integrated
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
