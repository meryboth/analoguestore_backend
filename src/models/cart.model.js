import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

// Popula automáticamente los productos cuando se busca un carrito
cartSchema.pre('findOne', function (next) {
  this.populate('products.product', '_id title price');
  next();
});

// Popula automáticamente los productos cuando se encuentra un documento único
cartSchema.pre('findById', function (next) {
  this.populate('products.product', '_id title price');
  next();
});

const CartModel = mongoose.model('carts', cartSchema);

export { CartModel, cartSchema };
