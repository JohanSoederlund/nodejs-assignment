import {IPackageAccess} from './interfaces/package'
import { sequelizeConnection } from '../db/config'
import {Package} from '../models/package'
import {Price} from '../models/price'
import {MunicipalityPackage} from '../models/municipality_package'
import {IPackage, IPackageExtended, IPrice} from '../services/models'

class PackageAccess implements IPackageAccess {
    constructor() {}
  
    async get(packageId: number): Promise<IPackage | null> {
        return await Package.findOne({where: {id: packageId}}) as IPackage;
    }
    async create(newPackage: IPackage): Promise<IPackage> {
        return await Package.create(newPackage);
    }
    async update(packageId: number, newPackage: IPackage): Promise<IPackage> {
        const {id, ...values} = newPackage
        await Package.update(values, {where: {id: packageId}});
        return await Package.findOne({where: {id: packageId}}) as IPackage;
    }
    async delete(packageId: number): Promise<void> {
        const pack = await Package.findOne({where: {id: packageId}});
        await Package.destroy({where: {id: packageId}});
    }
    async updatePriceTransaction(packageId: number, newPrice: number, municipalityId?: number): Promise<IPackageExtended>{
        try {
            return await sequelizeConnection.transaction(async t => {

                const pack = await this.get(packageId) as Package
                if (!pack) throw new Error('Not found')

                let shouldCreatePriceLog = false;
                let oldPrice = pack.priceCents
                const prices: IPrice[] = []
        
                if (!!municipalityId) {
                    const foundMunicipalityPackage = await MunicipalityPackage.findOrCreate({
                        where: { municipalityId: municipalityId, packageId: packageId }, 
                        defaults: { priceCents: newPrice }
                    })
                    
                    if (foundMunicipalityPackage[0].priceCents !== newPrice) {
                        const oldPrice = foundMunicipalityPackage[0].priceCents;
                        shouldCreatePriceLog = true;
                        foundMunicipalityPackage[0].priceCents = newPrice;
                        await foundMunicipalityPackage[0].save({ transaction: t });
                    }
                } else {
                    shouldCreatePriceLog = true
                    pack.priceCents = newPrice;
                }

                if (shouldCreatePriceLog) {
                    const price = await Price.create({
                        packageId,
                        municipalityId: municipalityId ?? null,
                        priceCents: oldPrice,
                        }, { transaction: t });
                        
                        prices.push({id: price.id, priceCents: price.priceCents, packageId: price.packageId, municipalityId: price.municipalityId, createdAt: price.createdAt, updatedAt: price.updatedAt })
                }
        
                const { id, name, priceCents } = await pack.save({ transaction: t });
                return { id, name, priceCents, prices}
            });
        } catch (err: unknown) {
            throw new Error('Error handling the transaction');
        }
    }
}

export function  createPackageAccess() {
    return new PackageAccess()
} 
