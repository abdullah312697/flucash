// src/utils/trackEvents.js
import {Altaxios} from '../frontend/Altaxios';

// Helper function to track events
const trackEvent = async (endpoint, data) => {
  try {
   await Altaxios.post(endpoint, data);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Function to track page view
export const trackPageView = (pageData) => {
  trackEvent('/facebook/page-view',pageData);
};

// Function to track add to cart
export const trackAddToCart = (item) => {
  const data = {
    value: item.price,
    contentName: item.name,
    contentCategory: item.category,
    contentId: item.id,
    quantity: item.quantity,
    itemPrice: item.price,
    contents: [
      {
        id: item.id,
        quantity: item.quantity,
        item_price: item.price
      }
    ],
  };

  trackEvent('/facebook/add-to-cart', data);
};

// Function to track purchase
export const trackPurchase = (order) => {
  const data = {
    email: order.email, // Replace with actual user email if available
    fullName: order.fullName, // Replace with actual user first name if available
    phone: order.phone, // Replace with actual user phone if available
    city: order.city,
    value: order.total,
    contentName: order.itemName,
    contentCategory: order.itemCategory,
    contentId: order.itemId,
    quantity: order.quantity,
    itemPrice: order.itemPrice,
    contents: [
      {
        id: order.itemId,
        quantity: order.quantity,
        item_price: order.itemPrice
      }
    ],
  };

  trackEvent('/facebook/purchase', data);
};

// Function to track registration
export const trackRegistration = (user) => {
  const data = {
    email: user.email,
    userId: user.userId,
    fullName: user.fullName,
    gender:user.gender,
    phone: user.phone,
  };

  trackEvent('/facebook/registration', data);
};

// Function to track AddToWishlist event
export const trackAddToWishlist = (product) => {
  const data = {
    value: product.price,
    contentName: product.name,
    contentCategory: product.category,
    contentId: [product.id],
    contents: [{ id: product.id, quantity: product.quantity, item_price: product.price }]
  };
  trackEvent('/facebook/add-to-wishlist', data);
};

// Function to track CustomizeProduct event
export const trackCustomizeProduct = (product) => {
  const data = {
    value: product.price,
    contentName: product.name,
    contentCategory: product.category,
    contentId: [product.id],
    contents: [{ id: product.id, quantity: product.quantity, item_price: product.price }],
    customizationDetails: product.customizationDetails // Example custom data
  };
  trackEvent('/facebook/customize-product', data);
};

