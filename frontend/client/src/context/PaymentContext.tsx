'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Move the types here so they can be shared globally
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
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Initial mock data to start with (same as what you had on the profile page)
const initialPayments: PaymentMethodData[] = [
  { id: '1', type: 'credit_card', isDefault: true, details: { brand: 'Visa', last4: '4242', exp: '12/24' } },
  { id: '2', type: 'credit_card', isDefault: false, details: { brand: 'Mastercard', last4: '8888', exp: '08/25' } },
  { id: '3', type: 'paypal', isDefault: false, details: { email: 'user@example.com' } },
];

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [payments, setPayments] = useState<PaymentMethodData[]>(initialPayments);

  return (
    <PaymentContext.Provider value={{ payments, setPayments }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};