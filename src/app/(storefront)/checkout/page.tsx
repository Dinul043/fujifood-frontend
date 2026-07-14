'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import api from '@/lib/api'

/**
 * Checkout Page — Delivery address + payment + place order.
 * Wired to real API: POST /orders/place
 */
export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Address fields
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('Chennai')
  const [state, setState] = useState('Tamil Nadu')
  const [pincode, setPincode] = useState('')

  const deliveryFee = total >= 299 ? 0 : 30
  const grandTotal = total + deliveryFee

  // Redirect if cart empty
  useEffect(() => {
    if (typeof window !== 'undefined' && items.length === 0) {
      // Small delay for hydration
      const t = setTimeout(() => { if (items.length === 0) window.location.href = '/menu' }, 1000)
      return () => clearTimeout(t)
    }
  }, [items])

  const handlePlaceOrder = async () => {
    setError('')
    if (!line1.trim()) { setError('Address line 1 is required'); return }
    if (!city.trim()) { setError('City is required'); return }
    if (!pincode.trim() || pincode.length < 5) { setError('Enter a valid pincode'); return }

    setLoading(true)
    try {
      // Step 1: Create order
      const orderData = {
        items: items.map((i) => ({ menu_item_id: i.id, quantity: i.qty })),
        delivery_address: { line1, line2, city, state, pincode },
        payment_method: paymentMethod,
      }
      const { data: order } = await api.post('/orders/place', orderData)

      // Step 2: If online payment, open Razorpay
      if (paymentMethod === 'online') {
        const { data: rzp } = await api.post('/payment/create-order', { order_id: order.id })

        // Load Razorpay script if not loaded
        if (!(window as any).Razorpay) {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          document.body.appendChild(script)
          await new Promise(resolve => script.onload = resolve)
        }

        const options = {
          key: rzp.razorpay_key_id,
          amount: rzp.amount,
          currency: rzp.currency,
          name: 'A2B Veg Restaurant',
          description: `Order #${rzp.order_number}`,
          order_id: rzp.razorpay_order_id,
          handler: async (response: any) => {
            // Verify payment
            try {
              await api.post('/payment/verify', {
                order_id: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              clearCart()
              window.location.href = `/orders?new=${order.order_number}`
            } catch {
              setError('Payment verification failed. Contact support.')
              setLoading(false)
            }
          },
          prefill: {},
          theme: { color: '#C8964B' },
          modal: {
            ondismiss: () => { setError('Payment cancelled'); setLoading(false) }
          }
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
      } else {
        // COD — order is already placed
        clearCart()
        window.location.href = `/orders?new=${order.order_number}`
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ marginTop: '88px' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px', paddingTop: '48px', paddingBottom: '80px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '32px', marginBottom: '40px' }}>Checkout</h1>

          {error && <div style={{ marginBottom: '24px', padding: '14px 20px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA' }}><p className="text-[#DC2626] font-medium" style={{ fontSize: '13px' }}>{error}</p></div>}

          <div className="grid" style={{ gridTemplateColumns: '1fr 380px', gap: '48px' }}>
            {/* Left */}
            <div className="flex flex-col" style={{ gap: '32px' }}>
              {/* Delivery Address */}
              <div className="bg-white" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
                <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '24px' }}>Delivery Address</h3>
                <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                  <div className="col-span-2">
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Address Line 1 *</label>
                    <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="House/Flat number, Street" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Address Line 2</label>
                    <input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Landmark, Area" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
                  </div>
                  <div>
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>City *</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
                  </div>
                  <div>
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Pincode *</label>
                    <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="600001" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
                <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '24px' }}>Payment Method</h3>
                <div className="flex flex-col" style={{ gap: '12px' }}>
                  {[{ id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' }, { id: 'online', label: 'Pay Online (UPI/Card)', desc: 'Razorpay secure payment' }].map((m) => (
                    <label key={m.id} className="flex items-center cursor-pointer bg-[#FAFAF8] transition-all" style={{ gap: '16px', padding: '16px 20px', borderRadius: '12px', border: paymentMethod === m.id ? '2px solid #C8964B' : '1px solid #E8E4DE' }}>
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-[#C8964B]" style={{ width: '18px', height: '18px' }} />
                      <div><p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '14px' }}>{m.label}</p><p className="text-[#888]" style={{ fontSize: '12px' }}>{m.desc}</p></div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="bg-white self-start" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
              <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '24px' }}>Order Summary</h3>
              <div className="flex flex-col" style={{ gap: '8px', marginBottom: '16px' }}>
                {items.map((i) => (<div key={i.id} className="flex justify-between" style={{ fontSize: '13px' }}><span className="text-[#666]">{i.name} x{i.qty}</span><span className="font-medium">&#8377;{i.price * i.qty}</span></div>))}
              </div>
              <div className="flex flex-col" style={{ gap: '12px', paddingTop: '16px', borderTop: '1px solid #F0F0F0', marginBottom: '24px' }}>
                <div className="flex justify-between" style={{ fontSize: '14px' }}><span className="text-[#888]">Subtotal</span><span className="font-medium">&#8377;{total}</span></div>
                <div className="flex justify-between" style={{ fontSize: '14px' }}><span className="text-[#888]">Delivery</span><span className="font-medium" style={{ color: deliveryFee === 0 ? '#16A34A' : '#1A1A1A' }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <div style={{ height: '1px', background: '#E8E4DE' }} />
                <div className="flex justify-between" style={{ fontSize: '20px' }}><span className="font-bold">Total</span><span className="font-bold text-[#C8964B]">&#8377;{grandTotal}</span></div>
              </div>
              <button onClick={handlePlaceOrder} disabled={loading} className="w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '52px', borderRadius: '12px', fontSize: '15px' }}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="block md:hidden" style={{ paddingTop: '96px', paddingBottom: '32px' }}>
        <div style={{ padding: '20px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '22px', marginBottom: '20px' }}>Checkout</h1>
          {error && <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA' }}><p className="text-[#DC2626]" style={{ fontSize: '12px', fontWeight: 500 }}>{error}</p></div>}
          <div className="bg-white" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5', marginBottom: '16px' }}>
            <h3 className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px', marginBottom: '16px' }}>Delivery Address</h3>
            <div className="flex flex-col" style={{ gap: '12px' }}>
              <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="House/Flat, Street *" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '10px', fontSize: '13px', paddingLeft: '12px' }} />
              <input value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Landmark, Area" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '10px', fontSize: '13px', paddingLeft: '12px' }} />
              <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '10px', fontSize: '13px', paddingLeft: '12px' }} />
                <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '10px', fontSize: '13px', paddingLeft: '12px' }} />
              </div>
            </div>
          </div>
          <div className="bg-white" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5', marginBottom: '16px' }}>
            <h3 className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px', marginBottom: '12px' }}>Payment</h3>
            {[{ id: 'cod', label: 'Cash on Delivery' }, { id: 'online', label: 'Pay Online' }].map((m) => (
              <label key={m.id} className="flex items-center cursor-pointer" style={{ gap: '12px', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                <input type="radio" name="pay" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-[#C8964B]" style={{ width: '16px', height: '16px' }} />
                <span className="font-medium text-[#1A1A1A]" style={{ fontSize: '13px' }}>{m.label}</span>
              </label>
            ))}
          </div>
          <div className="bg-white" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5' }}>
            <div className="flex justify-between" style={{ fontSize: '16px', marginBottom: '16px' }}><span className="font-bold">Total</span><span className="font-bold text-[#C8964B]">&#8377;{grandTotal}</span></div>
            <button onClick={handlePlaceOrder} disabled={loading} className="w-full font-semibold text-white bg-[#C8964B] disabled:opacity-60" style={{ height: '48px', borderRadius: '12px', fontSize: '14px' }}>
              {loading ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
