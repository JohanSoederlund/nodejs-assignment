import {type Association, type CreationOptional, DataTypes, type ForeignKey, type InferAttributes, type InferCreationAttributes, Model, type NonAttribute} from 'sequelize';
import {sequelizeConnection} from '../db/config';
import {MunicipalityPackage} from './municipality_package';

class Municipality extends Model<InferAttributes<Municipality>, InferCreationAttributes<Municipality>> {
	declare static associations: {
		municipalityPackages: Association<Municipality, MunicipalityPackage>;
	};

	declare id: CreationOptional<number>;
	declare name: string;

	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
	declare municipalityPackages?: NonAttribute<MunicipalityPackage[]>;
}

Municipality.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	createdAt: DataTypes.DATE,
	updatedAt: DataTypes.DATE,
}, {
	sequelize: sequelizeConnection,
});

Municipality.hasMany(MunicipalityPackage, {
	sourceKey: 'id',
	foreignKey: 'municipalityId',
	as: 'municipalityPackages',
});

MunicipalityPackage.belongsTo(Municipality, {
	foreignKey: 'municipalityId',
	as: 'municipality',
});

export {Municipality};
