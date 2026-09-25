// ================= MOBILE MENU =================

function toggleMenu() {

    const navbar =
        document.getElementById("navbar");

    if (navbar) {
        navbar.classList.toggle("active");
    }

}


// Close menu after clicking link

document.querySelectorAll("#navbar a").forEach(link => {

    link.addEventListener("click", () => {

        const navbar =
            document.getElementById("navbar");

        if (navbar) {
            navbar.classList.remove("active");
        }

    });

});



// ================= WHATSAPP ENQUIRY =================

function enquiry(productName) {

    const whatsappNumber =
        "9454158714";

    const message =
        `Hello Maurya Carpet,%0A%0A` +
        `I am interested in: ${productName}%0A%0A` +
        `Please share price, size and available designs.`;

    window.open(
        `https://wa.me/${whatsappNumber}?text=${message}`,
        "_blank"
    );

}



// ================= PRODUCTS =================

const products = [

    {
        name: "Royal Handmade Carpet",
        category: "Traditional",
        image: "carpet1.jpg",
        description:
            "Elegant traditional design for beautiful interiors."
    },

    {
        name: "Modern Designer Carpet",
        category: "Modern",
        image: "carpet2.jpg",
        description:
            "Nature-Inspired Earth Mosaic Rug."
    },

    {
        name: "Luxury Premium Carpet",
        category: "Luxury",
        image: "carpet3.jpg",
        description:
            "Gold & Brown Artistic Design Autumn Flow Rug."
    },

    {
        name: "Classic Persian Style",
        category: "Traditional",
        image: "carpet5.jpg",
        description:
            "Artistic Mosaic Design Inspired By Natural Stone."
    },

    {
        name: "Elegant Living Room Carpet",
        category: "Modern",
        image: "carpet10.jpg",
        description:
            "Stylish carpet designed for modern living spaces."
    },

    {
        name: "Premium Designer Collection",
        category: "Luxury",
        image: "carpet6.jpg",
        description:
            "Sophisticated design for premium interiors."
    }

];



// ================= DISPLAY PRODUCTS =================

function displayProducts(productArray = products) {

    const productList =
        document.getElementById("productList");

    if (!productList) {
        return;
    }

    productList.innerHTML = "";

    productArray.forEach(product => {

        productList.innerHTML += `

            <article class="product-card">

                <div class="product-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                    <span class="tag">
                        ${product.category}
                    </span>

                </div>


                <div class="product-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${product.description}
                    </p>

                    <button
                        type="button"
                        onclick="enquiry('${product.name}')">

                        Enquire on WhatsApp →

                    </button>

                </div>

            </article>

        `;

    });

}



// Load products

displayProducts();



// ================= FILTER PRODUCTS =================

function filterProducts(category, button) {

    document
        .querySelectorAll(".filter-btn")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    if (button) {
        button.classList.add("active");
    }


    if (category === "All") {

        displayProducts(products);

        return;

    }


    const filteredProducts =
        products.filter(product =>
            product.category === category
        );


    displayProducts(filteredProducts);

}



// ================= CONTACT ENQUIRY =================

const contactForm =
    document.getElementById("contactForm");


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const carpet =
                document
                    .getElementById("carpet")
                    .value;


            const message =
                document
                    .getElementById("message")
                    .value
                    .trim();


            if (!name || !phone || !message) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            const enquiryData = {

                name: name,

                phone: phone,

                carpet: carpet,

                message: message

            };


            try {

                const response =
                    await fetch(
                        "/api/enquiries",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    enquiryData
                                )
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    const whatsappNumber =
                       "9454158714";


                    const text =
                        `Hello Maurya Carpet,%0A%0A` +
                        `Name: ${name}%0A` +
                        `Mobile: ${phone}%0A` +
                        `Collection: ${carpet || "Not selected"}%0A` +
                        `Message: ${message}`;


                    window.open(
                        `https://wa.me/${whatsappNumber}?text=${text}`,
                        "_blank"
                    );


                    alert(
                        "Enquiry submitted successfully!"
                    );


                    contactForm.reset();

                } else {

                    alert(
                        "Unable to submit enquiry."
                    );

                }


            } catch (error) {

                console.error(
                    "Enquiry error:",
                    error
                );


                alert(
                    "Server connection failed. Please try again."
                );

            }

        }
    );

}



// ================= IMAGE MODAL =================

const imageModal =
    document.getElementById("imageModal");

const modalImage =
    document.getElementById("modalImage");

const closeModal =
    document.querySelector(".close-modal");


document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.matches(
                ".product-image img"
            )
        ) {

            if (!imageModal || !modalImage) {
                return;
            }


            modalImage.src =
                event.target.src;


            imageModal.classList.add("show");

        }

    }
);


if (closeModal) {

    closeModal.addEventListener(
        "click",
        function() {

            imageModal.classList.remove(
                "show"
            );

        }
    );

}


if (imageModal) {

    imageModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === imageModal
            ) {

                imageModal.classList.remove(
                    "show"
                );

            }

        }
    );

}



// ================= ORDER MODAL =================

function openOrderForm(productName = "") {

    const modal =
        document.getElementById("orderModal");


    if (!modal) {

        alert(
            "Order form not found!"
        );

        return;

    }


    const carpetInput =
        document.getElementById(
            "orderCarpet"
        );


    if (
        carpetInput &&
        productName
    ) {

        carpetInput.value =
            productName;

    }


    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";

}



function closeOrderForm() {

    const modal =
        document.getElementById(
            "orderModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

        document.body.style.overflow =
            "";

    }

}



// ================= BOOKING MODAL =================

function openBookingForm() {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (!modal) {

        alert(
            "Booking form not found!"
        );

        return;

    }


    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";

}



function closeBookingForm() {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

        document.body.style.overflow =
            "";

    }

}



// ================= CLOSE MODAL OUTSIDE =================

window.addEventListener(
    "click",
    function(event) {

        const orderModal =
            document.getElementById(
                "orderModal"
            );

        const bookingModal =
            document.getElementById(
                "bookingModal"
            );


        if (
            event.target === orderModal
        ) {

            closeOrderForm();

        }


        if (
            event.target === bookingModal
        ) {

            closeBookingForm();

        }

    }
);



// ================= ESC KEY =================

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeOrderForm();

            closeBookingForm();

        }

    }
);



// ================= ORDER FORM =================

const orderForm = document.getElementById("orderForm");

if (orderForm) {

    orderForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const order = {

            name: document.getElementById("orderName").value.trim(),

            phone: document.getElementById("orderPhone").value.trim(),

            carpet: document.getElementById("orderCarpet").value.trim(),

            size: document.getElementById("orderSize").value.trim(),

            quantity: document.getElementById("orderQuantity").value,

            message: document.getElementById("orderMessage").value.trim()

        };

        try {

            const response = await fetch("/api/orders", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(order)

            });

            if (!response.ok) {
                throw new Error("Server Error");
            }

            const data = await response.json();

            if (data.success) {

                alert(
                    "Order placed successfully! Maurya Carpet team will contact you."
                );

                orderForm.reset();

                closeOrderForm();

            } else {

                alert("Unable to place order.");

            }

        } catch (error) {

            console.error("Order error:", error);

            alert(
                "Server connection failed. Please try again."
            );

        }

    });

}

// ================= BOOKING FORM =================

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {

    bookingForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const booking = {
            id: Date.now(),

            name: document.getElementById("bookingName").value.trim(),

            phone: document.getElementById("bookingPhone").value.trim(),

            carpet: document.getElementById("bookingCarpet").value,

            size: document.getElementById("bookingSize").value.trim(),

            date: document.getElementById("bookingDate").value,

            message: document.getElementById("bookingMessage").value.trim(),

            createdAt: new Date().toLocaleString()
        };

        // Get existing bookings
        let bookings = JSON.parse(
            localStorage.getItem("bookings") || "[]"
        );

        // Add new booking
        bookings.push(booking);

        // Save booking
        localStorage.setItem(
            "bookings",
            JSON.stringify(bookings)
        );

        // Success message
        alert(
            "Booking submitted successfully! Maurya Carpet team will contact you."
        );

        // Reset form
        bookingForm.reset();

        // Close modal
        if (typeof closeBookingForm === "function") {
            closeBookingForm();
        }

    });

}


// ================= SET MINIMUM BOOKING DATE =================

const bookingDate =
    document.getElementById(
        "bookingDate"
    );


if (bookingDate) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    bookingDate.min = today;

}
