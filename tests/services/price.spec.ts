import {sequelizeConnection} from '../../db/config';
import {Package} from '../../models/package';
import {Municipality} from '../../models/municipality';
import PackageService from '../../services/package.service';
import PriceService from '../../services/price.service';

describe('PriceService', () => {
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

  it('Returns the pricing history for the provided year and package', async () => {
    const basic = await Package.create({ name: 'basic', priceCents: 20_00 });
    const municipality = await Municipality.create({name: 'Göteborg'});
		const municipality2 = await Municipality.create({name: 'Stockholm'});

    const date = new Date();
    const date2 = new Date();
    const date3 = new Date();

    date.setFullYear(2019);
    date2.setFullYear(2020);
    date2.setMonth(4);
    date3.setFullYear(2020);
    date3.setMonth(5);
    //Need differentiating dates since transactions are not finished in order of operation
    await Promise.all([
      PriceService.createPriceHistory(basic.id, 20_00, municipality.id, date),
      PriceService.createPriceHistory(basic.id, 30_00, municipality2.id, date),
      PriceService.createPriceHistory(basic.id, 30_00, municipality.id, date2),
      PriceService.createPriceHistory(basic.id, 40_00, municipality2.id, date2),
      PriceService.createPriceHistory(basic.id, 100_00, municipality2.id, date3),
    ])
 
    expect(await PriceService.getPriceHistory(basic.name, 2020)).toStrictEqual({
      Göteborg: [30_00],
      Stockholm: [40_00, 100_00],
    });
  });

  it('Supports filtering on municipality', async () => {
    const basic = await Package.create({ name: 'basic', priceCents: 20_00 });
    const municipality = await Municipality.create({name: 'Göteborg'});
		const municipality2 = await Municipality.create({name: 'Stockholm'});

    const date = new Date();
    const date2 = new Date();

    date.setFullYear(2020);
    date.setMonth(3);
    date2.setFullYear(2020);
    date2.setMonth(4);
    await Promise.all([
      PriceService.createPriceHistory(basic.id, 20_00, municipality.id, date),
      PriceService.createPriceHistory(basic.id, 30_00, municipality2.id, date),
      PriceService.createPriceHistory(basic.id, 100_00, municipality2.id, date2),
    ]);

    expect(await PriceService.getPriceHistory(basic.name, 2020, municipality.name)).toStrictEqual({
      [municipality.name]: [20_00],
    });

    expect(await PriceService.getPriceHistory(basic.name, 2020, municipality2.name)).toStrictEqual({
      [municipality2.name]: [30_00, 100_00],
    });

    expect(await PriceService.getPriceHistory(basic.name, 2020, 'unknown')).toStrictEqual({});
    expect(await PriceService.getPriceHistory(basic.name, 2019, municipality2.name)).toStrictEqual({});
    expect(await PriceService.getPriceHistory('premium', 2020, municipality2.name)).toStrictEqual({});
  })
});
