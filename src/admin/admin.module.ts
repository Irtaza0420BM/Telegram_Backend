import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './admin.entity';
import { User, UserSchema } from 'src/auth/entites/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  exports: [MongooseModule], 
})
export class AdminModule {}