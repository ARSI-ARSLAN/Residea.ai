import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  X, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  XCircle,
  Plus,
  Home,
  Car,
  Wifi,
  Dumbbell,
  Users,
  Search,
  Loader2
} from 'lucide-react';
import { useRouter } from './Router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import propertyService, { type Property } from '../services/propertyService';
import { Input } from './ui/input';

export function PropertyComparison() {
  const { navigate, screenData } = useRouter();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { results } = await propertyService.getProperties({ page: 1 });
        setAllProperties(results);

        // Use properties passed from Dashboard compare flow
        if (screenData?.properties?.length) {
          setSelectedProperties(screenData.properties);
        } else {
          // Default: pick first 2 if no specific selection
          setSelectedProperties(results.slice(0, 2));
        }
      } catch (err: any) {
        console.error('Failed to load properties for comparison', err);
        setError(err?.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [screenData]);

  const removeProperty = (id: number) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== id));
  };

  const addProperty = (property: Property) => {
    if (selectedProperties.length >= 3) return;
    if (selectedProperties.find(p => p.id === property.id)) return;
    setSelectedProperties([...selectedProperties, property]);
    setShowPicker(false);
    setSearchTerm('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#00B894]';
    if (score >= 80) return 'text-[#0984E3]';
    return 'text-[#FF7675]';
  };

  const getAIScore = (property: Property) => {
    const amenityScore = (property.average_amenity_score || 0) * 100;
    const verifiedBonus = property.verified ? 10 : 0;
    const score = Math.min(Math.round(amenityScore + verifiedBonus), 99);
    return score > 0 ? score : 1;
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

  // Available properties not already selected
  const availableProperties = allProperties.filter(
    p => !selectedProperties.find(sp => sp.id === p.id)
  );

  const filteredAvailable = searchTerm
    ? availableProperties.filter(p =>
        (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableProperties;

  // Fixed-width comparison row that doesn't rely on dynamic Tailwind classes
  const ComparisonRow = ({ label, values, icon: Icon, highlight = false }: any) => (
    <div className={`flex items-stretch py-3 border-b ${highlight ? 'bg-gray-50' : ''}`}>
      <div className="w-48 flex-shrink-0 flex items-center space-x-2 font-medium text-gray-700 px-4">
        {Icon && <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${values.length}, 1fr)` }}>
        {values.map((value: any, index: number) => (
          <div key={index} className="text-center font-medium text-gray-900 flex items-center justify-center px-2">
            {value}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B894] mx-auto mb-4" />
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Property Comparison</h1>
              <p className="text-sm text-gray-600">Compare up to 3 properties side-by-side</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0">
              {selectedProperties.length} Properties Selected
            </Badge>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto p-6 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Property Cards */}
        <div className="flex gap-6 mb-8 overflow-x-auto pb-2">
          {selectedProperties.map((property) => (
            <Card key={property.id} className="border-0 shadow-lg relative flex-1 min-w-[280px] max-w-[400px]">
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full p-0"
                onClick={() => removeProperty(property.id)}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="relative">
                <ImageWithFallback
                  src={property.main_image || ''}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                
                <div className="absolute top-3 left-3">
                  <Badge className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0">
                    AI {getAIScore(property)}%
                  </Badge>
                </div>

                {property.verified && (
                  <div className="absolute top-3 right-12">
                    <Badge className="bg-white/90 text-gray-800 border-0">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{property.title || 'Untitled Property'}</h3>
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="w-3 h-3 mr-1" />
                  {property.location}
                </div>
                <div className="text-2xl font-bold text-[#00B894] mb-3">
                  {formatCurrency(property.price)}
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white border-0"
                  onClick={() => navigate('property-details', { property })}
                >
                  View Full Details
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Add Property Card */}
          {selectedProperties.length < 3 && (
            <Card
              className="border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#00B894] transition-colors min-w-[280px] max-w-[400px] flex-1"
              onClick={() => setShowPicker(true)}
            >
              <CardContent className="p-6 text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Add Property to Compare</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Property Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg max-h-[70vh] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Select a Property</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setShowPicker(false); setSearchTerm(''); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-2">
                {filteredAvailable.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No properties available</p>
                ) : (
                  filteredAvailable.slice(0, 20).map(property => (
                    <div
                      key={property.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border transition-colors"
                      onClick={() => addProperty(property)}
                    >
                      <ImageWithFallback
                        src={property.main_image || ''}
                        alt={property.title}
                        className="w-16 h-12 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{property.title || 'Untitled'}</p>
                        <p className="text-xs text-gray-600 truncate">{property.location}</p>
                      </div>
                      <span className="text-sm font-bold text-[#00B894] flex-shrink-0">{formatCurrency(property.price)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comparison Table */}
        {selectedProperties.length >= 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {/* Basic Info */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Home className="w-5 h-5 mr-2 text-[#00B894]" />
                    Basic Information
                  </h3>
                  
                  <ComparisonRow 
                    label="Price" 
                    values={selectedProperties.map(p => formatCurrency(p.price))}
                    highlight
                  />
                  <ComparisonRow 
                    label="Price/sqft" 
                    values={selectedProperties.map(p => `PKR ${Math.round(p.price_per_sqft || 0)}`)}
                  />
                  <ComparisonRow 
                    label="Area" 
                    icon={Square}
                    values={selectedProperties.map(p => `${p.area_sqft} sqft`)}
                    highlight
                  />
                  <ComparisonRow 
                    label="Bedrooms" 
                    icon={Bed}
                    values={selectedProperties.map(p => `${p.bedrooms} BHK`)}
                  />
                  <ComparisonRow 
                    label="Bathrooms" 
                    icon={Bath}
                    values={selectedProperties.map(p => p.bathrooms)}
                    highlight
                  />
                  <ComparisonRow 
                    label="Type" 
                    icon={Home}
                    values={selectedProperties.map(p => p.property_type || '—')}
                  />
                </div>

                {/* AI Scores */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-[#0984E3]" />
                    AI Analysis & Scores
                  </h3>
                  
                  <ComparisonRow 
                    label="AI Match Score" 
                    values={selectedProperties.map(p => (
                      <span className={getScoreColor(getAIScore(p))}>{getAIScore(p)}%</span>
                    ))}
                    highlight
                  />
                  <ComparisonRow 
                    label="Accessibility" 
                    values={selectedProperties.map(p => `${Math.round((p.metro_score || 0) * 100)}%`)}
                  />
                  <ComparisonRow 
                    label="Safety Score" 
                    icon={Shield}
                    values={selectedProperties.map(p => `${Math.round((p.security_score || 0) * 100)}%`)}
                    highlight
                  />
                  <ComparisonRow 
                    label="Verified" 
                    values={selectedProperties.map(p => p.verified ? (
                      <CheckCircle className="w-5 h-5 text-[#00B894] mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#FF7675] mx-auto" />
                    ))}
                  />
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Dumbbell className="w-5 h-5 mr-2 text-[#FF7675]" />
                    Amenities & Features
                  </h3>
                  
                  {/* Get all unique amenities */}
                  {(() => {
                    const allFeatures = Array.from(new Set(selectedProperties.flatMap(p => (p.features || []).map(f => f.name))));
                    if (allFeatures.length === 0) {
                      return <p className="text-gray-500 text-sm px-4 py-2">No feature data available</p>;
                    }
                    return allFeatures.map((amenity, idx) => (
                      <ComparisonRow 
                        key={amenity}
                        label={amenity}
                        values={selectedProperties.map(p => 
                          (p.features || []).some(f => f.name === amenity) ? (
                            <CheckCircle className="w-5 h-5 text-[#00B894] mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        )}
                        highlight={idx % 2 === 0}
                      />
                    ));
                  })()}
                </div>

                {/* Location & Accessibility */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#FAB1A0]" />
                    Location & Accessibility
                  </h3>
                  
                  <ComparisonRow 
                    label="Nearby Schools" 
                    values={selectedProperties.map(p => `${Math.round((p.school_score || 0) * 100)}% match`)}
                    highlight
                  />
                  <ComparisonRow 
                    label="Nearby Hospitals" 
                    values={selectedProperties.map(p => `${Math.round((p.hospital_score || 0) * 100)}% match`)}
                  />
                  <ComparisonRow 
                    label="Public Transport" 
                    values={selectedProperties.map(p => `${Math.round((p.metro_score || 0) * 100)}% match`)}
                    highlight
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedProperties.length < 2 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Select at least 2 properties to see the comparison table</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => navigate('dashboard')}
          >
            Browse More Properties
          </Button>
        </div>
      </div>
    </div>
  );
}
