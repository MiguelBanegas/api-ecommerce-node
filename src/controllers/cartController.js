const { admin, db } = require("../config/firebase");

const CARTS_COLLECTION = "carts";
const GUEST_EXPIRY_DAYS = 30;

/**
 * Crear un nuevo carrito de invitado
 * POST /api/cart/guest
 * Body: { guestId: string, items: array }
 */
exports.createGuestCart = async (req, res) => {
  try {
    const { guestId, items = [] } = req.body;

    if (!guestId) {
      return res.status(400).json({ error: "guestId es requerido" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + GUEST_EXPIRY_DAYS);

    const cartData = {
      id: `guest_${guestId}`,
      type: "guest",
      userId: null,
      items: items,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    };

    await db.collection(CARTS_COLLECTION).doc(`guest_${guestId}`).set(cartData);

    res.status(201).json({
      success: true,
      cart: { ...cartData, id: `guest_${guestId}` },
    });
  } catch (error) {
    console.error("Error creating guest cart:", error);
    res.status(500).json({ error: "Error al crear carrito de invitado" });
  }
};

/**
 * Obtener carrito de invitado
 * GET /api/cart/guest/:guestId
 */
exports.getGuestCart = async (req, res) => {
  try {
    const { guestId } = req.params;

    const cartDoc = await db
      .collection(CARTS_COLLECTION)
      .doc(`guest_${guestId}`)
      .get();

    if (!cartDoc.exists) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const cartData = cartDoc.data();

    // Verificar si el carrito expiró
    if (cartData.expiresAt && cartData.expiresAt.toDate() < new Date()) {
      await cartDoc.ref.delete();
      return res.status(404).json({ error: "Carrito expirado" });
    }

    res.json({
      success: true,
      cart: { id: cartDoc.id, ...cartData },
    });
  } catch (error) {
    console.error("Error getting guest cart:", error);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
};

/**
 * Actualizar carrito de invitado
 * PUT /api/cart/guest/:guestId
 * Body: { items: array }
 */
exports.updateGuestCart = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items debe ser un array" });
    }

    const cartRef = db.collection(CARTS_COLLECTION).doc(`guest_${guestId}`);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      // Si no existe, crear uno nuevo
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + GUEST_EXPIRY_DAYS);

      const cartData = {
        id: `guest_${guestId}`,
        type: "guest",
        userId: null,
        items: items,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      };

      await cartRef.set(cartData);
      return res.json({ success: true, cart: cartData });
    }

    // Actualizar carrito existente (última actualización gana)
    await cartRef.update({
      items: items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedCart = await cartRef.get();

    res.json({
      success: true,
      cart: { id: updatedCart.id, ...updatedCart.data() },
    });
  } catch (error) {
    console.error("Error updating guest cart:", error);
    res.status(500).json({ error: "Error al actualizar carrito" });
  }
};

/**
 * Obtener carrito de usuario autenticado
 * GET /api/cart/user/:userId
 */
exports.getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cartDoc = await db
      .collection(CARTS_COLLECTION)
      .doc(`user_${userId}`)
      .get();

    if (!cartDoc.exists) {
      // Retornar carrito vacío si no existe
      return res.json({
        success: true,
        cart: {
          id: `user_${userId}`,
          type: "user",
          userId: userId,
          items: [],
        },
      });
    }

    res.json({
      success: true,
      cart: { id: cartDoc.id, ...cartDoc.data() },
    });
  } catch (error) {
    console.error("Error getting user cart:", error);
    res.status(500).json({ error: "Error al obtener carrito de usuario" });
  }
};

/**
 * Actualizar carrito de usuario
 * PUT /api/cart/user/:userId
 * Body: { items: array }
 */
exports.updateUserCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items debe ser un array" });
    }

    const cartRef = db.collection(CARTS_COLLECTION).doc(`user_${userId}`);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      // Crear nuevo carrito de usuario
      const cartData = {
        id: `user_${userId}`,
        type: "user",
        userId: userId,
        items: items,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await cartRef.set(cartData);
      return res.json({ success: true, cart: cartData });
    }

    // Actualizar carrito existente (última actualización gana)
    await cartRef.update({
      items: items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedCart = await cartRef.get();

    res.json({
      success: true,
      cart: { id: updatedCart.id, ...updatedCart.data() },
    });
  } catch (error) {
    console.error("Error updating user cart:", error);
    res.status(500).json({ error: "Error al actualizar carrito de usuario" });
  }
};

/**
 * Fusionar carrito de invitado con carrito de usuario
 * POST /api/cart/merge
 * Body: { guestId: string, userId: string }
 */
exports.mergeCart = async (req, res) => {
  try {
    const { guestId, userId } = req.body;

    if (!guestId || !userId) {
      return res.status(400).json({ error: "guestId y userId son requeridos" });
    }

    const guestCartRef = db
      .collection(CARTS_COLLECTION)
      .doc(`guest_${guestId}`);
    const userCartRef = db.collection(CARTS_COLLECTION).doc(`user_${userId}`);

    const [guestCartDoc, userCartDoc] = await Promise.all([
      guestCartRef.get(),
      userCartRef.get(),
    ]);

    let mergedItems = [];

    // Obtener items del carrito de usuario si existe
    if (userCartDoc.exists) {
      mergedItems = [...userCartDoc.data().items];
    }

    // Fusionar items del carrito guest si existe
    if (guestCartDoc.exists) {
      const guestItems = guestCartDoc.data().items || [];

      guestItems.forEach((guestItem) => {
        const existingItem = mergedItems.find(
          (item) => item.id === guestItem.id
        );

        if (existingItem) {
          // Sumar cantidades si el producto ya existe
          existingItem.cantidad =
            (existingItem.cantidad || 1) + (guestItem.cantidad || 1);
        } else {
          // Agregar nuevo producto
          mergedItems.push(guestItem);
        }
      });

      // Eliminar carrito guest después de fusionar
      await guestCartRef.delete();
    }

    // Guardar o actualizar carrito de usuario con items fusionados
    const mergedCartData = {
      id: `user_${userId}`,
      type: "user",
      userId: userId,
      items: mergedItems,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!userCartDoc.exists) {
      mergedCartData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await userCartRef.set(mergedCartData, { merge: true });

    res.json({
      success: true,
      cart: mergedCartData,
      message: `Se fusionaron ${
        guestCartDoc.exists ? guestCartDoc.data().items.length : 0
      } productos del carrito invitado`,
    });
  } catch (error) {
    console.error("Error merging carts:", error);
    res.status(500).json({ error: "Error al fusionar carritos" });
  }
};

/**
 * Vaciar carrito de usuario (después de compra)
 * DELETE /api/cart/user/:userId
 */
exports.deleteUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cartRef = db.collection(CARTS_COLLECTION).doc(`user_${userId}`);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Actualizar a carrito vacío en lugar de eliminar el documento
    await cartRef.update({
      items: [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: "Carrito vaciado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting user cart:", error);
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
};

/**
 * Limpiar carritos de invitados expirados
 * Esta función debe ejecutarse periódicamente (ej: cron job)
 */
exports.cleanupExpiredCarts = async () => {
  try {
    const now = admin.firestore.Timestamp.now();

    const expiredCartsSnapshot = await db
      .collection(CARTS_COLLECTION)
      .where("type", "==", "guest")
      .where("expiresAt", "<", now)
      .get();

    if (expiredCartsSnapshot.empty) {
      console.log("No hay carritos expirados para limpiar");
      return { deleted: 0 };
    }

    const batch = db.batch();
    expiredCartsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`${expiredCartsSnapshot.size} carritos expirados eliminados`);
    return { deleted: expiredCartsSnapshot.size };
  } catch (error) {
    console.error("Error cleaning up expired carts:", error);
    throw error;
  }
};
