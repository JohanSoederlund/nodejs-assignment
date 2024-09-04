import {type Association, type CreationOptional, DataTypes, type ForeignKey, type InferAttributes, type InferCreationAttributes, Model, type NonAttribute} from 'sequelize';
import {sequelizeConnection} from '../db/config';
import { type Package } from './package';
import { type Municipality } from './municipality';

class Price extends Model<InferAttributes<Price>, InferCreationAttributes<Price>> {
	declare static associations: {
		municipality: Association<Price, Municipality>;
		pack: Association<Price, Package>;
	};

	declare id: CreationOptional<number>;
	declare priceCents: number;
	declare packageId: ForeignKey<Package['id']>;
	declare municipalityId: ForeignKey<Municipality['id']> | null;

	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare municipality?: NonAttribute<Municipality>;
	declare pack?: NonAttribute<Package>;
}

Price.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	priceCents: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	createdAt: DataTypes.DATE,
	updatedAt: DataTypes.DATE,
}, {
	sequelize: sequelizeConnection,
});

export {Price};
