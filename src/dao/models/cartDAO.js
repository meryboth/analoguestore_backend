import MongoManager from '../managers/mongoManager.js';
import { CartModel, cartSchema } from '../../models/cart.model.js';
import { v4 as uuidv4 } from 'uuid';

class CartDAO {
  constructor() {
    this.model = MongoManager.connection.model('carts', cartSchema);
    console.log('CartDAO using MongoDB');
  }

  async createCart(products) {
    console.log('Creating cart with products:', products);
    try {
      const cart = new this.model({ products });
      const savedCart = await cart.save();
      console.log('Cart saved in MongoDB:', savedCart);
      return savedCart;
    } catch (error) {
      console.error('Error creating cart in MongoDB:', error);
      throw error;
    }
  }

  async getCartById(cartId) {
    console.log('Getting cart by ID:', cartId);
    try {
      const cart = await this.model.findById(cartId);
      console.log('Cart found in MongoDB:', cart);
      return cart;
    } catch (error) {
      console.error('Error getting cart from MongoDB:', error);
      throw error;
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    const cart = await this.model.findById(cartId);
    const productIndex = cart.products.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    cart.markModified('products');
    return await cart.save();
  }

  async deleteProductFromCart(cartId, productId) {
    const cart = await this.model.findById(cartId);
    cart.products = cart.products.filter(
      (item) => item.product._id.toString() !== productId
    );
    return await cart.save();
  }

  async updateCart(cartId, updatedProducts) {
    const cart = await this.model.findById(cartId);
    cart.products = updatedProducts;
    cart.markModified('products');
    return await cart.save();
  }

  async updateQuantity(cartId, productId, newQuantity) {
    const cart = await this.model.findById(cartId);
    const productIndex = cart.products.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity = newQuantity;
      cart.markModified('products');
      return await cart.save();
    }
  }

  async emptyCart(cartId) {
    const cart = await this.model.findById(cartId);
    cart.products = [];
    return await cart.save();
  }

  async purchaseCart(cartId, userId) {
    const cart = await this.model.findById(cartId).populate('products.product');
    if (!cart) throw new Error('Cart not found');

    const purchasedProducts = [];
    const notPurchasedProducts = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = await ProductDAO.getProductById(item.product._id);
      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        await ProductDAO.updateProduct(product._id, { stock: product.stock });
        purchasedProducts.push(item);
        totalAmount += product.price * item.quantity;
      } else {
        notPurchasedProducts.push(item);
      }
    }

    const ticket = new TicketModel({
      code: uuidv4(),
      amount: totalAmount,
      purchaser: userId,
    });
    await ticket.save();

    cart.products = notPurchasedProducts;
    await cart.save();

    return {
      ticket,
      notPurchasedProducts,
    };
  }
}

export default CartDAO;
