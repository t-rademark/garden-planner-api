import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const domain = config.get<string>('AUTH0_DOMAIN');
    const audience = config.get<string>('AUTH0_AUDIENCE');
    const issuer = config.get<string>('AUTH0_ISSUER');

    if (!domain || !audience || !issuer) {
      // Helpful early failure instead of silent “401 forever”
      throw new Error(
        'Missing AUTH0_DOMAIN, AUTH0_AUDIENCE, or AUTH0_ISSUER in environment variables',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
    });
  }

  // Whatever you return becomes req.user
  validate(payload: any) {
    return payload;
  }
}