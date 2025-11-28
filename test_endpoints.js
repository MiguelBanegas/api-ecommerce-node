const BASE_URL = "http://localhost:3003";

async function testEndpoints() {
  console.log("🚀 Iniciando pruebas de la API...\n");

  try {
    // 1. Health Check
    console.log("1️⃣  Probando Health Check...");
    const health = await fetch(`${BASE_URL}/`);
    console.log(`Status: ${health.status}`);
    console.log(`Response: ${await health.text()}\n`);

    // 2. Get Products
    console.log("2️⃣  Obteniendo Productos...");
    const products = await fetch(`${BASE_URL}/api/products`);
    const productsData = await products.json();
    console.log(`Status: ${products.status}`);
    console.log(`Productos encontrados: ${productsData.length || 0}`);
    if (productsData.length > 0) {
      console.log(`Ejemplo: ${productsData[0].nombre}`);
    }
    console.log("\n");

    // 3. Create Guest Cart
    console.log("3️⃣  Creando Carrito de Invitado...");
    const guestId = "test_guest_" + Date.now();
    const createCart = await fetch(`${BASE_URL}/api/cart/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestId: guestId,
        items: [{ id: "prod_1", cantidad: 2 }],
      }),
    });
    const cartData = await createCart.json();
    console.log(`Status: ${createCart.status}`);
    console.log("Respuesta:", cartData);
    console.log("\n");

    // 4. Get Guest Cart
    if (cartData.success) {
      console.log("4️⃣  Obteniendo Carrito de Invitado...");
      const getCart = await fetch(`${BASE_URL}/api/cart/guest/${guestId}`);
      const getCartData = await getCart.json();
      console.log(`Status: ${getCart.status}`);
      console.log("Items en carrito:", getCartData.cart.items);
      console.log("\n");
    }

    console.log("✅ Pruebas finalizadas.");
  } catch (error) {
    console.error("❌ Error durante las pruebas:", error.message);
    console.log(
      "💡 Asegúrate de que el servidor esté corriendo con 'npm start'"
    );
  }
}

testEndpoints();
