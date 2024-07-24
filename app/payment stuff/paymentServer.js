/*const express = require('express');
const stripe = require('stripe')('sk_test_51PfqfnEAARmGaBwdJz0T6o5CV2kYhYJMxDhT9BsoqW8eReg7gXabDf4q6mWJJhzqoYbX4I3wtTHIuqZYAPzmrTRZ00sVNs55t5'); // Replace with your actual Stripe secret key
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Amount in cents
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});*/
