const headerMenuItems = [
  {
    label: 'Shop',
    href: '/products/',
    direct: true,
  },
  {
    label: 'categories',
    href: '/products',
    megaMenu: true,
    items: [
      {
        title: 'Product Categories',
        items: [
          {
            label: 'Hybrid Vehicles',
            href: '/products/hybrid-vehicles',
          },
          {
            label: 'EV Vehicles',
            href: '/products/ev-vehicles',
          },
          {
            label: 'Gasoline Vehicles',
            href: '/products/gasoline-vehicles',
          },
        ],
      },
      {
        title: 'Car Accessories',
        items: [
          {
            label: 'Exterior Accessories',
            href: '/parts/exterior-accessories',
          },
          {
            label: 'Interior Accessories',
            href: '/parts/interior-accessories',
          },
          {
            label: 'Drivetrain',
            href: '/parts/drivetrain',
          },
          {
            label: 'Suspension',
            href: '/parts/suspension',
          },
          {
            label: 'Braking System',
            href: '/parts/braking-system',
          },
        ],
      },
      {
        title: 'Car Care Products & Care Accessories',
        items: [
          {
            label: 'Car Wash & Detailing Products',
            href: '/car-care/car-wash-detailing',
          },
          {
            label: 'Cleaning Tools',
            href: '/car-care/cleaning-tools',
          },
          {
            label: 'Protective Coatings',
            href: '/car-care/protective-coatings',
          },
          {
            label: 'Maintenance & Repair Kits',
            href: '/car-care/maintenance-kits',
          },
        ],
      },
      {
        title: 'Tools & Equipment',
        items: [
          {
            label: 'Automotive Tools',
            href: '/tools/automotive-tools',
          },
          {
            label: 'Garage Equipment',
            href: '/tools/garage-equipment',
          },
          {
            label: 'Specialty Tools',
            href: '/tools/specialty-tools',
          },
        ],
      },
      {
        title: 'Customization & Styling',
        items: [
          {
            label: 'Exterior Enhancements',
            href: '/customization/exterior-enhancements',
          },
          {
            label: 'Wheels & Rims',
            href: '/customization/wheels-rims',
          },
          {
            label: 'Interior Upgrades',
            href: '/customization/interior-upgrades',
          },
        ],
      },
      {
        title: 'Electric Vehicle (EV) Essentials',
        items: [
          {
            label: 'Charging Stations',
            href: '/ev-essentials/charging-stations',
          },
          {
            label: 'Battery Upgrades',
            href: '/ev-essentials/battery-upgrades',
          },
          {
            label: 'EV Accessories',
            href: '/ev-essentials/ev-accessories',
          },
        ],
      },
    ],
  },

  {
    label: 'Blog',
    href: '/blog',
    megaMenu: true,
    items: [
      {
        title: 'Automotive Insights',
        items: [
          {
            label: 'Electric Vehicles',
            href: '/blog/automotive-insights/electric-vehicles',
          },
          {
            label: 'Hybrid Innovations',
            href: '/blog/automotive-insights/hybrid-innovations',
          },
          {
            label: 'SUVs & Off-Roading',
            href: '/blog/automotive-insights/suvs-off-roading',
          },
          {
            label: 'Motorcycle Culture',
            href: '/blog/automotive-insights/motorcycle-culture',
          },
          {
            label: 'Classic & Vintage Cars',
            href: '/blog/automotive-insights/classic-vintage-cars',
          },
        ],
      },
      {
        title: 'Maintenance & Tips',
        items: [
          { label: 'Maintenance Tips', href: '/blog/maintenance-tips' },
          { label: 'DIY Repairs', href: '/blog/diy-repairs' },
          { label: 'Fuel Efficiency', href: '/blog/fuel-efficiency' },
          { label: 'Seasonal Care', href: '/blog/seasonal-care' },
        ],
      },
      {
        title: 'Industry News',
        items: [
          { label: 'Automotive News', href: '/blog/automotive-news' },
          { label: 'New Releases', href: '/blog/new-releases' },
          { label: 'Industry Trends', href: '/blog/industry-trends' },
          { label: 'Regulations', href: '/blog/regulations' },
        ],
      },
      {
        title: 'Guides & Reviews',
        items: [
          { label: 'Buying Guides', href: '/blog/buying-guides' },
          { label: 'Product Reviews', href: '/blog/product-reviews' },
          { label: 'Test Drives', href: '/blog/test-drives' },
          { label: 'Comparison Articles', href: '/blog/comparison-articles' },
        ],
      },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    subItems: [
      { label: 'Vehicle Diagnostics', href: '/services/diagnostics' },
      { label: 'Car Repair', href: '/services/repair' },
      { label: 'Maintenance Packages', href: '/services/maintenance' },
      { label: 'Custom Upgrades', href: '/services/upgrades' },
    ],
  },
  {
    label: 'About Us',
    href: '/about',
    subItems: [
      { label: 'Our Story', href: '/about/our-story' },
      { label: 'Team', href: '/about/team' },
      { label: 'Careers', href: '/about/careers' },
      { label: 'Testimonials', href: '/about/testimonials' },
    ],
  },
  {
    label: 'Contact',
    href: '/contact',
    subItems: [
      { label: 'Customer Support', href: '/customer-support' },
      { label: 'Sales', href: '/contact/sales' },
      { label: 'Partnerships', href: '/contact/partnerships' },
      { label: 'Feedback', href: '/feedback' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

export default headerMenuItems;
