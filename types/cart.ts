export type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export type CartState = {
  items: CartItem[]
  total: number
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }

