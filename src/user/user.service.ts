import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from './user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
@Injectable()
export class UserService {
    
    constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    ) {} 

    async create(createUserDto: CreateUserDto){
        const { fname, lname, email, password, role } = createUserDto;
        const hash = await bcrypt.hash(password, 10);
        const user = this.repo.create({fname, lname, email, password: hash, role});
        return this.repo.save(user);
    }

    async findAll() {
    const cached = await this.cache.get('users:all');
    if (cached) {
      console.log('CACHE HIT: Returning cached users list');
      return cached;
    }

    console.log(' CACHE MISS: Fetching users from database');
    const users = await this.repo.find();
    await this.cache.set('users:all', users, 120000);
    console.log(' CACHED: Users list stored in cache for 2 minutes');

    return users;
  }

   async findById(id: string) {
    const cacheKey = `user:${id}`;
    const cached = await this.cache.get<User>(cacheKey);
    if (cached) {
      console.log(` CACHE HIT: Returning cached user for ID: ${id}`);
      return cached;
    }

    console.log(`CACHE MISS: Finding user by ID from database: ${id}`);
    const user = await this.repo.findOne({
      where: { id },
      select: ['id', 'fname', 'lname', 'email', 'role', 'isActive', 'createdAt']
    });
    console.log('User found:', user);
  
    if (!user) {
      console.log('User not found in database for ID:', id);
      return null; 
    }
    
    if (!user.isActive) {
      console.log('User is inactive:', id);
      return null;
    }
    
    await this.cache.set(cacheKey, user, 60000);
    console.log(`CACHED: User ${id} stored in cache for 1 minute`);
    return user;
  }
  
 async findMe(userId: string) {
  const user = await this.repo.findOne({
    where: { id: userId },
    select: ['id', 'fname', 'lname', 'email', 'role', 'isActive', 'createdAt', 'profilePhoto', 'storageType'],
  });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}

   findByEmail(email:string){
    return this.repo.findOne({where:{email}, select: ['id','email','password','isActive','profilePhoto','storageType']});
  }

  async delete(id: string) {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException('User not found');
    }
    
    await this.cache.del(`user:${id}`);
    await this.cache.del('users:all');
    
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
    await this.cache.del(`user:${id}`);
    await this.cache.del('users:all');
    return { message: 'Password updated successfully' };
 }
  
 async validatePassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user || !user.isActive) return false;
    return bcrypt.compare(password, user.password);
 } 

 async updateProfile(userId: string, filePath: string, type: 'local' | 'cloud'){
    const user = await this.repo.findOne({where: {id: userId}});
    if(!user){
        throw new NotFoundException('User not found');
    }
    user.profilePhoto = filePath;
    user.storageType = type;
    await this.repo.save(user);
    
    await this.cache.del(`user:${userId}`);
    await this.cache.del('users:all');
    
    return user;
 }
}
