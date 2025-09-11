import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Search, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Clinic Stock Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive pharmacy inventory management system for efficient medicine tracking and stock control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Package className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Medicine Management</CardTitle>
              <CardDescription>
                Manage your medicine catalog with detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/medicines">
                <Button className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  View Medicines
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Plus className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Add Medicine</CardTitle>
              <CardDescription>
                Add new medicines to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/medicines">
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medicine
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Inventory Tracking</CardTitle>
              <CardDescription>
                Monitor stock levels and expiry dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                <BarChart3 className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Search className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>
                Find medicines quickly with filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/medicines">
                <Button className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search Medicines
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Complete CRUD Operations</h3>
              <p className="text-gray-600">
                Create, read, update, and delete medicines with a user-friendly interface.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Advanced Filtering</h3>
              <p className="text-gray-600">
                Filter medicines by form, category, manufacturer, and more.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant feedback and updates when managing your inventory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}