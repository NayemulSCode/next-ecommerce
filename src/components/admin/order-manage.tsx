"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Order = {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
};

const statusOptions = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Order deleted");
      fetchOrders();
    } else {
      toast.error("Failed to delete order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border p-4 rounded-lg shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">Order ID: {order.id}</div>
              <div className="text-sm text-gray-500">Total: ${order.total}</div>
              <div className="text-sm text-gray-500">User: {order.userId}</div>
              <div className="text-sm text-gray-500">
                Created: {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Select
                onValueChange={(val) => handleStatusChange(order.id, val)}
                defaultValue={order.status}
                disabled={updatingStatus === order.id}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <p>
                    This action cannot be undone. This will permanently delete
                    the order.
                  </p>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(order.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
