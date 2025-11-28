// src/routes/clientes.routes.ts
import { Router } from 'express';
import { crearClienteHandler, crearContratoHandler, getClientePorNitHandler, getClienteResumenHandler, getClientesHandler, getContratosHandler } from '../controllers/cliente.controller';

const router = Router();


router.get('/:id/resumen-cliente', getClienteResumenHandler);
router.get('/consultar-cliente-por-nit/:nit', getClientePorNitHandler);
router.post("/insertar-cliente", crearClienteHandler);
router.post("/insertar-contrato", crearContratoHandler);
router.get("/consultar-contratos", getContratosHandler);
router.get("/consultar-clientes", getClientesHandler);

export default router;
