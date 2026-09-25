// MAURYA CARPET - ADMIN PANEL
// API-backed admin panel. Data is stored by the Express server in JSON files.

const API = "/api";

async function api(url, options = {}) {
    const response = await fetch(API + url, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
    });
    if (!response.ok) {
        let message = `Request failed (${response.status})`;
        try { const data = await response.json(); if (data.message) message = data.message; } catch (_) {}
        throw new Error(message);
    }
    return response.json();
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function login() {
    const user = document.getElementById("username")?.value.trim();
    const pass = document.getElementById("password")?.value.trim();
    const error = document.getElementById("errorMessage");
    if (user === "admin" && pass === "12345") {
        localStorage.setItem("adminLoggedIn", "true");
        window.location.href = "Dashboard.html";
    } else if (error) error.textContent = "Invalid username or password";
}

function logout() {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "Login.html";
}

function protectAdmin() {
    const page = location.pathname.split("/").pop().toLowerCase();
    const protectedPages = ["dashboard.html","order.html","customer.html","enquiry.html","product.html"];
    if (protectedPages.includes(page) && localStorage.getItem("adminLoggedIn") !== "true") {
        window.location.href = "Login.html";
    }
}

async function loadDashboard() {
    try {
        const [orders, customers] = await Promise.all([api("/orders"), api("/customers")]);
        const pending = orders.filter(o => String(o.status).toLowerCase() !== "completed");
        const completed = orders.filter(o => String(o.status).toLowerCase() === "completed");
        const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
        set("totalOrders", orders.length);
        set("pendingOrders", pending.length);
        set("completedOrders", completed.length);
        set("totalCustomers", customers.length);
        const body = document.getElementById("ordersTableBody");
        if (!body) return;
        body.innerHTML = orders.length ? orders.slice().reverse().slice(0,5).map(o => `
            <tr><td>${escapeHtml(o.name || "-")}</td><td>${escapeHtml(o.phone || "-")}</td>
            <td>${escapeHtml(o.carpet || "-")}</td><td>${escapeHtml(o.quantity || 1)}</td>
            <td>${escapeHtml(o.status || "Pending")}</td></tr>`).join("") : `<tr><td colspan="5" style="text-align:center;">No orders yet</td></tr>`;
    } catch (e) { console.error(e); }
}

async function addDemoOrder() {
    try {
        const existing = await api("/orders");
        const n = existing.length + 1;
        const customerNames = ["Rahul Sharma","Aman Verma","Priya Singh","Neha Gupta","Rohit Yadav","Anjali Maurya"];
        const name = `${customerNames[(n - 1) % customerNames.length]} ${n}`;
        const phone = "90000" + String(10000 + n).slice(-5);
        const carpets = ["Royal Persian Carpet","Modern Floral Carpet","Handmade Wool Carpet","Traditional Kashmiri Carpet","Silk Carpet","Designer Carpet"];
        const carpet = carpets[(n - 1) % carpets.length];
        await api("/orders", {method:"POST", body:JSON.stringify({
            name, phone, carpet, size:"6x9", quantity:1, message:`Demo Order ${n}`
        })});
        alert(`Demo order #${n} added successfully!`);
        await loadDashboard();
    } catch(e) { alert("Could not add demo order: " + e.message); }
}

async function loadOrders() {
    const body = document.getElementById("ordersTableBody"); if (!body) return;
    try {
        const orders = await api("/orders");
        body.innerHTML = orders.length ? orders.slice().reverse().map(o => {
            const done = String(o.status).toLowerCase() === "completed";
            return `<tr><td>${escapeHtml(o.name||"-")}</td><td>${escapeHtml(o.phone||"-")}</td><td>${escapeHtml(o.carpet||"-")}</td>
            <td>${escapeHtml(o.size||"-")}</td><td>${escapeHtml(o.quantity||1)}</td>
            <td><span class="order-status ${done?"completed":"pending"}">${escapeHtml(o.status||"Pending")}</span></td>
            <td><div class="order-actions">${done?`<span class="completed-label">✓ Completed</span>`:`<button class="complete-btn" onclick="completeOrder(${Number(o.id)})">✓ Complete</button>`}
            <button class="delete-btn" onclick="deleteOrder(${Number(o.id)})">🗑 Delete</button></div></td></tr>`;
        }).join("") : `<tr><td colspan="7" style="text-align:center;">No orders found</td></tr>`;
    } catch(e) { body.innerHTML = `<tr><td colspan="7" style="text-align:center;">Unable to load orders</td></tr>`; console.error(e); }
}

async function completeOrder(id) {
    try { await api(`/orders/${id}/status`, {method:"PUT", body:JSON.stringify({status:"Completed"})}); await loadOrders(); await loadDashboard(); }
    catch(e) { alert(e.message); }
}
async function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;
    try { await api(`/orders/${id}`, {method:"DELETE"}); await loadOrders(); await loadDashboard(); }
    catch(e) { alert(e.message); }
}

async function loadCustomers() {
    const body = document.getElementById("customersTableBody"); if (!body) return;
    try {
        const customers = await api("/customers");
        body.innerHTML = customers.length ? customers.slice().reverse().map(c => `<tr>
            <td>${escapeHtml(c.name||"-")}</td><td>${escapeHtml(c.phone||"-")}</td><td>${escapeHtml(c.email||"-")}</td>
            <td>${escapeHtml(c.address||"-")}</td><td><button class="delete-btn" onclick="deleteCustomer(${Number(c.id)})">Delete</button></td></tr>`).join("")
            : `<tr><td colspan="5" style="text-align:center;">No customers found</td></tr>`;
    } catch(e) { console.error(e); }
}
async function deleteCustomer(id) {
    if (!confirm("Delete this customer?")) return;
    try { await api(`/customers/${id}`, {method:"DELETE"}); await loadCustomers(); await loadDashboard(); }
    catch(e) { alert(e.message); }
}

async function loadEnquiries() {
    const body = document.getElementById("enquiriesTableBody"); if (!body) return;
    try {
        const enquiries = await api("/enquiries");
        body.innerHTML = enquiries.length ? enquiries.slice().reverse().map(e => {
            const done = e.status === "Completed";
            return `<tr><td>${escapeHtml(e.name||"-")}</td><td>${escapeHtml(e.phone||"-")}</td><td>${escapeHtml(e.carpet||"-")}</td>
            <td>${escapeHtml(e.message||"-")}</td><td><span class="enquiry-status ${done?"completed":"new"}">${escapeHtml(e.status||"New")}</span></td>
            <td><div class="enquiry-actions">${done?`<span class="enquiry-completed">✓ Completed</span>`:`<button class="enquiry-complete-btn" onclick="completeEnquiry(${Number(e.id)})">✓ Complete</button>`}
            <button class="enquiry-delete-btn" onclick="deleteEnquiry(${Number(e.id)})">🗑 Delete</button></div></td></tr>`;
        }).join("") : `<tr><td colspan="6" style="text-align:center;">No enquiries found</td></tr>`;
    } catch(e) { console.error(e); }
}
async function completeEnquiry(id) {
    try { await api(`/enquiries/${id}/status`, {method:"PUT", body:JSON.stringify({status:"Completed"})}); await loadEnquiries(); }
    catch(e) { alert(e.message); }
}
async function deleteEnquiry(id) {
    if (!confirm("Delete this enquiry?")) return;
    try { await api(`/enquiries/${id}`, {method:"DELETE"}); await loadEnquiries(); }
    catch(e) { alert(e.message); }
}

// Keep sidebar links consistent with the actual file names.
document.addEventListener("DOMContentLoaded", () => {
    protectAdmin();
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.addEventListener("submit", e => { e.preventDefault(); login(); });
    document.querySelectorAll(".sidebar nav a").forEach(link => {
        const t = link.textContent.toLowerCase();
        if (t.includes("dashboard")) link.href = "Dashboard.html";
        else if (t.includes("product")) link.href = "Product.html";
        else if (t.includes("order")) link.href = "Order.html";
        else if (t.includes("customer")) link.href = "Customer.html";
        else if (t.includes("enquiry")) link.href = "Enquiry.html";
    });
    if (document.getElementById("totalOrders")) loadDashboard();
    if (document.getElementById("ordersTableBody")) loadOrders();
    if (document.getElementById("customersTableBody")) loadCustomers();
    if (document.getElementById("enquiriesTableBody")) loadEnquiries();
});
