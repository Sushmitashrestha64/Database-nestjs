import { Role } from '../common/enum/roles.enum';
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fname: string;

    @Column()
    lname: string;

    @Column({ unique: true })
    email: string;

    @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
    })
    role: Role; 

    @Column({select: false})
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
export default User;
