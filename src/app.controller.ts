import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from './auth/auth.types';

@ApiTags('App')
@ApiBearerAuth()
@Controller()
export class AppController {
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  profile(@Req() req: AuthenticatedRequest) {
    return { sub: req.user?.sub, aud: req.user?.aud, iss: req.user?.iss };
  }
}
