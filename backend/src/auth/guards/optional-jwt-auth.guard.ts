import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Optional JWT guard: runs JWT strategy when Authorization header is present.
 * If token is valid, req.user is set; if missing or invalid, request is still allowed (req.user undefined).
 * Use this for routes that support both guest and authenticated users (e.g. POST /orders for guest checkout).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = await super.canActivate(context);
      return !!result;
    } catch {
      // No token or invalid token - allow request; controller will get req.user === undefined
      return true;
    }
  }
}
