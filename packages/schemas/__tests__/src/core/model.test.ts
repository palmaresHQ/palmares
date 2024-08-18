import * as p from '@palmares/schemas';
import { afterAll, beforeAll, describe } from '@palmares/tests';
import { Company, User } from './models';

describe('Model tests', ({ test }) => {
  beforeAll(async () => {

    await Company.default.set({
      name: 'Targaryen',
      usersOfCompany: [{
        name: 'Rhaenyra Targaryen',
        age: 25
      }, {
        name: 'Aegon Targaryen',
        age: 21
      }]
    }, {
      includes: [{
        model: User
      }]
    })
    await Company.default.set({
      name: 'Stark',
      usersOfCompany: [{
        name: 'Arya Stark',
        age: 22
      }, {
        name: 'Ned Stark',
        age: 46
      }, {
        name: 'Sansa Stark',
        age: 26
      }]
    }, {
      includes: [{
        model: User
      }]
    })
  });

  test('simple', async ({ expect }) => {
    const modelWithAllFields = p.modelSchema(User, {
      omit: []
    });
    const modelWithFieldsOmitted = p.modelSchema(User, {
      omit: ['id', 'createdAt']
    });
    const modelWithAFewFieldsShown = p.modelSchema(User, {
      show: ['name', 'age', 'companyId']
    });
    const data = await User.default.get({
      search: {
        name: {
          like: '%Stark'
        }
      }
    })

    const [
      dataWithAllFields,
      dataWithFieldsOmitted,
      dataWithFewFieldsShown,
      { parsed: parsedDataWithAllFields, errors: errorsOfAllFields },
      { parsed: parsedDataWithFieldsOmitted, errors: errorsOfFieldsOmitted },
      { parsed: parsedDataWithFewFieldsShown, errors: errorsOfAFewFieldsShown }
    ] = await Promise.all([
      modelWithAllFields.data(structuredClone(data[0])),
      modelWithFieldsOmitted.data(structuredClone(data[0])),
      modelWithAFewFieldsShown.data(structuredClone(data[0])),
      modelWithAllFields.parse(structuredClone(data[0])),
      modelWithFieldsOmitted.parse(structuredClone(data[0])),
      modelWithAFewFieldsShown.parse(structuredClone(data[0])),
    ])

    expect(
      Object.keys(dataWithAllFields).every((key) => ['id', 'name', 'age', 'updatedAt', 'createdAt', 'companyId'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(dataWithFieldsOmitted).every((key) => ['name', 'age', 'updatedAt', 'companyId'].includes(key)) &&
      Object.keys(dataWithFieldsOmitted).every((key) => !['id', 'createdAt'].includes(key))
    ).toBe(true)
    expect(
      Object.keys(dataWithFewFieldsShown).every((key) => ['age', 'name', 'companyId'].includes(key)) &&
      Object.keys(dataWithFewFieldsShown).every((key) => !['createdAt', 'id', 'updatedAt'].includes(key))
    ).toBe(true)
    expect(
      Object.keys(parsedDataWithAllFields).every((key) => ['id', 'name', 'age', 'updatedAt', 'createdAt', 'companyId'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(parsedDataWithFieldsOmitted).every((key) => ['name', 'age', 'updatedAt', 'companyId'].includes(key)) &&
      Object.keys(parsedDataWithFieldsOmitted).every((key) => !['id', 'createdAt'].includes(key))
    ).toBe(true)
    expect(
      Object.keys(parsedDataWithFewFieldsShown).every((key) => ['age', 'name', 'companyId'].includes(key)) &&
      Object.keys(parsedDataWithFewFieldsShown).every((key) => !['createdAt', 'id', 'updatedAt'].includes(key))
    ).toBe(true)
  });

  afterAll(async () => {
    await User.default.remove({
      search: {
        name: {
          in: ['Arya Stark', 'Ned Stark',  'Sansa Stark', 'Sansa Start', 'Rhaenyra Targaryen', 'Aegon Targaryen']
        }
      }
    });
    await Company.default.remove({
      search: {
        name: {
          in: ['Stark', 'Targaryen']
        }
      }
    });
  })
});
