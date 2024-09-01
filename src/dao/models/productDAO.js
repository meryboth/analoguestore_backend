import mongoManager from '../managers/mongoManager.js';
import FileSystemManager from '../managers/filesystemManager.js';
import { ProductModel, productSchema } from '../../models/product.model.js';
import { v4 as uuidv4 } from 'uuid';

class ProductDAO {
  constructor(dataSource) {
    if (dataSource === 'mongo') {
      this.model = mongoManager.connection.model('products', productSchema);
    } else if (dataSource === 'fileSystem') {
      this.fileSystem = FileSystemManager;
      this.filePath = 'products.json';
    }
  }

  async createProduct(productData) {
    if (this.model) {
      console.log('Creating product in MongoDB:', productData);
      const product = new this.model(productData);
      return await product.save();
    } else if (this.fileSystem) {
      const products = (await this.fileSystem.readFile(this.filePath)) || [];
      const newProduct = { id: uuidv4(), ...productData };
      products.push(newProduct);
      await this.fileSystem.writeFile(this.filePath, products);
      return newProduct;
    }
  }

  async getProductById(productId) {
    if (this.model) {
      return await this.model.findById(productId);
    } else if (this.fileSystem) {
      const products = (await this.fileSystem.readFile(this.filePath)) || [];
      return products.find((product) => product.id === productId);
    }
  }

  async getAllProducts({ limit = 10, page = 1, sort, query } = {}) {
    if (this.model) {
      const skip = (page - 1) * limit;
      let queryOptions = {};

      if (query) {
        queryOptions = { category: query };
      }

      const sortOptions = {};
      if (sort) {
        if (sort === 'asc' || sort === 'desc') {
          sortOptions.price = sort === 'asc' ? 1 : -1;
        }
      } else {
        sortOptions._id = -1;
      }

      const products = await this.model
        .find(queryOptions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const totalProducts = await this.model.countDocuments(queryOptions);

      const totalPages = Math.ceil(totalProducts / limit);
      const hasPrevPage = page > 1;
      const hasNextPage = page < totalPages;

      return {
        docs: products,
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage
          ? `/api/products?limit=${limit}&page=${
              page - 1
            }&sort=${sort}&query=${query}`
          : null,
        nextLink: hasNextPage
          ? `/api/products?limit=${limit}&page=${
              page + 1
            }&sort=${sort}&query=${query}`
          : null,
      };
    } else if (this.fileSystem) {
      const products = (await this.fileSystem.readFile(this.filePath)) || [];
      return {
        docs: products,
        totalPages: 1,
        prevPage: null,
        nextPage: null,
        page: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevLink: null,
        nextLink: null,
      };
    }
  }

  async updateProduct(productId, updateData) {
    if (this.model) {
      return await this.model.findByIdAndUpdate(productId, updateData, {
        new: true,
      });
    } else if (this.fileSystem) {
      const products = (await this.fileSystem.readFile(this.filePath)) || [];
      const index = products.findIndex((product) => product.id === productId);
      if (index !== -1) {
        products[index] = { ...products[index], ...updateData };
        await this.fileSystem.writeFile(this.filePath, products);
        return products[index];
      }
      return null;
    }
  }

  async deleteProduct(productId) {
    if (this.model) {
      return await this.model.findByIdAndDelete(productId);
    } else if (this.fileSystem) {
      const products = (await this.fileSystem.readFile(this.filePath)) || [];
      const index = products.findIndex((product) => product.id === productId);
      if (index !== -1) {
        const deletedProduct = products.splice(index, 1);
        await this.fileSystem.writeFile(this.filePath, products);
        return deletedProduct[0];
      }
      return null;
    }
  }
}

export default ProductDAO;
