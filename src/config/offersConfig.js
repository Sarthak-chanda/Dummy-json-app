/**
 * Centralized configuration for all marketing offers and banners.
 * Defines the content, imagery, and filtering logic for each campaign.
 */

export const offersConfig = [
  {
    id: "new-arrivals",
    title: "New Season Arrivals",
    subtitle: "Discover the latest trends in modern fashion and lifestyle essentials.",
    images: {
      desktop: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
      mobile: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"
    },
    gradient: "rgba(15, 23, 42, 0.95)",
    cta: "Explore Now",
    badge: "New",
    filterRule: (product) => ["womens-dresses", "womens-shoes", "mens-shirts", "mens-shoes", "tops", "womens-bags"].includes(product.category)
  },
  {
    id: "summer-sale",
    title: "Summer Sale is Live!",
    subtitle: "Get up to 50% off on all seasonal fashion and accessories.",
    images: {
      desktop: "https://images.pexels.com/photos/5868272/pexels-photo-5868272.jpeg?auto=compress&cs=tinysrgb&w=1600",
      mobile: "https://images.pexels.com/photos/5868272/pexels-photo-5868272.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    gradient: "rgba(69, 10, 10, 0.95)",
    cta: "Get the Deal",
    badge: "Sale",
    filterRule: (product) => product.discountPercentage >= 15
  },
  {
    id: "tech-gadgets",
    title: "Next-Gen Tech",
    subtitle: "Explore the latest smartphones and gadgets from top brands.",
    images: {
      desktop: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
      mobile: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80"
    },
    gradient: "rgba(2, 6, 23, 0.95)",
    cta: "Upgrade Now",
    badge: "Tech",
    filterRule: (product) => ["smartphones", "laptops", "tablets", "mobile-accessories"].includes(product.category)
  },
  {
    id: "beauty-wellness",
    title: "Beauty & Wellness",
    subtitle: "Premium skincare and fragrances to elevate your daily routine.",
    images: {
      desktop: "https://images.pexels.com/photos/3762882/pexels-photo-3762882.jpeg?auto=compress&cs=tinysrgb&w=1600",
      mobile: "https://images.pexels.com/photos/3762882/pexels-photo-3762882.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    gradient: "rgba(45, 27, 45, 0.95)",
    cta: "Shop Beauty",
    badge: "Wellness",
    filterRule: (product) => ["skincare", "fragrances", "beauty"].includes(product.category)
  },
  {
    id: "home-essentials",
    title: "Home Essentials",
    subtitle: "Create your perfect space with modern decor and furniture.",
    images: {
      desktop: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600",
      mobile: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    gradient: "rgba(42, 33, 24, 0.95)",
    cta: "Redecorate Now",
    badge: "Home",
    filterRule: (product) => ["furniture", "home-decoration", "kitchen-accessories"].includes(product.category)
  },
  {
    id: "outdoor-adventures",
    title: "Outdoor Adventures",
    subtitle: "Gear up for your next journey with our sports collection.",
    images: {
      desktop: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=80",
      mobile: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80"
    },
    gradient: "rgba(6, 33, 24, 0.95)",
    cta: "Get Ready",
    badge: "Sports",
    filterRule: (product) => ["sports-accessories", "sunglasses", "mens-shoes", "mens-watches"].includes(product.category)
  },
  {
    id: "highly-rated",
    title: "Highly Rated",
    subtitle: "Top products loved by our community with 4.5+ stars.",
    images: {
      desktop: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      mobile: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
    },
    gradient: "rgba(15, 23, 42, 0.95)",
    cta: "View Best Sellers",
    badge: "Community",
    filterRule: (product) => product.rating >= 4.5
  },
  {
    id: "exclusive-perks",
    title: "Exclusive Perks",
    subtitle: "Join our rewards program for early access to sales.",
    images: {
      desktop: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
      mobile: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80"
    },
    gradient: "rgba(2, 6, 23, 0.95)",
    cta: "Learn More",
    badge: "Rewards",
    filterRule: (product) => product.discountPercentage >= 15
  },
  {
    id: "self-care-sunday",
    title: "Self-Care Sunday",
    subtitle: "Premium beauty and wellness essentials for your routine.",
    images: {
      desktop: "https://images.unsplash.com/photo-1540555700478-4be289fbecee?auto=format&fit=crop&w=1200&q=80",
      mobile: "https://images.unsplash.com/photo-1540555700478-4be289fbecee?auto=format&fit=crop&w=800&q=80"
    },
    gradient: "rgba(17, 24, 39, 0.95)",
    cta: "Shop Beauty",
    badge: "Wellness",
    filterRule: (product) => ["skincare", "fragrances", "beauty"].includes(product.category)
  }
];