// Error con status HTTP explícito. Lo traduce el errorHandler.
export class HttpError extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)
        this.name = 'HttpError'
        this.status = status
    }
}
