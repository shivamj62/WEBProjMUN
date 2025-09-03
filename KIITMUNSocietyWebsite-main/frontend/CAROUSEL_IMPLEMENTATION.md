# Dynamic Carousel Component for Leadership Team

This implementation provides a complete carousel system using static images from the public directory, specifically designed for showcasing the MUN Society leadership team.

## 📁 Directory Structure

```
frontend/
├── public/
│   └── images/
│       └── leadership/
│           ├── president.jpg
│           ├── vice-president.jpg
│           ├── secretary-general.jpg
│           ├── training-director.jpg
│           ├── external-affairs.jpg
│           └── treasurer.jpg
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── carousel.jsx (Base carousel component)
│   │       ├── leadership-carousel.jsx (Leadership-specific carousel)
│   │       └── blog-detail-modal.jsx (Modal for detailed view)
│   └── app/
│       └── carousel-demo/
│           └── page.jsx (Demo page)
```

## 🖼️ Image Requirements

### Image Specifications:
- **Format**: JPG, PNG, WebP
- **Dimensions**: 800x600 pixels (4:3 aspect ratio) or similar
- **File Size**: Recommended < 500KB for optimal loading
- **Quality**: High resolution for carousel display

### Current Placeholders:
Replace the following placeholder files with actual images:
- `/public/images/leadership/president.jpg`
- `/public/images/leadership/vice-president.jpg`
- `/public/images/leadership/secretary-general.jpg`
- `/public/images/leadership/training-director.jpg`
- `/public/images/leadership/external-affairs.jpg`
- `/public/images/leadership/treasurer.jpg`

## 🚀 Components Overview

### 1. Base Carousel Component (`carousel.jsx`)
- **Purpose**: Reusable carousel component for any slide data
- **Features**:
  - Auto-play functionality with pause on hover
  - Navigation controls (previous/next)
  - Slide indicators
  - Responsive design
  - Click handling for slides
  - Image error handling with fallbacks

### 2. Leadership Carousel (`leadership-carousel.jsx`)
- **Purpose**: Leadership-specific carousel with static data
- **Features**:
  - Static leadership team data
  - Integration with Next.js Image component
  - Custom modal for detailed member view
  - Contact information display
  - Achievement highlights
  - Role-based styling

### 3. Leadership Detail Modal
- **Purpose**: Detailed view of leadership team members
- **Features**:
  - Full-screen modal with member details
  - Achievement listings
  - Contact information
  - Professional background
  - Responsive design
  - Keyboard navigation (ESC to close)

## 📊 Leadership Data Structure

```javascript
{
  id: number,
  title: string,           // Member name
  role: string,           // Position (President, VP, etc.)
  subtitle: string,       // Role description
  image: string,          // Path to image in /public
  content: string,        // Detailed biography
  achievements: array,    // List of achievements
  contact: string         // Email address
}
```

## 🎨 Styling Features

- **Tailwind CSS**: Fully styled with Tailwind classes
- **Responsive Design**: Mobile-first approach
- **Animations**: Smooth transitions and hover effects
- **Color Scheme**: Uses primary and secondary color variables
- **Gradient Backgrounds**: Modern gradient overlays
- **Glass Morphism**: Backdrop blur effects for controls

## 🔧 Usage Examples

### Basic Usage:
```jsx
import LeadershipCarousel from '@/components/ui/leadership-carousel';

function HomePage() {
  return (
    <div>
      <LeadershipCarousel />
    </div>
  );
}
```

### Custom Configuration:
```jsx
<LeadershipCarousel 
  autoPlay={true}
  autoPlayInterval={8000}
  showControls={true}
  showIndicators={true}
  className="custom-carousel"
/>
```

### Using Base Carousel with Custom Data:
```jsx
import Carousel from '@/components/ui/carousel';

const customSlides = [
  {
    id: 1,
    title: "Custom Title",
    subtitle: "Custom Subtitle",
    src: "/images/custom/image1.jpg",
    summary: "Description text",
    button: "Learn More"
  }
];

<Carousel 
  slides={customSlides}
  onSlideClick={handleSlideClick}
/>
```

## 🛠️ Customization Options

### Adding New Leadership Members:
1. Add new image to `/public/images/leadership/`
2. Update `leadershipData` array in `leadership-carousel.jsx`
3. Follow the existing data structure

### Styling Customization:
- Modify Tailwind classes in components
- Update color schemes using CSS variables
- Adjust animation timings and effects
- Customize modal layouts and spacing

### Functionality Extensions:
- Add social media links
- Include video backgrounds
- Implement external profile links
- Add filtering/search capabilities

## 📱 Responsive Behavior

- **Mobile (< 768px)**: Single column layout, touch-friendly controls
- **Tablet (768px - 1024px)**: Optimized spacing and typography
- **Desktop (> 1024px)**: Full feature set with hover effects

## 🔧 Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install lucide-react
   ```

2. **Add Images**:
   - Place leadership images in `/public/images/leadership/`
   - Follow naming convention: `role-name.jpg`

3. **Import Components**:
   ```jsx
   import LeadershipCarousel from '@/components/ui/leadership-carousel';
   ```

4. **Configure Tailwind** (if needed):
   - Ensure all custom classes are available
   - Add any missing color schemes

## 🎯 Demo Page

Visit `/carousel-demo` to see the leadership carousel in action with:
- Full leadership team showcase
- Interactive modal demonstrations
- Responsive design examples
- Open positions information

## 🔄 Migration from API-based to Static

### Changes Made:
1. **Data Source**: Moved from API calls to static data array
2. **Image Paths**: Using `/public` directory instead of external URLs
3. **Error Handling**: Added image fallbacks for missing files
4. **Performance**: Improved loading with Next.js Image optimization
5. **Maintainability**: Easier to update team information

### Benefits:
- **Faster Loading**: No API calls required
- **Offline Support**: Works without internet connection
- **Better SEO**: Images are properly indexed
- **Easy Maintenance**: Direct file management
- **Cost Effective**: No external image hosting needed

## 🚧 Future Enhancements

- [ ] Add video backgrounds for leadership profiles
- [ ] Implement lazy loading for large image sets
- [ ] Add social media integration
- [ ] Create admin interface for easy updates
- [ ] Add multilingual support
- [ ] Implement image optimization pipeline
- [ ] Add accessibility improvements (ARIA labels, screen reader support)

## 🐛 Troubleshooting

### Common Issues:

1. **Images Not Loading**:
   - Check file paths in `/public/images/leadership/`
   - Verify image file names match data structure
   - Ensure images are web-compatible formats

2. **Styling Issues**:
   - Confirm Tailwind CSS is properly configured
   - Check for missing custom CSS classes
   - Verify color variables are defined

3. **Navigation Problems**:
   - Ensure slide data array has proper structure
   - Check for JavaScript errors in console
   - Verify click handlers are properly bound

### Debug Mode:
Add `console.log` statements to track:
- Slide data loading
- Image loading status
- Click event handling
- Modal state changes

This implementation provides a robust, scalable solution for showcasing leadership teams with modern web technologies and best practices.
