import {type Association, type CreationOptional, DataTypes, type ForeignKey, type InferAttributes, type InferCreationAttributes, Model, type NonAttribute} from 'sequelize';
import {sequelizeConnection} from '../db/config';
import { type Package} from './package';
import { type Municipality} from './municipality';

class MunicipalityPackage extends Model<InferAttributes<MunicipalityPackage>, InferCreationAttributes<MunicipalityPackage>> {
	declare static associations: {
		municipality: Association<MunicipalityPackage, Municipality>;
		pack: Association<MunicipalityPackage, Package>;
	};

	declare id: CreationOptional<number>;
	declare priceCents: number;
	declare packageId: ForeignKey<Package['id']>;
	declare municipalityId: ForeignKey<Municipality['id']>;

	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare municipality?: NonAttribute<Municipality>;
	declare pack?: NonAttribute<Package>;
}

MunicipalityPackage.init({
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

export {MunicipalityPackage};
