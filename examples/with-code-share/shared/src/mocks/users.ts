import { ModelFields } from "@palmares/databases";
import { AbstractUser } from "../models";
import { faker } from "@faker-js/faker";

export default function mockUsers(limit: number, options?: {
    offset?: number,
  }): { rows: ModelFields<AbstractUser>[], nextOffset: number } {
    const offset = typeof options?.offset === 'number' ? options.offset : 0;
    const rows = new Array(limit)
      .fill(0)
      .map((_, i) => {
        return {
          id: i + offset,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email()
        } satisfies ModelFields<AbstractUser>
    });
    
    return { rows, nextOffset: offset + 1 }
  }