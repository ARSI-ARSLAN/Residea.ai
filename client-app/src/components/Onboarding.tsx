import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, MapPin, Users, DollarSign, Home, CheckCircle, Briefcase, Wifi, Bus, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from './Router';
import logo from 'figma:asset/910f50e5e12983226a795268217208588c7e2573.png';
import propertyService from '../services/propertyService';
import { saveUserPreferences } from '../services/userPreferencesService';
import authService from '../services/authService';

export function Onboarding() {
  const { navigate } = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    location: 'islamabad', // Locked to Islamabad
    bedrooms: [3],
    bathrooms: [2],
    minBudget: [10000000], // 1 Crore PKR
    maxBudget: [100000000], // 10 Crore PKR
    propertyTypes: [] as string[],
    profession: '',
    preferredAreas: '',
    timeline: ''
  });

  // Fetch location suggestions when user types
  useEffect(() => {
    const fetchLocations = async () => {
      if (formData.preferredAreas.length >= 2) {
        try {
          const { locations } = await propertyService.getLocations(formData.preferredAreas);
          setLocationSuggestions(locations);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching locations:', error);
        }
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [formData.preferredAreas]);

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setError(null);
    } else {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        setError('You must be logged in to save preferences. Please sign up or login first.');
        setTimeout(() => navigate('signup'), 2000);
        return;
      }

      setSaving(true);
      setError(null);

      // Create preferences object
      const prefs: any = {
        city: formData.location || 'islamabad',
        min_budget: formData.minBudget[0],
        max_budget: formData.maxBudget[0],
        preferred_locations: formData.preferredAreas ? formData.preferredAreas.split(',').map(s => s.trim()) : [],
        property_types: formData.propertyTypes,
        profession: formData.profession,
        timeline: formData.timeline,
        bedrooms: formData.bedrooms[0],
        bathrooms: formData.bathrooms[0],
        min_bedrooms: Math.max(1, formData.bedrooms[0] - 1),
        max_bedrooms: formData.bedrooms[0] + 1,
        min_bathrooms: Math.max(1, formData.bathrooms[0] - 1),
        min_area_sqft: 1000
      };

      try {
        await saveUserPreferences(prefs);
        console.log('Preferences saved successfully:', prefs);
        navigate('dashboard');
      } catch (error: any) {
        console.error("Failed to save preferences", error);
        setError(error.response?.data?.detail || 'Failed to save preferences. Please try again.');
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        propertyTypes: [...formData.propertyTypes, type]
      });
    } else {
      setFormData({
        ...formData,
        propertyTypes: formData.propertyTypes.filter(t => t !== type)
      });
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        requiredAmenities: [...formData.requiredAmenities, amenity]
      });
    } else {
      setFormData({
        ...formData,
        requiredAmenities: formData.requiredAmenities.filter(a => a !== amenity)
      });
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData({
      ...formData,
      requiredServices: {
        ...formData.requiredServices,
        [service]: checked
      }
    });
  };

  const handleFacilityChange = (facility: string, checked: boolean) => {
    setFormData({
      ...formData,
      nearbyFacilities: {
        ...formData.nearbyFacilities,
        [facility]: checked
      }
    });
  };

  const handleLocationSelect = (location: string) => {
    setFormData({ ...formData, preferredAreas: location });
    setShowSuggestions(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `PKR ${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `PKR ${(value / 100000).toFixed(0)}L`;
    } else {
      return `PKR ${value.toLocaleString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Residea.ai" className="h-48" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Let's find your perfect home
          </h1>
          <p className="text-gray-600">
            Help us understand your preferences to provide personalized recommendations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Steps */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              {currentStep === 1 && <><MapPin className="w-5 h-5 text-[#00B894]" /><span>Location Preference</span></>}
              {currentStep === 2 && <><Home className="w-5 h-5 text-[#0984E3]" /><span>Property Requirements</span></>}
              {currentStep === 3 && <><DollarSign className="w-5 h-5 text-[#FF7675]" /><span>Budget Range</span></>}
              {currentStep === 4 && <><Home className="w-5 h-5 text-[#00B894]" /><span>Property Type</span></>}
              {currentStep === 5 && <><Briefcase className="w-5 h-5 text-[#0984E3]" /><span>Profession</span></>}
              {currentStep === 6 && <><CheckCircle className="w-5 h-5 text-[#00B894]" /><span>Purchase Timeline</span></>}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Location */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Preferred City *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                    disabled
                  >
                    <SelectTrigger className="bg-gray-50 border-0 h-12">
                      <SelectValue placeholder="Islamabad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="islamabad">Islamabad</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Currently only available in Islamabad</p>
                </div>
                <div className="relative">
                  <Label>Preferred Areas (Optional)</Label>
                  <Input
                    placeholder="e.g., DHA, Gulberg, Model Town"
                    value={formData.preferredAreas}
                    onChange={(e) => setFormData({ ...formData, preferredAreas: e.target.value })}
                    onFocus={() => formData.preferredAreas.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="bg-gray-50 border-0 h-12"
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {locationSuggestions.map((location, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <MapPin className="w-3 h-3 inline mr-2 text-gray-400" />
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Start typing to see location suggestions from our database</p>
                </div>
              </div>
            )}

            {/* Step 2: Property Requirements */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Number of Bedrooms</Label>
                    <span className="text-lg font-semibold text-[#0984E3]">
                      {formData.bedrooms[0]} {formData.bedrooms[0] === 1 ? 'Bedroom' : 'Bedrooms'}
                    </span>
                  </div>
                  <Slider
                    value={formData.bedrooms}
                    onValueChange={(value) => setFormData({ ...formData, bedrooms: value })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Number of Bathrooms</Label>
                    <span className="text-lg font-semibold text-[#0984E3]">
                      {formData.bathrooms[0]} {formData.bathrooms[0] === 1 ? 'Bathroom' : 'Bathrooms'}
                    </span>
                  </div>
                  <Slider
                    value={formData.bathrooms}
                    onValueChange={(value) => setFormData({ ...formData, bathrooms: value })}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#0984E3]/5 to-[#74B9FF]/5 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    🏠 These specifications help us find properties that match your exact needs.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Budget */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Minimum Budget</Label>
                    <span className="text-lg font-semibold text-[#FF7675]">
                      {formatCurrency(formData.minBudget[0])}
                    </span>
                  </div>
                  <Slider
                    value={formData.minBudget}
                    onValueChange={(value) => {
                      // Ensure min doesn't exceed max
                      if (value[0] <= formData.maxBudget[0]) {
                        setFormData({ ...formData, minBudget: value });
                      }
                    }}
                    max={1500000000}
                    min={10000000}
                    step={5000000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>PKR 1Cr</span>
                    <span>PKR 150Cr</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Maximum Budget</Label>
                    <span className="text-lg font-semibold text-[#FF7675]">
                      {formatCurrency(formData.maxBudget[0])}
                    </span>
                  </div>
                  <Slider
                    value={formData.maxBudget}
                    onValueChange={(value) => {
                      // Ensure max doesn't go below min
                      if (value[0] >= formData.minBudget[0]) {
                        setFormData({ ...formData, maxBudget: value });
                      }
                    }}
                    max={1500000000}
                    min={10000000}
                    step={5000000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>PKR 1Cr</span>
                    <span>PKR 150Cr</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#FF7675]/5 to-[#FAB1A0]/5 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    💡 Our AI will show properties within 20% of your budget to give you flexibility.
                  </p>
                </div>
              </div>
            )}

            {/* Steps 4-8 remain the same as original */}
            {/* Step 4: Property Type */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Label>Property Types (Select all that interest you)</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'house', label: 'House', icon: '🏠' },
                    { id: 'flat', label: 'Flat/Apartment', icon: '🏢' },
                    { id: 'pent House', label: 'Pent House', icon: '🏙️' },
                    { id: 'farm House', label: 'Farm House', icon: '🌾' }
                  ].map((type) => (
                    <div key={type.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={type.id}
                        checked={formData.propertyTypes.includes(type.id)}
                        onCheckedChange={(checked) => handlePropertyTypeChange(type.id, !!checked)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={type.id}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <span className="text-lg">{type.icon}</span>
                          <span>{type.label}</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Profession */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <Label>What is your profession?</Label>
                  <Select
                    value={formData.profession}
                    onValueChange={(value) => setFormData({ ...formData, profession: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-0 h-12">
                      <SelectValue placeholder="Select your profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business Owner</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="engineer">Engineer</SelectItem>
                      <SelectItem value="lawyer">Lawyer</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="banker">Banker</SelectItem>
                      <SelectItem value="govt">Government Employee</SelectItem>
                      <SelectItem value="military">Military/Defense</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-gradient-to-r from-[#0984E3]/5 to-[#74B9FF]/5 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    💼 This helps us recommend properties in areas suitable for your profession and lifestyle.
                  </p>
                </div>
              </div>
            )}

            {/* Step 6: Timeline */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <Label>When are you planning to buy?</Label>
                  <Select
                    value={formData.timeline}
                    onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-0 h-12">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately (Within 1 month)</SelectItem>
                      <SelectItem value="3months">Within 3 months</SelectItem>
                      <SelectItem value="6months">Within 6 months</SelectItem>
                      <SelectItem value="1year">Within 1 year</SelectItem>
                      <SelectItem value="exploring">Just exploring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-gradient-to-r from-[#00B894]/5 to-[#55E6C1]/5 p-6 rounded-lg text-center">
                  <CheckCircle className="w-12 h-12 text-[#00B894] mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Almost Done!</h3>
                  <p className="text-sm text-gray-600">
                    We'll use this information to create your personalized property recommendations.
                  </p>
                </div>
              </div>
            )}



            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || saving}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  saving ||
                  (currentStep === 1 && !formData.location) ||
                  (currentStep === 4 && formData.propertyTypes.length === 0) ||
                  (currentStep === 5 && !formData.profession) ||
                  (currentStep === 6 && !formData.timeline)
                }
                className="flex items-center space-x-2 bg-gradient-to-r from-[#00B894] to-[#55E6C1] hover:from-[#00A085] hover:to-[#4DD0B8] text-white border-0 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>{currentStep === totalSteps ? 'Complete Setup' : 'Next'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}