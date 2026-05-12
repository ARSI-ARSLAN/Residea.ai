import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MapPin,
  CheckCircle,
  Home,
  Video,
  Users
} from 'lucide-react';
import { useRouter } from './Router';
import { ImageWithFallback } from './figma/ImageWithFallback';

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
];

export function ScheduleVisit() {
  const { navigate, screenData } = useRouter();
  const property = screenData?.property;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [visitType, setVisitType] = useState<"physical" | "virtual">("physical");
  const [guestCount, setGuestCount] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00B894] to-[#55E6C1] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Visit Scheduled!</h2>
            <p className="text-gray-600 mb-6">
              Your property visit has been successfully scheduled. We'll send you a confirmation email shortly.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{selectedDate?.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">Time:</span>
                  <span className="ml-2">{selectedTime}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">Property:</span>
                  <span className="ml-2">{property?.title || "Luxury Villa"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0"
                onClick={() => navigate('dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('property-details', { property })}
              >
                View Property Details
              </Button>
            </div>
          </CardContent>
        </Card>
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
              onClick={() => navigate('property-details', { property })}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Schedule Property Visit</h1>
              <p className="text-sm text-gray-600">Book a tour at your convenience</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Info */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              {property?.image && (
                <ImageWithFallback
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {property?.title || "Luxury Villa with Garden"}
                </h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  {property?.location || "F-7, Islamabad"}
                </div>
                <div className="text-2xl font-bold text-[#00B894] mb-4">
                  {property?.price || "PKR 3.2Cr"}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property ID:</span>
                    <span className="font-medium">#{property?.id || "001"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">Villa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">{property?.area || "3500"} sqft</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#0984E3] to-[#74B9FF] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sarah Johnson</p>
                      <p className="text-sm text-gray-600">Property Consultant</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Visit Type Selection */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Select Visit Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setVisitType("physical")}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          visitType === "physical"
                            ? "border-[#00B894] bg-[#00B894]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Home className={`w-8 h-8 mx-auto mb-2 ${
                          visitType === "physical" ? "text-[#00B894]" : "text-gray-400"
                        }`} />
                        <div className="font-semibold text-gray-900 mb-1">Physical Visit</div>
                        <div className="text-sm text-gray-600">Visit the property in person</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisitType("virtual")}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          visitType === "virtual"
                            ? "border-[#0984E3] bg-[#0984E3]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Video className={`w-8 h-8 mx-auto mb-2 ${
                          visitType === "virtual" ? "text-[#0984E3]" : "text-gray-400"
                        }`} />
                        <div className="font-semibold text-gray-900 mb-1">Virtual Tour</div>
                        <div className="text-sm text-gray-600">Video call with agent</div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Date Selection */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-[#00B894]" />
                      Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>

                {/* Time Selection */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-[#0984E3]" />
                      Select Time Slot
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            selectedTime === time
                              ? "border-[#0984E3] bg-[#0984E3]/5 text-[#0984E3]"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Number of Guests */}
                {visitType === "physical" && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-[#FF7675]" />
                        Number of Guests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                          disabled={guestCount <= 1}
                        >
                          -
                        </Button>
                        <span className="text-2xl font-semibold text-gray-900 min-w-[40px] text-center">
                          {guestCount}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setGuestCount(Math.min(5, guestCount + 1))}
                          disabled={guestCount >= 5}
                        >
                          +
                        </Button>
                        <span className="text-sm text-gray-600">guest(s)</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Information */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+92 300 1234567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Any specific requirements or questions..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-[#00B894]/5 to-[#55E6C1]/5">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <CheckCircle className="w-5 h-5 text-[#00B894] mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="mb-2">By scheduling this visit, you agree to:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>Our terms and conditions</li>
                          <li>Receiving property updates via email/SMS</li>
                          <li>Being contacted by our property consultant</li>
                        </ul>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0 py-6"
                      disabled={!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Visit Schedule
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
