import { Body, Controller, Delete, Get, Param, Patch, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { User } from 'src/common/decorators/user.decorators';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Role } from 'src/common/enum/roles.enum';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Auth(Role.ADMIN)
    @Get()
    getAllUsers() {
        return this.userService.findAll();
    }

    @Auth(Role.USER, Role.ADMIN)
    @Get('profile')
    getMe(@User() user) {
        return user;
    }

    @Auth()
    @Get(':id')
    getUserById(@Param('id') id: string) {
        console.log('test')
        return this.userService.findById(id);
    }

    @Auth(Role.USER)
    @Patch(':id/password')
    updatePassword(
        @Param('id') id: string,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ) {
        return this.userService.updatePassword(id, updatePasswordDto);
    }

    @Auth(Role.ADMIN)
    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.userService.delete(id);
    }
}