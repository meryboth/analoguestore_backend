import mongoManager from '../managers/mongoManager.js';
import { ProductModel, productSchema } from '../../models/product.model.js';

class ProductDAO {
  constructor() {
    this.model = mongoManager.connection.model('products', productSchema);
    console.log('ProductDAO using MongoDB');
  }

  async createProduct(productData) {
    console.log('Creating product in MongoDB:', productData);
    const product = new this.model(productData);
    return await product.save();
  }

  async getProductById(productId) {
    return await this.model.findById(productId);
  }

  async getAllProducts({ limit = 10, page = 1, sort, query } = {}) {
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
  }

  async updateProduct(productId, updateData) {
    return await this.model.findByIdAndUpdate(productId, updateData, {
      new: true,
    });
  }

  async deleteProduct(productId) {
    return await this.model.findByIdAndDelete(productId);
  }
}

export default ProductDAO;
