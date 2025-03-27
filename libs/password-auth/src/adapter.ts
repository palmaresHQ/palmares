import { authAdapter } from '@palmares/auth';
import { compare, hash } from 'bcrypt';

export const passwordAdapter = authAdapter((config: { saltRounds?: number } = {}) => ({
  name: 'password',
  methods: {
    hash: (password: string) => hash(password, config.saltRounds ?? 10),
    validate: (password: string, toValidate: string) => compare(password, toValidate)
  }
}));
