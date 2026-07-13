'use client'

import { useState } from 'react'

/**
 * Checkout Page — Delivery address + payment method selection.
 * Desktop: Two columns (form left, order summary right)
 * Mobile: Stacked
 */
export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('cod')

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ marginTop: '88px' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px', paddingTop: '48px', paddingBottom: '80px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '32px', marginBottom: '40px' }}>Checkout</h1>

          <div className="grid" style={{ gridTemplateColumns: '1fr 380px', gap: '48px' }}>
            {/* Left: Delivery + Payment */}
            <div className="flex flex-col" style={{ gap: '32px' }}>
              {/* Delivery Address */}
              <div className="bg-white" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
                <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '24px' }}>Delivery Address</h3>
                <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                  <div>
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '13px', marginBottom: '8px' }}>Address Line 1</label>
                    <input placeholder="House/Flat number, Street" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#BBB] outline-none focus:border-[#C8964B] transition-colors" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px', paddingRight: '14px' }} />
                  </div>
                  <div>
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '13px', marginBottom: '8px' }}>Address Line 2</label>
                    <input placeholder="Landmark, Area" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#BBB] outline-none focus:border-[#C8964B] transition-colors" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px', paddingRight: '14px' }} />
                  </div>
                  <div>
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '13px', marginBottom: '8px' }}>City</label>
                    <input placeholder="Chennai" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#BBB] outline-none focus:border-[#C8964B] transition-colors" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px', paddingRight: '14px' }} />
                  </div>
                  <div>
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '13px', marginBottom: '8px' }}>Pincode</label>
                    <input placeholder="600001" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#BBB] outline-none focus:border-[#C8964B] transition-colors" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px', paddingRight: '14px' }} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
                <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '24px' }}>Payment Method</h3>
                <div className="flex flex-col" style={{ gap: '12px' }}>
                  {[
                    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                    { id: 'online', label: 'Pay Online (UPI/Card)', desc: 'Razorpay secure payment' },
                  ].map((m) => (
                    <label key={m.id} className="flex items-center cursor-pointer bg-[#FAFAF8] transition-all" style={{ gap: '16px', padding: '16px 20px', borderRadius: '12px', border: paymentMethod === m.id ? '2px solid #C8964B' : '1px solid #E8E4DE' }}>
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-[#C8964B]" style={{ width: '18px', height: '18px' }} />
                      <div>
                        <p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '14px' }}>{m.label}</p>
                        <p className="text-[#888]" style={{ fontSize: '12px' }}>{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="bg-white self-start" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
              <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '24px' }}>Order Summary</h3>
              <div className="flex flex-col" style={{ gap: '12px', marginBottom: '24px' }}>
                <div className="flex justify-between" style={{ fontSize: '14px' }}><span className="text-[#888]">Subtotal (3 items)</span><span className="font-medium">&#8377;439</span></div>
                <div className="flex justify-between" style={{ fontSize: '14px' }}><span className="text-[#888]">Delivery Fee</span><span className="font-medium text-[#16A34A]">FREE</span></div>
                <div style={{ height: '1px', background: '#E8E4DE' }} />
                <div className="flex justify-between" style={{ fontSize: '18px' }}><span className="font-bold">Total</span><span className="font-bold text-[#C8964B]">&#8377;439</span></div>
              </div>
              <button className="w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all" style={{ height: '52px', borderRadius: '12px', fontSize: '15px' }}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="block md:hidden" style={{ paddingTop: '96px', paddingBottom: '32px' }}>
        <div style={{ padding: '20px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '22px', marginBottom: '20px' }}>Checkout</h1>
          {/* Address */}
          <div className="bg-white" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5', marginBottom: '16px' }}>
            <h3 className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px', marginBottom: '16px' }}>Delivery Address</h3>
            <div className="flex flex-col" style={{ gap: '12px' }}>
              <input placeholder="House/Flat, Street" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '10px', fontSize: '13px', paddingLeft: '12px' }} />
              <input placeholder="Landmark, Area" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '10px', fontSize: '13px', paddingLeft: '12px' }} />
              <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                <input placeholder="City" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '10px', fontSize: '13px', paddingLeft: '12px' }} />
                <input placeholder="Pincode" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '10px', fontSize: '13px', paddingLeft: '12px' }} />
              </div>
            </div>
          </div>
          {/* Payment */}
          <div className="bg-white" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5', marginBottom: '16px' }}>
            <h3 className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px', marginBottom: '12px' }}>Payment</h3>
            {[
              { id: 'cod', label: 'Cash on Delivery' },
              { id: 'online', label: 'Pay Online (UPI/Card)' },
            ].map((m) => (
              <label key={m.id} className="flex items-center cursor-pointer" style={{ gap: '12px', padding: '12px 0', borderBottom: '1px solid #F0F0F0' }}>
                <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-[#C8964B]" style={{ width: '16px', height: '16px' }} />
                <span className="font-medium text-[#1A1A1A]" style={{ fontSize: '13px' }}>{m.label}</span>
              </label>
            ))}
          </div>
          {/* Summary + Place Order */}
          <div className="bg-white" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5' }}>
            <div className="flex justify-between" style={{ fontSize: '13px', marginBottom: '8px' }}><span className="text-[#888]">Total</span><span className="font-bold text-[#C8964B]" style={{ fontSize: '16px' }}>&#8377;439</span></div>
            <button className="w-full font-semibold text-white bg-[#C8964B]" style={{ height: '48px', borderRadius: '12px', fontSize: '14px' }}>Place Order</button>
          </div>
        </div>
      </div>
    </>
  )
}
