/**
 * Order types — placing and tracking orders
 */

export interface OrderItem {
  id: number
  menu_item_id: number
  item_name: string
  item_price: number
  quantity: number
  line_total: number
  notes: string | null
}

export interface Order {
  id: number
  uuid: string
  order_number: string
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  payment_method: 'online' | 'cod'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  delivery_address: DeliveryAddress
  estimated_delivery_time: number | null
  customer_notes: string | null
  restaurant_notes: string | null
  items: OrderItem[]
  created_at: string
  accepted_at: string | null
  delivered_at: string | null
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'
  | 'rejected'

export interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  latitude?: number
  longitude?: number
}

export interface CartItem {
  menuItem: {
    id: number
    name: string
    price: number
    discount_price: number | null
    image_url: string | null
    food_type: 'veg' | 'non_veg' | 'egg'
  }
  quantity: number
  notes?: string
}
