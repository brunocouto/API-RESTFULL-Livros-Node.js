const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/livros', bookRoutes);
app.use('/compras', purchaseRoutes);
app.use('/pagamentos', paymentRoutes);

const PORT = process.env.PORT || 3000;

// Configurar associações entre modelos
const Book = require('./models/Book');
const Purchase = require('./models/Purchase');
const Payment = require('./models/Payment');

Purchase.belongsTo(Book, { foreignKey: 'bookId' });
Payment.belongsTo(Purchase, { foreignKey: 'purchaseId' });
Purchase.hasOne(Payment, { foreignKey: 'purchaseId' });

db.sync().then(() => {
  console.log('Database connected and synchronized');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error connecting to database:', err);
});
