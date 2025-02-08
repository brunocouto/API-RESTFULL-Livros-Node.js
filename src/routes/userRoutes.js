const express = require('express');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');
const { authMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Atualizar usuário
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = req.params.id;

        // Verifica se o usuário está tentando atualizar seu próprio perfil
        if (req.userId != userId) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        await user.update(updateData);
        user.password = undefined;

        return res.json(user);
    } catch (err) {
        return res.status(400).json({ error: 'Erro ao atualizar usuário' });
    }
});

// Obter dados do usuário
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        user.password = undefined;
        return res.json(user);
    } catch (err) {
        return res.status(400).json({ error: 'Erro ao buscar dados do usuário' });
    }
});

// Deletar usuário
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;

        // Verifica se o usuário está tentando deletar seu próprio perfil
        if (req.userId != userId) {
            return res.status(403).json({ error: 'Não autorizado' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Encontra todas as compras do usuário
        const purchases = await Purchase.findAll({
            where: { userId: userId }
        });

        // Deleta todos os pagamentos relacionados às compras
        for (const purchase of purchases) {
            await Payment.destroy({
                where: { purchaseId: purchase.id }
            });
        }

        // Deleta todas as compras do usuário
        await Purchase.destroy({
            where: { userId: userId }
        });

        // Finalmente, deleta o usuário
        await user.destroy();

        return res.status(204).send();
    } catch (err) {
        return res.status(400).json({ error: 'Erro ao deletar usuário' });
    }
});

module.exports = router;
