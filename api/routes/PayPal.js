// import express from 'express';
// import paypal from 'paypal-rest-sdk';
// import CustomerOrders from '../models/Order.js'; 

// const router = express.Router();

// // PayPal configuration
// paypal.configure({
//   'mode': process.env.PAYPAL_MODE, // 'sandbox' or 'live'
//   'client_id': process.env.PAYPAL_CLIENT_ID,
//   'client_secret': process.env.PAYPAL_CLIENT_SECRET
// });

// // Create payment route
// router.post('/create-payment', async (req, res) => {
//   const { amount, productId, productName, customerId, totalQuentity, productPrice, totalPrice, Discount, grandTotal, colorOfQuentity, areaName, block, gidda, street, houseNo, floorNo, appartment, fullname, mobilenumber, email, preferredTime, paymentMethod} = req.body;
//   const create_payment_json = {
//     "intent": "sale",
//     "payer": {
//       "payment_method": "paypal"
//     },
//     "redirect_urls": {
//       "return_url": "http://localhost:3000/success",
//       "cancel_url": "http://localhost:3000/cancel"
//     },
//     "transactions": [{
//       "item_list": {
//         "items": [{
//           "name": productName,
//           "sku": productId,
//           "price": grandTotal.toFixed(2),
//           "currency": "KWD",
//           "quantity": totalQuentity
//         }]
//       },
//       "amount": {
//         "currency": "USD",
//         "total": grandTotal.toFixed(2)
//       },
//       "description": "This is the payment description."
//     }]
//   };

//   try {
//     const payment = await paypal.payment.create(create_payment_json);
//     for (let link of payment.links) {
//       if (link.rel === 'approval_url') {
//         // Save the order in Pending status
//         const newOrder = new CustomerOrders({
//           productId, productName, customerId, totalQuentity, productPrice, totalPrice, Discount, grandTotal, colorOfQuentity, areaName, block, gidda, street, houseNo, floorNo, appartment, fullname, mobilenumber, email, preferredTime, orderStatus: 'Pending', paymentMethod: 'PayPal'
//         });
//         await newOrder.save();

//         res.json({ forwardLink: link.href });
//       }
//     }
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// // Execute payment route
// router.post('/execute-payment', async (req, res) => {
//   const { paymentID, payerID, orderId } = req.body;
//   const execute_payment_json = {
//     "payer_id": payerID,
//     "transactions": [{
//       "amount": {
//         "currency": "USD",
//         "total": grandTotal.toFixed(2)
//       }
//     }]
//   };

//   try {
//     const payment = await paypal.payment.execute(paymentID, execute_payment_json);
//     const payerInfo = payment.payer.payer_info;

//     // Update the order status to Completed
//     await CustomerOrders.findByIdAndUpdate(orderId, {
//       orderStatus: 'Completed',
//       payerID,
//       paymentID,
//       paymentStatus: payment.state,
//       payerInfo
//     });

//     res.json(payment);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// export default router;
