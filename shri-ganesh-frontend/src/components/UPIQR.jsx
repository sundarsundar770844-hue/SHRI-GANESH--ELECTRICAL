import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const UPI_ID = 'vickyvigneshc20-1@okicici';
const SHOP_NAME = 'Shri Ganesh Electricals';

export default function UPIQR({ amount, size = 120 }) {
  const upiUri = amount
    ? `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&am=${amount}&cu=INR`
    : `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(SHOP_NAME)}&cu=INR`;

  return (
    <div className="inline-flex flex-col items-center p-3 bg-white rounded-xl border">
      <QRCodeSVG value={upiUri} size={size} level="M" includeMargin />
      <div className="mt-2 text-xs text-slate-600 text-center break-all max-w-[140px]">{UPI_ID}</div>
      {amount > 0 && <div className="text-xs font-medium text-[#0D47A1]">₹{amount}</div>}
    </div>
  );
}
