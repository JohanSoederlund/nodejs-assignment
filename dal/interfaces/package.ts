import {IBaseAccess} from './access'
import {Package} from '../../models/package'
import {IPackage, IPackageExtended} from '../../services/models'

interface IPackageAccess extends IBaseAccess<IPackage> {
    get(packageId: number): Promise<IPackage | null>;
    create(newPackage: IPackage): Promise<IPackage>;
    update(packageId: number, newPackage: IPackage): Promise<IPackage>;
    delete(packageId: number): Promise<void>;
    updatePriceTransaction(packageId: number, newPrice: number, municipalityId?: number): Promise<IPackageExtended | null>;
}

export {
    IPackageAccess
}