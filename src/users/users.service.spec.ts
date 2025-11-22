import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../db/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: '123456',
        username: 'testuser',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      const savedUser = {
        id: 'uuid-123',
        ...createUserDto,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.createUser(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(createUserDto.email);
    });

    it('should throw error if username already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: '123456',
        username: 'existinguser',
      };

      mockUserRepository.findOne.mockResolvedValueOnce({
        id: '1',
        username: 'existinguser',
      });

      await expect(service.createUser(createUserDto)).rejects.toThrow();
    });

    it('should throw error if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: '123456',
        username: 'newuser',
      };

      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: '1', email: 'existing@example.com' });

      await expect(service.createUser(createUserDto)).rejects.toThrow('Email já está sendo usado.');
    });
  });

  describe('findUserByUsername', () => {
    it('should find a user by username', async () => {
      const username = 'testuser';
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username,
        password: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserByUsername(username);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findUserByUsername('notfound');

      expect(result).toBeNull();
    });
  });

  describe('getUserInfo', () => {
    it('should find a user by id', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserInfo('uuid-123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserInfo('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const userId = 'uuid-123';
      const existingUser = {
        id: userId,
        email: 'old@example.com',
        username: 'olduser',
      };
      const updateData = {
        email: 'new@example.com',
      };
      const updatedUser = { ...existingUser, ...updateData };

      mockUserRepository.findOneBy = jest.fn().mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateData);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result.email).toBe(updateData.email);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateUser('nonexistent-id', { email: 'new@example.com' })
      ).rejects.toThrow('User not found');
    });
  });
});
