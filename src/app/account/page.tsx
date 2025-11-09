"use client";

import OrderManager from "@/components/admin/order-manage";
import { ProductManager } from "@/components/admin/product-manager";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Edit,
  Mail,
  Package,
  Phone,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: number;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    loadUserData();
  }, [session, status, router]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const profileResponse = await fetch("/api/user/profile");
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setUserProfile(profile);
        setProfileForm({
          name: profile.name || "",
          phone: profile.phone || "",
          email: profile.email || "",
        });
      }

      // Load user orders
      const ordersResponse = await fetch("/api/orders/user");
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setIsEditingProfile(false);
        // Show success message
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading account information...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your account.
            </p>
            <Button asChild>
              <a href="/login">Login to Your Account</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <p className="text-muted-foreground">
              Manage your profile, orders, and{" "}
              {isAdmin ? "products" : "preferences"}
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders-manage">Orders</TabsTrigger>
              {isAdmin && <TabsTrigger value="products">Products</TabsTrigger>}
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                      </CardTitle>
                      <CardDescription>
                        Manage your personal information and contact details
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditingProfile ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingProfile ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Full Name
                              </p>
                              <p className="font-medium">
                                {userProfile?.name || "Not set"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Email Address
                              </p>
                              <p className="font-medium">
                                {userProfile?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Phone Number
                              </p>
                              <p className="font-medium">
                                {userProfile?.phone || "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Account Type
                              </p>
                              <Badge
                                variant={isAdmin ? "default" : "secondary"}
                              >
                                {userProfile?.role || "CUSTOMER"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Member Since
                              </p>
                              <p className="font-medium">
                                {userProfile?.createdAt
                                  ? new Date(
                                      userProfile.createdAt
                                    ).toLocaleDateString()
                                  : "Unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Total Orders
                              </p>
                              <p className="font-medium">
                                {orders.length} orders
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            {isAdmin && (
              <TabsContent value="orders-manage" className="space-y-6">
                <OrderManager />
              </TabsContent>
            )}

            {/* Products Tab - Admin Only */}
            {isAdmin && (
              <TabsContent value="products" className="space-y-6">
                <ProductManager />
              </TabsContent>
            )}

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account preferences and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">
                            Email notifications for orders
                          </span>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Promotional emails</span>
                          <input type="checkbox" className="rounded" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">SMS notifications</span>
                          <input type="checkbox" className="rounded" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Privacy</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Profile visibility</span>
                          <select className="rounded border px-2 py-1">
                            <option>Public</option>
                            <option>Private</option>
                          </select>
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Show order history</span>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
