export declare class TransferParamsDTO {
    sum: number;
    userIdFrom: number;
    userIdTo: number;
    withError: boolean;
    static new({ sum, userIdTo, userIdFrom, withError }: TransferParamsDTO): TransferParamsDTO;
}
