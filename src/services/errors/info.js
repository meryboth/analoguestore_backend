// Función para generar un error de usuario
const generateUserError = (user) => {
  return `Los datos están incompletos o no son válidos, necesitamos los siguientes datos:
      - Nombre: String, pero recibimos: ${user.first_name}
      - Apellido: String, pero recibimos: ${user.last_name}`;
};

// Función para generar un error de autenticación
const generateAuthenticationError = () => {
  return 'Autenticación fallida. Por favor, verifica tus credenciales e intenta nuevamente.';
};

// Función para generar un error de validación de producto
const generateProductValidationError = (product) => {
  return `Los datos del producto están incompletos o no son válidos. Necesitamos los siguientes datos:
      - Nombre del producto: String, pero recibimos: ${product.name}
      - Precio: Número, pero recibimos: ${product.price}
      - Categoría: String, pero recibimos: ${product.category}`;
};

export {
  generateUserError,
  generateAuthenticationError,
  generateProductValidationError,
};
