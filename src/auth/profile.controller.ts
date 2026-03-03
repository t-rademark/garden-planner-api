import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from './user.decorator';

@Controller()
export class ProfileController {
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  profile(@UserId() userId: string) {
    return { userId  };
  }
}