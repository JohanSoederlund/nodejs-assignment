import { Op, where, fn, col, literal } from 'sequelize'
import { sequelizeConnection } from '../db/config'
import { Package } from '../models/package'
import { Municipality } from '../models/municipality'
import { Price } from '../models/price'

export default {
  /**
   * Created a new seed method enable easier seeding from unit tests and to unclutter updatePackagePrice method in package service 
   */
  async createPriceHistory(packageId: number, priceCents: number, municipalityId: number, createdAt?: Date): Promise<Price> {
    try {
      const newPrice = await sequelizeConnection.transaction(async t => {
        return await Price.create({
          packageId,
          municipalityId,
          priceCents,
          createdAt: createdAt ?? new Date(),
        }, { transaction: t });

      });

      return newPrice;
    } catch (err: unknown) {
      throw new Error('Error handling the transaction');
    }
  },
  async getPriceHistory(packageName: string, year: number, municipalityName?: string): Promise<{ [key: string]: number[] }> {
    const prices = await Price.findAll({
      include: [
        {
          model: Package,
          where: {name: packageName},
          as: 'pack'
        },
        {
          model: Municipality,
          where: {...(municipalityName) && {name: municipalityName} },
          as: 'municipality'
        }],
        where: {
          [Op.and]: [
            where(fn('date', col('price.createdAt')), '>', year+'-0'),
            where(fn('date', col('price.createdAt')), '<', year+1+'-0'),
          ]
        },
        order: [
          ['createdAt', 'asc']
        ]
    })

    let mappedPrices:{ [key: string]: number[] } = {}
    
    //Remapping resource to preferred format decided in TDD
    prices.forEach(price => {
      const {priceCents, municipality} = price
      const municipalityKey = municipality?.name ?? 'Global'

      if (mappedPrices[municipalityKey]) {
        mappedPrices[municipalityKey].push(priceCents)
      } else {
        mappedPrices[municipalityKey] = [priceCents]
      }

      return {[municipality?.name ?? 'Global']: priceCents}
    })

    return mappedPrices
  },
}
