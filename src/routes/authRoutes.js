const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (await User.findOne({ where: { email } })) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const user = await User.create({ name, email, password, role });
    user.password = undefined;

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.json({ user, token });
  } catch (err) {
    return res.status(400).json({ error: 'Falha no registro' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    if (!await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    user.password = undefined;

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.json({ user, token });
  } catch (err) {
    return res.status(400).json({ error: 'Falha no login' });
  }
});

module.exports = router;
