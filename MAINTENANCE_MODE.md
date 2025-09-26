# Maintenance Mode Documentation

## Overview
The Medical Camp System includes a built-in maintenance mode feature that allows administrators to temporarily disable user access while displaying a professional maintenance page.

## How It Works

### Environment Variable Control
The maintenance mode is controlled by the `NEXT_PUBLIC_MAINTENANCE_MODE` environment variable in your `.env` file:

```env
# Enable maintenance mode
NEXT_PUBLIC_MAINTENANCE_MODE=true

# Disable maintenance mode (normal operation)
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### Automatic Detection
- When `NEXT_PUBLIC_MAINTENANCE_MODE=true`, all users see the maintenance page
- When `NEXT_PUBLIC_MAINTENANCE_MODE=false`, the system operates normally
- The maintenance page is excluded from the maintenance mode (prevents infinite loops)

## Managing Maintenance Mode

### Method 1: Settings Page (Recommended)
1. Navigate to `/settings` in your application
2. Scroll to the "System Actions" section
3. Use the "Maintenance Mode" toggle
4. The system will automatically update the `.env` file
5. **Important**: Restart the server for changes to take effect

### Method 2: Manual Environment Variable
1. Edit the `.env` file in your project root
2. Set `NEXT_PUBLIC_MAINTENANCE_MODE=true` or `NEXT_PUBLIC_MAINTENANCE_MODE=false`
3. Save the file
4. Restart your development server (`npm run dev`)

### Method 3: API Endpoint
You can also programmatically control maintenance mode via the API:

```javascript
// Enable maintenance mode
fetch('/api/maintenance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ maintenanceMode: true })
})

// Get current maintenance status
fetch('/api/maintenance')
  .then(res => res.json())
  .then(data => console.log('Maintenance mode:', data.maintenanceMode))
```

## Maintenance Page Features

The maintenance page (`/maintenance`) includes:
- Professional medical camp branding
- Clear maintenance messaging
- Current time display (updates every second)
- Contact information for urgent matters
- Progress animation to show activity
- Responsive design for all devices

## Customization

### Updating Contact Information
Edit `/src/app/maintenance/page.tsx` to update:
- Contact email address
- Phone number
- Organization details

### Styling Changes
The maintenance page uses Tailwind CSS classes and can be customized by modifying the component styling.

### Custom Maintenance Logic
You can extend the `MaintenanceWrapper` component in `/src/components/MaintenanceWrapper.tsx` to add:
- User role-based access (allow admins during maintenance)
- Scheduled maintenance windows
- Custom redirect logic

## Important Notes

⚠️ **Server Restart Required**: Changes to environment variables require a server restart to take effect.

⚠️ **Production Deployment**: When deploying to production, ensure your hosting platform supports environment variable updates without full redeployment.

✅ **Best Practices**:
- Test maintenance mode in development before using in production
- Communicate maintenance windows to users in advance
- Keep the maintenance page updated with realistic information
- Monitor your application during maintenance periods

## Troubleshooting

### Maintenance Mode Not Working
1. Check that `.env` exists and contains the correct variable
2. Verify the server has been restarted after environment changes
3. Clear browser cache and refresh the page

### Users Still Accessing the System
1. Confirm `NEXT_PUBLIC_MAINTENANCE_MODE=true` is set correctly
2. Check for any caching issues (CDN, browser cache)
3. Verify the MaintenanceWrapper is properly imported in the layout

### Cannot Access Settings to Disable
1. Manually edit `.env` to set `NEXT_PUBLIC_MAINTENANCE_MODE=false`
2. Restart the server
3. Navigate to `/settings` to use the toggle interface