import { z } from "zod";

// Esquema de validación para Service
const createServiceValidation = z.object({
  name: z.string({
    required_error: "El nombre es obligatorio",
  }).min(1, "El nombre no puede estar vacío"),
  
  price: z.number({
    required_error: "El precio es obligatorio",
  }).positive("El precio debe ser un número positivo"),
  
  enabled: z.boolean({
    required_error: "El estado habilitado es obligatorio",
  }),
  
  duration: z.number({
    required_error: "La duración es obligatoria",
  }).int("La duración debe ser un número entero").positive("La duración debe ser positiva"),
  
  description: z.string({
    required_error: "La descripción es obligatoria",
  }).min(1, "La descripción no puede estar vacía"),
  
  images_galery: z.array(z.string()).optional(), // Puede ser un arreglo de strings o no estar presente
  
  discount: z.number().min(0, "El descuento no puede ser negativo").max(100, "El descuento no puede superar el 100%").optional(),
  
  limit: z.number().int("El límite debe ser un número entero").positive("El límite debe ser positivo").optional(),
  
  deadline_time: z.string().datetime("La fecha límite debe tener un formato ISO8601").optional(),
});

export default createServiceValidation;
