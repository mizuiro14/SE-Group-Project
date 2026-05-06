'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import your auth to get the user ID

export type PaymentType = 'credit_card' | 'paypal' | 'bank_transfer';

export interface PaymentMethodData {
  id: string;
  type: PaymentType;
  isDefault: boolean;
  details: any;
}

interface PaymentContextType {
  payments: PaymentMethodData[];
  setPayments: React.Dispatch<React.SetStateAction<PaymentMethodData[]>>;
  refreshPayments: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode; }) => {
  const [payments, setPayments] = useState<PaymentMethodData[]>([]);
  const { user } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const normalizePaymentMethod = (method: any): PaymentMethodData => ({
    id: String(method.id),
    type: method.type ?? method.method,
    isDefault: Boolean(method.is_default ?? method.isDefault),
    details: method.details ?? {},
  });

  const fetchPayments = async () => {
    if (!user || !user.id) return;

    try {
      const res = await fetch(`${API_URL}/api/payments/methods/${user.id}`, {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        const rawMethods = data.methods || data;

        // Map database schema (is_default) to frontend type (isDefault)
        const formattedMethods = rawMethods.map(normalizePaymentMethod);

        setPayments(formattedMethods);
      }
    } catch (err) {
      console.error("Failed to load payment methods", err);
    }
  };

  // Depend strictly on user.id so it fetches reliably after page reloads
  useEffect(() => {
    fetchPayments();
  }, [user?.id]);

  return (
    <PaymentContext.Provider value={{ payments, setPayments, refreshPayments: fetchPayments }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePayment must be used within a PaymentProvider');
  return context;
};