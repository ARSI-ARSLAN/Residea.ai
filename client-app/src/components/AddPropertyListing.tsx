import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  MapPin, 
  DollarSign, 
  Building2,
  CheckCircle,
  Wifi,
  Zap,
  Droplet,
  Bus,
  Hospital,
  GraduationCap,
  School,
  ShoppingCart,
  Trees,
  Sparkles,
  Camera,
  X,
  ImageIcon
} from 'lucide-react';
import { useRouter } from './Router';
import logo from 'figma:asset/910f50e5e12983226a795268217208588c7e2573.png';
import propertyService from '../services/propertyService';

export function AddPropertyListing() {
  const { navigate } = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [propertyData, setPropertyData] = useState({
    // Basic Info
    title: '',
    description: '',
    propertyType: '',
    listingType: 'sell',
    price: '',
    
    // Location
    city: '',
    sector: '',
    address: '',
    
    // Specifications
    bedrooms: '',
    bathrooms: '',
    area: '',
    floors: '',
    yearBuilt: '',
    
    // Amenities
    amenities: [] as string[],
    
    // Services
    services: {
      gas: false,
      electricity: false,
      water: false,
      internet: false,
      sewerage: false,
      maintenance: false
    },
    
    // Nearby Facilities
    nearbyFacilities: {
      publicTransport: '',
      hospital: '',
      university: '',
      school: '',
      shopping: '',
      park: ''
    },
    
    // Additional
    parkingSpaces: '',
    furnished: ''
  });

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const numericOrUndefined = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...selectedPhotos, ...files].slice(0, 10); // Max 10 photos
    setSelectedPhotos(newPhotos);
    // Generate previews
    const previews = newPhotos.map(f => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (index: number) => {
    const newPhotos = selectedPhotos.filter((_, i) => i !== index);
    setSelectedPhotos(newPhotos);
    // Revoke old URL and regenerate
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoPreviews(newPhotos.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);

      const payload = {
        title: propertyData.title,
        description: propertyData.description,
        property_type: propertyData.propertyType,
        price: numericOrUndefined(propertyData.price),
        location: propertyData.sector
          ? `${propertyData.sector}, ${propertyData.city}`
          : propertyData.city,
        bedrooms: numericOrUndefined(propertyData.bedrooms),
        bathrooms: numericOrUndefined(propertyData.bathrooms),
        area_sqft: numericOrUndefined(propertyData.area),
        dist_to_hospital: numericOrUndefined(propertyData.nearbyFacilities.hospital),
        dist_to_school: numericOrUndefined(propertyData.nearbyFacilities.school || propertyData.nearbyFacilities.university),
        dist_to_metro: numericOrUndefined(propertyData.nearbyFacilities.publicTransport),
        dist_to_park: numericOrUndefined(propertyData.nearbyFacilities.park),
        dist_to_shopping_mall: numericOrUndefined(propertyData.nearbyFacilities.shopping),
      };

      const created = await propertyService.createProperty(payload);
      console.log('Property created:', created);

      // Upload photos if any were selected
      if (selectedPhotos.length > 0 && created.id) {
        try {
          const uploadResult = await propertyService.uploadImages(created.id, selectedPhotos);
          console.log('Photos uploaded:', uploadResult);
        } catch (uploadErr) {
          console.warn('Photo upload failed (property was still created):', uploadErr);
        }
      }

      setSubmitSuccess(true);
      setTimeout(() => navigate('my-listings'), 1500);
    } catch (error: any) {
      console.error('Failed to submit listing:', error);
      const validationErrors = error?.validationErrors;
      if (validationErrors && typeof validationErrors === 'object') {
        const messages = Object.entries(validationErrors)
          .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
        setSubmitError(messages || 'Failed to submit listing. Please try again.');
      } else {
        setSubmitError(error?.message || 'Failed to submit listing. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('dashboard');
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setPropertyData({
        ...propertyData,
        amenities: [...propertyData.amenities, amenity]
      });
    } else {
      setPropertyData({
        ...propertyData,
        amenities: propertyData.amenities.filter(a => a !== amenity)
      });
    }
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setPropertyData({
      ...propertyData,
      services: {
        ...propertyData.services,
        [service]: checked
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <img src={logo} alt="Residea.ai" className="h-24" />
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl text-gray-900 mb-2">
              List Your Property
            </h1>
            <p className="text-gray-600">
              Provide details about your property to reach potential buyers/renters
            </p>
          </div>
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
              {currentStep === 1 && <><Home className="w-5 h-5 text-[#00B894]" /><span>Basic Information</span></>}
              {currentStep === 2 && <><MapPin className="w-5 h-5 text-[#0984E3]" /><span>Location Details</span></>}
              {currentStep === 3 && <><Building2 className="w-5 h-5 text-[#FF7675]" /><span>Property Specifications</span></>}
              {currentStep === 4 && <><Sparkles className="w-5 h-5 text-[#00B894]" /><span>Amenities & Features</span></>}
              {currentStep === 5 && <><Zap className="w-5 h-5 text-[#0984E3]" /><span>Services & Facilities</span></>}
              {currentStep === 6 && <><Camera className="w-5 h-5 text-[#FF7675]" /><span>Property Photos</span></>}
              {currentStep === 7 && <><CheckCircle className="w-5 h-5 text-[#00B894]" /><span>Review & Submit</span></>}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Property Title *</Label>
                  <Input
                    placeholder="e.g., Luxury 3-Bedroom Villa in F-7"
                    value={propertyData.title}
                    onChange={(e) => setPropertyData({ ...propertyData, title: e.target.value })}
                    className="bg-gray-50 border-0 h-12"
                  />
                </div>
                
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe your property in detail..."
                    value={propertyData.description}
                    onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
                    className="bg-gray-50 border-0 min-h-32"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Property Type *</Label>
                    <Select
                      value={propertyData.propertyType}
                      onValueChange={(value) => setPropertyData({ ...propertyData, propertyType: value })}
                    >
                      <SelectTrigger className="bg-gray-50 border-0 h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="plot">Plot/Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Listing Type *</Label>
                    <Select
                      value={propertyData.listingType}
                      onValueChange={(value) => setPropertyData({ ...propertyData, listingType: value })}
                    >
                      <SelectTrigger className="bg-gray-50 border-0 h-12">
                        <SelectValue placeholder="Select listing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sell">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Price (PKR) *</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 35000000"
                    value={propertyData.price}
                    onChange={(e) => setPropertyData({ ...propertyData, price: e.target.value })}
                    className="bg-gray-50 border-0 h-12"
                  />
                  {propertyData.price && (
                    <p className="text-sm text-gray-600 mt-1">
                      {parseInt(propertyData.price) >= 10000000 
                        ? `PKR ${(parseInt(propertyData.price) / 10000000).toFixed(2)}Cr`
                        : `PKR ${(parseInt(propertyData.price) / 100000).toFixed(2)}L`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Select
                      value={propertyData.city}
                      onValueChange={(value) => setPropertyData({ ...propertyData, city: value })}
                    >
                      <SelectTrigger className="bg-gray-50 border-0 h-12">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="islamabad">Islamabad</SelectItem>
                        <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                        <SelectItem value="karachi">Karachi</SelectItem>
                        <SelectItem value="lahore">Lahore</SelectItem>
                        <SelectItem value="faisalabad">Faisalabad</SelectItem>
                        <SelectItem value="multan">Multan</SelectItem>
                        <SelectItem value="peshawar">Peshawar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sector/Area *</Label>
                    <Input
                      placeholder="e.g., F-7, DHA Phase 2"
                      value={propertyData.sector}
                      onChange={(e) => setPropertyData({ ...propertyData, sector: e.target.value })}
                      className="bg-gray-50 border-0 h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label>Complete Address *</Label>
                  <Textarea
                    placeholder="Street number, house number, landmark..."
                    value={propertyData.address}
                    onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                    className="bg-gray-50 border-0"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 Tip: Providing accurate location details helps buyers find your property easily
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Specifications */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Bedrooms *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 3"
                      value={propertyData.bedrooms}
                      onChange={(e) => setPropertyData({ ...propertyData, bedrooms: e.target.value })}
                      className="bg-gray-50 border-0 h-12"
                    />
                  </div>

                  <div>
                    <Label>Bathrooms *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      value={propertyData.bathrooms}
                      onChange={(e) => setPropertyData({ ...propertyData, bathrooms: e.target.value })}
                      className="bg-gray-50 border-0 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Area (sq ft) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2500"
                      value={propertyData.area}
                      onChange={(e) => setPropertyData({ ...propertyData, area: e.target.value })}
                      className="bg-gray-50 border-0 h-12"
                    />
                  </div>

                  <div>
                    <Label>Number of Floors</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      value={propertyData.floors}
                      onChange={(e) => setPropertyData({ ...propertyData, floors: e.target.value })}
                      className="bg-gray-50 border-0 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Year Built</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2020"
                      value={propertyData.yearBuilt}
                      onChange={(e) => setPropertyData({ ...propertyData, yearBuilt: e.target.value })}
                      className="bg-gray-50 border-0 h-12"
                    />
                  </div>

                  <div>
                    <Label>Parking Spaces</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2"
                      value={propertyData.parkingSpaces}
                      onChange={(e) => setPropertyData({ ...propertyData, parkingSpaces: e.target.value })}
                      className="bg-gray-50 border-0 h-12"
                    />
                  </div>
                </div>

                <div>
                  <Label>Furnished Status</Label>
                  <Select
                    value={propertyData.furnished}
                    onValueChange={(value) => setPropertyData({ ...propertyData, furnished: value })}
                  >
                    <SelectTrigger className="bg-gray-50 border-0 h-12">
                      <SelectValue placeholder="Select furnishing status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Fully Furnished</SelectItem>
                      <SelectItem value="semi-furnished">Semi Furnished</SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Amenities */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <Label>Select Available Amenities</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'swimming-pool', label: 'Swimming Pool', icon: '🏊' },
                    { id: 'gym', label: 'Gym', icon: '💪' },
                    { id: 'garden', label: 'Garden', icon: '🌳' },
                    { id: 'security', label: '24/7 Security', icon: '🛡️' },
                    { id: 'elevator', label: 'Elevator', icon: '🛗' },
                    { id: 'cctv', label: 'CCTV Surveillance', icon: '📹' },
                    { id: 'playground', label: 'Playground', icon: '🎪' },
                    { id: 'community-center', label: 'Community Center', icon: '🏛️' },
                    { id: 'backup-generator', label: 'Backup Generator', icon: '⚡' },
                    { id: 'servant-quarter', label: 'Servant Quarter', icon: '🏠' },
                    { id: 'laundry', label: 'Laundry Room', icon: '🧺' },
                    { id: 'balcony', label: 'Balcony', icon: '🏗️' }
                  ].map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={amenity.id}
                        checked={propertyData.amenities.includes(amenity.id)}
                        onCheckedChange={(checked) => handleAmenityChange(amenity.id, !!checked)}
                      />
                      <label
                        htmlFor={amenity.id}
                        className="flex items-center space-x-2 cursor-pointer flex-1"
                      >
                        <span>{amenity.icon}</span>
                        <span className="text-sm">{amenity.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Services & Facilities */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-3">Available Utilities & Services</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'gas', label: 'Natural Gas', icon: <Droplet className="w-4 h-4" /> },
                      { id: 'electricity', label: 'Electricity', icon: <Zap className="w-4 h-4" /> },
                      { id: 'water', label: 'Water Supply', icon: <Droplet className="w-4 h-4" /> },
                      { id: 'internet', label: 'Internet/Broadband', icon: <Wifi className="w-4 h-4" /> },
                      { id: 'sewerage', label: 'Sewerage', icon: <Droplet className="w-4 h-4" /> },
                      { id: 'maintenance', label: 'Maintenance Staff', icon: <Building2 className="w-4 h-4" /> }
                    ].map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Checkbox
                          id={service.id}
                          checked={propertyData.services[service.id as keyof typeof propertyData.services]}
                          onCheckedChange={(checked) => handleServiceChange(service.id, !!checked)}
                        />
                        <label
                          htmlFor={service.id}
                          className="flex items-center space-x-2 cursor-pointer flex-1"
                        >
                          {service.icon}
                          <span className="text-sm">{service.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3">Nearby Facilities (Distance in km)</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Bus className="w-5 h-5 text-[#0984E3]" />
                      <div className="flex-1">
                        <Label className="text-sm">Public Transport</Label>
                        <Input
                          placeholder="e.g., 0.5"
                          value={propertyData.nearbyFacilities.publicTransport}
                          onChange={(e) => setPropertyData({
                            ...propertyData,
                            nearbyFacilities: { ...propertyData.nearbyFacilities, publicTransport: e.target.value }
                          })}
                          className="bg-gray-50 border-0 h-10 mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Hospital className="w-5 h-5 text-[#FF7675]" />
                      <div className="flex-1">
                        <Label className="text-sm">Hospital/Clinic</Label>
                        <Input
                          placeholder="e.g., 1.2"
                          value={propertyData.nearbyFacilities.hospital}
                          onChange={(e) => setPropertyData({
                            ...propertyData,
                            nearbyFacilities: { ...propertyData.nearbyFacilities, hospital: e.target.value }
                          })}
                          className="bg-gray-50 border-0 h-10 mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <School className="w-5 h-5 text-[#00B894]" />
                      <div className="flex-1">
                        <Label className="text-sm">School</Label>
                        <Input
                          placeholder="e.g., 0.8"
                          value={propertyData.nearbyFacilities.school}
                          onChange={(e) => setPropertyData({
                            ...propertyData,
                            nearbyFacilities: { ...propertyData.nearbyFacilities, school: e.target.value }
                          })}
                          className="bg-gray-50 border-0 h-10 mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-5 h-5 text-[#0984E3]" />
                      <div className="flex-1">
                        <Label className="text-sm">University/College</Label>
                        <Input
                          placeholder="e.g., 2.5"
                          value={propertyData.nearbyFacilities.university}
                          onChange={(e) => setPropertyData({
                            ...propertyData,
                            nearbyFacilities: { ...propertyData.nearbyFacilities, university: e.target.value }
                          })}
                          className="bg-gray-50 border-0 h-10 mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="w-5 h-5 text-[#FF7675]" />
                      <div className="flex-1">
                        <Label className="text-sm">Shopping Mall/Market</Label>
                        <Input
                          placeholder="e.g., 1.5"
                          value={propertyData.nearbyFacilities.shopping}
                          onChange={(e) => setPropertyData({
                            ...propertyData,
                            nearbyFacilities: { ...propertyData.nearbyFacilities, shopping: e.target.value }
                          })}
                          className="bg-gray-50 border-0 h-10 mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Trees className="w-5 h-5 text-[#00B894]" />
                      <div className="flex-1">
                        <Label className="text-sm">Park/Recreation</Label>
                        <Input
                          placeholder="e.g., 0.3"
                          value={propertyData.nearbyFacilities.park}
                          onChange={(e) => setPropertyData({
                            ...propertyData,
                            nearbyFacilities: { ...propertyData.nearbyFacilities, park: e.target.value }
                          })}
                          className="bg-gray-50 border-0 h-10 mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Photos */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <Label>Upload Property Photos (up to 10)</Label>
                <p className="text-sm text-gray-500">Add photos to make your listing stand out. The first photo will be the cover image.</p>
                
                {/* Upload Area */}
                <label
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#00B894] hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload photos</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG (max 10 photos)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>

                {/* Photo Previews */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-28 object-cover rounded-lg border"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-1 left-1 bg-[#00B894] text-white text-[10px] px-1.5 py-0.5">
                            Cover
                          </Badge>
                        )}
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  {selectedPhotos.length}/10 photos selected
                </p>
              </div>
            )}

            {/* Step 7: Review */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#00B894]/5 to-[#55E6C1]/5 p-6 rounded-lg text-center">
                  <CheckCircle className="w-12 h-12 text-[#00B894] mx-auto mb-4" />
                  <h3 className="text-gray-900 mb-2">Review Your Listing</h3>
                  <p className="text-sm text-gray-600">
                    Please review all the information before submitting
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-gray-600 mb-2">Basic Information</h4>
                    <p className="text-gray-900">{propertyData.title || 'Not provided'}</p>
                    <p className="text-sm text-gray-600">{propertyData.propertyType} • {propertyData.listingType === 'sell' ? 'For Sale' : 'For Rent'}</p>
                    <p className="text-[#00B894]">PKR {propertyData.price ? parseInt(propertyData.price).toLocaleString() : 'Not set'}</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-gray-600 mb-2">Location</h4>
                    <p className="text-gray-900">{propertyData.sector || 'Area not set'}, {propertyData.city || 'City not set'}</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-gray-600 mb-2">Specifications</h4>
                    <div className="flex gap-4 text-sm">
                      <span>{propertyData.bedrooms || '0'} Beds</span>
                      <span>{propertyData.bathrooms || '0'} Baths</span>
                      <span>{propertyData.area || '0'} sq ft</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-gray-600 mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {propertyData.amenities.length > 0 ? (
                        propertyData.amenities.map(amenity => (
                          <Badge key={amenity} variant="secondary">{amenity}</Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No amenities selected</span>
                      )}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-gray-600 mb-2">Available Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(propertyData.services)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <Badge key={key} variant="secondary">{key}</Badge>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  submitting ||
                  (currentStep === 1 && (!propertyData.title || !propertyData.propertyType || !propertyData.price)) ||
                  (currentStep === 2 && (!propertyData.city || !propertyData.sector)) ||
                  (currentStep === 3 && (!propertyData.bedrooms || !propertyData.bathrooms || !propertyData.area))
                }
                className="flex items-center space-x-2 bg-gradient-to-r from-[#00B894] to-[#55E6C1] hover:from-[#00A085] hover:to-[#4DD0B8] text-white border-0"
              >
                <span>{submitting ? 'Submitting...' : currentStep === totalSteps ? 'Submit Listing' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mt-4">
                <CheckCircle className="w-8 h-8 text-[#00B894] mx-auto mb-2" />
                <p className="text-green-800 font-medium">Listing created successfully!</p>
                <p className="text-green-600 text-sm">Redirecting to My Listings...</p>
              </div>
            )}

            {submitError && (
              <div className="text-sm text-red-600 pt-3 whitespace-pre-line">
                {submitError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
