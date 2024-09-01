// services/cart.services.js

import { v4 as uuidv4 } from 'uuid';
import DAOFactory from '../dao/daoFactory.js';
import config from '../config/config.js';
import { TicketModel } from '../models/ticket.model.js';

const dataSource = config.data_source || 'mongo';
const cartDAO = DAOFactory.getDAO('carts', dataSource);
const productDAO = DAOFactory.getDAO('products', dataSource);

class CartService {
  async createCart(products, userEmail) {
    // Verificar si alguno de los productos es propio
    for (const item of products) {
      const product = await productDAO.getProductById(item.product);
      if (product.owner === userEmail) {
        throw new Error('You cannot add your own product to the cart.');
      }
    }

    console.log('Creating cart with products in CartService:', products); // Debugging
    return await cartDAO.createCart(products);
  }

  async getCart(cartId) {
    return await cartDAO.getCartById(cartId);
  }

  async addProductToCart(cartId, productId, quantity, userEmail) {
    const product = await productDAO.getProductById(productId);
    if (product.owner === userEmail) {
      throw new Error('You cannot add your own product to the cart.');
    }

    return await cartDAO.addProductToCart(cartId, productId, quantity);
  }

  async deleteProductFromCart(cartId, productId) {
    return await cartDAO.deleteProductFromCart(cartId, productId);
  }

  async updateCart(cartId, updatedProducts) {
    return await cartDAO.updateCart(cartId, updatedProducts);
  }

  async updateProductQuantity(cartId, productId, newQuantity) {
    return await cartDAO.updateQuantity(cartId, productId, newQuantity);
  }

  async emptyCart(cartId) {
    return await cartDAO.emptyCart(cartId);
  }

  async purchaseCart(cartId, userEmail) {
    const cart = await cartDAO.getCartById(cartId);

    if (!cart) {
      throw new Error('Cart not found');
    }

    const notPurchasedProducts = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = await productDAO.getProductById(item.product._id);
      if (product.stock < item.quantity) {
        notPurchasedProducts.push(item.product._id);
      } else {
        totalAmount += product.price * item.quantity;
      }
    }

    if (notPurchasedProducts.length > 0) {
      return { ticket: null, notPurchasedProducts };
    }

    const ticketData = {
      code: uuidv4(),
      purchase_datetime: new Date(),
      amount: totalAmount,
      purchaser: userEmail,
    };

    const ticket = new TicketModel(ticketData);
    await ticket.save();

    for (const item of cart.products) {
      const product = await productDAO.getProductById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    cart.products = cart.products.filter((item) =>
      notPurchasedProducts.includes(item.product._id)
    );
    await cart.save();

    return { ticket, notPurchasedProducts };
  }
}

export default new CartService();
