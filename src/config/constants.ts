export const BUSINESS_HOURS = {
  inStock: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    hours: {
      start: '9:00 AM',
      end: '5:00 PM'
    }
  },
  madeToOrder: {
    orderDeadline: {
      day: 'Wednesday',
      time: '6:00 PM'
    },
    pickup: {
      day: 'Saturday',
      hours: {
        start: '9:00 AM',
        end: '5:00 PM'
      }
    }
  }
};

export const DIETARY_OPTIONS = [
  { id: "vegan", label: "Vegan", icon: "Vegan" },
  { id: "glutenFree", label: "Gluten Free", icon: "WheatOff" },
  { id: "dairyFree", label: "Dairy Free", icon: "MilkOff" },
  { id: "nutFree", label: "Nut Free", icon: "EggOff" },
  { id: "halal", label: "Halal", icon: "halalwhite.jpg" }
];

export const STORAGE_KEYS = {
  menuItems: 'menu-items',
  dietaryRestrictions: 'dietary-restrictions',
  menuCategories: 'menu-categories'
}; 