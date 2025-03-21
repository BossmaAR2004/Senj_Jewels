"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useReducer } from "react"
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCUbJMsEi-dXOlmFLQepCaiuwPAvvDqLJc",
  authDomain: "sen-jewels.firebaseapp.com",
  projectId: "sen-jewels",
  storageBucket: "sen-jewels.appspot.com",
  messagingSenderId: "1054156103077",
  appId: "1:1054156103077:web:8c9fabd6f89f2387799c4c",
  measurementId: "G-09E8RJY4BH",
}

// Cart logic
type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

type CartState = {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex((item) => item.id === action.payload.id)
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        }
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price * action.payload.quantity,
      }
    }
    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }
    case "UPDATE_QUANTITY": {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      )
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }
    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
      }
    default:
      return state
  }
}

// Context Types
type FirebaseContextType = {
  firebaseApp: any
  analytics: any
  auth: any
  db: any
  storage: any  // Add storage to the context type
  user: User | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  cart: CartState
  dispatch: React.Dispatch<CartAction>
}

// Create Context
const FirebaseContext = createContext<FirebaseContextType | null>(null)

// Firebase App Init (Client-side only)
let app: any = null
let auth: any = null
let db: any = null
let analytics: any = null
let storage: any = null

if (typeof window !== "undefined" && !app) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  analytics = getAnalytics(app)
  storage = getStorage(app, "gs://sen-jewels.firebasestorage.app")
}

// Provider
export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  useEffect(() => {
    if (!auth || !db) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          // First, check the specific admin
          const specificAdminRef = doc(db, "admins", "24Y0vMVIHAdDdAvRd3A2K9HvKHQ2")
          const specificAdminSnap = await getDoc(specificAdminRef)
          console.log("🔥 Specific Admin Document:", specificAdminSnap.exists(), specificAdminSnap.data())

          // Then check if current user is admin
          const adminRef = doc(db, "admins", user.uid)
          const adminSnap = await getDoc(adminRef)
          console.log("🔥 Current User Admin Status:", adminSnap.exists(), adminSnap.data())
          
          setIsAdmin(adminSnap.exists())
        } catch (err) {
          console.error("🚨 Firestore Read Error:", err)
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  return (
    <FirebaseContext.Provider
      value={{
        firebaseApp: app,
        analytics,
        auth,
        db,
        storage, // Add storage to the context value
        user,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        cart,
        dispatch,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

// Hook
export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}