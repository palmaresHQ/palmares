import * as p from '@palmares/schemas';
import { afterAll, beforeAll, describe } from '@palmares/tests';
import { Company, User } from './models';

describe('Model tests', ({ test }) => {
  beforeAll(async () => {
    await Company.default.set((qs) => 
      qs
        .join(User, 'usersOfCompany', (qs) => 
          qs.data(
              {
              name: 'Rhaenyra Targaryen',
              age: 25,
              updatedAt: new Date()
            }, {
              name: 'Aegon Targaryen',
              age: 21,
              updatedAt: new Date()
            }
          )
        )
      .data({
        name: 'Targaryen'
      })
    )
    
    await Company.default.set((qs) => qs.join(User, 'usersOfCompany', (qs) => 
      qs.data({
      name: 'Arya Stark',
      age: 22,
      updatedAt: new Date()

    }, {
      name: 'Ned Stark',
      age: 46,
      updatedAt: new Date()

    }, {
      name: 'Sansa Stark',
      age: 26,
      updatedAt: new Date()

    })).data({
      name: 'Stark'
    }))
  });


  test('basic', async ({ expect }) => {
    const modelWithAllFields = p.modelSchema(User, {
      omit: []
    });
    const modelWithFieldsOmitted = p.modelSchema(User, {
      omit: ['id', 'createdAt']
    });
    const modelWithAFewFieldsShown = p.modelSchema(User, {
      show: ['name', 'age', 'companyId']
    });
    const data = await User.default.get((qs) => qs.where({
        name: {
          like: '%Stark'
        }
      })
    )

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
    ).toBe(true);
    expect(
      Object.keys(dataWithFewFieldsShown).every((key) => ['age', 'name', 'companyId'].includes(key)) &&
      Object.keys(dataWithFewFieldsShown).every((key) => !['createdAt', 'id', 'updatedAt'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(parsedDataWithAllFields).every((key) => ['id', 'name', 'age', 'updatedAt', 'createdAt', 'companyId'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(parsedDataWithFieldsOmitted).every((key) => ['name', 'age', 'updatedAt', 'companyId'].includes(key)) &&
      Object.keys(parsedDataWithFieldsOmitted).every((key) => !['id', 'createdAt'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(parsedDataWithFewFieldsShown).every((key) => ['age', 'name', 'companyId'].includes(key)) &&
      Object.keys(parsedDataWithFewFieldsShown).every((key) => !['createdAt', 'id', 'updatedAt'].includes(key))
    ).toBe(true);
    expect((errorsOfAllFields || []).length).toBe(0);
    expect((errorsOfFieldsOmitted || []).length).toBe(0);
    expect((errorsOfAFewFieldsShown || []).length).toBe(0);
  });

  test('array', async ({expect}) => {
    const modelWithAllFields = p.modelSchema(User, {
      many: true,
      omit: []
    });
    const modelWithFieldsOmitted = p.modelSchema(User, {
      many: true,
      omit: ['id', 'createdAt']
    });
    const modelWithAFewFieldsShown = p.modelSchema(User, {
      many: true,
      show: ['name', 'age', 'companyId']
    });
    const data = await User.default.get((qs) => 
      qs.where({
        name: {
          like: '%Stark'
        }
      })
    );

    const [
      dataWithAllFields,
      dataWithFieldsOmitted,
      dataWithFewFieldsShown,
      { parsed: parsedDataWithAllFields, errors: errorsOfAllFields },
      { parsed: parsedDataWithFieldsOmitted, errors: errorsOfFieldsOmitted },
      { parsed: parsedDataWithFewFieldsShown, errors: errorsOfAFewFieldsShown }
    ] = await Promise.all([
      modelWithAllFields.data(structuredClone(data)),
      modelWithFieldsOmitted.data(structuredClone(data)),
      modelWithAFewFieldsShown.data(structuredClone(data)),
      modelWithAllFields.parse(structuredClone(data)),
      modelWithFieldsOmitted.parse(structuredClone(data)),
      modelWithAFewFieldsShown.parse(structuredClone(data)),
    ])

    expect(
      Object.keys(dataWithAllFields[0]).every((key) => ['id', 'name', 'age', 'updatedAt', 'createdAt', 'companyId'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(dataWithFieldsOmitted[0]).every((key) => ['name', 'age', 'updatedAt', 'companyId'].includes(key)) &&
      Object.keys(dataWithFieldsOmitted[0]).every((key) => !['id', 'createdAt'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(dataWithFewFieldsShown[0]).every((key) => ['age', 'name', 'companyId'].includes(key)) &&
      Object.keys(dataWithFewFieldsShown[0]).every((key) => !['createdAt', 'id', 'updatedAt'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(parsedDataWithAllFields[0]).every((key) => ['id', 'name', 'age', 'updatedAt', 'createdAt', 'companyId'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(parsedDataWithFieldsOmitted[0]).every((key) => ['name', 'age', 'updatedAt', 'companyId'].includes(key)) &&
      Object.keys(parsedDataWithFieldsOmitted[0]).every((key) => !['id', 'createdAt'].includes(key))
    ).toBe(true);
    expect(
      Object.keys(parsedDataWithFewFieldsShown[0]).every((key) => ['age', 'name', 'companyId'].includes(key)) &&
      Object.keys(parsedDataWithFewFieldsShown[0]).every((key) => !['createdAt', 'id', 'updatedAt'].includes(key))
    ).toBe(true);
    expect(dataWithAllFields.length).toBe(data.length);
    expect(dataWithFieldsOmitted.length).toBe(data.length);
    expect(dataWithFewFieldsShown.length).toBe(data.length);
    expect(parsedDataWithAllFields.length).toBe(data.length);
    expect(parsedDataWithFieldsOmitted.length).toBe(data.length);
    expect(parsedDataWithFewFieldsShown.length).toBe(data.length);
    expect((errorsOfAllFields || []).length).toBe(0);
    expect((errorsOfFieldsOmitted || []).length).toBe(0);
    expect((errorsOfAFewFieldsShown || []).length).toBe(0);
  });

  test('auto join', async ({ expect }) => {
    const companyModel = p.modelSchema(Company).optional({ outputOnly: true });
    const userModel = p.modelSchema(User, {
      many: true,
      omit: []
    }).optional({ outputOnly: true });

    const arrayModelDirectly = p.modelSchema(User, {
      many: true,
      fields: {
        company: companyModel
      },
      omit: [],
    });
    const arrayModelIndirectly = p.modelSchema(Company, {
      many: true,
      fields: {
        usersOfCompany: userModel
      },
      omit: [],
    })
    const objectModelDirectly = p.modelSchema(User, {
      fields: {
        company: companyModel
      },
      omit: [],
    });

    const objectModelIndirectly = p.modelSchema(Company, {
      fields: {
        usersOfCompany: userModel
      },
      omit: [],
    });

    const userData = await User.default.get((qs) => 
      qs.where({
        name: {
          like: '%Stark'
        }
      })
    );
    const companyData = await Company.default.get(
      (qs) => 
        qs.where({
          name: 'Targaryen'
        })
    );

    const [
      arrayModelDirectlyData,
      arrayModelIndirectlyData,
      objectModelDirectlyData,
      objectModelIndirectlyData
    ] = await Promise.all([
      arrayModelDirectly.data(structuredClone(userData)),
      arrayModelIndirectly.data(structuredClone(companyData)),
      objectModelDirectly.data(structuredClone(userData[0])),
      objectModelIndirectly.data(structuredClone(companyData[0]))
    ]);

    expect(arrayModelDirectlyData.length).toBe(3);
    expect(arrayModelDirectlyData[0].company.name).toBe('Stark');
    expect(arrayModelDirectlyData[2].company.name).toBe('Stark')
    expect(arrayModelIndirectlyData[0].usersOfCompany.length).toBe(2);
    expect(arrayModelIndirectlyData[0].usersOfCompany[0].companyId).toBe(arrayModelIndirectlyData[0].id as number);
    expect(objectModelDirectlyData.company.name).toBe('Stark');
    expect(objectModelIndirectlyData.usersOfCompany.length).toBe(2);
    expect(objectModelIndirectlyData.usersOfCompany[0].companyId).toBe(objectModelIndirectlyData.id as number);
  });

  afterAll(async () => {
    await User.default.remove((qs) => qs.where({
      name: {
        in: ['Arya Stark', 'Ned Stark',  'Sansa Stark', 'Sansa Start', 'Rhaenyra Targaryen', 'Aegon Targaryen']
      }
    }));
    await Company.default.remove((qs) => 
      qs.where({
        name: {
          in: ['Stark', 'Targaryen']
        }
      })
    );
  });
});
