"use client"

import { useEffect, useState } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { useRouter } from "next/navigation"
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Mail, Ban, CheckCircle } from "lucide-react"

interface Customer {
  id: string
  email: string
  name: string
  createdAt: Date
  isBlocked?: boolean
  orderCount?: number
  totalSpent?: number
}

export default function CustomersPage() {
  const { user, isAdmin, db } = useFirebase()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }

    fetchCustomers()
  }, [isAdmin, db])

  const fetchCustomers = async () => {
    if (!db) return

    try {
      const customersRef = collection(db, "users")
      const q = query(customersRef)
      const querySnapshot = await getDocs(q)
      
      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Customer[]

      setCustomers(customersData)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setError("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  const toggleBlockStatus = async (customerId: string, currentStatus: boolean) => {
    if (!db) return

    try {
      await updateDoc(doc(db, "users", customerId), {
        isBlocked: !currentStatus
      })
      
      // Update local state
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, isBlocked: !currentStatus }
            : customer
        )
      )
    } catch (error) {
      console.error("Error updating customer status:", error)
      setError("Failed to update customer status")
    }
  }

  const handleEmailCustomer = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-teal-800 mb-8">Customer Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{customer.orderCount || 0}</TableCell>
                <TableCell>£{customer.totalSpent?.toFixed(2) || "0.00"}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.isBlocked
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {customer.isBlocked ? "Blocked" : "Active"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEmailCustomer(customer.email)}
                        className="cursor-pointer"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Email Customer</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleBlockStatus(customer.id, customer.isBlocked || false)}
                        className="cursor-pointer"
                      >
                        {customer.isBlocked ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Unblock Customer</span>
                          </>
                        ) : (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            <span>Block Customer</span>
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}