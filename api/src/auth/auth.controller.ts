import { Public } from '../decorators/public.decorator';
import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { AtStrategy, RtStrategy } from './strategy';
import { GetCurrentUser, GetCurrentUserId } from '../decorators';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Public()
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signupLocal(@Body() dto: AuthDto): Promise<{ tokens: Tokens, user: any }>{
        return this.authService.signupLocal(dto);
    }

    @Public()
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signinLocal(@Body() dto: AuthDto): Promise<{ tokens: Tokens, user: any }>{
        return this.authService.signinLocal(dto);
    }

    // Backward-compatible alias: POST /auth/login
    @Public()
    @Post('auth/login')
    @HttpCode(HttpStatus.OK)
    async legacyLogin(@Body() dto: AuthDto): Promise<any> {
        const { tokens, user } = await this.authService.signinLocal(dto);
        return { access_token: tokens.accessToken, user };
    }

    @UseGuards(AtStrategy)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@GetCurrentUserId() userId: string){
     return this.authService.logout(Number(userId));
    }  

    @Public()
    @UseGuards(RtStrategy)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@GetCurrentUserId() userId: string){
        return this.authService.refreshTokens(Number(userId));
    }
}
