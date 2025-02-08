const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchaseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Purchases',
      key: 'id'
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('cartao_credito', 'boleto'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendente', 'pago', 'falhado'),
    defaultValue: 'pendente'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

module.exports = Payment;
