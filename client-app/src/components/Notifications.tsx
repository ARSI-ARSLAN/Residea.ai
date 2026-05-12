import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Bell, 
  Home, 
  TrendingUp, 
  Calendar, 
  Shield,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';
import { useRouter } from './Router';

const notifications = [
  {
    id: 1,
    type: "new_property",
    title: "New Property Match Found!",
    message: "A new 4 BHK villa in F-7, Islamabad matches your preferences",
    property: "Luxury Villa - F-7",
    price: "PKR 3.2Cr",
    time: "2 hours ago",
    unread: true,
    icon: Home,
    color: "from-[#00B894] to-[#55E6C1]"
  },
  {
    id: 2,
    type: "price_drop",
    title: "Price Drop Alert",
    message: "Property you saved has dropped by PKR 20L",
    property: "Modern Apartment - DHA Phase 2",
    price: "PKR 1.6Cr",
    time: "5 hours ago",
    unread: true,
    icon: TrendingUp,
    color: "from-[#FF7675] to-[#FAB1A0]"
  },
  {
    id: 3,
    type: "visit_reminder",
    title: "Property Visit Reminder",
    message: "Your scheduled visit is tomorrow at 10:00 AM",
    property: "Premium Penthouse - Bahria Town",
    time: "1 day ago",
    unread: false,
    icon: Calendar,
    color: "from-[#0984E3] to-[#74B9FF]"
  },
  {
    id: 4,
    type: "verification",
    title: "Property Verified",
    message: "The property documents have been verified successfully",
    property: "Garden Villa - G-11",
    time: "2 days ago",
    unread: false,
    icon: Shield,
    color: "from-[#00B894] to-[#55E6C1]"
  },
  {
    id: 5,
    type: "market_update",
    title: "Market Insights",
    message: "Property prices in F-7 sector increased by 5% this month",
    time: "3 days ago",
    unread: false,
    icon: DollarSign,
    color: "from-[#FAB1A0] to-[#FF7675]"
  },
  {
    id: 6,
    type: "new_listing",
    title: "New Listing in Your Area",
    message: "3 new properties added in Islamabad matching your budget",
    time: "4 days ago",
    unread: false,
    icon: MapPin,
    color: "from-[#0984E3] to-[#74B9FF]"
  }
];

export function Notifications() {
  const { navigate } = useRouter();
  const [notificationList, setNotificationList] = useState(notifications);
  const [settings, setSettings] = useState({
    newProperties: true,
    priceAlerts: true,
    visitReminders: true,
    marketUpdates: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  const unreadCount = notificationList.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotificationList(notificationList.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotificationList(notificationList.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotificationList(notificationList.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotificationList([]);
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
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600">Stay updated with your property alerts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] text-white border-0">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-white border">
              <TabsTrigger value="all">All ({notificationList.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              {notificationList.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAll}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {notificationList.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
                  <p className="text-gray-600">You're all caught up! We'll notify you when something new happens.</p>
                </CardContent>
              </Card>
            ) : (
              notificationList.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
                    notification.unread ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${notification.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <notification.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            {notification.title}
                            {notification.unread && (
                              <span className="ml-2 w-2 h-2 bg-[#0984E3] rounded-full"></span>
                            )}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        
                        {notification.property && (
                          <div className="flex items-center space-x-4 mb-2">
                            <Badge variant="secondary" className="bg-gray-100">
                              <Home className="w-3 h-3 mr-1" />
                              {notification.property}
                            </Badge>
                            {notification.price && (
                              <Badge variant="secondary" className="bg-[#00B894]/10 text-[#00B894]">
                                {notification.price}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {notificationList.filter(n => n.unread).length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-[#00B894] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-600">You have no unread notifications.</p>
                </CardContent>
              </Card>
            ) : (
              notificationList.filter(n => n.unread).map((notification) => (
                <Card 
                  key={notification.id} 
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-blue-50/50"
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${notification.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <notification.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 flex items-center">
                            {notification.title}
                            <span className="ml-2 w-2 h-2 bg-[#0984E3] rounded-full"></span>
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        
                        {notification.property && (
                          <div className="flex items-center space-x-4 mb-2">
                            <Badge variant="secondary" className="bg-gray-100">
                              <Home className="w-3 h-3 mr-1" />
                              {notification.property}
                            </Badge>
                            {notification.price && (
                              <Badge variant="secondary" className="bg-[#00B894]/10 text-[#00B894]">
                                {notification.price}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.time}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-[#00B894]" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Alert Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Home className="w-5 h-5 text-[#00B894]" />
                        <div>
                          <p className="font-medium text-gray-900">New Properties</p>
                          <p className="text-sm text-gray-600">Get notified when new properties match your preferences</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.newProperties}
                        onCheckedChange={(checked) => setSettings({ ...settings, newProperties: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="w-5 h-5 text-[#FF7675]" />
                        <div>
                          <p className="font-medium text-gray-900">Price Alerts</p>
                          <p className="text-sm text-gray-600">Receive alerts when property prices change</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.priceAlerts}
                        onCheckedChange={(checked) => setSettings({ ...settings, priceAlerts: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-[#0984E3]" />
                        <div>
                          <p className="font-medium text-gray-900">Visit Reminders</p>
                          <p className="text-sm text-gray-600">Reminders for scheduled property visits</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.visitReminders}
                        onCheckedChange={(checked) => setSettings({ ...settings, visitReminders: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-[#FAB1A0]" />
                        <div>
                          <p className="font-medium text-gray-900">Market Updates</p>
                          <p className="text-sm text-gray-600">Weekly market insights and trends</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.marketUpdates}
                        onCheckedChange={(checked) => setSettings({ ...settings, marketUpdates: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-4">Delivery Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive important alerts via SMS</p>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-600">Get instant alerts on your device</p>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button className="w-full bg-gradient-to-r from-[#00B894] to-[#55E6C1] text-white border-0">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
