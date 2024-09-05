interface IBaseAccess<T> {
    get(id: number, newEntity: T): Promise<T | null>;
    create(newEntity: T): Promise<T>;
    update(id: number, newEntity: T): Promise<T>;
    delete(id: number): Promise<void>;
}

export {
    IBaseAccess
}