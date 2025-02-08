const express = require('express');
const Purchase = require('../models/Purchase');
const Book = require('../models/Book');
const Payment = require('../models/Payment');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { bookId, quantity } = req.body;
        const userId = req.userId;

        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        if (book.stockQuantity < quantity) {
            return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
        }

        const totalPrice = book.price * quantity;

        const purchase = await Purchase.create({
            userId,
            bookId,
            quantity,
            totalPrice,
            status: 'pendente'
        });

        // Atualiza o estoque
        book.stockQuantity -= quantity;
        await book.save();

        return res.status(201).json(purchase);
    } catch (err) {
        return res.status(400).json({ error: 'Erro ao realizar compra' });
    }
});

// Listar todas as compras do usuário com status do pagamento
router.get('/', authMiddleware, async (req, res) => {
    try {
        const purchases = await Purchase.findAll({
            where: { userId: req.userId },
            include: [
                { 
                    model: Book,
                    attributes: ['title', 'author', 'price']
                },
                {
                    model: Payment,
                    attributes: ['status', 'paymentMethod', 'amount']
                }
            ]
        });
        return res.json(purchases);
    } catch (err) {
        return res.status(400).json({ error: 'Erro ao buscar compras' });
    }
});

// Buscar uma compra específica
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const purchase = await Purchase.findOne({
            where: { 
                id: req.params.id,
                userId: req.userId
            },
            include: [
                { 
                    model: Book,
                    attributes: ['title', 'author', 'price']
                },
                {
                    model: Payment,
                    attributes: ['status', 'paymentMethod', 'amount']
                }
            ]
        });

        if (!purchase) {
            return res.status(404).json({ error: 'Compra não encontrada' });
        }

        return res.json(purchase);
    } catch (err) {
        return res.status(400).json({ error: 'Erro ao buscar compra' });
    }
});

// Deletar uma compra
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const purchase = await Purchase.findOne({
            where: { 
                id: req.params.id,
                userId: req.userId
            },
            include: [{ model: Book }]
        });

        if (!purchase) {
            return res.status(404).json({ error: 'Compra não encontrada' });
        }

        // Verifica se a compra já foi paga
        const payment = await Payment.findOne({
            where: { purchaseId: purchase.id }
        });

        if (payment && payment.status === 'pago') {
            return res.status(400).json({ error: 'Não é possível cancelar uma compra já paga' });
        }

        // Se houver pagamento pendente, deleta o pagamento
        if (payment) {
            await payment.destroy();
        }

        // Devolve os itens ao estoque
        const book = purchase.Book;
        book.stockQuantity += purchase.quantity;
        await book.save();

        // Deleta a compra
        await purchase.destroy();

        return res.status(204).send();
    } catch (err) {
        return res.status(400).json({ error: 'Erro ao deletar compra' });
    }
});

module.exports = router;
