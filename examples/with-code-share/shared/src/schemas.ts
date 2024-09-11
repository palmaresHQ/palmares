import { getSchemasWithDefaultAdapter, type infer as pInfer } from '@palmares/schemas';
import { z } from '@palmares/zod-schema';

import { AbstractInventoryItem, AbstractUser } from './models';
import { regexForManufacturer } from './utils';

import type { ZodSchemaAdapter } from '@palmares/zod-schema';

const p = getSchemasWithDefaultAdapter<ZodSchemaAdapter>();

export const arrayInventorySchema = p.modelSchema(AbstractInventoryItem, {
  many: true,
  fields: {
    userId: p.number(),
    user: p
      .modelSchema(AbstractUser, {
        show: ['email', 'firstName', 'lastName']
      })
      .optional({
        outputOnly: true
      })
  },
  omit: []
});

export const inventorySchema = p
  .modelSchema(AbstractInventoryItem, {
    fields: {
      id: p.number().optional().nullable(),
      imageUrl: p
        .string()
        .minLength(1)
        .extends((schema) => {
          if (schema instanceof z.ZodString) return schema.url('Not a valid URL');
          return schema;
        }),
      userId: p.number().optional().nullable(),
      user: p
        .modelSchema(AbstractUser, {
          show: ['email', 'firstName', 'lastName']
        })
        .optional()
        .nullable()
    },
    omit: []
  })
  .refine((value) => {
    if (
      // eslint-disable-next-line ts/no-unnecessary-condition
      value &&
      // eslint-disable-next-line ts/no-unnecessary-condition
      value.manufacturer &&
      value.serial &&
      !new RegExp(regexForManufacturer[value.manufacturer]).test(value.serial)
    ) {
      return {
        code: 'serial',
        message: `Serial number is not valid for ${value.manufacturer}`
      };
    }
  })
  .toValidate(async (value) => {
    // eslint-disable-next-line ts/no-unnecessary-condition
    if (value) {
      if (value.status !== 'use')
        return {
          ...value,
          userId: null,
          assignmentDate: null
        };
    }
    return value;
  });

export const arrayUserSchema = p.modelSchema(AbstractUser, {
  many: true,
  omit: []
});

export function getInventorySchemaWithSave(onSave: Parameters<typeof inventorySchema.onSave>[0]) {
  return inventorySchema.onSave(onSave);
}

export type ArrayUserOutput = pInfer<typeof arrayUserSchema, 'representation'>;
export type ArrayInventoryOutput = pInfer<typeof arrayInventorySchema, 'representation'>;
export type InventoryInput = pInfer<typeof inventorySchema>;
export type InventoryOutput = pInfer<typeof inventorySchema, 'representation'>;
