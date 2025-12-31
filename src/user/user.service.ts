import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
@Injectable()
export class UserService {
    
    constructor(
    @InjectRepository(User)
    private repo: Repository<User>,) {} 

    async create(createUserDto: CreateUserDto){
        const { fname, lname, email, password, role } = createUserDto;
        const hash = await bcrypt.hash(password, 10);
        const user = this.repo.create({fname, lname, email, password: hash, role});
        return this.repo.save(user);
    }

    findAll() { 
    return this.repo.find();
  }

   async findById(id: string) {
    console.log('Finding user by ID:', id);
    const user = await this.repo.findOne({
      where: { id },
      select: ['id', 'fname', 'lname', 'email', 'role', 'isActive', 'createdAt']
    });
    console.log('User found:', user);
  
    if (!user) {
      console.log('User not found in database for ID:', id);
      return null; // Return null instead of throwing, let JWT strategy handle it
    }
    
    if (!user.isActive) {
      console.log('User is inactive:', id);
      return null; // Return null for inactive users
    }
    
    return user;
  }
  
 async findMe(userId: string) {
  const user = await this.repo.findOne({
    where: { id: userId },
    select: ['id', 'fname', 'lname', 'email', 'role', 'isActive', 'createdAt'],
  });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}

   findByEmail(email:string){
    return this.repo.findOne({where:{email}, select: ['id','email','password','isActive']});
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException('User not found');
    }
    return{message: 'User deleted successfully' };
  }
  
  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto
  ) {
    const { currentPassword, newPassword } = updatePasswordDto;
    const user = await this.repo.findOne({ where: { id }, select: ['id','password'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
        currentPassword, 
        user.password 
      );
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await this.repo.save(user);
    return { message: 'Password updated successfully' };
 }
  
 async validatePassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user || !user.isActive) return false;
    return bcrypt.compare(password, user.password);
 } 
}
