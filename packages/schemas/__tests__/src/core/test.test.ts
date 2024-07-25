import { describe } from "@palmares/tests";

import JestTestAdapter from "@palmares/jest-tests";
import * as p from '@palmares/schemas';

describe<JestTestAdapter>("Basic Schemas", ({ test }) => {
  test("basic representation", async ({ expect }) => {
    const basicSchema = p.number();

    const data = await basicSchema.data(2);

    expect(data).toBe(2);
  })

  test("basic to representation", async ({ expect }) => {
    const defaultMessage = 'This used to be a number'
    const numberSchema = p.number().toRepresentation(async () => {
      return defaultMessage;
    });

    const schemaTransformingData = p.number().toRepresentation(async (data) => {
      return {
        number: data,
        message: defaultMessage
      };
    });

    const stringMessage = await numberSchema.data(2);
    const objectMessage = await schemaTransformingData.data(2);

    expect(stringMessage).toBe(defaultMessage);
    expect(objectMessage.message).toBe(defaultMessage);
    expect(objectMessage.number).toBe(2);
  });

  test("basic internal", async ({ expect }) => {
    const internalSchema = p.number().toInternal(async (data) => {
      return data * 2;
    });

    const { parsed } = await internalSchema.parse(2);

    expect(parsed).toBe(4);
  });

  test("basic validation", async ({ expect }) => {
    const internalSchema = p.number().toValidate(async () => {
      return 'Should fail';
    });

    const { errors } = await internalSchema.parse(2);

    expect((errors?.length || 0) > 0).toBe(true);
  });
})
