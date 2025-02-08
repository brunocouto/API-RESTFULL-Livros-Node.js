const express = require('express');
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { purchaseId, paymentMethod } = req.body;

    const purchase = await Purchase.findOne({
      where: { 
        id: purchaseId,
        userId: req.userId,
        status: 'pendente'
      }
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Compra não encontrada ou já processada' });
    }

    const payment = await Payment.create({
      purchaseId,
      paymentMethod,
      amount: purchase.totalPrice,
      status: 'pendente'
    });

    // Simula processamento do pagamento
    // Em um ambiente real, aqui seria integrado com um gateway de pagamento
    payment.status = 'pago';
    await payment.save();

    // Atualiza status da compra
    purchase.status = 'processada';
    await purchase.save();

    return res.status(201).json(payment);
  } catch (err) {
    return res.status(400).json({ error: 'Erro ao processar pagamento' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{
        model: Purchase,
        where: { userId: req.userId }
      }]
    });
    return res.json(payments);
  } catch (err) {
    return res.status(400).json({ error: 'Erro ao buscar pagamentos' });
  }
});

module.exports = router;
