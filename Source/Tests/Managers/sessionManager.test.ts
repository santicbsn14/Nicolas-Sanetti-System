// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import SessionManager from 'Source/Domain/Manager/sessionManager';
// import container from '../../container';
// import * as firebaseAdmin from 'firebase-admin';

// // Mock más detallado de Firebase Admin
// vi.mock('firebase-admin', () => {
//   const mockCreateUser = vi.fn();
  
//   return {
//     auth: vi.fn(() => ({
//       createUser: mockCreateUser
//     })),
//     __mockCreateUser: mockCreateUser  // Exportamos el mock para poder manipularlo en los tests
//   };
// });

// describe('SessionManager', () => {
//   let sessionManager: SessionManager;
//   let mockUserRepository: any;

//   beforeEach(() => {
//     // Limpiar todos los mocks
//     vi.clearAllMocks();

//     // Configuración de mocks antes de cada test
//     mockUserRepository = {
//       getUserByEmail: vi.fn(),
//       createUser: vi.fn()
//     };

//     // Instanciar el SessionManager
//     sessionManager = new SessionManager();

//     // Mockear container.resolve
//     vi.spyOn(container, 'resolve').mockReturnValue(mockUserRepository);
//   });

//   describe('signup', () => {
//     it('should create user in Firebase and database', async () => {
//       // Configurar el mock de createUser para devolver un objeto con uid
//       const mockFirebaseUser = { uid: 'firebase-test-uid' };
      
//       // Usamos el mock de firebase-admin que exportamos
//       const createUserMock = firebaseAdmin.auth().createUser as ReturnType<typeof vi.fn>;
//       createUserMock.mockResolvedValue(mockFirebaseUser);

//       const userInput = {
//         email: 'test@example.com',
//         password: 'password123',
//         name: 'Test User'
//       };

//       // Simular la llamada a signup
//       const result = await sessionManager.signup(userInput);

//       // Verificar que createUser fue llamado correctamente
//       expect(createUserMock).toHaveBeenCalledWith({
//         email: userInput.email,
//         password: userInput.password,
//         emailVerified: false,
//         disabled: false
//       });

//       // Verificar que se llamó a createUser en el repositorio
//       expect(mockUserRepository.createUser).toHaveBeenCalledWith(
//         expect.objectContaining({
//           email: userInput.email,
//           fuid: 'firebase-test-uid'
//         })
//       );
//     });

//     it('should handle Firebase user creation failure', async () => {
//       // Configurar el mock para rechazar la promesa
//       const createUserMock = firebaseAdmin.auth().createUser as ReturnType<typeof vi.fn>;
//       createUserMock.mockRejectedValue(new Error('Firebase creation error'));

//       const userInput = {
//         email: 'test@example.com',
//         password: 'password123',
//         name: 'Test User'
//       };

//       // Verificar que se lanza un error
//       await expect(sessionManager.signup(userInput)).rejects.toThrow('Firebase creation error');
//     });
//   });
// });