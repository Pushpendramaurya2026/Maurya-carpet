const express = require("express");
const fs = require("fs");
const path = require("path");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = !!process.env.VERCEL;

// ===============================
// MIDDLEWARE
// ===============================
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Main website files
app.use(express.static(__dirname, { maxAge: '1d' }));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// ===============================
// DATA FILES
// ===============================
const ordersFile = path.join(__dirname, "orders.json");
const bookingsFile = path.join(__dirname, "bookings.json");
const enquiriesFile = path.join(__dirname, "enquiries.json");
const customersFile = path.join(__dirname, "customers.json");
const productsFile = path.join(__dirname, "products.json");

// ===============================
// CREATE JSON FILES IF NOT EXISTS
// ===============================
function createFileIfNotExists(file) {
    if (isVercel) return; // Vercel pe file banana mana hai
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "[]", "utf8");
    }
}
createFileIfNotExists(ordersFile);
createFileIfNotExists(bookingsFile);
createFileIfNotExists(enquiriesFile);
createFileIfNotExists(customersFile);
createFileIfNotExists(productsFile);

// ===============================
// HELPER FUNCTIONS
// ===============================
function readData(file) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
        console.error("Error reading file:", file);
        return [];
    }
}
function writeData(file, data) {
    if (isVercel) return; // Vercel pe write karne se crash hota hai
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
        console.error("Write failed", e.message);
    }
}

// =====================================================
// ORDERS
// =====================================================
app.get("/api/orders", (req, res) => {
    const orders = readData(ordersFile);
    res.json(orders);
});
app.post("/api/orders", (req, res) => {
    const orders = readData(ordersFile);
    const order = {
        id: Date.now(),
        name: req.body.name || "",
        phone: req.body.phone || "",
        carpet: req.body.carpet || "",
        size: req.body.size || "",
        quantity: req.body.quantity || 1,
        message: req.body.message || "",
        status: "Pending",
        createdAt: new Date().toISOString()
    };
    orders.push(order);
    writeData(ordersFile, orders);

    const customers = readData(customersFile);
    const existingCustomer = customers.find(c => c.phone && c.phone === order.phone);
    if (order.phone) {
        if (existingCustomer) {
            existingCustomer.name = order.name || existingCustomer.name;
            writeData(customersFile, customers);
        } else {
            customers.push({
                id: Date.now() + 1,
                name: order.name,
                phone: order.phone,
                email: order.email || "",
                address: order.address || "",
                createdAt: new Date().toISOString()
            });
            writeData(customersFile, customers);
        }
    }
    res.json({ success: true, message: "Order placed successfully", order: order });
});
app.delete("/api/orders/:id", (req, res) => {
    let orders = readData(ordersFile);
    const id = String(req.params.id);
    orders = orders.filter(order => String(order.id) !== id);
    writeData(ordersFile, orders);
    res.json({ success: true, message: "Order deleted" });
});
app.put("/api/orders/:id/status", (req, res) => {
    const orders = readData(ordersFile);
    const id = String(req.params.id);
    const order = orders.find(order => String(order.id) === id);
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }
    order.status = req.body.status || "Pending";
    writeData(ordersFile, orders);
    res.json({ success: true, message: "Order status updated", order: order });
});

// =====================================================
// BOOKINGS
// =====================================================
app.get("/api/bookings", (req, res) => {
    const bookings = readData(bookingsFile);
    res.json(bookings);
});
app.post("/api/bookings", (req, res) => {
    const bookings = readData(bookingsFile);
    const booking = {
        id: Date.now(),
        name: req.body.name || "",
        phone: req.body.phone || "",
        carpet: req.body.carpet || "",
        size: req.body.size || "",
        date: req.body.date || "",
        message: req.body.message || "",
        status: "Pending",
        createdAt: new Date().toISOString()
    };
    bookings.push(booking);
    writeData(bookingsFile, bookings);
    res.json({ success: true, message: "Booking submitted successfully", booking: booking });
});
app.delete("/api/bookings/:id", (req, res) => {
    let bookings = readData(bookingsFile);
    const id = String(req.params.id);
    bookings = bookings.filter(booking => String(booking.id) !== id);
    writeData(bookingsFile, bookings);
    res.json({ success: true, message: "Booking deleted" });
});
app.put("/api/bookings/:id/status", (req, res) => {
    const bookings = readData(bookingsFile);
    const id = String(req.params.id);
    const booking = bookings.find(booking => String(booking.id) === id);
    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
    }
    booking.status = req.body.status || "Pending";
    writeData(bookingsFile, bookings);
    res.json({ success: true, message: "Booking status updated", booking: booking });
});

// =====================================================
// ENQUIRIES
// =====================================================
app.get("/api/enquiries", (req, res) => {
    const enquiries = readData(enquiriesFile);
    res.json(enquiries);
});
app.post("/api/enquiries", (req, res) => {
    const enquiries = readData(enquiriesFile);
    const enquiry = {
        id: Date.now(),
        name: req.body.name || "",
        phone: req.body.phone || "",
        carpet: req.body.carpet || "",
        message: req.body.message || "",
        status: "New",
        createdAt: new Date().toISOString()
    };
    enquiries.push(enquiry);
    writeData(enquiriesFile, enquiries);
    res.json({ success: true, message: "Enquiry submitted successfully", enquiry: enquiry });
});
app.delete("/api/enquiries/:id", (req, res) => {
    let enquiries = readData(enquiriesFile);
    const id = String(req.params.id);
    enquiries = enquiries.filter(enquiry => String(enquiry.id) !== id);
    writeData(enquiriesFile, enquiries);
    res.json({ success: true, message: "Enquiry deleted" });
});
app.put("/api/enquiries/:id/status", (req, res) => {
    const enquiries = readData(enquiriesFile);
    const id = String(req.params.id);
    const enquiry = enquiries.find(e => String(e.id) === id);
    if (!enquiry) return res.status(404).json({ success: false, message: "Enquiry not found" });
    enquiry.status = req.body.status || "New";
    writeData(enquiriesFile, enquiries);
    res.json({ success: true, enquiry });
});

// =====================================================
// CUSTOMERS
// =====================================================
app.get("/api/customers", (req, res) => {
    const customers = readData(customersFile);
    res.json(customers);
});
app.post("/api/customers", (req, res) => {
    const customers = readData(customersFile);
    const customer = {
        id: Date.now(),
        name: req.body.name || "",
        phone: req.body.phone || "",
        email: req.body.email || "",
        address: req.body.address || "",
        createdAt: new Date().toISOString()
    };
    customers.push(customer);
    writeData(customersFile, customers);
    res.json({ success: true, message: "Customer added successfully", customer: customer });
});
app.delete("/api/customers/:id", (req, res) => {
    let customers = readData(customersFile);
    const id = String(req.params.id);
    customers = customers.filter(customer => String(customer.id) !== id);
    writeData(customersFile, customers);
    res.json({ success: true, message: "Customer deleted" });
});

// =====================================================
// PRODUCTS
// =====================================================
app.get("/api/products", (req, res) => {
    const products = readData(productsFile);
    res.json(products);
});
app.post("/api/products", (req, res) => {
    const products = readData(productsFile);
    const product = {
        id: Date.now(),
        name: req.body.name || "",
        category: req.body.category || "",
        price: req.body.price || "",
        size: req.body.size || "",
        image: req.body.image || "",
        description: req.body.description || "",
        createdAt: new Date().toISOString()
    };
    products.push(product);
    writeData(productsFile, products);
    res.json({ success: true, message: "Product added successfully", product: product });
});
app.put("/api/products/:id", (req, res) => {
    const products = readData(productsFile);
    const id = String(req.params.id);
    const product = products.find(p => String(p.id) === id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    Object.assign(product, {
        name: req.body.name ?? product.name, category: req.body.category ?? product.category,
        price: req.body.price ?? product.price, size: req.body.size ?? product.size,
        image: req.body.image ?? product.image, description: req.body.description ?? product.description
    });
    writeData(productsFile, products);
    res.json({ success: true, product });
});
app.delete("/api/products/:id", (req, res) => {
    let products = readData(productsFile);
    const id = String(req.params.id);
    products = products.filter(product => String(product.id) !== id);
    writeData(productsFile, products);
    res.json({ success: true, message: "Product deleted" });
});

// =====================================================
// SERVER STATUS
// =====================================================
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "Maurya Carpet server is running",
        time: new Date().toISOString()
    });
});

// =====================================================
// START SERVER
// =====================================================
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`server running at http://0.0.0.0:${PORT}`);
    });
}
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
module.exports = app;