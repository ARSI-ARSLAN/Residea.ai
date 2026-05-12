import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  ArrowLeft, 
  Heart, 
  Share, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Wifi, 
  Dumbbell,
  Shield,
  TrendingUp,
  Clock,
  Phone,
  Mail,
  Camera,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  Users,
  Building,
  TreePine,
  Hospital,
  GraduationCap,
  ShoppingCart,
  Train,
  CheckCircle,
  AlertTriangle,
  Zap,
  Calendar,
  X,
  Copy,
  PhoneCall,
  Send
} from 'lucide-react';
import { useRouter } from './Router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import authService from '../services/authService';

export function PropertyDetails() {
  const { navigate, screenData } = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const currentUser = authService.getCurrentUser();

  const rawProperty = screenData?.property || {};

  const [inquiryForm, setInquiryForm] = useState({
    name: currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : '',
    email: currentUser?.email || '',
    phone: '',
    message: `Hi, I am interested in this property: ${rawProperty?.title || 'property'}. Please share more details.`
  });
  
  // Log for debugging
  console.log('PropertyDetails screenData:', screenData);
  console.log('PropertyDetails property:', rawProperty);

  // Create safe property with guaranteed defaults — spread raw first, then override with safe values
  // Normalize features — API returns [{id, name}] objects, we need strings
  const normalizeFeatures = (features: any): string[] => {
    if (!features || !Array.isArray(features)) return ['Parking', 'Security', 'Garden'];
    return features.map((f: any) => {
      if (typeof f === 'string') return f;
      if (f && typeof f === 'object' && f.name) return f.name;
      return String(f);
    });
  };

  const property: any = {
    ...rawProperty,  // spread raw first to preserve extra fields
    id: rawProperty.id || 1,
    title: rawProperty.title || 'Property Details',
    location: rawProperty.location || 'Location not specified',
    price: rawProperty.price ?? 0,
    bedrooms: rawProperty.bedrooms ?? 0,
    bathrooms: rawProperty.bathrooms ?? 0,
    area: rawProperty.area_sqft || rawProperty.area || 0,
    area_sqft: rawProperty.area_sqft || rawProperty.area || 0,
    aiScore: rawProperty.aiScore || rawProperty.match_percentage || Math.round((rawProperty.average_amenity_score || 0) * 100) || 0,
    verified: rawProperty.verified || false,
    roi: rawProperty.roi || rawProperty.roi_1yr || 0,
    accessibility: rawProperty.accessibility || 0,
    safety: rawProperty.safety || 0,
    features: normalizeFeatures(rawProperty.features),
    main_image: rawProperty.main_image || '',
    images: rawProperty.images || [],
  };

  // Build image gallery from property data (gallery images from CSV import)
  const propertyImages: string[] = (() => {
    const imgs: string[] = [];
    // Add main_image first
    if (property.main_image) imgs.push(property.main_image);
    // Add gallery images from the images array
    if (property.images && Array.isArray(property.images)) {
      property.images.forEach((img: any) => {
        const url = typeof img === 'string' ? img : img.image_url;
        if (url && !imgs.includes(url)) imgs.push(url);
      });
    }
    return imgs.length > 0 ? imgs : [property.main_image || ''];
  })();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  // Safe price formatting — handles both string ("PKR 3.2Cr") and number (32000000) from API
  const getNumericPrice = (): number => {
    const p = property.price;
    if (typeof p === 'number') return p;
    if (typeof p === 'string') {
      const cleaned = p.replace(/[^\d.]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const formatPrice = (): string => {
    const num = getNumericPrice();
    if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `PKR ${(num / 100000).toFixed(0)}L`;
    return `PKR ${num.toLocaleString()}`;
  };

  const pricePerSqFt = (): string => {
    const num = getNumericPrice();
    const area = property.area_sqft || property.area || 1;
    return Math.round(num / area).toLocaleString();
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
              <h1 className="text-xl font-semibold text-gray-900">{property.title}</h1>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {property.location || 'Location not specified'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              variant={isSaved ? "destructive" : "outline"} 
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative">
                <ImageWithFallback
                  src={propertyImages[currentImageIndex]}
                  alt={`Property image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover"
                />
                
                {/* Navigation Buttons */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full w-10 h-10 p-0"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {propertyImages.length}
                </div>

                {/* AI Score */}
                <div className="absolute top-4 left-4">
                  <div className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] px-3 py-1 rounded-full flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white">
                      AI Score: {property.aiScore || property.match_percentage || Math.round((property.average_amenity_score || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Verification */}
                {property.verified && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-gray-800 border-0">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                      Verified Property
                    </Badge>
                  </div>
                )}

                {/* Society Approval Badges */}
                {property.approval_status && property.approval_status.length > 0 && (
                  <div className="absolute top-14 left-4 flex flex-wrap gap-1">
                    {property.approval_status.map((status: string) => (
                      <span
                        key={status}
                        style={{
                          backgroundColor: status === 'CDA' ? '#10B981' : status === 'RDA' ? '#3B82F6' : status === 'PHATA' ? '#F97316' : '#6B7280',
                          color: '#fff',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        }}
                      >
                        {status} Approved
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Navigation */}
              <div className="p-4 bg-gray-50">
                <div className="flex space-x-2 overflow-x-auto">
                  {propertyImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-[#00B894]' : 'border-gray-200'
                      }`}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Property Information Tabs */}
            <Card className="border-0 shadow-lg">
              <Tabs defaultValue="overview" className="w-full">
                <div className="border-b">
                  <TabsList className="h-auto p-0 bg-transparent">
                    <TabsTrigger 
                      value="overview" 
                      className="px-6 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#00B894] data-[state=active]:text-[#00B894]"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="amenities"
                      className="px-6 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#00B894] data-[state=active]:text-[#00B894]"
                    >
                      Amenities
                    </TabsTrigger>
                    <TabsTrigger 
                      value="location"
                      className="px-6 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#00B894] data-[state=active]:text-[#00B894]"
                    >
                      Location
                    </TabsTrigger>
                    <TabsTrigger 
                      value="insights"
                      className="px-6 py-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#00B894] data-[state=active]:text-[#00B894]"
                    >
                      AI Insights
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="p-6">
                  <div className="space-y-6">
                    {/* Basic Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#0984E3]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Bed className="w-6 h-6 text-[#0984E3]" />
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{property.bedrooms}</p>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#FF7675]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Bath className="w-6 h-6 text-[#FF7675]" />
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{property.bathrooms}</p>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#00B894]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Square className="w-6 h-6 text-[#00B894]" />
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{property.area_sqft || property.area || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Sq Ft</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#FAB1A0]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="w-6 h-6 text-[#FAB1A0]" />
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">{property.roi || property.roi_1yr || 'N/A'}%</p>
                        <p className="text-sm text-gray-600">ROI</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">
                        This stunning {property.bedrooms || ''} BHK luxury villa offers the perfect blend of modern comfort and elegant design. 
                        Located in the prestigious {(property.location || '').split(',')[0] || 'prime'} area, this property features spacious rooms, 
                        premium finishes, and world-class amenities. The villa comes with a private garden, swimming pool, 
                        and dedicated parking spaces, making it ideal for families seeking luxury living.
                      </p>
                    </div>

                    {/* Key Features */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {property.features?.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-[#00B894]" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Building Amenities</h3>
                      <div className="space-y-3">
                        {[
                          { icon: Dumbbell, name: "Fitness Center", available: true },
                          { icon: Car, name: "Covered Parking", available: true },
                          { icon: Shield, name: "24/7 Security", available: true },
                          { icon: Wifi, name: "High-Speed Internet", available: true },
                          { icon: Users, name: "Community Hall", available: true },
                          { icon: TreePine, name: "Landscaped Gardens", available: true }
                        ].map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              amenity.available ? 'bg-[#00B894]/10' : 'bg-gray-100'
                            }`}>
                              <amenity.icon className={`w-4 h-4 ${
                                amenity.available ? 'text-[#00B894]' : 'text-gray-400'
                              }`} />
                            </div>
                            <span className={amenity.available ? 'text-gray-900' : 'text-gray-500'}>
                              {amenity.name}
                            </span>
                            {amenity.available && <CheckCircle className="w-4 h-4 text-[#00B894] ml-auto" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Property Features</h3>
                      <div className="space-y-3">
                        {[
                          { name: "Modular Kitchen", available: true },
                          { name: "Master Bedroom Suite", available: true },
                          { name: "Private Balcony", available: true },
                          { name: "Walk-in Closet", available: true },
                          { name: "Study Room", available: false },
                          { name: "Servant Quarter", available: true }
                        ].map((feature, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className={feature.available ? 'text-gray-900' : 'text-gray-500'}>
                              {feature.name}
                            </span>
                            {feature.available ? (
                              <CheckCircle className="w-4 h-4 text-[#00B894]" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-gray-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="location" className="p-6">
                  <div className="space-y-6">
                    {/* Accessibility Scores */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Accessibility Scores</h3>
                      <div className="space-y-4">
                        {[
                          { name: "Schools", distance: "0.5 km", score: 95, icon: GraduationCap, color: "[#00B894]" },
                          { name: "Hospitals", distance: "1.2 km", score: 88, icon: Hospital, color: "[#FF7675]" },
                          { name: "Shopping", distance: "0.8 km", score: 92, icon: ShoppingCart, color: "[#0984E3]" },
                          { name: "Transport", distance: "0.3 km", score: 90, icon: Train, color: "[#FAB1A0]" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <div className={`w-10 h-10 bg-${item.color}/10 rounded-lg flex items-center justify-center`}>
                              <item.icon className={`w-5 h-5 text-${item.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-gray-900">{item.name}</span>
                                <span className="text-sm text-gray-600">{item.distance}</span>
                              </div>
                              <Progress value={item.score} className="h-2" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{item.score}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Stats */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Safety & Security</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#00B894]/10 rounded-lg flex items-center justify-center">
                              <Shield className="w-4 h-4 text-[#00B894]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Crime Index</p>
                              <p className="text-sm text-[#00B894]">Low (15/100)</p>
                            </div>
                          </div>
                        </Card>
                        <Card className="p-4 border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#0984E3]/10 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-[#0984E3]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Weather Risk</p>
                              <p className="text-sm text-[#0984E3]">Moderate</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="p-6">
                  <div className="space-y-6">
                    {/* AI Analysis */}
                    <div className="bg-gradient-to-r from-[#00B894]/5 to-[#55E6C1]/5 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#00B894] to-[#55E6C1] rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">AI Recommendation</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Based on your preferences and market analysis, this property scores <strong>{property.aiScore}%</strong> on our AI 
                        compatibility index. The location offers excellent connectivity, the property is verified for legal compliance, 
                        and shows strong potential for appreciation.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#00B894]">{property.roi}%</div>
                          <div className="text-sm text-gray-600">Projected ROI</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#0984E3]">2-3 years</div>
                          <div className="text-sm text-gray-600">Break-even</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#FF7675]">High</div>
                          <div className="text-sm text-gray-600">Demand</div>
                        </div>
                      </div>
                    </div>

                    {/* Investment Analysis */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Investment Analysis</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-[#00B894] mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">Legal Compliance</p>
                            <p className="text-sm text-gray-600">All approvals verified and documented</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-[#00B894] mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">Market Trends</p>
                            <p className="text-sm text-gray-600">Area shows 8-12% annual appreciation</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-[#FF7675] mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">Considerations</p>
                            <p className="text-sm text-gray-600">Monsoon flooding risk - ensure adequate insurance</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Pricing and Contact */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900">{formatPrice()}</CardTitle>
                    <p className="text-gray-600">PKR {pricePerSqFt()} per sq ft</p>
                  </div>
                  <Badge className="bg-[#00B894]/10 text-[#00B894] border-[#00B894]/20">
                    Ready to Move
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* EMI Calculator */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">EMI Calculator</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Loan Amount (80%):</span>
                      <span>PKR {((getNumericPrice() * 0.8) / 10000000).toFixed(1)}Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EMI (20 years @ 8.5%):</span>
                      <span className="font-semibold text-[#0984E3]">PKR {((getNumericPrice() * 0.8 * 0.085 / 12) / 100000).toFixed(1)}L/month</span>
                    </div>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0 hover:from-[#00A085] hover:to-[#4DD0B8]"
                    onClick={() => navigate('schedule-visit', { property })}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Visit
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white border-0"
                    onClick={() => setShowCallModal(true)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => { setInquirySubmitted(false); setShowInquiryModal(true); }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('renovation', { property })}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Renovation ROI
                  </Button>
                </div>

                {/* Agent Info */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sarah Johnson</p>
                      <p className="text-sm text-gray-600">Senior Property Consultant</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">4.9 (156 reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Properties */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Similar Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Modern Apartment", price: "PKR 2.8Cr", location: "F-10, Islamabad" },
                  { title: "Luxury Penthouse", price: "PKR 4.1Cr", location: "DHA Phase 1, Islamabad" },
                  { title: "Garden Villa", price: "PKR 3.5Cr", location: "E-11, Islamabad" }
                ].map((similar, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{similar.title}</p>
                      <p className="text-xs text-gray-600">{similar.location}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#00B894]">{similar.price}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  View All Similar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ========== CALL NOW MODAL ========== */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCallModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-0 overflow-hidden animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0984E3] to-[#74B9FF] p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <PhoneCall className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Call Property Agent</h3>
              <p className="text-white/80 text-sm mt-1">Available Mon-Sat, 9 AM - 6 PM</p>
            </div>
            
            {/* Agent Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">Senior Property Consultant</p>
                </div>
              </div>

              {/* Phone Number */}
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 tracking-wide">+92 300 1234567</p>
                <p className="text-sm text-gray-500 mt-1">Property ID: #{property.id}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <a href="tel:+923001234567" className="block">
                  <Button className="w-full bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0 py-3">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText('+923001234567');
                    setPhoneCopied(true);
                    setTimeout(() => setPhoneCopied(false), 2000);
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {phoneCopied ? 'Copied!' : 'Copy Number'}
                </Button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setShowCallModal(false)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ========== SEND INQUIRY MODAL ========== */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowInquiryModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>

            {inquirySubmitted ? (
              /* Success State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#00B894] to-[#55E6C1] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Sent!</h3>
                <p className="text-gray-600 mb-6">Your inquiry about this property has been sent to the agent. They will get back to you within 24 hours.</p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left text-sm">
                  <p className="text-gray-600"><strong>Property:</strong> {property.title}</p>
                  <p className="text-gray-600"><strong>Agent:</strong> Sarah Johnson</p>
                  <p className="text-gray-600"><strong>Your Email:</strong> {inquiryForm.email}</p>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0"
                  onClick={() => setShowInquiryModal(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              /* Form State */
              <>
                <div className="bg-gradient-to-r from-[#0984E3] to-[#74B9FF] p-5 text-white">
                  <h3 className="text-lg font-bold flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Send Inquiry
                  </h3>
                  <p className="text-white/80 text-sm mt-1">Ask about: {(property.title || '').substring(0, 50)}...</p>
                </div>

                <form
                  className="p-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setInquirySubmitted(true);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-name">Full Name *</Label>
                    <Input
                      id="inquiry-name"
                      required
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="inquiry-email">Email *</Label>
                      <Input
                        id="inquiry-email"
                        type="email"
                        required
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inquiry-phone">Phone</Label>
                      <Input
                        id="inquiry-phone"
                        type="tel"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        placeholder="+92 3XX XXXXXXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiry-message">Message *</Label>
                    <Textarea
                      id="inquiry-message"
                      required
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0 py-3"
                    disabled={!inquiryForm.name || !inquiryForm.email || !inquiryForm.message}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </Button>
                </form>
              </>
            )}

            {/* Close */}
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}