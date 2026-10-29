import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextFunction, Request, Response } from 'express'
import requireAdmin from '../../Presentation/Middlewares/requireAdmin'

const mockVerifyIdToken = vi.fn()

vi.mock('firebase-admin/auth', () => ({
    getAuth: () => ({ verifyIdToken: mockVerifyIdToken }),
}))

vi.mock('../../Services/logger', () => ({
    default: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const crearReq = (authorization?: string) =>
    ({ headers: authorization ? { authorization } : {}, path: '/api/admin/productos' }) as unknown as Request

interface ResDePrueba {
    headersSent: boolean
    statusCode: number
    body: unknown
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
}

// Devuelve el mismo objeto tipado como Response para pasarlo al middleware
const crearRes = () => {
    const res: ResDePrueba = { headersSent: false, statusCode: 0, body: undefined, status: vi.fn(), json: vi.fn() }
    res.status.mockImplementation((code: number) => {
        res.statusCode = code
        return res
    })
    res.json.mockImplementation((body: unknown) => {
        res.body = body
        return res
    })
    return res as unknown as ResDePrueba & Response
}

describe('requireAdmin', () => {
    let next: NextFunction

    beforeEach(() => {
        vi.clearAllMocks()
        next = vi.fn() as unknown as NextFunction
    })

    it('sin header Authorization responde 401', async () => {
        const res = crearRes()
        await requireAdmin(crearReq(), res, next)
        expect(res.statusCode).toBe(401)
        expect(res.body).toEqual({ message: 'No autenticado' })
        expect(next).not.toHaveBeenCalled()
        expect(mockVerifyIdToken).not.toHaveBeenCalled()
    })

    it('con un header que no es Bearer responde 401', async () => {
        const res = crearRes()
        await requireAdmin(crearReq('Basic abc'), res, next)
        expect(res.statusCode).toBe(401)
        expect(next).not.toHaveBeenCalled()
    })

    it('con token inválido o vencido responde 401', async () => {
        mockVerifyIdToken.mockRejectedValueOnce(new Error('Firebase ID token has expired'))
        const res = crearRes()
        await requireAdmin(crearReq('Bearer token-vencido'), res, next)
        expect(mockVerifyIdToken).toHaveBeenCalledWith('token-vencido')
        expect(res.statusCode).toBe(401)
        expect(res.body).toEqual({ message: 'Sesión inválida o vencida' })
        expect(next).not.toHaveBeenCalled()
    })

    it('con token válido pero sin claim admin responde 403', async () => {
        mockVerifyIdToken.mockResolvedValueOnce({ uid: 'u1', email: 'a@a.com' })
        const res = crearRes()
        await requireAdmin(crearReq('Bearer ok'), res, next)
        expect(res.statusCode).toBe(403)
        expect(res.body).toEqual({ message: 'Sin permisos de administrador' })
        expect(next).not.toHaveBeenCalled()
    })

    it('con admin distinto de true (ej. "true" string) responde 403', async () => {
        mockVerifyIdToken.mockResolvedValueOnce({ uid: 'u1', admin: 'true' })
        const res = crearRes()
        await requireAdmin(crearReq('Bearer ok'), res, next)
        expect(res.statusCode).toBe(403)
    })

    it('con claim admin llama a next() y deja req.admin', async () => {
        mockVerifyIdToken.mockResolvedValueOnce({ uid: 'u1', email: 'nico@a.com', admin: true })
        const req = crearReq('Bearer ok')
        const res = crearRes()
        await requireAdmin(req, res, next)
        expect(next).toHaveBeenCalledOnce()
        expect(res.status).not.toHaveBeenCalled()
        expect(req.admin).toEqual({ uid: 'u1', email: 'nico@a.com' })
    })
})
