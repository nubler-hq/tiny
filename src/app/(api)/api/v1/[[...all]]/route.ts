import { AppRouter } from "@/igniter.router";
import { nextRouteHandlerAdapter } from "@igniter-js/core/adapters";

export const { GET, POST, PUT, PATCH, DELETE } =
  nextRouteHandlerAdapter(AppRouter);
