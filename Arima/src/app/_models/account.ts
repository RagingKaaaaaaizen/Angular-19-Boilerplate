import { Role } from './role';

export class Account {
    id: number = 0;
    title: string = '';
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    role: Role = Role.User;
    jwtToken?: string;
    password?: string;
    isVerified: boolean = false;
    verificationToken?: string;
    resetToken?: string;
    resetTokenExpires?: string;
    refreshTokens: string[] = [];
    dateCreated?: string;
}