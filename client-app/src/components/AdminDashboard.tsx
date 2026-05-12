import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { 
  ArrowLeft, 
  Home, 
  Users, 
  Database, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  Eye,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useRouter } from './Router';
import { ImageWithFallback } from './figma/ImageWithFallback';

const sampleProperties = [
  {
    id: 1,
    title: "Luxury Villa with Garden",
    location: "F-7, Islamabad",
    price: "PKR 3.2Cr",
    status: "active",
    verified: true,
    addedDate: "2024-01-15",
    views: 147,
    saves: 23
  },
  {
    id: 2,
    title: "Modern Apartment Complex",
    location: "DHA Phase 2, Islamabad",
    price: "PKR 1.8Cr",
    status: "pending",
    verified: false,
    addedDate: "2024-01-12",
    views: 89,
    saves: 12
  },
  {
    id: 3,
    title: "Premium Penthouse",
    location: "Bahria Town, Islamabad",
    price: "PKR 4.5Cr",
    status: "active",
    verified: true,
    addedDate: "2024-01-10",
    views: 203,
    saves: 45
  }
];

const sampleUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    role: "buyer",
    joinDate: "2024-01-01",
    status: "active",
    propertiesViewed: 47,
    propertiesSaved: 8
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    role: "agent",
    joinDate: "2023-12-15",
    status: "active",
    propertiesViewed: 156,
    propertiesSaved: 23
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike.w@email.com",
    role: "buyer",
    joinDate: "2024-01-05",
    status: "suspended",
    propertiesViewed: 12,
    propertiesSaved: 3
  }
];

export function AdminDashboard() {
  const { navigate } = useRouter();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: ''
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-[#00B894]/10 text-[#00B894] border-[#00B894]/20">Active</Badge>;
      case 'pending':
        return <Badge className="bg-[#FAB1A0]/10 text-[#FAB1A0] border-[#FAB1A0]/20">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-[#FF7675]/10 text-[#FF7675] border-[#FF7675]/20">Suspended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-[#FF7675]/10 text-[#FF7675] border-[#FF7675]/20">Admin</Badge>;
      case 'agent':
        return <Badge className="bg-[#0984E3]/10 text-[#0984E3] border-[#0984E3]/20">Agent</Badge>;
      case 'buyer':
        return <Badge className="bg-[#00B894]/10 text-[#00B894] border-[#00B894]/20">Buyer</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage properties, users, and system data</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] text-white border-0">
              Admin Access
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-xs text-[#00B894]">↑ 12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-[#00B894]/10 rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-[#00B894]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">8,934</p>
                  <p className="text-xs text-[#0984E3]">↑ 8% from last month</p>
                </div>
                <div className="w-12 h-12 bg-[#0984E3]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#0984E3]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">PKR 24.8L</p>
                  <p className="text-xs text-[#FF7675]">↑ 15% from last month</p>
                </div>
                <div className="w-12 h-12 bg-[#FF7675]/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#FF7675]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-gray-900">99.8%</p>
                  <p className="text-xs text-[#00B894]">All systems operational</p>
                </div>
                <div className="w-12 h-12 bg-[#FAB1A0]/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-[#FAB1A0]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Property Management</CardTitle>
                <Button 
                  onClick={() => setShowAddProperty(true)}
                  className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search properties..." className="pl-10" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>

                {/* Properties Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                            <div>
                              <p className="font-medium text-gray-900">{property.title}</p>
                              <p className="text-sm text-gray-600">ID: {property.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell className="font-semibold text-[#00B894]">{property.price}</TableCell>
                        <TableCell>{getStatusBadge(property.status)}</TableCell>
                        <TableCell>
                          {property.verified ? (
                            <CheckCircle className="w-4 h-4 text-[#00B894]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#FF7675]" />
                          )}
                        </TableCell>
                        <TableCell>{property.views}</TableCell>
                        <TableCell>{property.addedDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Add Property Modal Placeholder */}
            {showAddProperty && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Add New Property</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddProperty(false)}>
                    ×
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Property Title</Label>
                      <Input 
                        value={newProperty.title}
                        onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                        placeholder="Enter property title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input 
                        value={newProperty.location}
                        onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                        placeholder="Enter location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input 
                        value={newProperty.price}
                        onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                        placeholder="Enter price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Area (sq ft)</Label>
                      <Input 
                        value={newProperty.area}
                        onChange={(e) => setNewProperty({...newProperty, area: e.target.value})}
                        placeholder="Enter area"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={newProperty.description}
                      onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                      placeholder="Enter property description"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white"
                      onClick={() => setShowAddProperty(false)}
                    >
                      Add Property
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddProperty(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search users..." className="pl-10" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Viewed: {user.propertiesViewed}</div>
                            <div>Saved: {user.propertiesSaved}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Shield className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-[#00B894]" />
                    <span>Crime Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Last updated: 2024-01-15</p>
                    <p>Records: 45,678</p>
                    <p>Coverage: Mumbai, Delhi, Bangalore</p>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-[#0984E3]" />
                    <span>Weather Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Last updated: 2024-01-14</p>
                    <p>Records: 23,456</p>
                    <p>Coverage: All major cities</p>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-[#FF7675]" />
                    <span>Society Approvals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Last updated: 2024-01-16</p>
                    <p>Records: 12,890</p>
                    <p>Verified properties: 89%</p>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Upload Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Bulk Data Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dataset Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dataset type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crime">Crime Data</SelectItem>
                        <SelectItem value="weather">Weather Data</SelectItem>
                        <SelectItem value="approvals">Society Approvals</SelectItem>
                        <SelectItem value="properties">Property Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>File Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop your file here, or click to browse</p>
                  <Button variant="outline">Choose File</Button>
                </div>
                <Button className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white">
                  Upload Dataset
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Platform Analytics */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Active Users</span>
                      <span className="font-semibold text-[#00B894]">2,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Property Views</span>
                      <span className="font-semibold text-[#0984E3]">15,678</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">AI Recommendations</span>
                      <span className="font-semibold text-[#FF7675]">8,934</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Successful Matches</span>
                      <span className="font-semibold text-[#FAB1A0]">456</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Model Performance */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>AI Model Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recommendation Accuracy</span>
                      <span className="font-semibold text-[#00B894]">94.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Model Confidence</span>
                      <span className="font-semibold text-[#0984E3]">89.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Processing Speed</span>
                      <span className="font-semibold text-[#FF7675]">1.2s avg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Quality Score</span>
                      <span className="font-semibold text-[#FAB1A0]">96.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Placeholder */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Analytics charts and graphs would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}