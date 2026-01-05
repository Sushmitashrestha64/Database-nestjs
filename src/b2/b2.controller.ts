import { Controller, Post, UseInterceptors, UploadedFile, NotFoundException, Get } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { b2Service } from './b2.service';
import { User } from 'src/common/decorators/user.decorators';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { Auth } from 'src/common/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from 'src/common/enum/roles.enum';


@Controller('user/storage')
export class b2Controller {
    constructor(
    private readonly b2Service: b2Service,
    private userService: UserService,
    private configService: ConfigService,
    ) {}

    @Auth(Role.USER, Role.ADMIN)
    @Post('upload-cloud')
    @UseInterceptors(FileInterceptor('file', {storage: memoryStorage()}))
    async uploadCloud(@User('id') userId: string, @UploadedFile() file: Express.Multer.File) {
        const cloudFile = await this.b2Service.uploadtocloud(file);
        await this.userService.updateProfile(userId, cloudFile.fileName,'cloud');

        return {
            message: 'Profile photo uploaded successfully to cloud storage',
            fileName: cloudFile.fileName,
        };
    }
    
    @Auth(Role.USER, Role.ADMIN)
    @Get('profile-link')
    async getLink(@User('id') userId: string) {
        const user= await this.userService.findMe(userId);
        if(!user || !user.profilePhoto){
            throw new NotFoundException('Profile photo not found');
        }
        if(user.storageType === 'local'){
            const localBaseUrl = this.configService.get('APP_URL');
            const cleanPath = user.profilePhoto.replace(/\\/g, '/');
            return {
                url: `${localBaseUrl}/${cleanPath}`, source: 'Local Disk'
            };
        }
        if (user.storageType === 'cloud'){
            const cloudUrl = await this.b2Service.getCloudlink(user.profilePhoto);
            return {
                url: cloudUrl, source: 'Backblaze B2 Cloud'
            };
        }
    }
}
