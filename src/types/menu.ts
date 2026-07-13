/**
 * Menu types — categories and items
 */

export interface MenuCategory {
  id: number
  uuid: string
  name: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export interface MenuItem {
  id: number
  uuid: string
  category_id: number
  name: string
  description: string | null
  image_url: string | null
  price: number
  discount_price: number | null
  food_type: 'veg' | 'non_veg' | 'egg'
  is_bestseller: boolean
  is_recommended: boolean
  is_spicy: boolean
  is_available: boolean
  sort_order: number
  calories: number | null
  allergens: string | null
  tags: string | null
}

export interface CategoryWithItems extends MenuCategory {
  items: MenuItem[]
}

export interface FullMenu {
  restaurant_name: string
  categories: CategoryWithItems[]
  total_items: number
}
