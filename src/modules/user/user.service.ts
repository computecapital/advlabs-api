import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/services';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: CreateUserDto): Promise<User> {
    const emailAlreadyExists = await this.prisma.user.findUnique({ where: { email: user.email } });

    if (emailAlreadyExists) throw new BadRequestException('Duplicate user');

    const createdUser = await this.prisma.user.create({ data: user });

    return new User(createdUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) => new User(user));
  }

  async findByEmail(email: string): Promise<User> {
    const foundUser = await this.prisma.user.findUnique({ where: { email } });

    if (!foundUser) throw new NotFoundException(`User with email '${email}' not found`);

    return new User(foundUser);
  }

  async findOne(id: string): Promise<User> {
    const foundUser = await this.prisma.user.findUnique({ where: { id } });

    if (!foundUser) throw new NotFoundException(`User with id '${id}' not found`);

    return new User(foundUser);
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const foundUser = await this.prisma.user.findUnique({ where: { id } });

    if (!foundUser) throw new NotFoundException(`User with id '${id}' not found`);

    const updatedUser = await this.prisma.user.update({ where: { id }, data });

    return new User(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException(`User with id '${id}' not found`);

    await this.prisma.user.delete({ where: { id } });
  }
}
