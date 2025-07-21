import { NextFunction, Request, Response } from 'express';
import customLogger from '../../Services/logger';


const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const similarErrorPattern = /ya tiene.*creado/;
  if (!(err instanceof Error)) {
    err = new Error('Unknown error');
  }
  if (err && typeof err === 'object' && '_message' in err && err._message?.includes('validation failed')) {
    const mongoError = err as any;
    const errors = Object.values(mongoError.errors).map((error: any) => ({
        field: error.path,
        message: error.message
    }));

    return res.status(400).json({
        message: "Error de validación",
        errors: errors
    });
}
  if (err?.message.includes('Los clientes no pueden ser profesionales')) {
    customLogger.warn(`409 Conflict - ${err.message}`, { stack: err.stack, route: req.path });
    return res.status(409).json({ message: err.message });
  }
  else if(similarErrorPattern.test(err?.message)){
    customLogger.warn(`409 Conflict - ${err.message}`, { stack: err.stack, route: req.path });
    return res.status(409).json({message: 'El recurso ya ha sido creado previamente' });
  } else if(err?.message.includes('The professional does not work in that time slot')){
    customLogger.warn(`409 Conflict - ${err.message}`, { stack: err.stack, route: req.path });
    return res.status(409).json({ message: err.message });
  } else if(err?.message.includes('The professional is not available at the moment')){
    customLogger.warn(`409 Conflict - ${err.message}`, { stack: err.stack, route: req.path });
    return res.status(409).json({ message: err.message });
  }
  else if (err?.message.includes('El paciente ya tiene un turno asignado para esta fecha.')) {
    customLogger.warn(`409 Conflict - ${err.message}`, { stack: err.stack, route: req.path });
    return res.status(409).json({ message: err.message });
  } else if (err?.message.includes('No se han configurado los horarios de este profesional')) {
    customLogger.warn(`404 not found - ${err.message}`, { stack: err.stack, route: req.path });
    return res.status(404).json({ message: err.message });
  }
  else if (err?.message.includes('not found')) {
    customLogger.warn(`404 Error - ${err.message}`, { stack: err.stack, route: req.path });
    return res.status(404).json({ message: err.message });
  } else if (err?.name.includes('ZodError')) {
    customLogger.warn(`400 Validation Error - ${err.message}`, { issues: err.issues, stack: err.stack, route: req.path });
    return res.status(400).json({ message: "Validation error", details: err.issues });
  } else if (err?.message.includes('invalid password.')) {
    customLogger.warn(`401 Login Error - Invalid Password`, { stack: err.stack, route: req.path });
    return res.status(401).send({ message: 'Login failed, invalid password.' });
  } else if (err?.message.includes('Email and Password invalid format.')) {
    customLogger.warn(`401 Validation Error - Invalid Email/Password Format`, { stack: err.stack, route: req.path });
    return res.status(401).send({ message: 'Email and Password invalid format.' });
  } else if (err?.message.includes('dont exist')) {
    customLogger.warn(`404 User Not Found - ${err.message}`, { stack: err.stack, route: req.path });
    return res.status(404).send({ message: "User don't exist." });
  }
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue)[0];  // Detecta el campo duplicado, en este caso 'email'
    const duplicatedValue = err.keyValue[duplicatedField];
    const message = `El ${duplicatedField} '${duplicatedValue}' ya está en uso.`;
    
    customLogger.warn(`409 Conflict - ${message}`, { stack: err.stack, route: req.path });
    return res.status(409).json({ message });
  }

  
  customLogger.error(`500 Server Error - ${err.message}`, { stack: err.stack, route: req.path });
  
  return res.status(500).json({ message: 'Ocurrió un error', Error:'Error' });
};

export default errorHandler;
