'use client'

/**
 * Customers — List of restaurant customers (placeholder for now).
 */
export default function CustomersPage() {
  return (
    <div>
      <h1 className="font-heading font-bold text-white" style={{ fontSize: '28px', marginBottom: '4px' }}>Customers</h1>
      <p className="text-[#888]" style={{ fontSize: '14px', marginBottom: '32px' }}>View and manage your restaurant customers.</p>
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] text-center" style={{ padding: '80px', borderRadius: '16px' }}>
        <svg className="mx-auto text-[#333]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
        <p className="text-[#888] font-medium" style={{ fontSize: '15px', marginTop: '16px' }}>Customer management coming soon</p>
        <p className="text-[#555]" style={{ fontSize: '13px', marginTop: '4px' }}>You&apos;ll be able to see order history, saved addresses, and more.</p>
      </div>
    </div>
  )
}
