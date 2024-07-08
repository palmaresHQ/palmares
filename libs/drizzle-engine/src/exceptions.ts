export class UnsupportedFieldTypeError extends Error {
  constructor(fieldType: string) {
    super(`Field type ${fieldType} is not supported by @palmares/sequelize-engine`);
    this.name = UnsupportedFieldTypeError.name;
  }
}
