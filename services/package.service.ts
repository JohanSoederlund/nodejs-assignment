import { sequelizeConnection } from '../db/config'
import {Package} from '../models/package';
import {Municipality} from '../models/municipality';
import {MunicipalityPackage} from '../models/municipality_package';
import { Price } from '../models/price';

export default {
  async getAll() {
    return await Package.findAll({
			include: [
				{model: Price, as: 'prices'},
			],
		});
  },
  async updatePackagePrice(pack: Package, newPriceCents: number, municipalityName?: string): Promise<Package> {
    //updatePackagePrice also updates price history and municipality specific prices
    try {
      const newPackage = await sequelizeConnection.transaction(async t => {

        let municipalityId: number | null = null;

        if (!!municipalityName) {
          const foundMunicipality = await Municipality.findOne({ where: { name: municipalityName } });
          if (!foundMunicipality) throw new Error('Not found');
          municipalityId = foundMunicipality.id

          const foundMunicipalityPackage = await MunicipalityPackage.findOrCreate({
              where: { municipalityId, packageId: pack.id }, 
              defaults: { priceCents: newPriceCents,  }
            })
            
          if (foundMunicipalityPackage[0].priceCents !== newPriceCents) {
            await Price.create({
              packageId: pack.id,
              municipalityId,
              priceCents: foundMunicipalityPackage[0].priceCents,
            }, { transaction: t });

            foundMunicipalityPackage[0].priceCents = newPriceCents;
            await foundMunicipalityPackage[0].save({ transaction: t });
          }
        } else {
          await Price.create({
            packageId: pack.id,
            municipalityId,
            priceCents: pack.priceCents,
          }, { transaction: t });
          pack.priceCents = newPriceCents;
        }

        return await pack.save({ transaction: t });
      });

      return newPackage;
    } catch (err: unknown) {
      throw new Error('Error handling the transaction');
    }
  },

	async priceFor(municipalityName: string): Promise<Array<{municipality: string, name: string, priceCents: number}>> {
    const municipalityPackages = await MunicipalityPackage.findAll({
      attributes: ['priceCents'],
      include: [
        {
          model: Package,
          as: 'pack'
        },
        {
          model: Municipality,
          where: {name: municipalityName},
          as: 'municipality'
        }
      ]
    })

    return municipalityPackages.map(municipalityPackage => {
      const {priceCents, pack, municipality} = municipalityPackage;
      return {municipality: municipality?.name ?? '', name: pack?.name ?? '', priceCents}
    })
	},
};
