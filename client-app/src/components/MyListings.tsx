import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Building2,
  CheckCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Users,
  Phone,
  Mail,
  Calendar,
  Loader2
} from 'lucide-react';
import { useRouter } from './Router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import logo from 'figma:asset/910f50e5e12983226a795268217208588c7e2573.png';
import { ImageWithFallback } from './figma/ImageWithFallback';
import propertyService, { type Property } from '../services/propertyService';

const mockInquiries = [
  {
    id: 1,
    propertyId: 1,
    propertyTitle: 'Luxury Villa with Garden',
    buyerName: 'Ahmed Khan',
    buyerEmail: 'ahmed.khan@email.com',
    buyerPhone: '+92 300 1234567',
    message: 'I am interested in viewing this property. Is it available this weekend?',
    date: '2024-12-02',
    status: 'new'
  },
  {
    id: 2,
    propertyId: 1,
    propertyTitle: 'Luxury Villa with Garden',
    buyerName: 'Sarah Ali',
    buyerEmail: 'sarah.ali@email.com',
    buyerPhone: '+92 321 9876543',
    message: 'Can you share more details about the amenities and maintenance costs?',
    date: '2024-12-01',
    status: 'replied'
  },
];

export function MyListings() {
  const { navigate } = useRouter();
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiries] = useState(mockInquiries);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyService.getMyListings();
      setListings(data);
    } catch (err: any) {
      console.error('Failed to load listings:', err);
      setError(err?.message || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!selectedListing) return;
    try {
      setDeleting(true);
      await propertyService.deleteProperty(selectedListing);
      setListings(listings.filter(l => l.id !== selectedListing));
      setDeleteDialogOpen(false);
      setSelectedListing(null);
    } catch (err: any) {
      console.error('Failed to delete listing:', err);
      alert(err?.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (numValue >= 10000000) {
      return `PKR ${(numValue / 10000000).toFixed(1)}Cr`;
    } else if (numValue >= 100000) {
      return `PKR ${(numValue / 100000).toFixed(0)}L`;
    }
    return `PKR ${numValue.toLocaleString()}`;
  };

  const newInquiries = inquiries.filter(i => i.status === 'new');

  const filteredListings = searchTerm
    ? listings.filter(l =>
        (l.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : listings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              <img src={logo} alt="Residea.ai" className="h-24" />
            </div>
            <Button
              onClick={() => navigate('add-listing')}
              className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] hover:from-[#00A085] hover:to-[#4DD0B8] text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </Button>
          </div>

          <div>
            <h1 className="text-3xl text-gray-900 mb-2">My Listings</h1>
            <p className="text-gray-600">Manage your property listings and inquiries</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Listings</p>
                  <p className="text-2xl text-gray-900 mt-1">{listings.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl text-gray-900 mt-1">
                    {listings.reduce((sum, l) => sum + (l.views_count || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Inquiries</p>
                  <p className="text-2xl text-gray-900 mt-1">{newInquiries.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl text-gray-900 mt-1">
                    {listings.filter(l => l.verified).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="listings">
              <Building2 className="w-4 h-4 mr-2" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="inquiries">
              <Users className="w-4 h-4 mr-2" />
              Inquiries ({newInquiries.length})
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="mt-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search your listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
              <Button variant="outline" className="border-gray-200" onClick={loadMyListings}>
                <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B894] mr-3" />
                <span className="text-gray-600">Loading your listings...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadMyListings}>Try Again</Button>
              </div>
            )}

            {/* Listings Grid */}
            {!loading && !error && (
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-64 h-48 md:h-auto relative">
                        <ImageWithFallback
                          src={listing.main_image || ''}
                          alt={listing.title || 'Property'}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-3 left-3 bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-gray-900 mb-2 font-semibold">{listing.title || 'Untitled Property'}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="text-sm">{listing.location}</span>
                            </div>
                            <p className="text-[#00B894] font-bold">{formatCurrency(listing.price)}</p>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate('property-details', { property: listing })}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedListing(listing.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Property Details */}
                        <div className="flex flex-wrap gap-4 mb-4">
                          {listing.bedrooms > 0 && (
                            <div className="flex items-center text-gray-600">
                              <Bed className="w-4 h-4 mr-1" />
                              <span className="text-sm">{listing.bedrooms} Beds</span>
                            </div>
                          )}
                          {listing.bathrooms > 0 && (
                            <div className="flex items-center text-gray-600">
                              <Bath className="w-4 h-4 mr-1" />
                              <span className="text-sm">{listing.bathrooms} Baths</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Square className="w-4 h-4 mr-1" />
                            <span className="text-sm">{listing.area_sqft} sq ft</span>
                          </div>
                          {listing.property_type && (
                            <Badge variant="secondary" className="text-xs">
                              {listing.property_type}
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 pt-4 border-t">
                          <div className="flex items-center text-sm">
                            <Eye className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-600">{listing.views_count || 0} views</span>
                          </div>
                          <div className="flex items-center text-sm ml-auto">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-gray-600">Listed {new Date(listing.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {!loading && !error && filteredListings.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">
                  {searchTerm ? 'No listings match your search' : 'No listings yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try a different search term' : 'Start by creating your first property listing'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => navigate('add-listing')}
                    className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] hover:from-[#00A085] hover:to-[#4DD0B8] text-white border-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="mt-6">
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{inquiry.buyerName}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Interested in: {inquiry.propertyTitle}
                        </p>
                      </div>
                      <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>
                        {inquiry.status === 'new' ? 'New' : 'Replied'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">{inquiry.message}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {inquiry.buyerPhone}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {inquiry.buyerEmail}
                        </div>
                        <div className="flex items-center text-gray-600 ml-auto">
                          <Calendar className="w-4 h-4 mr-2" />
                          {inquiry.date}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] hover:from-[#00A085] hover:to-[#4DD0B8] text-white border-0">
                          Reply
                        </Button>
                        <Button size="sm" variant="outline">
                          View Property
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {inquiries.length === 0 && (
                <div className="text-center py-12">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">No inquiries yet</h3>
                  <p className="text-gray-600">When buyers show interest, their inquiries will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteListing}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
