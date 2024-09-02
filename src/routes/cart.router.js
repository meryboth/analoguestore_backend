import express from 'express';
import CartService from '../services/cart.services.js';
import { authenticateJWT, isUser } from '../middlewares/auth.js';
import EmailService from '../services/email.services.js';
const router = express.Router();
const emailService = new EmailService();

router.post('/', authenticateJWT, async (req, res) => {
  try {
    const products = req.body.products;
    const userEmail = req.user.email;
    console.log('Request to create cart with products:', products); // Debugging
    const newCart = await CartService.createCart(products, userEmail);
    res.json(newCart);
  } catch (error) {
    console.error('Error al crear un nuevo carrito', error);
    if (error.message === 'You cannot add your own product to the cart.') {
      res.status(403).send('You cannot add your own product to the cart.');
    } else {
      res.status(500).send('Error interno del servidor');
    }
  }
});
router.get('/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await CartService.getCart(cartId);
    res.json(cart.products);
  } catch (error) {
    console.error('Error al obtener el carrito', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.post('/:cid/product/:pid', authenticateJWT, async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;
  const userEmail = req.user.email;

  try {
    const updatedCart = await CartService.addProductToCart(
      cartId,
      productId,
      quantity,
      userEmail
    );
    res.json(updatedCart.products);
  } catch (error) {
    console.error('Error al agregar producto al carrito', error);
    if (error.message === 'You cannot add your own product to the cart.') {
      res.status(403).send('You cannot add your own product to the cart.');
    } else {
      res.status(500).send('Error interno del servidor');
    }
  }
});

router.delete('/:cid/product/:pid', authenticateJWT, async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const updatedCart = await CartService.deleteProductFromCart(
      cartId,
      productId
    );
    res.json({
      status: 'success',
      message: 'Producto eliminado del carrito correctamente',
      updatedCart,
    });
  } catch (error) {
    console.error('Error al eliminar el producto del carrito', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.put('/:cid', authenticateJWT, async (req, res) => {
  const cartId = req.params.cid;
  const updatedProducts = req.body;

  try {
    const updatedCart = await CartService.updateCart(cartId, updatedProducts);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error al actualizar el carrito', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.put('/:cid/product/:pid', authenticateJWT, async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const newQuantity = req.body.quantity;

  try {
    const updatedCart = await CartService.updateProductQuantity(
      cartId,
      productId,
      newQuantity
    );
    res.json({
      status: 'success',
      message: 'Cantidad del producto actualizada correctamente',
      updatedCart,
    });
  } catch (error) {
    console.error(
      'Error al actualizar la cantidad del producto en el carrito',
      error
    );
    res.status(500).send('Error interno del servidor');
  }
});

router.delete('/:cid', authenticateJWT, async (req, res) => {
  try {
    const cartId = req.params.cid;
    const updatedCart = await CartService.emptyCart(cartId);
    res.json({
      status: 'success',
      message:
        'Todos los productos del carrito fueron eliminados correctamente',
      updatedCart,
    });
  } catch (error) {
    console.error('Error al vaciar el carrito', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.post('/:cid/purchase', authenticateJWT, async (req, res) => {
  const cartId = req.params.cid;
  const user = req.user; // Información del usuario obtenida del middleware

  try {
    const { ticket, notPurchasedProducts } = await CartService.purchaseCart(
      cartId,
      user.email
    );

    if (ticket) {
      // Enviar correo de confirmación de compra
      await emailService.sendNewBuyEmail(
        user.email,
        user.first_name,
        ticket.code
      );

      res.json({
        status: 'success',
        ticket,
        notPurchasedProducts,
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400).json({
        status: 'error',
        message:
          'No se pudo completar la compra debido a problemas con el carrito.',
      });
    }
  } catch (error) {
    console.error('Error al finalizar la compra', error);
    if (error.message === 'Cart not found') {
      res.status(404).json({ status: 'error', error: 'Cart not found' });
    } else {
      res
        .status(500)
        .json({ status: 'error', error: 'Error interno del servidor' });
    }
  }
});

export default router;
