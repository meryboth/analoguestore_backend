import { faker } from '@faker-js/faker';

export const productGenerator = () => {
  return {
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    img: faker.image.imageUrl(),
    code: faker.datatype.uuid(),
    stock: faker.datatype.number({ min: 0, max: 1000 }),
    category: faker.commerce.department(),
    status: faker.datatype.boolean(),
    thumbnails: [faker.image.imageUrl(), faker.image.imageUrl()],
  };
};
