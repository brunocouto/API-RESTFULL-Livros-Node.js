const express = require('express');
const { Op } = require('sequelize');
const Book = require('../models/Book');
const { authMiddleware, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Cadastrar livro (apenas admin)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const book = await Book.create(req.body);
    return res.status(201).json(book);
  } catch (err) {
    return res.status(400).json({ error: 'Erro ao cadastrar livro' });
  }
});

// Buscar livro por ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    return res.json(book);
  } catch (err) {
    return res.status(400).json({ error: 'Erro ao buscar livro' });
  }
});

// Buscar livros com filtros
router.get('/', async (req, res) => {
  try {
    const { nome, dataLancamentoInicio, dataLancamentoFim, genero, precoMin, precoMax } = req.query;
    
    const where = {};
    
    if (nome) {
      where.title = { [Op.like]: `%${nome}%` };
    }
    
    if (dataLancamentoInicio || dataLancamentoFim) {
      where.releaseDate = {};
      if (dataLancamentoInicio) where.releaseDate[Op.gte] = new Date(dataLancamentoInicio);
      if (dataLancamentoFim) where.releaseDate[Op.lte] = new Date(dataLancamentoFim);
    }
    
    if (genero) {
      where.genre = genero;
    }
    
    if (precoMin || precoMax) {
      where.price = {};
      if (precoMin) where.price[Op.gte] = precoMin;
      if (precoMax) where.price[Op.lte] = precoMax;
    }

    const books = await Book.findAll({ where });
    return res.json(books);
  } catch (err) {
    return res.status(400).json({ error: 'Erro ao buscar livros' });
  }
});

// Excluir livro (apenas admin)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    await book.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: 'Erro ao excluir livro' });
  }
});

module.exports = router;
