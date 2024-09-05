enum MunicipalityEnum {
  Stockholm = 'Stockholm',
  Goteborg = 'Göteborg',
}

interface IMunicipalityPriceHistory { [key: string]: number[] }

//interface IMunicipalityPriceHistory { municipality: MunicipalityEnum, name: string, priceCents: number }[]

interface IMunicipalityPackage { 
  id?: number,
	name: string;
  packageId: number;
	municipalityId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IPrice { 
	id?: number,
	priceCents: number;
	packageId: number;
	municipalityId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IPackage { 
	id?: number,
	name: string;
	priceCents: number;
}

interface IPackageExtended extends IPackage { 
	prices?: IPrice[];
	municipalityPackages?: IMunicipalityPackage;
}

export {
  MunicipalityEnum,
  IMunicipalityPriceHistory,
  IPrice,
  IPackage,
  IPackageExtended
}