import { Container } from "./container";

export class Key<T> {
    private readonly id: string;

    public constructor(id: string) {
        this.id = id;
    }

    public getId(): string {
        return this.id;
    }

    public getValue(container: Container): T | undefined {
        return container.getValue(this);
    }
}
