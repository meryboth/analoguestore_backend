import { faker } from '@faker-js/faker';

export const userGenerator = () => {
  return {
    id: faker.database.mongodbObjectId(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    sex: faker.person.sex(),
    birthDate: faker.date.birthdate(),
    phone: faker.phone.number(),
    image: faker.image.avatar(),
    email: faker.internet.email(),
  };
};
