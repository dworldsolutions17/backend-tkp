import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthResponse = {
    message: 'Login successful',
    access_token: 'jwt.token.here',
    customer: {
      id: 1,
      name: 'Admin',
      email: 'admin@kidzplanet.pk',
      role: 'admin',
    },
  };

  const mockRegisterResponse = {
    message: 'Registration successful',
    id: 2,
    name: 'New User',
    email: 'new@test.com',
    role: 'customer',
  };

  const mockService = {
    login: jest.fn().mockResolvedValue(mockAuthResponse),
    register: jest.fn().mockResolvedValue(mockRegisterResponse),
    changePassword: jest.fn().mockResolvedValue({ success: true, message: 'Password changed' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should authenticate a user and return JWT', async () => {
      const dto = { email: 'admin@kidzplanet.pk', password: 'password123', portal: 'admin' };
      const result = await controller.login(dto as any);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('customer');
      expect(result.message).toBe('Login successful');
      expect(service.login).toHaveBeenCalledWith(dto.email, dto.password, dto.portal);
    });

    it('should default portal to customer when not provided', async () => {
      const dto = { email: 'customer@test.com', password: 'pass123' };
      await controller.login(dto as any);
      expect(service.login).toHaveBeenCalledWith('customer@test.com', 'pass123', 'customer');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { name: 'New User', email: 'new@test.com', phone: '03001234567', password: 'pass123' };
      const result = await controller.register(dto as any);
      expect(result.message).toBe('Registration successful');
      expect(result.email).toBe('new@test.com');
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });
});
