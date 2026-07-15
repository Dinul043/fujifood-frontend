'use client'

import { useCart } from '@/hooks/useCart'

/**
 * Cart Page — Review items before checkout.
 * Desktop: Two columns (items left, summary right)
 * Mobile: Stacked
 */
export default function CartPage() {
  const { items, total, updateQty, removeFromCart } = useCart()
  const deliveryFee = total >= 299 ? 0 : 30
  const grandTotal = total + deliveryFee
  if (items.length === 0) {
    return (
      <>
        <div className="hidden md:block" style={{ marginTop: '88px' }}>
          <div className="mx-auto text-center" style={{ maxWidth: '1280px', padding: '120px 48px' }}>
            <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '28px', marginBottom: '16px' }}>Your cart is empty</h1>
            <p className="text-[#888]" style={{ fontSize: '15px', marginBottom: '32px' }}>Add some delicious items from our menu</p>
            <a href="/menu" className="inline-flex items-center justify-center font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all" style={{ height: '48px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '12px', fontSize: '14px' }}>Browse Menu</a>
          </div>
        </div>
        <div className="block md:hidden" style={{ paddingTop: '96px' }}>
          <div className="text-center" style={{ padding: '80px 20px' }}>
            <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '22px', marginBottom: '12px' }}>Your cart is empty</h1>
            <p className="text-[#888]" style={{ fontSize: '14px', marginBottom: '24px' }}>Add items from the menu</p>
            <a href="/menu" className="inline-flex items-center justify-center font-semibold text-white bg-[#C8964B]" style={{ height: '44px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '10px', fontSize: '13px' }}>Browse Menu</a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block 2xl:w-full max-w-[1600px] mx-auto" style={{ marginTop: '88px' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px', paddingTop: '48px', paddingBottom: '80px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '32px', marginBottom: '40px' }}>Your Cart ({items.length} items)</h1>
          <div className="grid" style={{ gridTemplateColumns: '1fr 380px', gap: '48px' }}>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              {items.map((item) => (
                <div key={item.id} className="flex items-center bg-white" style={{ gap: '20px', padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5' }}>
                  <img src={item.image} alt={item.name} className="object-cover" style={{ width: '80px', height: '80px', borderRadius: '12px' }} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A1A1A]" style={{ fontSize: '16px', marginBottom: '4px' }}>{item.name}</h3>
                    <span className="font-bold text-[#C8964B]" style={{ fontSize: '16px' }}>&#8377;{item.price}</span>
                  </div>
                  <div className="flex items-center" style={{ gap: '12px', border: '1px solid #E8E4DE', borderRadius: '10px', padding: '6px 12px' }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="text-[#999] hover:text-[#1A1A1A]" style={{ fontSize: '18px', fontWeight: 600 }}>−</button>
                    <span className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-[#C8964B] hover:text-[#A67B3D]" style={{ fontSize: '18px', fontWeight: 600 }}>+</button>
                  </div>
                  <span className="font-bold text-[#1A1A1A]" style={{ fontSize: '16px', minWidth: '70px', textAlign: 'right' }}>&#8377;{item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="bg-white self-start" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
              <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '24px' }}>Order Summary</h3>
              <div className="flex flex-col" style={{ gap: '12px', marginBottom: '24px' }}>
                <div className="flex justify-between" style={{ fontSize: '14px' }}><span className="text-[#888]">Subtotal</span><span className="font-medium">&#8377;{total}</span></div>
                <div className="flex justify-between" style={{ fontSize: '14px' }}><span className="text-[#888]">Delivery Fee</span><span className="font-medium">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <div style={{ height: '1px', background: '#E8E4DE' }} />
                <div className="flex justify-between" style={{ fontSize: '18px' }}><span className="font-bold">Total</span><span className="font-bold text-[#C8964B]">&#8377;{grandTotal}</span></div>
              </div>
              {deliveryFee === 0 && <p className="text-[#16A34A]" style={{ fontSize: '12px', marginBottom: '16px' }}>Free delivery applied (order above ₹299)</p>}
              <a href="/checkout" className="flex items-center justify-center w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all" style={{ height: '52px', borderRadius: '12px', fontSize: '15px' }}>Proceed to Checkout</a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="block md:hidden" style={{ paddingTop: '96px', paddingBottom: '32px' }}>
        <div style={{ padding: '20px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '22px', marginBottom: '20px' }}>Your Cart ({items.length})</h1>
          <div className="flex flex-col" style={{ gap: '12px', marginBottom: '24px' }}>
            {items.map((item) => (
              <div key={item.id} className="flex items-center bg-white" style={{ gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #EEEAE5' }}>
                <img src={item.image} alt={item.name} className="object-cover" style={{ width: '56px', height: '56px', borderRadius: '10px' }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A1A] truncate" style={{ fontSize: '13px', marginBottom: '2px' }}>{item.name}</h3>
                  <span className="font-bold text-[#C8964B]" style={{ fontSize: '13px' }}>&#8377;{item.price * item.qty}</span>
                </div>
                <div className="flex items-center" style={{ gap: '8px', border: '1px solid #E8E4DE', borderRadius: '8px', padding: '4px 10px' }}>
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="text-[#999]" style={{ fontSize: '16px' }}>−</button>
                  <span className="font-semibold" style={{ fontSize: '13px' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-[#C8964B]" style={{ fontSize: '16px' }}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5' }}>
            <div className="flex flex-col" style={{ gap: '10px', marginBottom: '16px' }}>
              <div className="flex justify-between" style={{ fontSize: '13px' }}><span className="text-[#888]">Subtotal</span><span className="font-medium">&#8377;{total}</span></div>
              <div className="flex justify-between" style={{ fontSize: '13px' }}><span className="text-[#888]">Delivery</span><span className="font-medium">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
              <div style={{ height: '1px', background: '#E8E4DE' }} />
              <div className="flex justify-between" style={{ fontSize: '16px' }}><span className="font-bold">Total</span><span className="font-bold text-[#C8964B]">&#8377;{grandTotal}</span></div>
            </div>
            <a href="/checkout" className="flex items-center justify-center w-full font-semibold text-white bg-[#C8964B]" style={{ height: '48px', borderRadius: '12px', fontSize: '14px' }}>Proceed to Checkout</a>
          </div>
        </div>
      </div>
    </>
  )
}
