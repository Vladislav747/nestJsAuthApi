import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User } from "../users/users.model";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  /**
   * Залогиниться
   * @param userDto
   * @returns
   */
  async login(userDto: CreateUserDto) {
    const user = await this.validateUser(userDto);
    return this.generateToken(user);
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException(
        "Пользователь с таким email существует",
        HttpStatus.BAD_REQUEST
      );
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    const user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });
    return this.generateToken(user);
  }

  /**
   * Сгенерить JWT токен
   * @param user
   * @returns
   */
  private async generateToken(user: User) {
    const payload = { email: user.email, id: user.id, roles: user.roles };
    //Подписать payload данные внутри
    return {
      token: this.jwtService.sign(payload),
    };
  }

  /**
   * Валидировать пользователя
   * @param userDto
   * @returns
   */
  private async validateUser(userDto: CreateUserDto) {
    //Проверяем что пользователь есть в бд
    const user = await this.userService.getUserByEmail(userDto.email);
    //Сопоставить хэш польщователя в бд и тот который мы получили от пользователя
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password
    );
    //Пользователь есть и все хорошо
    if (user && passwordEquals) {
      return user;
    }
    throw new UnauthorizedException({
      message: "Некорректный емайл или пароль",
    });
  }
}
