import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  Wrench, 
  Bell, 
  Shield, 
  Settings,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  Home,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useRouter } from './Router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import authService from '../services/authService';

const renovationHistory = [
  {
    id: 1,
    property: "Garden Villa, G-11 Islamabad",
    type: "Kitchen Renovation",
    cost: "PKR 4.5L",
    roi: "+15%",
    status: "Completed",
    date: "2023-12-01"
  },
  {
    id: 2,
    property: "City Apartment, E-11 Islamabad",
    type: "Solar Installation",
    cost: "PKR 2.8L",
    roi: "+22%",
    status: "In Progress",
    date: "2024-01-01"
  }
];

export function UserProfile() {
  const { navigate, screenData } = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    city: "",
    address: "",
    familySize: [4],
    budget: [25000000],
    propertyTypes: ["apartment", "villa"],
    timeline: "6months"
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    priceAlerts: true
  });

  // Load profile from API on mount
  useEffect(() => {
    loadProfile();
    loadSavedProperties();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setProfileData(prev => ({
        ...prev,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone_number: (profile as any).phone_number || '',
        city: (profile as any).city || '',
        address: (profile as any).address || '',
      }));
    } catch (err) {
      // Fallback to cached user
      const user = authService.getCurrentUser();
      if (user) {
        setProfileData(prev => ({
          ...prev,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
        }));
      }
    }
  };

  const loadSavedProperties = async () => {
    try {
      setLoadingSaved(true);
      const savedData = await authService.getSavedProperties();
      const savedList = Array.isArray(savedData) ? savedData : (savedData?.results || []);
      setSavedProperties(savedList);
    } catch (err) {
      console.warn('Failed to load saved properties:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleUnsaveProperty = async (propertyId: number) => {
    try {
      await authService.toggleSaveProperty(propertyId);
      setSavedProperties(prev => prev.filter(s => (s.property || s.property_id) !== propertyId));
    } catch (err) {
      console.error('Failed to unsave:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      await authService.patchProfile({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone_number: profileData.phone_number,
        city: profileData.city,
        address: profileData.address,
      });
      setIsEditing(false);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = `${profileData.first_name} ${profileData.last_name}`.trim() || 'User';

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `PKR ${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `PKR ${(value / 100000).toFixed(0)}L`;
    }
    return `PKR ${value.toLocaleString()}`;
  };

  const formatPropertyPrice = (price: any) => {
    const num = typeof price === 'number' ? price : parseFloat(price) || 0;
    if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `PKR ${(num / 100000).toFixed(0)}L`;
    return `PKR ${num.toLocaleString()}`;
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
              <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Success/Error message */}
        {saveMessage && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            saveMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{displayName}</h3>
                <p className="text-sm text-gray-600 mb-2">{profileData.email}</p>
                <Badge className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0">
                  Premium Member
                </Badge>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{savedProperties.length}</p>
                    <p className="text-xs text-gray-600">Saved Properties</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{renovationHistory.length}</p>
                    <p className="text-xs text-gray-600">Renovations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Activity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-[#0984E3]" />
                    <span className="text-sm text-gray-600">Properties Viewed</span>
                  </div>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-[#FF7675]" />
                    <span className="text-sm text-gray-600">Properties Saved</span>
                  </div>
                  <span className="font-semibold">{savedProperties.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-[#00B894]" />
                    <span className="text-sm text-gray-600">ROI Potential</span>
                  </div>
                  <span className="font-semibold text-[#00B894]">18.5%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue={screenData?.tab || "preferences"} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="saved">Saved Properties</TabsTrigger>
                <TabsTrigger value="renovation">Renovation History</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="preferences" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input 
                          value={profileData.first_name}
                          onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input 
                          value={profileData.last_name}
                          onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input 
                          value={profileData.email}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input 
                          value={profileData.phone_number}
                          onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input 
                          value={profileData.city}
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input 
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-gray-50" : ""}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Property Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label>Family Size</Label>
                        <span className="text-sm font-semibold text-[#0984E3]">
                          {profileData.familySize[0]} member{profileData.familySize[0] !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Slider
                        value={profileData.familySize}
                        onValueChange={(value) => setProfileData({...profileData, familySize: value})}
                        max={10}
                        min={1}
                        step={1}
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label>Budget Range</Label>
                        <span className="text-sm font-semibold text-[#FF7675]">
                          {formatCurrency(profileData.budget[0])}
                        </span>
                      </div>
                      <Slider
                        value={profileData.budget}
                        onValueChange={(value) => setProfileData({...profileData, budget: value})}
                        max={100000000}
                        min={1000000}
                        step={500000}
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">Property Types</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'apartment', label: 'Apartment', icon: '🏢' },
                          { id: 'house', label: 'House', icon: '🏠' },
                          { id: 'villa', label: 'Villa', icon: '🏘️' },
                          { id: 'plot', label: 'Plot', icon: '🌳' }
                        ].map((type) => (
                          <div 
                            key={type.id} 
                            className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                              profileData.propertyTypes.includes(type.id) 
                                ? 'border-[#00B894] bg-[#00B894]/5' 
                                : 'border-gray-200 hover:border-[#00B894]/50'
                            } ${!isEditing ? 'opacity-60 pointer-events-none' : ''}`}
                          >
                            <span className="text-lg">{type.icon}</span>
                            <span className="text-sm">{type.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Purchase Timeline</Label>
                      <Select 
                        value={profileData.timeline}
                        onValueChange={(value) => setProfileData({...profileData, timeline: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediately">Immediately</SelectItem>
                          <SelectItem value="3months">Within 3 months</SelectItem>
                          <SelectItem value="6months">Within 6 months</SelectItem>
                          <SelectItem value="1year">Within 1 year</SelectItem>
                          <SelectItem value="exploring">Just exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saved" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Saved Properties</h2>
                  <Badge className="bg-[#FF7675]/10 text-[#FF7675]">
                    {savedProperties.length} properties
                  </Badge>
                </div>

                {loadingSaved ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0984E3]" />
                  </div>
                ) : savedProperties.length === 0 ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved properties yet</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Click the heart icon on properties in the dashboard to save them here
                      </p>
                      <Button onClick={() => navigate('dashboard')} className="bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white">
                        Browse Properties
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedProperties.map((saved) => {
                      const property = saved.property_details || saved;
                      const propertyId = saved.property || saved.property_id || property.id;
                      return (
                        <Card key={saved.id || propertyId} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="relative">
                            <ImageWithFallback
                              src={property.main_image || ''}
                              alt={property.title || 'Property'}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute top-3 right-3 w-8 h-8 rounded-full p-0"
                              onClick={() => handleUnsaveProperty(propertyId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{property.title || 'Property'}</h3>
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <MapPin className="w-3 h-3 mr-1" />
                              {property.location || 'Location unavailable'}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-[#00B894]">
                                {formatPropertyPrice(property.price)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Saved {saved.saved_at ? new Date(saved.saved_at).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <Button 
                              className="w-full mt-3 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white"
                              onClick={() => navigate('property-details', { property })}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="renovation" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Renovation History</h2>
                  <Button 
                    onClick={() => navigate('renovation')}
                    className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    New Renovation
                  </Button>
                </div>

                <div className="space-y-4">
                  {renovationHistory.map((renovation) => (
                    <Card key={renovation.id} className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] rounded-lg flex items-center justify-center">
                              <Wrench className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{renovation.type}</h3>
                              <p className="text-sm text-gray-600">{renovation.property}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm font-medium text-gray-900">{renovation.cost}</span>
                                <span className="text-sm font-medium text-[#00B894]">{renovation.roi} ROI</span>
                                <span className="text-xs text-gray-500">{renovation.date}</span>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            className={
                              renovation.status === 'Completed' 
                                ? 'bg-[#00B894]/10 text-[#00B894] border-[#00B894]/20'
                                : 'bg-[#0984E3]/10 text-[#0984E3] border-[#0984E3]/20'
                            }
                          >
                            {renovation.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-[#0984E3]" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Get notified about new properties and updates' },
                      { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive text messages for important updates' },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser notifications for real-time updates' },
                      { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional offers and market insights' },
                      { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly summary of market trends and recommendations' },
                      { key: 'priceAlerts', label: 'Price Alerts', description: 'Get notified when property prices change' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.label}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <Switch
                          checked={preferences[item.key as keyof typeof preferences]}
                          onCheckedChange={(checked) => 
                            setPreferences({...preferences, [item.key]: checked})
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-[#00B894]" />
                      <span>Security Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Current Password</Label>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0 h-auto"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>New Password</Label>
                          <Input type="password" placeholder="Enter new password" />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm New Password</Label>
                          <Input type="password" placeholder="Confirm new password" />
                        </div>
                        <Button className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white">
                          Update Password
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Social Login Connections</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              G
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Google</p>
                              <p className="text-sm text-gray-600">Connected</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Disconnect</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              L
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">LinkedIn</p>
                              <p className="text-sm text-gray-600">Not connected</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-2">Account Actions</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          Download My Data
                        </Button>
                        <Button variant="destructive" className="w-full justify-start">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}