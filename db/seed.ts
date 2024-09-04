import {Package} from '../models/package';
import {Price} from '../models/price';
import {Municipality} from '../models/municipality';
import { MunicipalityPackage } from '../models/municipality_package';

export const seedDb = async () => {
	await Municipality.destroy({truncate: true});

	await Municipality.bulkCreate([
		{name: 'Stockholm'},
		{name: 'Göteborg'},
	], {validate: true});

	const stockholm = await Municipality.findOne({where: {name: 'Stockholm'}}) as Municipality;
	const goteborg = await Municipality.findOne({where: {name: 'Göteborg'}}) as Municipality;

	await Package.destroy({truncate: true});

	await Package.bulkCreate([
		{name: 'basic', priceCents: 20_000},
		{name: 'plus', priceCents: 59_900},
		{name: 'premium', priceCents: 111_100},
	], {validate: true});

	const basic = await Package.findOne({where: {name: 'basic'}}) as Package;
	const plus = await Package.findOne({where: {name: 'plus'}}) as Package;
	const premium = await Package.findOne({where: {name: 'premium'}}) as Package;

	await Price.bulkCreate([
		{priceCents: 5000, packageId: basic.id},
		{priceCents: 10_000, packageId: basic.id},
	], {validate: true});

	await Price.bulkCreate([
		{priceCents: 18_990, packageId: plus.id, municipalityId: goteborg.id},
		{priceCents: 19_990, packageId: plus.id},
		{priceCents: 29_900, packageId: plus.id},
		{priceCents: 39_900, packageId: plus.id},
	], {validate: true});

	await Price.bulkCreate([
		{priceCents: 45_000, packageId: premium.id, municipalityId: stockholm.id},
		{priceCents: 55_000, packageId: premium.id},
		{priceCents: 66_600, packageId: premium.id},
		{priceCents: 77_700, packageId: premium.id},
		{priceCents: 88_800, packageId: premium.id},
	], {validate: true});

	await MunicipalityPackage.bulkCreate([
		{priceCents: 5100, municipalityId: stockholm.id, packageId: basic.id},
		{priceCents: 5200, municipalityId: goteborg.id, packageId: basic.id},
	], {validate: true});

	await MunicipalityPackage.bulkCreate([
		{priceCents: 18_990, municipalityId: stockholm.id, packageId: plus.id},
		{priceCents: 17_990, municipalityId: goteborg.id, packageId: plus.id},
	], {validate: true});

	await MunicipalityPackage.bulkCreate([
		{priceCents: 56_000, municipalityId: stockholm.id, packageId: premium.id},
		{priceCents: 57_000, municipalityId: goteborg.id, packageId: premium.id},
	], {validate: true});
};
