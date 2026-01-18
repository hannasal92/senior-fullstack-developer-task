import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// @Entity('users')
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ unique: true })
//   username: string;

//   @Column({ default: 'User' }) // ❌ Single role only
//   role: string;

//   @Column()
//   status: boolean;
// }

export enum UserStatus {
  ENABLED = 'Enabled',
  DISABLED = 'Disabled',
  DELETED = 'Deleted',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({
    type: 'json',
    default: () => '\'["User"]\'',
  })
  roles: string[];

  @Column({
    type: 'text',
    enum: UserStatus,
    default: UserStatus.ENABLED,
  })
  status: UserStatus;
}
