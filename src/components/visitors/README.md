# Visitor Settings Component

A comprehensive settings management component for visitors in the Visitor Management System. This component allows visitors to manage their profile, notification preferences, and appearance settings.

## Features

### Profile Management
- Update personal information (name, email, phone)
- Upload and manage profile photo
- Set company and visit purpose
- Configure timezone preferences

### Notification Settings
- Email alerts configuration
- SMS notifications toggle
- Push notification preferences
- Visit reminders settings
- Check-in notifications

### Appearance Settings
- Theme selection (light/dark/system)
- Date format preferences
- Time format options
- Compact mode toggle

## API Integration

The component integrates with the following API endpoints:

- `GET /api/auth/profile` - Fetch visitor profile data
- `PUT /api/auth/update-profile` - Update visitor profile
- `POST /api/auth/upload-photo` - Upload profile photo
- `PUT /api/auth/update-notifications` - Update notification preferences

## State Management

The component uses React's useState and useEffect hooks to manage:
- Profile data
- Notification preferences
- Appearance settings
- Loading states
- Save status

## UI Features

### Loading State
- Animated multi-layered spinner
- Bouncing loading text
- Animated loading dots
- Smooth transitions

### Form Handling
- Real-time input validation
- Error handling with toast notifications
- Success feedback
- Auto-save functionality

### Responsive Design
- Mobile-friendly layout
- Adaptive tab navigation
- Responsive form elements
- Dark mode support

## Usage

```jsx
import VisitorSettings from './components/visitors/VisitorSettings';

function App() {
  return (
    <div className="app">
      <VisitorSettings />
    </div>
  );
}
```

## Dependencies

- React
- react-hot-toast (for notifications)
- Lucide React (for icons)
- Tailwind CSS (for styling)

## Local Storage

The component uses localStorage to persist:
- User profile photo
- User full name
- Theme preferences
- Date format
- Time format

## Error Handling

- API error handling with user feedback
- Form validation
- Network error recovery
- Authentication error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 