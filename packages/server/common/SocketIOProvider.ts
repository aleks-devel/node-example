import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, Socket } from "socket.io";
import { parse } from "cookie";
import * as passport from "passport";

export class SocketIOProvider extends IoAdapter {
  public createIOServer(port: number, options?: any): any {
    const server: Server = super.createIOServer(port, {
      ...options,
      serveClient: false,
      cors: {
        origin: "*", // TODO: REMOVE
      },
    });

    server.of("admin").use(this.wrapMiddleware(passport.initialize()));
    server.of("admin").use((socket: Socket, next: any) => {
      const { request, response } = this.transformRequest(socket);

      // passport.authenticate(
      //   nda,
      //   (err: Error | undefined, user: any, info: any, status: any) => {
      //     if (!err && user) {
      //       socket.handshake.auth.user = user;
      //       next();
      //     } else {
      //       next(err);
      //     }
      //   },
      // )(request, response);
    });

    return server;
  }

  transformRequest(socket: Socket) {
    return {
      response: {
        end: () => void 0,
      },
      request: {
        ...socket.request,
        headers: {},
        cookies: parse(socket.request.headers.cookie || ""),
      },
    };
  }

  wrapMiddleware(middleware: any) {
    return (socket: Socket, next: any) => {
      const { request, response } = this.transformRequest(socket);
      return middleware(request, response, next);
    };
  }
}
