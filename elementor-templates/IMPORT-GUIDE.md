# Next Generation Analysts - Elementor Template Import Guide

## How to Import

1. Go to your WordPress dashboard
2. Navigate to **Templates > Saved Templates**
3. Click **Import Templates** at the top
4. Select `next-gen-analysts-homepage.json`
5. Click **Import Now**
6. Create a new page, click **Edit with Elementor**
7. Click the folder icon (Template Library) > **My Templates**
8. Insert the imported template

## Images to Upload

Before importing, upload these images to your Media Library at the paths referenced in the template:

### Hero
- `/wp-content/uploads/hero-business-analysis.jpg` - Hero section image
- `/wp-content/uploads/trust-avatars-group.png` - Overlapping avatar circles

### Logos (carousel)
- `/wp-content/uploads/logos/barclays.png`
- `/wp-content/uploads/logos/microsoft.png`
- `/wp-content/uploads/logos/lloyds.png`
- `/wp-content/uploads/logos/pwc.png`
- `/wp-content/uploads/logos/deloitte.png`
- `/wp-content/uploads/logos/capgemini.png`
- `/wp-content/uploads/logos/bt.png`
- `/wp-content/uploads/logos/natwest.png`

### Course Cards
- `/wp-content/uploads/courses/business-analysis.jpg`
- `/wp-content/uploads/courses/project-management.jpg`
- `/wp-content/uploads/courses/data-analysis.jpg`
- `/wp-content/uploads/courses/self-paced-ba.jpg`
- `/wp-content/uploads/courses/ba-interview-prep.jpg`
- `/wp-content/uploads/courses/da-interview-prep.jpg`

### Testimonial Avatars
- `/wp-content/uploads/testimonials/kelvin.jpg`
- `/wp-content/uploads/testimonials/victoria.jpg`
- `/wp-content/uploads/testimonials/daniel.jpg`

### Branding
- `/wp-content/uploads/logo-dark.png` - Footer logo

## Post-Import Adjustments

After importing, you'll want to:

1. **Replace image placeholders** - Click each image widget and select your actual uploaded images
2. **Set up the navigation menu** - Create a WordPress menu called `primary-menu` with: Home, Courses, Resources, Case Studies, About Us
3. **Update links** - Replace placeholder URLs (`/courses`, `/contact`, etc.) with your actual page URLs
4. **Configure the newsletter form** - Connect the form widget to your email marketing service (Mailchimp, etc.)
5. **Social media links** - Update the `#` placeholder URLs in the footer social icons

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary Dark Green | `#1B4D3E` | Header, dark sections, icons |
| Accent Yellow | `#F5A623` | CTAs, highlighted text, stars, prices |
| Body Text | `#1B2A1D` | Headings |
| Secondary Text | `#555555` / `#777777` | Body copy, descriptions |
| Light Background | `#FAFAFA` | Alternating section backgrounds |
| Border | `#E8E8E8` | Card borders, dividers |
| Font Family | Inter | All text |

## Template Sections

1. **Header** - Dark green navbar
2. **Hero** - Split layout with headline + image
3. **Logo Carousel** - Company logos slider
4. **What We Offer** - 6 course cards grid
5. **Why Next Gen Analysts** - 3 value propositions on dark background
6. **Who This Is For** - 4 persona columns
7. **Success Stories** - 3 testimonial cards
8. **FAQ** - 2-column accordion
9. **CTA Banner** - Call-back request
10. **Footer** - 4-column footer with newsletter form
11. **Bottom Bar** - Copyright + legal links
