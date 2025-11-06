import express from 'express';
const router = express.Router();
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

const hashData = (data) => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
};

const sendEventToFacebook = async (eventData) => {
  const accessToken = process.env.FACEBOOK_SEC;
  const datasetID = process.env.DATASET_ID;
  const url = `https://graph.facebook.com/v12.0/${datasetID}/events?access_token=${accessToken}`;

  try {
    await axios.post(url, { data: [eventData] });
  } catch (error) {
    console.error('Error sending event to Facebook:', error.response ? error.response.data : error.message);
  }
};
const getUserData = (req) => {
  const userData = {};

  if (req.ip) {
    userData.client_ip_address = req.ip;
  }

  if (req.get('User-Agent')) {
    userData.client_user_agent = req.get('User-Agent');
  }

  if (req.body.email) {
    userData.em = hashData(req.body.email);
  }

  if (req.body.fullName) {
    userData.fn = hashData(req.body.fullName);
  }

  if (req.body.phone) {
    userData.ph = hashData(req.body.phone);
  }

  if (req.body.userId) {
    userData.external_id = hashData(req.body.userId);
  }

  if (req.body.gender) {
    userData.ge = hashData(req.body.gender);
  }

  if (req.body.fbc) {
    userData.fbc = req.body.fbc;
  }

  return userData;
};


const generateEventId = () => {
  return uuidv4();
};

const getPageDetails = (req) => {
  return {
    page_title: req.body.page_title,
    page_path: req.body.page_path,
    page_url: req.body.page_url,
  };
};
// Page View Event<>
router.post('/page-view', (req, res) => {
  const userData = getUserData(req);
  const pageDetails = getPageDetails(req);
  const eventData = {
    event_name: 'PageView',
    event_time: Math.floor(new Date() / 1000),
    event_id: generateEventId(),
    user_data: userData,
    action_source: 'website',
    custom_data: pageDetails,
    };
  sendEventToFacebook(eventData);
  res.status(200).send('PageView event tracked successfully');
});
//page view Event</>

// Add to Cart Event<>
router.post('/add-to-cart', (req, res) => {
  const userData = getUserData(req);

  const customData = {
    currency: 'KWD',
    value: req.body.value,
    content_name: req.body.contentName,
    content_category: req.body.contentCategory,
    content_ids: [req.body.contentId],
    contents: req.body.contents,
  };

  const eventData = {
    event_name: 'AddToCart',
    event_time: Math.floor(new Date() / 1000),
    event_id: generateEventId(),
    user_data: userData,
    custom_data: customData,
    action_source: 'website'
  };
  sendEventToFacebook(eventData);
  res.status(200).send('AddToCart event tracked successfully');
});
// Add to Cart Event</>

// Purchase Event <>
router.post('/purchase', (req, res) => {
  const userData = getUserData(req);
  const customData = {
    currency: 'KWD',
    value: req.body.value,
    content_name: req.body.contentName,
    content_category: req.body.contentCategory,
    content_ids: [req.body.contentId],
    contents: [
      {
        id: req.body.contentId,
        quantity: req.body.quantity,
        item_price: req.body.itemPrice
      }
    ],
  };
  const eventData = {
    event_name: 'Purchase',
    event_time: Math.floor(new Date() / 1000),
    event_id: generateEventId(),
    user_data: userData,
    custom_data: customData,
    action_source: 'website'
  };
  sendEventToFacebook(eventData);
  res.status(200).send('Purchase event tracked successfully');
});
// Purchase Event</>

// Registration Event<>
router.post('/registration', (req, res) => {
  const userData = getUserData(req);
  const eventData = {
    event_name: 'CompleteRegistration',
    event_time: Math.floor(new Date() / 1000),
    event_id: generateEventId(),
    user_data: userData,
    action_source: 'website',
  };
  sendEventToFacebook(eventData);
  res.status(200).send('Registration event tracked successfully');
});
// Registration Event</>
// Add to Wishlist Event<>
router.post('/add-to-wishlist', (req, res) => {
  const userData = getUserData(req);
  const customData = {
    currency: 'KWD',
    value: req.body.value,
    content_name: req.body.contentName,
    content_category: req.body.contentCategory,
    content_ids: req.body.contentId,
    contents: req.body.contents,
  };

  const eventData = {
    event_name: 'AddToWishlist',
    event_time: Math.floor(new Date() / 1000),
    event_id: generateEventId(),
    user_data: userData,
    custom_data: customData,
    action_source: 'website'
  };
  sendEventToFacebook(eventData);
  res.status(200).send('AddToWishlist event tracked successfully');
});
// Add to Wishlist Event</>
// Customize Product Event<>
router.post('/customize-product', (req, res) => {
  const userData = getUserData(req);

  const customData = {
    currency: 'KWD',
    value: req.body.value,
    content_name: req.body.contentName,
    content_category: req.body.contentCategory,
    content_ids: req.body.contentId,
    contents: req.body.contents,
    customization_details: req.body.customizationDetails
  };

  const eventData = {
    event_name: 'CustomizeProduct',
    event_time: Math.floor(new Date() / 1000),
    event_id: generateEventId(),
    user_data: userData,
    custom_data: customData,
    action_source: 'website'
  };
  sendEventToFacebook(eventData);
  res.status(200).send('CustomizeProduct event tracked successfully');
});
// Customize Product Event</>

  export default router;
