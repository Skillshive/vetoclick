# OpenStreetMap Address Validation Setup

This application uses **OpenStreetMap Nominatim API** to validate addresses entered by veterinarians in their profile settings. This is a completely **free and open-source** solution that doesn't require any API keys or registration.

## Why OpenStreetMap?

✅ **Completely Free** - No API keys, no registration, no usage limits  
✅ **Open Source** - Community-driven, transparent, and reliable  
✅ **Global Coverage** - Worldwide address data with excellent accuracy  
✅ **No Rate Limits** - Reasonable usage policies for normal applications  
✅ **Privacy Friendly** - No tracking or data collection  

## Setup Instructions

### 1. No Configuration Required!

The OpenStreetMap Nominatim API requires **no setup** - it works out of the box! The application is already configured to use the public Nominatim service.

### 2. Optional Configuration

If you want to customize the service, you can add these optional settings to your `.env` file:

```env
# Optional: Custom Nominatim server (if you want to use your own instance)
OPENSTREETMAP_NOMINATIM_URL=https://nominatim.openstreetmap.org/search

# Optional: Custom user agent (recommended for production)
OPENSTREETMAP_USER_AGENT=YourApp/1.0 (Contact: your-email@example.com)
```

### 3. Test the Setup

1. Start your Laravel application
2. Log in as a user with veterinarian role
3. Go to Settings > General
4. Enter an address in the address field
5. You should see real-time validation feedback

## Features

- **Real-time validation**: Addresses are validated as you type (with 1-second debounce)
- **Visual feedback**: Loading spinner, success/error messages, and suggestions
- **Form protection**: Form submission is blocked if address is invalid
- **Error handling**: Graceful fallback when API is unavailable
- **Suggestions**: Shows address suggestions for partial matches
- **Global coverage**: Works with addresses worldwide
- **Smart matching**: Uses importance scoring to determine address quality

## API Usage

The application makes requests to:
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Method**: GET
- **Parameters**: 
  - `q`: The address to validate
  - `format`: json
  - `addressdetails`: 1 (for detailed address components)
  - `limit`: 5 (maximum results)
  - `countrycodes`: (empty for global search)

## Usage Guidelines

### Respectful Usage
- The service is free but please use it responsibly
- Include a proper User-Agent header (already configured)
- Don't make more than 1 request per second (debouncing handles this)
- Don't use for bulk geocoding (use your own Nominatim instance for that)

### Rate Limits
- Nominatim has a 1 request per second limit for the public service
- The application includes 1-second debouncing to respect this limit
- For high-volume usage, consider setting up your own Nominatim instance

## Troubleshooting

### "Unable to validate address at the moment"
- Check your internet connection
- The Nominatim service might be temporarily unavailable
- Try again in a few moments

### "Address could not be found"
- Try being more specific with the address
- Include city and country for better results
- Check spelling and formatting

### Slow responses
- Nominatim is a free service and may be slower during peak times
- The application includes proper timeouts and error handling
- Consider setting up your own Nominatim instance for production use

## Self-Hosted Option

For production applications with high usage, you can set up your own Nominatim instance:

1. **Docker Setup**: Use the official Nominatim Docker image
2. **Database**: Requires PostgreSQL with PostGIS extension
3. **Data**: Download OpenStreetMap data for your region
4. **Configuration**: Update the `OPENSTREETMAP_NOMINATIM_URL` in your `.env`

## Benefits Over Google Maps

| Feature | OpenStreetMap | Google Maps |
|---------|---------------|-------------|
| **Cost** | Free | $5/1000 requests after free tier |
| **Setup** | None required | API key + billing setup |
| **Privacy** | No tracking | Data collection |
| **Open Source** | Yes | No |
| **Global Coverage** | Excellent | Excellent |
| **Accuracy** | Very Good | Excellent |
| **Rate Limits** | 1 req/sec | 50 req/sec (paid) |
