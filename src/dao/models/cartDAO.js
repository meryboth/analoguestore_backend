import MongoManager from '../managers/mongoManager.js';
import FileSystemManager from '../managers/filesystemManager.js';
import { CartModel, cartSchema } from '../../models/cart.model.js';
import { v4 as uuidv4 } from 'uuid';

class CartDAO {
  constructor(dataSource) {
    if (dataSource === 'mongo') {
      this.model = MongoManager.connection.model('carts', cartSchema);
      console.log('CartDAO using MongoDB');
    } else if (dataSource === 'fileSystem') {
      this.fileSystem = FileSystemManager;
      this.filePath = 'carts.json';
      console.log('CartDAO using FileSystem');
    }
  }

  async createCart(products) {
    console.log('Creating cart with products:', products);
    if (this.model) {
      try {
        const cart = new this.model({ products });
        const savedCart = await cart.save();
        console.log('Cart saved in MongoDB:', savedCart);
        return savedCart;
      } catch (error) {
        console.error('Error creating cart in MongoDB:', error);
        throw error;
      }
    } else if (this.fileSystem) {
      try {
        const carts = (await this.fileSystem.readFile(this.filePath)) || [];
        const newCart = { id: uuidv4(), products };
        carts.push(newCart);
        await this.fileSystem.writeFile(this.filePath, carts);
        console.log('Cart saved in FileSystem:', newCart);
        return newCart;
      } catch (error) {
        console.error('Error creating cart in FileSystem:', error);
        throw error;
      }
    }
  }

  async getCartById(cartId) {
    console.log('Getting cart by ID:', cartId);
    if (this.model) {
      try {
        const cart = await this.model.findById(cartId);
        console.log('Cart found in MongoDB:', cart);
        return cart;
      } catch (error) {
        console.error('Error getting cart from MongoDB:', error);
        throw error;
      }
    } else if (this.fileSystem) {
      try {
        const carts = (await this.fileSystem.readFile(this.filePath)) || [];
        const cart = carts.find((cart) => cart.id === cartId);
        console.log('Cart found in FileSystem:', cart);
        return cart;
      } catch (error) {
        console.error('Error getting cart from FileSystem:', error);
        throw error;
      }
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    if (this.model) {
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
    } else if (this.fileSystem) {
      const carts = (await this.fileSystem.readFile(this.filePath)) || [];
      const cart = carts.find((cart) => cart.id === cartId);
      if (cart) {
        const productIndex = cart.products.findIndex(
          (item) => item.product === productId
        );
        if (productIndex !== -1) {
          cart.products[productIndex].quantity += quantity;
        } else {
          cart.products.push({ product: productId, quantity });
        }
        await this.fileSystem.writeFile(this.filePath, carts);
        return cart;
      }
    }
  }

  async deleteProductFromCart(cartId, productId) {
    if (this.model) {
      const cart = await this.model.findById(cartId);
      cart.products = cart.products.filter(
        (item) => item.product._id.toString() !== productId
      );
      return await cart.save();
    } else if (this.fileSystem) {
      const carts = (await this.fileSystem.readFile(this.filePath)) || [];
      const cart = carts.find((cart) => cart.id === cartId);
      if (cart) {
        cart.products = cart.products.filter(
          (item) => item.product !== productId
        );
        await this.fileSystem.writeFile(this.filePath, carts);
        return cart;
      }
    }
  }

  async updateCart(cartId, updatedProducts) {
    if (this.model) {
      const cart = await this.model.findById(cartId);
      cart.products = updatedProducts;
      cart.markModified('products');
      return await cart.save();
    } else if (this.fileSystem) {
      const carts = (await this.fileSystem.readFile(this.filePath)) || [];
      const cart = carts.find((cart) => cart.id === cartId);
      if (cart) {
        cart.products = updatedProducts;
        await this.fileSystem.writeFile(this.filePath, carts);
        return cart;
      }
    }
  }

  async updateQuantity(cartId, productId, newQuantity) {
    if (this.model) {
      const cart = await this.model.findById(cartId);
      const productIndex = cart.products.findIndex(
        (item) => item.product._id.toString() === productId
      );

      if (productIndex !== -1) {
        cart.products[productIndex].quantity = newQuantity;
        cart.markModified('products');
        return await cart.save();
      }
    } else if (this.fileSystem) {
      const carts = (await this.fileSystem.readFile(this.filePath)) || [];
      const cart = carts.find((cart) => cart.id === cartId);
      if (cart) {
        const productIndex = cart.products.findIndex(
          (item) => item.product === productId
        );
        if (productIndex !== -1) {
          cart.products[productIndex].quantity = newQuantity;
          await this.fileSystem.writeFile(this.filePath, carts);
          return cart;
        }
      }
    }
  }

  async emptyCart(cartId) {
    if (this.model) {
      const cart = await this.model.findById(cartId);
      cart.products = [];
      return await cart.save();
    } else if (this.fileSystem) {
      const carts = (await this.fileSystem.readFile(this.filePath)) || [];
      const cart = carts.find((cart) => cart.id === cartId);
      if (cart) {
        cart.products = [];
        await this.fileSystem.writeFile(this.filePath, carts);
        return cart;
      }
    }
  }

  async purchaseCart(cartId, userId) {
    if (this.model) {
      const cart = await this.model
        .findById(cartId)
        .populate('products.product');
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
}

export default CartDAO;
