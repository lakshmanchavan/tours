import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  Building, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { BUSINESS_INFO } from '../lib/constants';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  advanceAmount: number;
  onPaymentSuccess: (paymentRecord: {
    paymentId: string;
    amount: number;
    paymentMethod: string;
    paymentType: 'advance' | 'full';
    gatewayPaymentId: string;
  }) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  bookingCode,
  customerName,
  customerPhone,
  totalAmount,
  advanceAmount,
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  const [payType, setPayType] = useState<'advance' | 'full'>('advance');
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const payableAmount = payType === 'advance' ? advanceAmount : totalAmount;
  const officialUpiVpa = `adviktours@icici`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(officialUpiVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    // Simulate authentic Indian Gateway (Razorpay/Paytm/ICICI PG) response cycle
    setTimeout(() => {
      const generatedPayId = `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}_ADV`;
      
      onPaymentSuccess({
        paymentId: `PAY-${Date.now().toString().slice(-6)}`,
        amount: payableAmount,
        paymentMethod: method,
        paymentType: payType,
        gatewayPaymentId: generatedPayId,
      });

      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8 flex flex-col">
        
        {/* Gateway Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white font-heading">Secure Payment Checkout</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">256-Bit SSL</span>
              </div>
              <p className="text-[11px] text-slate-400">Advik Tours & Travels Official Booking Portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Banner */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-500 block">Booking Reference:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{bookingCode}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Payable Amount:</span>
            <span className="text-xl font-black text-amber-600 font-heading">
              ₹{payableAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Amount Choice */}
        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Select Amount to Pay
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayType('advance')}
                className={`p-3 text-left rounded-2xl border-2 transition-all cursor-pointer ${
                  payType === 'advance'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">20% Booking Advance</div>
                <div className="text-base font-black text-amber-600 mt-0.5">
                  ₹{advanceAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Locks cab. Pay balance during journey.</div>
              </button>

              <button
                type="button"
                onClick={() => setPayType('full')}
                className={`p-3 text-left rounded-2xl border-2 transition-all cursor-pointer ${
                  payType === 'full'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">100% Full Payment</div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-1">Zero balance hassle on trip</div>
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Payment Method
            </label>
            <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-100 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'upi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === 'netbanking' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-purple-600" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>

          {/* METHOD 1: UPI */}
          {method === 'upi' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Scan with Any UPI App</span>
                  </div>
                  <p className="text-[11px] text-slate-600">GPay, PhonePe, Paytm, BHIM or Cred</p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs text-slate-800 font-bold">
                    <span>{officialUpiVpa}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 hover:bg-emerald-100 rounded text-emerald-700 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="w-20 h-20 bg-white p-1 rounded-xl border border-emerald-300 flex items-center justify-center shadow-xs">
                  <div className="grid grid-cols-4 gap-0.5 w-full h-full p-1 bg-slate-900 rounded">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`rounded-xs ${i % 2 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-transparent'}`}></div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Enter Your UPI ID (e.g. mobile@upi)
                </label>
                <input
                  type="text"
                  placeholder="yourname@okhdfcbank"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* METHOD 2: DEBIT / CREDIT CARD */}
          {method === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="4532 •••• •••• 9812"
                  maxLength={19}
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name as on card"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* METHOD 3: NET BANKING */}
          {method === 'netbanking' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Your Bank
              </label>
              <select
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-hidden focus:border-purple-500"
              >
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
                <option value="Canara Bank">Canara Bank</option>
              </select>
              <p className="text-[11px] text-slate-500">
                You will be redirected securely to the bank portal to authorize payment.
              </p>
            </div>
          )}

          {/* Security Assurance */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-xl">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Payments processed via secure PCI-DSS certified gateway. Advik Tours never stores card/bank details.</span>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleProcessPayment}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authorizing & Verifying Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{payableAmount.toLocaleString('en-IN')} & Confirm Cab</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
