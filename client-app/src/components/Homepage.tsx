import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Home, Shield, TrendingUp, MapPin, Sparkles, Building2, CheckCircle, Users, Zap, Clock, Target, BarChart3, Calculator, Calendar, Award, FileCheck } from 'lucide-react';
import { useRouter } from './Router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logo from 'figma:asset/910f50e5e12983226a795268217208588c7e2573.png';

export function Homepage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logo} alt="Residea.ai" className="h-36" />
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              <Button 
                variant="outline" 
                onClick={() => navigate('login')}
                className="border-[#00B894] text-[#00B894] hover:bg-[#00B894] hover:text-white"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('signup')}
                className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] hover:from-[#00A085] hover:to-[#4DD0B8] text-white border-0"
              >
                Sign Up Free
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Stop grinding with{' '}
              <span className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] bg-clip-text text-transparent">
                property agents
              </span>
              <br />
              Let AI find your home
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover perfect properties with AI-powered recommendations, verified societies, 
              and renovation insights that maximize your investment potential.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="p-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Location</label>
                  <Select>
                    <SelectTrigger className="bg-gray-50 border-0">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karachi">Karachi</SelectItem>
                      <SelectItem value="lahore">Lahore</SelectItem>
                      <SelectItem value="islamabad">Islamabad</SelectItem>
                      <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                      <SelectItem value="faisalabad">Faisalabad</SelectItem>
                      <SelectItem value="multan">Multan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Budget</label>
                  <Select>
                    <SelectTrigger className="bg-gray-50 border-0">
                      <SelectValue placeholder="Price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50l-1cr">PKR 50L - 1Cr</SelectItem>
                      <SelectItem value="1cr-2cr">PKR 1Cr - 2Cr</SelectItem>
                      <SelectItem value="2cr-5cr">PKR 2Cr - 5Cr</SelectItem>
                      <SelectItem value="5cr+">PKR 5Cr+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600">Property Type</label>
                  <Select>
                    <SelectTrigger className="bg-gray-50 border-0">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    className="w-full bg-gradient-to-r from-[#0984E3] to-[#74B9FF] hover:from-[#0770C1] hover:to-[#5AA3E6] text-white border-0"
                    onClick={() => navigate('dashboard')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search Now
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Residea.ai?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of property search with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00B894] to-[#55E6C1] rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Recommendations</h3>
                <p className="text-gray-600 mb-4">
                  Our advanced AI analyzes your preferences, budget, and lifestyle to recommend perfect properties.
                </p>
                <Badge className="bg-[#00B894]/10 text-[#00B894] border-[#00B894]/20">
                  Smart Matching
                </Badge>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Societies</h3>
                <p className="text-gray-600 mb-4">
                  Every property is thoroughly verified with legal approvals, safety ratings, and community insights.
                </p>
                <Badge className="bg-[#0984E3]/10 text-[#0984E3] border-[#0984E3]/20">
                  100% Verified
                </Badge>
              </CardContent>
            </Card>

            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Renovation ROI Insights</h3>
                <p className="text-gray-600 mb-4">
                  Get AI-powered renovation suggestions that maximize your property's value and return on investment.
                </p>
                <Badge className="bg-[#FF7675]/10 text-[#FF7675] border-[#FF7675]/20">
                  Value Optimization
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600">
              Discover handpicked properties with AI-verified quality scores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1605795733251-a0b6c96d9dea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGlzbGFtYWJhZHxlbnwxfHx8fDE3NjQ5NjQwNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Modern House"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[#00B894] text-white border-0">
                    ✨ AI Score: 92%
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-gray-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">Modern Villa</h3>
                  <span className="text-xl font-bold text-[#00B894]">PKR 2.5Cr</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">F-7, Islamabad</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>4 BHK</span>
                  <span>3500 sqft</span>
                  <span>ROI: 12%</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white border-0"
                  onClick={() => navigate('property-details', { id: 1 })}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1679364297777-1db77b6199be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NDg5ODA4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Luxury Villa"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[#0984E3] text-white border-0">
                    ✨ AI Score: 88%
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-gray-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">Luxury Villa</h3>
                  <span className="text-xl font-bold text-[#0984E3]">PKR 1.8Cr</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">DHA Phase 2, Islamabad</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>3 BHK</span>
                  <span>2200 sqft</span>
                  <span>ROI: 15%</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#0984E3] to-[#74B9FF] text-white border-0"
                  onClick={() => navigate('property-details', { id: 2 })}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1628744448839-a475cc0e90c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob21lJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzY0OTY0MDYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Property Interior"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-[#FF7675] text-white border-0">
                    ✨ AI Score: 95%
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-gray-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">Premium Home</h3>
                  <span className="text-xl font-bold text-[#FF7675]">PKR 3.2Cr</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">Bahria Town, Islamabad</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>5 BHK</span>
                  <span>4000 sqft</span>
                  <span>ROI: 18%</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] text-white border-0"
                  onClick={() => navigate('property-details', { id: 3 })}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Provide Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Residea.ai Provides
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and features designed to make your property journey seamless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Property Search */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="w-14 h-14 bg-gradient-to-r from-[#00B894] to-[#55E6C1] rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Property Search</h3>
                <p className="text-gray-600 mb-4">
                  Advanced AI filters match your exact requirements - location, budget, amenities, and lifestyle preferences to find your perfect home.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#00B894] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Location-based filtering across Pakistan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#00B894] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Budget-friendly recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#00B894] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Personalized property suggestions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Verified Property Listings */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="w-14 h-14 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-xl flex items-center justify-center mb-4">
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Property Listings</h3>
                <p className="text-gray-600 mb-4">
                  Every property is thoroughly verified with legal documentation, ownership proof, and comprehensive background checks.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#0984E3] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Legal approval verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#0984E3] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Authentic seller validation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#0984E3] mr-2 mt-0.5 flex-shrink-0" />
                    <span>NOC and documentation checks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* AI-Powered ROI Calculator */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="w-14 h-14 bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered ROI Calculator</h3>
                <p className="text-gray-600 mb-4">
                  Predict future property value, rental income potential, and renovation ROI with our intelligent analytics engine.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#FF7675] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Market trend analysis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#FF7675] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Investment value forecasting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#FF7675] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Renovation impact estimates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Property Comparison */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="w-14 h-14 bg-gradient-to-r from-[#E17055] to-[#FDCB6E] rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Property Comparison</h3>
                <p className="text-gray-600 mb-4">
                  Compare multiple properties side-by-side with detailed metrics including price, amenities, location scores, and ROI.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#E17055] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Up to 3 properties at once</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#E17055] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Detailed feature comparison</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#E17055] mr-2 mt-0.5 flex-shrink-0" />
                    <span>AI-based recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Renovation Insights */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="w-14 h-14 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Renovation Insights</h3>
                <p className="text-gray-600 mb-4">
                  Get AI-powered renovation recommendations with cost estimates, value addition predictions, and contractor connections.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#0984E3] mr-2 mt-0.5 flex-shrink-0" />
                    <span>ROI-based renovation suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#0984E3] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Cost estimation tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#0984E3] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Verified contractor network</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* List Your Property */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="w-14 h-14 bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] rounded-xl flex items-center justify-center mb-4">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">List Your Property</h3>
                <p className="text-gray-600 mb-4">
                  Sellers can list properties with detailed information, photos, and reach thousands of verified buyers instantly.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#FF7675] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Easy 6-step listing process</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#FF7675] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Manage multiple listings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-[#FF7675] mr-2 mt-0.5 flex-shrink-0" />
                    <span>Track inquiries and views</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Residea.ai Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find your dream property in just 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-r from-[#00B894] to-[#55E6C1] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign Up &amp; Set Preferences</h3>
              <p className="text-gray-600">
                Create your free account and tell us about your ideal property through our AI-powered onboarding.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get AI Recommendations</h3>
              <p className="text-gray-600">
                Our AI instantly matches you with verified properties that fit your budget, location, and lifestyle needs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Compare &amp; Visit</h3>
              <p className="text-gray-600">
                Use our comparison tools and schedule virtual or physical tours to explore properties in detail.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Make Informed Decision</h3>
              <p className="text-gray-600">
                Use our ROI calculator and market insights to make the smartest investment decision possible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section - Tired of Dishonest Agents */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                THE PROBLEM
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Tired of Dishonest Property Agents?
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Fed up with agents who hide property issues, inflate prices, and waste your time with unsuitable properties just to earn their commission?
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600">✗</span>
                  </div>
                  <p className="text-gray-700">Hidden property defects revealed only after payment</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600">✗</span>
                  </div>
                  <p className="text-gray-700">Inflated prices 20-30% above market value</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600">✗</span>
                  </div>
                  <p className="text-gray-700">Fake listings that don&apos;t exist or already sold</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-600">✗</span>
                  </div>
                  <p className="text-gray-700">Pressure tactics to close deals quickly</p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('signup')}
                className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] hover:from-[#00A085] hover:to-[#4DD0B8] text-white border-0"
              >
                Try Residea.ai - No Agents, Just AI
              </Button>
            </div>
            <div>
              <Card className="p-8 border-0 shadow-2xl bg-white">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00B894] to-[#55E6C1] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Residea.ai Solution</h3>
                  <p className="text-gray-600">100% Transparent, AI-Powered Search</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">AI Verifies Every Detail</p>
                      <p className="text-sm text-gray-600">Legal docs, ownership, NOCs automatically checked</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Real Market Prices</p>
                      <p className="text-sm text-gray-600">AI analyzes 1000s of transactions for fair pricing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Only Active Listings</p>
                      <p className="text-sm text-gray-600">Real-time updates, no fake or sold properties</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">No Pressure, Your Pace</p>
                      <p className="text-sm text-gray-600">Search, compare, decide when YOU&apos;re ready</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Point - Wasted Time */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">😫</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">The Old Way</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>→ Spend <strong>3-6 months</strong> searching manually</p>
                  <p>→ Visit <strong>20-30 unsuitable</strong> properties</p>
                  <p>→ Deal with <strong>10+ agents</strong> calling daily</p>
                  <p>→ Waste <strong>PKR 50,000+</strong> on travel &amp; agent fees</p>
                  <p>→ Still unsure if you got a <strong>fair deal</strong></p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                SAVE YOUR TIME
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Stop Wasting Months on Property Hunting
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Why spend months visiting properties that don&apos;t match your needs? Our AI does the heavy lifting in seconds.
              </p>
              <div className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] p-6 rounded-xl text-white mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Sparkles className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">The Residea.ai Way</h3>
                </div>
                <div className="space-y-2">
                  <p>✓ Find your home in <strong>7 days or less</strong></p>
                  <p>✓ Only see properties that <strong>match 100%</strong></p>
                  <p>✓ <strong>Zero agent calls</strong> - browse in peace</p>
                  <p>✓ <strong>Save time & money</strong> with AI matching</p>
                  <p>✓ <strong>Guaranteed fair price</strong> with AI verification</p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('signup')}
                className="bg-gradient-to-r from-[#0984E3] to-[#74B9FF] hover:from-[#0770C1] hover:to-[#5AA3E6] text-white border-0"
              >
                Start Searching Smarter →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Point - Overpaying */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold mb-4">
              PROTECT YOUR INVESTMENT
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Are You Overpaying for Your Property?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Most buyers in Pakistan overpay by 15-25% because they don&apos;t have access to real market data. Not anymore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-2 border-yellow-200 bg-white">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Market Prices</h3>
              </div>
              <p className="text-gray-600 text-center mb-4">
                Our AI analyzes thousands of recent transactions to show you the <strong>true market value</strong> of every property.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-700">Save an average of</p>
                <p className="text-3xl font-bold text-yellow-600">PKR 25L+</p>
                <p className="text-sm text-gray-600">per property purchase</p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-green-200 bg-white">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ROI Predictions</h3>
              </div>
              <p className="text-gray-600 text-center mb-4">
                Know exactly how much your property will be worth in 5 years with our <strong>AI forecasting</strong>.
              </p>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-700">Accuracy rate of</p>
                <p className="text-3xl font-bold text-green-600">94%</p>
                <p className="text-sm text-gray-600">based on historical data</p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-blue-200 bg-white">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hidden Cost Detection</h3>
              </div>
              <p className="text-gray-600 text-center mb-4">
                We reveal <strong>all hidden costs</strong> - maintenance, taxes, society charges - before you buy.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-700">Avoid surprise costs of</p>
                <p className="text-3xl font-bold text-blue-600">PKR 5-10L</p>
                <p className="text-sm text-gray-600">that agents don&apos;t mention</p>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate('signup')}
              className="bg-gradient-to-r from-[#00B894] to-[#55E6C1] hover:from-[#00A085] hover:to-[#4DD0B8] text-white border-0"
            >
              Get Free Price Analysis Now
            </Button>
          </div>
        </div>
      </section>

      {/* Pain Point - Legal Issues */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                AVOID SCAMS
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Scared of Property Fraud &amp; Legal Issues?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                In Pakistan, <strong>1 in 5 property buyers</strong> face legal disputes. Missing NOCs, fake documents, ownership conflicts - these nightmares can cost you everything.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Document Verification</h4>
                    <p className="text-gray-600">AI scans &amp; verifies all legal documents, NOCs, and ownership papers in seconds</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Legal Compliance Check</h4>
                    <p className="text-gray-600">Automated verification against CDA, RDA, LDA regulations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Fraud Detection</h4>
                    <p className="text-gray-600">AI flags suspicious listings, fake sellers, and common scam patterns</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Ownership History</h4>
                    <p className="text-gray-600">Complete chain of ownership visible before you commit</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-6">Real Stories from Pakistan</h3>
              
              <div className="space-y-6">
                <div className="bg-white/10 p-6 rounded-lg backdrop-blur">
                  <p className="text-white/90 mb-3 italic">
                    &quot;I almost bought a property in Bahria Town without proper NOC. Residea.ai flagged it instantly. Saved me from a PKR 2 Crore mistake!&quot;
                  </p>
                  <p className="text-white/70 text-sm">- Ahmed K., Islamabad</p>
                </div>

                <div className="bg-white/10 p-6 rounded-lg backdrop-blur">
                  <p className="text-white/90 mb-3 italic">
                    &quot;The agent said everything was clear. AI found 3 ownership disputes. Dodged a bullet!&quot;
                  </p>
                  <p className="text-white/70 text-sm">- Fatima R., Lahore</p>
                </div>

                <div className="bg-white/10 p-6 rounded-lg backdrop-blur">
                  <p className="text-white/90 mb-3 italic">
                    &quot;Finally found a verified property with all legal docs. Bought with complete peace of mind.&quot;
                  </p>
                  <p className="text-white/70 text-sm">- Hassan M., Karachi</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('signup')}
                  className="bg-white text-gray-900 hover:bg-gray-100 border-0 w-full"
                >
                  Verify Your Property Now - Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#00B894] to-[#55E6C1]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of satisfied users who found their perfect homes with Residea.ai
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('signup')}
              className="bg-white text-[#00B894] hover:bg-gray-100 border-0 px-8"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('dashboard')}
              className="bg-transparent text-white border-2 border-white hover:bg-white/10"
            >
              Explore Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src={logo} alt="Residea.ai" className="h-36" />
              </div>
              <p className="text-gray-400">
                AI-powered property recommendations for smarter real estate decisions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Search</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Property Insights</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Renovation ROI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Verification</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Residea.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}