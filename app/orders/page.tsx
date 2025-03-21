"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebase } from "@/components/firebase-provider";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function OrdersPage() {
  const { user, loading, db } = useFirebase();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!db || !user) return;

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const ordersQuery = query(ordersRef, where("userId", "==", user.uid));
        const ordersSnapshot = await getDocs(ordersQuery);
        
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [db, user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (orders.length === 0) {
    return <div>No orders found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold text-teal-800 mb-8">My Orders</h1>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="p-4 bg-white rounded-lg shadow-md">
            <Link href={`/orders/${order.id}`} className="text-teal-600 hover:underline">
              Order #{order.id}
            </Link>
            <p className="text-gray-600">Status: {order.status || "Pending"}</p>
            <p className="text-gray-600">Total: £{order.total || "0.00"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
