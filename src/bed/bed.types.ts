export type Bed = {
    id: number;
    gardenId: number;
    name: string;
    positionIndex: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}