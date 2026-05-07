// components/StripePayment.tsx
"use client";

import { useState } from "react";

interface StripePaymentProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripePayment({ amount, onSuccess, onCancel }: StripePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock payment - real Stripe integrationda burada API çağırılacaq
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Payment Details
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Amount: <span className="font-bold text-blue-600">${amount}</span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expiry (MM/YY)
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="12/28"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CVC
            </label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay $${amount}`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        Test mode: Use card 4242 4242 4242 4242
      </p>
    </div>
  );
}