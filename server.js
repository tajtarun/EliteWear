function normalizeOrderItem(item) {
  return {
    name: item?.name || item?.product_name || "Product",
    size: item?.size || item?.product_size || "Not provided",
    qty: Math.max(1, Number(item?.qty || 1)),
    price: Number(item?.price || item?.product_price || 0)
  };
}

async function sendOrderEmail({ user, items, total, paymentMethod }) {
  if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL || !process.env.RECEIVER_EMAIL) {
    throw new Error("Order email is not configured on server (Brevo env vars missing)");
  }

  const listRows = items
    .map((item) => `<li><strong>${htmlEscape(item.name)}</strong> — Size: ${htmlEscape(item.size)}</li>`)
    .join("");

  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "EliteWear",
        email: process.env.SENDER_EMAIL,
      },
      to: [{ email: process.env.RECEIVER_EMAIL }],
      subject: "🛒 New EliteWear Order",
      htmlContent: `
        <div style="font-family:Arial;padding:20px;">
          <h2>New Order Received</h2>
          <p><strong>Name:</strong> ${htmlEscape(user.name)}</p>
          <p><strong>Email:</strong> ${htmlEscape(user.email)}</p>
          <p><strong>Phone:</strong> ${htmlEscape(user.phone)}</p>
          <p><strong>Address:</strong> ${htmlEscape(user.address)}</p>
          <p><strong>Payment:</strong> ${htmlEscape(paymentMethod || "Not specified")}</p>
          <p><strong>Total:</strong> ₹${htmlEscape(total)}</p>
          <h3>Products</h3>
          <ul>${listRows}</ul>
        </div>
      `,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
}

// ======================================================
// ==================== ORDER ROUTE =====================
// ======================================================

app.post("/order", async (req, res) => {
  try {
    const { user, cart, total, payment_method } = req.body || {};

    if (!user || !Array.isArray(cart) || cart.length === 0 || !Number(total)) {
      return res.status(400).json({ success: false, message: "Invalid order payload" });
    }

    const { name, email, phone, address } = user;
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ success: false, message: "Missing user fields" });
    }

    const normalizedCart = cart.map(normalizeOrderItem);

    await sendOrderEmail({
      user: { name, email, phone, address },
      items: normalizedCart,
      total: Number(total),
      paymentMethod: payment_method || "Not specified"
    });

    ensureOrdersFile();

    const orderRecord = appendOrderToWorkbook({ user, cart: normalizedCart, total, payment_method });

    const row = [
      orderRecord.order_id,
      orderRecord.user_id,
      orderRecord.created_at,
      name,
      email,
      phone,
      address,
      Number(total),
      normalizedCart.length,
      payment_method || "Not specified",
      JSON.stringify(normalizedCart)
    ].map(csvEscape).join(",") + "\n";

    fs.appendFileSync(ORDERS_FILE, row, "utf8");

    res.json({ success: true, order_id: orderRecord.order_id });
  } catch (error) {
    console.error("Order Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Order not placed. Email send failed or server issue." });
  }
});
