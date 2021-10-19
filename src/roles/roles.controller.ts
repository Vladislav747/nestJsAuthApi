import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";

@Controller("roles")
export class RolesController {
  constructor(private roleService: RolesService) {}

  @Post()
  /**
   * Роут создания роли /roles {POST}
   */
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  /**
   * Роут создания роли /roles/:value {GET}
   */
  @Get("/:value")
  getByValue(@Param("value") value: string) {
    return this.roleService.getRoleByValue(value);
  }
}
