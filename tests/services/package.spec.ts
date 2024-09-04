import {sequelizeConnection} from '../../db/config';
import {Package} from '../../models/package';
import {Municipality} from '../../models/municipality';
import { Price } from '../../models/price'
import PackageService from '../../services/package.service';

describe('PackageService', () => {
	// Set the db object to a variable which can be accessed throughout the whole test file
	const db = sequelizeConnection;
	const packageService = PackageService;

	// Before any tests run, clear the DB and run migrations with Sequelize sync()
	beforeEach(async () => {
		await db.sync({force: true});
	});

	afterAll(async () => {
		await db.close();
	});
	it('Updates the current price of the provided package', async () => {
		const pack = await Package.create({ name: 'Dunderhonung', priceCents: 0 });

		const newPackage = await packageService.updatePackagePrice(pack, 200_00);

		expect(newPackage.priceCents).toBe(200_00);
	});

	it('Stores the old price of the provided package in its price history', async () => {
    	const pack = await Package.create({ name: 'Dunderhonung', priceCents: 100_00 });

		await packageService.updatePackagePrice(pack, 200_00);

		const priceHistory = await Price.findAll({ where: { packageId: pack.id } });

		expect(priceHistory.length).toBe(1);
		expect(priceHistory[0].priceCents).toBe(100_00);
	});
	
	it('Supports adding a price for a specific municipality', async () => {
		const municipality = await Municipality.create({name: 'Göteborg'});
		const pack = await Package.create({name: 'Dunderhonung', priceCents: 0});

		const responseUpdate = await packageService.updatePackagePrice(pack, 200_00, 'Göteborg');
		const response = await packageService.priceFor('Göteborg');

		expect(response).toEqual([{municipality: 'Göteborg', name: 'Dunderhonung', priceCents: 200_00}]);
		expect(responseUpdate.priceCents).toEqual(0);
		
		const responseUpdate2 = await packageService.updatePackagePrice(pack, 201_00, 'Göteborg');
		const response2 = await packageService.priceFor('Göteborg');

		expect(response2).toEqual([{municipality: 'Göteborg', name: 'Dunderhonung', priceCents: 201_00}]);
		expect(responseUpdate2.priceCents).toEqual(0);
	});

	it('Supports adding prices for specific municipalities', async () => {
		const municipality = await Municipality.create({name: 'Göteborg'});
		const municipality2 = await Municipality.create({name: 'Stockholm'});
		const name = 'test1'
		const pack = await Package.create({name, priceCents: 0});

		await packageService.updatePackagePrice(pack, 201_00, municipality.name);
		await packageService.updatePackagePrice(pack, 202_00, municipality2.name);
		await packageService.updatePackagePrice(pack, 200_00);

		const response = await packageService.priceFor(municipality.name);
		const response2 = await packageService.priceFor(municipality2.name);
		expect(response).toEqual([{municipality: municipality.name, name, priceCents: 201_00}]);
		expect(response2).toEqual([{municipality: municipality2.name, name, priceCents: 202_00}]);
	});

	it('Throws when municipality is not found', async () => {
		expect.hasAssertions();
		const name = 'test1'
		const pack = await Package.create({name, priceCents: 0});

		try {
			await packageService.updatePackagePrice(pack, 201_00, 'Non existing municipality')
		  } catch (e: any) {
			expect(e.message).toEqual('Error handling the transaction');
		  }
	})
});
