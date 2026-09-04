import 'dotenv/config';
import express from 'express';
import { synthesize } from './tts.js';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const orders = {
  '4471': { id: 'AB4471Z', address: '221B Baker Street', status: 'Out for delivery' }
};

app.post('/api/speak-order', async (req, res) => {
  try {
    const { orderNumber } = req.body;
    const order = orders[orderNumber];
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const spokenText = `Your order ${order.id.split('').join(', ')} is currently: ${order.status}. It will be delivered to ${order.address}.`;

    const audioBuffer = await synthesize(spokenText);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));