import { authAdapter } from '@palmares/auth';
import { compare, hash } from 'bcrypt';

export const passwordAdapter = authAdapter(() => ({
  name: 'password',
  methods: {
    hash: (password: string) => {
      return hash(password, 10);
    },
    validate: (password: string, toValidate: string) => {
      return compare(password, toValidate);
    }
  }
}));
