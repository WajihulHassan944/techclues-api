import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../../database/schemas/admin.schema';
import { ActivityService } from '../activity/activity.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly activity: ActivityService,
  ) {}

  async list() {
    return this.adminModel
      .find()
      .select('-passwordHash -refreshTokenHash -twoFactorSecret -twoFactorRecoveryCodes')
      .sort({ createdAt: 1 })
      .lean();
  }

  async create(input: CreateUserDto, invitedBy: string) {
    const existing = await this.adminModel.findOne({ email: input.email.toLowerCase() });
    if (existing) throw new ConflictException('A user with that email already exists');
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.adminModel.create({
      email: input.email.toLowerCase(),
      name: input.name,
      role: input.role,
      passwordHash,
      invitedBy,
    });
    await this.activity.log('users', `Added ${input.name} (${input.email}) as ${input.role.replace('_', ' ')}`);
    const { passwordHash: _omit, ...safe } = user.toObject();
    return safe;
  }

  async update(id: string, patch: UpdateUserDto, actingAdminId: string) {
    const user = await this.adminModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (String(user._id) === actingAdminId && (patch.blocked || (patch.role && patch.role !== 'super_admin'))) {
      throw new BadRequestException('You cannot block or demote your own account');
    }
    if (patch.name !== undefined) user.name = patch.name;
    if (patch.role !== undefined) user.role = patch.role;
    if (patch.blocked !== undefined) {
      user.blocked = patch.blocked;
      if (patch.blocked) user.tokenVersion += 1; // sign out everywhere immediately
    }
    await user.save();
    await this.activity.log(
      'users',
      `Updated ${user.email}${patch.blocked !== undefined ? (patch.blocked ? ' — blocked' : ' — unblocked') : ''}${patch.role ? ` — role set to ${patch.role.replace('_', ' ')}` : ''}`,
    );
    const { passwordHash: _omit, ...safe } = user.toObject();
    return safe;
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await this.adminModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.tokenVersion += 1;
    await user.save();
    await this.activity.log('users', `Reset the password for ${user.email}`);
    return { ok: true };
  }

  async remove(id: string, actingAdminId: string) {
    if (id === actingAdminId) throw new BadRequestException('You cannot delete your own account');
    const user = await this.adminModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'super_admin') {
      const otherSuperAdmins = await this.adminModel.countDocuments({ role: 'super_admin', _id: { $ne: id } });
      if (otherSuperAdmins === 0) throw new ForbiddenException('At least one super admin must remain');
    }
    await user.deleteOne();
    await this.activity.log('users', `Removed ${user.email}`);
    return { ok: true };
  }
}
