import CustomRouter from './router.js';
import ProductService from '../services/products.services.js';
import {
  authenticateJWT,
  isAdmin,
  isAdminOrPremium,
} from '../middlewares/auth.js';
import { productGenerator } from '../utils/productGenerator.js';
import { ProductModel } from '../models/product.model.js';

class ProductRouter extends CustomRouter {
  init() {
    /* mock of products */
    this.get('/mockingproducts', this.generateMockProducts);
    this.get('/', this.getAllProducts);
    this.get('/:pid', this.getProductById);
    this.post('/', authenticateJWT, isAdminOrPremium, this.addProduct);
    this.put('/:pid', authenticateJWT, isAdminOrPremium, this.updateProduct);
    this.delete('/:pid', authenticateJWT, isAdminOrPremium, this.deleteProduct);
  }

  async getAllProducts(req, res) {
    try {
      const { limit = 10, page = 1, sort, query } = req.query;
      const productos = await ProductService.getProducts({
        limit: parseInt(limit),
        page: parseInt(page),
        sort,
        query,
      });

      res.json({
        status: 'success',
        payload: productos.docs,
        totalPages: productos.totalPages,
        prevPage: productos.prevPage,
        nextPage: productos.nextPage,
        page: productos.page,
        hasPrevPage: productos.hasPrevPage,
        hasNextPage: productos.hasNextPage,
        prevLink: productos.prevLink,
        nextLink: productos.nextLink,
      });
    } catch (error) {
      console.error(
        'An error occurred while attempting to retrieve the list of products:',
        error
      );
      res.status(500).send('Server error while querying.');
    }
  }

  async getProductById(req, res) {
    const id = req.params.pid;

    try {
      const producto = await ProductService.getProductById(id);
      if (!producto) {
        return res
          .status(404)
          .send('The product with the requested ID was not found.');
      }

      res.json(producto);
    } catch (error) {
      console.error('Error retrieving product:', error);
      res.status(500).send('Internal server error');
    }
  }

  async addProduct(req, res) {
    const nuevoProducto = req.body;
    const ownerEmail = req.user.email || 'admin@admin.com';

    try {
      console.log('Nuevo producto recibido:', nuevoProducto);
      const createdProduct = await ProductService.addProduct({
        ...nuevoProducto,
        owner: ownerEmail,
      });
      console.log('Producto creado:', createdProduct);
      res.status(201).json({
        message: 'El producto fue añadido exitosamente!',
        product: createdProduct,
      });
    } catch (error) {
      console.error('Error al añadir el producto:', error);
      res.status(500).send('Error interno del servidor');
    }
  }

  async updateProduct(req, res) {
    const id = req.params.pid;
    const productoActualizado = req.body;
    const ownerEmail = req.user.email;
    const userRole = req.user.role;

    try {
      const producto = await ProductService.getProductById(id);

      if (!producto) {
        return res.status(404).send('Product not found.');
      }

      if (producto.owner === ownerEmail || userRole === 'admin') {
        const updatedProduct = await ProductService.updateProduct(
          id,
          productoActualizado
        );
        res.json({
          message: 'The product was successfully edited!',
          product: updatedProduct,
        });
      } else {
        res
          .status(403)
          .send('Access denied: You are not the owner of this product.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).send('Internal server error');
    }
  }

  async deleteProduct(req, res) {
    const id = req.params.pid;
    const ownerEmail = req.user.email;
    const userRole = req.user.role;

    try {
      const producto = await ProductService.getProductById(id);

      if (!producto) {
        return res.status(404).send('Product not found.');
      }

      if (producto.owner === ownerEmail || userRole === 'admin') {
        await ProductService.deleteProduct(id);
        res.json({ message: 'Product successfully deleted.' });
      } else {
        res
          .status(403)
          .send('Access denied: You are not the owner of this product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).send('Internal server error');
    }
  }

  async generateMockProducts(req, res) {
    const products = [];
    for (let i = 0; i < 100; i++) {
      const newProduct = productGenerator();
      products.push(newProduct);
    }

    try {
      const result = await ProductModel.insertMany(products);
      console.log('Productos mock generados y guardados:', result);
      res.json({
        message: 'Mock products generated and saved successfully!',
        products: result,
      });
    } catch (error) {
      console.error('Error generating mock products:', error);
      res.status(500).send('Internal server error');
    }
  }
}

export default new ProductRouter().getRouter();
