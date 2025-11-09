"use client";

import { ImageUpload } from "@/components/admin/image-upload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Package, Plus, Search, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  quantity: number;
  weight?: number;
  description?: string;
  shortDesc?: string;
  images: string[];
  tags: string[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  isActive: boolean;
  categoryId: string;
  category?: {
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  price: string;
  comparePrice: string;
  cost: string;
  quantity: string;
  weight: string;
  description: string;
  shortDesc: string;
  images: string[];
  tags: string[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  isActive: boolean;
  categoryId: string;
}

// 🎯 Static Categories (until you implement category API)
const STATIC_CATEGORIES: Category[] = [
  { id: "1", name: "Electronics", slug: "electronics", isActive: true },
  { id: "2", name: "Clothing", slug: "clothing", isActive: true },
  { id: "3", name: "Home & Garden", slug: "home-garden", isActive: true },
  {
    id: "4",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    isActive: true,
  },
  { id: "5", name: "Books", slug: "books", isActive: true },
  { id: "6", name: "Toys & Games", slug: "toys-games", isActive: true },
  { id: "7", name: "Health & Beauty", slug: "health-beauty", isActive: true },
  { id: "8", name: "Automotive", slug: "automotive", isActive: true },
];

export function ProductManager() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories] = useState<Category[]>(STATIC_CATEGORIES); // ✅ Using static categories
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    sku: "",
    price: "",
    comparePrice: "",
    cost: "",
    quantity: "0",
    weight: "",
    description: "",
    shortDesc: "",
    images: [],
    tags: [],
    status: "DRAFT",
    featured: false,
    isActive: true,
    categoryId: "",
  });

  // ✅ Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // 获取产品列表
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        includeInactive: "true",
        limit: "100",
      });

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤产品
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      sku: "",
      price: "",
      comparePrice: "",
      cost: "",
      quantity: "0",
      weight: "",
      description: "",
      shortDesc: "",
      images: [],
      tags: [],
      status: "DRAFT",
      featured: false,
      isActive: true,
      categoryId: "",
    });
    setEditingProduct(null);
  };

  // 生成 slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      const isEditing = !!editingProduct;
      const url = isEditing
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save product");
      }

      const savedProduct = await response.json();

      if (isEditing) {
        setProducts((prev) =>
          prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
        );
        toast.success("Product updated successfully");
      } else {
        setProducts((prev) => [savedProduct, ...prev]);
        toast.success("Product created successfully");
      }

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save product"
      );
      console.error("Save product error:", error);
    }
  };

  // 删除产品
  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product"
      );
      console.error("Delete product error:", error);
    }
  };

  // 编辑产品
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || "",
      cost: product.cost?.toString() || "",
      quantity: product.quantity.toString(),
      weight: product.weight?.toString() || "",
      description: product.description || "",
      shortDesc: product.shortDesc || "",
      images: product.images || [],
      tags: product.tags || [],
      status: product.status,
      featured: product.featured,
      isActive: product.isActive,
      categoryId: product.categoryId,
    });
    setIsCreateDialogOpen(true);
  };

  // 处理名称变化，自动生成 slug
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Only auto-generate slug if it's empty or hasn't been manually edited
      slug: !editingProduct && !prev.slug ? generateSlug(name) : prev.slug,
    }));
  };

  // ✅ Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Unknown";
  };

  // 检查权限
  if (!session || session.user.role !== "ADMIN") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You need admin privileges to manage products.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Create New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update product information"
                  : "Add a new product to your catalog"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sku: e.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="Enter SKU"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      placeholder="product-slug"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, categoryId: value }))
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c.isActive)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comparePrice">Compare Price</Label>
                      <Input
                        id="comparePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.comparePrice}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            comparePrice: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cost}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            cost: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Short Description</Label>
                    <Input
                      id="shortDesc"
                      value={formData.shortDesc}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          shortDesc: e.target.value,
                        }))
                      }
                      placeholder="Brief product description"
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.shortDesc.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Detailed product description"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Product Images</Label>
                    <ImageUpload
                      value={formData.images}
                      onChange={(urls) =>
                        setFormData((prev) => ({ ...prev, images: urls }))
                      }
                      maxFiles={5}
                      maxSize={10 * 1024 * 1024}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload up to 5 images (max 10MB each)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            quantity: e.target.value,
                          }))
                        }
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            weight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="featured">Featured Product</Label>
                      <p className="text-xs text-muted-foreground">
                        Display this product in featured sections
                      </p>
                    </div>
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, featured: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive">Active</Label>
                      <p className="text-xs text-muted-foreground">
                        Make this product visible to customers
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索和过滤器 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, SKU, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 产品列表 */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>
            {filteredProducts.length === products.length
              ? "All products in your inventory"
              : `Showing ${filteredProducts.length} of ${products.length} products`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex gap-4 flex-1 min-w-0">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold truncate">
                          {product.name}
                        </h3>
                        <Badge
                          variant={
                            product.status === "ACTIVE"
                              ? "default"
                              : product.status === "DRAFT"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {product.status}
                        </Badge>
                        {product.featured && (
                          <Badge variant="outline" className="bg-yellow-50">
                            ⭐ Featured
                          </Badge>
                        )}
                        {!product.isActive && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="font-mono">SKU: {product.sku}</span>
                        <span>
                          Category:{" "}
                          {product.category?.name ||
                            getCategoryName(product.categoryId)}
                        </span>
                        <span
                          className={
                            product.quantity === 0
                              ? "text-destructive font-medium"
                              : product.quantity < 10
                              ? "text-orange-600 font-medium"
                              : ""
                          }
                        >
                          Stock: {product.quantity}
                          {product.quantity === 0 && " (Out of stock)"}
                          {product.quantity > 0 &&
                            product.quantity < 10 &&
                            " (Low)"}
                        </span>
                        <span className="font-semibold text-foreground">
                          ${product.price.toFixed(2)}
                          {product.comparePrice && (
                            <span className="ml-1 line-through text-muted-foreground font-normal">
                              ${product.comparePrice.toFixed(2)}
                            </span>
                          )}
                        </span>
                      </div>
                      {product.shortDesc && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {product.shortDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"?
                            This action cannot be undone and will remove all
                            product data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Product
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Get started by adding your first product"}
                  </p>
                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
