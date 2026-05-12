import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import logo from 'figma:asset/910f50e5e12983226a795268217208588c7e2573.png';
import {
  Home,
  Heart,
  Wrench,
  BarChart3,
  User,
  MapPin,
  Bed,
  Bath,
  Square,
  Shield,
  Sparkles,
  ArrowUpRight,
  Clock,
  Plus,
  List,
  Loader2,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { useRouter } from './Router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import propertyService, { type Property } from '../services/propertyService';
import authService from '../services/authService';

export function Dashboard() {
  const { navigate } = useRouter();
  const [savedProperties, setSavedProperties] = useState<number[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
  const [otherProperties, setOtherProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [compareList, setCompareList] = useState<Property[]>([]);

  const toggleCompare = (property: Property) => {
    if (compareList.find(p => p.id === property.id)) {
      setCompareList(compareList.filter(p => p.id !== property.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, property]);
    }
  };

  useEffect(() => {
    loadPropertiesData();
  }, []);

  const loadPropertiesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authService.getCurrentUser();
      setCurrentUser(user);

      // Get properties from backend
      const { results } = await propertyService.getProperties({ page: 1 });

      // Load saved/favorited property IDs
      if (user) {
        try {
          const savedData = await authService.getSavedProperties();
          // savedData might be paginated { results: [...] } or a flat array
          const savedList = Array.isArray(savedData) ? savedData : (savedData?.results || []);
          const savedIds = savedList.map((s: any) => s.property || s.property_id);
          setSavedProperties(savedIds);
        } catch (e) {
          console.warn('Failed to load saved properties:', e);
        }
      }

      // Try to get personalized ML recommendations if logged in
      if (user) {
        try {
          const recommendations = await propertyService.getRecommendations(5);
          console.log('ML Recommendations:', recommendations);

          if (recommendations && recommendations.length > 0) {
            // Store recommendations with ML scores
            const recsWithScores = recommendations.map((rec: any) => ({
              ...rec.property,
              ml_score: rec.score,
              match_percentage: rec.match_percentage,
              roi_1yr: rec.roi_1yr,
              roi_5yr: rec.roi_5yr
            }));
            setRecommendedProperties(recsWithScores);
          } else {
            setRecommendedProperties(results.slice(0, 3));
          }
        } catch (e) {
          console.warn('Failed to fetch ML recommendations:', e);
          setRecommendedProperties(results.slice(0, 3));
        }
      } else {
        setRecommendedProperties(results.slice(0, 3));
      }

      setOtherProperties(results);

    } catch (err: any) {
      console.error('Error loading properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveProperty = async (propertyId: number) => {
    // Optimistic UI update
    const wasSaved = savedProperties.includes(propertyId);
    if (wasSaved) {
      setSavedProperties(savedProperties.filter(id => id !== propertyId));
    } else {
      setSavedProperties([...savedProperties, propertyId]);
    }

    // Call API
    try {
      await authService.toggleSaveProperty(propertyId);
    } catch (err) {
      console.error('Failed to toggle save:', err);
      // Revert on failure
      if (wasSaved) {
        setSavedProperties(prev => [...prev, propertyId]);
      } else {
        setSavedProperties(prev => prev.filter(id => id !== propertyId));
      }
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-[#00B894] to-[#55E6C1]';
    if (score >= 80) return 'from-[#0984E3] to-[#74B9FF]';
    return 'from-[#FF7675] to-[#FAB1A0]';
  };

  const calculateAIScore = (property: any) => {
    // Use ML model match_percentage if available
    if (property.match_percentage !== undefined && property.match_percentage !== null && property.match_percentage > 0) {
      return property.match_percentage;
    }

    // Calculate from average amenity score (0-1 range, convert to percentage)
    const amenityScore = (property.average_amenity_score || 0) * 100;
    const verifiedBonus = property.verified ? 10 : 0;
    const score = Math.min(Math.round(amenityScore + verifiedBonus), 99);

    // Return at least 1 to avoid showing 0%
    return score > 0 ? score : 1;
  };

  const renderPropertyCard = (property: Property) => (
    <Card key={property.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <ImageWithFallback
          src={property.main_image || ''}
          alt={property.title}
          className="w-full h-48 object-cover"
        />

        <div className="absolute top-3 left-3">
          <div className={`bg-gradient-to-r ${getScoreColor(calculateAIScore(property))} px-2 py-1 rounded-full flex items-center space-x-1`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-white">
              AI {calculateAIScore(property)}%
            </span>
          </div>
        </div>

        {property.verified && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-gray-800 border-0">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}

        {/* Society Approval Badges */}
        {property.approval_status && property.approval_status.length > 0 && (
          <div className="absolute top-10 left-3 flex flex-wrap gap-1 mt-1">
            {property.approval_status.map((status) => (
              <span
                key={status}
                style={{
                  backgroundColor: status === 'CDA' ? '#10B981' : status === 'RDA' ? '#3B82F6' : status === 'PHATA' ? '#F97316' : '#6B7280',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                {status} Approved
              </span>
            ))}
          </div>
        )}

        <Button
          size="sm"
          variant={savedProperties.includes(property.id) ? "destructive" : "secondary"}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full p-0"
          onClick={() => toggleSaveProperty(property.id)}
        >
          <Heart className={`w-4 h-4 ${savedProperties.includes(property.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 leading-tight">
            {property.title}
          </h3>
          <span className="text-lg font-bold text-[#00B894]">
            {formatCurrency(property.price)}
          </span>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="w-3 h-3 mr-1" />
          {property.location}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <Bed className="w-3 h-3" />
            <span>{property.bedrooms} BHK</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-3 h-3" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center space-x-1">
            <Square className="w-3 h-3" />
            <span>{property.area_sqft} sqft</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-600">
              Hospital: <span className="font-medium">{Math.round((property.hospital_score || 0) * 100)}%</span>
              {property.dist_to_hospital && property.dist_to_hospital > 0 && (
                <div className="text-[10px] text-gray-500">{property.dist_to_hospital.toFixed(1)} km</div>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">
              School: <span className="font-medium">{Math.round((property.school_score || 0) * 100)}%</span>
              {property.dist_to_school && property.dist_to_school > 0 && (
                <div className="text-[10px] text-gray-500">{property.dist_to_school.toFixed(1)} km</div>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">
              Security: <span className="font-medium">{Math.round((property.security_score || 0) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            className="flex-1 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white border-0"
            onClick={() => navigate('property-details', { property })}
          >
            View Details
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Button>
          <Button
            variant={compareList.find(p => p.id === property.id) ? 'default' : 'outline'}
            size="sm"
            className={`px-3 ${compareList.find(p => p.id === property.id) ? 'bg-[#0984E3] text-white border-0' : ''}`}
            onClick={() => toggleCompare(property)}
          >
            {compareList.find(p => p.id === property.id) ? '✓ Added' : 'Compare'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex-shrink-0">
        <div className="p-6 border-b">
          <img src={logo} alt="Residea.ai" className="h-32" />
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center space-x-3 w-full text-left p-3 rounded-lg bg-[#00B894]/10 text-[#00B894]"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => navigate('profile', { tab: 'saved' })}
            className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
          >
            <Heart className="w-4 h-4" />
            <span>Shortlist</span>
            {savedProperties.length > 0 && (
              <Badge className="ml-auto bg-[#FF7675] text-white">
                {savedProperties.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => navigate('property-comparison')}
            className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Compare</span>
          </button>
          <button
            onClick={() => navigate('mortgage-calculator')}
            className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Calculator</span>
          </button>
          <button
            onClick={() => navigate('renovation')}
            className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
          >
            <Wrench className="w-4 h-4" />
            <span>Renovation</span>
          </button>
          <button
            onClick={() => navigate('my-listings')}
            className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
          >
            <List className="w-4 h-4" />
            <span>My Listings</span>
          </button>
          <button
            onClick={() => navigate('add-listing')}
            className="flex items-center space-x-3 w-full text-left p-3 rounded-lg bg-gradient-to-r from-[#00B894]/10 to-[#55E6C1]/10 text-[#00B894]"
          >
            <Plus className="w-4 h-4" />
            <span>List Property</span>
          </button>
          <button
            onClick={() => navigate('profile')}
            className="flex items-center space-x-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{currentUser?.first_name || 'User'}</p>
              <p className="text-xs text-gray-500">Premium Member</p>
            </div>
          </div>
          <button
            onClick={() => {
              authService.logout();
              navigate('home');
            }}
            className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Property Recommendations</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-[#00B894]/10 to-[#55E6C1]/10 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4 text-[#00B894]" />
                <span className="text-sm font-medium">AI Powered</span>
              </div>
              <Button
                onClick={() => navigate('mortgage-calculator')}
                variant="outline"
                size="sm"
              >
                Calculator
              </Button>
              <Button
                onClick={() => navigate('admin')}
                variant="outline"
                size="sm"
              >
                Admin
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B894] mx-auto mb-4" />
                <p className="text-gray-600">Loading properties from database...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadPropertiesData}>Try Again</Button>
              </div>
            </div>
          ) : (
            <>
              {/* Recommended Section */}
              {recommendedProperties.length > 0 && (
                <div className="mb-8">
                  <div className="mb-4 p-4 bg-gradient-to-r from-[#00B894]/10 to-[#55E6C1]/10 rounded-lg flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-[#00B894]" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">AI Recommended For You</h2>
                      <p className="text-sm text-gray-600">Top {recommendedProperties.length} properties from our database</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recommendedProperties.map(renderPropertyCard)}
                  </div>
                </div>
              )}

              {/* Other Properties */}
              {otherProperties.length > 0 && (
                <div>
                  <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-lg font-bold text-gray-900">Other Available Properties</h2>
                    <p className="text-sm text-gray-600">Explore more options</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {otherProperties.map(renderPropertyCard)}
                  </div>
                </div>
              )}

              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  className="bg-white"
                  onClick={loadPropertiesData}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Refresh Properties
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Floating Compare Bar */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border px-6 py-4 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {compareList.length} of 3 selected
            </span>
            <div className="flex -space-x-2">
              {compareList.map(p => (
                <div key={p.id} className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0984E3] to-[#74B9FF] flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                  {(p.title || 'P').charAt(0)}
                </div>
              ))}
            </div>
            <Button
              disabled={compareList.length < 2}
              className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0"
              onClick={() => navigate('property-comparison', { properties: compareList })}
            >
              Compare Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCompareList([])}
              className="text-gray-500"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}