import { auto, choice, char, date, text, Model, uuid } from '@palmares/databases'


export class AbstractUser extends Model<AbstractUser>() {
  fields = {
    id: auto(),
    firstName: text(),
    lastName: text(),
    email: text()
  }

  options = {
    tableName: 'user',
    managed: false,
    abstract: true
  }
}

export class AbstractInventoryItem extends Model<AbstractInventoryItem>() {
  fields = {
    id: auto(),
    uuid: uuid({ autoGenerate: true }),
    manufacturer: choice({ choices: ['Apple', 'Dell', 'HP', 'Lenovo' ]}),
    serial: char({ maxLength: 12, allowNull: false, allowBlank: false }),
    status: choice({ choices: ['use', 'maintenance', 'available'], allowNull: false }),
    purchaseDate: date({ allowNull: false, }),
    warrantyExpiryDate: date({ allowNull: false }),
    specifications: text({ allowNull: false, allowBlank: false }),
    imageUrl: text({ allowNull: false , allowBlank: false }),
    assignmentDate: date({ allowNull: true })
  }

  options = {
    tableName: 'inventory_item',
    managed: false,
    abstract: true
  }
}
