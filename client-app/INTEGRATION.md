# Frontend-Backend Integration

## ✅ API Services Created

Created comprehensive API integration layer:

### 📁 Files Created

1. **`src/config/api.ts`** - API endpoints configuration
2. **`src/services/tokenService.ts`** - JWT token management
3. **`src/services/apiClient.ts`** - HTTP client with auto token refresh
4. **`src/services/authService.ts`** - Authentication (login, register, profile)
5. **`src/services/propertyService.ts`** - Property operations
6. **`src/services/preferencesService.ts`** - User preferences

### 🔧 Features

- ✅ Automatic JWT token refresh
- ✅ Token storage in localStorage
- ✅ Automatic Authorization headers
- ✅ Error handling and retry logic
- ✅ TypeScript interfaces for type safety
- ✅ Session management

### 📝 Usage Examples

#### Authentication
```typescript
import authService from './services/authService';

// Login
const { user, access, refresh } = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const response = await authService.register({
  email: 'new@example.com',
  username: 'newuser',
  password: 'SecurePass123!',
  password2: 'SecurePass123!',
  first_name: 'John',
  last_name: 'Doe',
  user_type: 'buyer'
});

// Logout
authService.logout();
```

#### Properties
```typescript
import propertyService from './services/propertyService';

// Get properties with filters
const { results } = await propertyService.getProperties({
  min_price: 1000000,
  max_price: 5000000,
  min_bedrooms: 3,
  location: 'Islamabad'
});

// Get property details
const property = await propertyService.getPropertyDetail(123);

// Get ROI estimate
const roi = await propertyService.getROIEstimate(123);

// Get recommendations
const recommendations = await propertyService.getRecommendations(10);
```

### 🔗 Next Steps

To integrate with existing components:

1. Update LoginScreen to use `authService.login()`
2. Update SignupScreen to use `authService.register()`
3. Update Dashboard to use `propertyService.getProperties()`
4. Update PropertyDetails to use `propertyService.getPropertyDetail()`
5. Update RenovationDashboard to use `propertyService.getROIEstimate()`

### 🌐 Environment Variables

Create `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:8000
```

All services are ready to use! The backend connection is complete.
