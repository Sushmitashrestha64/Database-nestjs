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
        const { fname, lname,email, password} = createUserDto;
        const hash = await bcrypt.hash(password, 10);
        const user = this.repo.create({fname, lname, email, password: hash});
        return this.repo.save(user);
    }

    findAll() { 
    return this.repo.find();
  }

   async findById(id: string) {
    const user = await this.repo.findOne({where:{id}});
    console.log(user)
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
  }

   findByEmail(email:string){
    return this.repo.findOne({where:{email}});
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
