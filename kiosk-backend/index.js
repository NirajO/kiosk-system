
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./db');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/menu", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM MenuItems");
    if (Array.isArray(rows)) {
      const formattedRows = rows.map((item) => ({
        ...item,
        price: Number(item.price),
      }));
      res.json(formattedRows);
    } else {
      res.status(500).json({ error: "Data format is incorrect" });
    }
  } catch (err) {
    console.error("Error fetching menu:", err.message);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

app.post('/place-order', async (req, res) => {
  const { name, phone, cart } = req.body;

  if (!name || !phone || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Name, phone, and cart are required.' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [customerResult] = await connection.execute(
      'INSERT INTO Customers (name, phone) VALUES (?, ?)',
      [name, phone]
    );
    const customerId = customerResult.insertId;

    const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    console.log("Calculated totalPrice:", totalPrice);

    const [orderResult] = await connection.execute(
      'INSERT INTO Orders (CustomerId, TotalPrice) VALUES (?, ?)',
      [customerId, totalPrice]
    );
    const orderId = orderResult.insertId;

    for (const item of cart) {
      await connection.execute(
        'INSERT INTO OrderItems (OrderId, MenuItemId, Quantity, LineTotal) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, Number(item.price) * item.quantity]
      );
    }

    await connection.commit();
    res.json({ success: true, orderId });
  } catch (err) {
    await connection.rollback();
    console.error('Order failed:', err.message);
    res.status(500).json({ success: false, message: 'Server error', details: err.message });
  } finally {
    connection.release();
  }
});

app.get('/latest-order/:orderId', async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  console.log("Received orderId:", orderId);
  if (isNaN(orderId)) {
    console.log("Invalid orderId:", req.params.orderId);
    return res.status(400).json({ error: "Invalid orderId" });
  }

  try {
    console.log("Executing order query...");
    const [orderRows] = await pool.query(
      `SELECT o.id AS orderId, o.TotalPrice AS total, 
              c.name, c.phone
       FROM Orders o
       JOIN Customers c ON o.CustomerId = c.id
       WHERE o.id = ?`,
      [orderId]
    );
    console.log("Order query result:", orderRows);

    console.log("Executing items query...");
    const [itemRows] = await pool.query(
      `SELECT mi.name, mi.price, oi.Quantity AS quantity
       FROM OrderItems oi
       JOIN MenuItems mi ON oi.MenuItemId = mi.id
       WHERE oi.OrderId = ?`,
      [orderId]
    );
    console.log("Items query result:", itemRows);

    if (orderRows.length === 0) {
      console.log("Order not found for orderId:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("Type of total:", typeof orderRows[0].total);
    console.log("Value of total:", orderRows[0].total);

    const totalValue = orderRows[0].total != null ? Number(orderRows[0].total) : 0;
    console.log("Converted totalValue:", totalValue);

    const order = {
      orderNumber: orderRows[0].orderId,
      name: orderRows[0].name,
      phone: orderRows[0].phone,
      timestamp: new Date().toISOString(),
      total: totalValue.toFixed(2),
      cart: itemRows.map((item) => ({
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
    };
    console.log("Returning order:", order);

    res.json(order);
  } catch (err) {
    console.error("Error fetching latest order:", err.message);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});